enum CylinderType { kg5, kg14, kg19 }

extension CylinderTypeExt on CylinderType {
  int get kgValue {
    switch (this) {
      case CylinderType.kg5:
        return 5;
      case CylinderType.kg14:
        return 14;
      case CylinderType.kg19:
        return 19;
    }
  }

  String get label => '${kgValue} KG';

  static CylinderType fromKg(int kg) {
    switch (kg) {
      case 5:
        return CylinderType.kg5;
      case 14:
        return CylinderType.kg14;
      default:
        return CylinderType.kg19;
    }
  }
}

enum BookingStatus { pending, delivered, cancelled }

extension BookingStatusExt on BookingStatus {
  String get label {
    switch (this) {
      case BookingStatus.pending:
        return 'Pending';
      case BookingStatus.delivered:
        return 'Delivered';
      case BookingStatus.cancelled:
        return 'Cancelled';
    }
  }
}

class Customer {
  final int id;
  final String name;
  final String phone;
  final String address;
  final bool active;

  const Customer({
    required this.id,
    required this.name,
    required this.phone,
    required this.address,
    this.active = true,
  });

  Customer copyWith({
    int? id,
    String? name,
    String? phone,
    String? address,
    bool? active,
  }) {
    return Customer(
      id: id ?? this.id,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      address: address ?? this.address,
      active: active ?? this.active,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'phone': phone,
        'address': address,
        'active': active,
      };

  factory Customer.fromJson(Map<String, dynamic> json) => Customer(
        id: json['id'] as int,
        name: json['name'] as String,
        phone: json['phone'] as String,
        address: json['address'] as String,
        active: json['active'] as bool? ?? true,
      );
}

class CylinderStock {
  final int id;
  final CylinderType type;
  final int filled;
  final int empty;
  final double price;

  const CylinderStock({
    required this.id,
    required this.type,
    required this.filled,
    required this.empty,
    required this.price,
  });

  CylinderStock copyWith({
    int? id,
    CylinderType? type,
    int? filled,
    int? empty,
    double? price,
  }) {
    return CylinderStock(
      id: id ?? this.id,
      type: type ?? this.type,
      filled: filled ?? this.filled,
      empty: empty ?? this.empty,
      price: price ?? this.price,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type.kgValue,
        'filled': filled,
        'empty': empty,
        'price': price,
      };

  factory CylinderStock.fromJson(Map<String, dynamic> json) => CylinderStock(
        id: json['id'] as int,
        type: CylinderTypeExt.fromKg(json['type'] as int),
        filled: json['filled'] as int,
        empty: json['empty'] as int,
        price: (json['price'] as num).toDouble(),
      );
}

class Booking {
  final int id;
  final int customerId;
  final CylinderType type;
  final int quantity;
  final String bookingDate;
  final BookingStatus status;

  const Booking({
    required this.id,
    required this.customerId,
    required this.type,
    required this.quantity,
    required this.bookingDate,
    required this.status,
  });

  Booking copyWith({
    int? id,
    int? customerId,
    CylinderType? type,
    int? quantity,
    String? bookingDate,
    BookingStatus? status,
  }) {
    return Booking(
      id: id ?? this.id,
      customerId: customerId ?? this.customerId,
      type: type ?? this.type,
      quantity: quantity ?? this.quantity,
      bookingDate: bookingDate ?? this.bookingDate,
      status: status ?? this.status,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'customerId': customerId,
        'type': type.kgValue,
        'quantity': quantity,
        'bookingDate': bookingDate,
        'status': status.index,
      };

  factory Booking.fromJson(Map<String, dynamic> json) => Booking(
        id: json['id'] as int,
        customerId: json['customerId'] as int,
        type: CylinderTypeExt.fromKg(json['type'] as int),
        quantity: json['quantity'] as int,
        bookingDate: json['bookingDate'] as String,
        status: BookingStatus.values[json['status'] as int],
      );
}

class Bill {
  final int id;
  final int bookingId;
  final int customerId;
  final double amount;
  final String billDate;
  final bool paid;

  const Bill({
    required this.id,
    required this.bookingId,
    required this.customerId,
    required this.amount,
    required this.billDate,
    this.paid = false,
  });

  Bill copyWith({
    int? id,
    int? bookingId,
    int? customerId,
    double? amount,
    String? billDate,
    bool? paid,
  }) {
    return Bill(
      id: id ?? this.id,
      bookingId: bookingId ?? this.bookingId,
      customerId: customerId ?? this.customerId,
      amount: amount ?? this.amount,
      billDate: billDate ?? this.billDate,
      paid: paid ?? this.paid,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'bookingId': bookingId,
        'customerId': customerId,
        'amount': amount,
        'billDate': billDate,
        'paid': paid,
      };

  factory Bill.fromJson(Map<String, dynamic> json) => Bill(
        id: json['id'] as int,
        bookingId: json['bookingId'] as int,
        customerId: json['customerId'] as int,
        amount: (json['amount'] as num).toDouble(),
        billDate: json['billDate'] as String,
        paid: json['paid'] as bool? ?? false,
      );
}

class DashboardStats {
  final int activeCustomers;
  final int totalFilled;
  final int totalEmpty;
  final int pendingBookings;
  final int deliveredBookings;
  final int cancelledBookings;
  final int paidBills;
  final int unpaidBills;
  final double totalRevenue;
  final double pendingAmount;

  const DashboardStats({
    this.activeCustomers = 0,
    this.totalFilled = 0,
    this.totalEmpty = 0,
    this.pendingBookings = 0,
    this.deliveredBookings = 0,
    this.cancelledBookings = 0,
    this.paidBills = 0,
    this.unpaidBills = 0,
    this.totalRevenue = 0,
    this.pendingAmount = 0,
  });
}
