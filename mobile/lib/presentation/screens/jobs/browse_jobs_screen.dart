import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/data/models/job_model.dart';
import 'package:gighub/data/providers/category_provider.dart';
import 'package:gighub/data/providers/job_provider.dart';
import 'package:gighub/presentation/widgets/common/category_chips_row.dart';
import 'package:gighub/presentation/widgets/common/filter_bottom_sheet.dart';
import 'package:gighub/presentation/widgets/common/gh_shimmer.dart';
import 'package:gighub/presentation/widgets/jobs/job_card.dart';

/// Browse all jobs with filters.
class BrowseJobsScreen extends ConsumerStatefulWidget {
  const BrowseJobsScreen({super.key});

  @override
  ConsumerState<BrowseJobsScreen> createState() => _BrowseJobsScreenState();
}

class _BrowseJobsScreenState extends ConsumerState<BrowseJobsScreen> {
  final _searchController = TextEditingController();
  String? _categorySlug;
  String? _type;
  String _sortBy = 'newest';
  int _page = 1;
  final List<Job> _jobs = [];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadJobs() => ref.invalidate(jobsListProvider);

  void _showFilters() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => FilterBottomSheet(
        sections: [
          FilterSection(
            title: 'Job Type',
            key: 'type',
            options: const [
              FilterOption(label: 'Fixed Price', value: 'fixed'),
              FilterOption(label: 'Hourly', value: 'hourly'),
            ],
          ),
          FilterSection(
            title: 'Sort By',
            key: 'sort_by',
            options: const [
              FilterOption(label: 'Newest', value: 'newest'),
              FilterOption(label: 'Budget: Low to High', value: 'budget_asc'),
              FilterOption(label: 'Budget: High to Low', value: 'budget_desc'),
              FilterOption(label: 'Deadline', value: 'deadline'),
            ],
          ),
        ],
        initialValues: {'sort_by': _sortBy, 'type': _type},
        onApply: (values) {
          setState(() {
            _sortBy = (values['sort_by'] as String?) ?? 'newest';
            _type = values['type'] as String?;
            _page = 1;
            _jobs.clear();
          });
          _loadJobs();
        },
        onReset: () {
          setState(() {
            _sortBy = 'newest';
            _type = null;
            _page = 1;
            _jobs.clear();
          });
          _loadJobs();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final catsAsync = ref.watch(categoriesProvider);
    final params = JobQueryParams(
      categorySlug: _categorySlug,
      search: _searchController.text.isEmpty ? null : _searchController.text,
      type: _type,
      sortBy: _sortBy,
      page: _page,
    );
    final jobsAsync = ref.watch(jobsListProvider(params));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Jobs'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilters,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSizes.space16,
              vertical: AppSizes.space8,
            ),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search jobs...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _page = 1;
                          _jobs.clear();
                          _loadJobs();
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
                _jobs.clear();
                _loadJobs();
              },
            ),
          ),
          catsAsync.when(
            data: (cats) => CategoryChipsRow(
              categories: cats,
              selectedSlug: _categorySlug,
              onSelected: (slug) {
                setState(() {
                  _categorySlug = slug;
                  _page = 1;
                  _jobs.clear();
                });
                _loadJobs();
              },
            ),
            loading: () => const SizedBox(
              height: 44,
              child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
            ),
            error: (_, __) => const SizedBox.shrink(),
          ),
          const SizedBox(height: AppSizes.space8),
          Expanded(
            child: jobsAsync.when(
              data: (response) {
                if (_page == 1) _jobs.clear();
                for (final j in response.data) {
                  if (!_jobs.any((e) => e.id == j.id)) _jobs.add(j);
                }
                if (_jobs.isEmpty)
                  return Center(
                    child: Text(
                      'No jobs found',
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  );
                return ListView.builder(
                  itemCount: _jobs.length + (response.hasMore ? 1 : 0),
                  itemBuilder: (_, i) {
                    if (i >= _jobs.length) {
                      _page++;
                      _loadJobs();
                      return const Center(child: CircularProgressIndicator());
                    }
                    return JobCard(
                      job: _jobs[i],
                      onTap: () => context.push('/jobs/${_jobs[i].slug}'),
                    );
                  },
                );
              },
              loading: () => ListView.builder(
                itemCount: 4,
                itemBuilder: (_, __) => Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSizes.space16,
                    vertical: AppSizes.space4,
                  ),
                  child: GhShimmer.card(height: 180),
                ),
              ),
              error: (err, _) => Center(child: Text('Error: $err')),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/jobs/create'),
        icon: const Icon(Icons.add),
        label: const Text('Post Job'),
      ),
    );
  }
}
