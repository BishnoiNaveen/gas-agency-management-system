var GAMS = (() => {
  const {
    AGENCY_NAME, ADMIN_USER, DEFAULT_CUST_USER, STORAGE_KEY, SESSION_KEY,
    DEFAULT_ADMIN_RECOVERY, SUPPORT, AGENCY_UPI, AGENCY_BANK, AGENCY_GST,
  } = window.GAMS_CONFIG;
  const U = window.GAMS_UTILS;
  const API = window.GAMS_API;

  const CYLINDER_INFO = {
    5: { label: '5 KG', use: 'Domestic / Small Family', features: ['1-2 person household', 'Easy to handle', 'Ideal for hostel & PG'], color: 'type-5' },
    14: { label: '14 KG', use: 'Standard Home Use', features: ['Most popular size', '3-5 member family', 'Best value refill'], color: 'type-14' },
    19: { label: '19 KG', use: 'Commercial / Large Family', features: ['Restaurants & shops', 'Large households', 'High consumption'], color: 'type-19' },
  };

  const AGENCY_SERVICES = [
    { icon: 'fa-truck-fast', color: '#1B7A4E', title: 'Home Delivery', desc: 'Safe doorstep delivery of LPG cylinders at your registered address.', tag: 'Free local delivery' },
    { icon: 'fa-globe', color: '#023E8A', title: 'Online Booking', desc: 'Book cylinders 24/7 through our customer portal — no phone calls needed.', tag: 'Instant booking' },
    { icon: 'fa-rotate', color: '#E85D04', title: 'Cylinder Refill & Exchange', desc: 'Exchange empty cylinders for filled ones at government-approved rates.', tag: 'Same-day service' },
    { icon: 'fa-file-circle-plus', color: '#7C3AED', title: 'New Connection', desc: 'Register for a new LPG connection with KYC verification assistance.', tag: 'New customers' },
    { icon: 'fa-recycle', color: '#059669', title: 'Empty Cylinder Pickup', desc: 'We collect empty cylinders during your next delivery visit.', tag: 'Eco-friendly' },
    { icon: 'fa-bolt', color: '#D97706', title: 'Emergency Express Delivery', desc: 'Urgent cylinder delivery within 2-4 hours for emergency situations.', tag: 'Priority service' },
    { icon: 'fa-shield-halved', color: '#B91C1C', title: 'Gas Leak Safety Check', desc: 'Trained staff inspect regulator, hose & stove connections for safety.', tag: 'Safety first' },
    { icon: 'fa-hand-holding-heart', color: '#DB2777', title: 'Ujjwala Scheme Support', desc: 'Assistance for PM Ujjwala Yojana subsidized cylinder beneficiaries.', tag: 'Govt. scheme' },
    { icon: 'fa-building', color: '#0369A1', title: 'Commercial Bulk Supply', desc: 'Regular supply for hotels, restaurants, canteens & businesses.', tag: 'Bulk orders' },
    { icon: 'fa-file-invoice-dollar', color: '#1B7A4E', title: 'Billing & Invoices', desc: 'Transparent billing with digital invoices and payment tracking.', tag: 'GST invoice' },
    { icon: 'fa-headset', color: '#DC2626', title: '24/7 Customer Support', desc: 'Round-the-clock helpline for queries, complaints & emergencies.', tag: 'Always available' },
    { icon: 'fa-screwdriver-wrench', color: '#64748B', title: 'Regulator & Hose Service', desc: 'Sale and replacement of ISI-marked regulators and suraksha hoses.', tag: 'Accessories' },
  ];

  const FAQ_LIST = [
    { q: 'What are your cylinder prices?', a: 'Prices are updated live on the Prices tab. Current refill rates for 5 KG, 14 KG & 19 KG cylinders are shown with stock availability.' },
    { q: 'How long does delivery take?', a: 'Standard delivery is within 24 hours. Emergency express delivery is available in 2-4 hours on request.' },
    { q: 'How do I register a complaint?', a: `Call our complaint hotline ${SUPPORT.complaintHotline} or submit a complaint from the Support tab. We respond within 24 hours.` },
    { q: 'What to do in case of gas leak?', a: `Do NOT switch on lights or appliances. Open windows, turn off regulator, move to safety and call ${SUPPORT.emergencyLeak} (National) or ${SUPPORT.agencyEmergency} (Bishnoi Gas Emergency).` },
    { q: 'Can I cancel my online booking?', a: 'Yes, pending orders can be cancelled from the Orders tab before delivery is dispatched.' },
    { q: 'What payment methods are accepted?', a: 'We accept UPI, Credit/Debit Cards, Net Banking, Wallets (Paytm, PhonePe), Cash on Delivery, and Bank Transfer/NEFT. Pay online or at your doorstep.' },
  ];

  const PAYMENT_METHODS = [
    { id: 'upi', name: 'UPI', icon: 'fa-mobile-screen-button', color: '#5F259F', desc: 'GPay · PhonePe · Paytm · BHIM' },
    { id: 'card', name: 'Card', icon: 'fa-credit-card', color: '#023E8A', desc: 'Visa · Mastercard · RuPay' },
    { id: 'netbanking', name: 'Net Banking', icon: 'fa-building-columns', color: '#1B7A4E', desc: 'All major Indian banks' },
    { id: 'wallet', name: 'Wallets', icon: 'fa-wallet', color: '#E85D04', desc: 'Paytm · PhonePe · Amazon Pay' },
    { id: 'cod', name: 'Cash on Delivery', icon: 'fa-money-bill-wave', color: '#059669', desc: 'Pay when cylinder arrives' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: 'fa-landmark', color: '#64748B', desc: 'NEFT · IMPS · RTGS' },
  ];

  const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank'];
  const WALLETS = ['Paytm', 'PhonePe', 'Amazon Pay', 'Mobikwik', 'Freecharge'];

  let paymentCtx = { type: null, amount: 0, billId: null, bookingPayload: null, method: null, step: 1 };
  let loginAttempts = 0;
  let custLoginAttempts = 0;
  let currentPage = 'dashboard';
  let customerPage = 'chome';
  let session = { role: null, customerId: null };

  const CUSTOMER_PAGE_META = {
    chome: { title: 'My Home', bg: 'https://images.unsplash.com/photo-1581094794329-cd11b84f8f2b?w=1200&q=80', hero: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80' },
    cbook: { title: 'Book Cylinder', bg: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80', hero: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80' },
    cbookings: { title: 'My Orders', bg: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=1200&q=80', hero: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80' },
    cbills: { title: 'Payment & Bills', bg: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80', hero: 'https://images.unsplash.com/photo-1554224154-26032cdc0c0f?w=800&q=80' },
    cpay: { title: 'Payment Portal', bg: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80', hero: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80' },
    cprofile: { title: 'My Profile', bg: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=1200&q=80', hero: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80' },
    cprices: { title: 'Cylinder Prices', bg: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&q=80', hero: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80' },
    cservices: { title: 'Our Services', bg: 'https://images.unsplash.com/photo-1581094794329-cd11b84f8f2b?w=1200&q=80', hero: 'https://images.unsplash.com/photo-1565793298595-6cf0f8285b34?w=800&q=80' },
    csupport: { title: 'Help & Support', bg: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=1200&q=80', hero: 'https://images.unsplash.com/photo-1556745750-2c26d7a0e8e3?w=800&q=80' },
  };

  const PAGE_META = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Real-time business overview & analytics',
      bg: 'https://images.unsplash.com/photo-1565793298595-6cf0f8285b34?w=1200&q=80',
      hero: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
      icon: 'fa-gauge-high',
    },
    customers: {
      title: 'Customers',
      subtitle: 'Manage registered LPG customers',
      bg: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=1200&q=80',
      hero: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
      icon: 'fa-users',
    },
    inventory: {
      title: 'Inventory',
      subtitle: 'LPG cylinder stock & pricing',
      bg: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&q=80',
      hero: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
      icon: 'fa-database',
    },
    bookings: {
      title: 'Bookings',
      subtitle: 'Cylinder orders & reservations',
      bg: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
      hero: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800&q=80',
      icon: 'fa-calendar-check',
    },
    billing: {
      title: 'Billing',
      subtitle: 'Invoices, payments & revenue',
      bg: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
      hero: 'https://images.unsplash.com/photo-1554224154-26032cdc0c0f?w=800&q=80',
      icon: 'fa-file-invoice-dollar',
    },
    delivery: {
      title: 'Delivery',
      subtitle: 'Dispatch & doorstep cylinder delivery',
      bg: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=80',
      hero: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
      icon: 'fa-truck',
    },
  };

  const CYLINDER_IMG = {
    5: 'https://images.unsplash.com/photo-1581092160607-ee22621ddbb9?w=200&q=80',
    14: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=200&q=80',
    19: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200&q=80',
  };

  const defaultData = () => ({
    customers: [
      {
        id: 1,
        name: 'Demo Customer',
        phone: '9876543210',
        address: 'House 12, Near Bishnoi Gas Services, Main Road, Jodhpur',
        active: true,
        username: DEFAULT_CUST_USER,
        password: 'Bhambu2006',
      },
      {
        id: 2,
        name: 'Ramesh Kumar',
        phone: '9829012345',
        address: 'Ward 5, Sardarpura, Jodhpur',
        active: true,
        username: 'ramesh_kumar',
        password: 'Bhambu2006',
      },
      {
        id: 3,
        name: 'Sunita Devi',
        phone: '9414056789',
        address: '42, Ratanada Colony, Jodhpur',
        active: true,
        username: 'sunita_devi',
        password: 'Bhambu2006',
      },
    ],
    cylinders: [
      { id: 1, type: 5, filled: 50, empty: 10, price: 450 },
      { id: 2, type: 14, filled: 80, empty: 20, price: 950 },
      { id: 3, type: 19, filled: 60, empty: 15, price: 1150 },
    ],
    bookings: [
      { id: 1, customerId: 1, type: 14, quantity: 1, bookingDate: '08-09-2026', status: 1, deliveryAddress: 'House 12, Near Bishnoi Gas Services, Main Road, Jodhpur', source: 'online', paymentMethod: 'upi', paymentStatus: 'completed', transactionId: 'UPI-DEMO-9912', amount: 950, trackingStatus: 'delivered' },
      { id: 2, customerId: 2, type: 14, quantity: 1, bookingDate: '09-09-2026', status: 0, deliveryAddress: 'Ward 5, Sardarpura, Jodhpur', source: 'online', paymentMethod: 'cod', paymentStatus: 'pay_on_delivery', transactionId: 'COD-1029', amount: 950, trackingStatus: 'confirmed' },
    ],
    bills: [
      { id: 1, bookingId: 1, customerId: 1, amount: 950, billDate: '08-09-2026', paid: true, paymentMethod: 'upi', transactionId: 'UPI-DEMO-9912', paidDate: '08-09-2026' },
      { id: 2, bookingId: 2, customerId: 2, amount: 950, billDate: '09-09-2026', paid: false },
    ],
    complaints: [
      { id: 1, customerId: 1, type: 'refill', subject: 'Regulator Inspection', description: 'Request regulator safety inspection on next visit', status: 'pending', date: '09-09-2026' }
    ],
    payments: [
      { id: 1, customerId: 1, amount: 950, method: 'upi', transactionId: 'UPI-DEMO-9912', date: '08-09-2026', type: 'booking' }
    ],
    settings: { adminRecoveryCode: DEFAULT_ADMIN_RECOVERY, adminPassword: 'Bhambu2006' },
    nextIds: { customer: 4, booking: 3, bill: 3, complaint: 2, payment: 2 },
  });

  function ensureDefaultCustomer() {
    const defaultCust = data.customers.find(
      c => c.username && c.username.toLowerCase() === DEFAULT_CUST_USER
    );
    if (!defaultCust) {
      const id = data.nextIds.customer++;
      data.customers.push({
        id,
        name: 'Demo Customer',
        phone: '9876543210',
        address: 'Near Bishnoi Gas Services, Main Road, Jodhpur',
        active: true,
        username: DEFAULT_CUST_USER,
        password: 'Bhambu2006',
      });
      save(data);
    } else if (!defaultCust.password) {
      defaultCust.password = 'Bhambu2006';
      save(data);
    }
  }

  function loadLocal() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        raw = localStorage.getItem('gams_data_v2');
        if (raw) {
          const migrated = JSON.parse(raw);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        }
      }
      return raw ? JSON.parse(raw) : defaultData();
    } catch { return defaultData(); }
  }

  function stripPasswordsForSave(d) {
    const copy = JSON.parse(JSON.stringify(d));
    if (copy.customers) {
      copy.customers = copy.customers.map(c => {
        const { password, ...rest } = c;
        return rest;
      });
    }
    return copy;
  }

  function save(d) {
    data = d;
    if (API.isApiMode()) {
      if (!API.getToken()) return;
      API.saveData(stripPasswordsForSave(d)).catch(err => toast(err.message || 'Save failed', true));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    }
  }

  let data = defaultData();

  async function initData() {
    const savedToken = localStorage.getItem(window.GAMS_CONFIG.TOKEN_KEY);
    if (savedToken) API.setToken(savedToken);
    const serverUp = await API.checkHealth().catch(() => false);
    if (serverUp) {
      API.setApiMode(true);
      if (API.getToken()) {
        try {
          data = await API.loadData();
        } catch {
          data = defaultData();
        }
      } else {
        data = defaultData();
      }
    } else {
      try {
        data = loadLocal();
      } catch {
        data = defaultData();
      }
    }
    if (!data.complaints) data.complaints = [];
    if (!data.nextIds.complaint) data.nextIds.complaint = 1;
    if (!data.payments) data.payments = [];
    if (!data.nextIds.payment) data.nextIds.payment = 1;
    if (!data.settings) data.settings = { adminRecoveryCode: DEFAULT_ADMIN_RECOVERY, adminPassword: 'Bhambu2006' };
    if (!API.isApiMode()) ensureDefaultCustomer();
    const banner = document.getElementById('server-banner');
    if (banner) {
      const isHosted = window.location.hostname.includes('github.io') || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
      if (isHosted) {
        banner.classList.add('hidden');
      } else {
        const healthy = await API.checkHealth().catch(() => false);
        banner.classList.toggle('hidden', healthy || Boolean(API.getToken()));
      }
    }
  }

  function orderTrackerHtml(booking) {
    const ts = U.getTrackingStatus(booking);
    const TRACKING_ORDER = U.TRACKING_ORDER;
    const TRACKING_STEPS = U.TRACKING_STEPS;
    if (ts === 'cancelled') {
      return `<div class="order-tracker cancelled"><div class="track-step cancelled"><i class="fa-solid fa-xmark"></i><span>Order Cancelled</span></div></div>`;
    }
    const idx = TRACKING_ORDER.indexOf(ts);
    const steps = TRACKING_STEPS.map((step, i) => {
      let state = 'pending';
      if (i < idx) state = 'done';
      else if (i === idx) state = 'active';
      return `<div class="track-step ${state}">
        <div class="track-dot"><i class="fa-solid ${step.icon}"></i></div>
        <span>${step.label}</span>
      </div>`;
    }).join('');
    return `<div class="order-tracker">${steps}</div>`;
  }

  function saveSession() {
    if (session.role) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }

  function restoreSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.role === 'admin') {
        session = { role: 'admin', customerId: null };
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('main-screen').classList.add('active');
        document.getElementById('customer-screen').classList.remove('active');
        document.getElementById('admin-name').textContent = ADMIN_USER.split(' ')[0];
        nav('dashboard');
      } else if (s.role === 'customer' && s.customerId) {
        const customer = data.customers.find(c => c.id === s.customerId && c.active !== false);
        if (!customer) return localStorage.removeItem(SESSION_KEY);
        session = { role: 'customer', customerId: customer.id };
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('main-screen').classList.remove('active');
        document.getElementById('customer-screen').classList.add('active');
        document.getElementById('customer-name-chip').textContent = customer.name.split(' ')[0];
        customerNav('chome');
        updateHelplineStrip();
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  function getModalContent() {
    return document.getElementById('modal-content');
  }

  function getModalBody() {
    return document.getElementById('modal-body');
  }

  function helplineStripHtml() {
    return `<i class="fa-solid fa-phone-volume"></i> Complaint: <a href="tel:${SUPPORT.complaintHotline}">${SUPPORT.complaintHotline}</a> · Emergency: <a href="tel:${SUPPORT.emergencyLeak}">${SUPPORT.emergencyLeak}</a>`;
  }

  function updateHelplineStrip() {
    const el = document.getElementById('customer-helpline');
    if (!el) return;
    if (session.role === 'customer') {
      el.innerHTML = helplineStripHtml();
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  }

  function contactCardsHtml() {
    return `<div class="contact-grid fade-in">
      <div class="contact-card">
        <div class="contact-icon care"><i class="fa-solid fa-headset"></i></div>
        <div><div class="contact-label">Customer Care</div><div class="contact-value"><a href="tel:${SUPPORT.customerCare}">${SUPPORT.customerCare}</a></div></div>
      </div>
      <div class="contact-card">
        <div class="contact-icon complaint"><i class="fa-solid fa-phone-volume"></i></div>
        <div><div class="contact-label">Complaint Hotline</div><div class="contact-value"><a href="tel:${SUPPORT.complaintHotline}">${SUPPORT.complaintHotline}</a></div></div>
      </div>
      <div class="contact-card">
        <div class="contact-icon wa"><i class="fa-brands fa-whatsapp"></i></div>
        <div><div class="contact-label">WhatsApp Support</div><div class="contact-value"><a href="https://wa.me/91${SUPPORT.whatsapp}" target="_blank">${SUPPORT.whatsapp}</a></div></div>
      </div>
      <div class="contact-card">
        <div class="contact-icon hours"><i class="fa-regular fa-clock"></i></div>
        <div><div class="contact-label">Office Hours</div><div class="contact-value" style="font-size:14px">${SUPPORT.officeHours}</div></div>
      </div>
    </div>`;
  }

  function emergencyCardHtml() {
    return `<div class="emergency-card fade-in">
      <h3><i class="fa-solid fa-triangle-exclamation"></i> Gas Leak Emergency</h3>
      <p>If you smell gas — do NOT use switches or fire. Evacuate immediately.</p>
      <div class="emergency-num"><i class="fa-solid fa-phone"></i> <a href="tel:${SUPPORT.emergencyLeak}">${SUPPORT.emergencyLeak}</a> <span style="font-size:14px;opacity:0.8">National</span></div>
      <div class="emergency-num" style="font-size:20px"><i class="fa-solid fa-fire-flame-curved"></i> <a href="tel:${SUPPORT.agencyEmergency}">${SUPPORT.agencyEmergency}</a> <span style="font-size:12px;opacity:0.8">Bishnoi Gas</span></div>
    </div>`;
  }

  function priceSnapshotHtml(onclickNav) {
    const fn = onclickNav || "GAMS.customerNav('cprices')";
    return `<div class="price-snapshot fade-in" onclick="${fn}">
      ${data.cylinders.map(c => `
        <div class="price-snap-item" onclick="event.stopPropagation();GAMS.customerNav('cprices')">
          <div class="kg">${c.type} KG</div>
          <div class="amt">₹${c.price}</div>
        </div>`).join('')}
    </div>`;
  }

  function paymentMethodLabel(id) {
    return PAYMENT_METHODS.find(m => m.id === id)?.name || id || '—';
  }

  function paymentMethodIcon(id) {
    const m = PAYMENT_METHODS.find(x => x.id === id);
    return m ? `<span class="ph-icon" style="background:${m.color}18;color:${m.color}"><i class="fa-solid ${m.icon}"></i></span>` : '';
  }

  function genTxnId() { return U.genTxnId(); }

  function getAdminRecoveryCode() {
    return DEFAULT_ADMIN_RECOVERY;
  }

  function today() { return U.today(); }
  function typeLabel(t) { return U.typeLabel(t); }
  function typeClass(t) { return U.typeClass(t); }

  function openPaymentPortal(ctx) {
    paymentCtx = { ...ctx, method: null, step: 1 };
    renderPaymentModal();
    document.getElementById('modal').classList.remove('hidden');
    getModalContent()?.classList.add('payment-modal');
  }

  function renderPaymentModal() {
    const body = getModalBody();
    const mc = getModalContent();
    if (mc) mc.classList.add('payment-modal');

    if (paymentCtx.step === 3) {
      const isCod = paymentCtx.method === 'cod';
      const title = isCod
        ? (paymentCtx.type === 'booking' ? 'Booking Confirmed!' : 'Cash on Delivery Selected')
        : 'Payment Successful!';
      const sub = isCod
        ? (paymentCtx.type === 'booking'
          ? `Pay ₹${paymentCtx.amount.toLocaleString('en-IN')} in cash when your cylinder is delivered.`
          : `Pay ₹${paymentCtx.amount.toLocaleString('en-IN')} in cash to the delivery person.`)
        : `₹${paymentCtx.amount.toLocaleString('en-IN')} paid via <strong>${paymentMethodLabel(paymentCtx.method)}</strong>`;
      body.innerHTML = `
        <div class="payment-success fade-in">
          <div class="success-icon"><i class="fa-solid fa-${isCod ? 'check' : 'check'}"></i></div>
          <h3>${title}</h3>
          <p style="color:var(--muted);font-size:14px">${sub}</p>
          <div class="txn-id">Ref: ${paymentCtx.transactionId}</div>
          <button class="btn btn-customer btn-block" style="margin-top:20px" onclick="GAMS.closePaymentPortal()">Done</button>
        </div>`;
      return;
    }

    const methodsHtml = PAYMENT_METHODS.map(m => `
      <div class="payment-method-card ${paymentCtx.method === m.id ? 'selected' : ''}" onclick="GAMS.selectPayMethod('${m.id}')">
        <div class="pm-icon" style="background:${m.color}15;color:${m.color}"><i class="fa-solid ${m.icon}"></i></div>
        <div class="pm-name">${m.name}</div>
        <div class="pm-desc">${m.desc}</div>
      </div>`).join('');

    body.innerHTML = `
      <h2><i class="fa-solid fa-wallet" style="color:var(--green);margin-right:8px"></i>Secure Payment</h2>
      <div class="payment-amount-bar">
        <div class="pay-label">${paymentCtx.type === 'booking' ? 'Booking Amount' : 'Bill Amount'}</div>
        <div class="pay-amount">₹${paymentCtx.amount.toLocaleString('en-IN')}</div>
      </div>
      <div class="section-title" style="margin-top:0">Choose Payment Method</div>
      <div class="payment-methods-grid">${methodsHtml}</div>
      <div id="payment-form-area">${paymentCtx.method ? renderPaymentForm(paymentCtx.method) : '<p style="text-align:center;color:var(--muted);font-size:13px;padding:12px">Select a payment method above</p>'}</div>
      <div class="secure-badge"><i class="fa-solid fa-lock"></i> 256-bit SSL Secured · Powered by Bishnoi Gas Services</div>`;
  }

  function renderPaymentForm(method) {
    switch (method) {
      case 'upi':
        return `<div class="payment-form-panel fade-in">
          <h4><i class="fa-solid fa-mobile-screen"></i> Pay via UPI</h4>
          <div class="upi-qr-box"><i class="fa-solid fa-qrcode"></i><span style="font-size:10px;margin-top:4px">Scan QR</span></div>
          <div class="upi-id-display"><i class="fa-solid fa-at"></i> ${AGENCY_UPI}</div>
          <div class="form-group" style="margin-bottom:12px">
            <label>Your UPI ID</label>
            <input type="text" id="pay-upi-id" placeholder="yourname@upi" />
          </div>
          <button class="btn btn-customer btn-block" onclick="GAMS.confirmPayment()"><i class="fa-solid fa-bolt"></i> Pay ₹${paymentCtx.amount.toLocaleString('en-IN')} via UPI</button>
        </div>`;
      case 'card':
        return `<div class="payment-form-panel fade-in">
          <h4><i class="fa-solid fa-credit-card"></i> Card Details</h4>
          <div class="form-group"><label>Card Number</label><input type="text" id="pay-card-num" placeholder="1234 5678 9012 3456" maxlength="19" /></div>
          <div class="form-group"><label>Cardholder Name</label><input type="text" id="pay-card-name" placeholder="Name on card" /></div>
          <div class="card-row">
            <div class="form-group"><label>Expiry</label><input type="text" id="pay-card-exp" placeholder="MM/YY" maxlength="5" /></div>
            <div class="form-group"><label>CVV</label><input type="password" id="pay-card-cvv" placeholder="***" maxlength="4" /></div>
          </div>
          <p style="font-size:11px;color:var(--muted);margin-bottom:12px"><i class="fa-solid fa-lock"></i> Demo mode — no real charge</p>
          <button class="btn btn-customer btn-block" onclick="GAMS.confirmPayment()"><i class="fa-solid fa-lock"></i> Pay ₹${paymentCtx.amount.toLocaleString('en-IN')}</button>
        </div>`;
      case 'netbanking':
        return `<div class="payment-form-panel fade-in">
          <h4><i class="fa-solid fa-building-columns"></i> Select Your Bank</h4>
          <div class="bank-list" id="bank-list">
            ${BANKS.map((b, i) => `<div class="bank-option ${i === 0 ? 'selected' : ''}" onclick="GAMS.selectBank(this)">${b}</div>`).join('')}
          </div>
          <button class="btn btn-customer btn-block" style="margin-top:14px" onclick="GAMS.confirmPayment()"><i class="fa-solid fa-building-columns"></i> Proceed to Net Banking</button>
        </div>`;
      case 'wallet':
        return `<div class="payment-form-panel fade-in">
          <h4><i class="fa-solid fa-wallet"></i> Select Wallet</h4>
          <div class="wallet-options" id="wallet-list">
            ${WALLETS.map((w, i) => `<span class="wallet-chip ${i === 0 ? 'selected' : ''}" onclick="GAMS.selectWallet(this)">${w}</span>`).join('')}
          </div>
          <button class="btn btn-customer btn-block" style="margin-top:16px" onclick="GAMS.confirmPayment()"><i class="fa-solid fa-wallet"></i> Pay ₹${paymentCtx.amount.toLocaleString('en-IN')}</button>
        </div>`;
      case 'cod':
        return `<div class="payment-form-panel fade-in">
          <div class="cod-info">
            <i class="fa-solid fa-money-bill-wave"></i>
            <h4 style="color:var(--green);margin-bottom:8px">Cash on Delivery</h4>
            <p style="font-size:13px;color:var(--muted);line-height:1.6">Pay <strong>₹${paymentCtx.amount.toLocaleString('en-IN')}</strong> in cash to our delivery person when your cylinder arrives at your doorstep.</p>
          </div>
          <button class="btn btn-customer btn-block" style="margin-top:14px" onclick="GAMS.confirmPayment()"><i class="fa-solid fa-check"></i> Confirm Cash on Delivery</button>
        </div>`;
      case 'bank_transfer':
        return `<div class="payment-form-panel fade-in">
          <h4><i class="fa-solid fa-landmark"></i> Bank Transfer Details</h4>
          <div style="font-size:13px;line-height:1.8;margin-bottom:14px">
            <div><strong>Bank:</strong> ${AGENCY_BANK.name}</div>
            <div><strong>Account:</strong> ${AGENCY_BANK.account}</div>
            <div><strong>IFSC:</strong> ${AGENCY_BANK.ifsc}</div>
            <div><strong>Name:</strong> ${AGENCY_BANK.holder}</div>
          </div>
          <div class="form-group"><label>Your Transaction Reference / UTR</label><input type="text" id="pay-utr" placeholder="Enter UTR number after transfer" /></div>
          <button class="btn btn-customer btn-block" onclick="GAMS.confirmPayment()"><i class="fa-solid fa-paper-plane"></i> Confirm Bank Transfer</button>
        </div>`;
      default: return '';
    }
  }

  function selectPayMethod(id) {
    paymentCtx.method = id;
    renderPaymentModal();
  }

  function selectBank(el) {
    document.querySelectorAll('.bank-option').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
  }

  function selectWallet(el) {
    document.querySelectorAll('.wallet-chip').forEach(w => w.classList.remove('selected'));
    el.classList.add('selected');
  }

  function confirmPayment() {
    if (!paymentCtx.method) return toast('Please select a payment method', true);
    const method = paymentCtx.method;

    if (method === 'card') {
      const num = document.getElementById('pay-card-num')?.value.replace(/\s/g, '');
      if (!num || num.length < 15) return toast('Enter a valid card number', true);
    }
    if (method === 'bank_transfer') {
      const utr = document.getElementById('pay-utr')?.value.trim();
      if (!utr) return toast('Enter transaction reference / UTR', true);
    }

    const txnId = method === 'cod' ? 'COD-' + Date.now() : genTxnId();
    paymentCtx.transactionId = txnId;

    if (paymentCtx.type === 'bill') {
      const bill = data.bills.find(b => b.id === paymentCtx.billId);
      if (bill) {
        bill.paymentMethod = method;
        bill.transactionId = txnId;
        if (method === 'cod') {
          bill.paid = false;
          bill.paymentStatus = 'pay_on_delivery';
        } else {
          bill.paid = true;
          bill.paymentStatus = 'completed';
          bill.paidDate = today();
        }
      }
    } else if (paymentCtx.type === 'booking') {
      const p = paymentCtx.bookingPayload;
      const stock = data.cylinders.find(s => s.type === p.type);
      data.bookings.push({
        id: data.nextIds.booking++,
        customerId: getCustomer().id,
        type: p.type,
        quantity: p.quantity,
        bookingDate: today(),
        status: 0,
        source: 'online',
        paymentMethod: method,
        paymentStatus: method === 'cod' ? 'pay_on_delivery' : 'prepaid',
        transactionId: txnId,
        amount: paymentCtx.amount,
        trackingStatus: 'confirmed',
      });
      if (stock) stock.filled -= p.quantity;
    }

    if (!data.payments) data.payments = [];
    if (!data.nextIds.payment) data.nextIds.payment = 1;
    data.payments.push({
      id: data.nextIds.payment++,
      customerId: getCustomer()?.id,
      amount: paymentCtx.amount,
      method,
      transactionId: txnId,
      date: today(),
      type: paymentCtx.type,
      billId: paymentCtx.billId || null,
    });

    save(data);
    paymentCtx.step = 3;
    renderPaymentModal();
  }

  function closePaymentPortal() {
    closeModal();
    paymentCtx = { type: null, amount: 0, billId: null, bookingPayload: null, method: null, step: 1 };
  }

  function customerPayBill(billId) {
    const bill = data.bills.find(b => b.id === billId);
    if (!bill || bill.paid) return;
    openPaymentPortal({ type: 'bill', billId, amount: bill.amount });
  }

  function toggleFaq(idx) {
    document.querySelectorAll('.faq-item').forEach((el, i) => {
      el.classList.toggle('open', i === idx ? !el.classList.contains('open') : false);
    });
  }

  function getCustomer() {
    return data.customers.find(c => c.id === session.customerId && c.active !== false);
  }

  function findCustomerByUsername(username) {
    const u = username.trim().toLowerCase();
    return data.customers.find(
      c => c.active !== false && c.username && c.username.toLowerCase() === u
    );
  }

  function statusBadge(s) {
    const map = {
      0: ['<i class="fa-solid fa-clock"></i> Pending', 'badge-pending'],
      1: ['<i class="fa-solid fa-check"></i> Delivered', 'badge-delivered'],
      2: ['<i class="fa-solid fa-xmark"></i> Cancelled', 'badge-cancelled'],
    };
    const [l, c] = map[s] || ['Unknown', ''];
    return `<span class="badge ${c}">${l}</span>`;
  }

  function pageHero(page) {
    const m = PAGE_META[page];
    return `<div class="page-hero fade-in">
      <img class="page-hero-img" src="${m.hero}" alt="" onerror="this.style.display='none'" />
      <div class="page-hero-overlay"></div>
      <i class="fa-solid ${m.icon} page-hero-icon"></i>
      <div class="page-hero-content">
        <h2>${m.title}</h2>
        <p>${m.subtitle}</p>
      </div>
    </div>`;
  }

  function setPageBg(page) {
    const el = document.getElementById('page-bg');
    if (el) el.style.backgroundImage = `url('${PAGE_META[page].bg}')`;
  }

  function toast(msg, isError = false) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast' + (isError ? ' error' : '');
    setTimeout(() => el.classList.add('hidden'), 3200);
  }

  function showModal(html) {
    getModalContent()?.classList.remove('payment-modal');
    getModalBody().innerHTML = html;
    document.getElementById('modal').classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    getModalContent()?.classList.remove('payment-modal');
    if (paymentCtx.step === 3) {
      if (paymentCtx.type === 'booking') customerNav('cbookings');
      else if (session.role === 'customer') customerNav('cpay');
      paymentCtx = { type: null, amount: 0, billId: null, bookingPayload: null, method: null, step: 1 };
    }
  }

  function getStats() {
    const active = data.customers.filter(c => c.active !== false).length;
    let filled = 0, empty = 0, pending = 0, delivered = 0, cancelled = 0;
    let revenue = 0, pendingAmt = 0, paid = 0, unpaid = 0;
    data.cylinders.forEach(c => { filled += c.filled; empty += c.empty; });
    data.bookings.forEach(b => {
      if (b.status === 0) pending++;
      else if (b.status === 1) delivered++;
      else cancelled++;
    });
    data.bills.forEach(b => {
      if (b.paid) { revenue += b.amount; paid++; }
      else { pendingAmt += b.amount; unpaid++; }
    });
    return { active, filled, empty, pending, delivered, cancelled, revenue, pendingAmt, paid, unpaid };
  }

  function renderDashboard() {
    const s = getStats();
    const openComplaints = (data.complaints || []).filter(x => x.status !== 'resolved');
    const complaintsHtml = openComplaints.length ? openComplaints.slice(0, 5).map(x => `
      <div class="complaint-card fade-in" style="margin-bottom:10px">
        <div class="complaint-id">#${x.id} · ${x.customerName || 'Customer'} · ${x.date}</div>
        <div class="complaint-subject">${x.subject}</div>
        <div class="complaint-meta">${x.message}</div>
        <button class="btn btn-sm btn-green" style="margin-top:10px" onclick="GAMS.resolveComplaint(${x.id})">
          <i class="fa-solid fa-check"></i> Mark Resolved
        </button>
      </div>`).join('') : '<p style="text-align:center;color:var(--muted);font-size:13px;padding:12px">No open complaints</p>';

    document.getElementById('content').innerHTML = `
      ${pageHero('dashboard')}
      <div class="hero-banner fade-in">
        <h2>Welcome back, Admin!</h2>
        <p class="agency-line"><i class="fa-solid fa-building"></i> ${AGENCY_NAME}</p>
        <p class="admin-line"><i class="fa-regular fa-circle-user"></i> ${ADMIN_USER}</p>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="label"><i class="fa-solid fa-indian-rupee-sign"></i> Total Revenue</div>
            <div class="value">₹${s.revenue.toLocaleString('en-IN')}</div>
          </div>
          <div class="hero-stat">
            <div class="label"><i class="fa-solid fa-hourglass-half"></i> Pending Collection</div>
            <div class="value">₹${s.pendingAmt.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>
      <div class="section-title">Key Metrics</div>
      <div class="stat-grid">
        <div class="stat-card c-blue fade-in">
          <div class="stat-icon"><i class="fa-solid fa-users"></i></div>
          <div class="value">${s.active}</div>
          <div class="label">Active Customers</div>
        </div>
        <div class="stat-card c-orange fade-in">
          <div class="stat-icon"><i class="fa-solid fa-fire-flame-simple"></i></div>
          <div class="value">${s.filled}</div>
          <div class="label">Filled Cylinders</div>
        </div>
        <div class="stat-card c-green fade-in">
          <div class="stat-icon"><i class="fa-solid fa-recycle"></i></div>
          <div class="value">${s.empty}</div>
          <div class="label">Empty Returned</div>
        </div>
        <div class="stat-card c-amber fade-in">
          <div class="stat-icon"><i class="fa-solid fa-clock"></i></div>
          <div class="value">${s.pending}</div>
          <div class="label">Pending Orders</div>
        </div>
      </div>
      <div class="section-title">Operations Summary</div>
      <div class="card detail-card fade-in">
        <div class="detail-row"><span><i class="fa-solid fa-truck" style="color:var(--green);margin-right:8px"></i>Delivered Bookings</span><strong style="color:var(--green)">${s.delivered}</strong></div>
        <div class="detail-row"><span><i class="fa-solid fa-ban" style="color:var(--red);margin-right:8px"></i>Cancelled Bookings</span><strong style="color:var(--red)">${s.cancelled}</strong></div>
        <div class="detail-row"><span><i class="fa-solid fa-circle-check" style="color:var(--green);margin-right:8px"></i>Paid Bills</span><strong style="color:var(--green)">${s.paid}</strong></div>
        <div class="detail-row"><span><i class="fa-solid fa-circle-exclamation" style="color:var(--red);margin-right:8px"></i>Unpaid Bills</span><strong style="color:var(--red)">${s.unpaid}</strong></div>
        <div class="detail-row"><span><i class="fa-solid fa-headset" style="color:var(--amber);margin-right:8px"></i>Pending Complaints</span><strong style="color:var(--amber)">${openComplaints.length}</strong></div>
      </div>
      <div class="section-title">Open Complaints</div>
      <div class="card fade-in">${complaintsHtml}</div>
      <div class="section-title">Admin Settings</div>
      <div class="card fade-in">
        <div class="profile-detail"><i class="fa-solid fa-user-shield"></i><div><small style="color:var(--muted)">Logged in as</small><br>${ADMIN_USER}</div></div>
        <button class="btn btn-outline btn-block" style="margin-top:12px" onclick="GAMS.showChangePassword()">
          <i class="fa-solid fa-key"></i> Change Admin Password
        </button>
        <p style="font-size:11px;color:var(--muted);margin-top:10px;text-align:center">
          <i class="fa-solid fa-shield-halved"></i> Forgot password recovery code: <strong>${getAdminRecoveryCode()}</strong>
        </p>
      </div>`;
  }

  function showChangePassword() {
    showModal(`<h2><i class="fa-solid fa-key" style="color:var(--primary);margin-right:8px"></i>Change Admin Password</h2>
      <div class="form-group"><label>Current Password</label><input type="password" id="pw-current" placeholder="Enter current password" /></div>
      <div class="form-group"><label>New Password</label><input type="password" id="pw-new" placeholder="At least 4 characters" /></div>
      <div class="form-group"><label>Confirm New Password</label><input type="password" id="pw-confirm" placeholder="Re-enter new password" /></div>
      <button class="btn btn-primary btn-block" onclick="GAMS.saveAdminPassword()"><i class="fa-solid fa-check"></i> Update Password</button>`);
  }

  function saveAdminPassword() {
    const current = document.getElementById('pw-current')?.value || '';
    const newPw = document.getElementById('pw-new')?.value || '';
    const confirm = document.getElementById('pw-confirm')?.value || '';
    if (newPw.length < 4) return toast('New password must be at least 4 characters', true);
    if (newPw !== confirm) return toast('New passwords do not match', true);
    if (API.isApiMode()) {
      API.changeAdminPassword(current, newPw)
        .then(() => { closeModal(); toast('Admin password updated successfully'); })
        .catch(err => toast(err.message, true));
      return;
    }
    const expectedCurrent = data.settings?.adminPassword || 'Bhambu2006';
    if (current !== expectedCurrent) {
      return toast('Current password is incorrect', true);
    }
    if (!data.settings) data.settings = {};
    data.settings.adminPassword = newPw;
    save(data);
    closeModal();
    toast('Admin password updated successfully');
  }

  function resolveComplaint(id) {
    const c = data.complaints.find(x => x.id === id);
    if (!c) return;
    c.status = 'resolved';
    save(data);
    toast('Complaint marked as resolved');
    nav('dashboard');
  }

  function renderCustomers() {
    const list = data.customers.filter(c => c.active !== false);
    const items = list.length ? list.map(c => `
      <div class="customer-card">
        <div class="avatar">${c.name[0]?.toUpperCase() || '?'}</div>
        <div class="list-info">
          <div class="name">${c.name}</div>
          <div class="sub"><i class="fa-solid fa-phone"></i> ${c.phone}<br><i class="fa-solid fa-location-dot"></i> ${c.address}${c.username ? `<br><i class="fa-solid fa-at"></i> Portal: <strong>${c.username}</strong>` : ''}</div>
        </div>
        <div class="card-actions">
          <button class="btn btn-sm btn-outline" onclick="GAMS.editCustomer(${c.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-sm btn-red" onclick="GAMS.deleteCustomer(${c.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>`).join('') : `<div class="empty-state">
        <img class="empty-img" src="${PAGE_META.customers.hero}" alt="" />
        <p>No customers registered yet</p>
        <p style="font-size:13px;margin-top:8px">Add your first customer to get started</p>
      </div>`;

    document.getElementById('content').innerHTML = `
      ${pageHero('customers')}
      <div class="card fade-in">${items}</div>
      <button class="fab" onclick="GAMS.addCustomer()"><i class="fa-solid fa-user-plus"></i> Add Customer</button>`;
  }

  function renderInventory() {
    const cards = data.cylinders.map(c => `
      <div class="card cylinder-card fade-in">
        <div class="cylinder-img-wrap">
          <img src="${CYLINDER_IMG[c.type]}" alt="${typeLabel(c.type)}" onerror="this.parentElement.innerHTML='<i class=\\'fa-solid fa-fire-flame-simple\\' style=\\'font-size:36px;color:var(--primary)\\'></i>'" />
        </div>
        <div class="cylinder-info">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span class="type-tag ${typeClass(c.type)}"><i class="fa-solid fa-fire-flame-simple"></i> ${typeLabel(c.type)}</span>
            <span class="price-tag">₹${c.price}</span>
          </div>
          <div class="stock-row">
            <div class="mini-stat filled"><div class="val">${c.filled}</div><div class="lbl"><i class="fa-solid fa-check"></i> Filled</div></div>
            <div class="mini-stat empty"><div class="val">${c.empty}</div><div class="lbl"><i class="fa-solid fa-recycle"></i> Empty</div></div>
          </div>
          <button class="btn btn-outline btn-block" onclick="GAMS.updateStock(${c.type})">
            <i class="fa-solid fa-pen-to-square"></i> Update Stock / Price
          </button>
        </div>
      </div>`).join('');

    document.getElementById('content').innerHTML = `${pageHero('inventory')}${cards}`;
  }

  function renderBookings() {
    const list = [...data.bookings].reverse();
    const items = list.length ? list.map(b => {
      const cust = data.customers.find(c => c.id === b.customerId);
      const stock = data.cylinders.find(c => c.type === b.type);
      const amt = stock ? stock.price * b.quantity : 0;
      const actions = b.status === 0 ? `
        <div class="booking-actions">
          <button class="btn btn-sm btn-outline" onclick="GAMS.cancelBooking(${b.id})"><i class="fa-solid fa-xmark"></i> Cancel</button>
          <button class="btn btn-sm btn-green" onclick="GAMS.deliverBooking(${b.id})"><i class="fa-solid fa-truck"></i> Deliver</button>
        </div>` : '';
      return `<div class="card booking-card fade-in">
        <div class="booking-header">
          <span class="booking-id"><i class="fa-solid fa-hashtag"></i> ${b.id}</span>
          ${statusBadge(b.status)}
        </div>
        ${orderTrackerHtml(b)}
        <div class="list-info">
          <div class="name"><i class="fa-regular fa-user"></i> ${cust?.name || 'Unknown'}</div>
          <div class="booking-meta">
            <span><i class="fa-solid fa-fire-flame-simple"></i> ${typeLabel(b.type)} × ${b.quantity}</span>
            <span><i class="fa-solid fa-indian-rupee-sign"></i> ₹${amt.toLocaleString('en-IN')}</span>
            <span><i class="fa-regular fa-calendar"></i> ${b.bookingDate}</span>
            ${b.source === 'online' ? '<span><i class="fa-solid fa-globe"></i> Online</span>' : ''}
            ${b.paymentMethod ? `<span><i class="fa-solid fa-wallet"></i> ${paymentMethodLabel(b.paymentMethod)}</span>` : ''}
          </div>
        </div>${actions}
      </div>`;
    }).join('') : `<div class="empty-state">
      <i class="fa-solid fa-calendar-xmark empty-icon"></i>
      <p>No bookings yet</p>
    </div>`;

    document.getElementById('content').innerHTML = `
      ${pageHero('bookings')}${items}
      <button class="fab" onclick="GAMS.createBooking()"><i class="fa-solid fa-plus"></i> New Booking</button>`;
  }

  function renderBilling() {
    const s = getStats();
    const list = [...data.bills].reverse();
    const items = list.length ? list.map(b => {
      const cust = data.customers.find(c => c.id === b.customerId);
      return `<div class="card bill-card fade-in">
        <div class="bill-icon ${b.paid ? 'paid' : 'unpaid'}">
          <i class="fa-solid ${b.paid ? 'fa-circle-check' : 'fa-clock'}"></i>
        </div>
        <div class="list-info">
          <div class="name">Bill #${b.id}</div>
          <div class="sub">${cust?.name || 'Unknown'} · Booking #${b.bookingId} · ${b.billDate}${b.paymentMethod ? ' · ' + paymentMethodLabel(b.paymentMethod) : ''}</div>
        </div>
        <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:6px">
          <strong style="font-size:18px">₹${b.amount.toLocaleString('en-IN')}</strong>
          <span class="badge ${b.paid ? 'badge-paid' : b.paymentStatus === 'pay_on_delivery' ? 'badge-pending' : 'badge-unpaid'}">${b.paid ? 'Paid' : b.paymentStatus === 'pay_on_delivery' ? 'COD' : 'Unpaid'}</span>
          ${b.paid ? `<button class="btn btn-sm btn-outline" onclick="event.stopPropagation();GAMS.printInvoice(${b.id})"><i class="fa-solid fa-file-pdf"></i> GST Bill</button>` : `<button class="btn btn-sm btn-green" onclick="event.stopPropagation();GAMS.payBill(${b.id})"><i class="fa-solid fa-wallet"></i> Mark Paid</button>`}
        </div>
      </div>`;
    }).join('') : `<div class="empty-state">
      <i class="fa-solid fa-file-invoice empty-icon"></i>
      <p>No bills generated yet</p>
    </div>`;

    document.getElementById('content').innerHTML = `
      ${pageHero('billing')}
      <div class="revenue-row fade-in">
        <div class="revenue-card collected">
          <div class="rev-label"><i class="fa-solid fa-arrow-trend-up"></i> Collected</div>
          <div class="rev-value">₹${s.revenue.toLocaleString('en-IN')}</div>
        </div>
        <div class="revenue-card pending">
          <div class="rev-label"><i class="fa-solid fa-hourglass"></i> Pending</div>
          <div class="rev-value">₹${s.pendingAmt.toLocaleString('en-IN')}</div>
        </div>
      </div>
      <button class="btn btn-outline btn-block fade-in" style="margin-bottom:16px" onclick="GAMS.exportCsv()">
        <i class="fa-solid fa-download"></i> Export Bills Report (CSV)
      </button>
      <div class="section-title">All Invoices</div>
      ${items}`;
  }

  function renderDelivery() {
    const pending = data.bookings.filter(b => b.status === 0);
    const items = pending.length ? pending.map(b => {
      const cust = data.customers.find(c => c.id === b.customerId);
      const stock = data.cylinders.find(c => c.type === b.type);
      const amt = stock ? stock.price * b.quantity : 0;
      const ts = getTrackingStatus(b);
      const dispatchBtn = ts === 'confirmed' ? `
        <button class="btn btn-outline btn-block" style="margin-bottom:10px" onclick="GAMS.dispatchBooking(${b.id})">
          <i class="fa-solid fa-truck-fast"></i> Mark Out for Delivery
        </button>` : '';
      return `<div class="card delivery-card fade-in">
        <img class="delivery-img" src="${PAGE_META.delivery.hero}" alt="" />
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <span class="booking-id">Booking #${b.id}</span>
            <div class="name" style="margin-top:6px"><i class="fa-regular fa-user"></i> ${cust?.name || 'Unknown'}</div>
          </div>
          <strong style="color:var(--primary);font-size:20px">₹${amt.toLocaleString('en-IN')}</strong>
        </div>
        ${orderTrackerHtml(b)}
        <div class="delivery-route">
          <div><i class="fa-solid fa-phone"></i> ${cust?.phone || '—'}</div>
          <div><i class="fa-solid fa-location-dot"></i> ${cust?.address || '—'}</div>
          <div><i class="fa-solid fa-fire-flame-simple"></i> ${typeLabel(b.type)} cylinder × ${b.quantity}</div>
          ${b.paymentMethod ? `<div><i class="fa-solid fa-wallet"></i> ${paymentMethodLabel(b.paymentMethod)}${b.paymentStatus === 'pay_on_delivery' ? ' — Collect cash on delivery' : ' — Prepaid'}</div>` : ''}
        </div>
        ${dispatchBtn}
        <button class="btn btn-primary btn-block" onclick="GAMS.deliverBooking(${b.id})">
          <i class="fa-solid fa-circle-check"></i> Confirm Delivery
        </button>
      </div>`;
    }).join('') : `<div class="empty-state">
      <img class="empty-img" src="${PAGE_META.delivery.hero}" alt="" />
      <p>All deliveries completed!</p>
      <p style="font-size:13px;margin-top:8px">No pending orders to dispatch</p>
    </div>`;

    document.getElementById('content').innerHTML = `${pageHero('delivery')}${items}`;
  }

  const pages = {
    dashboard: { title: 'Dashboard', render: renderDashboard },
    customers: { title: 'Customers', render: renderCustomers },
    inventory: { title: 'Inventory', render: renderInventory },
    bookings: { title: 'Bookings', render: renderBookings },
    billing: { title: 'Billing', render: renderBilling },
    delivery: { title: 'Delivery', render: renderDelivery },
  };

  function nav(page) {
    currentPage = page;
    document.getElementById('page-title').textContent = pages[page].title;
    document.querySelectorAll('.nav-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.page === page));
    setPageBg(page);
    pages[page].render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function login() { adminLogin(); }

  function switchLoginTab(tab) {
    document.querySelectorAll('.login-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.tab === tab));
    document.getElementById('admin-login-panel').classList.toggle('hidden', tab !== 'admin');
    document.getElementById('customer-login-panel').classList.toggle('hidden', tab !== 'customer');
    document.getElementById('register-panel').classList.add('hidden');
    document.getElementById('admin-forgot-panel').classList.add('hidden');
    document.getElementById('customer-forgot-panel').classList.add('hidden');
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('cust-login-error').classList.add('hidden');
    document.getElementById('admin-forgot-error')?.classList.add('hidden');
    document.getElementById('cust-forgot-error')?.classList.add('hidden');
  }

  function showAdminForgot() {
    document.getElementById('admin-login-panel').classList.add('hidden');
    document.getElementById('customer-login-panel').classList.add('hidden');
    document.getElementById('register-panel').classList.add('hidden');
    document.getElementById('customer-forgot-panel').classList.add('hidden');
    document.getElementById('admin-forgot-panel').classList.remove('hidden');
    document.getElementById('admin-forgot-error').classList.add('hidden');
  }

  function showCustomerForgot() {
    document.getElementById('admin-login-panel').classList.add('hidden');
    document.getElementById('customer-login-panel').classList.add('hidden');
    document.getElementById('register-panel').classList.add('hidden');
    document.getElementById('admin-forgot-panel').classList.add('hidden');
    document.getElementById('customer-forgot-panel').classList.remove('hidden');
    document.getElementById('cust-forgot-error').classList.add('hidden');
  }

  function hideForgotPassword(role) {
    document.getElementById('admin-forgot-panel').classList.add('hidden');
    document.getElementById('customer-forgot-panel').classList.add('hidden');
    if (role === 'admin') {
      document.getElementById('admin-login-panel').classList.remove('hidden');
    } else {
      document.getElementById('customer-login-panel').classList.remove('hidden');
    }
  }

  function resetAdminPassword() {
    const user = document.getElementById('admin-forgot-user')?.value.trim();
    const code = document.getElementById('admin-forgot-code')?.value.trim();
    const newPw = document.getElementById('admin-forgot-new')?.value || '';
    const confirm = document.getElementById('admin-forgot-confirm')?.value || '';
    const errEl = document.getElementById('admin-forgot-error');

    if (user.toLowerCase() !== ADMIN_USER.toLowerCase() && user.toLowerCase() !== 'admin') {
      errEl.textContent = 'Admin username does not match our records';
      errEl.classList.remove('hidden');
      return;
    }
    if (newPw.length < 4) {
      errEl.textContent = 'Password must be at least 4 characters';
      errEl.classList.remove('hidden');
      return;
    }
    if (newPw !== confirm) {
      errEl.textContent = 'Passwords do not match';
      errEl.classList.remove('hidden');
      return;
    }
    if (API.isApiMode()) {
      API.resetAdminPassword(user, code, newPw)
        .then(() => {
          toast('Admin password reset successfully! Please sign in.');
          hideForgotPassword('admin');
          document.getElementById('login-pass').value = '';
          errEl.classList.add('hidden');
          loginAttempts = 0;
          document.querySelector('#admin-login-btn').disabled = false;
        })
        .catch(err => {
          errEl.textContent = err.message;
          errEl.classList.remove('hidden');
        });
      return;
    }
    const validCode = data.settings?.adminRecoveryCode || DEFAULT_ADMIN_RECOVERY;
    if (code !== validCode) {
      errEl.textContent = 'Invalid recovery code';
      errEl.classList.remove('hidden');
      return;
    }
    if (!data.settings) data.settings = {};
    data.settings.adminPassword = newPw;
    save(data);
    toast('Admin password reset successfully! Please sign in.');
    hideForgotPassword('admin');
    document.getElementById('login-pass').value = '';
    errEl.classList.add('hidden');
    loginAttempts = 0;
    document.querySelector('#admin-login-btn').disabled = false;
  }

  function resetCustomerPassword() {
    const user = document.getElementById('cust-forgot-user')?.value.trim();
    const phone = document.getElementById('cust-forgot-phone')?.value.trim();
    const newPw = document.getElementById('cust-forgot-new')?.value || '';
    const confirm = document.getElementById('cust-forgot-confirm')?.value || '';
    const errEl = document.getElementById('cust-forgot-error');

    if (newPw.length < 4) {
      errEl.textContent = 'Password must be at least 4 characters';
      errEl.classList.remove('hidden');
      return;
    }
    if (newPw !== confirm) {
      errEl.textContent = 'Passwords do not match';
      errEl.classList.remove('hidden');
      return;
    }
    if (API.isApiMode()) {
      API.resetCustomerPassword(user, phone, newPw)
        .then(() => {
          toast('Password reset successfully! Please sign in.');
          hideForgotPassword('customer');
          document.getElementById('cust-login-user').value = user;
          document.getElementById('cust-login-pass').value = '';
          errEl.classList.add('hidden');
          custLoginAttempts = 0;
        })
        .catch(err => {
          errEl.textContent = err.message;
          errEl.classList.remove('hidden');
        });
      return;
    }
    const cust = data.customers.find(c => c.username && c.username.toLowerCase() === user.toLowerCase() && c.phone === phone);
    if (!cust) {
      errEl.textContent = 'No matching customer found with this username and phone';
      errEl.classList.remove('hidden');
      return;
    }
    cust.password = newPw;
    save(data);
    toast('Password reset successfully! Please sign in.');
    hideForgotPassword('customer');
    document.getElementById('cust-login-user').value = user;
    document.getElementById('cust-login-pass').value = '';
    errEl.classList.add('hidden');
    custLoginAttempts = 0;
  }

  function showRegister() {
    document.getElementById('admin-login-panel').classList.add('hidden');
    document.getElementById('customer-login-panel').classList.add('hidden');
    document.getElementById('admin-forgot-panel').classList.add('hidden');
    document.getElementById('customer-forgot-panel').classList.add('hidden');
    document.getElementById('register-panel').classList.remove('hidden');
    document.getElementById('register-error').classList.add('hidden');
  }

  function hideRegister() {
    document.getElementById('register-panel').classList.add('hidden');
    document.getElementById('customer-login-panel').classList.remove('hidden');
  }

  async function adminLogin() {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;
    const errEl = document.getElementById('login-error');
    if (!user || !pass) {
      errEl.textContent = 'Please enter username and password';
      errEl.classList.remove('hidden');
      return;
    }
    const serverUp = await API.checkHealth().catch(() => false);
    if (serverUp) {
      try {
        await API.adminLogin(user, pass);
        data = await API.loadData();
        session = { role: 'admin', customerId: null };
        saveSession();
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('main-screen').classList.add('active');
        document.getElementById('customer-screen').classList.remove('active');
        document.getElementById('admin-name').textContent = ADMIN_USER.split(' ')[0];
        nav('dashboard');
        errEl.classList.add('hidden');
        loginAttempts = 0;
        document.querySelector('#admin-login-btn').disabled = false;
        return;
      } catch (e) {
        API.setToken(null);
        loginAttempts++;
        if (loginAttempts >= 3) {
          errEl.textContent = 'Too many failed attempts. Refresh the page (F5) and try again.';
          errEl.classList.remove('hidden');
          document.querySelector('#admin-login-btn').disabled = true;
          return;
        }
        const hint = user.toLowerCase() === 'admin'
          ? 'Use username: Naveen Bishnoi (not "admin")'
          : 'Use: Naveen Bishnoi / Bhambu2006';
        errEl.textContent = e.message === 'Invalid credentials'
          ? `Invalid credentials. ${hint} (Attempt ${loginAttempts}/3)`
          : (e.message || `Login failed. ${hint}`);
        errEl.classList.remove('hidden');
        return;
      }
    }

    // Standalone 24/7 Web/Client Mode
    const expectedPass = data.settings?.adminPassword || 'Bhambu2006';
    const isUserValid = (user.toLowerCase() === ADMIN_USER.toLowerCase() || user.toLowerCase() === 'admin');
    if (isUserValid && pass === expectedPass) {
      API.setToken('gams-local-admin-' + Date.now());
      session = { role: 'admin', customerId: null };
      saveSession();
      document.getElementById('login-screen').classList.remove('active');
      document.getElementById('main-screen').classList.add('active');
      document.getElementById('customer-screen').classList.remove('active');
      document.getElementById('admin-name').textContent = ADMIN_USER.split(' ')[0];
      nav('dashboard');
      errEl.classList.add('hidden');
      loginAttempts = 0;
      document.querySelector('#admin-login-btn').disabled = false;
      return;
    }
    API.setToken(null);
    loginAttempts++;
    if (loginAttempts >= 3) {
      errEl.textContent = 'Too many failed attempts. Refresh the page (F5) and try again.';
      errEl.classList.remove('hidden');
      document.querySelector('#admin-login-btn').disabled = true;
      return;
    }
    const hint = user.toLowerCase() === 'admin'
      ? 'Use username: Naveen Bishnoi (not "admin")'
      : 'Use: Naveen Bishnoi / Bhambu2006';
    errEl.textContent = `Invalid credentials. ${hint} (Attempt ${loginAttempts}/3)`;
    errEl.classList.remove('hidden');
  }

  async function customerLogin() {
    const user = document.getElementById('cust-login-user').value.trim();
    const pass = document.getElementById('cust-login-pass').value;
    const errEl = document.getElementById('cust-login-error');
    if (!user || !pass) {
      errEl.textContent = 'Please enter username and password';
      errEl.classList.remove('hidden');
      return;
    }
    const serverUp = await API.checkHealth().catch(() => false);
    if (serverUp) {
      try {
        const result = await API.customerLogin(user, pass);
        session = { role: 'customer', customerId: result.customer.id };
        data = await API.loadData();
        saveSession();
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('main-screen').classList.remove('active');
        document.getElementById('customer-screen').classList.add('active');
        document.getElementById('customer-name-chip').textContent = result.customer.name.split(' ')[0];
        customerNav('chome');
        updateHelplineStrip();
        errEl.classList.add('hidden');
        custLoginAttempts = 0;
        return;
      } catch (e) {
        API.setToken(null);
        custLoginAttempts++;
        if (custLoginAttempts >= 3) {
          errEl.textContent = 'Too many failed attempts. Refresh the page (F5) and try again.';
          errEl.classList.remove('hidden');
          return;
        }
        errEl.textContent = e.message === 'Invalid username or password'
          ? `Invalid username or password. Try: customer / Bhambu2006 (Attempt ${custLoginAttempts}/3)`
          : (e.message || `Login failed. Attempt ${custLoginAttempts}/3`);
        errEl.classList.remove('hidden');
        return;
      }
    }

    // Standalone 24/7 Web/Client Mode
    const cust = data.customers.find(c => c.username && c.username.toLowerCase() === user.toLowerCase() && c.active !== false);
    const expectedPass = cust?.password || 'Bhambu2006';
    if (cust && pass === expectedPass) {
      API.setToken('gams-local-cust-' + cust.id);
      session = { role: 'customer', customerId: cust.id };
      saveSession();
      document.getElementById('login-screen').classList.remove('active');
      document.getElementById('main-screen').classList.remove('active');
      document.getElementById('customer-screen').classList.add('active');
      document.getElementById('customer-name-chip').textContent = cust.name.split(' ')[0];
      customerNav('chome');
      updateHelplineStrip();
      errEl.classList.add('hidden');
      custLoginAttempts = 0;
      return;
    }
    API.setToken(null);
    custLoginAttempts++;
    if (custLoginAttempts >= 3) {
      errEl.textContent = 'Too many failed attempts. Refresh the page (F5) and try again.';
      errEl.classList.remove('hidden');
      return;
    }
    errEl.textContent = `Invalid username or password. Try: customer / Bhambu2006 (Attempt ${custLoginAttempts}/3)`;
    errEl.classList.remove('hidden');
  }

  async function registerAccount() {
    const name = document.getElementById('reg-name').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const phone = document.getElementById('reg-phone').value.trim();
    const address = document.getElementById('reg-address').value.trim();
    const errEl = document.getElementById('register-error');

    function showRegError(msg) {
      errEl.textContent = msg;
      errEl.classList.remove('hidden');
    }

    if (!name || !username || !password || !address)
      return showRegError('Please fill all required fields');
    if (!/^\d{10}$/.test(phone)) return showRegError('Phone must be exactly 10 digits');
    if (username.length < 3) return showRegError('Username must be at least 3 characters');
    if (password.length < 4) return showRegError('Password must be at least 4 characters');
    if (findCustomerByUsername(username)) return showRegError('Username already taken');
    if (username.toLowerCase() === ADMIN_USER.toLowerCase() || username.toLowerCase() === 'admin')
      return showRegError('This username is reserved');

    const serverUp = await API.checkHealth().catch(() => false);
    if (serverUp) {
      try {
        await API.registerCustomer({ name, username, password, phone, address });
        toast('Account created! Please sign in.');
        hideRegister();
        document.getElementById('cust-login-user').value = username;
        document.getElementById('cust-login-pass').value = '';
        errEl.classList.add('hidden');
        return;
      } catch (e) {
        return showRegError(e.message);
      }
    }

    // Standalone 24/7 Web/Client Mode
    const id = data.nextIds.customer++;
    const newCust = {
      id,
      name,
      username,
      password,
      phone,
      address,
      active: true,
      registeredAt: today(),
    };
    data.customers.push(newCust);
    save(data);
    toast('Account created! Please sign in.');
    hideRegister();
    document.getElementById('cust-login-user').value = username;
    document.getElementById('cust-login-pass').value = '';
    errEl.classList.add('hidden');
  }

  function logout() {
    session = { role: null, customerId: null };
    API.setToken(null);
    saveSession();
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('customer-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    updateHelplineStrip();
    loginAttempts = 0;
    custLoginAttempts = 0;
    switchLoginTab('admin');
  }

  function customerLogout() { logout(); switchLoginTab('customer'); }

  function customerPageHero(page) {
    const m = CUSTOMER_PAGE_META[page];
    return `<div class="page-hero fade-in">
      <img class="page-hero-img" src="${m.hero}" alt="" onerror="this.style.display='none'" />
      <div class="page-hero-overlay"></div>
      <div class="page-hero-content">
        <h2>${m.title}</h2>
        <p>${AGENCY_NAME} — Online Portal</p>
      </div>
    </div>`;
  }

  function setCustomerPageBg(page) {
    const el = document.getElementById('customer-page-bg');
    if (el) el.style.backgroundImage = `url('${CUSTOMER_PAGE_META[page].bg}')`;
  }

  function renderCustomerHome() {
    const c = getCustomer();
    if (!c) return;
    const myBookings = data.bookings.filter(b => b.customerId === c.id);
    const pending = myBookings.filter(b => b.status === 0).length;
    const delivered = myBookings.filter(b => b.status === 1).length;
    const myBills = data.bills.filter(b => b.customerId === c.id);
    const unpaid = myBills.filter(b => !b.paid).length;

    document.getElementById('customer-content').innerHTML = `
      ${customerPageHero('chome')}
      ${emergencyCardHtml()}
      <div class="office-hours-bar"><i class="fa-regular fa-clock"></i> <strong>${SUPPORT.officeHours}</strong> · Complaint: <strong><a href="tel:${SUPPORT.complaintHotline}" style="color:var(--red)">${SUPPORT.complaintHotline}</a></strong></div>
      <div class="hero-banner fade-in" style="background:linear-gradient(135deg,#1B7A4E,#14532d)">
        <h2>Hello, ${c.name.split(' ')[0]}!</h2>
        <p class="agency-line"><i class="fa-solid fa-fire-flame-simple"></i> ${AGENCY_NAME}</p>
        <p class="admin-line"><i class="fa-solid fa-truck"></i> Your trusted LPG partner</p>
        <div class="hero-stats">
          <div class="hero-stat"><div class="label">Pending Orders</div><div class="value">${pending}</div></div>
          <div class="hero-stat"><div class="label">Delivered</div><div class="value">${delivered}</div></div>
        </div>
      </div>
      <div class="section-title">Today's Cylinder Prices</div>
      ${priceSnapshotHtml()}
      <div class="section-title">Quick Actions</div>
      <div class="stat-grid">
        <div class="stat-card c-green fade-in" style="cursor:pointer" onclick="GAMS.customerNav('cbook')">
          <div class="stat-icon"><i class="fa-solid fa-cart-plus"></i></div>
          <div class="value" style="font-size:16px">Book Now</div>
          <div class="label">Order LPG online</div>
        </div>
        <div class="stat-card c-blue fade-in" style="cursor:pointer" onclick="GAMS.customerNav('cprices')">
          <div class="stat-icon"><i class="fa-solid fa-tags"></i></div>
          <div class="value" style="font-size:16px">Price List</div>
          <div class="label">All cylinder rates</div>
        </div>
        <div class="stat-card c-amber fade-in" style="cursor:pointer" onclick="GAMS.customerNav('cservices')">
          <div class="stat-icon"><i class="fa-solid fa-handshake"></i></div>
          <div class="value" style="font-size:16px">Services</div>
          <div class="label">12+ agency services</div>
        </div>
        <div class="stat-card c-orange fade-in" style="cursor:pointer" onclick="GAMS.customerNav('csupport')">
          <div class="stat-icon"><i class="fa-solid fa-headset"></i></div>
          <div class="value" style="font-size:16px">Support</div>
          <div class="label">Complaints & help</div>
        </div>
        <div class="stat-card c-blue fade-in" style="cursor:pointer" onclick="GAMS.customerNav('cbookings')">
          <div class="stat-icon"><i class="fa-solid fa-list-check"></i></div>
          <div class="value" style="font-size:16px">Orders</div>
          <div class="label">${myBookings.length} bookings</div>
        </div>
        <div class="stat-card c-amber fade-in" style="cursor:pointer" onclick="GAMS.customerNav('cpay')">
          <div class="stat-icon"><i class="fa-solid fa-wallet"></i></div>
          <div class="value" style="font-size:16px">Pay Now</div>
          <div class="label">${unpaid} unpaid · Payment portal</div>
        </div>
      </div>`;
  }

  let selectedCylinderType = 14;

  function renderCustomerBook() {
    const cards = data.cylinders.map(cyl => `
      <div class="cylinder-select-card ${selectedCylinderType === cyl.type ? 'selected' : ''}"
           onclick="GAMS.selectCylinder(${cyl.type})">
        <img src="${CYLINDER_IMG[cyl.type]}" alt="${typeLabel(cyl.type)}" />
        <div>
          <span class="type-tag ${typeClass(cyl.type)}">${typeLabel(cyl.type)}</span>
          <p style="font-size:12px;color:var(--muted);margin-top:6px">
            ${cyl.filled > 0 ? `<i class="fa-solid fa-check" style="color:var(--green)"></i> In stock` : '<i class="fa-solid fa-xmark" style="color:var(--red)"></i> Out of stock'}
          </p>
        </div>
        <strong style="font-size:20px;color:var(--navy)">₹${cyl.price}</strong>
      </div>`).join('');

    const stock = data.cylinders.find(c => c.type === selectedCylinderType);
    const maxQty = stock ? stock.filled : 0;

    document.getElementById('customer-content').innerHTML = `
      ${customerPageHero('cbook')}
      <div class="section-title">Select Cylinder Type</div>
      ${cards}
      <div class="card fade-in">
        <div class="form-group">
          <label><i class="fa-solid fa-hashtag"></i> Quantity</label>
          <input type="number" id="online-qty" value="1" min="1" max="${maxQty || 1}" />
        </div>
        <p style="font-size:13px;color:var(--muted);margin-bottom:16px">
          <i class="fa-solid fa-info-circle"></i>
          Estimated: <strong>₹${stock ? (stock.price * 1).toLocaleString('en-IN') : 0}</strong> per cylinder
          · Delivery to: <strong>${getCustomer()?.address || '—'}</strong>
        </p>
        <button class="btn btn-customer btn-block" onclick="GAMS.proceedToPayment()" ${maxQty < 1 ? 'disabled style="opacity:0.5"' : ''}>
          <i class="fa-solid fa-wallet"></i> Proceed to Payment
        </button>
      </div>`;
  }

  function selectCylinder(type) {
    selectedCylinderType = type;
    renderCustomerBook();
  }

  function proceedToPayment() {
    const c = getCustomer();
    if (!c) return;
    const type = selectedCylinderType;
    const qty = parseInt(document.getElementById('online-qty')?.value) || 1;
    const stock = data.cylinders.find(s => s.type === type);
    if (!stock || stock.filled < qty)
      return toast('Selected cylinder is out of stock', true);
    const amount = stock.price * qty;
    openPaymentPortal({
      type: 'booking',
      amount,
      bookingPayload: { type, quantity: qty },
    });
  }

  function placeOnlineBooking() { proceedToPayment(); }

  function renderCustomerBookings() {
    const c = getCustomer();
    if (!c) return;
    const list = data.bookings.filter(b => b.customerId === c.id).reverse();
    const items = list.length ? list.map(b => {
      const stock = data.cylinders.find(s => s.type === b.type);
      const amt = stock ? stock.price * b.quantity : 0;
      const cancelBtn = b.status === 0 ? `
        <button class="btn btn-sm btn-outline" style="margin-top:12px" onclick="GAMS.customerCancelBooking(${b.id})">
          <i class="fa-solid fa-xmark"></i> Cancel Order
        </button>` : '';
      return `<div class="card booking-card fade-in">
        <div class="booking-header">
          <span class="booking-id">Order #${b.id}</span>
          ${statusBadge(b.status)}
        </div>
        ${orderTrackerHtml(b)}
        <div class="booking-meta">
          <span><i class="fa-solid fa-fire-flame-simple"></i> ${typeLabel(b.type)} × ${b.quantity}</span>
          <span><i class="fa-solid fa-indian-rupee-sign"></i> ₹${amt.toLocaleString('en-IN')}</span>
          <span><i class="fa-regular fa-calendar"></i> ${b.bookingDate}</span>
          ${b.source === 'online' ? '<span><i class="fa-solid fa-globe"></i> Online</span>' : ''}
          ${b.paymentMethod ? `<span><i class="fa-solid fa-wallet"></i> ${paymentMethodLabel(b.paymentMethod)}${b.paymentStatus === 'pay_on_delivery' ? ' (COD)' : ''}</span>` : ''}
        </div>${cancelBtn}
      </div>`;
    }).join('') : `<div class="empty-state">
      <i class="fa-solid fa-calendar-xmark empty-icon"></i>
      <p>No orders yet</p>
      <button class="btn btn-customer" style="margin-top:16px" onclick="GAMS.customerNav('cbook')">Book a Cylinder</button>
    </div>`;

    document.getElementById('customer-content').innerHTML = `
      ${customerPageHero('cbookings')}${items}`;
  }

  function customerCancelBooking(id) {
    const c = getCustomer();
    const b = data.bookings.find(x => x.id === id);
    if (!b || b.customerId !== c?.id || b.status !== 0) return;
    if (!confirm('Cancel this order?')) return;
    b.status = 2;
    b.trackingStatus = 'cancelled';
    const stock = data.cylinders.find(s => s.type === b.type);
    if (stock) stock.filled += b.quantity;
    save(data);
    toast('Order cancelled');
    customerNav('cbookings');
  }

  function renderCustomerPay() {
    const c = getCustomer();
    if (!c) return;
    const unpaidBills = data.bills.filter(b => b.customerId === c.id && !b.paid);
    const paidBills = data.bills.filter(b => b.customerId === c.id && b.paid);
    const myPayments = (data.payments || []).filter(p => p.customerId === c.id).reverse();

    const unpaidHtml = unpaidBills.length ? unpaidBills.map(b => `
      <div class="card fade-in" style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div>
            <div style="font-weight:700;color:var(--navy)">Bill #${b.id}</div>
            <div style="font-size:12px;color:var(--muted)">Booking #${b.bookingId} · ${b.billDate}</div>
            ${b.paymentStatus === 'pay_on_delivery' ? '<span class="badge badge-pending" style="margin-top:6px"><i class="fa-solid fa-money-bill"></i> COD Selected</span>' : ''}
          </div>
          <strong style="font-size:22px;color:var(--navy)">₹${b.amount.toLocaleString('en-IN')}</strong>
        </div>
        <button class="btn btn-customer btn-block" onclick="GAMS.customerPayBill(${b.id})">
          <i class="fa-solid fa-wallet"></i> Pay ₹${b.amount.toLocaleString('en-IN')} Now
        </button>
        <button class="btn btn-outline btn-block" style="margin-top:8px" onclick="GAMS.printInvoice(${b.id})">
          <i class="fa-solid fa-file-pdf"></i> Download GST Bill PDF
        </button>
      </div>`).join('') : `<div class="empty-state" style="padding:24px"><i class="fa-solid fa-circle-check empty-icon" style="color:var(--green)"></i><p>All bills paid!</p></div>`;

    const paidHtml = paidBills.length ? paidBills.slice(0, 5).map(b => `
      <div class="payment-history-item">
        ${paymentMethodIcon(b.paymentMethod)}
        <div style="flex:1">
          <div style="font-weight:600;font-size:14px">Bill #${b.id} · ₹${b.amount.toLocaleString('en-IN')}</div>
          <div style="font-size:12px;color:var(--muted)">${paymentMethodLabel(b.paymentMethod)} · ${b.paidDate || b.billDate}</div>
        </div>
        <span class="badge badge-paid">Paid</span>
        <button class="btn btn-sm btn-outline" style="margin-left:8px" onclick="GAMS.printInvoice(${b.id})" title="GST Bill PDF"><i class="fa-solid fa-file-pdf"></i></button>
      </div>`).join('') : '';

    const txnHtml = myPayments.length ? myPayments.slice(0, 8).map(p => `
      <div class="payment-history-item">
        ${paymentMethodIcon(p.method)}
        <div style="flex:1">
          <div style="font-weight:600;font-size:14px">₹${p.amount.toLocaleString('en-IN')} · ${paymentMethodLabel(p.method)}</div>
          <div style="font-size:11px;color:var(--muted)">${p.transactionId} · ${p.date}</div>
        </div>
      </div>`).join('') : '<p style="text-align:center;color:var(--muted);font-size:13px;padding:12px">No transactions yet</p>';

    const methodsPreview = PAYMENT_METHODS.map(m => `
      <div style="text-align:center;padding:8px 4px">
        <div style="width:36px;height:36px;border-radius:10px;background:${m.color}15;color:${m.color};display:flex;align-items:center;justify-content:center;margin:0 auto 4px;font-size:16px"><i class="fa-solid ${m.icon}"></i></div>
        <div style="font-size:9px;font-weight:600;color:var(--muted)">${m.name}</div>
      </div>`).join('');

    document.getElementById('customer-content').innerHTML = `
      ${customerPageHero('cpay')}
      <div class="payment-amount-bar fade-in" style="margin-bottom:16px">
        <div class="pay-label">Total Pending</div>
        <div class="pay-amount">₹${unpaidBills.reduce((s, b) => s + b.amount, 0).toLocaleString('en-IN')}</div>
      </div>
      <div class="section-title">Accepted Payment Methods</div>
      <div class="card fade-in" style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:12px;margin-bottom:16px">${methodsPreview}</div>
      <div class="section-title">Unpaid Bills</div>
      ${unpaidHtml}
      <div class="section-title">Payment History</div>
      <div class="card fade-in">${txnHtml}</div>
      ${paidBills.length ? `<div class="section-title">Paid Invoices</div><div class="card fade-in">${paidHtml}</div>` : ''}
      <div class="secure-badge" style="margin:20px 0"><i class="fa-solid fa-shield-halved"></i> Secure payments · UPI ${AGENCY_UPI}</div>`;
  }

  function renderCustomerBills() { renderCustomerPay(); }

  function renderCustomerProfile() {
    const c = getCustomer();
    if (!c) return;
    const orders = data.bookings.filter(b => b.customerId === c.id).length;

    document.getElementById('customer-content').innerHTML = `
      ${customerPageHero('cprofile')}
      <div class="card profile-card fade-in">
        <div class="profile-avatar">${c.name[0]?.toUpperCase() || '?'}</div>
        <h2 style="font-size:20px;color:var(--navy)">${c.name}</h2>
        <p style="color:var(--muted);font-size:13px;margin-top:4px">@${c.username}</p>
        <p style="margin-top:12px;font-size:13px;color:var(--green)"><i class="fa-solid fa-check-circle"></i> ${orders} orders placed</p>
      </div>
      <div class="card fade-in">
        <div class="profile-detail"><i class="fa-solid fa-at"></i><div><small style="color:var(--muted)">Username</small><br>${c.username}</div></div>
        <div class="profile-detail"><i class="fa-solid fa-phone"></i><div><small style="color:var(--muted)">Phone</small><br>${c.phone}</div></div>
        <div class="profile-detail"><i class="fa-solid fa-location-dot"></i><div><small style="color:var(--muted)">Delivery Address</small><br>${c.address}</div></div>
        <div class="profile-detail"><i class="fa-solid fa-building"></i><div><small style="color:var(--muted)">Agency</small><br>${AGENCY_NAME}</div></div>
        <div class="profile-detail"><i class="fa-solid fa-headset"></i><div><small style="color:var(--muted)">Customer Care</small><br><a href="tel:${SUPPORT.customerCare}">${SUPPORT.customerCare}</a></div></div>
      </div>
      <button class="btn btn-outline btn-block" style="margin-top:12px" onclick="GAMS.customerNav('cpay')"><i class="fa-solid fa-wallet"></i> Payment Portal</button>`;
  }

  function renderCustomerPrices() {
    const cards = data.cylinders.map(cyl => {
      const info = CYLINDER_INFO[cyl.type];
      return `<div class="price-catalog-card fade-in">
        <div class="price-catalog-header">
          <img class="price-catalog-img" src="${CYLINDER_IMG[cyl.type]}" alt="${info.label}" />
          <div class="price-catalog-body">
            <span class="type-tag ${info.color}"><i class="fa-solid fa-fire-flame-simple"></i> ${info.label}</span>
            <p style="font-size:12px;color:var(--muted);margin:8px 0 4px">${info.use}</p>
            <div class="price-main">₹${cyl.price.toLocaleString('en-IN')}</div>
            <div class="price-sub">per cylinder refill · Govt. approved rate</div>
            <p style="font-size:12px;margin-top:8px;color:${cyl.filled > 0 ? 'var(--green)' : 'var(--red)'}">
              <i class="fa-solid fa-circle" style="font-size:8px"></i>
              ${cyl.filled > 0 ? `${cyl.filled} in stock — Available` : 'Currently out of stock'}
            </p>
          </div>
        </div>
        <div class="price-features">
          ${info.features.map(f => `<div class="price-feature"><i class="fa-solid fa-check"></i> ${f}</div>`).join('')}
        </div>
        <div style="padding:0 16px 16px">
          <button class="btn btn-customer btn-block" onclick="GAMS.selectCylinder(${cyl.type});GAMS.customerNav('cbook')" ${cyl.filled < 1 ? 'disabled style="opacity:0.5"' : ''}>
            <i class="fa-solid fa-cart-plus"></i> Book ${info.label} at ₹${cyl.price}
          </button>
        </div>
      </div>`;
    }).join('');

    document.getElementById('customer-content').innerHTML = `
      ${customerPageHero('cprices')}
      <div class="office-hours-bar"><i class="fa-solid fa-circle-info"></i> Prices updated live · Inclusive of refill charges · <strong>Last updated: ${today()}</strong></div>
      ${cards}
      <div class="card fade-in" style="text-align:center;padding:20px">
        <p style="font-size:13px;color:var(--muted)"><i class="fa-solid fa-phone"></i> Price enquiry: <a href="tel:${SUPPORT.customerCare}"><strong>${SUPPORT.customerCare}</strong></a></p>
      </div>`;
  }

  function renderCustomerServices() {
    const services = AGENCY_SERVICES.map(s => `
      <div class="service-card fade-in">
        <div class="svc-icon" style="background:${s.color}18;color:${s.color}"><i class="fa-solid ${s.icon}"></i></div>
        <div>
          <div class="svc-title">${s.title}</div>
          <div class="svc-desc">${s.desc}</div>
          <span class="svc-tag">${s.tag}</span>
        </div>
      </div>`).join('');

    document.getElementById('customer-content').innerHTML = `
      ${customerPageHero('cservices')}
      <div class="section-title">All Customer Services</div>
      <div class="service-grid">${services}</div>
      <div class="card fade-in" style="margin-top:16px;text-align:center">
        <p style="font-size:14px;font-weight:600;color:var(--navy);margin-bottom:8px">Need a service not listed?</p>
        <p style="font-size:13px;color:var(--muted);margin-bottom:14px">Call us or raise a complaint — we're here to help.</p>
        <button class="btn btn-customer" onclick="GAMS.customerNav('csupport')"><i class="fa-solid fa-headset"></i> Contact Support</button>
      </div>`;
  }

  function renderCustomerSupport() {
    const c = getCustomer();
    const myComplaints = data.complaints.filter(x => x.customerId === c?.id).reverse();
    const complaintHistory = myComplaints.length ? myComplaints.map(x => `
      <div class="complaint-card fade-in">
        <div class="complaint-id">Complaint #${x.id} · ${x.date}</div>
        <div class="complaint-subject">${x.subject}</div>
        <div class="complaint-meta">${x.message}</div>
        <span class="badge ${x.status === 'resolved' ? 'badge-delivered' : 'badge-pending'}" style="margin-top:8px">${x.status === 'resolved' ? 'Resolved' : 'Under Review'}</span>
      </div>`).join('') : '<p style="text-align:center;color:var(--muted);font-size:13px;padding:16px">No complaints filed yet</p>';

    const faqHtml = FAQ_LIST.map((f, i) => `
      <div class="faq-item" onclick="GAMS.toggleFaq(${i})">
        <div class="faq-q">${f.q} <i class="fa-solid fa-chevron-down"></i></div>
        <div class="faq-a">${f.a}</div>
      </div>`).join('');

    document.getElementById('customer-content').innerHTML = `
      ${customerPageHero('csupport')}
      ${emergencyCardHtml()}
      ${contactCardsHtml()}
      <div class="section-title">File a Complaint</div>
      <div class="card fade-in">
        <p style="font-size:13px;color:var(--muted);margin-bottom:14px">
          <i class="fa-solid fa-phone-volume" style="color:var(--red)"></i>
          Or call complaint hotline: <a href="tel:${SUPPORT.complaintHotline}" style="font-weight:700;color:var(--red)">${SUPPORT.complaintHotline}</a>
        </p>
        <div class="form-group">
          <label><i class="fa-solid fa-heading"></i> Subject</label>
          <select id="complaint-subject">
            <option value="Late Delivery">Late Delivery</option>
            <option value="Wrong Cylinder">Wrong Cylinder</option>
            <option value="Billing Issue">Billing Issue</option>
            <option value="Staff Behaviour">Staff Behaviour</option>
            <option value="Gas Leak / Safety">Gas Leak / Safety</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label><i class="fa-solid fa-message"></i> Describe your issue</label>
          <textarea id="complaint-msg" rows="3" placeholder="Please describe your complaint in detail..."></textarea>
        </div>
        <button class="btn btn-customer btn-block" onclick="GAMS.submitComplaint()"><i class="fa-solid fa-paper-plane"></i> Submit Complaint</button>
      </div>
      <div class="section-title">My Complaints</div>
      ${complaintHistory}
      <div class="section-title">Safety Tips</div>
      <div class="safety-tips fade-in">
        <h4><i class="fa-solid fa-shield-halved"></i> LPG Safety Guidelines</h4>
        <ul>
          <li>Always keep the cylinder upright and in a ventilated area</li>
          <li>Check hose & regulator for cracks — replace every 5 years</li>
          <li>Never use matchstick to check for leaks — use soap water</li>
          <li>Turn off regulator when not in use, especially at night</li>
          <li>In case of leak, call <strong>${SUPPORT.emergencyLeak}</strong> immediately</li>
        </ul>
      </div>
      <div class="section-title">Frequently Asked Questions</div>
      ${faqHtml}
      <div class="card fade-in" style="margin-top:16px">
        <div class="profile-detail"><i class="fa-solid fa-location-dot"></i><div><small style="color:var(--muted)">Office Address</small><br>${SUPPORT.address}</div></div>
        <div class="profile-detail"><i class="fa-solid fa-envelope"></i><div><small style="color:var(--muted)">Email</small><br>${SUPPORT.email}</div></div>
      </div>`;
  }

  function submitComplaint() {
    const c = getCustomer();
    if (!c) return;
    const subject = document.getElementById('complaint-subject')?.value;
    const message = document.getElementById('complaint-msg')?.value.trim();
    if (!message) return toast('Please describe your complaint', true);
    data.complaints.push({
      id: data.nextIds.complaint++,
      customerId: c.id,
      customerName: c.name,
      subject,
      message,
      date: today(),
      status: 'pending',
    });
    save(data);
    toast('Complaint submitted! We will contact you within 24 hours.');
    renderCustomerSupport();
  }

  const customerPages = {
    chome: { title: 'My Home', render: renderCustomerHome },
    cprices: { title: 'Cylinder Prices', render: renderCustomerPrices },
    cbook: { title: 'Book Cylinder', render: renderCustomerBook },
    cbookings: { title: 'My Orders', render: renderCustomerBookings },
    cpay: { title: 'Payment Portal', render: renderCustomerPay },
    cbills: { title: 'Payment & Bills', render: renderCustomerPay },
    cservices: { title: 'Our Services', render: renderCustomerServices },
    csupport: { title: 'Help & Support', render: renderCustomerSupport },
    cprofile: { title: 'My Profile', render: renderCustomerProfile },
  };

  function customerNav(page) {
    customerPage = page;
    document.getElementById('customer-page-title').textContent = customerPages[page].title;
    document.querySelectorAll('.cust-nav').forEach(b =>
      b.classList.toggle('active', b.dataset.page === page));
    setCustomerPageBg(page);
    customerPages[page].render();
    updateHelplineStrip();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function addCustomer() {
    showModal(`<h2><i class="fa-solid fa-user-plus" style="color:var(--primary);margin-right:8px"></i>Add Customer</h2>
      <div class="form-group"><label><i class="fa-regular fa-user"></i> Full Name</label><input id="f-name" placeholder="Customer name" /></div>
      <div class="form-group"><label><i class="fa-solid fa-phone"></i> Phone (10 digits)</label><input id="f-phone" maxlength="10" placeholder="9876543210" /></div>
      <div class="form-group"><label><i class="fa-solid fa-location-dot"></i> Address</label><textarea id="f-addr" rows="2" placeholder="Full delivery address"></textarea></div>
      <button class="btn btn-primary btn-block" onclick="GAMS.saveCustomer()"><i class="fa-solid fa-check"></i> Save Customer</button>`);
  }

  function editCustomer(id) {
    const c = data.customers.find(x => x.id === id);
    if (!c) return;
    showModal(`<h2><i class="fa-solid fa-pen" style="color:var(--primary);margin-right:8px"></i>Edit Customer</h2>
      <div class="form-group"><label>Name</label><input id="f-name" value="${c.name}" /></div>
      <div class="form-group"><label>Phone</label><input id="f-phone" value="${c.phone}" maxlength="10" /></div>
      <div class="form-group"><label>Address</label><textarea id="f-addr" rows="2">${c.address}</textarea></div>
      <button class="btn btn-primary btn-block" onclick="GAMS.saveCustomer(${id})"><i class="fa-solid fa-check"></i> Update</button>`);
  }

  function saveCustomer(editId) {
    const name = document.getElementById('f-name').value.trim();
    const phone = document.getElementById('f-phone').value.trim();
    const addr = document.getElementById('f-addr').value.trim();
    if (!name || !addr) return toast('Please fill all required fields', true);
    if (!/^\d{10}$/.test(phone)) return toast('Phone must be exactly 10 digits', true);
    if (editId) {
      const c = data.customers.find(x => x.id === editId);
      if (c) { c.name = name; c.phone = phone; c.address = addr; }
    } else {
      data.customers.push({ id: data.nextIds.customer++, name, phone, address: addr, active: true });
    }
    save(data); closeModal(); toast(editId ? 'Customer updated successfully' : 'Customer added successfully');
    nav('customers');
  }

  function deleteCustomer(id) {
    if (data.bookings.some(b => b.customerId === id && b.status === 0))
      return toast('Cannot delete — pending bookings exist', true);
    const c = data.customers.find(x => x.id === id);
    if (c) c.active = false;
    save(data); toast('Customer removed'); nav('customers');
  }

  function updateStock(type) {
    const c = data.cylinders.find(x => x.type === type);
    showModal(`<h2><i class="fa-solid fa-database" style="color:var(--primary);margin-right:8px"></i>Update ${typeLabel(type)}</h2>
      <div class="form-group"><label>Add Filled Cylinders</label><input id="f-filled" type="number" value="0" min="0" /></div>
      <div class="form-group"><label>Add Empty Cylinders</label><input id="f-empty" type="number" value="0" min="0" /></div>
      <div class="form-group"><label>New Price (₹)</label><input id="f-price" type="number" value="${c.price}" min="1" /></div>
      <button class="btn btn-primary btn-block" onclick="GAMS.saveStock(${type})"><i class="fa-solid fa-check"></i> Save Changes</button>`);
  }

  function saveStock(type) {
    const c = data.cylinders.find(x => x.type === type);
    c.filled += parseInt(document.getElementById('f-filled').value) || 0;
    c.empty += parseInt(document.getElementById('f-empty').value) || 0;
    c.price = parseFloat(document.getElementById('f-price').value) || c.price;
    save(data); closeModal(); toast('Inventory updated'); nav('inventory');
  }

  function createBooking() {
    const customers = data.customers.filter(c => c.active !== false);
    if (!customers.length) return toast('Add a customer first', true);
    const opts = customers.map(c => `<option value="${c.id}">${c.name} (#${c.id})</option>`).join('');
    showModal(`<h2><i class="fa-solid fa-calendar-plus" style="color:var(--primary);margin-right:8px"></i>New Booking</h2>
      <div class="form-group"><label>Customer</label><select id="f-cust">${opts}</select></div>
      <div class="form-group"><label>Cylinder Type</label>
        <select id="f-type">
          <option value="5">5 KG — Domestic</option>
          <option value="14" selected>14 KG — Standard</option>
          <option value="19">19 KG — Commercial</option>
        </select>
      </div>
      <div class="form-group"><label>Quantity</label><input id="f-qty" type="number" value="1" min="1" /></div>
      <button class="btn btn-primary btn-block" onclick="GAMS.saveBooking()"><i class="fa-solid fa-check"></i> Create Booking</button>`);
  }

  function saveBooking() {
    const custId = parseInt(document.getElementById('f-cust').value);
    const type = parseInt(document.getElementById('f-type').value);
    const qty = parseInt(document.getElementById('f-qty').value) || 1;
    const stock = data.cylinders.find(c => c.type === type);
    if (!stock || stock.filled < qty) return toast('Insufficient stock available', true);
    data.bookings.push({ id: data.nextIds.booking++, customerId: custId, type, quantity: qty, bookingDate: today(), status: 0, trackingStatus: 'confirmed' });
    stock.filled -= qty;
    save(data); closeModal(); toast('Booking created — stock reserved'); nav('bookings');
  }

  function cancelBooking(id) {
    const b = data.bookings.find(x => x.id === id);
    if (!b || b.status !== 0) return;
    b.status = 2;
    b.trackingStatus = 'cancelled';
    const stock = data.cylinders.find(c => c.type === b.type);
    if (stock) stock.filled += b.quantity;
    save(data); toast('Booking cancelled — stock restored'); nav('bookings');
  }

  function dispatchBooking(id) {
    const b = data.bookings.find(x => x.id === id);
    if (!b || b.status !== 0) return toast('Invalid booking', true);
    b.trackingStatus = 'ontheway';
    save(data);
    toast('Order marked as Out for Delivery');
    nav('delivery');
  }

  function deliverBooking(id) {
    const b = data.bookings.find(x => x.id === id);
    if (!b || b.status !== 0) return toast('Invalid booking', true);
    b.status = 1;
    b.trackingStatus = 'delivered';
    const stock = data.cylinders.find(c => c.type === b.type);
    if (stock) stock.empty += b.quantity;
    const amount = b.amount ?? (stock ? stock.price * b.quantity : 0);
    if (!data.bills.some(x => x.bookingId === id)) {
      const prepaid = b.paymentStatus === 'prepaid';
      data.bills.push({
        id: data.nextIds.bill++,
        bookingId: id,
        customerId: b.customerId,
        amount,
        billDate: today(),
        paid: prepaid,
        paymentMethod: b.paymentMethod || null,
        paymentStatus: prepaid ? 'completed' : (b.paymentStatus || 'pending'),
        transactionId: b.transactionId || null,
        paidDate: prepaid ? today() : null,
      });
    }
    save(data); closeModal(); toast('Delivered! Bill generated automatically.'); nav(currentPage);
  }

  function payBill(id) {
    const b = data.bills.find(x => x.id === id);
    if (!b || b.paid) return;
    if (confirm(`Confirm payment of ₹${b.amount.toFixed(2)} for Bill #${id}?`)) {
      b.paid = true;
      b.paymentMethod = b.paymentMethod || 'cash';
      b.paymentStatus = 'completed';
      b.paidDate = today();
      save(data);
      toast('Payment recorded successfully');
      nav('billing');
    }
  }

  function exportCsv() {
    let csv = 'Bill ID,Booking ID,Customer,Amount,Bill Date,Payment Method,Status\n';
    data.bills.forEach(b => {
      const c = data.customers.find(x => x.id === b.customerId);
      const method = b.paymentMethod ? paymentMethodLabel(b.paymentMethod) : '—';
      csv += `${b.id},${b.bookingId},${c?.name || 'Unknown'},${b.amount},${b.billDate},${method},${b.paid ? 'Paid' : 'Unpaid'}\n`;
    });
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'bishnoi_gas_bills_report.csv';
    a.click();
    toast('Report downloaded successfully');
  }

  function amountInWords(num) { return U.amountInWords(num); }
  function agencyLogoSvg(size) { return U.agencyLogoSvg(size); }
  function authorizedStampSvg() { return U.authorizedStampSvg(); }

  function printInvoice(billId) {
    const bill = data.bills.find(b => b.id === billId);
    if (!bill) return toast('Bill not found', true);
    const customer = data.customers.find(c => c.id === bill.customerId);
    const booking = data.bookings.find(b => b.id === bill.bookingId);
    const stock = booking ? data.cylinders.find(c => c.type === booking.type) : null;
    const itemDesc = booking ? `${typeLabel(booking.type)} LPG Cylinder × ${booking.quantity}` : 'LPG Cylinder Refill';
    const unitPrice = booking && stock ? stock.price : bill.amount;
    const gst = U.calcGstBreakdown(bill.amount);
    const subtotal = gst.subtotal;
    const cgst = gst.cgst;
    const sgst = gst.sgst;

    const invNo = `BGS/${new Date().getFullYear()}/${String(bill.id).padStart(5, '0')}`;
    const logo = agencyLogoSvg(80);
    const stamp = authorizedStampSvg();

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>GST Invoice ${invNo} - ${AGENCY_NAME}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #0F172A; font-size: 12px; }
        .gst-wrap { max-width: 820px; margin: 0 auto; border: 2px solid #0B1D3A; }
        .gst-header { display: flex; gap: 16px; padding: 16px 20px; border-bottom: 2px solid #0B1D3A; background: #f8fafc; }
        .gst-logo { flex-shrink: 0; }
        .gst-brand h1 { font-size: 22px; color: #0B1D3A; font-weight: 800; }
        .gst-brand p { font-size: 11px; color: #64748B; margin-top: 3px; line-height: 1.5; }
        .gst-title-bar { background: #0B1D3A; color: white; text-align: center; padding: 8px; font-size: 16px; font-weight: 700; letter-spacing: 0.08em; }
        .gst-subtitle { text-align: center; font-size: 11px; color: #64748B; padding: 6px; border-bottom: 1px solid #E2E8F0; }
        .gst-meta { display: grid; grid-template-columns: 1fr 1fr; }
        .gst-meta > div { padding: 14px 18px; border-bottom: 1px solid #E2E8F0; }
        .gst-meta > div:first-child { border-right: 1px solid #E2E8F0; }
        .gst-meta h3 { font-size: 10px; text-transform: uppercase; color: #E85D04; margin-bottom: 8px; letter-spacing: 0.06em; font-weight: 700; }
        .gst-meta p { line-height: 1.7; font-size: 12px; }
        .inv-details { display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid #E2E8F0; }
        .inv-details div { padding: 10px 14px; border-right: 1px solid #E2E8F0; font-size: 11px; }
        .inv-details div:last-child { border-right: none; }
        .inv-details strong { display: block; color: #64748B; font-size: 9px; text-transform: uppercase; margin-bottom: 3px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #0B1D3A; color: white; padding: 9px 8px; font-size: 10px; text-align: center; border: 1px solid #0B1D3A; }
        td { padding: 9px 8px; border: 1px solid #E2E8F0; font-size: 11px; text-align: center; }
        td.desc { text-align: left; }
        .tax-summary { display: grid; grid-template-columns: 1fr 300px; border-top: 1px solid #E2E8F0; }
        .tax-left { padding: 14px 18px; border-right: 1px solid #E2E8F0; }
        .tax-right { padding: 14px 18px; }
        .tax-right div { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; }
        .tax-right .grand { font-size: 16px; font-weight: 800; color: #0B1D3A; border-top: 2px solid #0B1D3A; padding-top: 8px; margin-top: 6px; }
        .sign-block { display: flex; justify-content: space-between; align-items: flex-end; padding: 20px 24px; border-top: 1px solid #E2E8F0; min-height: 160px; }
        .stamp-area { text-align: center; }
        .stamp-area p { font-size: 10px; color: #64748B; margin-top: 6px; font-weight: 600; }
        .sign-line { text-align: right; }
        .sign-line .line { width: 200px; border-top: 1px solid #0F172A; margin-top: 40px; margin-left: auto; }
        .sign-line p { font-size: 11px; margin-top: 6px; font-weight: 600; }
        .paid-badge { display: inline-block; background: #1B7A4E; color: white; padding: 4px 14px; border-radius: 4px; font-weight: 700; font-size: 11px; margin-top: 8px; }
        .pending-badge { color: #B91C1C; font-weight: 700; margin-top: 8px; }
        .gst-footer { background: #f1f5f9; padding: 10px; text-align: center; font-size: 10px; color: #64748B; border-top: 1px solid #E2E8F0; }
        .print-btns { text-align: center; padding: 16px; background: #f8fafc; }
        .print-btns button { background: #E85D04; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin: 0 6px; }
        @media print { .print-btns { display: none; } body { padding: 0; } }
      </style></head><body>
      <div class="gst-wrap">
        <div class="gst-header">
          <div class="gst-logo">${logo}</div>
          <div class="gst-brand">
            <h1>${AGENCY_NAME}</h1>
            <p>${SUPPORT.address}<br>
            Phone: ${SUPPORT.customerCare} | Email: ${SUPPORT.email}<br>
            <strong>GSTIN:</strong> ${AGENCY_GST.gstin} &nbsp;|&nbsp; <strong>PAN:</strong> ${AGENCY_GST.pan}<br>
            <strong>State:</strong> ${AGENCY_GST.state} (Code: ${AGENCY_GST.stateCode})</p>
          </div>
        </div>
        <div class="gst-title-bar">TAX INVOICE</div>
        <div class="gst-subtitle">(Original for Recipient) &nbsp;·&nbsp; Supply of LPG Cylinder — Taxable Goods</div>
        <div class="inv-details">
          <div><strong>Invoice No.</strong>${invNo}</div>
          <div><strong>Invoice Date</strong>${bill.billDate}</div>
          <div><strong>Place of Supply</strong>${AGENCY_GST.state} (${AGENCY_GST.stateCode})</div>
        </div>
        <div class="gst-meta">
          <div><h3>Details of Receiver (Billed To)</h3>
            <p><strong>${customer?.name || 'Customer'}</strong><br>
            Address: ${customer?.address || '—'}<br>
            Phone: ${customer?.phone || '—'}<br>
            Consumer ID: BGS-C${String(customer?.id || 0).padStart(4, '0')}</p>
          </div>
          <div><h3>Details of Consignee (Shipped To)</h3>
            <p><strong>${customer?.name || 'Customer'}</strong><br>
            ${customer?.address || '—'}<br>
            Booking Ref: #${bill.bookingId}</p>
          </div>
        </div>
        <table>
          <thead><tr>
            <th>Sr</th><th>Description of Goods</th><th>HSN/SAC</th><th>Qty</th>
            <th>Rate (₹)</th><th>Taxable (₹)</th><th>CGST 2.5%</th><th>SGST 2.5%</th><th>Total (₹)</th>
          </tr></thead>
          <tbody><tr>
            <td>1</td>
            <td class="desc">${itemDesc}</td>
            <td>${AGENCY_GST.hsn}</td>
            <td>${booking?.quantity || 1}</td>
            <td>${unitPrice.toLocaleString('en-IN')}</td>
            <td>${subtotal.toLocaleString('en-IN')}</td>
            <td>${cgst.toLocaleString('en-IN')}</td>
            <td>${sgst.toLocaleString('en-IN')}</td>
            <td><strong>${bill.amount.toLocaleString('en-IN')}</strong></td>
          </tr></tbody>
        </table>
        <div class="tax-summary">
          <div class="tax-left">
            <p><strong>Amount in Words:</strong> ${amountInWords(bill.amount)}</p>
            <p style="margin-top:10px"><strong>Payment Mode:</strong> ${bill.paymentMethod ? paymentMethodLabel(bill.paymentMethod) : '—'}
            ${bill.transactionId ? `<br><strong>Transaction Ref:</strong> ${bill.transactionId}` : ''}
            ${bill.paidDate ? `<br><strong>Paid On:</strong> ${bill.paidDate}` : ''}</p>
            <p style="margin-top:10px;font-size:10px;color:#64748B">
              <strong>Bank:</strong> ${AGENCY_BANK.name} | A/C: ${AGENCY_BANK.account} | IFSC: ${AGENCY_BANK.ifsc}<br>
              <strong>UPI:</strong> ${AGENCY_UPI} | Reverse Charge: <strong>No</strong>
            </p>
            ${bill.paid ? '<div class="paid-badge">&#10003; PAYMENT RECEIVED</div>' : '<div class="pending-badge">&#9888; PAYMENT PENDING</div>'}
          </div>
          <div class="tax-right">
            <div><span>Taxable Amount</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
            <div><span>CGST @ 2.5%</span><span>₹${cgst.toLocaleString('en-IN')}</span></div>
            <div><span>SGST @ 2.5%</span><span>₹${sgst.toLocaleString('en-IN')}</span></div>
            <div><span>Round Off</span><span>₹0.00</span></div>
            <div class="grand"><span>Grand Total</span><span>₹${bill.amount.toLocaleString('en-IN')}</span></div>
          </div>
        </div>
        <div class="sign-block">
          <div class="stamp-area">
            ${stamp}
            <p>Authorised Stamp &amp; Seal</p>
          </div>
          <div class="sign-line">
            <div class="line"></div>
            <p>For ${AGENCY_NAME}</p>
            <p>Authorised Signatory</p>
            <p style="font-size:10px;color:#64748B;margin-top:4px">${ADMIN_USER}</p>
          </div>
        </div>
        <div class="gst-footer">
          This is a computer-generated GST Tax Invoice issued by ${AGENCY_NAME}. |
          Complaint: ${SUPPORT.complaintHotline} | Emergency: ${SUPPORT.emergencyLeak}
        </div>
      </div>
      <div class="print-btns">
        <button onclick="window.print()">🖨️ Print / Save as PDF</button>
        <button onclick="window.close()" style="background:#64748B">Close</button>
      </div>
      <script>setTimeout(function(){window.print();},400);</script>
    </body></html>`;

    const win = window.open('', '_blank', 'width=860,height=1000');
    if (!win) return toast('Please allow pop-ups to download GST bill', true);
    win.document.write(html);
    win.document.close();
  }

  async function bootstrap() {
    await initData();
    restoreSession();
  }
  bootstrap();

  return {
    login, adminLogin, logout, nav, closeModal,
    switchLoginTab, showRegister, hideRegister,
    showAdminForgot, showCustomerForgot, hideForgotPassword,
    resetAdminPassword, resetCustomerPassword,
    customerLogin, registerAccount, customerLogout, customerNav,
    selectCylinder, placeOnlineBooking, proceedToPayment, customerCancelBooking,
    submitComplaint, toggleFaq, customerPayBill, selectPayMethod,
    selectBank, selectWallet, confirmPayment, closePaymentPortal, resolveComplaint,
    addCustomer, editCustomer, saveCustomer, deleteCustomer,
    updateStock, saveStock, createBooking, saveBooking,
    cancelBooking, deliverBooking, dispatchBooking, payBill, exportCsv,
    showChangePassword, saveAdminPassword, printInvoice,
  };
})();

window.GAMS = GAMS;

function bindAppUi() {
  const g = window.GAMS;
  if (!g) return;

  document.querySelectorAll('.login-tab[data-tab]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      g.switchLoginTab(btn.dataset.tab);
    });
  });

  document.getElementById('admin-login-btn')?.addEventListener('click', e => {
    e.preventDefault();
    g.adminLogin();
  });

  document.getElementById('cust-login-btn')?.addEventListener('click', e => {
    e.preventDefault();
    g.customerLogin();
  });

  document.getElementById('link-admin-forgot')?.addEventListener('click', e => {
    e.preventDefault();
    g.showAdminForgot();
  });
  document.getElementById('link-customer-forgot')?.addEventListener('click', e => {
    e.preventDefault();
    g.showCustomerForgot();
  });
  document.getElementById('link-show-register')?.addEventListener('click', e => {
    e.preventDefault();
    g.showRegister();
  });
  document.getElementById('link-hide-register')?.addEventListener('click', e => {
    e.preventDefault();
    g.hideRegister();
  });
  document.getElementById('link-admin-forgot-back')?.addEventListener('click', e => {
    e.preventDefault();
    g.hideForgotPassword('admin');
  });
  document.getElementById('link-customer-forgot-back')?.addEventListener('click', e => {
    e.preventDefault();
    g.hideForgotPassword('customer');
  });
  document.getElementById('btn-reset-admin-pass')?.addEventListener('click', e => {
    e.preventDefault();
    g.resetAdminPassword();
  });
  document.getElementById('btn-reset-customer-pass')?.addEventListener('click', e => {
    e.preventDefault();
    g.resetCustomerPassword();
  });
  document.getElementById('btn-register')?.addEventListener('click', e => {
    e.preventDefault();
    g.registerAccount();
  });

  document.getElementById('modal-backdrop')?.addEventListener('click', () => g.closeModal());

  document.getElementById('app')?.addEventListener('click', e => {
    const navBtn = e.target.closest('#main-screen .nav-btn[data-page]');
    if (navBtn) { g.nav(navBtn.dataset.page); return; }
    const custNav = e.target.closest('#customer-screen .nav-btn[data-page]');
    if (custNav) { g.customerNav(custNav.dataset.page); return; }
    if (e.target.closest('#btn-admin-logout')) g.logout();
    if (e.target.closest('#btn-customer-logout')) g.customerLogout();
    if (e.target.closest('#customer-name-chip')) g.customerNav('cprofile');
  });

  document.getElementById('login-pass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); g.adminLogin(); }
  });
  document.getElementById('cust-login-pass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); g.customerLogin(); }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindAppUi);
} else {
  bindAppUi();
}
