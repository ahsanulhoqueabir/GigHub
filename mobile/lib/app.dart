import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gig_hub/presentation/theme/app_theme_data.dart';

/// Root widget of the GigHub application.
///
/// Configures theme, routing, and global providers.
class GigHubApp extends ConsumerWidget {
  const GigHubApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // TODO: Replace with GoRouter + ProviderScope for auth state
    return MaterialApp(
      title: 'GigHub',
      debugShowCheckedModeBanner: false,
      theme: AppThemeData.light,
      darkTheme: AppThemeData.dark,
      themeMode: ThemeMode.system,
      home: const _PlaceholderHome(),
    );
  }
}

/// Temporary placeholder until routing is wired up in Phase 1.6+.
class _PlaceholderHome extends StatelessWidget {
  const _PlaceholderHome();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('GigHub')),
      body: const Center(child: Text('🎉 GigHub Flutter app initialized!')),
    );
  }
}
