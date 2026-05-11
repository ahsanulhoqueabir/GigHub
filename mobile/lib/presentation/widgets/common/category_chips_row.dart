import 'package:flutter/material.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/core/utils/category_icon_mapper.dart';
import 'package:gighub/data/models/category_model.dart';

/// Horizontal scroll of category chips for filtering.
///
/// Each chip shows the category icon (resolved via [CategoryIconMapper])
/// alongside its name. Icons come from Flutter's built-in Material Icons.
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
            icon: Icons.grid_view_rounded,
            isSelected: selectedSlug == null,
            onTap: () => onSelected(null),
          ),
          ...categories.map(
            (cat) => _Chip(
              label: cat.name,
              icon: CategoryIconMapper.resolve(cat.icon),
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
  final IconData? icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _Chip({
    required this.label,
    this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(right: AppSizes.space8),
      child: FilterChip(
        label: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon ?? Icons.category_outlined, size: 18),
            const SizedBox(width: 6),
            Text(label),
          ],
        ),
        selected: isSelected,
        onSelected: (_) => onTap(),
        backgroundColor: theme.colorScheme.secondaryContainer,
        selectedColor: theme.colorScheme.primaryContainer,
        checkmarkColor: theme.colorScheme.primary,
        labelStyle: theme.textTheme.labelSmall?.copyWith(
          color: isSelected
              ? theme.colorScheme.onPrimaryContainer
              : theme.colorScheme.onSecondaryContainer,
          fontWeight: FontWeight.w600,
        ),
        visualDensity: VisualDensity.compact,
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
    );
  }
}
