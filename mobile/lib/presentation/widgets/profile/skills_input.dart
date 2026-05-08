import 'package:flutter/material.dart';
import 'package:gighub/core/constants/app_sizes.dart';

/// Chip-based skills input widget.
///
/// Users can type to add skills and tap X to remove them. Limited to 15 skills.
class SkillsInput extends StatefulWidget {
  final List<String> skills;
  final ValueChanged<List<String>> onChanged;
  final int maxSkills;

  const SkillsInput({
    super.key,
    required this.skills,
    required this.onChanged,
    this.maxSkills = 15,
  });

  @override
  State<SkillsInput> createState() => _SkillsInputState();
}

class _SkillsInputState extends State<SkillsInput> {
  final _textController = TextEditingController();
  final _focusNode = FocusNode();

  // Common skill suggestions for autocomplete
  static const _suggestions = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Graphic Design',
    'Content Writing',
    'Video Editing',
    'Photography',
    'Digital Marketing',
    'SEO',
    'Data Entry',
    'Translation',
    'Voice Over',
    'Music Production',
    '3D Modeling',
    'Animation',
    'Python',
    'JavaScript',
    'React',
    'Flutter',
    'Node.js',
    'Photoshop',
    'Illustrator',
    'Figma',
    'WordPress',
    'Shopify',
    'Social Media',
    'Copywriting',
    'Proofreading',
    'Virtual Assistant',
  ];

  void _addSkill(String skill) {
    final trimmed = skill.trim();
    if (trimmed.isEmpty) return;
    if (widget.skills.length >= widget.maxSkills) return;
    if (widget.skills.contains(trimmed)) return;

    final updated = [...widget.skills, trimmed];
    widget.onChanged(updated);
    _textController.clear();
    _focusNode.requestFocus();
  }

  void _removeSkill(int index) {
    final updated = [...widget.skills];
    updated.removeAt(index);
    widget.onChanged(updated);
  }

  @override
  void dispose() {
    _textController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Label
        Row(
          children: [
            Text(
              'Skills',
              style: theme.textTheme.bodyLarge?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(width: AppSizes.space4),
            Text(
              '(${widget.skills.length}/${widget.maxSkills})',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSizes.space8),

        // Input field
        TextField(
          controller: _textController,
          focusNode: _focusNode,
          decoration: InputDecoration(
            hintText: 'Type a skill and press Enter',
            prefixIcon: const Icon(Icons.add_circle_outline, size: 20),
            suffixIcon: widget.skills.isEmpty
                ? null
                : IconButton(
                    icon: const Icon(Icons.clear_all, size: 20),
                    onPressed: () => widget.onChanged([]),
                    tooltip: 'Clear all',
                  ),
          ),
          onSubmitted: (value) => _addSkill(value),
        ),
        const SizedBox(height: AppSizes.space8),

        // Suggestions
        if (widget.skills.length < widget.maxSkills)
          Wrap(
            spacing: AppSizes.space8,
            runSpacing: AppSizes.space8,
            children: _suggestions
                .where((s) => !widget.skills.contains(s))
                .take(10)
                .map((suggestion) {
                  return ActionChip(
                    label: Text(
                      suggestion,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: theme.colorScheme.onSecondaryContainer,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    avatar: const Icon(Icons.add, size: 14),
                    onPressed: () => _addSkill(suggestion),
                    backgroundColor: theme.colorScheme.secondaryContainer,
                    visualDensity: VisualDensity.compact,
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    padding: EdgeInsets.zero,
                  );
                })
                .toList(),
          ),
        const SizedBox(height: AppSizes.space8),

        // Selected skills chips
        Wrap(
          spacing: AppSizes.space8,
          runSpacing: AppSizes.space8,
          children: List.generate(widget.skills.length, (index) {
            return Chip(
              label: Text(widget.skills[index]),
              deleteIcon: Icon(
                Icons.close,
                size: 16,
                color: theme.colorScheme.onSecondaryContainer,
              ),
              onDeleted: () => _removeSkill(index),
              backgroundColor: theme.colorScheme.secondaryContainer,
              labelStyle: theme.textTheme.labelSmall?.copyWith(
                color: theme.colorScheme.onSecondaryContainer,
                fontWeight: FontWeight.w600,
              ),
              visualDensity: VisualDensity.compact,
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              padding: EdgeInsets.zero,
            );
          }),
        ),
      ],
    );
  }
}
