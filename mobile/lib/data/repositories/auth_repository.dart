import 'package:gighub/core/constants/api_constants.dart';
import 'package:gighub/core/network/api_client.dart';
import 'package:gighub/data/models/auth_model.dart';
import 'package:gighub/data/models/profile_model.dart';

/// Repository for authentication operations.
///
/// Handles login, register, token refresh, logout, and password reset.
/// Supports mock login with dummy credentials for development/demo.
class AuthRepository {
  final ApiClient _client;

  /// Dummy credentials for mock login during development.
  static const String mockEmail = 'demo@gighub.com';
  static const String mockPassword = 'demo1234';

  const AuthRepository({required ApiClient client}) : _client = client;

  /// Register a new account with email/password.
  Future<AuthResponse> register(RegisterInput input) async {
    final response = await _client.post<Map<String, dynamic>>(
      ApiConstants.register,
      data: input.toJson(),
    );
    return AuthResponse.fromJson(response.data!);
  }

  /// Login with email/password (provider = 'password').
  /// Falls back to mock login for demo credentials.
  Future<AuthResponse> loginWithPassword(String email, String password) async {
    // Mock login for demo credentials
    if (email == mockEmail && password == mockPassword) {
      await Future.delayed(const Duration(milliseconds: 800));
      return _mockAuthResponse();
    }

    try {
      final input = PasswordLoginInput(email: email, password: password);
      final response = await _client.post<Map<String, dynamic>>(
        ApiConstants.login,
        data: input.toJson(),
      );
      return AuthResponse.fromJson(response.data!);
    } catch (e) {
      // If API is unavailable, provide a helpful mock error
      throw Exception(
        'Login failed. Use demo@gighub.com / demo1234 for mock login.',
      );
    }
  }

  /// Login with a social provider (Google, GitHub, Microsoft, Apple).
  Future<AuthResponse> loginWithProvider(
    String provider,
    String firebaseIdToken,
  ) async {
    final input = ProviderLoginInput(
      provider: provider,
      firebaseIdToken: firebaseIdToken,
    );
    final response = await _client.post<Map<String, dynamic>>(
      ApiConstants.login,
      data: input.toJson(),
    );
    return AuthResponse.fromJson(response.data!);
  }

  /// Refresh the access token using a refresh token.
  Future<TokenPair> refreshToken(String refreshToken) async {
    final response = await _client.post<Map<String, dynamic>>(
      ApiConstants.refreshToken,
      data: {'refreshToken': refreshToken},
    );
    return TokenPair.fromJson(response.data!);
  }

  /// Logout — invalidate the current session on the server.
  Future<void> logout() async {
    await _client.post(ApiConstants.logout);
  }

  /// Request a password reset link for the given email.
  Future<void> forgotPassword(String email) async {
    final input = ForgotPasswordInput(email: email);
    await _client.post(ApiConstants.forgotPassword, data: input.toJson());
  }

  /// Build a mock auth response for demo login.
  AuthResponse _mockAuthResponse() {
    return AuthResponse(
      accessToken: 'mock_access_token_${DateTime.now().millisecondsSinceEpoch}',
      refreshToken:
          'mock_refresh_token_${DateTime.now().millisecondsSinceEpoch}',
      expiresIn: 3600,
      profile: Profile(
        id: 'u_1',
        displayName: 'Ahsanul Hoque',
        username: 'ahsanul',
        email: mockEmail,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahsanul',
        bio: 'Full-stack developer & designer with 7+ years of experience',
        skills: ['Flutter', 'React', 'Node.js', 'UI/UX Design'],
        avgRating: 4.9,
        totalReviews: 120,
        role: 'seller',
        createdAt: DateTime(2020, 1, 15),
      ),
    );
  }
}
