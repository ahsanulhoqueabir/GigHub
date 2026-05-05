import 'package:flutter/material.dart';
import 'package:gighub/core/constants/app_sizes.dart';

/// Reusable primary/secondary/outlined/text button widget.
class GhButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final GhButtonVariant variant;
  final bool isLoading;
  final bool isFullWidth;
  final IconData? icon;
  final double? width;
  final double height;

  const GhButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = GhButtonVariant.primary,
    this.isLoading = false,
    this.isFullWidth = true,
    this.icon,
    this.width,
    this.height = AppSizes.buttonHeight,
  });

  const GhButton.primary({
    super.key,
    required this.label,
    this.onPressed,
    this.isLoading = false,
    this.isFullWidth = true,
    this.icon,
    this.width,
    this.height = AppSizes.buttonHeight,
  }) : variant = GhButtonVariant.primary;

  const GhButton.secondary({
    super.key,
    required this.label,
    this.onPressed,
    this.isLoading = false,
    this.isFullWidth = true,
    this.icon,
    this.width,
    this.height = AppSizes.buttonHeight,
  }) : variant = GhButtonVariant.secondary;

  const GhButton.outlined({
    super.key,
    required this.label,
    this.onPressed,
    this.isLoading = false,
    this.isFullWidth = true,
    this.icon,
    this.width,
    this.height = AppSizes.buttonHeight,
  }) : variant = GhButtonVariant.outlined;

  const GhButton.text({
    super.key,
    required this.label,
    this.onPressed,
    this.isLoading = false,
    this.isFullWidth = true,
    this.icon,
    this.width,
    this.height = AppSizes.buttonHeight,
  }) : variant = GhButtonVariant.text;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final child = _buildChild();

    if (isFullWidth && width == null) {
      return SizedBox(
        width: double.infinity,
        height: height,
        child: _buildButton(theme, child),
      );
    }

    return SizedBox(
      width: width,
      height: height,
      child: _buildButton(theme, child),
    );
  }

  Widget _buildButton(ThemeData theme, Widget child) {
    return switch (variant) {
      GhButtonVariant.primary => ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        child: child,
      ),
      GhButtonVariant.secondary => ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: theme.colorScheme.secondary,
          foregroundColor: theme.colorScheme.onSecondary,
        ),
        child: child,
      ),
      GhButtonVariant.outlined => OutlinedButton(
        onPressed: isLoading ? null : onPressed,
        child: child,
      ),
      GhButtonVariant.text => TextButton(
        onPressed: isLoading ? null : onPressed,
        child: child,
      ),
    };
  }

  Widget _buildChild() {
    if (isLoading) {
      return const SizedBox(
        height: 22,
        width: 22,
        child: CircularProgressIndicator(strokeWidth: 2.5),
      );
    }

    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 20),
          const SizedBox(width: AppSizes.space8),
          Text(label),
        ],
      );
    }

    return Text(label);
  }
}

enum GhButtonVariant { primary, secondary, outlined, text }
