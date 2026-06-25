import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/gams_repository.dart';
import '../theme/app_theme.dart';
import 'billing_screen.dart';
import 'bookings_screen.dart';
import 'customers_screen.dart';
import 'dashboard_screen.dart';
import 'delivery_screen.dart';
import 'inventory_screen.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _index = 0;

  static const _titles = [
    'Dashboard',
    'Customers',
    'Inventory',
    'Bookings',
    'Billing',
    'Delivery',
  ];

  final _screens = const [
    DashboardScreen(),
    CustomersScreen(),
    InventoryScreen(),
    BookingsScreen(),
    BillingScreen(),
    DeliveryScreen(),
  ];

  void _logout() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final repo = context.watch<GamsRepository>();

    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_index]),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Chip(
              avatar: const CircleAvatar(
                backgroundColor: AppTheme.primaryOrange,
                child: Icon(Icons.admin_panel_settings,
                    size: 16, color: Colors.white),
              ),
              label: Text(
                GamsRepository.adminUsername.split(' ').first,
                style: const TextStyle(fontSize: 12),
              ),
              backgroundColor: Colors.white.withValues(alpha: 0.15),
              side: BorderSide.none,
              labelStyle: const TextStyle(color: Colors.white),
            ),
          ),
          IconButton(
            tooltip: 'Logout',
            onPressed: _logout,
            icon: const Icon(Icons.logout_rounded),
          ),
        ],
      ),
      body: repo.isLoaded
          ? AnimatedSwitcher(
              duration: const Duration(milliseconds: 250),
              child: _screens[_index],
            )
          : const Center(child: CircularProgressIndicator()),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard_rounded),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_outline),
            selectedIcon: Icon(Icons.people_rounded),
            label: 'Customers',
          ),
          NavigationDestination(
            icon: Icon(Icons.propane_tank_outlined),
            selectedIcon: Icon(Icons.propane_tank_rounded),
            label: 'Stock',
          ),
          NavigationDestination(
            icon: Icon(Icons.event_note_outlined),
            selectedIcon: Icon(Icons.event_note_rounded),
            label: 'Bookings',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long_rounded),
            label: 'Bills',
          ),
          NavigationDestination(
            icon: Icon(Icons.local_shipping_outlined),
            selectedIcon: Icon(Icons.local_shipping_rounded),
            label: 'Delivery',
          ),
        ],
      ),
    );
  }
}
