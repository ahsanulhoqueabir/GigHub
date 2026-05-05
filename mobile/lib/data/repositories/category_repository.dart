import 'package:gig_hub/core/constants/api_constants.dart';
import 'package:gig_hub/core/network/api_client.dart';
import 'package:gig_hub/data/models/category_model.dart';

/// Repository for category operations.
class CategoryRepository {
  final ApiClient _client;

  const CategoryRepository({required ApiClient client}) : _client = client;

  /// Fetch all available categories.
  Future<List<Category>> getCategories() async {
    final response = await _client.get<List<dynamic>>(ApiConstants.categories);
    final data = response.data ?? [];
    return data
        .map((e) => Category.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
