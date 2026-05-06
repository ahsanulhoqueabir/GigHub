import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gighub/data/providers/auth_provider.dart';

/// Ensures auth initialization completes before rendering protected content.
class AuthGate extends ConsumerWidget {
  final Widget Function(BuildContext context, WidgetRef ref) builder;
  final bool requireAuth;
  final Widget Function(BuildContext context, WidgetRef ref)?
  unauthenticatedBuilder;
  final Widget Function(
    BuildContext context,
    WidgetRef ref,
    Object error,
    StackTrace? stackTrace,
  )?
  errorBuilder;
  final Widget? loading;

  const AuthGate({
    super.key,
    required this.builder,
    this.requireAuth = true,
    this.unauthenticatedBuilder,
    this.errorBuilder,
    this.loading,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final init = ref.watch(authInitProvider);

    return init.when(
      loading: () => loading ?? const _AuthGateLoading(),
      error: (error, stackTrace) {
        if (errorBuilder != null) {
          return errorBuilder!(context, ref, error, stackTrace);
        }
        return _AuthGateError(error: error.toString());
      },
      data: (_) {
        final authState = ref.watch(authProvider);
        if (requireAuth && !authState.isAuthenticated) {
          if (unauthenticatedBuilder != null) {
            return unauthenticatedBuilder!(context, ref);
          }
          return const _AuthGateUnauthenticated();
        }
        return builder(context, ref);
      },
    );
  }
}

class _AuthGateLoading extends StatelessWidget {
  const _AuthGateLoading();

  @override
  Widget build(BuildContext context) {
    return const Center(child: CircularProgressIndicator());
  }
}

class _AuthGateUnauthenticated extends StatelessWidget {
  const _AuthGateUnauthenticated();

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('Please sign in'));
  }
}

class _AuthGateError extends StatelessWidget {
  final String error;
  const _AuthGateError({required this.error});

  @override
  Widget build(BuildContext context) {
    return Center(child: Text('Auth init failed: $error'));
  }
}
