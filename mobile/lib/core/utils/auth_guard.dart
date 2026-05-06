import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/data/providers/auth_provider.dart';

/// Returns `true` if the user is authenticated.
/// If not, shows a warning dialog with option to sign in.
Future<bool> requireAuth(BuildContext context, WidgetRef ref) async {
  final authState = ref.read(authProvider);
  if (authState.isAuthenticated) return true;

  final result = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Sign In Required'),
      content: const Text(
        'You need to sign in to perform this action. '
        'Would you like to sign in now?',
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx, false),
          child: const Text('Cancel'),
        ),
        FilledButton.icon(
          onPressed: () => Navigator.pop(ctx, true),
          icon: const Icon(Icons.login, size: 18),
          label: const Text('Sign In'),
        ),
      ],
    ),
  );

  if (result == true && context.mounted) {
    context.go('/auth/login');
  }

  return false;
}
