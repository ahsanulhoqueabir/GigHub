import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gig_hub/app.dart';
import 'package:gig_hub/core/config/app_config.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize environment — switch to .production for release builds.
  AppConfig.init(AppEnvironment.development);

  runApp(
    const ProviderScope(
      child: GigHubApp(),
    ),
  );
}
