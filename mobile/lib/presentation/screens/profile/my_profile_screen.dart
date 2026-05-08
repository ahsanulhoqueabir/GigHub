import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/core/utils/formatters.dart';
import 'package:gighub/data/providers/profile_provider.dart';
import 'package:gighub/presentation/widgets/common/gh_avatar.dart';
import 'package:gighub/presentation/widgets/common/gh_error_state.dart';
import 'package:gighub/presentation/widgets/common/gh_loading.dart';
import 'package:gighub/presentation/widgets/auth/auth_gate.dart';

/// Displays the current user's own profile with stats and actions.
class MyProfileScreen extends ConsumerWidget {
  const MyProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return AuthGate(
      unauthenticatedBuilder: (context, ref) {
        return Scaffold(
          appBar: AppBar(title: const Text('My Profile')),
          body: GhErrorState(
            message: 'Please sign in to view your profile',
            onRetry: () => context.go('/auth/login'),
          ),
        );
      },
      builder: (context, ref) {
        final profileAsync = ref.watch(myProfileProvider);
        final theme = Theme.of(context);

        return Scaffold(
          extendBodyBehindAppBar: true,
          appBar: AppBar(
            backgroundColor: Colors.transparent,
            elevation: 0,
            scrolledUnderElevation: 0,
            title: const Text('My Profile'),
            actions: [
              IconButton(
                icon: const Icon(Icons.settings_outlined),
                onPressed: () => context.push('/profile/settings'),
              ),
            ],
          ),
          body: profileAsync.when(
            loading: () => const GhLoading(message: 'Loading profile...'),
            error: (err, _) => GhErrorState(
              message: 'Failed to load profile',
              onRetry: () => ref.invalidate(myProfileProvider),
            ),
            data: (profile) {
              if (profile == null) {
                return const GhErrorState(message: 'Profile not found');
              }
              return _buildProfile(context, profile, theme);
            },
          ),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () => context.push('/profile/edit'),
            icon: const Icon(Icons.edit_outlined),
            label: const Text('Edit Profile'),
          ),
        );
      },
    );
  }

  Widget _buildProfile(BuildContext context, dynamic profile, ThemeData theme) {
    final isVerified = profile.isVerified == true;
    final bioText = (profile.bio as String?)?.trim();

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Hero Header ──────────────────────────────────────────
          _ProfileHero(
            profile: profile,
            isVerified: isVerified,
            bioText: bioText,
            theme: theme,
          ),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSizes.space16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: AppSizes.space20),

                // ── Stats Row ──────────────────────────────────────
                _StatsRow(profile: profile, theme: theme),
                const SizedBox(height: AppSizes.space24),

                // ── Account Info ───────────────────────────────────
                _SectionLabel(label: 'Account', theme: theme),
                const SizedBox(height: AppSizes.space12),
                _OutlinedCard(
                  child: Column(
                    children: [
                      _InfoRow(
                        icon: Icons.email_outlined,
                        label: 'Email',
                        value: profile.email.toString(),
                      ),
                      _RowDivider(),
                      _InfoRow(
                        icon: Icons.badge_outlined,
                        label: 'Role',
                        value: profile.role.toString(),
                      ),
                      _RowDivider(),
                      _InfoRow(
                        icon: Icons.calendar_today_outlined,
                        label: 'Member since',
                        value: Formatters.date(profile.createdAt),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSizes.space24),

                // ── Skills ─────────────────────────────────────────
                if (profile.skills != null &&
                    (profile.skills as List).isNotEmpty) ...[
                  _SectionLabel(label: 'Skills', theme: theme),
                  const SizedBox(height: AppSizes.space12),
                  Wrap(
                    spacing: AppSizes.space8,
                    runSpacing: AppSizes.space8,
                    children: (profile.skills as List).map<Widget>((skill) {
                      return _SkillChip(label: skill.toString(), theme: theme);
                    }).toList(),
                  ),
                  const SizedBox(height: AppSizes.space32),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero Header
// ─────────────────────────────────────────────────────────────────────────────

class _ProfileHero extends StatelessWidget {
  final dynamic profile;
  final bool isVerified;
  final String? bioText;
  final ThemeData theme;

  const _ProfileHero({
    required this.profile,
    required this.isVerified,
    required this.bioText,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    final statusColor = _statusColor(theme, profile.availabilityStatus);

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            theme.colorScheme.primary.withOpacity(0.08),
            theme.colorScheme.surface,
          ],
          stops: const [0.0, 1.0],
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSizes.space16,
            AppSizes.space8,
            AppSizes.space16,
            AppSizes.space24,
          ),
          child: Column(
            children: [
              // Avatar with status ring
              Stack(
                alignment: Alignment.bottomRight,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: theme.colorScheme.primary.withOpacity(0.25),
                        width: 3,
                      ),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(3),
                      child: GhAvatar(
                        imageUrl: profile.avatar,
                        name: profile.displayName,
                        radius: 44,
                      ),
                    ),
                  ),
                  // Online status dot
                  Container(
                    width: 18,
                    height: 18,
                    decoration: BoxDecoration(
                      color: statusColor,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: theme.colorScheme.surface,
                        width: 2.5,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSizes.space12),

              // Name + verified badge
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    profile.displayName,
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.5,
                    ),
                  ),
                  if (isVerified) ...[
                    const SizedBox(width: 6),
                    Icon(
                      Icons.verified_rounded,
                      size: 20,
                      color: theme.colorScheme.primary,
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 4),

              // Username
              Text(
                '@${profile.username}',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: AppSizes.space12),

              // Status + Role pills
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _StatusPill(
                    label: profile.availabilityStatus.toString(),
                    color: _statusColor(theme, profile.availabilityStatus),
                  ),
                  const SizedBox(width: AppSizes.space8),
                  _RolePill(label: profile.role.toString(), theme: theme),
                ],
              ),

              // Bio
              if (bioText?.isNotEmpty == true) ...[
                const SizedBox(height: AppSizes.space12),
                Text(
                  bioText!,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                    height: 1.5,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats Row
// ─────────────────────────────────────────────────────────────────────────────

class _StatsRow extends StatelessWidget {
  final dynamic profile;
  final ThemeData theme;

  const _StatsRow({required this.profile, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _StatCard(
            icon: Icons.star_rounded,
            value: profile.avgRating.toStringAsFixed(1),
            label: 'Rating',
            iconColor: const Color(0xFFF59E0B),
            theme: theme,
          ),
        ),
        const SizedBox(width: AppSizes.space12),
        Expanded(
          child: _StatCard(
            icon: Icons.rate_review_outlined,
            value: profile.totalReviews.toString(),
            label: 'Reviews',
            iconColor: theme.colorScheme.secondary,
            theme: theme,
          ),
        ),
        const SizedBox(width: AppSizes.space12),
        Expanded(
          child: _StatCard(
            icon: Icons.payments_outlined,
            value: Formatters.price(profile.totalEarnings),
            label: 'Earnings',
            iconColor: const Color(0xFF10B981),
            theme: theme,
          ),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color iconColor;
  final ThemeData theme;

  const _StatCard({
    required this.icon,
    required this.value,
    required this.label,
    required this.iconColor,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
      decoration: BoxDecoration(
        border: Border.all(color: theme.colorScheme.outlineVariant),
        borderRadius: BorderRadius.circular(AppSizes.radiusMd),
      ),
      child: Column(
        children: [
          Icon(icon, color: iconColor, size: 22),
          const SizedBox(height: 6),
          Text(
            value,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable Widgets
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
        letterSpacing: 0.5,
      ),
    );
  }
}

class _OutlinedCard extends StatelessWidget {
  final Widget child;

  const _OutlinedCard({required this.child});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSizes.space16,
        vertical: AppSizes.space4,
      ),
      decoration: BoxDecoration(
        border: Border.all(color: theme.colorScheme.outlineVariant),
        borderRadius: BorderRadius.circular(AppSizes.radiusMd),
      ),
      child: child,
    );
  }
}

class _RowDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Divider(
      height: 1,
      thickness: 1,
      color: Theme.of(context).colorScheme.outlineVariant.withOpacity(0.5),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Row(
        children: [
          Icon(icon, size: 18, color: theme.colorScheme.primary),
          const SizedBox(width: AppSizes.space12),
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const Spacer(),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

class _SkillChip extends StatelessWidget {
  final String label;
  final ThemeData theme;

  const _SkillChip({required this.label, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        border: Border.all(color: theme.colorScheme.outlineVariant),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: theme.textTheme.labelSmall?.copyWith(
          fontWeight: FontWeight.w600,
          color: theme.colorScheme.onSurface,
        ),
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  final String label;
  final Color color;

  const _StatusPill({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.10),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withOpacity(0.35)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _PulseDot(color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _RolePill extends StatelessWidget {
  final String label;
  final ThemeData theme;

  const _RolePill({required this.label, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        border: Border.all(color: theme.colorScheme.outlineVariant),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.badge_outlined,
            size: 13,
            color: theme.colorScheme.onSurfaceVariant,
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pulse Dot Animation
// ─────────────────────────────────────────────────────────────────────────────

class _PulseDot extends StatefulWidget {
  final Color color;

  const _PulseDot({required this.color});

  @override
  State<_PulseDot> createState() => _PulseDotState();
}

class _PulseDotState extends State<_PulseDot>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scale;
  late final Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);
    _scale = Tween<double>(
      begin: 0.9,
      end: 1.2,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
    _opacity = Tween<double>(
      begin: 0.6,
      end: 1.0,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _opacity,
      child: ScaleTransition(
        scale: _scale,
        child: Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: widget.color,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

Color _statusColor(ThemeData theme, String status) {
  switch (status.toLowerCase()) {
    case 'available':
      return const Color(0xFF1C8A4C);
    case 'busy':
      return const Color(0xFFB36B00);
    case 'offline':
      return theme.colorScheme.onSurfaceVariant;
    default:
      return theme.colorScheme.primary;
  }
}
