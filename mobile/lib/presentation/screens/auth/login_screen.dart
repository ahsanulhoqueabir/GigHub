import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/core/constants/app_strings.dart';
import 'package:gighub/core/network/api_exceptions.dart';
import 'package:gighub/core/utils/validators.dart';
import 'package:gighub/data/providers/auth_provider.dart';
import 'package:gighub/presentation/widgets/auth/social_login_button.dart';
import 'package:gighub/presentation/widgets/common/gh_button.dart';
import 'package:gighub/presentation/widgets/common/gh_text_field.dart';
import 'package:gighub/presentation/widgets/common/gh_toast.dart';

/// Login screen with email/password and social login options.
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await ref
          .read(authProvider.notifier)
          .login(_emailController.text.trim(), _passwordController.text);
      if (mounted) {
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        GhToast.show(
          context,
          message: _formatError(e),
          type: GhToastType.error,
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _formatError(Object error) {
    if (error is ApiException) {
      return error.message;
    }
    final message = error.toString();
    if (message.contains('NetworkException')) {
      return 'Network error — please try again';
    }
    return 'Login failed — please try again';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: AppSizes.space24),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.hub, color: Colors.white, size: 36),
                  ),
                  const SizedBox(height: AppSizes.space24),
                  Text(
                    AppStrings.signIn,
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: AppSizes.space8),
                  Text(
                    'Welcome back! Sign in to continue.',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: AppSizes.space32),

                  // Email
                  GhTextField(
                    label: AppStrings.email,
                    hint: 'you@example.com',
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    validator: Validators.email,
                    prefixIcon: const Icon(Icons.email_outlined),
                  ),
                  const SizedBox(height: AppSizes.space16),

                  // Password
                  GhPasswordField(
                    label: AppStrings.password,
                    controller: _passwordController,
                    textInputAction: TextInputAction.done,
                    validator: Validators.password,
                    onSubmitted: (_) => _handleLogin(),
                  ),
                  const SizedBox(height: AppSizes.space8),

                  // Forgot Password
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () => context.push('/auth/forgot-password'),
                      child: Text(AppStrings.forgotPassword),
                    ),
                  ),
                  const SizedBox(height: AppSizes.space16),

                  // Login Button
                  GhButton.primary(
                    label: AppStrings.signIn,
                    isLoading: _isLoading,
                    onPressed: _handleLogin,
                  ),
                  const SizedBox(height: AppSizes.space20),

                  // Divider
                  Row(
                    children: [
                      const Expanded(child: Divider()),
                      Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSizes.space16,
                        ),
                        child: Text(
                          'or',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ),
                      const Expanded(child: Divider()),
                    ],
                  ),
                  const SizedBox(height: AppSizes.space20),

                  // Google Login
                  SocialLoginButton.google(
                    onSuccess: (firebaseIdToken) async {
                      setState(() => _isLoading = true);
                      try {
                        await ref
                            .read(authProvider.notifier)
                            .loginWithProvider('google', firebaseIdToken);
                        if (mounted) context.go('/home');
                      } catch (e) {
                        if (mounted) {
                          GhToast.show(
                            context,
                            message: 'Google login failed',
                            type: GhToastType.error,
                          );
                        }
                      } finally {
                        if (mounted) setState(() => _isLoading = false);
                      }
                    },
                    onError: (error) {
                      GhToast.show(
                        context,
                        message: error,
                        type: GhToastType.error,
                      );
                    },
                  ),
                  const SizedBox(height: AppSizes.space24),

                  // Register link
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        AppStrings.dontHaveAccount,
                        style: theme.textTheme.bodyMedium,
                      ),
                      GestureDetector(
                        onTap: () => context.push('/auth/register'),
                        child: Text(
                          AppStrings.signUp,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSizes.space16),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
