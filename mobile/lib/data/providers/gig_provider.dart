import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gighub/data/models/gig_model.dart';
import 'package:gighub/data/models/pagination_model.dart';
import 'package:gighub/data/repositories/gig_repository.dart';

/// Repository provider.
final gigRepositoryProvider = Provider<GigRepository>((ref) => GigRepository());

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

/// Fetches related gigs (same category, excluding current gig).
final relatedGigsProvider = FutureProvider.family<List<GigSummary>, String>((
  ref,
  slug,
) async {
  final repo = ref.watch(gigRepositoryProvider);
  return repo.getRelatedGigs(slug);
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
}

final gigFormNotifierProvider =
    StateNotifierProvider<GigFormNotifier, AsyncValue<void>>(
      (ref) => GigFormNotifier(ref.watch(gigRepositoryProvider)),
    );
