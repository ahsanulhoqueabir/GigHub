import 'package:flutter/material.dart';

/// Displays 1-5 stars with half-star support.
class GhRatingStars extends StatelessWidget {
  final double rating;
  final double size;
  final Color? activeColor;
  final Color? inactiveColor;
  final bool showNumeric;

  const GhRatingStars({
    super.key,
    required this.rating,
    this.size = 16,
    this.activeColor,
    this.inactiveColor,
    this.showNumeric = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final active = activeColor ?? theme.colorScheme.primary;
    final inactive = inactiveColor ?? theme.colorScheme.outline;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (int i = 1; i <= 5; i++)
          Icon(
            _starIcon(i),
            size: size,
            color: i <= rating ? active : inactive,
          ),
        if (showNumeric) ...[
          const SizedBox(width: 4),
          Text(
            rating.toStringAsFixed(1),
            style: theme.textTheme.bodySmall?.copyWith(
              fontWeight: FontWeight.w600,
              color: active,
            ),
          ),
        ],
      ],
    );
  }

  IconData _starIcon(int position) {
    if (position <= rating.floor()) return Icons.star;
    if (position - rating < 1 && position - rating > 0) return Icons.star_half;
    return Icons.star_border;
  }
}
