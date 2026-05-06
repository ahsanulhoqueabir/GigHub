/// Dart extension methods for common operations.
extension StringExtensions on String {
  /// Capitalize the first letter of this string.
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }

  /// Extract initials (up to 2 chars) for avatar fallback.
  /// "John Doe" → "JD", "admin" → "A"
  String initials() {
    final parts = trim().split(RegExp(r'\s+'));
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    if (isNotEmpty) return this[0].toUpperCase();
    return '?';
  }

  /// Null-safe — returns null if string is empty after trimming.
  String? get nullIfEmpty => trim().isEmpty ? null : trim();

  /// Whether this string is null, empty, or only whitespace.
  bool get isBlank => trim().isEmpty;

  /// Whether this string is not blank.
  bool get isNotBlank => !isBlank;
}

extension DateTimeExtensions on DateTime {
  /// Whether this date is today.
  bool isSameDay(DateTime other) =>
      year == other.year && month == other.month && day == other.day;

  /// Whether this is the same calendar day as today.
  bool get isToday => isSameDay(DateTime.now());

  /// Whether this is the calendar day before today.
  bool get isYesterday {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return isSameDay(yesterday);
  }
}

extension BuildContextExtensions on dynamic {
  // Placeholder — extend BuildContext via a separate mixin or
  // directly in widget files using extension on BuildContext.
}
