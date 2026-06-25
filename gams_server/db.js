const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { mysqlConfig } = require('./config');
const { buildSampleData, sampleCustomerUsernames } = require('./sampleData');

const SALT_ROUNDS = 10;
const ADMIN_USER = 'Naveen Bishnoi';
const DEFAULT_ADMIN_PASS = 'Bhambu2006';
const DEFAULT_RECOVERY = 'BGS2006';
const DEFAULT_CUST_USER = 'customer';
const DEFAULT_CUST_PASS = 'Bhambu2006';
const SCHEMA_PATH = path.join(__dirname, 'sql', 'schema.sql');

function defaultData() {
  return {
    customers: [{
      id: 1,
      name: 'Demo Customer',
      phone: '9876543210',
      address: 'Near Bishnoi Gas Services, Main Road',
      active: true,
      username: DEFAULT_CUST_USER,
    }],
    cylinders: [
      { id: 1, type: 5, filled: 50, empty: 10, price: 450 },
      { id: 2, type: 14, filled: 80, empty: 20, price: 950 },
      { id: 3, type: 19, filled: 60, empty: 15, price: 1150 },
    ],
    bookings: [],
    bills: [],
    complaints: [],
    payments: [],
    settings: { adminRecoveryCode: DEFAULT_RECOVERY },
    nextIds: { customer: 2, booking: 1, bill: 1, complaint: 1, payment: 1 },
  };
}

function stripPasswords(data) {
  const copy = JSON.parse(JSON.stringify(data));
  if (copy.customers) {
    copy.customers = copy.customers.map(c => {
      const { password, ...rest } = c;
      return rest;
    });
  }
  return copy;
}

async function runSchema(pool) {
  const sql = fs.readFileSync(SCHEMA_PATH, 'utf8');
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));
  const conn = await pool.getConnection();
  try {
    for (const stmt of statements) {
      if (stmt.toUpperCase().startsWith('SET ')) {
        await conn.query(stmt);
      } else {
        await conn.query(stmt);
      }
    }
  } finally {
    conn.release();
  }
}

function hashPassword(pw) {
  return bcrypt.hashSync(pw, SALT_ROUNDS);
}

function verifyPassword(pw, hash) {
  return bcrypt.compareSync(pw, hash);
}

async function seedCustomerAuths(pool, data, password = DEFAULT_CUST_PASS) {
  const hash = hashPassword(password);
  const wanted = new Set(sampleCustomerUsernames());
  for (const c of data.customers || []) {
    if (!c.username || !wanted.has(c.username)) continue;
    await pool.query(`
      INSERT INTO customer_auth (username, customer_id, password_hash)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE customer_id = VALUES(customer_id), password_hash = VALUES(password_hash)
    `, [c.username, c.id, hash]);
  }
}

async function seedDefaults(pool) {
  const data = buildSampleData();
  await setData(pool, data);
  await pool.query(`
    INSERT INTO admin_auth (id, username, password_hash, recovery_hash)
    VALUES (1, ?, ?, ?)
    ON DUPLICATE KEY UPDATE username = VALUES(username)
  `, [
    ADMIN_USER,
    hashPassword(DEFAULT_ADMIN_PASS),
    hashPassword(DEFAULT_RECOVERY),
  ]);
  await seedCustomerAuths(pool, data);
}

async function initDb() {
  const pool = mysql.createPool(mysqlConfig);
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    throw new Error(
      `Cannot connect to MySQL (${mysqlConfig.database}@${mysqlConfig.host}). ` +
      `Start XAMPP MySQL and check gams_server/.env — ${err.message}`
    );
  }

  await runSchema(pool);

  const [[{ cnt }]] = await pool.query('SELECT COUNT(*) AS cnt FROM customers');
  if (Number(cnt) === 0) {
    await seedDefaults(pool);
  }

  return pool;
}

async function getData(pool) {
  const [customers] = await pool.query(
    'SELECT id, name, phone, address, active, username FROM customers ORDER BY id'
  );
  const [cylinders] = await pool.query(
    'SELECT id, type, filled, empty_qty AS `empty`, price FROM cylinders ORDER BY id'
  );
  const [bookings] = await pool.query(`
    SELECT id, customer_id AS customerId, type, quantity, booking_date AS bookingDate,
           status, tracking_status AS trackingStatus, source, payment_method AS paymentMethod,
           payment_status AS paymentStatus, transaction_id AS transactionId, amount
    FROM bookings ORDER BY id
  `);
  const [bills] = await pool.query(`
    SELECT id, booking_id AS bookingId, customer_id AS customerId, amount,
           bill_date AS billDate, paid, payment_method AS paymentMethod,
           payment_status AS paymentStatus, transaction_id AS transactionId,
           paid_date AS paidDate
    FROM bills ORDER BY id
  `);
  const [complaints] = await pool.query(`
    SELECT id, customer_id AS customerId, customer_name AS customerName, subject, message,
           complaint_date AS date, status
    FROM complaints ORDER BY id
  `);
  const [payments] = await pool.query(`
    SELECT id, customer_id AS customerId, amount, method, transaction_id AS transactionId,
           payment_date AS date, type, bill_id AS billId
    FROM payments ORDER BY id
  `);
  const [settingsRows] = await pool.query('SELECT setting_key, setting_value FROM app_settings');
  const [nextIdRows] = await pool.query('SELECT entity, next_id FROM next_ids');

  const settings = { adminRecoveryCode: DEFAULT_RECOVERY };
  settingsRows.forEach(r => {
    if (r.setting_key === 'adminRecoveryCode') settings.adminRecoveryCode = r.setting_value;
  });

  const nextIds = { customer: 2, booking: 1, bill: 1, complaint: 1, payment: 1 };
  nextIdRows.forEach(r => { nextIds[r.entity] = r.next_id; });

  return {
    customers: customers.map(c => ({ ...c, active: !!c.active })),
    cylinders: cylinders.map(c => ({ ...c, price: Number(c.price) })),
    bookings: bookings.map(b => ({
      ...b,
      amount: b.amount != null ? Number(b.amount) : b.amount,
    })),
    bills: bills.map(b => ({
      ...b,
      amount: Number(b.amount),
      paid: !!b.paid,
    })),
    complaints,
    payments: payments.map(p => ({ ...p, amount: Number(p.amount) })),
    settings,
    nextIds,
  };
}

async function setData(pool, data) {
  const clean = stripPasswords(data);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('DELETE FROM payments');
    await conn.query('DELETE FROM complaints');
    await conn.query('DELETE FROM bills');
    await conn.query('DELETE FROM bookings');
    await conn.query('DELETE FROM customers');
    await conn.query('DELETE FROM cylinders');
    await conn.query('DELETE FROM next_ids');
    await conn.query('DELETE FROM app_settings');

    for (const c of clean.customers || []) {
      await conn.query(
        `INSERT INTO customers (id, name, phone, address, active, username) VALUES (?, ?, ?, ?, ?, ?)`,
        [c.id, c.name, c.phone || null, c.address || null, c.active !== false ? 1 : 0, c.username || null]
      );
    }
    for (const c of clean.cylinders || []) {
      await conn.query(
        `INSERT INTO cylinders (id, type, filled, empty_qty, price) VALUES (?, ?, ?, ?, ?)`,
        [c.id, c.type, c.filled ?? 0, c.empty ?? 0, c.price ?? 0]
      );
    }
    for (const b of clean.bookings || []) {
      await conn.query(
        `INSERT INTO bookings (id, customer_id, type, quantity, booking_date, status, tracking_status,
          source, payment_method, payment_status, transaction_id, amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          b.id, b.customerId, b.type, b.quantity, b.bookingDate || null, b.status ?? 0,
          b.trackingStatus || null, b.source || null, b.paymentMethod || null,
          b.paymentStatus || null, b.transactionId || null, b.amount ?? null,
        ]
      );
    }
    for (const b of clean.bills || []) {
      await conn.query(
        `INSERT INTO bills (id, booking_id, customer_id, amount, bill_date, paid, payment_method,
          payment_status, transaction_id, paid_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          b.id, b.bookingId ?? null, b.customerId, b.amount ?? 0, b.billDate || null,
          b.paid ? 1 : 0, b.paymentMethod || null, b.paymentStatus || null,
          b.transactionId || null, b.paidDate || null,
        ]
      );
    }
    for (const c of clean.complaints || []) {
      await conn.query(
        `INSERT INTO complaints (id, customer_id, customer_name, subject, message, complaint_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          c.id, c.customerId, c.customerName || null, c.subject || null, c.message || null,
          c.date || null, c.status || 'pending',
        ]
      );
    }
    for (const p of clean.payments || []) {
      await conn.query(
        `INSERT INTO payments (id, customer_id, amount, method, transaction_id, payment_date, type, bill_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id, p.customerId ?? null, p.amount ?? 0, p.method || null, p.transactionId || null,
          p.date || null, p.type || null, p.billId ?? null,
        ]
      );
    }
    const nextIds = clean.nextIds || defaultData().nextIds;
    for (const [entity, nextId] of Object.entries(nextIds)) {
      await conn.query('INSERT INTO next_ids (entity, next_id) VALUES (?, ?)', [entity, nextId]);
    }
    const recovery = clean.settings?.adminRecoveryCode ?? DEFAULT_RECOVERY;
    await conn.query(
      'INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)',
      ['adminRecoveryCode', recovery]
    );

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    await conn.commit();
    return clean;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getAdminAuth(pool) {
  const [rows] = await pool.query('SELECT * FROM admin_auth WHERE id = 1');
  return rows[0] || null;
}

async function setAdminPassword(pool, newPassword) {
  const hash = hashPassword(newPassword);
  await pool.query('UPDATE admin_auth SET password_hash = ? WHERE id = 1', [hash]);
}

async function verifyAdminLogin(pool, username, password) {
  const auth = await getAdminAuth(pool);
  if (!auth || !username) return false;
  if (username.trim().toLowerCase() !== auth.username.trim().toLowerCase()) return false;
  return verifyPassword(password, auth.password_hash);
}

async function verifyAdminRecovery(pool, username, recoveryCode) {
  const auth = await getAdminAuth(pool);
  if (!auth || username !== auth.username) return false;
  return verifyPassword(recoveryCode, auth.recovery_hash);
}

async function resetAdminPassword(pool, username, recoveryCode, newPassword) {
  if (!(await verifyAdminRecovery(pool, username, recoveryCode))) return false;
  await setAdminPassword(pool, newPassword);
  return true;
}

async function changeAdminPassword(pool, current, newPassword) {
  const auth = await getAdminAuth(pool);
  if (!auth || !verifyPassword(current, auth.password_hash)) return false;
  await setAdminPassword(pool, newPassword);
  return true;
}

async function getCustomerAuth(pool, username) {
  const [rows] = await pool.query(
    'SELECT * FROM customer_auth WHERE LOWER(username) = LOWER(?)',
    [username]
  );
  return rows[0] || null;
}

async function setCustomerPassword(pool, username, newPassword) {
  const hash = hashPassword(newPassword);
  await pool.query(
    'UPDATE customer_auth SET password_hash = ? WHERE LOWER(username) = LOWER(?)',
    [hash, username]
  );
}

async function verifyCustomerLogin(pool, username, password) {
  const auth = await getCustomerAuth(pool, username);
  if (!auth) return null;
  if (!verifyPassword(password, auth.password_hash)) return null;
  const data = await getData(pool);
  const customer = data.customers.find(c => c.id === auth.customer_id && c.active !== false);
  return customer || null;
}

async function registerCustomerAuth(pool, username, customerId, password) {
  const hash = hashPassword(password);
  await pool.query(
    'INSERT INTO customer_auth (username, customer_id, password_hash) VALUES (?, ?, ?)',
    [username, customerId, hash]
  );
}

async function resetCustomerPassword(pool, username, phone, newPassword) {
  const data = await getData(pool);
  const customer = data.customers.find(
    c => c.username && c.username.toLowerCase() === username.toLowerCase() && c.active !== false
  );
  if (!customer || customer.phone !== phone) return false;
  if (!(await getCustomerAuth(pool, username))) {
    await registerCustomerAuth(pool, username, customer.id, newPassword);
    return true;
  }
  await setCustomerPassword(pool, username, newPassword);
  return true;
}

async function importFullState(pool, data, auth = {}) {
  await setData(pool, data);
  if (auth.admin) {
    await pool.query(`
      INSERT INTO admin_auth (id, username, password_hash, recovery_hash)
      VALUES (1, ?, ?, ?)
      ON DUPLICATE KEY UPDATE username = VALUES(username), password_hash = VALUES(password_hash),
        recovery_hash = VALUES(recovery_hash)
    `, [auth.admin.username, auth.admin.password_hash, auth.admin.recovery_hash]);
  }
  if (auth.customers?.length) {
    await pool.query('DELETE FROM customer_auth');
    for (const row of auth.customers) {
      await pool.query(
        'INSERT INTO customer_auth (username, customer_id, password_hash) VALUES (?, ?, ?)',
        [row.username, row.customer_id, row.password_hash]
      );
    }
  }
}

async function closeDb(pool) {
  await pool.end();
}

module.exports = {
  mysqlConfig,
  ADMIN_USER,
  DEFAULT_RECOVERY,
  defaultData,
  buildSampleData,
  seedCustomerAuths,
  initDb,
  getData,
  setData,
  stripPasswords,
  hashPassword,
  verifyAdminLogin,
  resetAdminPassword,
  changeAdminPassword,
  verifyCustomerLogin,
  registerCustomerAuth,
  resetCustomerPassword,
  getCustomerAuth,
  getAdminAuth,
  importFullState,
  closeDb,
};
