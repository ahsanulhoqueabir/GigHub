import 'package:gighub/data/models/pagination_model.dart';
import 'package:gighub/data/models/proposal_model.dart';
import 'package:gighub/data/services/mock_data_service.dart';

/// Mock proposal repository — reads from [MockDataService].
class ProposalRepository {
  final MockDataService _mock = MockDataService.instance;

  /// Submit a proposal for a job (mock).
  Future<Proposal> submitProposal(
    String jobId,
    CreateProposalInput input,
  ) async {
    await _delay(500);
    return Proposal(
      id: 'prop_${_mock.proposals.length + 1}',
      jobId: jobId,
      freelancer: _mock.profiles.firstWhere((p) => p.id == 'u_1'),
      coverLetter: input.coverLetter,
      proposedPrice: input.proposedPrice,
      estimatedDays: input.estimatedDays,
      status: 'pending',
      createdAt: DateTime.now(),
    );
  }

  /// Get proposals for a specific job.
  Future<PaginatedResponse<Proposal>> getProposalsForJob(
    String jobId, {
    int page = 1,
  }) async {
    await _delay();
    final list = _mock.proposals.where((p) => p.jobId == jobId).toList();
    return PaginatedResponse(
      data: list,
      meta: PaginationMeta(
        page: page,
        limit: 20,
        total: list.length,
        totalPages: 1,
      ),
    );
  }

  /// Get proposals submitted by the current user (hardcoded to u_1).
  Future<PaginatedResponse<Proposal>> getMyProposals({int page = 1}) async {
    await _delay();
    final list = _mock.proposals
        .where((p) => p.freelancer.id == 'u_1')
        .toList();
    return PaginatedResponse(
      data: list,
      meta: PaginationMeta(
        page: page,
        limit: 20,
        total: list.length,
        totalPages: 1,
      ),
    );
  }

  /// Withdraw a proposal (mock).
  Future<void> withdrawProposal(String id) async {
    await _delay(300);
  }

  /// Accept a proposal (mock).
  Future<void> acceptProposal(String id) async {
    await _delay(300);
  }

  /// Reject a proposal (mock).
  Future<void> rejectProposal(String id) async {
    await _delay(300);
  }

  Future<void> _delay([int ms = 300]) async {
    await Future.delayed(Duration(milliseconds: ms));
  }
}
