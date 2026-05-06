import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gighub/data/models/notification_model.dart';
import 'package:gighub/data/repositories/notification_repository.dart';

/// Repository provider.
final notificationRepositoryProvider = Provider<NotificationRepository>(
  (ref) => NotificationRepository(),
);

/// Fetches paginated notifications.
final notificationsProvider =
    FutureProvider.family<NotificationSummary, NotificationQueryParams>((
      ref,
      params,
    ) async {
      final repo = ref.watch(notificationRepositoryProvider);
      return repo.getNotifications(
        unreadOnly: params.unreadOnly,
        type: params.type,
        page: params.page,
        limit: params.limit,
      );
    });

/// Provider for just the unread notification count.
final unreadNotificationCountProvider = FutureProvider<int>((ref) async {
  final repo = ref.watch(notificationRepositoryProvider);
  return repo.getUnreadCount();
});

/// Notifier for notification state management — mark as read, etc.
class NotificationNotifier extends StateNotifier<AsyncValue<void>> {
  final NotificationRepository _repo;

  NotificationNotifier(this._repo) : super(const AsyncValue.data(null));

  /// Mark a single notification as read and invalidate related providers.
  Future<void> markAsRead(WidgetRef ref, String notificationId) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await _repo.markAsRead(notificationId);
      ref.invalidate(notificationsProvider);
      ref.invalidate(unreadNotificationCountProvider);
    });
  }

  /// Mark all notifications as read.
  Future<void> markAllAsRead(WidgetRef ref) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await _repo.markAllAsRead();
      ref.invalidate(notificationsProvider);
      ref.invalidate(unreadNotificationCountProvider);
    });
  }
}

final notificationNotifierProvider =
    StateNotifierProvider<NotificationNotifier, AsyncValue<void>>(
      (ref) => NotificationNotifier(ref.watch(notificationRepositoryProvider)),
    );
