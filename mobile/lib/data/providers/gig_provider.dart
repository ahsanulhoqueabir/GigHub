import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gighub/data/models/gig_model.dart';
import 'package:gighub/data/models/pagination_model.dart';
import 'package:gighub/data/providers/auth_provider.dart';
import 'package:gighub/data/repositories/gig_repository.dart';

/// Repository provider — depends on [apiClientProvider] from auth_provider.
final gigRepositoryProvider = Provider<GigRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return GigRepository(client: client);
});

/// Fetches paginated gigs list.
final gigsListProvider =
    FutureProvider.family<PaginatedResponse<GigSummary>, GigQueryParams>((
      ref,
      params,
    ) async {
      final repo = ref.watch(gigRepositoryProvider);
      return repo.getGigs(params);
    });

/// Fetches a single gig detail by slug.
final gigDetailProvider = FutureProvider.family<GigDetail, String>((
  ref,
  slug,
) async {
  final repo = ref.watch(gigRepositoryProvider);
  return repo.getGigBySlug(slug);
});

/// Fetches related gigs by category ID (excluding current gig by slug).
final relatedGigsProvider =
    FutureProvider.family<
      List<GigSummary>,
      ({String categoryId, String excludeSlug})
    >((ref, params) async {
      final repo = ref.watch(gigRepositoryProvider);
      return repo.getRelatedGigs(
        categoryId: params.categoryId,
        excludeSlug: params.excludeSlug,
        limit: 5,
      );
    });

/// Fetches gigs belonging to the current user.
final myGigsProvider =
    FutureProvider.family<PaginatedResponse<GigSummary>, int>((
      ref,
      page,
    ) async {
      final repo = ref.watch(gigRepositoryProvider);
      return repo.getMyGigs(page: page);
    });

/// Notifier for creating/updating gigs.
class GigFormNotifier extends StateNotifier<AsyncValue<void>> {
  final GigRepository _repo;

  GigFormNotifier(this._repo) : super(const AsyncValue.data(null));

  Future<void> createGig(CreateGigInput input) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await _repo.createGig(input);
    });
  }

  Future<void> updateGig(String id, UpdateGigInput input) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await _repo.updateGig(id, input);
    });
  }

  Future<void> deleteGig(String id) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await _repo.deleteGig(id);
    });
  }

  Future<void> toggleGigStatus(String id, String newStatus) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await _repo.toggleGigStatus(id, newStatus);
    });
  }
}

final gigFormNotifierProvider =
    StateNotifierProvider<GigFormNotifier, AsyncValue<void>>(
      (ref) => GigFormNotifier(ref.watch(gigRepositoryProvider)),
    );
