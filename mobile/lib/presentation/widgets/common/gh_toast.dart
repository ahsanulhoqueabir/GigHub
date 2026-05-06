import 'package:flutter/material.dart';

enum GhToastType { success, error, warning, info }

class GhToast {
  const GhToast._();

  static void show(
    BuildContext context, {
    required String message,
    GhToastType type = GhToastType.info,
  }) {
    final theme = Theme.of(context);
    final colors = _ToastColors.fromTheme(theme, type);
    final icon = _toastIcon(type);

    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        backgroundColor: Colors.transparent,
        elevation: 0,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        content: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: colors.background,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: colors.border),
            boxShadow: [
              BoxShadow(
                color: colors.shadow,
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: colors.iconBackground,
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: colors.icon, size: 16),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  message,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colors.foreground,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ToastColors {
  final Color background;
  final Color foreground;
  final Color border;
  final Color icon;
  final Color iconBackground;
  final Color shadow;

  const _ToastColors({
    required this.background,
    required this.foreground,
    required this.border,
    required this.icon,
    required this.iconBackground,
    required this.shadow,
  });

  static _ToastColors fromTheme(ThemeData theme, GhToastType type) {
    switch (type) {
      case GhToastType.success:
        return _ToastColors(
          background: const Color(0xFFE7F7EE),
          foreground: const Color(0xFF0E5F3A),
          border: const Color(0xFFBEE8D0),
          icon: const Color(0xFF0B7A43),
          iconBackground: const Color(0xFFD2F1E1),
          shadow: Colors.black.withOpacity(0.12),
        );
      case GhToastType.error:
        return _ToastColors(
          background: const Color(0xFFFFECEB),
          foreground: const Color(0xFF7A1F1B),
          border: const Color(0xFFFFB4B0),
          icon: const Color(0xFFC62828),
          iconBackground: const Color(0xFFFFD3D1),
          shadow: Colors.black.withOpacity(0.12),
        );
      case GhToastType.warning:
        return _ToastColors(
          background: const Color(0xFFFFF4E5),
          foreground: const Color(0xFF7A4B00),
          border: const Color(0xFFFFD7A8),
          icon: const Color(0xFFB36B00),
          iconBackground: const Color(0xFFFFE4C2),
          shadow: Colors.black.withOpacity(0.12),
        );
      case GhToastType.info:
        return _ToastColors(
          background: const Color(0xFFEAF3FF),
          foreground: const Color(0xFF123E7A),
          border: const Color(0xFFC7DEFF),
          icon: const Color(0xFF1B5FBF),
          iconBackground: const Color(0xFFD8E8FF),
          shadow: Colors.black.withOpacity(0.12),
        );
    }
  }
}

IconData _toastIcon(GhToastType type) {
  switch (type) {
    case GhToastType.success:
      return Icons.check_circle;
    case GhToastType.error:
      return Icons.error;
    case GhToastType.warning:
      return Icons.warning_amber_rounded;
    case GhToastType.info:
      return Icons.info;
  }
}
