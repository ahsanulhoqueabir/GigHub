/// Placeholder for push notification service (Phase 4).
///
/// Will integrate Firebase Cloud Messaging and local notifications.
class NotificationService {
  NotificationService._();

  static final instance = NotificationService._();

  /// Initialize FCM and request permissions.
  Future<void> initialize() async {
    // TODO: Phase 4 — Firebase messaging setup
  }

  /// Get the current FCM token.
  Future<String?> getToken() async {
    // TODO: Phase 4
    return null;
  }

  /// Handle a notification tap when the app is in the background.
  void onNotificationTap(void Function(Map<String, dynamic> data) handler) {
    // TODO: Phase 4
  }
}
