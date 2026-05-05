import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/data/providers/job_provider.dart';

/// Full job detail screen with submit proposal button.
class JobDetailScreen extends ConsumerWidget {
  final String slug;

  const JobDetailScreen({super.key, required this.slug});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final jobAsync = ref.watch(jobDetailProvider(slug));

    return Scaffold(
      appBar: AppBar(title: const Text('Job Details')),
      body: jobAsync.when(
        data: (job) => SingleChildScrollView(
          padding: const EdgeInsets.all(AppSizes.space16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                job.title,
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: AppSizes.space12),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSizes.space8,
                      vertical: AppSizes.space4,
                    ),
                    decoration: BoxDecoration(
                      color: job.type == 'fixed'
                          ? theme.colorScheme.primaryContainer
                          : theme.colorScheme.tertiaryContainer,
                      borderRadius: BorderRadius.circular(AppSizes.radiusXs),
                    ),
                    child: Text(
                      job.type == 'fixed' ? 'Fixed' : 'Hourly',
                      style: theme.textTheme.labelSmall,
                    ),
                  ),
                  const SizedBox(width: AppSizes.space8),
                  Text(
                    '\u09F3${job.budgetMin.toStringAsFixed(0)} - \u09F3${job.budgetMax.toStringAsFixed(0)}',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSizes.space12),
              Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundImage: NetworkImage(job.client.avatar ?? ''),
                  ),
                  const SizedBox(width: AppSizes.space8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        job.client.displayName,
                        style: theme.textTheme.titleSmall,
                      ),
                      Row(
                        children: [
                          Icon(Icons.star, size: 14, color: Colors.amber),
                          Text(
                            ' ${job.client.avgRating}',
                            style: theme.textTheme.labelSmall,
                          ),
                        ],
                      ),
                    ],
                  ),
                  const Spacer(),
                  OutlinedButton(
                    onPressed: () => context.push('/u/${job.client.username}'),
                    child: const Text('View Profile'),
                  ),
                ],
              ),
              const SizedBox(height: AppSizes.space16),
              if (job.deadline != null) ...[
                Row(
                  children: [
                    Icon(
                      Icons.access_time,
                      size: 16,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Deadline: ${job.deadline}',
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ),
                const SizedBox(height: AppSizes.space4),
              ],
              Row(
                children: [
                  Icon(
                    Icons.bar_chart,
                    size: 16,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Experience: ${job.experienceLevel[0].toUpperCase()}${job.experienceLevel.substring(1)}',
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ),
              const SizedBox(height: AppSizes.space4),
              Row(
                children: [
                  Icon(
                    Icons.assignment,
                    size: 16,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${job.totalProposals} proposals',
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ),
              const SizedBox(height: AppSizes.space16),
              Text(
                'Description',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: AppSizes.space8),
              Text(job.description, style: theme.textTheme.bodyMedium),
              const SizedBox(height: AppSizes.space16),
              Text(
                'Skills Required',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: AppSizes.space8),
              Wrap(
                spacing: AppSizes.space8,
                runSpacing: AppSizes.space4,
                children: job.skillsRequired
                    .map(
                      (s) => Chip(
                        label: Text(s),
                        visualDensity: VisualDensity.compact,
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: AppSizes.space24),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
      bottomNavigationBar: jobAsync.whenOrNull(
        data: (job) => Container(
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
              Expanded(
                child: FilledButton(
                  onPressed: () => _showProposalSheet(context, job.id),
                  child: const Text('Submit Proposal'),
                ),
              ),
              const SizedBox(width: AppSizes.space12),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => context.push('/jobs/${job.id}/proposals'),
                  child: Text('View Proposals (${job.totalProposals})'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showProposalSheet(BuildContext context, String jobId) {
    final coverLetterCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final daysCtrl = TextEditingController(text: '7');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom,
          left: AppSizes.space16,
          right: AppSizes.space16,
          top: AppSizes.space16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Submit Proposal',
              style: Theme.of(
                ctx,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: AppSizes.space16),
            TextField(
              controller: coverLetterCtrl,
              maxLines: 5,
              decoration: const InputDecoration(
                labelText: 'Cover Letter',
                alignLabelWithHint: true,
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: AppSizes.space12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: priceCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Price (BDT)',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ),
                const SizedBox(width: AppSizes.space12),
                Expanded(
                  child: TextField(
                    controller: daysCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Delivery Days',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSizes.space16),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Proposal submitted! (UI only)'),
                    ),
                  );
                  Navigator.pop(ctx);
                },
                child: const Text('Submit Proposal'),
              ),
            ),
            const SizedBox(height: AppSizes.space16),
          ],
        ),
      ),
    );
  }
}
