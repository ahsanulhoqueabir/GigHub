// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AuthResponseImpl _$$AuthResponseImplFromJson(Map<String, dynamic> json) =>
    _$AuthResponseImpl(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      expiresIn: json['expiresIn'] as String?,
      profile: json['profile'] == null
          ? null
          : Profile.fromJson(json['profile'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$AuthResponseImplToJson(_$AuthResponseImpl instance) =>
    <String, dynamic>{
      'accessToken': instance.accessToken,
      'refreshToken': instance.refreshToken,
      'expiresIn': instance.expiresIn,
      'profile': instance.profile,
    };

_$TokenPairImpl _$$TokenPairImplFromJson(Map<String, dynamic> json) =>
    _$TokenPairImpl(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
    );

Map<String, dynamic> _$$TokenPairImplToJson(_$TokenPairImpl instance) =>
    <String, dynamic>{
      'accessToken': instance.accessToken,
      'refreshToken': instance.refreshToken,
    };

_$PasswordLoginInputImpl _$$PasswordLoginInputImplFromJson(
  Map<String, dynamic> json,
) => _$PasswordLoginInputImpl(
  provider: json['provider'] as String? ?? 'password',
  email: json['email'] as String,
  password: json['password'] as String,
);

Map<String, dynamic> _$$PasswordLoginInputImplToJson(
  _$PasswordLoginInputImpl instance,
) => <String, dynamic>{
  'provider': instance.provider,
  'email': instance.email,
  'password': instance.password,
};

_$ProviderLoginInputImpl _$$ProviderLoginInputImplFromJson(
  Map<String, dynamic> json,
) => _$ProviderLoginInputImpl(
  provider: json['provider'] as String,
  firebaseIdToken: json['firebase_id_token'] as String,
);

Map<String, dynamic> _$$ProviderLoginInputImplToJson(
  _$ProviderLoginInputImpl instance,
) => <String, dynamic>{
  'provider': instance.provider,
  'firebase_id_token': instance.firebaseIdToken,
};

_$RegisterInputImpl _$$RegisterInputImplFromJson(Map<String, dynamic> json) =>
    _$RegisterInputImpl(
      displayName: json['display_name'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
      password: json['password'] as String,
    );

Map<String, dynamic> _$$RegisterInputImplToJson(_$RegisterInputImpl instance) =>
    <String, dynamic>{
      'display_name': instance.displayName,
      'username': instance.username,
      'email': instance.email,
      'password': instance.password,
    };

_$ForgotPasswordInputImpl _$$ForgotPasswordInputImplFromJson(
  Map<String, dynamic> json,
) => _$ForgotPasswordInputImpl(email: json['email'] as String);

Map<String, dynamic> _$$ForgotPasswordInputImplToJson(
  _$ForgotPasswordInputImpl instance,
) => <String, dynamic>{'email': instance.email};
