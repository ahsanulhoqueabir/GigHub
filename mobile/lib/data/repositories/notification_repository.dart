import 'package:gighub/data/models/notification_model.dart';
import 'package:gighub/data/services/mock_data_service.dart';

/// Repository for fetching and managing notifications.
///
/// Currently backed by mock data. Will be replaced with a real API
/// repository when the backend is ready.
class NotificationRepository {
  final MockDataService _mock = MockDataService.instance;

  /// Fetch paginated notifications, optionally filtered by read status.
  Future<NotificationSummary> getNotifications({
    bool? unreadOnly,
    String? type,
    int page = 1,
    int limit = 20,
  }) async {
    await _mock.ensureLoaded();
    await _delay();

    var items = List<AppNotification>.from(_mock.notifications);

    // Sort by newest first
    items.sort((a, b) => b.createdAt.compareTo(a.createdAt));

    // Filter by unread
    if (unreadOnly == true) {
      items = items.where((n) => !n.isRead).toList();
    }

    // Filter by type
    if (type != null && type.isNotEmpty) {
      items = items.where((n) => n.type == type).toList();
    }

    final start = (page - 1) * limit;
    final pageItems = items.skip(start).take(limit).toList();
    final unreadCount = items.where((n) => !n.isRead).length;

    return NotificationSummary(
      notifications: pageItems,
      unreadCount: unreadCount,
    );
  }

  /// Get the total count of unread notifications.
  Future<int> getUnreadCount() async {
    await _mock.ensureLoaded();
    return _mock.notifications.where((n) => !n.isRead).length;
  }

  /// Mark a single notification as read by id.
  Future<void> markAsRead(String notificationId) async {
    await _mock.ensureLoaded();
    await _delay(150);
    final index = _mock.notifications.indexWhere((n) => n.id == notificationId);
    if (index != -1) {
      _mock.notifications[index] = _mock.notifications[index].copyWith(
        isRead: true,
      );
    }
  }

  /// Mark all notifications as read.
  Future<void> markAllAsRead() async {
    await _mock.ensureLoaded();
    await _delay(200);
    for (var i = 0; i < _mock.notifications.length; i++) {
      _mock.notifications[i] = _mock.notifications[i].copyWith(isRead: true);
    }
  }

  Future<void> _delay([int ms = 300]) {
    return Future.delayed(Duration(milliseconds: ms));
  }
}
