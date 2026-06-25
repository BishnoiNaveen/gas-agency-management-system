/** Pure business logic — shared by server tests and API validation */

function getTrackingStatus(booking) {
  if (!booking) return 'placed';
  if (booking.status === 2) return 'cancelled';
  if (booking.status === 1) return 'delivered';
  return booking.trackingStatus || 'confirmed';
}

function validateBookingStock(cylinders, type, quantity) {
  const stock = cylinders.find(c => c.type === type);
  if (!stock) return { ok: false, error: 'Cylinder type not found' };
  if (stock.filled < quantity) return { ok: false, error: 'Insufficient stock available' };
  return { ok: true, stock };
}

function calcBillAmount(stock, quantity, fallbackAmount) {
  if (typeof fallbackAmount === 'number' && fallbackAmount > 0) return fallbackAmount;
  if (!stock) return 0;
  return stock.price * quantity;
}

function calcGstBreakdown(totalAmount, gstRate = 0.05) {
  const total = Math.round(totalAmount * 100) / 100;
  const subtotal = Math.round((total / (1 + gstRate)) * 100) / 100;
  const gst = Math.round((total - subtotal) * 100) / 100;
  const cgst = Math.round((gst / 2) * 100) / 100;
  const sgst = Math.round((gst - cgst) * 100) / 100;
  return { total, subtotal, gst, cgst, sgst };
}

function canCancelBooking(booking) {
  return booking && booking.status === 0;
}

function shouldMarkBillPaidOnDelivery(booking) {
  return booking?.paymentStatus === 'prepaid';
}

function validatePhone(phone) {
  return /^\d{10}$/.test(String(phone || '').trim());
}

function validatePassword(pw, minLen = 4) {
  return typeof pw === 'string' && pw.length >= minLen;
}

module.exports = {
  getTrackingStatus,
  validateBookingStock,
  calcBillAmount,
  calcGstBreakdown,
  canCancelBooking,
  shouldMarkBillPaidOnDelivery,
  validatePhone,
  validatePassword,
};
