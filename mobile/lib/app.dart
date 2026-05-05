import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gig_hub/core/config/app_router.dart';
import 'package:gig_hub/core/storage/local_storage.dart';
import 'package:gig_hub/presentation/theme/app_theme_data.dart';

/// Root widget of the GigHub application.
///
/// Configures theme, routing, and global providers.
class GigHubApp extends ConsumerStatefulWidget {
  const GigHubApp({super.key});

  @override
  ConsumerState<GigHubApp> createState() => _GigHubAppState();
}

class _GigHubAppState extends ConsumerState<GigHubApp> {
  ThemeMode _themeMode = ThemeMode.system;
  final _localStorage = const LocalStorage();

  @override
  void initState() {
    super.initState();
    _loadThemeMode();
  }

  Future<void> _loadThemeMode() async {
    final saved = await _localStorage.getThemeMode();
    if (mounted) {
      setState(() {
        _themeMode = _themeModeFromString(saved);
      });
    }
  }

  ThemeMode _themeModeFromString(String? value) {
    switch (value) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      default:
        return ThemeMode.system;
    }
  }

  void _setThemeMode(ThemeMode mode) {
    setState(() => _themeMode = mode);
    _localStorage.setThemeMode(mode.name);
  }

  @override
  Widget build(BuildContext context) {
    final router = createRouter(ref);

    return MaterialApp.router(
      title: 'GigHub',
      debugShowCheckedModeBanner: false,
      theme: AppThemeData.light,
      darkTheme: AppThemeData.dark,
      themeMode: _themeMode,
      routerConfig: router,
    );
  }
}
