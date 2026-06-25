#!/usr/bin/env node
/**
 * Migrate data from SQLite, C .dat files, or browser localStorage export into MySQL.
 *
 * Usage:
 *   node scripts/migrate-to-mysql.js
 *   node scripts/migrate-to-mysql.js --force   (overwrite existing MySQL data)
 *
 * localStorage export: save JSON from browser console to gams_export.json in project root:
 *   copy(localStorage.getItem('gams_data_v3'))
 */
const fs = require('fs');
const path = require('path');
const {
  initDb,
  importFullState,
  defaultData,
  buildSampleData,
  hashPassword,
  closeDb,
  ADMIN_USER,
  DEFAULT_CUST_USER,
} = require('../db');

const ROOT = path.join(__dirname, '..', '..');
const SQLITE_PATH = path.join(__dirname, '..', 'data', 'gams.db');
const EXPORT_JSON = path.join(ROOT, 'gams_export.json');
const C_DATA_DIR = path.join(ROOT, 'data');
const force = process.argv.includes('--force');

function readCString(buf, offset, maxLen) {
  const end = buf.indexOf(0, offset);
  const sliceEnd = end >= 0 ? end : offset + maxLen;
  return buf.toString('utf8', offset, sliceEnd).trim();
}

function readCDataFiles() {
  const customersFile = path.join(C_DATA_DIR, 'customers.dat');
  if (!fs.existsSync(customersFile)) return null;

  const customers = [];
  const buf = fs.readFileSync(customersFile);
  const CUSTOMER_SIZE = 173;
  for (let off = 0; off + CUSTOMER_SIZE <= buf.length; off += CUSTOMER_SIZE) {
    customers.push({
      id: buf.readInt32LE(off),
      name: readCString(buf, off + 4, 50),
      phone: readCString(buf, off + 54, 15),
      address: readCString(buf, off + 69, 100),
      active: buf.readInt32LE(off + 169) !== 0,
      username: null,
    });
  }

  const cylinders = [];
  const cylFile = path.join(C_DATA_DIR, 'cylinders.dat');
  if (fs.existsSync(cylFile)) {
    const cbuf = fs.readFileSync(cylFile);
    const CYL_SIZE = 24;
    for (let off = 0; off + CYL_SIZE <= cbuf.length; off += CYL_SIZE) {
      cylinders.push({
        id: cbuf.readInt32LE(off),
        type: cbuf.readInt32LE(off + 4),
        filled: cbuf.readInt32LE(off + 8),
        empty: cbuf.readInt32LE(off + 12),
        price: cbuf.readDoubleLE(off + 16),
      });
    }
  }

  const bookings = [];
  const bookFile = path.join(C_DATA_DIR, 'bookings.dat');
  if (fs.existsSync(bookFile)) {
    const bbuf = fs.readFileSync(bookFile);
    const BOOK_SIZE = 32;
    for (let off = 0; off + BOOK_SIZE <= bbuf.length; off += BOOK_SIZE) {
      bookings.push({
        id: bbuf.readInt32LE(off),
        customerId: bbuf.readInt32LE(off + 4),
        type: bbuf.readInt32LE(off + 8),
        quantity: bbuf.readInt32LE(off + 12),
        bookingDate: readCString(bbuf, off + 16, 11),
        status: bbuf.readInt32LE(off + 28),
        trackingStatus: bbuf.readInt32LE(off + 28) === 1 ? 'delivered' : 'confirmed',
      });
    }
  }

  const bills = [];
  const billFile = path.join(C_DATA_DIR, 'bills.dat');
  if (fs.existsSync(billFile)) {
    const vbuf = fs.readFileSync(billFile);
    const BILL_SIZE = 36;
    for (let off = 0; off + BILL_SIZE <= vbuf.length; off += BILL_SIZE) {
      bills.push({
        id: vbuf.readInt32LE(off),
        bookingId: vbuf.readInt32LE(off + 4),
        customerId: vbuf.readInt32LE(off + 8),
        amount: vbuf.readDoubleLE(off + 12),
        billDate: readCString(vbuf, off + 20, 11),
        paid: vbuf.readInt32LE(off + 32) !== 0,
      });
    }
  }

  const maxId = (arr, key = 'id') => (arr.length ? Math.max(...arr.map(x => x[key])) + 1 : 1);

  return {
    customers,
    cylinders: cylinders.length ? cylinders : defaultData().cylinders,
    bookings,
    bills,
    complaints: [],
    payments: [],
    settings: { adminRecoveryCode: 'BGS2006' },
    nextIds: {
      customer: maxId(customers),
      booking: maxId(bookings),
      bill: maxId(bills),
      complaint: 1,
      payment: 1,
    },
  };
}

function readSqlite() {
  if (!fs.existsSync(SQLITE_PATH)) return null;
  let Database;
  try {
    Database = require('better-sqlite3');
  } catch {
    console.log('  SQLite file found but better-sqlite3 not installed — run: npm install');
    return null;
  }
  const db = new Database(SQLITE_PATH, { readonly: true });
  const row = db.prepare('SELECT json FROM app_state WHERE id = 1').get();
  const data = row ? JSON.parse(row.json) : null;
  const admin = db.prepare('SELECT * FROM admin_auth WHERE id = 1').get();
  const customers = db.prepare('SELECT * FROM customer_auth').all();
  db.close();
  if (!data) return null;
  return {
    data,
    auth: {
      admin: admin || null,
      customers: customers || [],
    },
  };
}

function readJsonExport() {
  if (!fs.existsSync(EXPORT_JSON)) return null;
  try {
    return { data: JSON.parse(fs.readFileSync(EXPORT_JSON, 'utf8')), auth: null };
  } catch (err) {
    console.log('  Invalid gams_export.json:', err.message);
    return null;
  }
}

function mergeAuthDefaults(data) {
  const auth = {
    admin: {
      username: ADMIN_USER,
      password_hash: hashPassword('Bhambu2006'),
      recovery_hash: hashPassword('BGS2006'),
    },
    customers: [],
  };
  const demo = data.customers?.find(c => c.username?.toLowerCase() === DEFAULT_CUST_USER.toLowerCase());
  if (demo) {
    auth.customers.push({
      username: demo.username,
      customer_id: demo.id,
      password_hash: hashPassword('Bhambu2006'),
    });
  }
  return auth;
}

async function main() {
  console.log('\n========================================');
  console.log('  Bishnoi Gas Services — MySQL Migration');
  console.log('========================================\n');

  const sources = [];
  const sqlite = readSqlite();
  if (sqlite) sources.push({ name: 'SQLite (gams_server/data/gams.db)', ...sqlite });

  const jsonExport = readJsonExport();
  if (jsonExport) sources.push({ name: 'Browser export (gams_export.json)', ...jsonExport });

  const cData = readCDataFiles();
  if (cData) sources.push({ name: 'C console app (data/*.dat)', data: cData, auth: null });

  if (!sources.length) {
    console.log('No source data found. Will seed default demo data into MySQL.');
    console.log('Sources checked:');
    console.log('  -', SQLITE_PATH);
    console.log('  -', EXPORT_JSON);
    console.log('  -', C_DATA_DIR, '*.dat');
  } else {
    console.log('Found data sources (using best available):');
    sources.forEach((s, i) => console.log(`  ${i + 1}. ${s.name}`));
  }

  const pool = await initDb();
  const [[{ cnt }]] = await pool.query('SELECT COUNT(*) AS cnt FROM customers');
  if (Number(cnt) > 0 && !force) {
    console.log('\nMySQL already has data. Run with --force to overwrite.');
    await closeDb(pool);
    process.exit(0);
  }

  const pick = sources[0];
  const data = pick?.data || buildSampleData();
  const auth = pick?.auth || mergeAuthDefaults(data);

  if (!data.complaints) data.complaints = [];
  if (!data.payments) data.payments = [];
  if (!data.nextIds) data.nextIds = buildSampleData().nextIds;
  if (!data.settings) data.settings = { adminRecoveryCode: 'BGS2006' };

  await importFullState(pool, data, auth);

  const [[stats]] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM customers) AS customers,
      (SELECT COUNT(*) FROM cylinders) AS cylinders,
      (SELECT COUNT(*) FROM bookings) AS bookings,
      (SELECT COUNT(*) FROM bills) AS bills,
      (SELECT COUNT(*) FROM complaints) AS complaints,
      (SELECT COUNT(*) FROM payments) AS payments
  `);

  console.log('\nMigration complete → bishnoi_gas_service');
  console.log('  Customers:', stats.customers);
  console.log('  Cylinders:', stats.cylinders);
  console.log('  Bookings:', stats.bookings);
  console.log('  Bills:', stats.bills);
  console.log('  Complaints:', stats.complaints);
  console.log('  Payments:', stats.payments);
  console.log('\nView tables in phpMyAdmin: http://localhost/phpmyadmin\n');

  await closeDb(pool);
}

main().catch(err => {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
});
