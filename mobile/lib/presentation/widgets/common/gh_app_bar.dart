import 'package:flutter/material.dart';

/// Consistent app bar used throughout the app.
class GhAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final bool centerTitle;
  final List<Widget>? actions;
  final Widget? leading;
  final PreferredSizeWidget? bottom;
  final bool showBackButton;

  const GhAppBar({
    super.key,
    required this.title,
    this.centerTitle = false,
    this.actions,
    this.leading,
    this.bottom,
    this.showBackButton = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AppBar(
      title: Text(title),
      centerTitle: centerTitle,
      leading: showBackButton && Navigator.of(context).canPop()
          ? (leading ??
                IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new, size: 20),
                  onPressed: () => Navigator.of(context).pop(),
                ))
          : leading,
      actions: actions,
      bottom: bottom,
      surfaceTintColor: theme.colorScheme.surface,
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(
    bottom != null
        ? kToolbarHeight + (bottom?.preferredSize.height ?? 0)
        : kToolbarHeight,
  );
}
