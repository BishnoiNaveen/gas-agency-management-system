import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/gams_repository.dart';
import '../theme/app_theme.dart';

class BillingScreen extends StatelessWidget {
  const BillingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final repo = context.watch<GamsRepository>();
    final bills = repo.bills.reversed.toList();
    final stats = repo.getDashboardStats();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: _RevenueChip(
                  label: 'Collected',
                  amount: stats.totalRevenue,
                  color: AppTheme.successGreen,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _RevenueChip(
                  label: 'Pending',
                  amount: stats.pendingAmount,
                  color: AppTheme.dangerRed,
                ),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () async {
                final path = await repo.exportBillsCsv();
                if (context.mounted) {
                  showAppSnackBar(context, 'Exported to:\n$path');
                }
              },
              icon: const Icon(Icons.download_rounded),
              label: const Text('Export Bills to CSV'),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Expanded(
          child: bills.isEmpty
              ? Center(
                  child: Text('No bills yet',
                      style: TextStyle(color: Colors.grey.shade600)),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: bills.length,
                  itemBuilder: (ctx, i) {
                    final bill = bills[i];
                    final customer = repo.findCustomer(bill.customerId);
                    return Card(
                      margin: const EdgeInsets.only(bottom: 10),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: bill.paid
                              ? AppTheme.successGreen.withValues(alpha: 0.15)
                              : AppTheme.dangerRed.withValues(alpha: 0.15),
                          child: Icon(
                            bill.paid
                                ? Icons.check_rounded
                                : Icons.pending_rounded,
                            color: bill.paid
                                ? AppTheme.successGreen
                                : AppTheme.dangerRed,
                          ),
                        ),
                        title: Text(
                          'Bill #${bill.id}',
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        subtitle: Text(
                          '${customer?.name ?? "Unknown"}  •  Booking #${bill.bookingId}\n${bill.billDate}',
                        ),
                        isThreeLine: true,
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '₹${bill.amount.toStringAsFixed(0)}',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            Text(
                              bill.paid ? 'Paid' : 'Unpaid',
                              style: TextStyle(
                                fontSize: 11,
                                color: bill.paid
                                    ? AppTheme.successGreen
                                    : AppTheme.dangerRed,
                              ),
                            ),
                          ],
                        ),
                        onTap: bill.paid
                            ? null
                            : () async {
                                final ok = await showDialog<bool>(
                                  context: context,
                                  builder: (d) => AlertDialog(
                                    title: const Text('Mark as Paid'),
                                    content: Text(
                                      'Confirm payment of ₹${bill.amount.toStringAsFixed(2)}?',
                                    ),
                                    actions: [
                                      TextButton(
                                        onPressed: () =>
                                            Navigator.pop(d, false),
                                        child: const Text('Cancel'),
                                      ),
                                      ElevatedButton(
                                        onPressed: () =>
                                            Navigator.pop(d, true),
                                        child: const Text('Confirm'),
                                      ),
                                    ],
                                  ),
                                );
                                if (ok == true && context.mounted) {
                                  final err =
                                      await repo.markBillPaid(bill.id);
                                  if (context.mounted) {
                                    showAppSnackBar(
                                      context,
                                      err ?? 'Payment recorded',
                                      isError: err != null,
                                    );
                                  }
                                }
                              },
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}

class _RevenueChip extends StatelessWidget {
  final String label;
  final double amount;
  final Color color;

  const _RevenueChip({
    required this.label,
    required this.amount,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
            Text(
              '₹${amount.toStringAsFixed(0)}',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
