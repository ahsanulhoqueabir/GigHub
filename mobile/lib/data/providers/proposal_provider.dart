import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gighub/data/models/pagination_model.dart';
import 'package:gighub/data/models/proposal_model.dart';
import 'package:gighub/data/repositories/proposal_repository.dart';

/// Repository provider.
final proposalRepositoryProvider = Provider<ProposalRepository>(
  (ref) => ProposalRepository(),
);

/// Fetches proposals for a specific job.
final jobProposalsProvider =
    FutureProvider.family<PaginatedResponse<Proposal>, String>((
      ref,
      jobId,
    ) async {
      final repo = ref.watch(proposalRepositoryProvider);
      return repo.getProposalsForJob(jobId);
    });

/// Fetches proposals submitted by the current user.
final myProposalsProvider =
    FutureProvider.family<PaginatedResponse<Proposal>, int>((ref, page) async {
      final repo = ref.watch(proposalRepositoryProvider);
      return repo.getMyProposals(page: page);
    });

/// Notifier for submitting proposals.
class ProposalFormNotifier extends StateNotifier<AsyncValue<void>> {
  final ProposalRepository _repo;

  ProposalFormNotifier(this._repo) : super(const AsyncValue.data(null));

  Future<void> submitProposal(String jobId, CreateProposalInput input) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await _repo.submitProposal(jobId, input);
    });
  }
}

final proposalFormNotifierProvider =
    StateNotifierProvider<ProposalFormNotifier, AsyncValue<void>>(
      (ref) => ProposalFormNotifier(ref.watch(proposalRepositoryProvider)),
    );

/// Notifier for proposal actions (accept/reject/withdraw).
class ProposalActionNotifier extends StateNotifier<AsyncValue<void>> {
  final ProposalRepository _repo;

  ProposalActionNotifier(this._repo) : super(const AsyncValue.data(null));

  Future<void> acceptProposal(String id) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _repo.acceptProposal(id));
  }

  Future<void> rejectProposal(String id) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _repo.rejectProposal(id));
  }

  Future<void> withdrawProposal(String id) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _repo.withdrawProposal(id));
  }
}

final proposalActionNotifierProvider =
    StateNotifierProvider<ProposalActionNotifier, AsyncValue<void>>(
      (ref) => ProposalActionNotifier(ref.watch(proposalRepositoryProvider)),
    );
