import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:gighub/data/models/category_model.dart';
import 'package:gighub/data/models/profile_model.dart';

part 'job_model.freezed.dart';
part 'job_model.g.dart';

/// A job listing posted by a client.
@freezed
class Job with _$Job {
  @JsonSerializable(fieldRename: FieldRename.snake)
  const factory Job({
    required String id,
    required String title,
    required String slug,
    required String description,
    required Category category,
    required PublicProfile client,
    required String type,
    required double budgetMin,
    required double budgetMax,
    String? deadline,
    @Default([]) List<String> skillsRequired,
    @Default('intermediate') String experienceLevel,
    required String status,
    @Default(0) int totalProposals,
    required DateTime createdAt,
  }) = _Job;

  factory Job.fromJson(Map<String, dynamic> json) => _$JobFromJson(json);

  const Job._();
}

/// Input for creating a job.
@freezed
class CreateJobInput with _$CreateJobInput {
  @JsonSerializable(fieldRename: FieldRename.snake)
  const factory CreateJobInput({
    required String title,
    required String description,
    required String categoryId,
    required String type,
    required double budgetMin,
    required double budgetMax,
    String? deadline,
    @Default([]) List<String> skillsRequired,
    @Default('intermediate') String experienceLevel,
  }) = _CreateJobInput;

  factory CreateJobInput.fromJson(Map<String, dynamic> json) =>
      _$CreateJobInputFromJson(json);

  const CreateJobInput._();
}

/// Input for updating a job.
@freezed
class UpdateJobInput with _$UpdateJobInput {
  @JsonSerializable(fieldRename: FieldRename.snake, includeIfNull: false)
  const factory UpdateJobInput({
    String? title,
    String? description,
    String? categoryId,
    String? type,
    double? budgetMin,
    double? budgetMax,
    String? deadline,
    List<String>? skillsRequired,
    String? experienceLevel,
    String? status,
  }) = _UpdateJobInput;

  factory UpdateJobInput.fromJson(Map<String, dynamic> json) =>
      _$UpdateJobInputFromJson(json);

  const UpdateJobInput._();
}

/// Query parameters for filtering jobs.
class JobQueryParams {
  final String? categorySlug;
  final String? search;
  final String? type;
  final double? budgetMin;
  final double? budgetMax;
  final String? experienceLevel;
  final String? sortBy;
  final int page;
  final int limit;

  const JobQueryParams({
    this.categorySlug,
    this.search,
    this.type,
    this.budgetMin,
    this.budgetMax,
    this.experienceLevel,
    this.sortBy,
    this.page = 1,
    this.limit = 20,
  });

  Map<String, dynamic> toJson() => {
    if (categorySlug != null) 'category_slug': categorySlug,
    if (search != null) 'search': search,
    if (type != null) 'type': type,
    if (budgetMin != null) 'budget_min': budgetMin,
    if (budgetMax != null) 'budget_max': budgetMax,
    if (experienceLevel != null) 'experience_level': experienceLevel,
    if (sortBy != null) 'sort_by': sortBy,
    'page': page,
    'limit': limit,
  };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is JobQueryParams &&
          runtimeType == other.runtimeType &&
          categorySlug == other.categorySlug &&
          search == other.search &&
          type == other.type &&
          budgetMin == other.budgetMin &&
          budgetMax == other.budgetMax &&
          experienceLevel == other.experienceLevel &&
          sortBy == other.sortBy &&
          page == other.page &&
          limit == other.limit;

  @override
  int get hashCode => Object.hash(
    categorySlug,
    search,
    type,
    budgetMin,
    budgetMax,
    experienceLevel,
    sortBy,
    page,
    limit,
  );
}
