import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/data/models/gig_model.dart';
import 'package:gighub/data/providers/gig_provider.dart';
import 'package:gighub/data/models/job_model.dart';
import 'package:gighub/data/providers/job_provider.dart';
import 'package:gighub/presentation/widgets/gigs/gig_card.dart';
import 'package:gighub/presentation/widgets/jobs/job_card.dart';

/// Main dashboard / home tab of the app.
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final gigsAsync = ref.watch(
      gigsListProvider(const GigQueryParams(limit: 4)),
    );
    final jobsAsync = ref.watch(
      jobsListProvider(const JobQueryParams(limit: 3)),
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('GigHub'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => context.push('/search'),
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
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
                  'Welcome to GigHub! \u{1F44B}',
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

          // Trending Gigs
          _SectionHeader(
            title: 'Trending Gigs',
            theme: theme,
            onSeeAll: () => context.go('/gigs'),
          ),
          const SizedBox(height: AppSizes.space12),
          SizedBox(
            height: 280,
            child: gigsAsync.when(
              data: (response) => ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: response.data.length,
                separatorBuilder: (_, __) =>
                    const SizedBox(width: AppSizes.space12),
                itemBuilder: (_, i) => SizedBox(
                  width: 180,
                  child: GigCard(
                    gig: response.data[i],
                    onTap: () => context.push('/gigs/${response.data[i].slug}'),
                  ),
                ),
              ),
              loading: () => ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: 4,
                separatorBuilder: (_, __) =>
                    const SizedBox(width: AppSizes.space12),
                itemBuilder: (_, __) =>
                    const SizedBox(width: 180, child: _ShimmerCard()),
              ),
              error: (_, __) => const SizedBox.shrink(),
            ),
          ),
          const SizedBox(height: AppSizes.space24),

          // Latest Jobs
          _SectionHeader(
            title: 'Latest Jobs',
            theme: theme,
            onSeeAll: () => context.go('/jobs'),
          ),
          const SizedBox(height: AppSizes.space12),
          jobsAsync.when(
            data: (response) => Column(
              children: response.data
                  .map(
                    (j) => JobCard(
                      job: j,
                      onTap: () => context.push('/jobs/${j.slug}'),
                    ),
                  )
                  .toList(),
            ),
            loading: () => Column(
              children: List.generate(
                3,
                (_) => const Padding(
                  padding: EdgeInsets.symmetric(vertical: 4),
                  child: _ShimmerCard(height: 160),
                ),
              ),
            ),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final ThemeData theme;
  final VoidCallback onSeeAll;

  const _SectionHeader({
    required this.title,
    required this.theme,
    required this.onSeeAll,
  });

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
        TextButton(onPressed: onSeeAll, child: const Text('See All')),
      ],
    );
  }
}

class _ShimmerCard extends StatelessWidget {
  final double height;
  const _ShimmerCard({this.height = 180});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[800] : Colors.grey[300],
        borderRadius: BorderRadius.circular(AppSizes.radiusMd),
      ),
    );
  }
}
