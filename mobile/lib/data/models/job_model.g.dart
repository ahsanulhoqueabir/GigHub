// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'job_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$JobImpl _$$JobImplFromJson(Map<String, dynamic> json) => _$JobImpl(
  id: json['id'] as String,
  title: json['title'] as String,
  slug: json['slug'] as String,
  description: json['description'] as String,
  category: Category.fromJson(json['category'] as Map<String, dynamic>),
  client: PublicProfile.fromJson(json['client'] as Map<String, dynamic>),
  type: json['type'] as String,
  budgetMin: (json['budget_min'] as num).toDouble(),
  budgetMax: (json['budget_max'] as num).toDouble(),
  deadline: json['deadline'] as String?,
  skillsRequired:
      (json['skills_required'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList() ??
      const [],
  experienceLevel: json['experience_level'] as String? ?? 'intermediate',
  status: json['status'] as String,
  totalProposals: (json['total_proposals'] as num?)?.toInt() ?? 0,
  createdAt: DateTime.parse(json['created_at'] as String),
);

Map<String, dynamic> _$$JobImplToJson(_$JobImpl instance) => <String, dynamic>{
  'id': instance.id,
  'title': instance.title,
  'slug': instance.slug,
  'description': instance.description,
  'category': instance.category,
  'client': instance.client,
  'type': instance.type,
  'budget_min': instance.budgetMin,
  'budget_max': instance.budgetMax,
  'deadline': instance.deadline,
  'skills_required': instance.skillsRequired,
  'experience_level': instance.experienceLevel,
  'status': instance.status,
  'total_proposals': instance.totalProposals,
  'created_at': instance.createdAt.toIso8601String(),
};

_$CreateJobInputImpl _$$CreateJobInputImplFromJson(Map<String, dynamic> json) =>
    _$CreateJobInputImpl(
      title: json['title'] as String,
      description: json['description'] as String,
      categoryId: json['category_id'] as String,
      type: json['type'] as String,
      budgetMin: (json['budget_min'] as num).toDouble(),
      budgetMax: (json['budget_max'] as num).toDouble(),
      deadline: json['deadline'] as String?,
      skillsRequired:
          (json['skills_required'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      experienceLevel: json['experience_level'] as String? ?? 'intermediate',
    );

Map<String, dynamic> _$$CreateJobInputImplToJson(
  _$CreateJobInputImpl instance,
) => <String, dynamic>{
  'title': instance.title,
  'description': instance.description,
  'category_id': instance.categoryId,
  'type': instance.type,
  'budget_min': instance.budgetMin,
  'budget_max': instance.budgetMax,
  'deadline': instance.deadline,
  'skills_required': instance.skillsRequired,
  'experience_level': instance.experienceLevel,
};

_$UpdateJobInputImpl _$$UpdateJobInputImplFromJson(Map<String, dynamic> json) =>
    _$UpdateJobInputImpl(
      title: json['title'] as String?,
      description: json['description'] as String?,
      categoryId: json['category_id'] as String?,
      type: json['type'] as String?,
      budgetMin: (json['budget_min'] as num?)?.toDouble(),
      budgetMax: (json['budget_max'] as num?)?.toDouble(),
      deadline: json['deadline'] as String?,
      skillsRequired: (json['skills_required'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      experienceLevel: json['experience_level'] as String?,
      status: json['status'] as String?,
    );

Map<String, dynamic> _$$UpdateJobInputImplToJson(
  _$UpdateJobInputImpl instance,
) => <String, dynamic>{
  if (instance.title case final value?) 'title': value,
  if (instance.description case final value?) 'description': value,
  if (instance.categoryId case final value?) 'category_id': value,
  if (instance.type case final value?) 'type': value,
  if (instance.budgetMin case final value?) 'budget_min': value,
  if (instance.budgetMax case final value?) 'budget_max': value,
  if (instance.deadline case final value?) 'deadline': value,
  if (instance.skillsRequired case final value?) 'skills_required': value,
  if (instance.experienceLevel case final value?) 'experience_level': value,
  if (instance.status case final value?) 'status': value,
};
