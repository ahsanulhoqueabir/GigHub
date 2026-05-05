import 'package:flutter/material.dart';
import 'package:gig_hub/core/constants/app_sizes.dart';
import 'package:gig_hub/data/models/proposal_model.dart';

/// A proposal card showing freelancer info, price, and cover letter.
class ProposalCard extends StatelessWidget {
  final Proposal proposal;
  final bool showActions;
  final VoidCallback? onAccept;
  final VoidCallback? onReject;

  const ProposalCard({
    super.key,
    required this.proposal,
    this.showActions = false,
    this.onAccept,
    this.onReject,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.symmetric(
        horizontal: AppSizes.space16,
        vertical: AppSizes.space4,
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSizes.space16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Freelancer row
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundImage: NetworkImage(
                    proposal.freelancer.avatar ?? '',
                  ),
                ),
                const SizedBox(width: AppSizes.space12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        proposal.freelancer.displayName,
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Row(
                        children: [
                          Icon(Icons.star, size: 14, color: Colors.amber),
                          const SizedBox(width: 2),
                          Text(
                            proposal.freelancer.avgRating.toStringAsFixed(1),
                            style: theme.textTheme.labelSmall,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Text(
                  '\u09F3${proposal.proposedPrice.toStringAsFixed(0)} \u2022 ${proposal.estimatedDays} days',
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSizes.space8),
            // Cover letter
            Text(
              proposal.coverLetter,
              style: theme.textTheme.bodySmall,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            // Status badge
            const SizedBox(height: AppSizes.space8),
            Row(
              children: [
                _StatusBadge(status: proposal.status),
                const Spacer(),
                if (showActions && proposal.status == 'pending') ...[
                  TextButton(onPressed: onReject, child: const Text('Reject')),
                  const SizedBox(width: AppSizes.space8),
                  FilledButton(
                    onPressed: onAccept,
                    child: const Text('Accept'),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    Color bg;
    Color text;

    switch (status) {
      case 'pending':
        bg = Colors.orange.shade100;
        text = Colors.orange.shade800;
        break;
      case 'accepted':
        bg = Colors.green.shade100;
        text = Colors.green.shade800;
        break;
      case 'rejected':
        bg = Colors.red.shade100;
        text = Colors.red.shade800;
        break;
      default:
        bg = Colors.grey.shade100;
        text = Colors.grey.shade800;
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSizes.space8,
        vertical: AppSizes.space4,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppSizes.radiusXs),
      ),
      child: Text(
        status.toUpperCase(),
        style: theme.textTheme.labelSmall?.copyWith(
          color: text,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
