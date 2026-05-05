import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gig_hub/data/models/category_model.dart';
import 'package:gig_hub/data/providers/auth_provider.dart';
import 'package:gig_hub/data/repositories/category_repository.dart';

/// [CategoryRepository] — depends on [ApiClient].
final categoryRepositoryProvider = Provider<CategoryRepository>((ref) {
  return CategoryRepository(client: ref.watch(apiClientProvider));
});

/// Fetches all available categories from the API.
final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  final repo = ref.watch(categoryRepositoryProvider);
  return repo.getCategories();
});
