import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:gighub/data/models/category_model.dart';
import 'package:gighub/data/models/profile_model.dart';

part 'gig_model.freezed.dart';
part 'gig_model.g.dart';

/// Summary view of a gig for list/grid display.
@freezed
class GigSummary with _$GigSummary {
  @JsonSerializable(fieldRename: FieldRename.snake)
  const factory GigSummary({
    required String id,
    required String title,
    required String slug,
    required Category category,
    required PublicProfile seller,
    String? thumbnail,
    required double startingPrice,
    required double avgRating,
    required int totalReviews,
    @Default(0) int totalOrders,
    required String status,
  }) = _GigSummary;

  factory GigSummary.fromJson(Map<String, dynamic> json) =>
      _$GigSummaryFromJson(json);

  const GigSummary._();
}

/// Full gig detail including packages, images, and description.
@freezed
class GigDetail with _$GigDetail {
  @JsonSerializable(fieldRename: FieldRename.snake)
  const factory GigDetail({
    required String id,
    required String title,
    required String slug,
    required Category category,
    required PublicProfile seller,
    String? thumbnail,
    @Default([]) List<String> images,
    required String description,
    required double startingPrice,
    required double avgRating,
    required int totalReviews,
    @Default(0) int totalOrders,
    required String status,
    @Default([]) List<String> tags,
    @Default([]) List<GigPackage> packages,
    @Default(1) int deliveryDaysMin,
  }) = _GigDetail;

  factory GigDetail.fromJson(Map<String, dynamic> json) =>
      _$GigDetailFromJson(json);

  const GigDetail._();
}

/// A single package (tier) within a gig.
@freezed
class GigPackage with _$GigPackage {
  @JsonSerializable(fieldRename: FieldRename.snake)
  const factory GigPackage({
    required String id,
    required String tier,
    required String title,
    required String description,
    required double price,
    required int deliveryDays,
    required int revisions,
    @Default([]) List<String> features,
  }) = _GigPackage;

  factory GigPackage.fromJson(Map<String, dynamic> json) =>
      _$GigPackageFromJson(json);

  const GigPackage._();
}

/// Input for creating a gig.
@freezed
class CreateGigInput with _$CreateGigInput {
  @JsonSerializable(fieldRename: FieldRename.snake)
  const factory CreateGigInput({
    required String title,
    required String categoryId,
    required String description,
    required List<CreatePackageInput> packages,
    @Default([]) List<String> tags,
    @Default([]) List<String> images,
  }) = _CreateGigInput;

  factory CreateGigInput.fromJson(Map<String, dynamic> json) =>
      _$CreateGigInputFromJson(json);

  const CreateGigInput._();
}

/// Input for a package when creating a gig.
@freezed
class CreatePackageInput with _$CreatePackageInput {
  @JsonSerializable(fieldRename: FieldRename.snake)
  const factory CreatePackageInput({
    required String tier,
    required String title,
    required String description,
    required double price,
    required int deliveryDays,
    required int revisions,
    @Default([]) List<String> features,
  }) = _CreatePackageInput;

  factory CreatePackageInput.fromJson(Map<String, dynamic> json) =>
      _$CreatePackageInputFromJson(json);

  const CreatePackageInput._();
}

/// Input for updating a gig.
@freezed
class UpdateGigInput with _$UpdateGigInput {
  @JsonSerializable(fieldRename: FieldRename.snake, includeIfNull: false)
  const factory UpdateGigInput({
    String? title,
    String? categoryId,
    String? description,
    List<CreatePackageInput>? packages,
    List<String>? tags,
    List<String>? images,
    String? status,
  }) = _UpdateGigInput;

  factory UpdateGigInput.fromJson(Map<String, dynamic> json) =>
      _$UpdateGigInputFromJson(json);

  const UpdateGigInput._();
}

/// Query parameters for filtering gigs.
class GigQueryParams {
  final String? categorySlug;
  final String? search;
  final double? minPrice;
  final double? maxPrice;
  final String? sortBy;
  final int page;
  final int limit;

  const GigQueryParams({
    this.categorySlug,
    this.search,
    this.minPrice,
    this.maxPrice,
    this.sortBy,
    this.page = 1,
    this.limit = 20,
  });

  Map<String, dynamic> toJson() => {
    if (categorySlug != null) 'category_slug': categorySlug,
    if (search != null) 'search': search,
    if (minPrice != null) 'min_price': minPrice,
    if (maxPrice != null) 'max_price': maxPrice,
    if (sortBy != null) 'sort_by': sortBy,
    'page': page,
    'limit': limit,
  };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is GigQueryParams &&
          runtimeType == other.runtimeType &&
          categorySlug == other.categorySlug &&
          search == other.search &&
          minPrice == other.minPrice &&
          maxPrice == other.maxPrice &&
          sortBy == other.sortBy &&
          page == other.page &&
          limit == other.limit;

  @override
  int get hashCode => Object.hash(
    categorySlug,
    search,
    minPrice,
    maxPrice,
    sortBy,
    page,
    limit,
  );
}
