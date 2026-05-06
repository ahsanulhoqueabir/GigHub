import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/data/providers/gig_provider.dart';
import 'package:gighub/presentation/widgets/gigs/gig_card.dart';
import 'package:gighub/presentation/widgets/gigs/image_carousel.dart';
import 'package:gighub/presentation/widgets/gigs/package_tab_view.dart';

/// Full gig detail screen with images, seller info, packages, and description.
class GigDetailScreen extends ConsumerWidget {
  final String slug;

  const GigDetailScreen({super.key, required this.slug});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final gigAsync = ref.watch(gigDetailProvider(slug));
    final relatedAsync = ref.watch(relatedGigsProvider(slug));

    return Scaffold(
      body: gigAsync.when(
        data: (gig) => CustomScrollView(
          slivers: [
            // AppBar with image carousel
            SliverAppBar(
              expandedHeight: 280,
              pinned: true,
              title: Text(
                gig.title,
                style: theme.textTheme.titleSmall,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              flexibleSpace: FlexibleSpaceBar(
                background: ImageCarousel(
                  images: gig.images.isNotEmpty
                      ? gig.images
                      : (gig.thumbnail != null ? [gig.thumbnail!] : []),
                ),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.bookmark_border),
                  onPressed: () {},
                ),
                IconButton(icon: const Icon(Icons.share), onPressed: () {}),
              ],
            ),
            // Content
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(AppSizes.space16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title
                    Text(
                      gig.title,
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: AppSizes.space8),
                    // Category + Rating
                    Row(
                      children: [
                        Chip(
                          label: Text(gig.category.name),
                          labelStyle: theme.textTheme.labelSmall?.copyWith(
                            color: theme.colorScheme.onSecondaryContainer,
                            fontWeight: FontWeight.w600,
                          ),
                          backgroundColor: theme.colorScheme.secondaryContainer,
                          visualDensity: VisualDensity.compact,
                          materialTapTargetSize:
                              MaterialTapTargetSize.shrinkWrap,
                          padding: EdgeInsets.zero,
                        ),
                        const Spacer(),
                        Icon(Icons.star, size: 18, color: Colors.amber),
                        const SizedBox(width: 4),
                        Text(
                          gig.avgRating.toStringAsFixed(1),
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          ' (${gig.totalReviews})',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSizes.space12),
                    // Tags
                    Wrap(
                      spacing: AppSizes.space8,
                      children: gig.tags
                          .map(
                            (t) => Chip(
                              label: Text(t),
                              labelStyle: theme.textTheme.labelSmall?.copyWith(
                                color: theme.colorScheme.onSecondaryContainer,
                                fontWeight: FontWeight.w600,
                              ),
                              backgroundColor:
                                  theme.colorScheme.secondaryContainer,
                              visualDensity: VisualDensity.compact,
                              materialTapTargetSize:
                                  MaterialTapTargetSize.shrinkWrap,
                              padding: EdgeInsets.zero,
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: AppSizes.space16),
                    // Seller card
                    _SellerCard(
                      seller: gig.seller,
                      onViewProfile: () =>
                          context.push('/u/${gig.seller.username}'),
                    ),
                    const SizedBox(height: AppSizes.space24),
                    // Packages
                    PackageTabView(
                      packages: gig.packages,
                      onContinue: (pkg) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              'Selected ${pkg.title} - \u09F3${pkg.price.toStringAsFixed(0)} (UI only)',
                            ),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: AppSizes.space24),
                    // Description
                    Text(
                      'About This Gig',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppSizes.space8),
                    Text(gig.description, style: theme.textTheme.bodyMedium),
                    const SizedBox(height: AppSizes.space24),
                    // Related gigs
                    Text(
                      'Related Gigs',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppSizes.space8),
                    relatedAsync.when(
                      data: (related) => SizedBox(
                        height: 230,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: related.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(width: AppSizes.space12),
                          itemBuilder: (_, i) => SizedBox(
                            width: 180,
                            child: GigCard(
                              gig: related[i],
                              onTap: () =>
                                  context.push('/gigs/${related[i].slug}'),
                            ),
                          ),
                        ),
                      ),
                      loading: () => SizedBox(
                        height: 230,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: 3,
                          separatorBuilder: (_, __) =>
                              const SizedBox(width: AppSizes.space12),
                          itemBuilder: (_, __) => const SizedBox(
                            width: 180,
                            child: _RelatedShimmer(),
                          ),
                        ),
                      ),
                      error: (_, __) => const SizedBox.shrink(),
                    ),
                    const SizedBox(height: 80),
                  ],
                ),
              ),
            ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
      // Bottom bar
      bottomNavigationBar: gigAsync.whenOrNull(
        data: (gig) => Container(
          padding: const EdgeInsets.all(AppSizes.space16),
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 8,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: Row(
            children: [
              Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Starting at', style: theme.textTheme.labelSmall),
                  Text(
                    '\u09F3${gig.startingPrice.toStringAsFixed(0)}',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: AppSizes.space16),
              Expanded(
                child: FilledButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Continue button clicked (UI only)'),
                      ),
                    );
                  },
                  child: const Text('Continue'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RelatedShimmer extends StatelessWidget {
  const _RelatedShimmer();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[800] : Colors.grey[300],
        borderRadius: BorderRadius.circular(AppSizes.radiusMd),
      ),
    );
  }
}

class _SellerCard extends StatelessWidget {
  final dynamic seller;
  final VoidCallback onViewProfile;

  const _SellerCard({required this.seller, required this.onViewProfile});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSizes.space12),
        child: Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundImage: NetworkImage(seller.avatar ?? ''),
            ),
            const SizedBox(width: AppSizes.space12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    seller.displayName,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Row(
                    children: [
                      Icon(Icons.star, size: 14, color: Colors.amber),
                      Text(
                        ' ${seller.avgRating}',
                        style: theme.textTheme.labelSmall,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            OutlinedButton(
              onPressed: onViewProfile,
              child: const Text('View Profile'),
            ),
          ],
        ),
      ),
    );
  }
}
