import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:gighub/core/constants/app_colors.dart';
import 'package:gighub/presentation/widgets/common/gh_avatar.dart';

/// Avatar picker widget with camera/gallery bottom sheet.
///
/// Displays the current avatar with a camera icon overlay. Tapping opens
/// a bottom sheet with "Take Photo" and "Choose from Gallery" options.
class AvatarPicker extends StatelessWidget {
  final String? currentImageUrl;
  final String? name;
  final void Function(String filePath)? onImageSelected;
  final double radius;

  const AvatarPicker({
    super.key,
    this.currentImageUrl,
    this.name,
    this.onImageSelected,
    this.radius = 48,
  });

  Future<void> _showPicker(BuildContext context) async {
    final imagePicker = ImagePicker();

    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Take Photo'),
              onTap: () => Navigator.pop(ctx, ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Choose from Gallery'),
              onTap: () => Navigator.pop(ctx, ImageSource.gallery),
            ),
          ],
        ),
      ),
    );

    if (source == null) return;

    final pickedFile = await imagePicker.pickImage(
      source: source,
      maxWidth: 512,
      maxHeight: 512,
      imageQuality: 85,
    );

    if (pickedFile != null) {
      onImageSelected?.call(pickedFile.path);
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _showPicker(context),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          GhAvatar(imageUrl: currentImageUrl, name: name, radius: radius),
          Positioned(
            right: -4,
            bottom: -4,
            child: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
              child: const Icon(
                Icons.camera_alt,
                size: 16,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
