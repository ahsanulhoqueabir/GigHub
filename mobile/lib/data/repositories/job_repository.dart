import 'package:gighub/data/models/job_model.dart';
import 'package:gighub/data/models/pagination_model.dart';
import 'package:gighub/data/services/mock_data_service.dart';

/// Mock job repository — reads from [MockDataService].
class JobRepository {
  final MockDataService _mock = MockDataService.instance;

  /// Fetch paginated jobs with optional filtering.
  Future<PaginatedResponse<Job>> getJobs(JobQueryParams params) async {
    await _delay();

    var jobs = List<Job>.from(_mock.jobs);

    // Filter by category
    if (params.categorySlug != null) {
      jobs = jobs.where((j) => j.category.slug == params.categorySlug).toList();
    }

    // Filter by search
    if (params.search != null && params.search!.isNotEmpty) {
      final q = params.search!.toLowerCase();
      jobs = jobs
          .where(
            (j) =>
                j.title.toLowerCase().contains(q) ||
                j.skillsRequired.any((s) => s.toLowerCase().contains(q)),
          )
          .toList();
    }

    // Filter by type
    if (params.type != null) {
      jobs = jobs.where((j) => j.type == params.type).toList();
    }

    // Filter by budget
    if (params.budgetMin != null) {
      jobs = jobs.where((j) => j.budgetMax >= params.budgetMin!).toList();
    }
    if (params.budgetMax != null) {
      jobs = jobs.where((j) => j.budgetMin <= params.budgetMax!).toList();
    }

    // Filter by experience level
    if (params.experienceLevel != null) {
      jobs = jobs
          .where((j) => j.experienceLevel == params.experienceLevel)
          .toList();
    }

    // Sort
    switch (params.sortBy) {
      case 'budget_asc':
        jobs.sort((a, b) => a.budgetMin.compareTo(b.budgetMin));
        break;
      case 'budget_desc':
        jobs.sort((a, b) => b.budgetMin.compareTo(a.budgetMin));
        break;
      case 'newest':
        jobs.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        break;
      case 'deadline':
        jobs.sort((a, b) {
          if (a.deadline == null) return 1;
          if (b.deadline == null) return -1;
          return a.deadline!.compareTo(b.deadline!);
        });
        break;
      default:
        break;
    }

    final total = jobs.length;
    final totalPages = (total / params.limit).ceil();
    final start = (params.page - 1) * params.limit;
    final pageItems = jobs.skip(start).take(params.limit).toList();

    return PaginatedResponse(
      data: pageItems,
      meta: PaginationMeta(
        page: params.page,
        limit: params.limit,
        total: total,
        totalPages: totalPages,
      ),
    );
  }

  /// Fetch a single job by slug.
  Future<Job> getJobBySlug(String slug) async {
    await _delay();
    return _mock.jobs.firstWhere(
      (j) => j.slug == slug,
      orElse: () => throw Exception('Job not found'),
    );
  }

  /// Fetch jobs posted by the current user (hardcoded to u_1).
  Future<PaginatedResponse<Job>> getMyJobs({int page = 1}) async {
    await _delay();
    final myJobs = _mock.jobs.where((j) => j.client.id == 'u_1').toList();
    return PaginatedResponse(
      data: myJobs,
      meta: PaginationMeta(
        page: page,
        limit: 20,
        total: myJobs.length,
        totalPages: 1,
      ),
    );
  }

  /// Create a job (mock).
  Future<Job> createJob(CreateJobInput input) async {
    await _delay(600);
    return Job(
      id: 'job_${_mock.jobs.length + 1}',
      title: input.title,
      slug: input.title.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-'),
      description: input.description,
      category: _mock.categories.firstWhere((c) => c.id == input.categoryId),
      client: _mock.profiles.firstWhere((p) => p.id == 'u_1'),
      type: input.type,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      deadline: input.deadline,
      skillsRequired: input.skillsRequired,
      experienceLevel: input.experienceLevel,
      status: 'open',
      totalProposals: 0,
      createdAt: DateTime.now(),
    );
  }

  Future<Job> updateJob(String id, UpdateJobInput input) async {
    await _delay(400);
    final idx = _mock.jobs.indexWhere((j) => j.id == id);
    if (idx == -1) throw Exception('Job not found');
    return _mock.jobs[idx];
  }

  Future<void> deleteJob(String id) async {
    await _delay(300);
  }

  Future<void> closeJob(String id) async {
    await _delay(300);
  }

  Future<void> _delay([int ms = 300]) async {
    await Future.delayed(Duration(milliseconds: ms));
  }
}
