import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gig_hub/data/providers/auth_provider.dart';

/// Shell widget that wraps all main-app routes with a BottomNavigationBar.
class HomeScreen extends ConsumerWidget {
  final Widget child;

  const HomeScreen({super.key, required this.child});

  int _currentIndex(BuildContext context, {required bool isAuth}) {
    final location = GoRouterState.of(context).matchedLocation;
    switch (location) {
      case '/home':
        return 0;
      case '/gigs':
        return 1;
      case '/jobs':
        return 2;
      case '/chat':
        return 3;
      case '/profile':
        return isAuth ? 4 : 0;
      default:
        return 0;
    }
  }

  void _onTabTap(BuildContext context, int index, {required bool isAuth}) {
    switch (index) {
      case 0:
        context.go('/home');
        break;
      case 1:
        context.go('/gigs');
        break;
      case 2:
        context.go('/jobs');
        break;
      case 3:
        context.go('/chat');
        break;
      case 4:
        if (isAuth) {
          context.go('/profile');
        } else {
          context.go('/auth/login');
        }
        break;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isAuth = ref.watch(authProvider).isAuthenticated;
    final currentIndex = _currentIndex(context, isAuth: isAuth);
    final profileItem = isAuth
        ? const BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          )
        : const BottomNavigationBarItem(
            icon: Icon(Icons.login),
            activeIcon: Icon(Icons.login),
            label: 'Sign In',
          );

    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: (index) => _onTabTap(context, index, isAuth: isAuth),
        items: [
          BottomNavigationBarItem(
            icon: Badge(
              isLabelVisible: false,
              child: const Icon(Icons.home_outlined),
            ),
            activeIcon: Badge(
              isLabelVisible: false,
              child: const Icon(Icons.home),
            ),
            label: 'Home',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.work_outline),
            activeIcon: Icon(Icons.work),
            label: 'Gigs',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.assignment_outlined),
            activeIcon: Icon(Icons.assignment),
            label: 'Jobs',
          ),
          BottomNavigationBarItem(
            icon: Badge(
              isLabelVisible: false,
              child: const Icon(Icons.chat_outlined),
            ),
            activeIcon: Badge(
              isLabelVisible: false,
              child: const Icon(Icons.chat),
            ),
            label: 'Chat',
          ),
          profileItem,
        ],
      ),
    );
  }
}
