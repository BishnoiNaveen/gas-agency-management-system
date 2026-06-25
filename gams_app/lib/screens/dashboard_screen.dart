import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/gams_repository.dart';
import '../theme/app_theme.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final stats = context.watch<GamsRepository>().getDashboardStats();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.accentBlue, Color(0xFF0077B6)],
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome back!',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  GamsRepository.agencyName,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white70,
                      ),
                ),
                const SizedBox(height: 2),
                Text(
                  GamsRepository.adminUsername,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white70,
                      ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _HeroStat(
                      label: 'Revenue',
                      value: '₹${stats.totalRevenue.toStringAsFixed(0)}',
                    ),
                    const SizedBox(width: 24),
                    _HeroStat(
                      label: 'Pending',
                      value: '₹${stats.pendingAmount.toStringAsFixed(0)}',
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Overview',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.3,
            children: [
              StatCard(
                title: 'Active Customers',
                value: '${stats.activeCustomers}',
                icon: Icons.people_rounded,
                color: AppTheme.accentBlue,
              ),
              StatCard(
                title: 'Filled Cylinders',
                value: '${stats.totalFilled}',
                icon: Icons.propane_tank_rounded,
                color: AppTheme.primaryOrange,
              ),
              StatCard(
                title: 'Empty Cylinders',
                value: '${stats.totalEmpty}',
                icon: Icons.recycling_rounded,
                color: AppTheme.successGreen,
              ),
              StatCard(
                title: 'Pending Bookings',
                value: '${stats.pendingBookings}',
                icon: Icons.pending_actions_rounded,
                color: AppTheme.warningAmber,
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            'Bookings & Billing',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _RowStat('Delivered', stats.deliveredBookings, Colors.green),
                  const Divider(),
                  _RowStat('Cancelled', stats.cancelledBookings, Colors.red),
                  const Divider(),
                  _RowStat('Paid Bills', stats.paidBills, AppTheme.successGreen),
                  const Divider(),
                  _RowStat('Unpaid Bills', stats.unpaidBills, AppTheme.dangerRed),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroStat extends StatelessWidget {
  final String label;
  final String value;

  const _HeroStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

class _RowStat extends StatelessWidget {
  final String label;
  final int value;
  final Color color;

  const _RowStat(this.label, this.value, this.color);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(
            '$value',
            style: TextStyle(fontWeight: FontWeight.bold, color: color),
          ),
        ],
      ),
    );
  }
}
