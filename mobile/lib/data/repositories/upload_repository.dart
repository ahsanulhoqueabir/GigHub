import 'package:gig_hub/core/constants/api_constants.dart';
import 'package:gig_hub/core/network/api_client.dart';

/// Repository for file upload operations.
class UploadRepository {
  final ApiClient _client;

  const UploadRepository({required ApiClient client}) : _client = client;

  /// Upload an image file and return its URL.
  ///
  /// [folder] can be 'avatars', 'gigs', 'portfolios', etc.
  Future<String> uploadImage(
    String filePath, {
    String folder = 'general',
  }) async {
    final response = await _client.upload<Map<String, dynamic>>(
      ApiConstants.uploadImage,
      filePath: filePath,
      field: 'file',
      extraFields: {'folder': folder},
    );
    return response.data!['url'] as String;
  }

  /// Upload a non-image file.
  Future<String> uploadFile(
    String filePath, {
    String folder = 'general',
  }) async {
    // Reuses the same image endpoint — adjust if backend has separate route
    final response = await _client.upload<Map<String, dynamic>>(
      ApiConstants.uploadImage,
      filePath: filePath,
      field: 'file',
      extraFields: {'folder': folder},
    );
    return response.data!['url'] as String;
  }
}
