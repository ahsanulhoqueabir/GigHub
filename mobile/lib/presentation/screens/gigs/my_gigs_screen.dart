import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/data/providers/gig_provider.dart';
import 'package:gighub/presentation/widgets/common/gh_shimmer.dart';
import 'package:gighub/presentation/widgets/common/gh_toast.dart';

/// Seller's gig management screen.
class MyGigsScreen extends ConsumerWidget {
  const MyGigsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final myGigsAsync = ref.watch(myGigsProvider(1));

    return Scaffold(
      appBar: AppBar(title: const Text('My Gigs')),
      body: myGigsAsync.when(
        data: (response) {
          if (response.data.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.work_off,
                    size: 64,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(height: AppSizes.space16),
                  Text('No gigs yet', style: theme.textTheme.titleMedium),
                  const SizedBox(height: AppSizes.space8),
                  FilledButton(
                    onPressed: () => context.push('/gigs/create'),
                    child: const Text('Create Your First Gig'),
                  ),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(AppSizes.space16),
            itemCount: response.data.length,
            itemBuilder: (_, i) {
              final gig = response.data[i];
              return Card(
                margin: const EdgeInsets.only(bottom: AppSizes.space8),
                child: ListTile(
                  leading: ClipRRect(
                    borderRadius: BorderRadius.circular(AppSizes.radiusSm),
                    child: Image.network(
                      gig.thumbnail ?? '',
                      width: 60,
                      height: 60,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        width: 60,
                        height: 60,
                        color: theme.colorScheme.surfaceContainerHighest,
                        child: const Icon(Icons.image),
                      ),
                    ),
                  ),
                  title: Text(
                    gig.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  subtitle: Row(
                    children: [
                      Icon(Icons.star, size: 14, color: Colors.amber),
                      Text(
                        ' ${gig.avgRating} (${gig.totalReviews})  \u2022  ${gig.totalOrders} orders',
                      ),
                    ],
                  ),
                  trailing: PopupMenuButton<String>(
                    onSelected: (action) {
                      if (action == 'edit') {
                        context.push('/gigs/${gig.id}/edit');
                      } else if (action == 'toggle') {
                        GhToast.show(
                          context,
                          message: 'Status toggled for ${gig.title} (UI only)',
                          type: GhToastType.info,
                        );
                      } else if (action == 'delete') {
                        showDialog(
                          context: context,
                          builder: (_) => AlertDialog(
                            title: const Text('Delete Gig?'),
                            content: Text(
                              'Are you sure you want to delete "${gig.title}"?',
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context),
                                child: const Text('Cancel'),
                              ),
                              FilledButton(
                                onPressed: () {
                                  Navigator.pop(context);
                                  GhToast.show(
                                    context,
                                    message: 'Deleted ${gig.title} (UI only)',
                                    type: GhToastType.warning,
                                  );
                                },
                                child: const Text('Delete'),
                              ),
                            ],
                          ),
                        );
                      }
                    },
                    itemBuilder: (_) => [
                      const PopupMenuItem(value: 'edit', child: Text('Edit')),
                      PopupMenuItem(
                        value: 'toggle',
                        child: Text(
                          gig.status == 'active' ? 'Pause' : 'Resume',
                        ),
                      ),
                      const PopupMenuItem(
                        value: 'delete',
                        child: Text(
                          'Delete',
                          style: TextStyle(color: Colors.red),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
        loading: () => ListView.builder(
          padding: const EdgeInsets.all(AppSizes.space16),
          itemCount: 3,
          itemBuilder: (_, __) => Padding(
            padding: const EdgeInsets.only(bottom: AppSizes.space8),
            child: GhShimmer.card(height: 76),
          ),
        ),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/gigs/create'),
        icon: const Icon(Icons.add),
        label: const Text('Create Gig'),
      ),
    );
  }
}
