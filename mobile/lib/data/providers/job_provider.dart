import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gig_hub/data/models/job_model.dart';
import 'package:gig_hub/data/models/pagination_model.dart';
import 'package:gig_hub/data/repositories/job_repository.dart';

/// Repository provider.
final jobRepositoryProvider = Provider<JobRepository>((ref) => JobRepository());

/// Fetches paginated jobs list.
final jobsListProvider =
    FutureProvider.family<PaginatedResponse<Job>, JobQueryParams>((
      ref,
      params,
    ) async {
      final repo = ref.watch(jobRepositoryProvider);
      return repo.getJobs(params);
    });

/// Fetches a single job detail by slug.
final jobDetailProvider = FutureProvider.family<Job, String>((ref, slug) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.getJobBySlug(slug);
});

/// Fetches jobs posted by the current user.
final myJobsProvider = FutureProvider.family<PaginatedResponse<Job>, int>((
  ref,
  page,
) async {
  final repo = ref.watch(jobRepositoryProvider);
  return repo.getMyJobs(page: page);
});

/// Notifier for creating/updating jobs.
class JobFormNotifier extends StateNotifier<AsyncValue<void>> {
  final JobRepository _repo;

  JobFormNotifier(this._repo) : super(const AsyncValue.data(null));

  Future<void> createJob(CreateJobInput input) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await _repo.createJob(input);
    });
  }

  Future<void> updateJob(String id, UpdateJobInput input) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await _repo.updateJob(id, input);
    });
  }
}

final jobFormNotifierProvider =
    StateNotifierProvider<JobFormNotifier, AsyncValue<void>>(
      (ref) => JobFormNotifier(ref.watch(jobRepositoryProvider)),
    );
