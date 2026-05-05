import 'dart:async';

import 'package:dio/dio.dart';
import 'package:gighub/core/network/api_exceptions.dart';

/// Interceptor that attaches the JWT access token to outgoing requests
/// and handles automatic token refresh on 401 responses.
///
/// During a refresh, concurrent requests are queued and retried once
/// the new token is obtained.
class AuthInterceptor extends Interceptor {
  String? _accessToken;
  String? _refreshToken;

  bool _isRefreshing = false;
  final List<Completer<void>> _pendingRequests = [];

  /// Callback invoked when the refresh token is expired / invalid.
  /// Typically this navigates to the login screen.
  void Function()? onSessionExpired;

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
    if (err.requestOptions.path.contains('/auth/refresh')) {
      clearTokens();
      onSessionExpired?.call();
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
      onSessionExpired?.call();
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

    final dio = Dio(
      BaseOptions(
        baseUrl: optionsForCurrentRequest?.baseUrl ?? '',
        connectTimeout: const Duration(seconds: 10),
      ),
    );

    final response = await dio.post(
      '/auth/refresh-token',
      data: {'refreshToken': _refreshToken},
    );

    final data = response.data;
    return {
      'accessToken': data['accessToken'] as String,
      'refreshToken': data['refreshToken'] as String,
    };
  }

  /// Reference to the current request's options for building the refresh URL.
  RequestOptions? optionsForCurrentRequest;
}
