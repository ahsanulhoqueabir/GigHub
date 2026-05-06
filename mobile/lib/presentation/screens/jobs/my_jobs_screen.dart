import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/data/providers/job_provider.dart';
import 'package:gighub/presentation/widgets/common/gh_shimmer.dart';

/// Client's job management screen.
class MyJobsScreen extends ConsumerWidget {
  const MyJobsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final myJobsAsync = ref.watch(myJobsProvider(1));

    return Scaffold(
      appBar: AppBar(title: const Text('My Jobs')),
      body: myJobsAsync.when(
        data: (response) {
          if (response.data.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.assignment_late,
                    size: 64,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(height: AppSizes.space16),
                  Text(
                    'No jobs posted yet',
                    style: theme.textTheme.titleMedium,
                  ),
                  const SizedBox(height: AppSizes.space8),
                  FilledButton(
                    onPressed: () => context.push('/jobs/create'),
                    child: const Text('Post Your First Job'),
                  ),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(AppSizes.space16),
            itemCount: response.data.length,
            itemBuilder: (_, i) {
              final job = response.data[i];
              return Card(
                margin: const EdgeInsets.only(bottom: AppSizes.space8),
                child: ListTile(
                  title: Text(
                    job.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  subtitle: Text(
                    '\u09F3${job.budgetMin.toStringAsFixed(0)} - \u09F3${job.budgetMax.toStringAsFixed(0)}  \u2022  ${job.totalProposals} proposals  \u2022  ${job.status}',
                  ),
                  trailing: PopupMenuButton<String>(
                    onSelected: (action) {
                      if (action == 'proposals') {
                        context.push('/jobs/${job.id}/proposals');
                      } else if (action == 'close') {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              'Job "${job.title}" closed (UI only)',
                            ),
                          ),
                        );
                      }
                    },
                    itemBuilder: (_) => [
                      const PopupMenuItem(
                        value: 'proposals',
                        child: Text('View Proposals'),
                      ),
                      const PopupMenuItem(
                        value: 'close',
                        child: Text(
                          'Close Job',
                          style: TextStyle(color: Colors.red),
                        ),
                      ),
                    ],
                  ),
                  onTap: () => context.push('/jobs/${job.id}/proposals'),
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
            child: GhShimmer.card(height: 72),
          ),
        ),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }
}
