import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Thin wrapper around flutter_secure_storage for JWT tokens.
///
/// Stores access token, refresh token, and other sensitive data
/// in platform-encrypted storage (Keychain on iOS, EncryptedSharedPreferences on Android).
class SecureStorage {
  const SecureStorage();

  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';

  final _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  // ── Access Token ───────────────────────────────────

  Future<String?> get accessToken => _storage.read(key: _accessTokenKey);

  Future<void> setAccessToken(String token) =>
      _storage.write(key: _accessTokenKey, value: token);

  // ── Refresh Token ──────────────────────────────────

  Future<String?> get refreshToken => _storage.read(key: _refreshTokenKey);

  Future<void> setRefreshToken(String token) =>
      _storage.write(key: _refreshTokenKey, value: token);

  // ── Save / Load Both ───────────────────────────────

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      setAccessToken(accessToken),
      setRefreshToken(refreshToken),
    ]);
  }

  Future<Map<String, String?>> loadTokens() async {
    final results = await Future.wait([accessToken, refreshToken]);
    return {'accessToken': results[0], 'refreshToken': results[1]};
  }

  // ── Clear ──────────────────────────────────────────

  Future<void> clearTokens() async {
    await Future.wait([
      _storage.delete(key: _accessTokenKey),
      _storage.delete(key: _refreshTokenKey),
    ]);
  }

  // ── Generic Methods ────────────────────────────────

  Future<void> write({required String key, required String value}) =>
      _storage.write(key: key, value: value);

  Future<String?> read({required String key}) => _storage.read(key: key);

  Future<void> delete({required String key}) => _storage.delete(key: key);

  Future<void> deleteAll() => _storage.deleteAll();
}
