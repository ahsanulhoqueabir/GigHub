import 'package:intl/intl.dart';

/// Common formatting utilities for the GigHub app.
class Formatters {
  Formatters._();

  static final _priceFormat = NumberFormat('#,##0', 'en_US');
  static final _dateFormat = DateFormat('MMM d, yyyy');
  static final _dateTimeFormat = DateFormat('MMM d, yyyy h:mm a');
  static final _shortDate = DateFormat('MMM d');

  /// Format a number as BDT price (e.g., "৳1,500").
  static String price(num amount) => '৳${_priceFormat.format(amount)}';

  /// Format a number without currency symbol (e.g., "1,500").
  static String number(num amount) => _priceFormat.format(amount);

  /// Format a DateTime to "Jan 15, 2024".
  static String date(DateTime date) => _dateFormat.format(date);

  /// Format a DateTime to "Jan 15, 2024 3:30 PM".
  static String dateTime(DateTime date) => _dateTimeFormat.format(date);

  /// Format to short date (e.g., "Jan 15").
  static String shortDate(DateTime date) => _shortDate.format(date);

  /// Returns a human-readable relative time string (e.g., "2 hours ago").
  static String relativeTime(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) {
      final m = diff.inMinutes;
      return '$m ${m == 1 ? 'minute' : 'minutes'} ago';
    }
    if (diff.inHours < 24) {
      final h = diff.inHours;
      return '$h ${h == 1 ? 'hour' : 'hours'} ago';
    }
    if (diff.inDays < 7) {
      final d = diff.inDays;
      return '$d ${d == 1 ? 'day' : 'days'} ago';
    }
    if (diff.inDays < 30) {
      final w = (diff.inDays / 7).floor();
      return '$w ${w == 1 ? 'week' : 'weeks'} ago';
    }
    if (diff.inDays < 365) {
      final m = (diff.inDays / 30).floor();
      return '$m ${m == 1 ? 'month' : 'months'} ago';
    }
    final y = (diff.inDays / 365).floor();
    return '$y ${y == 1 ? 'year' : 'years'} ago';
  }

  /// Format a file size in bytes to human readable (e.g., "2.5 MB").
  static String fileSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    if (bytes < 1024 * 1024 * 1024) {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }

  /// Truncate text to a max length with ellipsis.
  static String truncate(String text, int maxLength) {
    if (text.length <= maxLength) return text;
    return '${text.substring(0, maxLength)}...';
  }
}
