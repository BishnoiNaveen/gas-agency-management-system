import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/models.dart';
import '../services/gams_repository.dart';
import '../theme/app_theme.dart';

class BookingsScreen extends StatelessWidget {
  const BookingsScreen({super.key});

  Color _statusColor(BookingStatus s) {
    switch (s) {
      case BookingStatus.pending:
        return AppTheme.warningAmber;
      case BookingStatus.delivered:
        return AppTheme.successGreen;
      case BookingStatus.cancelled:
        return AppTheme.dangerRed;
    }
  }

  @override
  Widget build(BuildContext context) {
    final repo = context.watch<GamsRepository>();
    final bookings = repo.bookings.reversed.toList();

    return Scaffold(
      body: bookings.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.event_note_outlined,
                      size: 64, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  Text('No bookings yet',
                      style: TextStyle(color: Colors.grey.shade600)),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: bookings.length,
              itemBuilder: (ctx, i) {
                final b = bookings[i];
                final customer = repo.findCustomer(b.customerId);
                final stock = repo.findCylinder(b.type);
                final amount =
                    stock != null ? stock.price * b.quantity : 0.0;

                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              '#${b.id}',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: _statusColor(b.status)
                                    .withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                b.status.label,
                                style: TextStyle(
                                  color: _statusColor(b.status),
                                  fontWeight: FontWeight.w600,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(customer?.name ?? 'Unknown',
                            style: const TextStyle(fontWeight: FontWeight.w500)),
                        Text(
                          '${b.type.label} × ${b.quantity}  •  ₹${amount.toStringAsFixed(0)}',
                          style: TextStyle(color: Colors.grey.shade600),
                        ),
                        Text('Booked: ${b.bookingDate}',
                            style: TextStyle(
                                fontSize: 12, color: Colors.grey.shade500)),
                        if (b.status == BookingStatus.pending) ...[
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: () async {
                                    final err = await repo.cancelBooking(b.id);
                                    if (context.mounted) {
                                      showAppSnackBar(
                                        context,
                                        err ?? 'Booking cancelled',
                                        isError: err != null,
                                      );
                                    }
                                  },
                                  child: const Text('Cancel'),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: () async {
                                    final err =
                                        await repo.deliverBooking(b.id);
                                    if (context.mounted) {
                                      showAppSnackBar(
                                        context,
                                        err ?? 'Delivered & bill generated',
                                        isError: err != null,
                                      );
                                    }
                                  },
                                  child: const Text('Deliver'),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateBooking(context),
        icon: const Icon(Icons.add_rounded),
        label: const Text('New Booking'),
      ),
    );
  }

  Future<void> _showCreateBooking(BuildContext context) async {
    final repo = context.read<GamsRepository>();
    final customers = repo.customers;
    if (customers.isEmpty) {
      showAppSnackBar(context, 'Add a customer first', isError: true);
      return;
    }

    Customer? selected = customers.first;
    CylinderType type = CylinderType.kg14;
    final qtyCtrl = TextEditingController(text: '1');

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('New Booking',
                  style: Theme.of(ctx).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      )),
              const SizedBox(height: 16),
              DropdownButtonFormField<Customer>(
                value: selected,
                decoration: const InputDecoration(labelText: 'Customer'),
                items: customers
                    .map((c) => DropdownMenuItem(
                          value: c,
                          child: Text('${c.name} (#${c.id})'),
                        ))
                    .toList(),
                onChanged: (v) => setLocal(() => selected = v),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<CylinderType>(
                value: type,
                decoration: const InputDecoration(labelText: 'Cylinder Type'),
                items: CylinderType.values
                    .map((t) => DropdownMenuItem(
                          value: t,
                          child: Text(t.label),
                        ))
                    .toList(),
                onChanged: (v) => setLocal(() => type = v ?? type),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: qtyCtrl,
                decoration: const InputDecoration(labelText: 'Quantity'),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () async {
                  if (selected == null) return;
                  final err = await repo.createBooking(
                    customerId: selected!.id,
                    type: type,
                    quantity: int.tryParse(qtyCtrl.text) ?? 1,
                  );
                  if (ctx.mounted) {
                    if (err == null) Navigator.pop(ctx);
                    if (context.mounted) {
                      showAppSnackBar(context, err ?? 'Booking created',
                          isError: err != null);
                    }
                  }
                },
                child: const Text('Create Booking'),
              ),
            ],
          ),
        ),
      ),
    );

    qtyCtrl.dispose();
  }
}
