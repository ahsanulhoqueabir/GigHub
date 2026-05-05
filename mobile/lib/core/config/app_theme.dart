import 'package:flutter/material.dart';
import 'package:gig_hub/core/constants/app_colors.dart';
import 'package:gig_hub/core/constants/app_sizes.dart';
import 'package:gig_hub/presentation/theme/app_theme_data.dart';
import 'package:gig_hub/presentation/theme/text_styles.dart';

/// Convenience re-export file for themes.
///
/// Use this for quick access to all theme definitions:
/// ```dart
/// import 'package:gig_hub/core/config/app_theme.dart';
/// ```
///
/// Then access: `AppTheme.light`, `AppTheme.colors`, `AppTheme.textStyles`, etc.
class AppTheme {
  AppTheme._();

  static ThemeData get light => AppThemeData.light;
  static ThemeData get dark => AppThemeData.dark;
  static const colors = AppColors;
  static const textStyles = AppTextStyles;
  static const sizes = AppSizes;
  static ColorScheme colorSchemeOf(BuildContext context) =>
      Theme.of(context).colorScheme;
}
