const DEFAULT_RECOVERY = 'BGS2006';
const DEFAULT_CUST_USER = 'customer';

function fmtDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${d.getFullYear()}`;
}

/** Rich demo dataset for Bishnoi Gas Services — old + new customers, mixed booking outcomes */
function buildSampleData() {
  const customers = [
    {
      id: 1,
      name: 'Demo Customer',
      phone: '9876543210',
      address: 'House 12, Near Bishnoi Gas Services, Main Road, Jodhpur',
      active: true,
      username: DEFAULT_CUST_USER,
    },
    {
      id: 2,
      name: 'Ramesh Kumar',
      phone: '9829012345',
      address: 'Ward 5, Sardarpura, Jodhpur — loyal customer since 2019',
      active: true,
      username: 'ramesh_kumar',
    },
    {
      id: 3,
      name: 'Sunita Devi',
      phone: '9414056789',
      address: '42, Ratanada Colony, Jodhpur',
      active: true,
      username: 'sunita_devi',
    },
    {
      id: 4,
      name: 'Priya Sharma',
      phone: '9988776655',
      address: 'Flat 3B, Shastri Nagar, Jodhpur',
      active: true,
      username: 'priya_sharma',
    },
    {
      id: 5,
      name: 'Amit Singh',
      phone: '9123456780',
      address: 'Shop 7, Paota Market, Jodhpur',
      active: true,
      username: 'amit_singh',
    },
    {
      id: 6,
      name: 'Mohan Lal Bishnoi',
      phone: '9352011122',
      address: 'Village Bhundelao, Tehsil Bilara',
      active: false,
      username: null,
    },
    {
      id: 7,
      name: 'Kavita Joshi',
      phone: '9772255443',
      address: '18, Chopasni Housing Board, Jodhpur',
      active: true,
      username: 'kavita_joshi',
    },
    {
      id: 8,
      name: 'Suresh Prajapat',
      phone: '8899001122',
      address: 'Industrial Area, Boranada, Jodhpur',
      active: true,
      username: null,
    },
    {
      id: 9,
      name: 'Neha Gupta',
      phone: '9001122334',
      address: 'C-204, Ashok Udyog, Jodhpur',
      active: true,
      username: 'neha_gupta',
    },
    {
      id: 10,
      name: 'Harish Choudhary',
      phone: '8765432190',
      address: 'Old City, Ghanta Ghar Road, Jodhpur',
      active: true,
      username: null,
    },
  ];

  const cylinders = [
    { id: 1, type: 5, filled: 38, empty: 22, price: 450 },
    { id: 2, type: 14, filled: 64, empty: 31, price: 950 },
    { id: 3, type: 19, filled: 41, empty: 18, price: 1150 },
  ];

  const bookings = [
    // Old customer — successful delivered (UPI prepaid)
    {
      id: 1, customerId: 2, type: 14, quantity: 2, bookingDate: fmtDate(45),
      status: 1, trackingStatus: 'delivered', source: 'online',
      paymentMethod: 'upi', paymentStatus: 'prepaid', transactionId: 'UPI240101001', amount: 1900,
    },
    {
      id: 2, customerId: 2, type: 14, quantity: 1, bookingDate: fmtDate(12),
      status: 1, trackingStatus: 'delivered', source: 'phone',
      paymentMethod: 'cash', paymentStatus: 'completed', transactionId: null, amount: 950,
    },
    // Old customer — cancelled (failed payment / stock issue)
    {
      id: 3, customerId: 3, type: 19, quantity: 3, bookingDate: fmtDate(30),
      status: 2, trackingStatus: 'cancelled', source: 'online',
      paymentMethod: 'card', paymentStatus: 'failed', transactionId: 'CARD-FAIL-8821', amount: 3450,
    },
    // Successful on the way
    {
      id: 4, customerId: 3, type: 14, quantity: 1, bookingDate: fmtDate(1),
      status: 0, trackingStatus: 'ontheway', source: 'online',
      paymentMethod: 'upi', paymentStatus: 'prepaid', transactionId: 'UPI240602004', amount: 950,
    },
    // New customer — COD pending delivery
    {
      id: 5, customerId: 4, type: 5, quantity: 2, bookingDate: fmtDate(2),
      status: 0, trackingStatus: 'confirmed', source: 'online',
      paymentMethod: 'cod', paymentStatus: 'pay_on_delivery', transactionId: 'COD-1709123456', amount: 900,
    },
    // New customer — delivered net banking
    {
      id: 6, customerId: 4, type: 14, quantity: 1, bookingDate: fmtDate(8),
      status: 1, trackingStatus: 'delivered', source: 'online',
      paymentMethod: 'netbanking', paymentStatus: 'completed', transactionId: 'NB77889900', amount: 950,
    },
    // Cancelled by customer
    {
      id: 7, customerId: 5, type: 5, quantity: 1, bookingDate: fmtDate(5),
      status: 2, trackingStatus: 'cancelled', source: 'online',
      paymentMethod: 'wallet', paymentStatus: 'refunded', transactionId: 'WLT556677', amount: 450,
    },
    // Demo customer — active pending
    {
      id: 8, customerId: 1, type: 14, quantity: 1, bookingDate: fmtDate(0),
      status: 0, trackingStatus: 'confirmed', source: 'online',
      paymentMethod: 'upi', paymentStatus: 'prepaid', transactionId: 'UPI240624008', amount: 950,
    },
    // Walk-in old customer (no username) — delivered
    {
      id: 9, customerId: 8, type: 19, quantity: 2, bookingDate: fmtDate(20),
      status: 1, trackingStatus: 'delivered', source: 'walkin',
      paymentMethod: 'cash', paymentStatus: 'completed', transactionId: null, amount: 2300,
    },
    // Unpaid bill scenario
    {
      id: 10, customerId: 7, type: 14, quantity: 2, bookingDate: fmtDate(6),
      status: 1, trackingStatus: 'delivered', source: 'phone',
      paymentMethod: null, paymentStatus: 'pending', transactionId: null, amount: 1900,
    },
    {
      id: 11, customerId: 9, type: 5, quantity: 1, bookingDate: fmtDate(3),
      status: 0, trackingStatus: 'placed', source: 'online',
      paymentMethod: 'bank_transfer', paymentStatus: 'pending', transactionId: 'UTR88221100', amount: 450,
    },
    {
      id: 12, customerId: 2, type: 19, quantity: 1, bookingDate: fmtDate(60),
      status: 1, trackingStatus: 'delivered', source: 'online',
      paymentMethod: 'upi', paymentStatus: 'prepaid', transactionId: 'UPI231201012', amount: 1150,
    },
  ];

  const bills = [
    {
      id: 1, bookingId: 1, customerId: 2, amount: 1900, billDate: fmtDate(44),
      paid: true, paymentMethod: 'upi', paymentStatus: 'completed',
      transactionId: 'UPI240101001', paidDate: fmtDate(44),
    },
    {
      id: 2, bookingId: 2, customerId: 2, amount: 950, billDate: fmtDate(11),
      paid: true, paymentMethod: 'cash', paymentStatus: 'completed',
      transactionId: null, paidDate: fmtDate(11),
    },
    {
      id: 3, bookingId: 6, customerId: 4, amount: 950, billDate: fmtDate(7),
      paid: true, paymentMethod: 'netbanking', paymentStatus: 'completed',
      transactionId: 'NB77889900', paidDate: fmtDate(7),
    },
    {
      id: 4, bookingId: 9, customerId: 8, amount: 2300, billDate: fmtDate(19),
      paid: true, paymentMethod: 'cash', paymentStatus: 'completed',
      transactionId: null, paidDate: fmtDate(19),
    },
    {
      id: 5, bookingId: 10, customerId: 7, amount: 1900, billDate: fmtDate(5),
      paid: false, paymentMethod: null, paymentStatus: 'pending',
      transactionId: null, paidDate: null,
    },
    {
      id: 6, bookingId: 12, customerId: 2, amount: 1150, billDate: fmtDate(59),
      paid: true, paymentMethod: 'upi', paymentStatus: 'completed',
      transactionId: 'UPI231201012', paidDate: fmtDate(59),
    },
  ];

  const complaints = [
    {
      id: 1, customerId: 3, customerName: 'Sunita Devi', subject: 'Late delivery',
      message: 'Cylinder was delivered 2 days late last month.', date: fmtDate(25), status: 'resolved',
    },
    {
      id: 2, customerId: 5, customerName: 'Amit Singh', subject: 'Wrong cylinder size',
      message: 'Received 5kg instead of 14kg on order #7 before cancellation.', date: fmtDate(4), status: 'pending',
    },
    {
      id: 3, customerId: 7, customerName: 'Kavita Joshi', subject: 'Payment issue',
      message: 'UPI payment failed but amount was debited.', date: fmtDate(2), status: 'pending',
    },
    {
      id: 4, customerId: 1, customerName: 'Demo Customer', subject: 'Regulator check',
      message: 'Please schedule safety inspection for regulator.', date: fmtDate(1), status: 'resolved',
    },
  ];

  const payments = [
    { id: 1, customerId: 2, amount: 1900, method: 'upi', transactionId: 'UPI240101001', date: fmtDate(45), type: 'booking', billId: null },
    { id: 2, customerId: 4, amount: 950, method: 'netbanking', transactionId: 'NB77889900', date: fmtDate(8), type: 'booking', billId: null },
    { id: 3, customerId: 3, amount: 950, method: 'upi', transactionId: 'UPI240602004', date: fmtDate(1), type: 'booking', billId: null },
    { id: 4, customerId: 1, amount: 950, method: 'upi', transactionId: 'UPI240624008', date: fmtDate(0), type: 'booking', billId: null },
    { id: 5, customerId: 7, amount: 500, method: 'cash', transactionId: 'CASH-PARTIAL-01', date: fmtDate(3), type: 'bill', billId: 5 },
    { id: 6, customerId: 5, amount: 450, method: 'wallet', transactionId: 'WLT556677', date: fmtDate(5), type: 'booking', billId: null },
    { id: 7, customerId: 2, amount: 1150, method: 'upi', transactionId: 'UPI231201012', date: fmtDate(60), type: 'booking', billId: null },
  ];

  return {
    customers,
    cylinders,
    bookings,
    bills,
    complaints,
    payments,
    settings: { adminRecoveryCode: DEFAULT_RECOVERY },
    nextIds: {
      customer: 11,
      booking: 13,
      bill: 7,
      complaint: 5,
      payment: 8,
    },
  };
}

/** Usernames that get portal login — password Bhambu2006 */
function sampleCustomerUsernames() {
  return [
    DEFAULT_CUST_USER,
    'ramesh_kumar',
    'sunita_devi',
    'priya_sharma',
    'amit_singh',
    'kavita_joshi',
    'neha_gupta',
  ];
}

module.exports = { buildSampleData, sampleCustomerUsernames, DEFAULT_CUST_USER };
