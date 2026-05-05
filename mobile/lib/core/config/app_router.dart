import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/data/providers/auth_provider.dart';
import 'package:gighub/presentation/screens/auth/forgot_password_screen.dart';
import 'package:gighub/presentation/screens/auth/login_screen.dart';
import 'package:gighub/presentation/screens/auth/register_screen.dart';
import 'package:gighub/presentation/screens/dashboard/dashboard_screen.dart';
import 'package:gighub/presentation/screens/gigs/browse_gigs_screen.dart';
import 'package:gighub/presentation/screens/gigs/create_gig_screen.dart';
import 'package:gighub/presentation/screens/gigs/edit_gig_screen.dart';
import 'package:gighub/presentation/screens/gigs/gig_detail_screen.dart';
import 'package:gighub/presentation/screens/gigs/my_gigs_screen.dart';
import 'package:gighub/presentation/screens/home/home_screen.dart';
import 'package:gighub/presentation/screens/jobs/browse_jobs_screen.dart';
import 'package:gighub/presentation/screens/jobs/create_job_screen.dart';
import 'package:gighub/presentation/screens/jobs/job_detail_screen.dart';
import 'package:gighub/presentation/screens/jobs/job_proposals_screen.dart';
import 'package:gighub/presentation/screens/jobs/my_jobs_screen.dart';
import 'package:gighub/presentation/screens/profile/edit_profile_screen.dart';
import 'package:gighub/presentation/screens/profile/my_profile_screen.dart';
import 'package:gighub/presentation/screens/profile/public_profile_screen.dart';
import 'package:gighub/presentation/screens/profile/settings_screen.dart';
import 'package:gighub/presentation/screens/proposals/my_proposals_screen.dart';
import 'package:gighub/presentation/screens/search/search_screen.dart';
import 'package:gighub/presentation/screens/splash/splash_screen.dart';

/// Global navigator key for accessing the router from anywhere.
final rootNavigatorKey = GlobalKey<NavigatorState>();
final shellNavigatorKey = GlobalKey<NavigatorState>();

/// Creates the [GoRouter] with auth-aware redirect.
///
/// Allows unauthenticated access to the app and redirects authenticated users
/// away from auth screens to `/home`.
GoRouter createRouter(WidgetRef ref) {
  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/splash',
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final isAuth = authState.isAuthenticated;
      final location = state.matchedLocation;

      // Allow splash to always show
      if (location == '/splash') return null;

      // Auth routes — redirect to home if already authenticated
      final isAuthRoute = location.startsWith('/auth');
      if (isAuth && isAuthRoute) return '/home';

      return null;
    },
    routes: [
      // ── Splash ───────────────────────────────────
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (_, __) => const SplashScreen(),
      ),

      // ── Auth Routes (no bottom nav) ──────────────
      GoRoute(
        path: '/auth/login',
        name: 'login',
        builder: (_, __) => const LoginScreen(),
      ),
      GoRoute(
        path: '/auth/register',
        name: 'register',
        builder: (_, __) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/auth/forgot-password',
        name: 'forgotPassword',
        builder: (_, __) => const ForgotPasswordScreen(),
      ),

      // ── Main App (with bottom nav shell) ──────────
      ShellRoute(
        navigatorKey: shellNavigatorKey,
        builder: (_, __, child) => HomeScreen(child: child),
        routes: [
          GoRoute(
            path: '/home',
            name: 'home',
            builder: (_, __) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/profile',
            name: 'profile',
            builder: (_, __) => const MyProfileScreen(),
          ),
          // ── Placeholder routes for future phases ──
          GoRoute(
            path: '/gigs',
            name: 'gigs',
            builder: (_, __) => const BrowseGigsScreen(),
          ),
          GoRoute(
            path: '/jobs',
            name: 'jobs',
            builder: (_, __) => const BrowseJobsScreen(),
          ),
          GoRoute(
            path: '/orders',
            name: 'orders',
            builder: (_, __) => const _PlaceholderScreen(title: 'Orders'),
          ),
          GoRoute(
            path: '/chat',
            name: 'chat',
            builder: (_, __) => const _PlaceholderScreen(title: 'Chat'),
          ),
        ],
      ),

      // ── Full-screen routes (no bottom nav) ───────
      GoRoute(
        path: '/gigs/create',
        name: 'createGig',
        builder: (_, __) => const CreateGigScreen(),
      ),
      GoRoute(
        path: '/gigs/:slug',
        name: 'gigDetail',
        builder: (_, state) =>
            GigDetailScreen(slug: state.pathParameters['slug']!),
      ),
      GoRoute(
        path: '/gigs/:id/edit',
        name: 'editGig',
        builder: (_, state) =>
            EditGigScreen(gigId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/gigs/me',
        name: 'myGigs',
        builder: (_, __) => const MyGigsScreen(),
      ),
      GoRoute(
        path: '/jobs/create',
        name: 'createJob',
        builder: (_, __) => const CreateJobScreen(),
      ),
      GoRoute(
        path: '/jobs/:slug',
        name: 'jobDetail',
        builder: (_, state) =>
            JobDetailScreen(slug: state.pathParameters['slug']!),
      ),
      GoRoute(
        path: '/jobs/:id/proposals',
        name: 'jobProposals',
        builder: (_, state) =>
            JobProposalsScreen(jobId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/jobs/me',
        name: 'myJobs',
        builder: (_, __) => const MyJobsScreen(),
      ),
      GoRoute(
        path: '/proposals/me',
        name: 'myProposals',
        builder: (_, __) => const MyProposalsScreen(),
      ),
      GoRoute(
        path: '/search',
        name: 'search',
        builder: (_, __) => const SearchScreen(),
      ),
      GoRoute(
        path: '/profile/edit',
        name: 'editProfile',
        builder: (_, __) => const EditProfileScreen(),
      ),
      GoRoute(
        path: '/profile/settings',
        name: 'settings',
        builder: (_, __) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/u/:username',
        name: 'publicProfile',
        builder: (_, state) =>
            PublicProfileScreen(username: state.pathParameters['username']!),
      ),
    ],
  );
}

/// Temporary placeholder screen for routes not yet built.
class _PlaceholderScreen extends StatelessWidget {
  final String title;
  const _PlaceholderScreen({required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Text(
          '$title — Coming Soon',
          style: Theme.of(context).textTheme.titleMedium,
        ),
      ),
    );
  }
}
