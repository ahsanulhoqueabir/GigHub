/// Centralized API endpoint constants.
///
/// All endpoint paths are defined here to avoid hard-coded strings
/// scattered throughout repositories.
class ApiConstants {
  ApiConstants._();

  // ── Auth ──────────────────────────────────────────────
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refreshToken = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String forgotPassword = '/auth/forgot-password';

  // ── Profiles ─────────────────────────────────────────
  static const String myProfile = '/profiles/me';
  static String publicProfile(String username) => '/profiles/$username';
  static const String updateProfile = '/profiles/me';
  static const String updateAvatar = '/profiles/me/avatar';

  // ── Upload ───────────────────────────────────────────
  static const String uploadImage = '/upload/image';

  // ── Categories ───────────────────────────────────────
  static const String categories = '/categories';

  // ── Gigs (Phase 2) ───────────────────────────────────
  static const String gigs = '/gigs';
  static String gig(String id) => '/gigs/$id';

  // ── Jobs (Phase 2) ───────────────────────────────────
  static const String jobs = '/jobs';
  static String job(String id) => '/jobs/$id';

  // ── Proposals (Phase 2) ──────────────────────────────
  static const String proposals = '/proposals';

  // ── Orders (Phase 3) ─────────────────────────────────
  static const String orders = '/orders';
  static String order(String id) => '/orders/$id';

  // ── Payments / Wallet (Phase 3) ──────────────────────
  static const String balance = '/payments/balance';
  static const String initiatePayment = '/payments/initiate';

  // ── Escrow (Phase 3) ─────────────────────────────────
  static String escrowDetail(String id) => '/escrow/$id';

  // ── Withdrawals (Phase 3) ────────────────────────────
  static const String withdrawal = '/withdrawals';

  // ── Search ───────────────────────────────────────────
  static const String searchGigs = '/search/gigs';
  static const String searchJobs = '/search/jobs';
  static const String searchProfiles = '/search/profiles';
}
