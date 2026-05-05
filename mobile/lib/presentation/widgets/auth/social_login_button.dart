import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:gig_hub/core/constants/app_sizes.dart';
import 'package:google_sign_in/google_sign_in.dart';

/// A Google-branded social login button.
///
/// Handles the Firebase Google sign-in flow and returns the Firebase ID token
/// via [onSuccess]. Errors are passed to [onError].
class SocialLoginButton extends StatefulWidget {
  final void Function(String firebaseIdToken) onSuccess;
  final void Function(String error)? onError;

  const SocialLoginButton.google({
    super.key,
    required this.onSuccess,
    this.onError,
  });

  @override
  State<SocialLoginButton> createState() => _SocialLoginButtonState();
}

class _SocialLoginButtonState extends State<SocialLoginButton> {
  bool _isLoading = false;

  Future<void> _handleGoogleSignIn() async {
    setState(() => _isLoading = true);

    try {
      // Trigger Google Sign-In
      final googleSignIn = GoogleSignIn(
        signInOption: SignInOption.standard,
        scopes: ['email', 'profile'],
      );

      GoogleSignInAccount? googleUser;

      try {
        googleUser = await googleSignIn.signIn();
      } catch (e) {
        if (mounted) {
          setState(() => _isLoading = false);
          widget.onError?.call('Google Sign-In was cancelled or failed');
        }
        return;
      }

      if (googleUser == null) {
        if (mounted) {
          setState(() => _isLoading = false);
          widget.onError?.call('Google Sign-In was cancelled');
        }
        return;
      }

      // Get authentication details
      final googleAuth = await googleUser.authentication;

      // Create Firebase credential
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Sign in to Firebase
      final userCredential = await FirebaseAuth.instance.signInWithCredential(
        credential,
      );

      // Get the Firebase ID token
      final firebaseIdToken = await userCredential.user!.getIdToken();

      if (firebaseIdToken == null) {
        if (mounted) {
          setState(() => _isLoading = false);
          widget.onError?.call('Failed to get authentication token');
        }
        return;
      }

      if (mounted) {
        setState(() => _isLoading = false);
        widget.onSuccess(firebaseIdToken);
      }
    } on FirebaseAuthException catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        widget.onError?.call(e.message ?? 'Authentication failed');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        widget.onError?.call('An unexpected error occurred');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: _isLoading ? null : _handleGoogleSignIn,
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(double.infinity, 48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        side: BorderSide(color: Theme.of(context).colorScheme.outline),
      ),
      child: _isLoading
          ? SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: Theme.of(context).colorScheme.primary,
              ),
            )
          : Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset(
                  'assets/icons/google.png',
                  width: 20,
                  height: 20,
                  errorBuilder: (_, __, ___) => const Icon(
                    Icons.g_mobiledata,
                    size: 24,
                    color: Colors.red,
                  ),
                ),
                const SizedBox(width: AppSizes.space12),
                const Text('Continue with Google'),
              ],
            ),
    );
  }
}
