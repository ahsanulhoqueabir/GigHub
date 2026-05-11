import 'dart:async';

import 'package:dio/dio.dart';
import 'package:gighub/core/config/app_config.dart';
import 'package:gighub/core/constants/api_constants.dart';
import 'package:gighub/core/network/api_exceptions.dart';

/// Interceptor that attaches the JWT access token to outgoing requests
/// and handles automatic token refresh on 401 responses.
///
/// During a refresh, concurrent requests are queued and retried once
/// the new token is obtained.
class AuthInterceptor extends Interceptor {
  AuthInterceptor({this.onTokensUpdated, this.onSessionExpired});

  String? _accessToken;
  String? _refreshToken;

  bool _isRefreshing = false;
  final List<Completer<void>> _pendingRequests = [];

  /// Callback invoked when the refresh token is expired / invalid.
  /// Typically this navigates to the login screen.
  Future<void> Function(String accessToken, String refreshToken)?
  onTokensUpdated;
  Future<void> Function()? onSessionExpired;

  /// Update stored tokens (called after login or refresh).
  void updateTokens({
    required String accessToken,
    required String refreshToken,
  }) {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
  }

  /// Clear stored tokens (called on logout).
  void clearTokens() {
    _accessToken = null;
    _refreshToken = null;
  }

  /// Whether we have a stored access token.
  bool get hasToken => _accessToken != null;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    optionsForCurrentRequest = options;
    if (_accessToken != null) {
      options.headers['Authorization'] = 'Bearer $_accessToken';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode != 401) {
      return handler.next(err);
    }

    // Do not attempt refresh for the refresh endpoint itself
    if (err.requestOptions.path.contains(ApiConstants.refreshToken)) {
      clearTokens();
      await onSessionExpired?.call();
      return handler.next(err);
    }

    try {
      // If already refreshing, queue this request
      if (_isRefreshing) {
        final completer = Completer<void>();
        _pendingRequests.add(completer);
        await completer.future;

        // Retry the original request with new token
        final options = err.requestOptions;
        options.headers['Authorization'] = 'Bearer $_accessToken';
        final response = await _retryRequest(options);
        return handler.resolve(response);
      }

      _isRefreshing = true;

      // Attempt token refresh
      final newTokens = await _performTokenRefresh();

      _accessToken = newTokens['accessToken'];
      _refreshToken = newTokens['refreshToken'];

      // Retry the original request
      final options = err.requestOptions;
      options.headers['Authorization'] = 'Bearer $_accessToken';
      final response = await _retryRequest(options);

      // Notify all queued requests
      for (final completer in _pendingRequests) {
        completer.complete();
      }
      _pendingRequests.clear();

      handler.resolve(response);
    } catch (e) {
      clearTokens();
      for (final completer in _pendingRequests) {
        completer.completeError(e);
      }
      _pendingRequests.clear();
      await onSessionExpired?.call();
      handler.next(err);
    } finally {
      _isRefreshing = false;
    }
  }

  Future<Response<dynamic>> _retryRequest(RequestOptions options) async {
    final dio = Dio();
    return dio.fetch(options);
  }

  /// Call the /auth/refresh-token endpoint.
  /// Override this or inject the repository call in production.
  Future<Map<String, String>> _performTokenRefresh() async {
    if (_refreshToken == null) {
      throw UnauthorizedException(message: 'No refresh token available');
    }

    var baseUrl = optionsForCurrentRequest?.baseUrl ?? '';
    if (baseUrl.isEmpty) {
      baseUrl = AppConfig.current.apiUrl;
    }

    final dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 10),
      ),
    );

    final response = await dio.post(
      ApiConstants.refreshToken,
      data: {'refresh_token': _refreshToken},
    );

    final raw = response.data;
    final data = raw is Map<String, dynamic> && raw['data'] is Map
        ? Map<String, dynamic>.from(raw['data'] as Map)
        : (raw as Map<String, dynamic>);

    final accessToken =
        data['access_token'] as String? ?? data['accessToken'] as String?;
    final refreshToken =
        data['refresh_token'] as String? ?? data['refreshToken'] as String?;

    if (accessToken == null || refreshToken == null) {
      throw UnauthorizedException(message: 'Invalid refresh response');
    }

    await onTokensUpdated?.call(accessToken, refreshToken);
    return {'accessToken': accessToken, 'refreshToken': refreshToken};
  }

  /// Reference to the current request's options for building the refresh URL.
  RequestOptions? optionsForCurrentRequest;
}
