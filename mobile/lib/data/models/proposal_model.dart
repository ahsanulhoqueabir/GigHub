import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:gig_hub/data/models/profile_model.dart';

part 'proposal_model.freezed.dart';
part 'proposal_model.g.dart';

/// A proposal submitted by a freelancer for a job.
@freezed
class Proposal with _$Proposal {
  @JsonSerializable(fieldRename: FieldRename.snake)
  const factory Proposal({
    required String id,
    required String jobId,
    required PublicProfile freelancer,
    required String coverLetter,
    required double proposedPrice,
    required int estimatedDays,
    required String status,
    required DateTime createdAt,
  }) = _Proposal;

  factory Proposal.fromJson(Map<String, dynamic> json) =>
      _$ProposalFromJson(json);

  const Proposal._();
}

/// Input for submitting a proposal.
@freezed
class CreateProposalInput with _$CreateProposalInput {
  @JsonSerializable(fieldRename: FieldRename.snake)
  const factory CreateProposalInput({
    required String coverLetter,
    required double proposedPrice,
    required int estimatedDays,
  }) = _CreateProposalInput;

  factory CreateProposalInput.fromJson(Map<String, dynamic> json) =>
      _$CreateProposalInputFromJson(json);

  const CreateProposalInput._();
}
