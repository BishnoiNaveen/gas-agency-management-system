const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const logic = require('../../gams_shared/logic');

describe('GAMS business logic', () => {
  const cylinders = [
    { type: 14, filled: 10, empty: 2, price: 950 },
    { type: 5, filled: 0, empty: 5, price: 450 },
  ];

  it('validates booking stock', () => {
    assert.equal(logic.validateBookingStock(cylinders, 14, 2).ok, true);
    assert.equal(logic.validateBookingStock(cylinders, 14, 20).ok, false);
    assert.equal(logic.validateBookingStock(cylinders, 19, 1).ok, false);
  });

  it('calculates bill amount from stock', () => {
    assert.equal(logic.calcBillAmount(cylinders[0], 2), 1900);
    assert.equal(logic.calcBillAmount(null, 1, 500), 500);
  });

  it('calculates GST breakdown', () => {
    const g = logic.calcGstBreakdown(1050);
    assert.equal(g.total, 1050);
    assert.ok(g.subtotal < 1050);
    assert.ok(Math.abs(g.cgst + g.sgst - g.gst) < 0.02);
  });

  it('tracks booking status', () => {
    assert.equal(logic.getTrackingStatus({ status: 0, trackingStatus: 'ontheway' }), 'ontheway');
    assert.equal(logic.getTrackingStatus({ status: 1 }), 'delivered');
    assert.equal(logic.getTrackingStatus({ status: 2 }), 'cancelled');
  });

  it('allows cancel only for pending bookings', () => {
    assert.equal(logic.canCancelBooking({ status: 0 }), true);
    assert.equal(logic.canCancelBooking({ status: 1 }), false);
  });

  it('marks prepaid bills on delivery', () => {
    assert.equal(logic.shouldMarkBillPaidOnDelivery({ paymentStatus: 'prepaid' }), true);
    assert.equal(logic.shouldMarkBillPaidOnDelivery({ paymentStatus: 'pay_on_delivery' }), false);
  });

  it('validates phone numbers', () => {
    assert.equal(logic.validatePhone('9876543210'), true);
    assert.equal(logic.validatePhone('12345'), false);
  });

  it('validates password length', () => {
    assert.equal(logic.validatePassword('abc'), false);
    assert.equal(logic.validatePassword('abcd'), true);
  });
});

describe('GAMS auth (MySQL)', () => {
  it('verifies admin password with bcrypt', async () => {
    if (process.env.GAMS_SKIP_MYSQL_TEST) return;
    const dbMod = require('../db');
    let pool;
    try {
      pool = await dbMod.initDb();
    } catch {
      return; // XAMPP MySQL not running — skip
    }
    assert.equal(await dbMod.verifyAdminLogin(pool, 'Naveen Bishnoi', 'wrong'), false);
    assert.equal(await dbMod.verifyAdminLogin(pool, 'Naveen Bishnoi', 'Bhambu2006'), true);
    await dbMod.closeDb(pool);
  });
});
