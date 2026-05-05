import 'package:flutter/material.dart';
import 'package:gig_hub/core/constants/app_sizes.dart';
import 'package:gig_hub/data/models/category_model.dart';

/// Horizontal scroll of category chips for filtering.
class CategoryChipsRow extends StatelessWidget {
  final List<Category> categories;
  final String? selectedSlug;
  final ValueChanged<String?> onSelected;

  const CategoryChipsRow({
    super.key,
    required this.categories,
    this.selectedSlug,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSizes.space16),
        children: [
          _Chip(
            label: 'All',
            isSelected: selectedSlug == null,
            onTap: () => onSelected(null),
          ),
          ...categories.map(
            (cat) => _Chip(
              label: cat.name,
              isSelected: selectedSlug == cat.slug,
              onTap: () => onSelected(cat.slug),
            ),
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _Chip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(right: AppSizes.space8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => onTap(),
        selectedColor: theme.colorScheme.primaryContainer,
        checkmarkColor: theme.colorScheme.primary,
        visualDensity: VisualDensity.compact,
      ),
    );
  }
}
