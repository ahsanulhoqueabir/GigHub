import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gig_hub/core/constants/app_sizes.dart';
import 'package:gig_hub/data/providers/proposal_provider.dart';
import 'package:gig_hub/presentation/widgets/proposals/proposal_card.dart';

/// List proposals submitted by the current user.
class MyProposalsScreen extends ConsumerWidget {
  const MyProposalsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final proposalsAsync = ref.watch(myProposalsProvider(1));

    return Scaffold(
      appBar: AppBar(title: const Text('My Proposals')),
      body: proposalsAsync.when(
        data: (response) {
          if (response.data.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.send_outlined,
                    size: 64,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(height: AppSizes.space16),
                  Text(
                    'No proposals submitted yet',
                    style: theme.textTheme.titleMedium,
                  ),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: AppSizes.space8),
            itemCount: response.data.length,
            itemBuilder: (_, i) {
              final prop = response.data[i];
              return ProposalCard(proposal: prop, showActions: false);
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
      ),
    );
  }
}
