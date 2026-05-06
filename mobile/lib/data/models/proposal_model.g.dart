// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'proposal_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ProposalImpl _$$ProposalImplFromJson(Map<String, dynamic> json) =>
    _$ProposalImpl(
      id: json['id'] as String,
      jobId: json['job_id'] as String,
      freelancer: PublicProfile.fromJson(
        json['freelancer'] as Map<String, dynamic>,
      ),
      coverLetter: json['cover_letter'] as String,
      proposedPrice: (json['proposed_price'] as num).toDouble(),
      estimatedDays: (json['estimated_days'] as num).toInt(),
      status: json['status'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );

Map<String, dynamic> _$$ProposalImplToJson(_$ProposalImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'job_id': instance.jobId,
      'freelancer': instance.freelancer,
      'cover_letter': instance.coverLetter,
      'proposed_price': instance.proposedPrice,
      'estimated_days': instance.estimatedDays,
      'status': instance.status,
      'created_at': instance.createdAt.toIso8601String(),
    };

_$CreateProposalInputImpl _$$CreateProposalInputImplFromJson(
  Map<String, dynamic> json,
) => _$CreateProposalInputImpl(
  coverLetter: json['cover_letter'] as String,
  proposedPrice: (json['proposed_price'] as num).toDouble(),
  estimatedDays: (json['estimated_days'] as num).toInt(),
);

Map<String, dynamic> _$$CreateProposalInputImplToJson(
  _$CreateProposalInputImpl instance,
) => <String, dynamic>{
  'cover_letter': instance.coverLetter,
  'proposed_price': instance.proposedPrice,
  'estimated_days': instance.estimatedDays,
};
