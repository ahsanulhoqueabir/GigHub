import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/data/providers/category_provider.dart';
import 'package:gighub/data/providers/gig_provider.dart';
import 'package:gighub/data/models/gig_model.dart';

/// Multi-step gig creation screen.
class CreateGigScreen extends ConsumerStatefulWidget {
  const CreateGigScreen({super.key});

  @override
  ConsumerState<CreateGigScreen> createState() => _CreateGigScreenState();
}

class _CreateGigScreenState extends ConsumerState<CreateGigScreen> {
  final _pageController = PageController();
  int _currentStep = 0;

  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  String? _categoryId;

  // Package controllers
  late List<_PackageFormData> _packages;

  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _packages = [
      _PackageFormData(
        tier: 'basic',
        titleCtrl: TextEditingController(),
        descCtrl: TextEditingController(),
        priceCtrl: TextEditingController(text: '0'),
        daysCtrl: TextEditingController(text: '1'),
        revisionsCtrl: TextEditingController(text: '3'),
      ),
      _PackageFormData(
        tier: 'standard',
        titleCtrl: TextEditingController(),
        descCtrl: TextEditingController(),
        priceCtrl: TextEditingController(text: '0'),
        daysCtrl: TextEditingController(text: '3'),
        revisionsCtrl: TextEditingController(text: '5'),
      ),
      _PackageFormData(
        tier: 'premium',
        titleCtrl: TextEditingController(),
        descCtrl: TextEditingController(),
        priceCtrl: TextEditingController(text: '0'),
        daysCtrl: TextEditingController(text: '7'),
        revisionsCtrl: TextEditingController(text: '999'),
      ),
    ];
  }

  @override
  void dispose() {
    _pageController.dispose();
    _titleCtrl.dispose();
    _descCtrl.dispose();
    for (final p in _packages) {
      p.titleCtrl.dispose();
      p.descCtrl.dispose();
      p.priceCtrl.dispose();
      p.daysCtrl.dispose();
      p.revisionsCtrl.dispose();
    }
    super.dispose();
  }

  void _next() {
    if (_pageController.page!.toInt() < 3) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      setState(() => _currentStep = _pageController.page!.toInt() + 1);
    }
  }

  void _prev() {
    if (_pageController.page!.toInt() > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      setState(() => _currentStep = _pageController.page!.toInt() - 1);
    }
  }

  void _publish() {
    if (!_formKey.currentState!.validate()) return;

    final notifier = ref.read(gigFormNotifierProvider.notifier);
    notifier.createGig(
      CreateGigInput(
        title: _titleCtrl.text,
        categoryId: _categoryId!,
        description: _descCtrl.text,
        packages: _packages
            .where(
              (p) =>
                  p.titleCtrl.text.isNotEmpty &&
                  double.tryParse(p.priceCtrl.text) != null &&
                  double.parse(p.priceCtrl.text) > 0,
            )
            .map(
              (p) => CreatePackageInput(
                tier: p.tier,
                title: p.titleCtrl.text,
                description: p.descCtrl.text,
                price: double.parse(p.priceCtrl.text),
                deliveryDays: int.tryParse(p.daysCtrl.text) ?? 1,
                revisions: int.tryParse(p.revisionsCtrl.text) ?? 0,
                features: p.features,
              ),
            )
            .toList(),
      ),
    );

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Gig published! (UI only)')));
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Gig'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: LinearProgressIndicator(value: (_currentStep + 1) / 4),
        ),
      ),
      body: Form(
        key: _formKey,
        child: PageView(
          controller: _pageController,
          physics: const NeverScrollableScrollPhysics(),
          children: [
            // Step 1: Title & Category
            _StepPage(
              title: 'Step 1: Title & Category',
              child: Column(
                children: [
                  TextFormField(
                    controller: _titleCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Gig Title',
                      hintText: 'E.g., I will design a modern logo...',
                    ),
                    validator: (v) =>
                        (v?.length ?? 0) < 10 ? 'At least 10 characters' : null,
                  ),
                  const SizedBox(height: AppSizes.space16),
                  categoriesAsync.when(
                    data: (cats) => DropdownButtonFormField<String>(
                      decoration: const InputDecoration(labelText: 'Category'),
                      items: cats
                          .map(
                            (c) => DropdownMenuItem(
                              value: c.id,
                              child: Text(c.name),
                            ),
                          )
                          .toList(),
                      onChanged: (v) => setState(() => _categoryId = v),
                      validator: (v) => v == null ? 'Select a category' : null,
                    ),
                    loading: () => const CircularProgressIndicator(),
                    error: (_, __) => const Text('Error loading categories'),
                  ),
                ],
              ),
            ),
            // Step 2: Description
            _StepPage(
              title: 'Step 2: Description',
              child: TextFormField(
                controller: _descCtrl,
                maxLines: 8,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  hintText: 'Describe your gig in detail...',
                  alignLabelWithHint: true,
                ),
                validator: (v) =>
                    (v?.length ?? 0) < 50 ? 'At least 50 characters' : null,
              ),
            ),
            // Step 3: Packages
            _StepPage(
              title: 'Step 3: Packages',
              child: ListView.separated(
                shrinkWrap: true,
                itemCount: 3,
                separatorBuilder: (_, __) =>
                    const SizedBox(height: AppSizes.space16),
                itemBuilder: (_, i) => _PackageForm(data: _packages[i]),
              ),
            ),
            // Step 4: Review
            _StepPage(
              title: 'Step 4: Review & Publish',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _ReviewRow(label: 'Title', value: _titleCtrl.text),
                  _ReviewRow(
                    label: 'Category',
                    value: _categoryId != null ? 'Selected' : 'Not set',
                  ),
                  _ReviewRow(
                    label: 'Description',
                    value: _descCtrl.text,
                    maxLines: 3,
                  ),
                  const SizedBox(height: AppSizes.space16),
                  Text('Packages:', style: theme.textTheme.titleSmall),
                  ..._packages
                      .where((p) => p.titleCtrl.text.isNotEmpty)
                      .map(
                        (p) => ListTile(
                          title: Text('${p.titleCtrl.text} (${p.tier})'),
                          subtitle: Text(
                            '\u09F3${p.priceCtrl.text} - ${p.daysCtrl.text} days',
                          ),
                        ),
                      ),
                  const SizedBox(height: AppSizes.space24),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: _publish,
                      child: const Text('Publish Gig'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(AppSizes.space16),
        child: Row(
          children: [
            if (_currentStep > 0) ...[
              Expanded(
                child: OutlinedButton(
                  onPressed: _prev,
                  child: const Text('Back'),
                ),
              ),
              const SizedBox(width: AppSizes.space16),
            ],
            Expanded(
              child: FilledButton(
                onPressed: _currentStep < 3 ? _next : _publish,
                child: Text(_currentStep < 3 ? 'Next' : 'Publish'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PackageFormData {
  final String tier;
  final TextEditingController titleCtrl;
  final TextEditingController descCtrl;
  final TextEditingController priceCtrl;
  final TextEditingController daysCtrl;
  final TextEditingController revisionsCtrl;
  List<String> features;

  _PackageFormData({
    required this.tier,
    required this.titleCtrl,
    required this.descCtrl,
    required this.priceCtrl,
    required this.daysCtrl,
    required this.revisionsCtrl,
    this.features = const [],
  });
}

class _StepPage extends StatelessWidget {
  final String title;
  final Widget child;

  const _StepPage({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSizes.space16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: AppSizes.space16),
          Expanded(child: SingleChildScrollView(child: child)),
        ],
      ),
    );
  }
}

class _PackageForm extends StatefulWidget {
  final _PackageFormData data;
  const _PackageForm({required this.data});

  @override
  State<_PackageForm> createState() => _PackageFormState();
}

class _PackageFormState extends State<_PackageForm> {
  late List<TextEditingController> _featureCtrls;

  @override
  void initState() {
    super.initState();
    _featureCtrls = [];
  }

  void _addFeature() {
    setState(() => _featureCtrls.add(TextEditingController()));
  }

  void _removeFeature(int index) {
    setState(() {
      _featureCtrls[index].dispose();
      _featureCtrls.removeAt(index);
      widget.data.features.removeAt(index);
    });
  }

  @override
  void dispose() {
    for (final c in _featureCtrls) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tierNames = {
      'basic': 'Basic',
      'standard': 'Standard',
      'premium': 'Premium',
    };
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSizes.space12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              tierNames[widget.data.tier]!,
              style: Theme.of(
                context,
              ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: AppSizes.space8),
            TextFormField(
              controller: widget.data.titleCtrl,
              decoration: const InputDecoration(
                labelText: 'Package Title',
                isDense: true,
              ),
            ),
            const SizedBox(height: AppSizes.space8),
            TextFormField(
              controller: widget.data.descCtrl,
              decoration: const InputDecoration(
                labelText: 'Description',
                isDense: true,
              ),
              maxLines: 2,
            ),
            const SizedBox(height: AppSizes.space8),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: widget.data.priceCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Price (BDT)',
                      isDense: true,
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ),
                const SizedBox(width: AppSizes.space8),
                Expanded(
                  child: TextFormField(
                    controller: widget.data.daysCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Days',
                      isDense: true,
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ),
                const SizedBox(width: AppSizes.space8),
                Expanded(
                  child: TextFormField(
                    controller: widget.data.revisionsCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Revisions',
                      isDense: true,
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSizes.space8),
            Text('Features:', style: Theme.of(context).textTheme.labelMedium),
            ...List.generate(_featureCtrls.length, (i) {
              return Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _featureCtrls[i],
                      decoration: InputDecoration(
                        isDense: true,
                        hintText: 'Feature ${i + 1}',
                      ),
                      onChanged: (v) {
                        if (i < widget.data.features.length) {
                          widget.data.features[i] = v;
                        } else {
                          widget.data.features.add(v);
                        }
                      },
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.remove_circle, size: 20),
                    onPressed: () => _removeFeature(i),
                  ),
                ],
              );
            }),
            TextButton.icon(
              onPressed: _addFeature,
              icon: const Icon(Icons.add),
              label: const Text('Add Feature'),
            ),
          ],
        ),
      ),
    );
  }
}

class _ReviewRow extends StatelessWidget {
  final String label;
  final String value;
  final int maxLines;

  const _ReviewRow({
    required this.label,
    required this.value,
    this.maxLines = 1,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSizes.space8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: theme.colorScheme.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
          Text(
            value,
            style: theme.textTheme.bodyMedium,
            maxLines: maxLines,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
