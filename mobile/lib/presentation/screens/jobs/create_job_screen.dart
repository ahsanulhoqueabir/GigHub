import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/data/models/job_model.dart';
import 'package:gighub/data/providers/category_provider.dart';
import 'package:gighub/data/providers/job_provider.dart';
import 'package:gighub/presentation/widgets/common/gh_toast.dart';

/// Single-page job creation form.
class CreateJobScreen extends ConsumerStatefulWidget {
  const CreateJobScreen({super.key});

  @override
  ConsumerState<CreateJobScreen> createState() => _CreateJobScreenState();
}

class _CreateJobScreenState extends ConsumerState<CreateJobScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  String? _categoryId;
  String _type = 'fixed';
  final _budgetMinCtrl = TextEditingController();
  final _budgetMaxCtrl = TextEditingController();
  final _deadlineCtrl = TextEditingController();
  String _experienceLevel = 'intermediate';
  final _skillsCtrl = TextEditingController();

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _budgetMinCtrl.dispose();
    _budgetMaxCtrl.dispose();
    _deadlineCtrl.dispose();
    _skillsCtrl.dispose();
    super.dispose();
  }

  void _postJob() {
    if (!_formKey.currentState!.validate()) return;
    if (_categoryId == null) {
      GhToast.show(
        context,
        message: 'Select a category',
        type: GhToastType.warning,
      );
      return;
    }

    final notifier = ref.read(jobFormNotifierProvider.notifier);
    notifier.createJob(
      CreateJobInput(
        title: _titleCtrl.text,
        description: _descCtrl.text,
        categoryId: _categoryId!,
        type: _type,
        budgetMin: double.tryParse(_budgetMinCtrl.text) ?? 0,
        budgetMax: double.tryParse(_budgetMaxCtrl.text) ?? 0,
        deadline: _deadlineCtrl.text.isEmpty ? null : _deadlineCtrl.text,
        skillsRequired: _skillsCtrl.text
            .split(',')
            .map((s) => s.trim())
            .where((s) => s.isNotEmpty)
            .toList(),
        experienceLevel: _experienceLevel,
      ),
    );

    GhToast.show(
      context,
      message: 'Job posted! (UI only)',
      type: GhToastType.success,
    );
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final catsAsync = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Post a Job')),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSizes.space16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextFormField(
                controller: _titleCtrl,
                decoration: const InputDecoration(
                  labelText: 'Job Title',
                  hintText: 'E.g., Need a Flutter developer...',
                ),
                validator: (v) =>
                    (v?.length ?? 0) < 10 ? 'At least 10 characters' : null,
              ),
              const SizedBox(height: AppSizes.space16),
              catsAsync.when(
                data: (cats) => DropdownButtonFormField<String>(
                  decoration: const InputDecoration(
                    labelText: 'Category',
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: AppSizes.space16,
                      vertical: AppSizes.space12,
                    ),
                  ),
                  isExpanded: true,
                  items: cats
                      .map(
                        (c) => DropdownMenuItem(
                          value: c.id,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSizes.space4,
                            ),
                            child: Text(
                              c.name,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: (v) => _categoryId = v,
                ),
                loading: () => const CircularProgressIndicator(),
                error: (_, __) => const Text('Error'),
              ),
              const SizedBox(height: AppSizes.space16),
              TextFormField(
                controller: _descCtrl,
                maxLines: 5,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  alignLabelWithHint: true,
                ),
                validator: (v) =>
                    (v?.length ?? 0) < 50 ? 'At least 50 characters' : null,
              ),
              const SizedBox(height: AppSizes.space16),
              // Full-width price type selector
              Row(
                children: [
                  Expanded(
                    child: _PriceTypeChip(
                      label: 'Fixed Price',
                      icon: Icons.attach_money,
                      selected: _type == 'fixed',
                      onTap: () => setState(() => _type = 'fixed'),
                    ),
                  ),
                  const SizedBox(width: AppSizes.space12),
                  Expanded(
                    child: _PriceTypeChip(
                      label: 'Hourly',
                      icon: Icons.timer_outlined,
                      selected: _type == 'hourly',
                      onTap: () => setState(() => _type = 'hourly'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSizes.space16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _budgetMinCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Budget Min (BDT)',
                      ),
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: AppSizes.space8),
                  Expanded(
                    child: TextFormField(
                      controller: _budgetMaxCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Budget Max (BDT)',
                      ),
                      keyboardType: TextInputType.number,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSizes.space16),
              // Date picker for deadline
              TextFormField(
                controller: _deadlineCtrl,
                readOnly: true,
                decoration: InputDecoration(
                  labelText: 'Deadline',
                  hintText: 'Optional — tap to pick',
                  suffixIcon: Icon(
                    Icons.calendar_today,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: AppSizes.space16,
                    vertical: AppSizes.space12,
                  ),
                ),
                onTap: () async {
                  final now = DateTime.now();
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: now.add(const Duration(days: 7)),
                    firstDate: now,
                    lastDate: now.add(const Duration(days: 365)),
                    builder: (context, child) {
                      return Theme(
                        data: Theme.of(context).copyWith(
                          datePickerTheme: DatePickerThemeData(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(
                                AppSizes.radiusMd,
                              ),
                            ),
                          ),
                        ),
                        child: child!,
                      );
                    },
                  );
                  if (picked != null) {
                    _deadlineCtrl.text =
                        '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
                  }
                },
              ),
              const SizedBox(height: AppSizes.space16),
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Experience Level',
                ),
                initialValue: _experienceLevel,
                items: const [
                  DropdownMenuItem(value: 'entry', child: Text('Entry')),
                  DropdownMenuItem(
                    value: 'intermediate',
                    child: Text('Intermediate'),
                  ),
                  DropdownMenuItem(value: 'expert', child: Text('Expert')),
                ],
                onChanged: (v) => setState(() => _experienceLevel = v!),
              ),
              const SizedBox(height: AppSizes.space16),
              TextFormField(
                controller: _skillsCtrl,
                decoration: const InputDecoration(
                  labelText: 'Skills Required',
                  hintText: 'e.g., Flutter, Dart, Firebase (comma separated)',
                ),
              ),
              const SizedBox(height: AppSizes.space24),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _postJob,
                  child: const Text('Post Job'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Full-width price type selection chip.
class _PriceTypeChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const _PriceTypeChip({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = selected
        ? theme.colorScheme.primary
        : theme.colorScheme.outline.withValues(alpha: 0.5);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          vertical: AppSizes.space12,
          horizontal: AppSizes.space16,
        ),
        decoration: BoxDecoration(
          border: Border.all(color: color, width: selected ? 2 : 1),
          borderRadius: BorderRadius.circular(AppSizes.radiusMd),
          color: selected ? color.withValues(alpha: 0.08) : null,
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: AppSizes.space4),
            Text(
              label,
              style: theme.textTheme.labelMedium?.copyWith(
                color: color,
                fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
