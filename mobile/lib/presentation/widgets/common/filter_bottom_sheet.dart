import 'package:flutter/material.dart';
import 'package:gighub/core/constants/app_sizes.dart';

/// A filter section configuration.
class FilterSection {
  final String title;
  final String key;
  final List<FilterOption> options;
  final bool isMultiSelect;

  const FilterSection({
    required this.title,
    required this.key,
    required this.options,
    this.isMultiSelect = false,
  });
}

class FilterOption {
  final String label;
  final String value;

  const FilterOption({required this.label, required this.value});
}

/// Reusable filter bottom sheet.
///
/// Shows sections of options. Supports single-select and multi-select.
class FilterBottomSheet extends StatefulWidget {
  final List<FilterSection> sections;
  final Map<String, dynamic> initialValues;
  final void Function(Map<String, dynamic>) onApply;
  final VoidCallback onReset;

  const FilterBottomSheet({
    super.key,
    required this.sections,
    required this.initialValues,
    required this.onApply,
    required this.onReset,
  });

  @override
  State<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<FilterBottomSheet> {
  late Map<String, dynamic> _values;

  @override
  void initState() {
    super.initState();
    _values = Map.from(widget.initialValues);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.5,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(AppSizes.radiusLg),
            ),
          ),
          child: Column(
            children: [
              // Handle
              Container(
                margin: const EdgeInsets.only(top: AppSizes.space8),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: theme.colorScheme.onSurfaceVariant.withValues(
                    alpha: 0.3,
                  ),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              // Header
              Padding(
                padding: const EdgeInsets.all(AppSizes.space16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Filters',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        _values.clear();
                        setState(() {});
                        widget.onReset();
                      },
                      child: const Text('Reset'),
                    ),
                  ],
                ),
              ),
              // Sections
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSizes.space16,
                  ),
                  children: widget.sections
                      .map((section) => _buildSection(section, theme))
                      .toList(),
                ),
              ),
              // Apply button
              Padding(
                padding: const EdgeInsets.all(AppSizes.space16),
                child: SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () {
                      widget.onApply(_values);
                      Navigator.of(context).pop();
                    },
                    child: const Text('Apply Filters'),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSection(FilterSection section, ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSizes.space16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            section.title,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppSizes.space8),
          Wrap(
            spacing: AppSizes.space8,
            runSpacing: AppSizes.space4,
            children: section.options.map((opt) {
              final isSelected = section.isMultiSelect
                  ? (_values[section.key] as List? ?? []).contains(opt.value)
                  : _values[section.key] == opt.value;
              return FilterChip(
                label: Text(opt.label),
                selected: isSelected,
                onSelected: (selected) {
                  setState(() {
                    if (section.isMultiSelect) {
                      final list = List<String>.from(
                        _values[section.key] ?? [],
                      );
                      if (selected) {
                        list.add(opt.value);
                      } else {
                        list.remove(opt.value);
                      }
                      _values[section.key] = list;
                    } else {
                      _values[section.key] = selected ? opt.value : null;
                    }
                  });
                },
                backgroundColor: theme.colorScheme.secondaryContainer,
                selectedColor: theme.colorScheme.primaryContainer,
                labelStyle: theme.textTheme.labelSmall?.copyWith(
                  color: isSelected
                      ? theme.colorScheme.onPrimaryContainer
                      : theme.colorScheme.onSecondaryContainer,
                  fontWeight: FontWeight.w600,
                ),
                visualDensity: VisualDensity.compact,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
