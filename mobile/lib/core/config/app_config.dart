import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Environment configuration for the GigHub app.
///
/// Switch between development and production by changing [AppConfig.current].
class AppConfig {
  AppConfig._();

  static late final AppEnvironment _current;

  /// The active environment configuration.
  static AppEnvironment get current => _current;

  /// Initialize with the desired environment.
  static void init(AppEnvironment environment) {
    _current = environment;
  }

  /// Convenience getters
  static String get apiUrl => _current.apiUrl;
  static String get wsUrl => _current.wsUrl;
  static bool get isProduction => _current.isProduction;
  static String get environmentName => _current.name;
}

/// Represents a deployment environment.
class AppEnvironment {
  final String name;
  final String apiUrl;
  final String wsUrl;

  const AppEnvironment({
    required this.name,
    required this.apiUrl,
    required this.wsUrl,
  });

  bool get isProduction => name == 'production';

  factory AppEnvironment.fromEnv() {
    final envName = dotenv.env['ENV_NAME']?.trim();
    final apiUrl = dotenv.env['API_URL']?.trim();
    final wsUrl = dotenv.env['WS_URL']?.trim();

    if (envName == null || envName.isEmpty) {
      throw StateError('ENV_NAME is required in .env');
    }
    if (apiUrl == null || apiUrl.isEmpty) {
      throw StateError('API_URL is required in .env');
    }
    if (wsUrl == null || wsUrl.isEmpty) {
      throw StateError('WS_URL is required in .env');
    }

    return AppEnvironment(name: envName, apiUrl: apiUrl, wsUrl: wsUrl);
  }
}
