#!/usr/bin/env node
/**
 * Auto-sync: ensure MySQL schema, migrate legacy data if empty, seed sample data.
 * Runs automatically from RUN_GAMS_APP.bat before the server starts.
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { mysqlConfig } = require('../config');
const {
  hashPassword,
  importFullState,
  ADMIN_USER,
  DEFAULT_CUST_USER,
} = require('../db');
const { buildSampleData, sampleCustomerUsernames } = require('../sampleData');

const ROOT = path.join(__dirname, '..', '..');
const SQLITE_PATH = path.join(__dirname, '..', 'data', 'gams.db');
const EXPORT_JSON = path.join(ROOT, 'gams_export.json');
const C_DATA_DIR = path.join(ROOT, 'data');
const SCHEMA_PATH = path.join(__dirname, '..', 'sql', 'schema.sql');
const SAMPLE_PASSWORD = 'Bhambu2006';

async function runSchema(pool) {
  const sql = fs.readFileSync(SCHEMA_PATH, 'utf8');
  const statements = sql.split(';').map(s => s.trim()).filter(s => s && !s.startsWith('--'));
  for (const stmt of statements) {
    await pool.query(stmt);
  }
}

function buildSampleAuth(data) {
  const hash = hashPassword(SAMPLE_PASSWORD);
  const customers = data.customers.filter(c => c.username && sampleCustomerUsernames().includes(c.username));
  return {
    admin: {
      username: ADMIN_USER,
      password_hash: hashPassword('Bhambu2006'),
      recovery_hash: hashPassword('BGS2006'),
    },
    customers: customers.map(c => ({
      username: c.username,
      customer_id: c.id,
      password_hash: hash,
    })),
  };
}

function readLegacySources() {
  const sources = [];

  if (fs.existsSync(SQLITE_PATH)) {
    try {
      const Database = require('better-sqlite3');
      const db = new Database(SQLITE_PATH, { readonly: true });
      const row = db.prepare('SELECT json FROM app_state WHERE id = 1').get();
      if (row) {
        sources.push({
          name: 'SQLite',
          data: JSON.parse(row.json),
          auth: {
            admin: db.prepare('SELECT * FROM admin_auth WHERE id = 1').get(),
            customers: db.prepare('SELECT * FROM customer_auth').all(),
          },
        });
      }
      db.close();
    } catch { /* skip */ }
  }

  if (fs.existsSync(EXPORT_JSON)) {
    try {
      sources.push({ name: 'gams_export.json', data: JSON.parse(fs.readFileSync(EXPORT_JSON, 'utf8')), auth: null });
    } catch { /* skip */ }
  }

  return sources;
}

async function ensureAdminAuth(pool) {
  const hash = hashPassword('Bhambu2006');
  await pool.query(`
    INSERT INTO admin_auth (id, username, password_hash, recovery_hash)
    VALUES (1, ?, ?, ?)
    ON DUPLICATE KEY UPDATE username = VALUES(username)
  `, [ADMIN_USER, hash, hashPassword('BGS2006')]);
}

async function autoSync() {
  console.log('MySQL auto-sync →', mysqlConfig.database);

  const pool = mysql.createPool(mysqlConfig);
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    throw new Error(`MySQL not reachable. Start XAMPP MySQL. (${err.message})`);
  }

  await runSchema(pool);
  await ensureAdminAuth(pool);

  const [[{ custCnt }]] = await pool.query('SELECT COUNT(*) AS custCnt FROM customers');
  const [[{ bookCnt }]] = await pool.query('SELECT COUNT(*) AS bookCnt FROM bookings');
  const count = Number(custCnt);
  const bookings = Number(bookCnt);

  const forceSeed = process.argv.includes('--seed') || process.env.GAMS_AUTO_SEED === 'force';

  if (count === 0) {
    const legacy = readLegacySources();
    if (legacy.length) {
      const pick = legacy[0];
      console.log('  Importing legacy data from', pick.name);
      const auth = pick.auth || buildSampleAuth(pick.data);
      await importFullState(pool, pick.data, auth);
    } else {
      console.log('  Empty database — loading sample customers & bookings...');
      const data = buildSampleData();
      await importFullState(pool, data, buildSampleAuth(data));
    }
  } else if (forceSeed || (count <= 1 && bookings === 0)) {
    console.log('  Seeding sample data (customers, bookings, bills, complaints)...');
    const data = buildSampleData();
    await importFullState(pool, data, buildSampleAuth(data));
  } else {
    console.log(`  Database ready (${count} customers, ${bookings} bookings)`);
  }

  const [[stats]] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM customers) AS customers,
      (SELECT COUNT(*) FROM bookings) AS bookings,
      (SELECT COUNT(*) FROM bills) AS bills,
      (SELECT COUNT(*) FROM complaints) AS complaints
  `);
  console.log(`  ✓ ${stats.customers} customers | ${stats.bookings} bookings | ${stats.bills} bills | ${stats.complaints} complaints`);
  console.log('  Portal logins (password Bhambu2006):', sampleCustomerUsernames().join(', '));

  await pool.end();
}

autoSync().catch(err => {
  console.error('Auto-sync failed:', err.message);
  process.exit(1);
});
