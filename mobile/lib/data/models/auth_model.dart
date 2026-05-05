import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:gig_hub/data/models/profile_model.dart';

part 'auth_model.freezed.dart';
part 'auth_model.g.dart';

// ── Auth Response ─────────────────────────────────────

@freezed
class AuthResponse with _$AuthResponse {
  const factory AuthResponse({
    required String accessToken,
    required String refreshToken,
    required int expiresIn,
    required Profile profile,
  }) = _AuthResponse;

  factory AuthResponse.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseFromJson(json);
}

// ── Token Pair (for refresh) ──────────────────────────

@freezed
class TokenPair with _$TokenPair {
  const factory TokenPair({
    required String accessToken,
    required String refreshToken,
  }) = _TokenPair;

  factory TokenPair.fromJson(Map<String, dynamic> json) =>
      _$TokenPairFromJson(json);
}

// ── Login Input ───────────────────────────────────────

@freezed
class PasswordLoginInput with _$PasswordLoginInput {
  @JsonSerializable(fieldRename: FieldRename.snake)
  const factory PasswordLoginInput({
    @Default('password') String provider,
    required String email,
    required String password,
  }) = _PasswordLoginInput;

  factory PasswordLoginInput.fromJson(Map<String, dynamic> json) =>
      _$PasswordLoginInputFromJson(json);

  const PasswordLoginInput._();
}

@freezed
class ProviderLoginInput with _$ProviderLoginInput {
  @JsonSerializable(fieldRename: FieldRename.snake)
  const factory ProviderLoginInput({
    required String provider,
    @JsonKey(name: 'firebase_id_token') required String firebaseIdToken,
  }) = _ProviderLoginInput;

  factory ProviderLoginInput.fromJson(Map<String, dynamic> json) =>
      _$ProviderLoginInputFromJson(json);

  const ProviderLoginInput._();
}

// ── Register Input ────────────────────────────────────

@freezed
class RegisterInput with _$RegisterInput {
  @JsonSerializable(fieldRename: FieldRename.snake)
  const factory RegisterInput({
    @JsonKey(name: 'display_name') required String displayName,
    required String username,
    required String email,
    required String password,
  }) = _RegisterInput;

  factory RegisterInput.fromJson(Map<String, dynamic> json) =>
      _$RegisterInputFromJson(json);

  const RegisterInput._();
}

// ── Forgot Password Input ─────────────────────────────

@freezed
class ForgotPasswordInput with _$ForgotPasswordInput {
  const factory ForgotPasswordInput({required String email}) =
      _ForgotPasswordInput;

  factory ForgotPasswordInput.fromJson(Map<String, dynamic> json) =>
      _$ForgotPasswordInputFromJson(json);

  const ForgotPasswordInput._();
}
