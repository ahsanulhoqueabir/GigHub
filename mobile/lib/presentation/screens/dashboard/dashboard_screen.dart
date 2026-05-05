import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gig_hub/core/constants/app_sizes.dart';
import 'package:gig_hub/presentation/widgets/common/gh_shimmer.dart';

/// Main dashboard / home tab of the app.
///
/// Shows a welcome message and (in future phases) featured gigs, recent
/// activity, and personalized recommendations.
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('GigHub'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              // TODO: Phase 4 — notifications screen
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSizes.space16),
        children: [
          // Welcome card
          Container(
            padding: const EdgeInsets.all(AppSizes.space20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  theme.colorScheme.primary,
                  theme.colorScheme.secondary,
                ],
              ),
              borderRadius: BorderRadius.circular(AppSizes.radiusLg),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome to GigHub! 👋',
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: AppSizes.space8),
                Text(
                  'Find the best freelance talent or post your next project.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.white.withValues(alpha: 0.85),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSizes.space24),

          // Placeholder sections
          _SectionHeader(title: 'Trending Gigs', theme: theme),
          const SizedBox(height: AppSizes.space12),
          SizedBox(
            height: 180,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: 3,
              separatorBuilder: (_, __) =>
                  const SizedBox(width: AppSizes.space12),
              itemBuilder: (_, __) => GhShimmer.card(height: 180),
            ),
          ),
          const SizedBox(height: AppSizes.space24),

          _SectionHeader(title: 'Latest Jobs', theme: theme),
          const SizedBox(height: AppSizes.space12),
          ...List.generate(3, (_) => GhShimmer.listTile()),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final ThemeData theme;

  const _SectionHeader({required this.title, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        TextButton(onPressed: () {}, child: const Text('See All')),
      ],
    );
  }
}
