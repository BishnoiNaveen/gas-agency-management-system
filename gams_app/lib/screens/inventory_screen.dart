import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/models.dart';
import '../services/gams_repository.dart';
import '../theme/app_theme.dart';

class InventoryScreen extends StatelessWidget {
  const InventoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cylinders = context.watch<GamsRepository>().cylinders;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ...cylinders.map((s) => _StockCard(stock: s)),
        const SizedBox(height: 80),
      ],
    );
  }
}

class _StockCard extends StatelessWidget {
  final CylinderStock stock;

  const _StockCard({required this.stock});

  Color _typeColor() {
    switch (stock.type) {
      case CylinderType.kg5:
        return AppTheme.successGreen;
      case CylinderType.kg14:
        return AppTheme.accentBlue;
      case CylinderType.kg19:
        return AppTheme.primaryOrange;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _typeColor();
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
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    stock.type.label,
                    style: TextStyle(
                      color: color,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const Spacer(),
                Text(
                  '₹${stock.price.toStringAsFixed(0)}',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.accentBlue,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _MiniStat(
                    label: 'Filled',
                    value: '${stock.filled}',
                    icon: Icons.check_circle_outline,
                    color: AppTheme.successGreen,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _MiniStat(
                    label: 'Empty',
                    value: '${stock.empty}',
                    icon: Icons.invert_colors_off_outlined,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: () => _showUpdateDialog(context, stock),
              icon: const Icon(Icons.edit_rounded),
              label: const Text('Update Stock / Price'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showUpdateDialog(BuildContext context, CylinderStock stock) async {
    final filledCtrl = TextEditingController(text: '0');
    final emptyCtrl = TextEditingController(text: '0');
    final priceCtrl = TextEditingController(text: stock.price.toStringAsFixed(0));

    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Update ${stock.type.label}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: filledCtrl,
              decoration: const InputDecoration(labelText: 'Add filled cylinders'),
              keyboardType: TextInputType.number,
            ),
            TextField(
              controller: emptyCtrl,
              decoration: const InputDecoration(labelText: 'Add empty cylinders'),
              keyboardType: TextInputType.number,
            ),
            TextField(
              controller: priceCtrl,
              decoration: const InputDecoration(labelText: 'New price (₹)'),
              keyboardType: TextInputType.number,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final err = await context.read<GamsRepository>().updateCylinderStock(
                    type: stock.type,
                    addFilled: int.tryParse(filledCtrl.text) ?? 0,
                    addEmpty: int.tryParse(emptyCtrl.text) ?? 0,
                    price: double.tryParse(priceCtrl.text) ?? stock.price,
                  );
              if (ctx.mounted) Navigator.pop(ctx);
              if (context.mounted) {
                showAppSnackBar(context, err ?? 'Inventory updated', isError: err != null);
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );

    filledCtrl.dispose();
    emptyCtrl.dispose();
    priceCtrl.dispose();
  }
}

class _MiniStat extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _MiniStat({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 16)),
              Text(label, style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
            ],
          ),
        ],
      ),
    );
  }
}
