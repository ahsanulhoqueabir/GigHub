/// Base API exception class.
class ApiException implements Exception {
  final String code;
  final String message;
  final int? statusCode;
  final dynamic details;

  const ApiException({
    this.code = 'UNKNOWN',
    required this.message,
    this.statusCode,
    this.details,
  });

  @override
  String toString() => 'ApiException($code): $message';
}

/// 401 — The request requires user authentication.
class UnauthorizedException extends ApiException {
  const UnauthorizedException({
    super.code = 'UNAUTHORIZED',
    required super.message,
    super.statusCode = 401,
    super.details,
  });
}

/// 403 — The server understood the request but refuses to authorize it.
class ForbiddenException extends ApiException {
  const ForbiddenException({
    super.code = 'FORBIDDEN',
    required super.message,
    super.statusCode = 403,
    super.details,
  });
}

/// 404 — The requested resource was not found.
class NotFoundException extends ApiException {
  const NotFoundException({
    super.code = 'NOT_FOUND',
    required super.message,
    super.statusCode = 404,
    super.details,
  });
}

/// 409 — The request conflicts with the current state of the server.
class ConflictException extends ApiException {
  const ConflictException({
    super.code = 'CONFLICT',
    required super.message,
    super.statusCode = 409,
    super.details,
  });
}

/// 422 — The server understands the request but cannot process it
/// due to semantic errors (validation).
class ValidationException extends ApiException {
  final Map<String, List<String>>? errors;
  @override
  final dynamic details;

  const ValidationException({
    super.code = 'VALIDATION_ERROR',
    required super.message,
    super.statusCode = 400,
    this.errors,
    this.details,
  });
}

/// 429 — Too many requests.
class RateLimitException extends ApiException {
  const RateLimitException({
    super.code = 'RATE_LIMITED',
    required super.message,
    super.statusCode = 429,
    super.details,
  });
}

/// 5xx — The server failed to fulfill a valid request.
class ServerException extends ApiException {
  const ServerException({
    super.code = 'SERVER_ERROR',
    required super.message,
    super.statusCode,
    super.details,
  });
}

/// Network-level failure (no response from server).
class NetworkException extends ApiException {
  const NetworkException({
    super.code = 'NETWORK_ERROR',
    required super.message,
    super.statusCode,
    super.details,
  });
}
