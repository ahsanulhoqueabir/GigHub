import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/data/models/gig_model.dart';
import 'package:gighub/data/providers/category_provider.dart';
import 'package:gighub/data/providers/gig_provider.dart';
import 'package:gighub/presentation/widgets/common/category_chips_row.dart';
import 'package:gighub/presentation/widgets/common/filter_bottom_sheet.dart';
import 'package:gighub/presentation/widgets/common/gh_shimmer.dart';
import 'package:gighub/presentation/widgets/gigs/gig_card.dart';

/// Browse all gigs in a responsive grid with filters.
class BrowseGigsScreen extends ConsumerStatefulWidget {
  const BrowseGigsScreen({super.key});

  @override
  ConsumerState<BrowseGigsScreen> createState() => _BrowseGigsScreenState();
}

class _BrowseGigsScreenState extends ConsumerState<BrowseGigsScreen> {
  final _searchController = TextEditingController();
  String? _categorySlug;
  String _sortBy = 'newest';
  double? _minPrice;
  double? _maxPrice;
  int _page = 1;

  // Accumulate items for infinite scroll
  final List<GigSummary> _gigs = [];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadGigs() {
    ref.invalidate(gigsListProvider);
  }

  void _showFilters() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => FilterBottomSheet(
        sections: [
          FilterSection(
            title: 'Sort By',
            key: 'sort_by',
            options: const [
              FilterOption(label: 'Newest', value: 'newest'),
              FilterOption(label: 'Price: Low to High', value: 'price_asc'),
              FilterOption(label: 'Price: High to Low', value: 'price_desc'),
              FilterOption(label: 'Rating', value: 'rating'),
            ],
          ),
          FilterSection(
            title: 'Price Range (BDT)',
            key: 'price_range',
            options: const [
              FilterOption(label: 'Under \u09F3500', value: '0-500'),
              FilterOption(label: '\u09F3500 - \u09F35,000', value: '500-5000'),
              FilterOption(
                label: '\u09F35,000 - \u09F315,000',
                value: '5000-15000',
              ),
              FilterOption(label: 'Above \u09F315,000', value: '15000-999999'),
            ],
          ),
        ],
        initialValues: {'sort_by': _sortBy},
        onApply: (values) {
          setState(() {
            _sortBy = (values['sort_by'] as String?) ?? 'newest';
            final priceRange = values['price_range'] as String?;
            if (priceRange != null) {
              final parts = priceRange.split('-');
              _minPrice = double.tryParse(parts[0]);
              _maxPrice = double.tryParse(parts[1]);
            } else {
              _minPrice = null;
              _maxPrice = null;
            }
            _page = 1;
            _gigs.clear();
          });
          _loadGigs();
        },
        onReset: () {
          setState(() {
            _sortBy = 'newest';
            _minPrice = null;
            _maxPrice = null;
            _page = 1;
            _gigs.clear();
          });
          _loadGigs();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(categoriesProvider);
    final params = GigQueryParams(
      categorySlug: _categorySlug,
      search: _searchController.text.isEmpty ? null : _searchController.text,
      minPrice: _minPrice,
      maxPrice: _maxPrice,
      sortBy: _sortBy,
      page: _page,
    );
    final gigsAsync = ref.watch(gigsListProvider(params));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gigs'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilters,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSizes.space16,
              vertical: AppSizes.space8,
            ),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search gigs...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _page = 1;
                          _gigs.clear();
                          _loadGigs();
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppSizes.radiusMd),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: AppSizes.space16,
                  vertical: AppSizes.space8,
                ),
              ),
              onSubmitted: (_) {
                _page = 1;
                _gigs.clear();
                _loadGigs();
              },
            ),
          ),
          // Category chips
          categoriesAsync.when(
            data: (cats) => CategoryChipsRow(
              categories: cats,
              selectedSlug: _categorySlug,
              onSelected: (slug) {
                setState(() {
                  _categorySlug = slug;
                  _page = 1;
                  _gigs.clear();
                });
                _loadGigs();
              },
            ),
            loading: () => const SizedBox(
              height: 44,
              child: Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            ),
            error: (_, __) => const SizedBox.shrink(),
          ),
          const SizedBox(height: AppSizes.space8),
          // Gig grid
          Expanded(
            child: gigsAsync.when(
              data: (response) {
                if (_page == 1) _gigs.clear();
                for (final g in response.data) {
                  if (!_gigs.any((existing) => existing.id == g.id))
                    _gigs.add(g);
                }
                if (_gigs.isEmpty)
                  return Center(
                    child: Text(
                      'No gigs found',
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  );
                return GridView.builder(
                  padding: const EdgeInsets.all(AppSizes.space8),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.72,
                    crossAxisSpacing: AppSizes.space8,
                    mainAxisSpacing: AppSizes.space8,
                  ),
                  itemCount: _gigs.length + (response.hasMore ? 1 : 0),
                  itemBuilder: (_, i) {
                    if (i >= _gigs.length) {
                      _page++;
                      _loadGigs();
                      return const Center(child: CircularProgressIndicator());
                    }
                    return GigCard(
                      gig: _gigs[i],
                      onTap: () => context.push('/gigs/${_gigs[i].slug}'),
                    );
                  },
                );
              },
              loading: () => GridView.builder(
                padding: const EdgeInsets.all(AppSizes.space8),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.72,
                  crossAxisSpacing: AppSizes.space8,
                  mainAxisSpacing: AppSizes.space8,
                ),
                itemCount: 6,
                itemBuilder: (_, __) => GhShimmer.card(height: 200),
              ),
              error: (err, _) => Center(child: Text('Error: $err')),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/gigs/create'),
        icon: const Icon(Icons.add),
        label: const Text('Create Gig'),
      ),
    );
  }
}
