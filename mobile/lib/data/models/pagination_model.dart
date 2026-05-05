import 'package:freezed_annotation/freezed_annotation.dart';

part 'pagination_model.freezed.dart';
part 'pagination_model.g.dart';

/// Generic paginated response wrapper used for list endpoints.
///
/// The backend returns:
/// ```json
/// {
///   "success": true,
///   "data": [ ... ],
///   "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
/// }
/// ```
///
/// Use [PaginatedResponse.fromJson] with a mapper function:
/// ```dart
/// final response = PaginatedResponse.fromJson(
///   json,
///   (item) => Gig.fromJson(item as Map<String, dynamic>),
/// );
/// ```

class PaginatedResponse<T> {
  final List<T> data;
  final PaginationMeta meta;

  const PaginatedResponse({required this.data, required this.meta});

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromItem,
  ) {
    final rawData = json['data'] as List<dynamic>? ?? [];
    return PaginatedResponse<T>(
      data: rawData.map((e) => fromItem(e as Map<String, dynamic>)).toList(),
      meta: json['meta'] != null
          ? PaginationMeta.fromJson(json['meta'] as Map<String, dynamic>)
          : const PaginationMeta(),
    );
  }

  bool get hasMore => meta.hasMore;
}

@freezed
class PaginationMeta with _$PaginationMeta {
  const factory PaginationMeta({
    @Default(1) int page,
    @Default(20) int limit,
    @Default(0) int total,
    @Default(0) int totalPages,
  }) = _PaginationMeta;

  factory PaginationMeta.fromJson(Map<String, dynamic> json) =>
      _$PaginationMetaFromJson(json);

  const PaginationMeta._();

  bool get hasMore => page < totalPages;
}
