import 'package:gig_hub/core/constants/api_constants.dart';
import 'package:gig_hub/core/network/api_client.dart';
import 'package:gig_hub/data/models/profile_model.dart';

/// Repository for profile-related operations.
class ProfileRepository {
  final ApiClient _client;

  const ProfileRepository({required ApiClient client}) : _client = client;

  /// Get the currently authenticated user's full profile.
  Future<Profile> getMyProfile() async {
    final response = await _client.get<Map<String, dynamic>>(
      ApiConstants.myProfile,
    );
    return Profile.fromJson(response.data!);
  }

  /// Update the authenticated user's profile.
  Future<Profile> updateMyProfile(UpdateProfileInput input) async {
    final response = await _client.patch<Map<String, dynamic>>(
      ApiConstants.updateProfile,
      data: input.toJson(),
    );
    return Profile.fromJson(response.data!);
  }

  /// Get a public profile by username.
  Future<PublicProfile> getPublicProfile(String username) async {
    final response = await _client.get<Map<String, dynamic>>(
      ApiConstants.publicProfile(username),
    );
    return PublicProfile.fromJson(response.data!);
  }

  /// Upload a new avatar image and return the updated profile.
  Future<Profile> updateAvatar(String filePath) async {
    final response = await _client.upload<Map<String, dynamic>>(
      ApiConstants.updateAvatar,
      filePath: filePath,
      field: 'avatar',
    );
    return Profile.fromJson(response.data!);
  }

  /// Update the FCM device token for push notifications.
  Future<void> updateFcmToken(String token) async {
    await _client.patch(ApiConstants.updateProfile, data: {'fcm_token': token});
  }
}
