import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/constants/app_colors.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/data/models/notification_model.dart';
import 'package:gighub/data/providers/notification_provider.dart';

/// Screen that displays all notifications with distinct new/seen states.
///
/// - Unread notifications have a colored accent bar, bold title, and slight
///   background tint so they stand out.
/// - Tapping a notification marks it as read and navigates to the related item.
/// - A "Mark all as read" action is available in the app bar.
class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final notificationsAsync = ref.watch(
      notificationsProvider(const NotificationQueryParams(limit: 50)),
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          notificationsAsync.whenOrNull(
                data: (summary) => summary.unreadCount > 0
                    ? IconButton(
                        icon: const Icon(Icons.done_all),
                        tooltip: 'Mark all as read',
                        onPressed: () => _markAllAsRead(),
                      )
                    : null,
              ) ??
              const SizedBox.shrink(),
        ],
      ),
      body: notificationsAsync.when(
        data: (summary) {
          if (summary.notifications.isEmpty) {
            return _EmptyState(theme: theme);
          }
          return _NotificationList(
            notifications: summary.notifications,
            onTap: (n) => _onNotificationTap(n),
          );
        },
        loading: () => const _LoadingState(),
        error: (e, _) => _ErrorState(theme: theme, message: e.toString()),
      ),
    );
  }

  void _onNotificationTap(AppNotification notification) async {
    // Mark as read
    if (!notification.isRead) {
      ref
          .read(notificationNotifierProvider.notifier)
          .markAsRead(ref, notification.id);
    }

    // Navigate based on reference type
    if (!mounted) return;
    switch (notification.referenceType) {
      case 'gig':
        context.push('/gigs/${notification.referenceId}');
        break;
      case 'job':
        context.push('/jobs/${notification.referenceId}');
        break;
      case 'proposal':
        context.push('/proposals/me');
        break;
      default:
        break;
    }
  }

  void _markAllAsRead() {
    ref.read(notificationNotifierProvider.notifier).markAllAsRead(ref);
  }
}

/// The list of notification items.
class _NotificationList extends StatelessWidget {
  final List<AppNotification> notifications;
  final void Function(AppNotification) onTap;

  const _NotificationList({required this.notifications, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: AppSizes.space8),
      itemCount: notifications.length,
      separatorBuilder: (_, __) =>
          const Divider(height: 1, indent: 72, endIndent: 16),
      itemBuilder: (context, index) {
        final notification = notifications[index];
        return _NotificationTile(
          notification: notification,
          onTap: () => onTap(notification),
        );
      },
    );
  }
}

/// A single notification tile with distinct new/seen styling.
class _NotificationTile extends StatelessWidget {
  final AppNotification notification;
  final VoidCallback onTap;

  const _NotificationTile({required this.notification, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isUnread = !notification.isRead;

    return Material(
      color: isUnread
          ? theme.colorScheme.primaryContainer.withValues(alpha: 0.3)
          : Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSizes.space16,
            vertical: AppSizes.space12,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Leading icon with colored background
              _NotificationIcon(type: notification.type, isUnread: isUnread),
              const SizedBox(width: AppSizes.space12),

              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title row with unread indicator
                    Row(
                      children: [
                        if (isUnread)
                          Container(
                            width: 8,
                            height: 8,
                            margin: const EdgeInsets.only(right: 6),
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primary,
                              shape: BoxShape.circle,
                            ),
                          ),
                        Expanded(
                          child: Text(
                            notification.title,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: isUnread
                                  ? FontWeight.w600
                                  : FontWeight.w400,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),

                    // Message
                    Text(
                      notification.message,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),

                    // Timestamp
                    Text(
                      _formatTimeAgo(notification.createdAt),
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: theme.colorScheme.outline,
                      ),
                    ),
                  ],
                ),
              ),

              // Chevron
              if (notification.referenceType != null)
                Icon(
                  Icons.chevron_right,
                  size: AppSizes.iconSizeMd,
                  color: theme.colorScheme.outline,
                ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final diff = now.difference(dateTime);

    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
  }
}

/// Icon based on notification type.
class _NotificationIcon extends StatelessWidget {
  final String type;
  final bool isUnread;

  const _NotificationIcon({required this.type, required this.isUnread});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = isUnread
        ? theme.colorScheme.primary
        : theme.colorScheme.outline;

    IconData icon;
    Color? backgroundColor;

    switch (type) {
      case 'order_update':
      case 'order_completed':
        icon = Icons.shopping_bag_outlined;
        backgroundColor = AppColors.info.withValues(alpha: 0.15);
        break;
      case 'proposal_received':
        icon = Icons.file_present_outlined;
        backgroundColor = AppColors.warning.withValues(alpha: 0.15);
        break;
      case 'proposal_accepted':
        icon = Icons.check_circle_outline;
        backgroundColor = AppColors.success.withValues(alpha: 0.15);
        break;
      case 'new_message':
        icon = Icons.chat_bubble_outline;
        backgroundColor = AppColors.primary.withValues(alpha: 0.15);
        break;
      case 'review_received':
        icon = Icons.star_outline;
        backgroundColor = AppColors.warning.withValues(alpha: 0.15);
        break;
      case 'payment_released':
        icon = Icons.account_balance_wallet_outlined;
        backgroundColor = AppColors.success.withValues(alpha: 0.15);
        break;
      case 'gig_milestone':
        icon = Icons.flag_outlined;
        backgroundColor = AppColors.info.withValues(alpha: 0.15);
        break;
      case 'new_follower':
        icon = Icons.person_add_outlined;
        backgroundColor = AppColors.secondary.withValues(alpha: 0.15);
        break;
      case 'system':
      default:
        icon = Icons.notifications_outlined;
        backgroundColor = theme.colorScheme.surfaceContainerHighest;
        break;
    }

    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: isUnread
            ? backgroundColor
            : backgroundColor.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(AppSizes.radiusMd),
      ),
      child: Icon(icon, size: AppSizes.iconSizeMd, color: color),
    );
  }
}

/// Empty state when there are no notifications.
class _EmptyState extends StatelessWidget {
  final ThemeData theme;

  const _EmptyState({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSizes.space32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.notifications_off_outlined,
              size: 72,
              color: theme.colorScheme.outline,
            ),
            const SizedBox(height: AppSizes.space16),
            Text(
              'No notifications yet',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppSizes.space8),
            Text(
              'When you get new notifications, they\'ll show up here.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Loading shimmer state.
class _LoadingState extends StatelessWidget {
  const _LoadingState();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: AppSizes.space8),
      itemCount: 6,
      itemBuilder: (_, __) => Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSizes.space16,
          vertical: AppSizes.space12,
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: isDark ? Colors.grey[800] : Colors.grey[300],
                borderRadius: BorderRadius.circular(AppSizes.radiusMd),
              ),
            ),
            const SizedBox(width: AppSizes.space12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 140,
                    height: 14,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.grey[800] : Colors.grey[300],
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    height: 12,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.grey[800] : Colors.grey[300],
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    width: 60,
                    height: 10,
                    decoration: BoxDecoration(
                      color: isDark ? Colors.grey[800] : Colors.grey[300],
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Error state.
class _ErrorState extends StatelessWidget {
  final ThemeData theme;
  final String message;

  const _ErrorState({required this.theme, required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSizes.space32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 72, color: theme.colorScheme.error),
            const SizedBox(height: AppSizes.space16),
            Text(
              'Something went wrong',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppSizes.space8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
