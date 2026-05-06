import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:gighub/core/constants/app_colors.dart';
import 'package:gighub/core/utils/extensions.dart';

/// Circular avatar with network image, fallback initials, and optional badge.
class GhAvatar extends StatelessWidget {
  final String? imageUrl;
  final String? name;
  final double radius;
  final VoidCallback? onTap;
  final Widget? badge;

  const GhAvatar({
    super.key,
    this.imageUrl,
    this.name,
    this.radius = 24,
    this.onTap,
    this.badge,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Widget avatar = CircleAvatar(
      radius: radius,
      backgroundColor: theme.colorScheme.primaryContainer,
      foregroundImage: imageUrl != null
          ? CachedNetworkImageProvider(imageUrl!)
          : null,
      child: imageUrl == null
          ? Text(
              (name ?? '?').initials(),
              style: TextStyle(
                color: theme.colorScheme.onPrimaryContainer,
                fontWeight: FontWeight.w600,
                fontSize: radius * 0.8,
              ),
            )
          : null,
    );

    if (onTap != null) {
      avatar = GestureDetector(onTap: onTap, child: avatar);
    }

    if (badge != null) {
      return Stack(
        clipBehavior: Clip.none,
        children: [
          avatar,
          Positioned(right: -2, bottom: -2, child: badge!),
        ],
      );
    }

    return avatar;
  }
}

/// Small coloured dot badge (e.g., online status).
class GhOnlineBadge extends StatelessWidget {
  final bool isOnline;

  const GhOnlineBadge({super.key, required this.isOnline});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 12,
      height: 12,
      decoration: BoxDecoration(
        color: isOnline ? AppColors.success : AppColors.neutral400,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2),
      ),
    );
  }
}
