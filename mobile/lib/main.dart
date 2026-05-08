import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:gighub/app.dart';
import 'package:gighub/core/config/app_config.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');

  // Initialize environment from .env for a single source of truth.
  AppConfig.init(AppEnvironment.fromEnv());

  runApp(const ProviderScope(child: GigHubApp()));
}
