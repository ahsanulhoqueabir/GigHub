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
import 'package:gighub/presentation/widgets/common/gh_toast.dart';
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
        GhToast.show(
          context,
          message: 'Profile updated successfully',
          type: GhToastType.success,
        );
      }
    } catch (e) {
      if (mounted) {
        GhToast.show(
          context,
          message: 'Failed to update profile: ${e.toString()}',
          type: GhToastType.error,
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
        centerTitle: false,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: AppSizes.space8),
            child: _isSaving
                ? const Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                : FilledButton.tonal(
                    onPressed: _handleSave,
                    style: FilledButton.styleFrom(
                      visualDensity: VisualDensity.compact,
                    ),
                    child: const Text('Save'),
                  ),
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
      padding: const EdgeInsets.symmetric(
        horizontal: AppSizes.space16,
        vertical: AppSizes.space8,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Avatar ──────────────────────────────────────────────
            Center(
              child: Column(
                children: [
                  const SizedBox(height: AppSizes.space8),
                  AvatarPicker(
                    currentImageUrl: profile.avatar as String?,
                    name: profile.displayName as String,
                    onImageSelected: (path) =>
                        setState(() => _avatarPath = path),
                  ),
                  const SizedBox(height: AppSizes.space8),
                  Text(
                    'Tap to change photo',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSizes.space32),

            // ── Basic Info Section ──────────────────────────────────
            _SectionLabel(label: 'Basic Info', theme: theme),
            const SizedBox(height: AppSizes.space12),
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSizes.space4,
                vertical: AppSizes.space4,
              ),
              child: Column(
                children: [
                  GhTextField(
                    label: AppStrings.displayName,
                    controller: _displayNameController,
                    textInputAction: TextInputAction.next,
                    validator: (v) => Validators.required(v, 'Display name'),
                    prefixIcon: const Icon(Icons.person_outline),
                  ),
                  const SizedBox(height: AppSizes.space16),
                  GhTextField(
                    label: AppStrings.username,
                    controller: _usernameController,
                    textInputAction: TextInputAction.next,
                    validator: Validators.username,
                    prefixIcon: const Icon(Icons.alternate_email),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSizes.space20),

            // ── Bio Section ─────────────────────────────────────────
            _SectionLabel(label: 'Bio', theme: theme),
            const SizedBox(height: AppSizes.space12),
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSizes.space4,
                vertical: AppSizes.space4,
              ),
              child: GhTextField(
                label: AppStrings.bio,
                hint: 'Tell us about yourself...',
                controller: _bioController,
                maxLines: 4,
                textInputAction: TextInputAction.newline,
                validator: (v) => Validators.maxLength(v, 500, 'Bio'),
              ),
            ),
            const SizedBox(height: AppSizes.space20),

            // ── Skills Section ──────────────────────────────────────
            _SectionLabel(label: 'Skills', theme: theme),
            const SizedBox(height: AppSizes.space12),
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSizes.space4,
                vertical: AppSizes.space4,
              ),
              child: SkillsInput(
                skills: _skills,
                onChanged: (skills) => setState(() => _skills = skills),
              ),
            ),
            const SizedBox(height: AppSizes.space20),

            // ── Availability Section ────────────────────────────────
            _SectionLabel(label: 'Availability', theme: theme),
            const SizedBox(height: AppSizes.space12),
            _AvailabilitySelector(
              value: _availabilityStatus,
              onChanged: (v) => setState(() => _availabilityStatus = v),
              theme: theme,
            ),
            const SizedBox(height: AppSizes.space32),

            // ── Save Button ─────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Availability Selector — replaces raw DropdownButtonFormField
// ─────────────────────────────────────────────────────────────────────────────

class _AvailabilitySelector extends StatelessWidget {
  final String value;
  final ValueChanged<String> onChanged;
  final ThemeData theme;

  const _AvailabilitySelector({
    required this.value,
    required this.onChanged,
    required this.theme,
  });

  static const _options = [
    ('available', 'Available', Color(0xFF1C8A4C)),
    ('busy', 'Busy', Color(0xFFB36B00)),
    ('unavailable', 'Unavailable', Color(0xFF9E9E9E)),
  ];

  @override
  Widget build(BuildContext context) {
    return Row(
      children: _options.map((opt) {
        final (id, label, color) = opt;
        final isSelected = value == id;
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(
              right: id != 'unavailable' ? AppSizes.space8 : 0,
            ),
            child: GestureDetector(
              onTap: () => onChanged(id),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                curve: Curves.easeOut,
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: isSelected
                        ? color.withOpacity(0.6)
                        : theme.colorScheme.outlineVariant,
                    width: isSelected ? 1.5 : 1,
                  ),
                  borderRadius: BorderRadius.circular(AppSizes.radiusMd),
                  color: isSelected ? color.withOpacity(0.08) : null,
                ),
                child: Column(
                  children: [
                    _StatusDot(color: color, animate: isSelected),
                    const SizedBox(height: 6),
                    Text(
                      label,
                      style: theme.textTheme.labelSmall?.copyWith(
                        fontWeight: isSelected
                            ? FontWeight.w700
                            : FontWeight.w500,
                        color: isSelected
                            ? color
                            : theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _StatusDot extends StatefulWidget {
  final Color color;
  final bool animate;

  const _StatusDot({required this.color, required this.animate});

  @override
  State<_StatusDot> createState() => _StatusDotState();
}

class _StatusDotState extends State<_StatusDot>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );
    _scale = Tween<double>(
      begin: 0.85,
      end: 1.2,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
    if (widget.animate) _controller.repeat(reverse: true);
  }

  @override
  void didUpdateWidget(_StatusDot old) {
    super.didUpdateWidget(old);
    if (widget.animate && !_controller.isAnimating) {
      _controller.repeat(reverse: true);
    } else if (!widget.animate && _controller.isAnimating) {
      _controller.stop();
      _controller.reset();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scale,
      child: Container(
        width: 10,
        height: 10,
        decoration: BoxDecoration(color: widget.color, shape: BoxShape.circle),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable Layout Widgets
// ─────────────────────────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  final String label;
  final ThemeData theme;

  const _SectionLabel({required this.label, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: theme.textTheme.labelLarge?.copyWith(
        fontWeight: FontWeight.w700,
        color: theme.colorScheme.onSurfaceVariant,
        letterSpacing: 0.4,
      ),
    );
  }
}
