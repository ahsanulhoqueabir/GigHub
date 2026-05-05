import 'package:dio/dio.dart';
import 'package:gig_hub/core/config/app_config.dart';
import 'package:gig_hub/core/network/api_exceptions.dart';
import 'package:gig_hub/core/network/api_response.dart';
import 'package:gig_hub/core/network/auth_interceptor.dart';

/// Singleton Dio HTTP client configured for the GigHub API.
///
/// Provides typed GET, POST, PATCH, DELETE, and upload methods.
/// Automatically attaches JWT tokens via [AuthInterceptor].
class ApiClient {
  late final Dio _dio;

  ApiClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.current.apiUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 15),
        sendTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.addAll([
      AuthInterceptor(),
      LogInterceptor(
        requestBody: !AppConfig.current.isProduction,
        responseBody: !AppConfig.current.isProduction,
      ),
    ]);
  }

  /// Access the raw Dio instance (e.g. for multipart uploads).
  Dio get dio => _dio;

  // ── HTTP Methods ──────────────────────────────────────

  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: queryParameters,
        cancelToken: cancelToken,
      );
      return ApiResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _mapDioError(e);
    }
  }

  Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
    CancelToken? cancelToken,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        cancelToken: cancelToken,
      );
      return ApiResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _mapDioError(e);
    }
  }

  Future<ApiResponse<T>> patch<T>(
    String path, {
    dynamic data,
    CancelToken? cancelToken,
  }) async {
    try {
      final response = await _dio.patch(
        path,
        data: data,
        cancelToken: cancelToken,
      );
      return ApiResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _mapDioError(e);
    }
  }

  Future<ApiResponse<T>> delete<T>(
    String path, {
    CancelToken? cancelToken,
  }) async {
    try {
      final response = await _dio.delete(path, cancelToken: cancelToken);
      return ApiResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _mapDioError(e);
    }
  }

  Future<ApiResponse<T>> upload<T>(
    String path, {
    required String filePath,
    String field = 'file',
    Map<String, dynamic>? extraFields,
    CancelToken? cancelToken,
    void Function(int, int)? onSendProgress,
  }) async {
    try {
      final formData = FormData.fromMap({
        field: await MultipartFile.fromFile(filePath),
        if (extraFields != null) ...extraFields,
      });
      final response = await _dio.post(
        path,
        data: formData,
        cancelToken: cancelToken,
        onSendProgress: onSendProgress,
      );
      return ApiResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _mapDioError(e);
    }
  }

  // ── Error Mapping ────────────────────────────────────

  ApiException _mapDioError(DioException e) {
    // Check connectivity first
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.sendTimeout ||
        e.type == DioExceptionType.connectionError) {
      return NetworkException(
        message:
            'Unable to connect to server. Please check your internet connection.',
        statusCode: e.response?.statusCode,
      );
    }

    final statusCode = e.response?.statusCode;
    final data = e.response?.data;

    if (data is Map<String, dynamic>) {
      final message =
          data['message'] as String? ?? 'An unexpected error occurred';
      final code = data['code'] as String? ?? 'UNKNOWN';

      switch (statusCode) {
        case 401:
          return UnauthorizedException(
            code: code,
            message: message,
            statusCode: statusCode,
          );
        case 403:
          return ForbiddenException(
            code: code,
            message: message,
            statusCode: statusCode,
          );
        case 404:
          return NotFoundException(
            code: code,
            message: message,
            statusCode: statusCode,
          );
        case 409:
          return ConflictException(
            code: code,
            message: message,
            statusCode: statusCode,
          );
        case 422:
          return ValidationException(
            code: code,
            message: message,
            statusCode: statusCode,
            errors: data['errors'] is Map
                ? Map<String, List<String>>.from(
                    (data['errors'] as Map).map(
                      (k, v) => MapEntry(k.toString(), List<String>.from(v)),
                    ),
                  )
                : null,
          );
        case 429:
          return RateLimitException(
            code: code,
            message: message,
            statusCode: statusCode,
          );
        default:
          if (statusCode != null && statusCode >= 500) {
            return ServerException(
              code: code,
              message: message,
              statusCode: statusCode,
            );
          }
          return ApiException(
            code: code,
            message: message,
            statusCode: statusCode,
          );
      }
    }

    return NetworkException(
      message: 'An unexpected error occurred. Please try again.',
      statusCode: statusCode,
    );
  }
}
