import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:gighub/data/models/category_model.dart';
import 'package:gighub/data/models/gig_model.dart';
import 'package:gighub/data/models/job_model.dart';
import 'package:gighub/data/models/notification_model.dart';
import 'package:gighub/data/models/profile_model.dart';
import 'package:gighub/data/models/proposal_model.dart';

/// Mock data service backed by a JSON asset.
///
/// All mock data lives in docs/mock_data.json and is parsed at runtime.
class MockDataService {
  MockDataService._();

  static final MockDataService _instance = MockDataService._();
  static MockDataService get instance => _instance;

  bool _loaded = false;

  late List<PublicProfile> profiles;
  late List<Category> categories;
  late List<GigDetail> gigs;
  late List<Job> jobs;
  late List<Proposal> proposals;
  late List<AppNotification> notifications;

  final Map<String, List<String>> _relatedGigSlugs = {};

  /// Load and parse mock data from JSON once.
  Future<void> ensureLoaded() async {
    if (_loaded) return;

    final raw = await rootBundle.loadString('docs/mock_data.json');
    final data = jsonDecode(raw) as Map<String, dynamic>;

    categories = _parseCategories(data['categories']);
    profiles = _parseProfiles(data['profiles']);

    final categoryById = {for (final c in categories) c.id: c};
    final profileById = {for (final p in profiles) p.id: p};

    gigs = _parseGigs(data['gigs'], categoryById, profileById);
    jobs = _parseJobs(data['jobs'], categoryById, profileById);
    proposals = _parseProposals(data['proposals'], profileById);
    notifications = _parseNotifications(data['notifications']);

    _loaded = true;
  }

  List<String> relatedGigSlugs(String slug) {
    return List<String>.unmodifiable(_relatedGigSlugs[slug] ?? const []);
  }

  List<Category> _parseCategories(dynamic raw) {
    final list = raw is List ? raw : const [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(
          (c) => Category(
            id: c['id'] as String,
            name: c['name'] as String,
            slug: c['slug'] as String,
            icon: c['icon'] as String?,
            description: c['description'] as String?,
            gigCount: _toInt(c['gigCount']),
          ),
        )
        .toList();
  }

  List<PublicProfile> _parseProfiles(dynamic raw) {
    final list = raw is List ? raw : const [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(
          (p) => PublicProfile(
            id: p['id'] as String,
            displayName: p['displayName'] as String,
            username: p['username'] as String,
            avatar: p['avatar'] as String?,
            bio: p['bio'] as String?,
            skills: _stringList(p['skills']),
            avgRating: _toDouble(p['avgRating'] ?? p['rating']),
            totalReviews: _toInt(p['totalReviews']),
            completedOrders: _toInt(p['completedOrders']),
            memberSince: DateTime.parse(p['memberSince'] as String),
          ),
        )
        .toList();
  }

  List<GigDetail> _parseGigs(
    dynamic raw,
    Map<String, Category> categories,
    Map<String, PublicProfile> profiles,
  ) {
    final list = raw is List ? raw : const [];
    final result = <GigDetail>[];

    for (final item in list.whereType<Map<String, dynamic>>()) {
      final categoryId = item['categoryId'] as String;
      final sellerId = item['sellerId'] as String;
      final slug = item['slug'] as String;

      final packages = _parsePackages(item['packages']);
      final related = _stringList(item['relatedGigSlugs']);
      _relatedGigSlugs[slug] = related;

      result.add(
        GigDetail(
          id: item['id'] as String,
          title: item['title'] as String,
          slug: slug,
          category: categories[categoryId]!,
          seller: profiles[sellerId]!,
          thumbnail: item['thumbnail'] as String?,
          images: _stringList(item['images']),
          description: item['description'] as String,
          startingPrice: _toDouble(item['startingPrice']),
          avgRating: _toDouble(item['avgRating']),
          totalReviews: _toInt(item['totalReviews']),
          totalOrders: _toInt(item['totalOrders']),
          status: item['status'] as String,
          tags: _stringList(item['tags']),
          packages: packages,
          deliveryDaysMin: _toInt(item['deliveryDaysMin']),
        ),
      );
    }

    return result;
  }

  List<Job> _parseJobs(
    dynamic raw,
    Map<String, Category> categories,
    Map<String, PublicProfile> profiles,
  ) {
    final list = raw is List ? raw : const [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(
          (j) => Job(
            id: j['id'] as String,
            title: j['title'] as String,
            slug: j['slug'] as String,
            description: j['description'] as String,
            category: categories[j['categoryId'] as String]!,
            client: profiles[j['clientId'] as String]!,
            type: j['type'] as String,
            budgetMin: _toDouble(j['budgetMin']),
            budgetMax: _toDouble(j['budgetMax']),
            deadline: j['deadline'] as String?,
            skillsRequired: _stringList(j['skillsRequired']),
            experienceLevel: j['experienceLevel'] as String,
            status: j['status'] as String,
            totalProposals: _toInt(j['totalProposals']),
            createdAt: DateTime.parse(j['createdAt'] as String),
          ),
        )
        .toList();
  }

  List<Proposal> _parseProposals(
    dynamic raw,
    Map<String, PublicProfile> profiles,
  ) {
    final list = raw is List ? raw : const [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(
          (p) => Proposal(
            id: p['id'] as String,
            jobId: p['jobId'] as String,
            freelancer: profiles[p['freelancerId'] as String]!,
            coverLetter: p['coverLetter'] as String,
            proposedPrice: _toDouble(p['proposedPrice']),
            estimatedDays: _toInt(p['estimatedDays']),
            status: p['status'] as String,
            createdAt: DateTime.parse(p['createdAt'] as String),
          ),
        )
        .toList();
  }

  List<GigPackage> _parsePackages(dynamic raw) {
    final list = raw is List ? raw : const [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(
          (p) => GigPackage(
            id: p['id'] as String,
            tier: p['tier'] as String,
            title: p['title'] as String,
            description: p['description'] as String,
            price: _toDouble(p['price']),
            deliveryDays: _toInt(p['deliveryDays']),
            revisions: _toInt(p['revisions']),
            features: _stringList(p['features']),
          ),
        )
        .toList();
  }

  List<AppNotification> _parseNotifications(dynamic raw) {
    final list = raw is List ? raw : const [];
    return list
        .whereType<Map<String, dynamic>>()
        .map((n) => AppNotification.fromJson(n))
        .toList();
  }

  List<String> _stringList(dynamic raw) {
    final list = raw is List ? raw : const [];
    return list.map((e) => e.toString()).toList();
  }

  double _toDouble(dynamic raw) => (raw as num?)?.toDouble() ?? 0.0;

  int _toInt(dynamic raw) => (raw as num?)?.toInt() ?? 0;
}
