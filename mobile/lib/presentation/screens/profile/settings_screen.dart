import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/data/providers/auth_provider.dart';
import 'package:gighub/data/providers/theme_provider.dart';
import 'package:gighub/presentation/widgets/common/gh_toast.dart';

/// App settings screen with theme toggle, notification preferences, and logout.
class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _emailNotifications = true;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currentThemeMode = ref.watch(themeModeProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Settings'), centerTitle: true),
      body: ListView(
        padding: const EdgeInsets.all(AppSizes.space16),
        children: [
          // ── Appearance ─────────────────────────
          _SectionHeader(icon: Icons.palette_outlined, title: 'Appearance'),
          const SizedBox(height: AppSizes.space8),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: theme.colorScheme.outlineVariant),
            ),
            child: Padding(
              padding: const EdgeInsets.all(AppSizes.space12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.brightness_6,
                        color: theme.colorScheme.primary,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Theme',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            Text(
                              _themeModeLabel(currentThemeMode),
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSizes.space12),
                  SegmentedButton<ThemeMode>(
                    segments: const [
                      ButtonSegment(
                        value: ThemeMode.light,
                        label: Text('Light'),
                        icon: Icon(Icons.light_mode),
                      ),
                      ButtonSegment(
                        value: ThemeMode.system,
                        label: Text('System'),
                        icon: Icon(Icons.brightness_auto),
                      ),
                      ButtonSegment(
                        value: ThemeMode.dark,
                        label: Text('Dark'),
                        icon: Icon(Icons.dark_mode),
                      ),
                    ],
                    selected: {currentThemeMode},
                    onSelectionChanged: (modes) {
                      ref
                          .read(themeModeProvider.notifier)
                          .setThemeMode(modes.first);
                    },
                    style: ButtonStyle(
                      shape: WidgetStatePropertyAll(
                        RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AppSizes.space24),

          // ── Notifications ──────────────────────
          _SectionHeader(
            icon: Icons.notifications_outlined,
            title: 'Notifications',
          ),
          const SizedBox(height: AppSizes.space8),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: theme.colorScheme.outlineVariant),
            ),
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Push Notifications'),
                  subtitle: const Text('Receive push notifications'),
                  secondary: Icon(
                    Icons.notifications_active_outlined,
                    color: _notificationsEnabled
                        ? theme.colorScheme.primary
                        : theme.colorScheme.onSurfaceVariant,
                  ),
                  value: _notificationsEnabled,
                  onChanged: (v) => setState(() => _notificationsEnabled = v),
                ),
                const Divider(height: 1, indent: 72, endIndent: 16),
                SwitchListTile(
                  title: const Text('Email Notifications'),
                  subtitle: const Text('Receive email notifications'),
                  secondary: Icon(
                    Icons.email_outlined,
                    color: _emailNotifications
                        ? theme.colorScheme.primary
                        : theme.colorScheme.onSurfaceVariant,
                  ),
                  value: _emailNotifications,
                  onChanged: (v) => setState(() => _emailNotifications = v),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSizes.space24),

          // ── Account ────────────────────────────
          _SectionHeader(icon: Icons.lock_outline, title: 'Account'),
          const SizedBox(height: AppSizes.space8),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: theme.colorScheme.outlineVariant),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: Container(
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primaryContainer,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    padding: const EdgeInsets.all(8),
                    child: Icon(
                      Icons.lock_outline,
                      color: theme.colorScheme.onPrimaryContainer,
                      size: 20,
                    ),
                  ),
                  title: const Text('Change Password'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    GhToast.show(
                      context,
                      message: 'Coming soon',
                      type: GhToastType.info,
                    );
                  },
                ),
                const Divider(height: 1, indent: 72, endIndent: 16),
                ListTile(
                  leading: Container(
                    decoration: BoxDecoration(
                      color: theme.colorScheme.errorContainer,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    padding: const EdgeInsets.all(8),
                    child: Icon(
                      Icons.logout,
                      color: theme.colorScheme.onErrorContainer,
                      size: 20,
                    ),
                  ),
                  title: Text(
                    'Logout',
                    style: TextStyle(
                      color: theme.colorScheme.error,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  trailing: Icon(
                    Icons.chevron_right,
                    color: theme.colorScheme.error,
                  ),
                  onTap: () => _showLogoutDialog(),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSizes.space24),

          // ── About ──────────────────────────────
          _SectionHeader(icon: Icons.info_outline, title: 'About'),
          const SizedBox(height: AppSizes.space8),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: theme.colorScheme.outlineVariant),
            ),
            child: ListTile(
              leading: Container(
                decoration: BoxDecoration(
                  color: theme.colorScheme.tertiaryContainer,
                  borderRadius: BorderRadius.circular(10),
                ),
                padding: const EdgeInsets.all(8),
                child: Icon(
                  Icons.info_outline,
                  color: theme.colorScheme.onTertiaryContainer,
                  size: 20,
                ),
              ),
              title: const Text('Version'),
              subtitle: const Text('1.0.0 (Beta)'),
            ),
          ),
          const SizedBox(height: AppSizes.space32),

          // ── Footer ─────────────────────────────
          Center(
            child: Text(
              'GigHub v1.0.0-beta',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant.withValues(
                  alpha: 0.6,
                ),
              ),
            ),
          ),
          const SizedBox(height: AppSizes.space16),
        ],
      ),
    );
  }

  String _themeModeLabel(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.light:
        return 'Light mode';
      case ThemeMode.dark:
        return 'Dark mode';
      case ThemeMode.system:
        return 'Follow system';
    }
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(dialogContext).pop();
              ref.read(authProvider.notifier).logout();
              context.go('/home');
            },
            style: TextButton.styleFrom(
              foregroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }
}

/// Section header with an icon and title.
class _SectionHeader extends StatelessWidget {
  final IconData icon;
  final String title;

  const _SectionHeader({required this.icon, required this.title});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      children: [
        Icon(icon, size: 18, color: theme.colorScheme.primary),
        const SizedBox(width: 8),
        Text(
          title,
          style: theme.textTheme.titleSmall?.copyWith(
            color: theme.colorScheme.primary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  final ThemeData theme;

  const _SectionTitle({required this.title, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSizes.space8),
      child: Text(
        title,
        style: theme.textTheme.titleSmall?.copyWith(
          color: theme.colorScheme.primary,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
