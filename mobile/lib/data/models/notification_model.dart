/// Represents a single notification in the GigHub app.
///
/// Used for displaying in-app notifications with different types,
/// read/unread states, and linked references.
class AppNotification {
  final String id;
  final String
  type; // order_update, proposal_received, proposal_accepted, new_message, review_received, payment_released, gig_milestone, new_follower, system, order_completed
  final String title;
  final String message;
  final String? actorId; // Who triggered the notification
  final String? referenceId; // Related gig/job/proposal id
  final String? referenceType; // gig, job, proposal
  final bool isRead;
  final DateTime createdAt;

  const AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    this.actorId,
    this.referenceId,
    this.referenceType,
    this.isRead = false,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      actorId: json['actorId'] as String?,
      referenceId: json['referenceId'] as String?,
      referenceType: json['referenceType'] as String?,
      isRead: json['isRead'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  /// Creates a copy with optional field overrides.
  AppNotification copyWith({
    String? id,
    String? type,
    String? title,
    String? message,
    String? actorId,
    String? referenceId,
    String? referenceType,
    bool? isRead,
    DateTime? createdAt,
  }) {
    return AppNotification(
      id: id ?? this.id,
      type: type ?? this.type,
      title: title ?? this.title,
      message: message ?? this.message,
      actorId: actorId ?? this.actorId,
      referenceId: referenceId ?? this.referenceId,
      referenceType: referenceType ?? this.referenceType,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

/// Summary with count of unread notifications.
class NotificationSummary {
  final List<AppNotification> notifications;
  final int unreadCount;

  const NotificationSummary({
    required this.notifications,
    this.unreadCount = 0,
  });
}

/// Query parameters for filtering notifications.
class NotificationQueryParams {
  final bool? unreadOnly;
  final String? type;
  final int page;
  final int limit;

  const NotificationQueryParams({
    this.unreadOnly,
    this.type,
    this.page = 1,
    this.limit = 20,
  });
}
