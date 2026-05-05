import 'package:gighub/data/models/gig_model.dart';
import 'package:gighub/data/models/pagination_model.dart';
import 'package:gighub/data/services/mock_data_service.dart';

/// Mock gig repository — reads from [MockDataService].
///
/// Simulates a short delay to mimic network latency. Swap this out for a real
/// API-backed repository when the backend is ready.
class GigRepository {
  final MockDataService _mock = MockDataService.instance;

  /// Fetch paginated gigs with optional filtering.
  Future<PaginatedResponse<GigSummary>> getGigs(GigQueryParams params) async {
    await _mock.ensureLoaded();
    await _delay();

    var gigs = _mock.gigs.map(_toSummary).toList();

    // Filter by category
    if (params.categorySlug != null) {
      gigs = gigs.where((g) => g.category.slug == params.categorySlug).toList();
    }

    // Filter by search
    if (params.search != null && params.search!.isNotEmpty) {
      final q = params.search!.toLowerCase();
      gigs = gigs.where((g) => g.title.toLowerCase().contains(q)).toList();
    }

    // Filter by price
    if (params.minPrice != null) {
      gigs = gigs.where((g) => g.startingPrice >= params.minPrice!).toList();
    }
    if (params.maxPrice != null) {
      gigs = gigs.where((g) => g.startingPrice <= params.maxPrice!).toList();
    }

    // Sort
    switch (params.sortBy) {
      case 'price_asc':
        gigs.sort((a, b) => a.startingPrice.compareTo(b.startingPrice));
        break;
      case 'price_desc':
        gigs.sort((a, b) => b.startingPrice.compareTo(a.startingPrice));
        break;
      case 'rating':
        gigs.sort((a, b) => b.avgRating.compareTo(a.avgRating));
        break;
      case 'newest':
      default:
        break;
    }

    final total = gigs.length;
    final totalPages = (total / params.limit).ceil();
    final start = (params.page - 1) * params.limit;
    final pageItems = gigs.skip(start).take(params.limit).toList();

    return PaginatedResponse(
      data: pageItems,
      meta: PaginationMeta(
        page: params.page,
        limit: params.limit,
        total: total,
        totalPages: totalPages,
      ),
    );
  }

  /// Fetch a single gig by its slug.
  Future<GigDetail> getGigBySlug(String slug) async {
    await _mock.ensureLoaded();
    await _delay();
    return _mock.gigs.firstWhere(
      (g) => g.slug == slug,
      orElse: () => throw Exception('Gig not found'),
    );
  }

  /// Fetch related gigs in the same category (excluding current gig).
  Future<List<GigSummary>> getRelatedGigs(String slug) async {
    await _mock.ensureLoaded();
    await _delay(200);
    final relatedSlugs = _mock.relatedGigSlugs(slug);
    if (relatedSlugs.isNotEmpty) {
      return relatedSlugs
          .map(
            (s) => _mock.gigs.firstWhere(
              (g) => g.slug == s,
              orElse: () => throw Exception('Related gig not found'),
            ),
          )
          .map(_toSummary)
          .toList();
    }
    final currentGig = _mock.gigs.firstWhere(
      (g) => g.slug == slug,
      orElse: () => throw Exception('Gig not found'),
    );
    final related = _mock.gigs
        .where((g) => g.category.id == currentGig.category.id && g.slug != slug)
        .take(5)
        .map(_toSummary)
        .toList();
    // If not enough in same category, add other gigs
    if (related.length < 3) {
      final others = _mock.gigs
          .where(
            (g) => g.slug != slug && g.category.id != currentGig.category.id,
          )
          .take(5 - related.length)
          .map(_toSummary)
          .toList();
      related.addAll(others);
    }
    return related;
  }

  /// Fetch gigs belonging to the current user (hardcoded to u_1).
  Future<PaginatedResponse<GigSummary>> getMyGigs({int page = 1}) async {
    await _mock.ensureLoaded();
    await _delay();
    final myGigs = _mock.gigs
        .where((g) => g.seller.id == 'u_1')
        .map(_toSummary)
        .toList();
    return PaginatedResponse(
      data: myGigs,
      meta: PaginationMeta(
        page: page,
        limit: 20,
        total: myGigs.length,
        totalPages: 1,
      ),
    );
  }

  /// Create a new gig (mock — returns a dummy gig).
  Future<GigDetail> createGig(CreateGigInput input) async {
    await _mock.ensureLoaded();
    await _delay(600);
    final detail = GigDetail(
      id: 'gig_${_mock.gigs.length + 1}',
      title: input.title,
      slug: input.title.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-'),
      category: _mock.categories.firstWhere((c) => c.id == input.categoryId),
      seller: _mock.profiles.firstWhere((p) => p.id == 'u_1'),
      description: input.description,
      startingPrice: input.packages.isNotEmpty ? input.packages.first.price : 0,
      avgRating: 0,
      totalReviews: 0,
      totalOrders: 0,
      status: 'active',
      tags: input.tags,
      packages: input.packages
          .map(
            (p) => GigPackage(
              id: 'pkg_${DateTime.now().millisecondsSinceEpoch}',
              tier: p.tier,
              title: p.title,
              description: p.description,
              price: p.price,
              deliveryDays: p.deliveryDays,
              revisions: p.revisions,
              features: p.features,
            ),
          )
          .toList(),
      deliveryDaysMin: input.packages.isNotEmpty
          ? input.packages
                .map((p) => p.deliveryDays)
                .reduce((a, b) => a < b ? a : b)
          : 1,
    );
    // Add to local mock list so it appears in the UI
    _mock.gigs.add(detail);
    return detail;
  }

  /// Update a gig (mock).
  Future<GigDetail> updateGig(String id, UpdateGigInput input) async {
    await _mock.ensureLoaded();
    await _delay(400);
    final idx = _mock.gigs.indexWhere((g) => g.id == id);
    if (idx == -1) throw Exception('Gig not found');
    return _mock.gigs[idx];
  }

  /// Delete a gig (mock).
  Future<void> deleteGig(String id) async {
    await _mock.ensureLoaded();
    await _delay(300);
  }

  /// Toggle gig status (mock).
  Future<void> toggleGigStatus(String id, String status) async {
    await _mock.ensureLoaded();
    await _delay(300);
  }

  /// Convert [GigDetail] to [GigSummary].
  GigSummary _toSummary(GigDetail g) => GigSummary(
    id: g.id,
    title: g.title,
    slug: g.slug,
    category: g.category,
    seller: g.seller,
    thumbnail: g.thumbnail,
    startingPrice: g.startingPrice,
    avgRating: g.avgRating,
    totalReviews: g.totalReviews,
    totalOrders: g.totalOrders,
    status: g.status,
  );

  Future<void> _delay([int ms = 300]) async {
    await Future.delayed(Duration(milliseconds: ms));
  }
}
