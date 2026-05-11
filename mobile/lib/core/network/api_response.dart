/// Generic API response wrapper matching the backend response shape.
///
/// ```json
/// {
///   "success": true,
///   "data": { ... },
///   "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 },
///   "message": "OK"
/// }
/// ```
class ApiResponse<T> {
  final bool success;
  final T? data;
  final PaginationMeta? meta;
  final String? message;

  const ApiResponse({
    required this.success,
    this.data,
    this.meta,
    this.message,
  });

  factory ApiResponse.fromJson(Map<String, dynamic> json) {
    return ApiResponse<T>(
      success: json['success'] as bool? ?? true,
      data: json['data'] as T?,
      meta: json['meta'] != null
          ? PaginationMeta.fromJson(json['meta'] as Map<String, dynamic>)
          : null,
      message: json['message'] as String?,
    );
  }
}

/// Pagination metadata included in paginated list responses.
class PaginationMeta {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const PaginationMeta({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  factory PaginationMeta.fromJson(Map<String, dynamic> json) {
    return PaginationMeta(
      page: json['page'] as int? ?? 1,
      limit: json['limit'] as int? ?? 20,
      total: json['total'] as int? ?? 0,
      totalPages: json['totalPages'] as int? ?? 0,
    );
  }

  bool get hasMore => page < totalPages;
}
