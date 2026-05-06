import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/core/constants/app_strings.dart';
import 'package:gighub/core/network/api_exceptions.dart';
import 'package:gighub/core/utils/validators.dart';
import 'package:gighub/data/models/auth_model.dart';
import 'package:gighub/data/providers/auth_provider.dart';
import 'package:gighub/presentation/widgets/auth/social_login_button.dart';
import 'package:gighub/presentation/widgets/common/gh_button.dart';
import 'package:gighub/presentation/widgets/common/gh_text_field.dart';

/// Registration screen for creating a new account.
class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _displayNameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _displayNameController.dispose();
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final input = RegisterInput(
        displayName: _displayNameController.text.trim(),
        username: _usernameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );

      await ref.read(authProvider.notifier).register(input);
      if (mounted) {
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_formatError(e)),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
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
    return 'Registration failed — please try again';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(leading: const BackButton()),
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
                  Text(
                    'Create Account',
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: AppSizes.space8),
                  Text(
                    'Join GigHub and start your freelancing journey.',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: AppSizes.space32),

                  // Display Name
                  GhTextField(
                    label: AppStrings.displayName,
                    hint: 'John Doe',
                    controller: _displayNameController,
                    textInputAction: TextInputAction.next,
                    validator: (v) => Validators.required(v, 'Display name'),
                    prefixIcon: const Icon(Icons.person_outline),
                  ),
                  const SizedBox(height: AppSizes.space16),

                  // Username
                  GhTextField(
                    label: AppStrings.username,
                    hint: 'johndoe',
                    controller: _usernameController,
                    textInputAction: TextInputAction.next,
                    validator: Validators.username,
                    prefixIcon: const Icon(Icons.alternate_email),
                  ),
                  const SizedBox(height: AppSizes.space16),

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
                  GhTextField(
                    label: AppStrings.password,
                    hint: 'Min. 8 characters',
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    textInputAction: TextInputAction.next,
                    validator: Validators.password,
                    prefixIcon: const Icon(Icons.lock_outlined),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_off
                            : Icons.visibility,
                      ),
                      onPressed: () =>
                          setState(() => _obscurePassword = !_obscurePassword),
                    ),
                  ),
                  const SizedBox(height: AppSizes.space16),

                  // Confirm Password
                  GhTextField(
                    label: AppStrings.confirmPassword,
                    controller: _confirmPasswordController,
                    obscureText: _obscureConfirm,
                    textInputAction: TextInputAction.done,
                    validator: (v) {
                      final required = Validators.required(
                        v,
                        'Confirm password',
                      );
                      if (required != null) return required;
                      return Validators.match(
                        v,
                        _passwordController.text,
                        'Passwords',
                      );
                    },
                    prefixIcon: const Icon(Icons.lock_outlined),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscureConfirm
                            ? Icons.visibility_off
                            : Icons.visibility,
                      ),
                      onPressed: () =>
                          setState(() => _obscureConfirm = !_obscureConfirm),
                    ),
                  ),
                  const SizedBox(height: AppSizes.space24),

                  // Register Button
                  GhButton.primary(
                    label: 'Create Account',
                    isLoading: _isLoading,
                    onPressed: _handleRegister,
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

                  // Google Sign Up
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
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Google sign up failed'),
                              backgroundColor: theme.colorScheme.error,
                            ),
                          );
                        }
                      } finally {
                        if (mounted) setState(() => _isLoading = false);
                      }
                    },
                    onError: (error) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(error),
                          backgroundColor: theme.colorScheme.error,
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: AppSizes.space24),

                  // Login link
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        AppStrings.alreadyHaveAccount,
                        style: theme.textTheme.bodyMedium,
                      ),
                      GestureDetector(
                        onTap: () => context.push('/auth/login'),
                        child: Text(
                          AppStrings.signIn,
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
