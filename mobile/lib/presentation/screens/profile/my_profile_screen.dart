import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gig_hub/core/constants/app_sizes.dart';
import 'package:gig_hub/core/utils/formatters.dart';
import 'package:gig_hub/data/providers/profile_provider.dart';
import 'package:gig_hub/presentation/widgets/common/gh_avatar.dart';
import 'package:gig_hub/presentation/widgets/common/gh_error_state.dart';
import 'package:gig_hub/presentation/widgets/common/gh_loading.dart';

/// Displays the current user's own profile with stats and actions.
class MyProfileScreen extends ConsumerWidget {
  const MyProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(myProfileProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
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
        icon: const Icon(Icons.edit),
        label: const Text('Edit Profile'),
      ),
    );
  }

  Widget _buildProfile(BuildContext context, dynamic profile, ThemeData theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSizes.space16),
      child: Column(
        children: [
          const SizedBox(height: AppSizes.space8),

          // Avatar and Name
          Center(
            child: Column(
              children: [
                GhAvatar(
                  imageUrl: profile.avatar,
                  name: profile.displayName,
                  radius: 48,
                ),
                const SizedBox(height: AppSizes.space12),
                Text(
                  profile.displayName,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: AppSizes.space4),
                Text(
                  '@${profile.username}',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                if (profile.bio != null && (profile.bio as String).isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: AppSizes.space8),
                    child: Text(
                      profile.bio as String,
                      textAlign: TextAlign.center,
                      style: theme.textTheme.bodyMedium,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: AppSizes.space24),

          // Stats Row
          Container(
            padding: const EdgeInsets.all(AppSizes.space16),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(AppSizes.radiusMd),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _StatItem(
                  label: 'Rating',
                  value: profile.avgRating.toStringAsFixed(1),
                  icon: Icons.star,
                  theme: theme,
                ),
                _StatItem(
                  label: 'Reviews',
                  value: profile.totalReviews.toString(),
                  icon: Icons.rate_review_outlined,
                  theme: theme,
                ),
                _StatItem(
                  label: 'Earnings',
                  value: Formatters.price(profile.totalEarnings),
                  icon: Icons.payments_outlined,
                  theme: theme,
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSizes.space24),

          // Skills
          if (profile.skills != null &&
              (profile.skills as List).isNotEmpty) ...[
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Skills',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: AppSizes.space8),
            Wrap(
              spacing: AppSizes.space8,
              runSpacing: AppSizes.space8,
              children: (profile.skills as List).map<Widget>((skill) {
                return Chip(
                  label: Text(skill.toString()),
                  backgroundColor: theme.colorScheme.primaryContainer,
                  labelStyle: TextStyle(
                    color: theme.colorScheme.onPrimaryContainer,
                  ),
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final ThemeData theme;

  const _StatItem({
    required this.label,
    required this.value,
    required this.icon,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: theme.colorScheme.primary, size: 20),
        const SizedBox(height: AppSizes.space4),
        Text(
          value,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}
