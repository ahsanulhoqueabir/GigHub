import 'dart:async';

/// A utility that debounces rapid function calls.
///
/// Useful for search-as-you-type to avoid excessive API calls.
class Debouncer {
  final Duration delay;
  Timer? _timer;

  Debouncer({this.delay = const Duration(milliseconds: 500)});

  /// Call [action] after [delay] has elapsed since the last call.
  /// If called again before the delay, the previous timer is cancelled.
  void call(void Function() action) {
    _timer?.cancel();
    _timer = Timer(delay, action);
  }

  /// Cancel any pending debounced call.
  void cancel() {
    _timer?.cancel();
    _timer = null;
  }

  /// Whether a debounced call is currently pending.
  bool get isPending => _timer?.isActive ?? false;
}
