import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';

import '../models/models.dart';

class GamsRepository extends ChangeNotifier {
  static const agencyName = 'Bishnoi Gas Services';
  static const adminUsername = 'Naveen Bishnoi';
  static const adminPassword = 'Bhambu2006';

  List<Customer> _customers = [];
  List<CylinderStock> _cylinders = [];
  List<Booking> _bookings = [];
  List<Bill> _bills = [];
  bool _loaded = false;
  String? _dataDir;

  List<Customer> get customers =>
      List.unmodifiable(_customers.where((c) => c.active));
  List<CylinderStock> get cylinders => List.unmodifiable(_cylinders);
  List<Booking> get bookings => List.unmodifiable(_bookings);
  List<Bill> get bills => List.unmodifiable(_bills);
  bool get isLoaded => _loaded;

  Future<void> init() async {
    if (_loaded) return;
    _dataDir = await _resolveDataDir();
    await _ensureReportsDir();
    await _loadAll();
    await _initCylinderStockIfNeeded();
    _loaded = true;
    notifyListeners();
  }

  Future<String> _resolveDataDir() async {
    if (kIsWeb) {
      return 'data';
    }
    final base = await getApplicationDocumentsDirectory();
    final dir = Directory('${base.path}/gams_data');
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }
    return dir.path;
  }

  Future<void> _ensureReportsDir() async {
    if (kIsWeb) return;
    final reports = Directory('$_dataDir/reports');
    if (!await reports.exists()) {
      await reports.create(recursive: true);
    }
  }

  String _file(String name) => '$_dataDir/$name';

  Future<void> _loadAll() async {
    if (kIsWeb) return;
    _customers = await _readList('customers.json', Customer.fromJson);
    _cylinders = await _readList('cylinders.json', CylinderStock.fromJson);
    _bookings = await _readList('bookings.json', Booking.fromJson);
    _bills = await _readList('bills.json', Bill.fromJson);
  }

  Future<List<T>> _readList<T>(
    String file,
    T Function(Map<String, dynamic>) fromJson,
  ) async {
    final path = _file(file);
    final f = File(path);
    if (!await f.exists()) return [];
    final content = await f.readAsString();
    if (content.trim().isEmpty) return [];
    final list = jsonDecode(content) as List<dynamic>;
    return list.map((e) => fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> _saveList<T>(
    String file,
    List<T> items,
    Map<String, dynamic> Function(T) toJson,
  ) async {
    if (kIsWeb) return;
    final encoded = jsonEncode(items.map(toJson).toList());
    await File(_file(file)).writeAsString(encoded);
  }

  String currentDate() {
    return DateFormat('dd-MM-yyyy').format(DateTime.now());
  }

  int _nextId(List<int> ids) {
    if (ids.isEmpty) return 1;
    return ids.reduce((a, b) => a > b ? a : b) + 1;
  }

  Future<void> _initCylinderStockIfNeeded() async {
    if (_cylinders.isNotEmpty) return;
    _cylinders = [
      const CylinderStock(
          id: 1, type: CylinderType.kg5, filled: 50, empty: 10, price: 450),
      const CylinderStock(
          id: 2, type: CylinderType.kg14, filled: 80, empty: 20, price: 950),
      const CylinderStock(
          id: 3, type: CylinderType.kg19, filled: 60, empty: 15, price: 1150),
    ];
    await _saveList('cylinders.json', _cylinders, (c) => c.toJson());
    notifyListeners();
  }

  Customer? findCustomer(int id) {
    try {
      return _customers.firstWhere((c) => c.id == id && c.active);
    } catch (_) {
      return null;
    }
  }

  CylinderStock? findCylinder(CylinderType type) {
    try {
      return _cylinders.firstWhere((c) => c.type == type);
    } catch (_) {
      return null;
    }
  }

  Booking? findBooking(int id) {
    try {
      return _bookings.firstWhere((b) => b.id == id);
    } catch (_) {
      return null;
    }
  }

  bool customerHasPendingBookings(int customerId) {
    return _bookings.any(
      (b) => b.customerId == customerId && b.status == BookingStatus.pending,
    );
  }

  DashboardStats getDashboardStats() {
    var active = 0;
    var filled = 0;
    var empty = 0;
    var pending = 0;
    var delivered = 0;
    var cancelled = 0;
    var paid = 0;
    var unpaid = 0;
    var revenue = 0.0;
    var pendingAmt = 0.0;

    for (final c in _customers) {
      if (c.active) active++;
    }
    for (final s in _cylinders) {
      filled += s.filled;
      empty += s.empty;
    }
    for (final b in _bookings) {
      switch (b.status) {
        case BookingStatus.pending:
          pending++;
        case BookingStatus.delivered:
          delivered++;
        case BookingStatus.cancelled:
          cancelled++;
      }
    }
    for (final bill in _bills) {
      if (bill.paid) {
        paid++;
        revenue += bill.amount;
      } else {
        unpaid++;
        pendingAmt += bill.amount;
      }
    }

    return DashboardStats(
      activeCustomers: active,
      totalFilled: filled,
      totalEmpty: empty,
      pendingBookings: pending,
      deliveredBookings: delivered,
      cancelledBookings: cancelled,
      paidBills: paid,
      unpaidBills: unpaid,
      totalRevenue: revenue,
      pendingAmount: pendingAmt,
    );
  }

  Future<String?> addCustomer({
    required String name,
    required String phone,
    required String address,
  }) async {
    if (!RegExp(r'^\d{10}$').hasMatch(phone)) {
      return 'Phone must be exactly 10 digits';
    }
    final id = _nextId(_customers.map((c) => c.id).toList());
    _customers.add(Customer(
      id: id,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
    ));
    await _saveList('customers.json', _customers, (c) => c.toJson());
    notifyListeners();
    return null;
  }

  Future<String?> updateCustomer({
    required int id,
    required String name,
    required String phone,
    required String address,
  }) async {
    if (!RegExp(r'^\d{10}$').hasMatch(phone)) {
      return 'Phone must be exactly 10 digits';
    }
    final idx = _customers.indexWhere((c) => c.id == id);
    if (idx < 0) return 'Customer not found';
    _customers[idx] = _customers[idx].copyWith(
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
    );
    await _saveList('customers.json', _customers, (c) => c.toJson());
    notifyListeners();
    return null;
  }

  Future<String?> deleteCustomer(int id) async {
    final idx = _customers.indexWhere((c) => c.id == id && c.active);
    if (idx < 0) return 'Customer not found';
    if (customerHasPendingBookings(id)) {
      return 'Cannot delete: customer has pending bookings';
    }
    _customers[idx] = _customers[idx].copyWith(active: false);
    await _saveList('customers.json', _customers, (c) => c.toJson());
    notifyListeners();
    return null;
  }

  Future<String?> updateCylinderStock({
    required CylinderType type,
    required int addFilled,
    required int addEmpty,
    required double price,
  }) async {
    final idx = _cylinders.indexWhere((c) => c.type == type);
    if (idx < 0) return 'Cylinder type not found';
    _cylinders[idx] = _cylinders[idx].copyWith(
      filled: _cylinders[idx].filled + addFilled,
      empty: _cylinders[idx].empty + addEmpty,
      price: price,
    );
    await _saveList('cylinders.json', _cylinders, (c) => c.toJson());
    notifyListeners();
    return null;
  }

  Future<String?> createBooking({
    required int customerId,
    required CylinderType type,
    required int quantity,
  }) async {
    if (findCustomer(customerId) == null) {
      return 'Customer not found';
    }
    final stock = findCylinder(type);
    if (stock == null) return 'Cylinder type not in inventory';
    if (stock.filled < quantity) {
      return 'Not enough filled cylinders in stock';
    }

    final id = _nextId(_bookings.map((b) => b.id).toList());
    _bookings.add(Booking(
      id: id,
      customerId: customerId,
      type: type,
      quantity: quantity,
      bookingDate: currentDate(),
      status: BookingStatus.pending,
    ));

    final idx = _cylinders.indexWhere((c) => c.type == type);
    _cylinders[idx] =
        _cylinders[idx].copyWith(filled: _cylinders[idx].filled - quantity);

    await _saveList('bookings.json', _bookings, (b) => b.toJson());
    await _saveList('cylinders.json', _cylinders, (c) => c.toJson());
    notifyListeners();
    return null;
  }

  Future<String?> cancelBooking(int bookingId) async {
    final idx = _bookings.indexWhere((b) => b.id == bookingId);
    if (idx < 0) return 'Booking not found';
    if (_bookings[idx].status != BookingStatus.pending) {
      return 'Only pending bookings can be cancelled';
    }
    final booking = _bookings[idx];
    _bookings[idx] = booking.copyWith(status: BookingStatus.cancelled);

    final cIdx = _cylinders.indexWhere((c) => c.type == booking.type);
    _cylinders[cIdx] = _cylinders[cIdx]
        .copyWith(filled: _cylinders[cIdx].filled + booking.quantity);

    await _saveList('bookings.json', _bookings, (b) => b.toJson());
    await _saveList('cylinders.json', _cylinders, (c) => c.toJson());
    notifyListeners();
    return null;
  }

  Future<String?> deliverBooking(int bookingId) async {
    final idx = _bookings.indexWhere((b) => b.id == bookingId);
    if (idx < 0) return 'Booking not found';
    if (_bookings[idx].status != BookingStatus.pending) {
      return 'Only pending bookings can be delivered';
    }

    final booking = _bookings[idx];
    _bookings[idx] = booking.copyWith(status: BookingStatus.delivered);

    final cIdx = _cylinders.indexWhere((c) => c.type == booking.type);
    _cylinders[cIdx] = _cylinders[cIdx]
        .copyWith(empty: _cylinders[cIdx].empty + booking.quantity);

    await _saveList('bookings.json', _bookings, (b) => b.toJson());
    await _saveList('cylinders.json', _cylinders, (c) => c.toJson());

    final billErr = await _generateBill(bookingId);
    if (billErr != null) return billErr;

    await _saveDeliverySlip(booking);
    notifyListeners();
    return null;
  }

  Future<String?> _generateBill(int bookingId) async {
    final booking = findBooking(bookingId);
    if (booking == null || booking.status != BookingStatus.delivered) {
      return 'Invalid booking for billing';
    }
    if (_bills.any((b) => b.bookingId == bookingId)) {
      return 'Bill already exists for this booking';
    }
    final stock = findCylinder(booking.type);
    if (stock == null) return 'Cylinder price not found';

    final id = _nextId(_bills.map((b) => b.id).toList());
    _bills.add(Bill(
      id: id,
      bookingId: bookingId,
      customerId: booking.customerId,
      amount: stock.price * booking.quantity,
      billDate: currentDate(),
    ));
    await _saveList('bills.json', _bills, (b) => b.toJson());
    return null;
  }

  Future<void> _saveDeliverySlip(Booking booking) async {
    if (kIsWeb) return;
    final customer = findCustomer(booking.customerId);
    final stock = findCylinder(booking.type);
    if (customer == null || stock == null) return;

    final amount = stock.price * booking.quantity;
    final slip = StringBuffer()
      ..writeln('================================================')
      ..writeln('     BISHNOI GAS SERVICES - DELIVERY SLIP      ')
      ..writeln('================================================')
      ..writeln('Booking ID     : ${booking.id}')
      ..writeln('Delivery Date  : ${currentDate()}')
      ..writeln('Booked On      : ${booking.bookingDate}')
      ..writeln('------------------------------------------------')
      ..writeln('Customer       : ${customer.name}')
      ..writeln('Phone          : ${customer.phone}')
      ..writeln('Address        : ${customer.address}')
      ..writeln('------------------------------------------------')
      ..writeln('Cylinder       : ${booking.type.label}')
      ..writeln('Quantity       : ${booking.quantity}')
      ..writeln('Amount         : Rs ${amount.toStringAsFixed(2)}')
      ..writeln('Status         : DELIVERED')
      ..writeln('================================================');

    await File('$_dataDir/reports/delivery_slip_${booking.id}.txt')
        .writeAsString(slip.toString());
  }

  Future<String?> markBillPaid(int billId) async {
    final idx = _bills.indexWhere((b) => b.id == billId);
    if (idx < 0) return 'Bill not found';
    if (_bills[idx].paid) return 'Bill is already paid';
    _bills[idx] = _bills[idx].copyWith(paid: true);
    await _saveList('bills.json', _bills, (b) => b.toJson());
    notifyListeners();
    return null;
  }

  Future<String> exportBillsCsv() async {
    if (kIsWeb) return 'Export not available on web';
    final buffer = StringBuffer('Bill ID,Booking ID,Customer,Amount,Bill Date,Status\n');
    for (final bill in _bills) {
      final customer = findCustomer(bill.customerId);
      buffer.writeln(
        '${bill.id},${bill.bookingId},${customer?.name ?? "Unknown"},'
        '${bill.amount.toStringAsFixed(2)},${bill.billDate},'
        '${bill.paid ? "Paid" : "Unpaid"}',
      );
    }
    final path = '$_dataDir/reports/bills_report.csv';
    await File(path).writeAsString(buffer.toString());
    return path;
  }

  List<Booking> get pendingDeliveries => _bookings
      .where((b) => b.status == BookingStatus.pending)
      .toList();
}
