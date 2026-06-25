import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/models.dart';
import '../services/gams_repository.dart';
import '../theme/app_theme.dart';

class DeliveryScreen extends StatelessWidget {
  const DeliveryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final repo = context.watch<GamsRepository>();
    final pending = repo.pendingDeliveries;

    return pending.isEmpty
        ? Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.local_shipping_outlined,
                    size: 64, color: Colors.grey.shade400),
                const SizedBox(height: 12),
                Text('No pending deliveries',
                    style: TextStyle(color: Colors.grey.shade600)),
              ],
            ),
          )
        : ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: pending.length,
            itemBuilder: (ctx, i) {
              final b = pending[i];
              final customer = repo.findCustomer(b.customerId);
              final stock = repo.findCylinder(b.type);
              final amount =
                  stock != null ? stock.price * b.quantity : 0.0;

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryOrange
                                  .withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.local_shipping_rounded,
                              color: AppTheme.primaryOrange,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Booking #${b.id}',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                Text(
                                  customer?.name ?? 'Unknown',
                                  style: TextStyle(color: Colors.grey.shade600),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '₹${amount.toStringAsFixed(0)}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                              color: AppTheme.accentBlue,
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 24),
                      _InfoRow(Icons.phone, customer?.phone ?? '-'),
                      const SizedBox(height: 6),
                      _InfoRow(Icons.location_on_outlined,
                          customer?.address ?? '-'),
                      const SizedBox(height: 6),
                      _InfoRow(Icons.propane_tank_outlined,
                          '${b.type.label} × ${b.quantity}'),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () => _confirmDelivery(context, b, customer, amount),
                          icon: const Icon(Icons.check_circle_outline),
                          label: const Text('Confirm Delivery'),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
  }

  Future<void> _confirmDelivery(
    BuildContext context,
    Booking booking,
    dynamic customer,
    double amount,
  ) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (d) => AlertDialog(
        title: const Text('Confirm Delivery'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Customer: ${customer?.name ?? "Unknown"}'),
            Text('Cylinder: ${booking.type.label} × ${booking.quantity}'),
            Text('Amount: ₹${amount.toStringAsFixed(2)}'),
            const SizedBox(height: 8),
            const Text('Deliver cylinder to customer?'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(d, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(d, true),
            child: const Text('Deliver'),
          ),
        ],
      ),
    );

    if (ok == true && context.mounted) {
      final err = await context.read<GamsRepository>().deliverBooking(booking.id);
      if (context.mounted) {
        showAppSnackBar(
          context,
          err ?? 'Delivered! Bill generated & slip saved.',
          isError: err != null,
        );
      }
    }
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _InfoRow(this.icon, this.text);

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: Colors.grey.shade600),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: TextStyle(color: Colors.grey.shade700))),
      ],
    );
  }
}
