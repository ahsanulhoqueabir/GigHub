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

  /// Development environment pointing to local backend.
  static const development = AppEnvironment(
    name: 'development',
    apiUrl: 'http://10.0.2.2:3000/api', // Android emulator -> host
    wsUrl: 'ws://10.0.2.2:3000',
  );

  /// Production environment.
  static const production = AppEnvironment(
    name: 'production',
    apiUrl: 'https://api.gighub.app/api',
    wsUrl: 'wss://api.gighub.app',
  );
}
