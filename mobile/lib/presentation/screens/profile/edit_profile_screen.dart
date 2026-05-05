import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/core/constants/app_strings.dart';
import 'package:gighub/core/utils/extensions.dart';
import 'package:gighub/core/utils/validators.dart';
import 'package:gighub/data/models/profile_model.dart';
import 'package:gighub/data/providers/profile_provider.dart';
import 'package:gighub/presentation/widgets/common/gh_button.dart';
import 'package:gighub/presentation/widgets/common/gh_loading.dart';
import 'package:gighub/presentation/widgets/common/gh_text_field.dart';
import 'package:gighub/presentation/widgets/profile/avatar_picker.dart';
import 'package:gighub/presentation/widgets/profile/skills_input.dart';

/// Screen for editing the current user's profile.
class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _displayNameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _bioController = TextEditingController();
  List<String> _skills = [];
  String _availabilityStatus = 'available';
  String? _avatarPath;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  void _loadProfile() {
    final profileAsync = ref.read(myProfileProvider);
    profileAsync.whenOrNull(
      data: (profile) {
        if (profile == null) return;
        _displayNameController.text = profile.displayName;
        _usernameController.text = profile.username;
        _bioController.text = profile.bio ?? '';
        _skills = List<String>.from(profile.skills);
        _availabilityStatus = profile.availabilityStatus;
      },
    );
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    try {
      final input = UpdateProfileInput(
        displayName: _displayNameController.text.trim(),
        username: _usernameController.text.trim(),
        bio: _bioController.text.trim().nullIfEmpty,
        skills: _skills,
        availabilityStatus: _availabilityStatus,
      );

      await ref.read(updateProfileAction(input).future);

      if (_avatarPath != null) {
        await ref.read(updateAvatarAction(_avatarPath!).future);
      }

      if (mounted) {
        context.pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update profile: ${e.toString()}'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  void dispose() {
    _displayNameController.dispose();
    _usernameController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final profileAsync = ref.watch(myProfileProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Profile'),
        actions: [
          TextButton(
            onPressed: _isSaving ? null : _handleSave,
            child: _isSaving
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Save'),
          ),
        ],
      ),
      body: profileAsync.when(
        loading: () => const GhLoading(message: 'Loading profile...'),
        error: (err, _) => Center(child: Text('Error: $err')),
        data: (profile) {
          if (profile == null) {
            return const Center(child: Text('Profile not found'));
          }
          return _buildForm(profile, theme);
        },
      ),
    );
  }

  Widget _buildForm(dynamic profile, ThemeData theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSizes.space16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: AppSizes.space8),

            // Avatar
            AvatarPicker(
              currentImageUrl: profile.avatar as String?,
              name: profile.displayName as String,
              onImageSelected: (path) => setState(() => _avatarPath = path),
            ),
            const SizedBox(height: AppSizes.space32),

            // Display Name
            GhTextField(
              label: AppStrings.displayName,
              controller: _displayNameController,
              textInputAction: TextInputAction.next,
              validator: (v) => Validators.required(v, 'Display name'),
              prefixIcon: const Icon(Icons.person_outline),
            ),
            const SizedBox(height: AppSizes.space16),

            // Username
            GhTextField(
              label: AppStrings.username,
              controller: _usernameController,
              textInputAction: TextInputAction.next,
              validator: Validators.username,
              prefixIcon: const Icon(Icons.alternate_email),
            ),
            const SizedBox(height: AppSizes.space16),

            // Bio
            GhTextField(
              label: AppStrings.bio,
              hint: 'Tell us about yourself...',
              controller: _bioController,
              maxLines: 3,
              textInputAction: TextInputAction.newline,
              validator: (v) => Validators.maxLength(v, 500, 'Bio'),
            ),
            const SizedBox(height: AppSizes.space16),

            // Skills
            SkillsInput(
              skills: _skills,
              onChanged: (skills) => setState(() => _skills = skills),
            ),
            const SizedBox(height: AppSizes.space16),

            // Availability Status
            DropdownButtonFormField<String>(
              value: _availabilityStatus,
              decoration: const InputDecoration(
                labelText: 'Availability Status',
                prefixIcon: Icon(Icons.circle),
              ),
              items: const [
                DropdownMenuItem(value: 'available', child: Text('Available')),
                DropdownMenuItem(value: 'busy', child: Text('Busy')),
                DropdownMenuItem(
                  value: 'unavailable',
                  child: Text('Unavailable'),
                ),
              ],
              onChanged: (v) {
                if (v != null) setState(() => _availabilityStatus = v);
              },
            ),
            const SizedBox(height: AppSizes.space32),

            // Save button (also at bottom for convenience)
            GhButton.primary(
              label: 'Save Changes',
              isLoading: _isSaving,
              onPressed: _handleSave,
            ),
            const SizedBox(height: AppSizes.space32),
          ],
        ),
      ),
    );
  }
}
