import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gighub/data/models/category_model.dart';
import 'package:gighub/data/services/mock_data_service.dart';

/// Fetches all available categories from mock data.
final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  await MockDataService.instance.ensureLoaded();
  await Future.delayed(const Duration(milliseconds: 200));
  return MockDataService.instance.categories;
});
