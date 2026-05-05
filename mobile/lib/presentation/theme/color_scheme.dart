import 'package:flutter/material.dart';
import 'package:gig_hub/core/constants/app_colors.dart';

/// Light and dark color schemes for the GigHub Material 3 theme.
class AppColorScheme {
  AppColorScheme._();

  // ── Light ───────────────────────────────────────────

  static const ColorScheme light = ColorScheme(
    brightness: Brightness.light,
    primary: AppColors.primary,
    onPrimary: AppColors.white,
    primaryContainer: Color(0xFFDBEAFE),
    onPrimaryContainer: Color(0xFF1E3A5F),
    secondary: AppColors.secondary,
    onSecondary: AppColors.white,
    secondaryContainer: Color(0xFFEDE9FE),
    onSecondaryContainer: Color(0xFF3B1E7E),
    tertiary: AppColors.accent,
    onTertiary: AppColors.white,
    tertiaryContainer: Color(0xFFCFFAFE),
    onTertiaryContainer: Color(0xFF155E75),
    error: AppColors.error,
    onError: AppColors.white,
    errorContainer: Color(0xFFFEE2E2),
    onErrorContainer: Color(0xFF7F1D1D),
    surface: AppColors.white,
    onSurface: AppColors.neutral900,
    surfaceContainerHighest: AppColors.neutral100,
    onSurfaceVariant: AppColors.neutral600,
    outline: AppColors.neutral300,
    outlineVariant: AppColors.neutral200,
    shadow: Color(0x1A000000),
    scrim: Color(0x4D000000),
    inverseSurface: AppColors.neutral800,
    onInverseSurface: AppColors.neutral50,
  );

  // ── Dark ────────────────────────────────────────────

  static const ColorScheme dark = ColorScheme(
    brightness: Brightness.dark,
    primary: Color(0xFF60A5FA),
    onPrimary: Color(0xFF1E3A5F),
    primaryContainer: Color(0xFF1E3A8A),
    onPrimaryContainer: Color(0xFFDBEAFE),
    secondary: Color(0xFFA78BFA),
    onSecondary: Color(0xFF3B1E7E),
    secondaryContainer: Color(0xFF5B21B6),
    onSecondaryContainer: Color(0xFFEDE9FE),
    tertiary: Color(0xFF22D3EE),
    onTertiary: Color(0xFF155E75),
    tertiaryContainer: Color(0xFF0E7490),
    onTertiaryContainer: Color(0xFFCFFAFE),
    error: Color(0xFFFCA5A5),
    onError: Color(0xFF7F1D1D),
    errorContainer: Color(0xFF7F1D1D),
    onErrorContainer: Color(0xFFFEE2E2),
    surface: AppColors.darkBg,
    onSurface: AppColors.neutral50,
    surfaceContainerHighest: AppColors.darkSurface,
    onSurfaceVariant: AppColors.neutral400,
    outline: AppColors.neutral600,
    outlineVariant: AppColors.neutral700,
    shadow: Color(0x4D000000),
    scrim: Color(0x80000000),
    inverseSurface: AppColors.neutral200,
    onInverseSurface: AppColors.neutral900,
  );
}
