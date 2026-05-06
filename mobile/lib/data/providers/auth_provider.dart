import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gighub/core/network/api_client.dart';
import 'package:gighub/core/network/auth_interceptor.dart';
import 'package:gighub/core/storage/secure_storage.dart';
import 'package:gighub/data/models/auth_model.dart';
import 'package:gighub/data/models/profile_model.dart';
import 'package:gighub/data/repositories/auth_repository.dart';
import 'package:gighub/data/repositories/profile_repository.dart';

/// Possible authentication states.
enum AuthStatus { loading, authenticated, unauthenticated }

/// Immutable auth state for the entire app.
class AuthState {
  final AuthStatus status;
  final Profile? profile;
  final String? error;

  const AuthState({required this.status, this.profile, this.error});

  const AuthState.loading()
    : status = AuthStatus.loading,
      profile = null,
      error = null;

  const AuthState.authenticated({required Profile profile})
    : status = AuthStatus.authenticated,
      profile = profile,
      error = null;

  const AuthState.unauthenticated({String? error})
    : status = AuthStatus.unauthenticated,
      profile = null,
      error = error;

  bool get isAuthenticated => status == AuthStatus.authenticated;
  bool get isLoading => status == AuthStatus.loading;

  AuthState copyWith({AuthStatus? status, Profile? profile, String? error}) {
    return AuthState(
      status: status ?? this.status,
      profile: profile ?? this.profile,
      error: error,
    );
  }
}

/// Notifier that manages authentication state and operations.
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;
  final SecureStorage _secureStorage;
  final AuthInterceptor _authInterceptor;
  final ProfileRepository _profileRepository;

  AuthNotifier(
    this._authRepository,
    this._secureStorage,
    this._authInterceptor,
    this._profileRepository,
  ) : super(const AuthState.loading()) {
    _authInterceptor.onSessionExpired = _handleSessionExpired;
  }

  Future<void> _handleSessionExpired() async {
    await _secureStorage.clearTokens();
    _authInterceptor.clearTokens();
    state = const AuthState.unauthenticated();
  }

  /// Check stored tokens on app start and restore session if valid.
  Future<void> initialize() async {
    state = const AuthState.loading();

    try {
      final tokens = await _secureStorage.loadTokens();
      final accessToken = tokens['accessToken'];
      final refreshTokenVal = tokens['refreshToken'];

      if (accessToken == null || refreshTokenVal == null) {
        state = const AuthState.unauthenticated();
        return;
      }

      _authInterceptor.updateTokens(
        accessToken: accessToken,
        refreshToken: refreshTokenVal,
      );

      final profile = await _profileRepository.getMyProfile();
      state = AuthState.authenticated(profile: profile);
    } catch (_) {
      await _secureStorage.clearTokens();
      _authInterceptor.clearTokens();
      state = const AuthState.unauthenticated();
    }
  }

  /// Login with email and password.
  Future<void> login(String email, String password) async {
    state = const AuthState.loading();

    try {
      final response = await _authRepository.loginWithPassword(email, password);
      await _secureStorage.saveTokens(
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      );
      _authInterceptor.updateTokens(
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      );
      final profile =
          response.profile ?? await _profileRepository.getMyProfile();
      state = AuthState.authenticated(profile: profile);
    } catch (e) {
      state = AuthState.unauthenticated(error: e.toString());
      rethrow;
    }
  }

  /// Login with a social provider (Google, GitHub, Microsoft, Apple).
  Future<void> loginWithProvider(
    String provider,
    String firebaseIdToken,
  ) async {
    state = const AuthState.loading();

    try {
      final response = await _authRepository.loginWithProvider(
        provider,
        firebaseIdToken,
      );
      await _secureStorage.saveTokens(
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      );
      _authInterceptor.updateTokens(
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      );
      final profile =
          response.profile ?? await _profileRepository.getMyProfile();
      state = AuthState.authenticated(profile: profile);
    } catch (e) {
      state = AuthState.unauthenticated(error: e.toString());
      rethrow;
    }
  }

  /// Register a new account.
  Future<void> register(RegisterInput input) async {
    state = const AuthState.loading();

    try {
      final response = await _authRepository.register(input);
      await _secureStorage.saveTokens(
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      );
      _authInterceptor.updateTokens(
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      );
      final profile =
          response.profile ?? await _profileRepository.getMyProfile();
      state = AuthState.authenticated(profile: profile);
    } catch (e) {
      state = AuthState.unauthenticated(error: e.toString());
      rethrow;
    }
  }

  /// Logout and clear all stored data.
  Future<void> logout() async {
    try {
      await _authRepository.logout();
    } catch (_) {
      // Proceed with local logout even if server call fails
    }
    await _secureStorage.clearTokens();
    _authInterceptor.clearTokens();
    state = const AuthState.unauthenticated();
  }

  /// Clear any error state.
  void clearError() {
    if (state.error != null) {
      state = state.copyWith(error: null);
    }
  }
}

// ── Providers ─────────────────────────────────────────

/// Shared auth interceptor (keeps tokens in sync and refreshes on 401).
final authInterceptorProvider = Provider<AuthInterceptor>((ref) {
  final secureStorage = ref.watch(secureStorageProvider);
  return AuthInterceptor(
    onTokensUpdated: (accessToken, refreshToken) => secureStorage.saveTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
    ),
  );
});

/// Raw [ApiClient] — created once and reused.
final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(authInterceptor: ref.watch(authInterceptorProvider));
});

/// [SecureStorage] instance provider.
final secureStorageProvider = Provider<SecureStorage>(
  (ref) => const SecureStorage(),
);

/// [AuthRepository] — depends on [ApiClient].
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(client: ref.watch(apiClientProvider));
});

/// Global [AuthNotifier] provider — the single source of truth for auth state.
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final profileRepository = ProfileRepository(
    client: ref.watch(apiClientProvider),
  );
  return AuthNotifier(
    ref.watch(authRepositoryProvider),
    ref.watch(secureStorageProvider),
    ref.watch(authInterceptorProvider),
    profileRepository,
  );
});
