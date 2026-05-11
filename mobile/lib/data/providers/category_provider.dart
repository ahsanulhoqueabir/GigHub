import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gighub/data/models/category_model.dart';
import 'package:gighub/data/providers/auth_provider.dart';
import 'package:gighub/data/repositories/category_repository.dart';

/// Repository provider — depends on [apiClientProvider] from auth_provider.
final categoryRepositoryProvider = Provider<CategoryRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return CategoryRepository(client: client);
});

// ── Category Cache ────────────────────────────────────

/// Internal version counter. When incremented, [categoriesProvider] refetches.
final _categoryVersionProvider = StateProvider<int>((ref) => 0);

/// Cached categories fetched from the real API.
///
/// - Kept alive so categories persist across page navigations.
/// - Refetches automatically every 5 minutes (driven by the app‑level timer).
/// - Call `ref.read(refreshCategoriesProvider)()` to force an immediate refresh.
final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  // Watching the version counter ensures a refetch when the timer bumps it.
  ref.watch(_categoryVersionProvider);
  ref.keepAlive();

  final repo = ref.watch(categoryRepositoryProvider);
  return repo.getCategories();
});

/// Returns a callback that forces an immediate category refresh,
/// bypassing the 5‑minute cache window.
final refreshCategoriesProvider = Provider<void Function()>((ref) {
  return () {
    ref.read(_categoryVersionProvider.notifier).state++;
  };
});
