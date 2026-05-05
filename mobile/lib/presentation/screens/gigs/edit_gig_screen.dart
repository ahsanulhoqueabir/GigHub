import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gig_hub/core/constants/app_sizes.dart';
import 'package:gig_hub/data/models/gig_model.dart';
import 'package:gig_hub/data/providers/gig_provider.dart';

/// Edit an existing gig.
///
/// For now, reuses the create form layout with pre-populated data.
class EditGigScreen extends ConsumerStatefulWidget {
  final String gigId;

  const EditGigScreen({super.key, required this.gigId});

  @override
  ConsumerState<EditGigScreen> createState() => _EditGigScreenState();
}

class _EditGigScreenState extends ConsumerState<EditGigScreen> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  void _save() {
    final notifier = ref.read(gigFormNotifierProvider.notifier);
    notifier.updateGig(
      widget.gigId,
      UpdateGigInput(title: _titleCtrl.text, description: _descCtrl.text),
    );
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Gig updated! (UI only)')));
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Gig')),
      body: Padding(
        padding: const EdgeInsets.all(AppSizes.space16),
        child: Column(
          children: [
            TextFormField(
              controller: _titleCtrl,
              decoration: const InputDecoration(labelText: 'Title'),
              validator: (v) =>
                  (v?.length ?? 0) < 10 ? 'At least 10 characters' : null,
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
            const SizedBox(height: AppSizes.space24),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: _save,
                child: const Text('Save Changes'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
