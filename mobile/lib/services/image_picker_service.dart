import 'dart:io';

import 'package:image_picker/image_picker.dart';

/// Service for picking images from camera or gallery.
class ImagePickerService {
  final ImagePicker _picker = ImagePicker();

  /// Pick an image from the gallery.
  Future<File?> pickFromGallery() async {
    final xFile = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
      maxWidth: 1024,
    );
    if (xFile == null) return null;
    return File(xFile.path);
  }

  /// Capture an image from the camera.
  Future<File?> pickFromCamera() async {
    final xFile = await _picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 85,
      maxWidth: 1024,
    );
    if (xFile == null) return null;
    return File(xFile.path);
  }
}
