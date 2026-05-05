import 'package:flutter/material.dart';
import 'package:gig_hub/core/constants/app_sizes.dart';
import 'package:gig_hub/data/models/job_model.dart';

/// A job listing card for the job board.
class JobCard extends StatelessWidget {
  final Job job;
  final VoidCallback? onTap;

  const JobCard({super.key, required this.job, this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: AppSizes.elevationSm,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusMd),
      ),
      margin: const EdgeInsets.symmetric(
        horizontal: AppSizes.space16,
        vertical: AppSizes.space4,
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSizes.radiusMd),
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.space16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title
              Text(
                job.title,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: AppSizes.space4),
              // Description excerpt
              Text(
                job.description,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: AppSizes.space12),
              // Budget & Type
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
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: job.type == 'fixed'
                            ? theme.colorScheme.onPrimaryContainer
                            : theme.colorScheme.onTertiaryContainer,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSizes.space8),
                  Text(
                    '\u09F3${_formatPrice(job.budgetMin)} - \u09F3${_formatPrice(job.budgetMax)}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSizes.space8),
              // Client & Proposals
              Row(
                children: [
                  CircleAvatar(
                    radius: 12,
                    backgroundImage: NetworkImage(job.client.avatar ?? ''),
                  ),
                  const SizedBox(width: AppSizes.space8),
                  Text(
                    job.client.displayName,
                    style: theme.textTheme.labelSmall,
                  ),
                  const Spacer(),
                  Icon(
                    Icons.assignment,
                    size: 14,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${job.totalProposals} proposals',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSizes.space8),
              // Skills chips
              if (job.skillsRequired.isNotEmpty)
                Wrap(
                  spacing: AppSizes.space4,
                  runSpacing: AppSizes.space4,
                  children: job.skillsRequired.take(4).map((skill) {
                    return Chip(
                      label: Text(skill, style: theme.textTheme.labelSmall),
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      visualDensity: VisualDensity.compact,
                      padding: EdgeInsets.zero,
                    );
                  }).toList(),
                ),
              const SizedBox(height: AppSizes.space4),
              // Time ago
              Align(
                alignment: Alignment.centerRight,
                child: Text(
                  _timeAgo(job.createdAt),
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatPrice(double price) {
    if (price >= 1000) return '${(price / 1000).toStringAsFixed(1)}k';
    return price.toStringAsFixed(0);
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inDays > 30) return '${(diff.inDays / 30).floor()} months ago';
    if (diff.inDays > 0) return '${diff.inDays}d ago';
    if (diff.inHours > 0) return '${diff.inHours}h ago';
    return '${diff.inMinutes}m ago';
  }
}
