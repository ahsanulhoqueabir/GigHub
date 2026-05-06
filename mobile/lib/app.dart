import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/config/app_router.dart';
import 'package:gighub/data/providers/auth_provider.dart';
import 'package:gighub/data/providers/theme_provider.dart';
import 'package:gighub/presentation/theme/app_theme_data.dart';

/// Root widget of the GigHub application.
///
/// Configures theme, routing, and global providers.
class GigHubApp extends ConsumerStatefulWidget {
  const GigHubApp({super.key});

  @override
  ConsumerState<GigHubApp> createState() => _GigHubAppState();
}

class _GigHubAppState extends ConsumerState<GigHubApp> {
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _router = createRouter(ref);
  }

  @override
  Widget build(BuildContext context) {
    final themeMode = ref.watch(themeModeProvider);

    ref.listen<AuthState>(authProvider, (_, __) {
      _router.refresh();
    });

    return MaterialApp.router(
      title: 'GigHub',
      debugShowCheckedModeBanner: false,
      theme: AppThemeData.light,
      darkTheme: AppThemeData.dark,
      themeMode: themeMode,
      routerConfig: _router,
    );
  }
}
