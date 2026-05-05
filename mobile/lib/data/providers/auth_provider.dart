import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gighub/core/network/api_client.dart';
import 'package:gighub/core/storage/secure_storage.dart';
import 'package:gighub/data/models/auth_model.dart';
import 'package:gighub/data/models/profile_model.dart';
import 'package:gighub/data/repositories/auth_repository.dart';

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

  AuthNotifier(this._authRepository, this._secureStorage)
    : super(const AuthState.loading());

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

      // Check if this is a mock session (starts with 'mock_')
      if (accessToken.startsWith('mock_')) {
        // Restore mock session — create a mock profile
        state = AuthState.authenticated(
          profile: Profile(
            id: 'u_1',
            displayName: 'Ahsanul Hoque',
            username: 'ahsanul',
            email: 'demo@gighub.com',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahsanul',
            bio: 'Full-stack developer & designer with 7+ years of experience',
            skills: ['Flutter', 'React', 'Node.js', 'UI/UX Design'],
            avgRating: 4.9,
            totalReviews: 120,
            role: 'seller',
            createdAt: DateTime(2020, 1, 15),
          ),
        );
        return;
      }

      // Try to refresh the token to validate the session
      final pair = await _authRepository.refreshToken(refreshTokenVal);
      await _secureStorage.saveTokens(
        accessToken: pair.accessToken,
        refreshToken: pair.refreshToken,
      );

      // We need the profile — a simple token validation isn't enough
      // The profile will be loaded via ProfileNotifier after auth is confirmed.
      // For now mark as authenticated with a temporary profile.
      // In a real flow, the auth response includes the profile.
      // We'll get the profile via ProfileNotifier separately.
      state = const AuthState.unauthenticated(
        error: 'Session expired — please login again',
      );
    } catch (_) {
      await _secureStorage.clearTokens();
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
      state = AuthState.authenticated(profile: response.profile);
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
      state = AuthState.authenticated(profile: response.profile);
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
      state = AuthState.authenticated(profile: response.profile);
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

/// Raw [ApiClient] — created once and reused.
final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

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
  return AuthNotifier(
    ref.watch(authRepositoryProvider),
    ref.watch(secureStorageProvider),
  );
});
