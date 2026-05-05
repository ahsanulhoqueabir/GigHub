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
      _$ProfileFromJson(json);

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
      _$PublicProfileFromJson(json);

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
