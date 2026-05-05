import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gig_hub/data/providers/auth_provider.dart';
import 'package:gig_hub/presentation/screens/auth/forgot_password_screen.dart';
import 'package:gig_hub/presentation/screens/auth/login_screen.dart';
import 'package:gig_hub/presentation/screens/auth/register_screen.dart';
import 'package:gig_hub/presentation/screens/dashboard/dashboard_screen.dart';
import 'package:gig_hub/presentation/screens/home/home_screen.dart';
import 'package:gig_hub/presentation/screens/profile/edit_profile_screen.dart';
import 'package:gig_hub/presentation/screens/profile/my_profile_screen.dart';
import 'package:gig_hub/presentation/screens/profile/public_profile_screen.dart';
import 'package:gig_hub/presentation/screens/profile/settings_screen.dart';
import 'package:gig_hub/presentation/screens/splash/splash_screen.dart';

/// Global navigator key for accessing the router from anywhere.
final rootNavigatorKey = GlobalKey<NavigatorState>();
final shellNavigatorKey = GlobalKey<NavigatorState>();

/// Creates the [GoRouter] with auth-aware redirect.
///
/// Redirects unauthenticated users to `/auth/login` and authenticated users
/// away from auth screens to `/home`.
GoRouter createRouter(WidgetRef ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/splash',
    refreshListenable: _AuthStateListenable(ref),
    redirect: (context, state) {
      final isAuth = authState.isAuthenticated;
      final location = state.matchedLocation;

      // Allow splash to always show
      if (location == '/splash') return null;

      // Auth routes — redirect to home if already authenticated
      final isAuthRoute = location.startsWith('/auth');

      if (!isAuth && !isAuthRoute && !isAuth) return '/auth/login';
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
            builder: (_, __) => const _PlaceholderScreen(title: 'Gigs'),
          ),
          GoRoute(
            path: '/jobs',
            name: 'jobs',
            builder: (_, __) => const _PlaceholderScreen(title: 'Jobs'),
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

/// A [Listenable] that notifies GoRouter when auth state changes.
class _AuthStateListenable extends ChangeNotifier {
  final WidgetRef _ref;

  _AuthStateListenable(this._ref) {
    _ref.listen(authProvider, (_, __) => notifyListeners());
  }
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
