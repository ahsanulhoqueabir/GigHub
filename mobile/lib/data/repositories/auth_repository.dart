import 'package:gighub/core/constants/api_constants.dart';
import 'package:gighub/core/network/api_client.dart';
import 'package:gighub/data/models/auth_model.dart';

/// Repository for authentication operations.
///
/// Handles login, register, token refresh, logout, and password reset.
class AuthRepository {
  final ApiClient _client;

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
  Future<AuthResponse> loginWithPassword(String email, String password) async {
    final input = PasswordLoginInput(email: email, password: password);
    final response = await _client.post<Map<String, dynamic>>(
      ApiConstants.login,
      data: input.toJson(),
    );
    return AuthResponse.fromJson(response.data!);
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
}
