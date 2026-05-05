/// Static strings and labels for the GigHub app.
abstract class AppStrings {
  AppStrings._();

  static const String appName = 'GigHub';
  static const String tagline = 'Where talent meets opportunity';

  // ── Auth ─────────────────────────────────────────────
  static const String login = 'Login';
  static const String register = 'Register';
  static const String forgotPassword = 'Forgot Password?';
  static const String dontHaveAccount = "Don't have an account? ";
  static const String alreadyHaveAccount = 'Already have an account? ';
  static const String signUp = 'Sign Up';
  static const String signIn = 'Sign In';
  static const String continueWithGoogle = 'Continue with Google';
  static const String sendResetLink = 'Send Reset Link';
  static const String checkYourEmail = 'Check your email';
  static const String resetLinkSent =
      'If an account exists with that email, we have sent a password reset link.';

  // ── Form Labels ──────────────────────────────────────
  static const String email = 'Email';
  static const String password = 'Password';
  static const String confirmPassword = 'Confirm Password';
  static const String displayName = 'Display Name';
  static const String username = 'Username';
  static const String bio = 'Bio';
  static const String skills = 'Skills';
  static const String availabilityStatus = 'Availability';

  // ── Validation ───────────────────────────────────────
  static const String required = 'This field is required';
  static const String invalidEmail = 'Please enter a valid email';
  static const String passwordTooShort =
      'Password must be at least 8 characters';
  static const String passwordMismatch = 'Passwords do not match';
  static const String invalidUsername =
      'Username must be 3-20 characters, alphanumeric + underscore';

  // ── General ──────────────────────────────────────────
  static const String retry = 'Retry';
  static const String save = 'Save';
  static const String cancel = 'Cancel';
  static const String delete = 'Delete';
  static const String edit = 'Edit';
  static const String logout = 'Logout';
  static const String settings = 'Settings';
  static const String noInternet = 'No internet connection';
  static const String somethingWentWrong = 'Something went wrong';
  static const String loading = 'Loading...';
  static const String noData = 'Nothing to show yet';
  static const String search = 'Search';
}
