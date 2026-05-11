import 'package:gighub/core/constants/api_constants.dart';
import 'package:gighub/core/network/api_client.dart';
import 'package:gighub/core/network/api_response.dart' as api;
import 'package:gighub/data/models/gig_model.dart';
import 'package:gighub/data/models/pagination_model.dart';

/// Repository for all gig-related API operations.
class GigRepository {
  final ApiClient _client;

  const GigRepository({required ApiClient client}) : _client = client;

  PaginationMeta _toMeta(api.PaginationMeta? m) => PaginationMeta(
    page: m?.page ?? 1,
    limit: m?.limit ?? 20,
    total: m?.total ?? 0,
    totalPages: m?.totalPages ?? 0,
  );

  /// Fetch paginated gigs with optional filtering.
  Future<PaginatedResponse<GigSummary>> getGigs(GigQueryParams params) async {
    final response = await _client.get<dynamic>(
      ApiConstants.gigs,
      queryParameters: params.toQuery(),
    );

    final rawData = response.data;
    if (rawData is List) {
      return PaginatedResponse(
        data: rawData
            .map((e) => GigSummary.fromJson(e as Map<String, dynamic>))
            .toList(),
        meta: _toMeta(response.meta),
      );
    }
    return PaginatedResponse(data: [], meta: _toMeta(response.meta));
  }

  /// Fetch a single gig by its slug.
  Future<GigDetail> getGigBySlug(String slug) async {
    final response = await _client.get<Map<String, dynamic>>(
      '${ApiConstants.gigs}/$slug',
    );
    return GigDetail.fromJson(response.data!);
  }

  /// Fetch related gigs in the same category (excluding current gig).
  /// Uses the gig list endpoint filtered by category ID.
  Future<List<GigSummary>> getRelatedGigs({
    required String categoryId,
    required String excludeSlug,
    int limit = 5,
  }) async {
    final params = GigQueryParams(categoryId: categoryId, limit: limit);
    final response = await getGigs(params);
    return response.data
        .where((g) => g.slug != excludeSlug)
        .take(limit)
        .toList();
  }

  /// Fetch gigs belonging to the current user.
  Future<PaginatedResponse<GigSummary>> getMyGigs({
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _client.get<dynamic>(
      '${ApiConstants.gigs}/me',
      queryParameters: {'page': page.toString(), 'limit': limit.toString()},
    );

    final rawData = response.data;
    if (rawData is List) {
      return PaginatedResponse(
        data: rawData
            .map((e) => GigSummary.fromJson(e as Map<String, dynamic>))
            .toList(),
        meta: _toMeta(response.meta),
      );
    }
    return PaginatedResponse(data: [], meta: _toMeta(response.meta));
  }

  /// Create a new gig.
  Future<GigDetail> createGig(CreateGigInput input) async {
    final response = await _client.post<Map<String, dynamic>>(
      ApiConstants.gigs,
      data: input.toJson(),
    );
    return GigDetail.fromJson(response.data!);
  }

  /// Update a gig.
  Future<GigDetail> updateGig(String id, UpdateGigInput input) async {
    final response = await _client.patch<Map<String, dynamic>>(
      ApiConstants.gig(id),
      data: input.toJson(),
    );
    return GigDetail.fromJson(response.data!);
  }

  /// Delete a gig.
  Future<void> deleteGig(String id) async {
    await _client.delete(ApiConstants.gig(id));
  }

  /// Toggle gig status (pauses or activates a gig).
  Future<GigDetail> toggleGigStatus(String id, String newStatus) async {
    final input = UpdateGigInput(status: newStatus);
    return updateGig(id, input);
  }
}
