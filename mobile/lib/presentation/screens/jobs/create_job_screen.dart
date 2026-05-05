import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/data/models/job_model.dart';
import 'package:gighub/data/providers/category_provider.dart';
import 'package:gighub/data/providers/job_provider.dart';

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
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Select a category')));
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

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Job posted! (UI only)')));
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
                  decoration: const InputDecoration(labelText: 'Category'),
                  items: cats
                      .map(
                        (c) =>
                            DropdownMenuItem(value: c.id, child: Text(c.name)),
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
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'fixed', label: Text('Fixed Price')),
                  ButtonSegment(value: 'hourly', label: Text('Hourly')),
                ],
                selected: {_type},
                onSelectionChanged: (v) => setState(() => _type = v.first),
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
              TextFormField(
                controller: _deadlineCtrl,
                decoration: const InputDecoration(
                  labelText: 'Deadline (YYYY-MM-DD)',
                  hintText: 'Optional',
                ),
                keyboardType: TextInputType.datetime,
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
