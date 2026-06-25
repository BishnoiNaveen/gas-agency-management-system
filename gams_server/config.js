const path = require('path');
const fs = require('fs');

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile();

const mysqlConfig = {
  host: process.env.GAMS_MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.GAMS_MYSQL_PORT || 3306),
  user: process.env.GAMS_MYSQL_USER || 'root',
  password: process.env.GAMS_MYSQL_PASSWORD || '',
  database: process.env.GAMS_MYSQL_DATABASE || 'bishnoi_gas_service',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
};

module.exports = { mysqlConfig };
