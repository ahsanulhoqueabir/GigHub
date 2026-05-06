import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/data/models/gig_model.dart';
import 'package:gighub/data/models/job_model.dart';
import 'package:gighub/data/providers/gig_provider.dart';
import 'package:gighub/data/providers/job_provider.dart';
import 'package:gighub/presentation/widgets/gigs/gig_card.dart';
import 'package:gighub/presentation/widgets/jobs/job_card.dart';

/// Global search screen across gigs and jobs.
class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen>
    with SingleTickerProviderStateMixin {
  final _searchController = TextEditingController();
  late TabController _tabController;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _tabController.dispose();
    super.dispose();
  }

  void _search(String q) => setState(() => _query = q.trim());

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final gigParams = GigQueryParams(search: _query.isEmpty ? null : _query);
    final jobParams = JobQueryParams(search: _query.isEmpty ? null : _query);
    final gigsAsync = ref.watch(gigsListProvider(gigParams));
    final jobsAsync = ref.watch(jobsListProvider(jobParams));

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          autofocus: true,
          decoration: InputDecoration(
            hintText: 'Search gigs & jobs...',
            border: InputBorder.none,
            suffixIcon: _searchController.text.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear),
                    onPressed: () {
                      _searchController.clear();
                      _search('');
                    },
                  )
                : null,
          ),
          onSubmitted: _search,
        ),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Gigs'),
            Tab(text: 'Jobs'),
          ],
          labelColor: theme.colorScheme.primary,
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Gigs tab
          gigsAsync.when(
            data: (response) {
              if (response.data.isEmpty) {
                return Center(
                  child: Text(
                    _query.isEmpty
                        ? 'Start typing to search...'
                        : 'No gigs found',
                    style: theme.textTheme.bodyLarge,
                  ),
                );
              }
              return GridView.builder(
                padding: const EdgeInsets.all(AppSizes.space8),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.72,
                  crossAxisSpacing: AppSizes.space8,
                  mainAxisSpacing: AppSizes.space8,
                ),
                itemCount: response.data.length,
                itemBuilder: (_, i) => GigCard(
                  gig: response.data[i],
                  onTap: () => context.push('/gigs/${response.data[i].slug}'),
                ),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => Center(child: Text('Error: $err')),
          ),
          // Jobs tab
          jobsAsync.when(
            data: (response) {
              if (response.data.isEmpty) {
                return Center(
                  child: Text(
                    _query.isEmpty
                        ? 'Start typing to search...'
                        : 'No jobs found',
                    style: theme.textTheme.bodyLarge,
                  ),
                );
              }
              return ListView.builder(
                itemCount: response.data.length,
                itemBuilder: (_, i) => JobCard(
                  job: response.data[i],
                  onTap: () => context.push('/jobs/${response.data[i].slug}'),
                ),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => Center(child: Text('Error: $err')),
          ),
        ],
      ),
    );
  }
}
