const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const {
  initDb,
  getData,
  setData,
  stripPasswords,
  ADMIN_USER,
  verifyAdminLogin,
  resetAdminPassword,
  changeAdminPassword,
  verifyCustomerLogin,
  registerCustomerAuth,
  resetCustomerPassword,
  mysqlConfig,
} = require('./db');
const logic = require('../gams_shared/logic');

const JWT_SECRET = process.env.GAMS_JWT_SECRET || 'bishnoi-gas-dev-secret-change-in-production';
const PORT = process.env.PORT || 3000;
const WEB_ROOT = path.join(__dirname, '..', 'gams_web');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

let db = null;

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'Bishnoi Gas Services API',
    version: '2.2.0',
    database: 'mysql',
    dbName: mysqlConfig.database,
  });
});

app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!(await verifyAdminLogin(db, username?.trim(), password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signToken({ role: 'admin', username: ADMIN_USER });
    res.json({ token, role: 'admin', username: ADMIN_USER });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/customer/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const customer = await verifyCustomerLogin(db, username?.trim(), password);
    if (!customer) return res.status(401).json({ error: 'Invalid username or password' });
    const token = signToken({ role: 'customer', customerId: customer.id, username: customer.username });
    res.json({ token, role: 'customer', customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/customer/register', async (req, res) => {
  try {
    const { name, username, password, phone, address } = req.body || {};
    if (!name || !username || !password || !address) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }
    if (!logic.validatePhone(phone)) return res.status(400).json({ error: 'Phone must be exactly 10 digits' });
    if (!logic.validatePassword(password)) return res.status(400).json({ error: 'Password must be at least 4 characters' });
    if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });

    const data = await getData(db);
    if (data.customers.some(c => c.username?.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    if (username.toLowerCase() === ADMIN_USER.toLowerCase() || username.toLowerCase() === 'admin') {
      return res.status(400).json({ error: 'This username is reserved' });
    }

    const id = data.nextIds.customer++;
    data.customers.push({ id, name, phone, address, active: true, username });
    await registerCustomerAuth(db, username, id, password);
    await setData(db, data);
    res.json({ ok: true, message: 'Account created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/admin/forgot-password', async (req, res) => {
  try {
    const { username, recoveryCode, newPassword } = req.body || {};
    if (!logic.validatePassword(newPassword)) return res.status(400).json({ error: 'Password must be at least 4 characters' });
    if (!(await resetAdminPassword(db, username?.trim(), recoveryCode?.trim(), newPassword))) {
      return res.status(400).json({ error: 'Invalid username or recovery code' });
    }
    res.json({ ok: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/customer/forgot-password', async (req, res) => {
  try {
    const { username, phone, newPassword } = req.body || {};
    if (!logic.validatePassword(newPassword)) return res.status(400).json({ error: 'Password must be at least 4 characters' });
    if (!(await resetCustomerPassword(db, username?.trim(), phone?.trim(), newPassword))) {
      return res.status(400).json({ error: 'Username or phone does not match our records' });
    }
    res.json({ ok: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/admin/change-password', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!logic.validatePassword(newPassword)) return res.status(400).json({ error: 'Password must be at least 4 characters' });
    if (!(await changeAdminPassword(db, currentPassword, newPassword))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    res.json({ ok: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/data', authMiddleware, async (req, res) => {
  try {
    const data = stripPasswords(await getData(db));
    if (req.user.role === 'customer') {
      const cid = req.user.customerId;
      data.bookings = data.bookings.filter(b => b.customerId === cid);
      data.bills = data.bills.filter(b => b.customerId === cid);
      data.complaints = (data.complaints || []).filter(c => c.customerId === cid);
      data.payments = (data.payments || []).filter(p => p.customerId === cid);
      data.customers = data.customers.filter(c => c.id === cid);
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/data', authMiddleware, async (req, res) => {
  try {
    const incoming = req.body;
    if (!incoming || typeof incoming !== 'object') {
      return res.status(400).json({ error: 'Invalid data payload' });
    }

    if (req.user.role === 'admin') {
      const saved = await setData(db, incoming);
      return res.json(saved);
    }

    const current = await getData(db);
    const cid = req.user.customerId;
    mergeCustomerState(current, incoming, cid);
    await setData(db, current);
    const filtered = stripPasswords(await getData(db));
    filtered.customers = filtered.customers.filter(c => c.id === cid);
    filtered.bookings = filtered.bookings.filter(b => b.customerId === cid);
    filtered.bills = filtered.bills.filter(b => b.customerId === cid);
    filtered.complaints = (filtered.complaints || []).filter(c => c.customerId === cid);
    filtered.payments = (filtered.payments || []).filter(p => p.customerId === cid);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function mergeCustomerState(current, incoming, customerId) {
  const upsertById = (arr, items, matchFn) => {
    if (!items) return;
    items.forEach(item => {
      if (!matchFn(item)) return;
      const idx = arr.findIndex(x => x.id === item.id);
      if (idx >= 0) arr[idx] = item;
      else arr.push(item);
    });
  };

  upsertById(current.bookings, incoming.bookings, b => b.customerId === customerId);
  upsertById(current.bills, incoming.bills, b => b.customerId === customerId);
  if (incoming.complaints) {
    current.complaints = current.complaints || [];
    upsertById(current.complaints, incoming.complaints, c => c.customerId === customerId);
  }
  if (incoming.payments) {
    current.payments = current.payments || [];
    upsertById(current.payments, incoming.payments, p => p.customerId === customerId);
  }
  if (incoming.nextIds) current.nextIds = { ...current.nextIds, ...incoming.nextIds };
}

app.patch('/api/data', authMiddleware, (_req, res) => {
  res.status(410).json({ error: 'Use PUT /api/data' });
});

app.use(express.static(WEB_ROOT));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(WEB_ROOT, 'index.html'));
});

async function startServer() {
  db = await initDb();
  if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`Bishnoi Gas Services running at http://localhost:${PORT}`);
      console.log(`MySQL database: ${mysqlConfig.database} @ ${mysqlConfig.host}`);
      console.log(`Admin login: ${ADMIN_USER} / Bhambu2006`);
    });
  }
}

startServer().catch(err => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

module.exports = { app, getDb: () => db };
