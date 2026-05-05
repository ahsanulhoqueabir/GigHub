import 'package:flutter/material.dart';
import 'package:gig_hub/core/utils/formatters.dart';

/// Price display widget showing ৳-formatted values.
class GhPriceTag extends StatelessWidget {
  final num amount;
  final TextStyle? style;

  const GhPriceTag({super.key, required this.amount, this.style});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Text(
      Formatters.price(amount),
      style:
          style ??
          theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: theme.colorScheme.primary,
          ),
    );
  }
}
