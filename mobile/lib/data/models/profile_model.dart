import 'package:freezed_annotation/freezed_annotation.dart';

part 'profile_model.freezed.dart';
part 'profile_model.g.dart';

// ── Full Profile ──────────────────────────────────────

@freezed
class Profile with _$Profile {
  @JsonSerializable(fieldRename: FieldRename.snake)
  const factory Profile({
    required String id,
    required String displayName,
    required String username,
    required String email,
    String? avatar,
    String? bio,
    @Default([]) List<String> skills,
    @Default('available') String availabilityStatus,
    @Default(false) bool isVerified,
    @Default('user') String role,
    @Default(0.0) double totalEarnings,
    @Default(0.0) double avgRating,
    @Default(0) int totalReviews,
    required DateTime createdAt,
  }) = _Profile;

  factory Profile.fromJson(Map<String, dynamic> json) =>
      _$ProfileFromJson(_normalizeProfileJson(json));

  const Profile._();
}

// ── Public Profile Summary ────────────────────────────

@freezed
class PublicProfile with _$PublicProfile {
  @JsonSerializable(fieldRename: FieldRename.snake)
  const factory PublicProfile({
    required String id,
    required String displayName,
    required String username,
    String? avatar,
    String? bio,
    @Default([]) List<String> skills,
    @Default('available') String availabilityStatus,
    @Default(false) bool isVerified,
    @Default(0.0) double avgRating,
    @Default(0) int totalReviews,
    @Default(0) int completedOrders,
    required DateTime memberSince,
  }) = _PublicProfile;

  factory PublicProfile.fromJson(Map<String, dynamic> json) =>
      _$PublicProfileFromJson(_normalizeProfileJson(json));

  const PublicProfile._();
}

// ── Update Profile Input ──────────────────────────────

@freezed
class UpdateProfileInput with _$UpdateProfileInput {
  @JsonSerializable(fieldRename: FieldRename.snake, includeIfNull: false)
  const factory UpdateProfileInput({
    String? displayName,
    String? username,
    String? bio,
    List<String>? skills,
    String? availabilityStatus,
  }) = _UpdateProfileInput;

  factory UpdateProfileInput.fromJson(Map<String, dynamic> json) =>
      _$UpdateProfileInputFromJson(json);

  const UpdateProfileInput._();
}

Map<String, dynamic> _normalizeProfileJson(Map<String, dynamic> json) {
  final raw = json['data'] is Map
      ? Map<String, dynamic>.from(json['data'] as Map)
      : json;

  return {
    ...raw,
    'total_earnings': _parseNum(raw['total_earnings']),
    'avg_rating': _parseNum(raw['avg_rating']),
    'total_reviews': _parseInt(raw['total_reviews']),
    'completed_orders': _parseInt(raw['completed_orders']),
  };
}

num? _parseNum(dynamic value) {
  if (value == null) return null;
  if (value is num) return value;
  if (value is String) return num.tryParse(value);
  return null;
}

int? _parseInt(dynamic value) {
  if (value == null) return null;
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) {
    final parsed = num.tryParse(value);
    return parsed?.toInt();
  }
  return null;
}
