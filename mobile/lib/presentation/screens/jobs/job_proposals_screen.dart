import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gig_hub/core/constants/app_sizes.dart';
import 'package:gig_hub/data/providers/proposal_provider.dart';
import 'package:gig_hub/presentation/widgets/proposals/proposal_card.dart';

/// View all proposals for a specific job (for job owner).
class JobProposalsScreen extends ConsumerWidget {
  final String jobId;

  const JobProposalsScreen({super.key, required this.jobId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final proposalsAsync = ref.watch(jobProposalsProvider(jobId));
    final actionNotifier = ref.watch(proposalActionNotifierProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: const Text('Proposals')),
      body: proposalsAsync.when(
        data: (response) {
          if (response.data.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.inbox,
                    size: 64,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(height: AppSizes.space16),
                  Text('No proposals yet', style: theme.textTheme.titleMedium),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: AppSizes.space8),
            itemCount: response.data.length,
            itemBuilder: (_, i) {
              final prop = response.data[i];
              return ProposalCard(
                proposal: prop,
                showActions: prop.status == 'pending',
                onAccept: () {
                  actionNotifier.acceptProposal(prop.id);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        'Accepted proposal from ${prop.freelancer.displayName} (UI only)',
                      ),
                    ),
                  );
                },
                onReject: () {
                  actionNotifier.rejectProposal(prop.id);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        'Rejected proposal from ${prop.freelancer.displayName} (UI only)',
                      ),
                    ),
                  );
                },
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }
}
