import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/data/providers/profile_provider.dart';
import 'package:gighub/presentation/widgets/common/gh_avatar.dart';
import 'package:gighub/presentation/widgets/common/gh_error_state.dart';
import 'package:gighub/presentation/widgets/common/gh_loading.dart';
import 'package:gighub/presentation/widgets/common/gh_rating_stars.dart';

/// Displays a public profile for any user by username.
class PublicProfileScreen extends ConsumerWidget {
  final String username;

  const PublicProfileScreen({super.key, required this.username});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(publicProfileProvider(username));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: Text('@$username')),
      body: profileAsync.when(
        loading: () => const GhLoading(message: 'Loading profile...'),
        error: (err, _) => GhErrorState(
          message: 'Failed to load profile',
          onRetry: () => ref.invalidate(publicProfileProvider(username)),
        ),
        data: (profile) => _buildProfile(context, profile, theme),
      ),
    );
  }

  Widget _buildProfile(BuildContext context, dynamic profile, ThemeData theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSizes.space16),
      child: Column(
        children: [
          const SizedBox(height: AppSizes.space8),

          // Avatar
          GhAvatar(
            imageUrl: profile.avatar as String?,
            name: profile.displayName as String,
            radius: 48,
          ),
          const SizedBox(height: AppSizes.space12),

          // Name & Username
          Text(
            profile.displayName as String,
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

          // Bio
          if (profile.bio != null && (profile.bio as String).isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: AppSizes.space12),
              child: Text(
                profile.bio as String,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium,
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
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      GhRatingStars(
                        rating: (profile.avgRating as num).toDouble(),
                      ),
                      const SizedBox(width: AppSizes.space4),
                      Text(
                        (profile.avgRating as num).toStringAsFixed(1),
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                _StatItem(
                  label: 'Reviews',
                  child: Text(
                    (profile.totalReviews as int).toString(),
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                _StatItem(
                  label: 'Completed',
                  child: Text(
                    (profile.completedOrders as int).toString(),
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
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
                  backgroundColor: theme.colorScheme.secondaryContainer,
                  labelStyle: theme.textTheme.labelSmall?.copyWith(
                    color: theme.colorScheme.onSecondaryContainer,
                    fontWeight: FontWeight.w600,
                  ),
                  visualDensity: VisualDensity.compact,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  padding: EdgeInsets.zero,
                );
              }).toList(),
            ),
          ],
          const SizedBox(height: AppSizes.space24),

          // Contact button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                // TODO: Phase 4 — create conversation
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Chat coming soon!')),
                );
              },
              icon: const Icon(Icons.chat_outlined),
              label: const Text('Contact'),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final Widget child;

  const _StatItem({required this.label, required this.child});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      children: [
        child,
        const SizedBox(height: AppSizes.space4),
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
