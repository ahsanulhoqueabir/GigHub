// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'auth_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

AuthResponse _$AuthResponseFromJson(Map<String, dynamic> json) {
  return _AuthResponse.fromJson(json);
}

/// @nodoc
mixin _$AuthResponse {
  String get accessToken => throw _privateConstructorUsedError;
  String get refreshToken => throw _privateConstructorUsedError;
  int get expiresIn => throw _privateConstructorUsedError;
  Profile get profile => throw _privateConstructorUsedError;

  /// Serializes this AuthResponse to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AuthResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AuthResponseCopyWith<AuthResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AuthResponseCopyWith<$Res> {
  factory $AuthResponseCopyWith(
    AuthResponse value,
    $Res Function(AuthResponse) then,
  ) = _$AuthResponseCopyWithImpl<$Res, AuthResponse>;
  @useResult
  $Res call({
    String accessToken,
    String refreshToken,
    int expiresIn,
    Profile profile,
  });

  $ProfileCopyWith<$Res> get profile;
}

/// @nodoc
class _$AuthResponseCopyWithImpl<$Res, $Val extends AuthResponse>
    implements $AuthResponseCopyWith<$Res> {
  _$AuthResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AuthResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? accessToken = null,
    Object? refreshToken = null,
    Object? expiresIn = null,
    Object? profile = null,
  }) {
    return _then(
      _value.copyWith(
            accessToken: null == accessToken
                ? _value.accessToken
                : accessToken // ignore: cast_nullable_to_non_nullable
                      as String,
            refreshToken: null == refreshToken
                ? _value.refreshToken
                : refreshToken // ignore: cast_nullable_to_non_nullable
                      as String,
            expiresIn: null == expiresIn
                ? _value.expiresIn
                : expiresIn // ignore: cast_nullable_to_non_nullable
                      as int,
            profile: null == profile
                ? _value.profile
                : profile // ignore: cast_nullable_to_non_nullable
                      as Profile,
          )
          as $Val,
    );
  }

  /// Create a copy of AuthResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $ProfileCopyWith<$Res> get profile {
    return $ProfileCopyWith<$Res>(_value.profile, (value) {
      return _then(_value.copyWith(profile: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$AuthResponseImplCopyWith<$Res>
    implements $AuthResponseCopyWith<$Res> {
  factory _$$AuthResponseImplCopyWith(
    _$AuthResponseImpl value,
    $Res Function(_$AuthResponseImpl) then,
  ) = __$$AuthResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String accessToken,
    String refreshToken,
    int expiresIn,
    Profile profile,
  });

  @override
  $ProfileCopyWith<$Res> get profile;
}

/// @nodoc
class __$$AuthResponseImplCopyWithImpl<$Res>
    extends _$AuthResponseCopyWithImpl<$Res, _$AuthResponseImpl>
    implements _$$AuthResponseImplCopyWith<$Res> {
  __$$AuthResponseImplCopyWithImpl(
    _$AuthResponseImpl _value,
    $Res Function(_$AuthResponseImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of AuthResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? accessToken = null,
    Object? refreshToken = null,
    Object? expiresIn = null,
    Object? profile = null,
  }) {
    return _then(
      _$AuthResponseImpl(
        accessToken: null == accessToken
            ? _value.accessToken
            : accessToken // ignore: cast_nullable_to_non_nullable
                  as String,
        refreshToken: null == refreshToken
            ? _value.refreshToken
            : refreshToken // ignore: cast_nullable_to_non_nullable
                  as String,
        expiresIn: null == expiresIn
            ? _value.expiresIn
            : expiresIn // ignore: cast_nullable_to_non_nullable
                  as int,
        profile: null == profile
            ? _value.profile
            : profile // ignore: cast_nullable_to_non_nullable
                  as Profile,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$AuthResponseImpl implements _AuthResponse {
  const _$AuthResponseImpl({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
    required this.profile,
  });

  factory _$AuthResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$AuthResponseImplFromJson(json);

  @override
  final String accessToken;
  @override
  final String refreshToken;
  @override
  final int expiresIn;
  @override
  final Profile profile;

  @override
  String toString() {
    return 'AuthResponse(accessToken: $accessToken, refreshToken: $refreshToken, expiresIn: $expiresIn, profile: $profile)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AuthResponseImpl &&
            (identical(other.accessToken, accessToken) ||
                other.accessToken == accessToken) &&
            (identical(other.refreshToken, refreshToken) ||
                other.refreshToken == refreshToken) &&
            (identical(other.expiresIn, expiresIn) ||
                other.expiresIn == expiresIn) &&
            (identical(other.profile, profile) || other.profile == profile));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, accessToken, refreshToken, expiresIn, profile);

  /// Create a copy of AuthResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AuthResponseImplCopyWith<_$AuthResponseImpl> get copyWith =>
      __$$AuthResponseImplCopyWithImpl<_$AuthResponseImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AuthResponseImplToJson(this);
  }
}

abstract class _AuthResponse implements AuthResponse {
  const factory _AuthResponse({
    required final String accessToken,
    required final String refreshToken,
    required final int expiresIn,
    required final Profile profile,
  }) = _$AuthResponseImpl;

  factory _AuthResponse.fromJson(Map<String, dynamic> json) =
      _$AuthResponseImpl.fromJson;

  @override
  String get accessToken;
  @override
  String get refreshToken;
  @override
  int get expiresIn;
  @override
  Profile get profile;

  /// Create a copy of AuthResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AuthResponseImplCopyWith<_$AuthResponseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

TokenPair _$TokenPairFromJson(Map<String, dynamic> json) {
  return _TokenPair.fromJson(json);
}

/// @nodoc
mixin _$TokenPair {
  String get accessToken => throw _privateConstructorUsedError;
  String get refreshToken => throw _privateConstructorUsedError;

  /// Serializes this TokenPair to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of TokenPair
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $TokenPairCopyWith<TokenPair> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TokenPairCopyWith<$Res> {
  factory $TokenPairCopyWith(TokenPair value, $Res Function(TokenPair) then) =
      _$TokenPairCopyWithImpl<$Res, TokenPair>;
  @useResult
  $Res call({String accessToken, String refreshToken});
}

/// @nodoc
class _$TokenPairCopyWithImpl<$Res, $Val extends TokenPair>
    implements $TokenPairCopyWith<$Res> {
  _$TokenPairCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of TokenPair
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? accessToken = null, Object? refreshToken = null}) {
    return _then(
      _value.copyWith(
            accessToken: null == accessToken
                ? _value.accessToken
                : accessToken // ignore: cast_nullable_to_non_nullable
                      as String,
            refreshToken: null == refreshToken
                ? _value.refreshToken
                : refreshToken // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$TokenPairImplCopyWith<$Res>
    implements $TokenPairCopyWith<$Res> {
  factory _$$TokenPairImplCopyWith(
    _$TokenPairImpl value,
    $Res Function(_$TokenPairImpl) then,
  ) = __$$TokenPairImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String accessToken, String refreshToken});
}

/// @nodoc
class __$$TokenPairImplCopyWithImpl<$Res>
    extends _$TokenPairCopyWithImpl<$Res, _$TokenPairImpl>
    implements _$$TokenPairImplCopyWith<$Res> {
  __$$TokenPairImplCopyWithImpl(
    _$TokenPairImpl _value,
    $Res Function(_$TokenPairImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of TokenPair
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? accessToken = null, Object? refreshToken = null}) {
    return _then(
      _$TokenPairImpl(
        accessToken: null == accessToken
            ? _value.accessToken
            : accessToken // ignore: cast_nullable_to_non_nullable
                  as String,
        refreshToken: null == refreshToken
            ? _value.refreshToken
            : refreshToken // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$TokenPairImpl implements _TokenPair {
  const _$TokenPairImpl({
    required this.accessToken,
    required this.refreshToken,
  });

  factory _$TokenPairImpl.fromJson(Map<String, dynamic> json) =>
      _$$TokenPairImplFromJson(json);

  @override
  final String accessToken;
  @override
  final String refreshToken;

  @override
  String toString() {
    return 'TokenPair(accessToken: $accessToken, refreshToken: $refreshToken)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$TokenPairImpl &&
            (identical(other.accessToken, accessToken) ||
                other.accessToken == accessToken) &&
            (identical(other.refreshToken, refreshToken) ||
                other.refreshToken == refreshToken));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, accessToken, refreshToken);

  /// Create a copy of TokenPair
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$TokenPairImplCopyWith<_$TokenPairImpl> get copyWith =>
      __$$TokenPairImplCopyWithImpl<_$TokenPairImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$TokenPairImplToJson(this);
  }
}

abstract class _TokenPair implements TokenPair {
  const factory _TokenPair({
    required final String accessToken,
    required final String refreshToken,
  }) = _$TokenPairImpl;

  factory _TokenPair.fromJson(Map<String, dynamic> json) =
      _$TokenPairImpl.fromJson;

  @override
  String get accessToken;
  @override
  String get refreshToken;

  /// Create a copy of TokenPair
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$TokenPairImplCopyWith<_$TokenPairImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

PasswordLoginInput _$PasswordLoginInputFromJson(Map<String, dynamic> json) {
  return _PasswordLoginInput.fromJson(json);
}

/// @nodoc
mixin _$PasswordLoginInput {
  String get provider => throw _privateConstructorUsedError;
  String get email => throw _privateConstructorUsedError;
  String get password => throw _privateConstructorUsedError;

  /// Serializes this PasswordLoginInput to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of PasswordLoginInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PasswordLoginInputCopyWith<PasswordLoginInput> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PasswordLoginInputCopyWith<$Res> {
  factory $PasswordLoginInputCopyWith(
    PasswordLoginInput value,
    $Res Function(PasswordLoginInput) then,
  ) = _$PasswordLoginInputCopyWithImpl<$Res, PasswordLoginInput>;
  @useResult
  $Res call({String provider, String email, String password});
}

/// @nodoc
class _$PasswordLoginInputCopyWithImpl<$Res, $Val extends PasswordLoginInput>
    implements $PasswordLoginInputCopyWith<$Res> {
  _$PasswordLoginInputCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PasswordLoginInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? provider = null,
    Object? email = null,
    Object? password = null,
  }) {
    return _then(
      _value.copyWith(
            provider: null == provider
                ? _value.provider
                : provider // ignore: cast_nullable_to_non_nullable
                      as String,
            email: null == email
                ? _value.email
                : email // ignore: cast_nullable_to_non_nullable
                      as String,
            password: null == password
                ? _value.password
                : password // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$PasswordLoginInputImplCopyWith<$Res>
    implements $PasswordLoginInputCopyWith<$Res> {
  factory _$$PasswordLoginInputImplCopyWith(
    _$PasswordLoginInputImpl value,
    $Res Function(_$PasswordLoginInputImpl) then,
  ) = __$$PasswordLoginInputImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String provider, String email, String password});
}

/// @nodoc
class __$$PasswordLoginInputImplCopyWithImpl<$Res>
    extends _$PasswordLoginInputCopyWithImpl<$Res, _$PasswordLoginInputImpl>
    implements _$$PasswordLoginInputImplCopyWith<$Res> {
  __$$PasswordLoginInputImplCopyWithImpl(
    _$PasswordLoginInputImpl _value,
    $Res Function(_$PasswordLoginInputImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of PasswordLoginInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? provider = null,
    Object? email = null,
    Object? password = null,
  }) {
    return _then(
      _$PasswordLoginInputImpl(
        provider: null == provider
            ? _value.provider
            : provider // ignore: cast_nullable_to_non_nullable
                  as String,
        email: null == email
            ? _value.email
            : email // ignore: cast_nullable_to_non_nullable
                  as String,
        password: null == password
            ? _value.password
            : password // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc

@JsonSerializable(fieldRename: FieldRename.snake)
class _$PasswordLoginInputImpl extends _PasswordLoginInput {
  const _$PasswordLoginInputImpl({
    this.provider = 'password',
    required this.email,
    required this.password,
  }) : super._();

  factory _$PasswordLoginInputImpl.fromJson(Map<String, dynamic> json) =>
      _$$PasswordLoginInputImplFromJson(json);

  @override
  @JsonKey()
  final String provider;
  @override
  final String email;
  @override
  final String password;

  @override
  String toString() {
    return 'PasswordLoginInput(provider: $provider, email: $email, password: $password)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PasswordLoginInputImpl &&
            (identical(other.provider, provider) ||
                other.provider == provider) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.password, password) ||
                other.password == password));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, provider, email, password);

  /// Create a copy of PasswordLoginInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PasswordLoginInputImplCopyWith<_$PasswordLoginInputImpl> get copyWith =>
      __$$PasswordLoginInputImplCopyWithImpl<_$PasswordLoginInputImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$PasswordLoginInputImplToJson(this);
  }
}

abstract class _PasswordLoginInput extends PasswordLoginInput {
  const factory _PasswordLoginInput({
    final String provider,
    required final String email,
    required final String password,
  }) = _$PasswordLoginInputImpl;
  const _PasswordLoginInput._() : super._();

  factory _PasswordLoginInput.fromJson(Map<String, dynamic> json) =
      _$PasswordLoginInputImpl.fromJson;

  @override
  String get provider;
  @override
  String get email;
  @override
  String get password;

  /// Create a copy of PasswordLoginInput
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PasswordLoginInputImplCopyWith<_$PasswordLoginInputImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ProviderLoginInput _$ProviderLoginInputFromJson(Map<String, dynamic> json) {
  return _ProviderLoginInput.fromJson(json);
}

/// @nodoc
mixin _$ProviderLoginInput {
  String get provider => throw _privateConstructorUsedError;
  @JsonKey(name: 'firebase_id_token')
  String get firebaseIdToken => throw _privateConstructorUsedError;

  /// Serializes this ProviderLoginInput to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ProviderLoginInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ProviderLoginInputCopyWith<ProviderLoginInput> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ProviderLoginInputCopyWith<$Res> {
  factory $ProviderLoginInputCopyWith(
    ProviderLoginInput value,
    $Res Function(ProviderLoginInput) then,
  ) = _$ProviderLoginInputCopyWithImpl<$Res, ProviderLoginInput>;
  @useResult
  $Res call({
    String provider,
    @JsonKey(name: 'firebase_id_token') String firebaseIdToken,
  });
}

/// @nodoc
class _$ProviderLoginInputCopyWithImpl<$Res, $Val extends ProviderLoginInput>
    implements $ProviderLoginInputCopyWith<$Res> {
  _$ProviderLoginInputCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ProviderLoginInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? provider = null, Object? firebaseIdToken = null}) {
    return _then(
      _value.copyWith(
            provider: null == provider
                ? _value.provider
                : provider // ignore: cast_nullable_to_non_nullable
                      as String,
            firebaseIdToken: null == firebaseIdToken
                ? _value.firebaseIdToken
                : firebaseIdToken // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ProviderLoginInputImplCopyWith<$Res>
    implements $ProviderLoginInputCopyWith<$Res> {
  factory _$$ProviderLoginInputImplCopyWith(
    _$ProviderLoginInputImpl value,
    $Res Function(_$ProviderLoginInputImpl) then,
  ) = __$$ProviderLoginInputImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String provider,
    @JsonKey(name: 'firebase_id_token') String firebaseIdToken,
  });
}

/// @nodoc
class __$$ProviderLoginInputImplCopyWithImpl<$Res>
    extends _$ProviderLoginInputCopyWithImpl<$Res, _$ProviderLoginInputImpl>
    implements _$$ProviderLoginInputImplCopyWith<$Res> {
  __$$ProviderLoginInputImplCopyWithImpl(
    _$ProviderLoginInputImpl _value,
    $Res Function(_$ProviderLoginInputImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ProviderLoginInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? provider = null, Object? firebaseIdToken = null}) {
    return _then(
      _$ProviderLoginInputImpl(
        provider: null == provider
            ? _value.provider
            : provider // ignore: cast_nullable_to_non_nullable
                  as String,
        firebaseIdToken: null == firebaseIdToken
            ? _value.firebaseIdToken
            : firebaseIdToken // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc

@JsonSerializable(fieldRename: FieldRename.snake)
class _$ProviderLoginInputImpl extends _ProviderLoginInput {
  const _$ProviderLoginInputImpl({
    required this.provider,
    @JsonKey(name: 'firebase_id_token') required this.firebaseIdToken,
  }) : super._();

  factory _$ProviderLoginInputImpl.fromJson(Map<String, dynamic> json) =>
      _$$ProviderLoginInputImplFromJson(json);

  @override
  final String provider;
  @override
  @JsonKey(name: 'firebase_id_token')
  final String firebaseIdToken;

  @override
  String toString() {
    return 'ProviderLoginInput(provider: $provider, firebaseIdToken: $firebaseIdToken)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ProviderLoginInputImpl &&
            (identical(other.provider, provider) ||
                other.provider == provider) &&
            (identical(other.firebaseIdToken, firebaseIdToken) ||
                other.firebaseIdToken == firebaseIdToken));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, provider, firebaseIdToken);

  /// Create a copy of ProviderLoginInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ProviderLoginInputImplCopyWith<_$ProviderLoginInputImpl> get copyWith =>
      __$$ProviderLoginInputImplCopyWithImpl<_$ProviderLoginInputImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$ProviderLoginInputImplToJson(this);
  }
}

abstract class _ProviderLoginInput extends ProviderLoginInput {
  const factory _ProviderLoginInput({
    required final String provider,
    @JsonKey(name: 'firebase_id_token') required final String firebaseIdToken,
  }) = _$ProviderLoginInputImpl;
  const _ProviderLoginInput._() : super._();

  factory _ProviderLoginInput.fromJson(Map<String, dynamic> json) =
      _$ProviderLoginInputImpl.fromJson;

  @override
  String get provider;
  @override
  @JsonKey(name: 'firebase_id_token')
  String get firebaseIdToken;

  /// Create a copy of ProviderLoginInput
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ProviderLoginInputImplCopyWith<_$ProviderLoginInputImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

RegisterInput _$RegisterInputFromJson(Map<String, dynamic> json) {
  return _RegisterInput.fromJson(json);
}

/// @nodoc
mixin _$RegisterInput {
  @JsonKey(name: 'display_name')
  String get displayName => throw _privateConstructorUsedError;
  String get username => throw _privateConstructorUsedError;
  String get email => throw _privateConstructorUsedError;
  String get password => throw _privateConstructorUsedError;

  /// Serializes this RegisterInput to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of RegisterInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RegisterInputCopyWith<RegisterInput> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RegisterInputCopyWith<$Res> {
  factory $RegisterInputCopyWith(
    RegisterInput value,
    $Res Function(RegisterInput) then,
  ) = _$RegisterInputCopyWithImpl<$Res, RegisterInput>;
  @useResult
  $Res call({
    @JsonKey(name: 'display_name') String displayName,
    String username,
    String email,
    String password,
  });
}

/// @nodoc
class _$RegisterInputCopyWithImpl<$Res, $Val extends RegisterInput>
    implements $RegisterInputCopyWith<$Res> {
  _$RegisterInputCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RegisterInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? displayName = null,
    Object? username = null,
    Object? email = null,
    Object? password = null,
  }) {
    return _then(
      _value.copyWith(
            displayName: null == displayName
                ? _value.displayName
                : displayName // ignore: cast_nullable_to_non_nullable
                      as String,
            username: null == username
                ? _value.username
                : username // ignore: cast_nullable_to_non_nullable
                      as String,
            email: null == email
                ? _value.email
                : email // ignore: cast_nullable_to_non_nullable
                      as String,
            password: null == password
                ? _value.password
                : password // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$RegisterInputImplCopyWith<$Res>
    implements $RegisterInputCopyWith<$Res> {
  factory _$$RegisterInputImplCopyWith(
    _$RegisterInputImpl value,
    $Res Function(_$RegisterInputImpl) then,
  ) = __$$RegisterInputImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    @JsonKey(name: 'display_name') String displayName,
    String username,
    String email,
    String password,
  });
}

/// @nodoc
class __$$RegisterInputImplCopyWithImpl<$Res>
    extends _$RegisterInputCopyWithImpl<$Res, _$RegisterInputImpl>
    implements _$$RegisterInputImplCopyWith<$Res> {
  __$$RegisterInputImplCopyWithImpl(
    _$RegisterInputImpl _value,
    $Res Function(_$RegisterInputImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RegisterInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? displayName = null,
    Object? username = null,
    Object? email = null,
    Object? password = null,
  }) {
    return _then(
      _$RegisterInputImpl(
        displayName: null == displayName
            ? _value.displayName
            : displayName // ignore: cast_nullable_to_non_nullable
                  as String,
        username: null == username
            ? _value.username
            : username // ignore: cast_nullable_to_non_nullable
                  as String,
        email: null == email
            ? _value.email
            : email // ignore: cast_nullable_to_non_nullable
                  as String,
        password: null == password
            ? _value.password
            : password // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc

@JsonSerializable(fieldRename: FieldRename.snake)
class _$RegisterInputImpl extends _RegisterInput {
  const _$RegisterInputImpl({
    @JsonKey(name: 'display_name') required this.displayName,
    required this.username,
    required this.email,
    required this.password,
  }) : super._();

  factory _$RegisterInputImpl.fromJson(Map<String, dynamic> json) =>
      _$$RegisterInputImplFromJson(json);

  @override
  @JsonKey(name: 'display_name')
  final String displayName;
  @override
  final String username;
  @override
  final String email;
  @override
  final String password;

  @override
  String toString() {
    return 'RegisterInput(displayName: $displayName, username: $username, email: $email, password: $password)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RegisterInputImpl &&
            (identical(other.displayName, displayName) ||
                other.displayName == displayName) &&
            (identical(other.username, username) ||
                other.username == username) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.password, password) ||
                other.password == password));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, displayName, username, email, password);

  /// Create a copy of RegisterInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RegisterInputImplCopyWith<_$RegisterInputImpl> get copyWith =>
      __$$RegisterInputImplCopyWithImpl<_$RegisterInputImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RegisterInputImplToJson(this);
  }
}

abstract class _RegisterInput extends RegisterInput {
  const factory _RegisterInput({
    @JsonKey(name: 'display_name') required final String displayName,
    required final String username,
    required final String email,
    required final String password,
  }) = _$RegisterInputImpl;
  const _RegisterInput._() : super._();

  factory _RegisterInput.fromJson(Map<String, dynamic> json) =
      _$RegisterInputImpl.fromJson;

  @override
  @JsonKey(name: 'display_name')
  String get displayName;
  @override
  String get username;
  @override
  String get email;
  @override
  String get password;

  /// Create a copy of RegisterInput
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RegisterInputImplCopyWith<_$RegisterInputImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ForgotPasswordInput _$ForgotPasswordInputFromJson(Map<String, dynamic> json) {
  return _ForgotPasswordInput.fromJson(json);
}

/// @nodoc
mixin _$ForgotPasswordInput {
  String get email => throw _privateConstructorUsedError;

  /// Serializes this ForgotPasswordInput to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ForgotPasswordInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ForgotPasswordInputCopyWith<ForgotPasswordInput> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ForgotPasswordInputCopyWith<$Res> {
  factory $ForgotPasswordInputCopyWith(
    ForgotPasswordInput value,
    $Res Function(ForgotPasswordInput) then,
  ) = _$ForgotPasswordInputCopyWithImpl<$Res, ForgotPasswordInput>;
  @useResult
  $Res call({String email});
}

/// @nodoc
class _$ForgotPasswordInputCopyWithImpl<$Res, $Val extends ForgotPasswordInput>
    implements $ForgotPasswordInputCopyWith<$Res> {
  _$ForgotPasswordInputCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ForgotPasswordInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? email = null}) {
    return _then(
      _value.copyWith(
            email: null == email
                ? _value.email
                : email // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ForgotPasswordInputImplCopyWith<$Res>
    implements $ForgotPasswordInputCopyWith<$Res> {
  factory _$$ForgotPasswordInputImplCopyWith(
    _$ForgotPasswordInputImpl value,
    $Res Function(_$ForgotPasswordInputImpl) then,
  ) = __$$ForgotPasswordInputImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String email});
}

/// @nodoc
class __$$ForgotPasswordInputImplCopyWithImpl<$Res>
    extends _$ForgotPasswordInputCopyWithImpl<$Res, _$ForgotPasswordInputImpl>
    implements _$$ForgotPasswordInputImplCopyWith<$Res> {
  __$$ForgotPasswordInputImplCopyWithImpl(
    _$ForgotPasswordInputImpl _value,
    $Res Function(_$ForgotPasswordInputImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ForgotPasswordInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? email = null}) {
    return _then(
      _$ForgotPasswordInputImpl(
        email: null == email
            ? _value.email
            : email // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ForgotPasswordInputImpl extends _ForgotPasswordInput {
  const _$ForgotPasswordInputImpl({required this.email}) : super._();

  factory _$ForgotPasswordInputImpl.fromJson(Map<String, dynamic> json) =>
      _$$ForgotPasswordInputImplFromJson(json);

  @override
  final String email;

  @override
  String toString() {
    return 'ForgotPasswordInput(email: $email)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ForgotPasswordInputImpl &&
            (identical(other.email, email) || other.email == email));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, email);

  /// Create a copy of ForgotPasswordInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ForgotPasswordInputImplCopyWith<_$ForgotPasswordInputImpl> get copyWith =>
      __$$ForgotPasswordInputImplCopyWithImpl<_$ForgotPasswordInputImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$ForgotPasswordInputImplToJson(this);
  }
}

abstract class _ForgotPasswordInput extends ForgotPasswordInput {
  const factory _ForgotPasswordInput({required final String email}) =
      _$ForgotPasswordInputImpl;
  const _ForgotPasswordInput._() : super._();

  factory _ForgotPasswordInput.fromJson(Map<String, dynamic> json) =
      _$ForgotPasswordInputImpl.fromJson;

  @override
  String get email;

  /// Create a copy of ForgotPasswordInput
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ForgotPasswordInputImplCopyWith<_$ForgotPasswordInputImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
