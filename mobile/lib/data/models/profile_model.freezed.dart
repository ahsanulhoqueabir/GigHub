// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'profile_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Profile _$ProfileFromJson(Map<String, dynamic> json) {
  return _Profile.fromJson(json);
}

/// @nodoc
mixin _$Profile {
  String get id => throw _privateConstructorUsedError;
  String get displayName => throw _privateConstructorUsedError;
  String get username => throw _privateConstructorUsedError;
  String get email => throw _privateConstructorUsedError;
  String? get avatar => throw _privateConstructorUsedError;
  String? get bio => throw _privateConstructorUsedError;
  List<String> get skills => throw _privateConstructorUsedError;
  String get availabilityStatus => throw _privateConstructorUsedError;
  bool get isVerified => throw _privateConstructorUsedError;
  String get role => throw _privateConstructorUsedError;
  double get totalEarnings => throw _privateConstructorUsedError;
  double get avgRating => throw _privateConstructorUsedError;
  int get totalReviews => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;

  /// Serializes this Profile to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Profile
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ProfileCopyWith<Profile> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ProfileCopyWith<$Res> {
  factory $ProfileCopyWith(Profile value, $Res Function(Profile) then) =
      _$ProfileCopyWithImpl<$Res, Profile>;
  @useResult
  $Res call({
    String id,
    String displayName,
    String username,
    String email,
    String? avatar,
    String? bio,
    List<String> skills,
    String availabilityStatus,
    bool isVerified,
    String role,
    double totalEarnings,
    double avgRating,
    int totalReviews,
    DateTime createdAt,
  });
}

/// @nodoc
class _$ProfileCopyWithImpl<$Res, $Val extends Profile>
    implements $ProfileCopyWith<$Res> {
  _$ProfileCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Profile
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? displayName = null,
    Object? username = null,
    Object? email = null,
    Object? avatar = freezed,
    Object? bio = freezed,
    Object? skills = null,
    Object? availabilityStatus = null,
    Object? isVerified = null,
    Object? role = null,
    Object? totalEarnings = null,
    Object? avgRating = null,
    Object? totalReviews = null,
    Object? createdAt = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
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
            avatar: freezed == avatar
                ? _value.avatar
                : avatar // ignore: cast_nullable_to_non_nullable
                      as String?,
            bio: freezed == bio
                ? _value.bio
                : bio // ignore: cast_nullable_to_non_nullable
                      as String?,
            skills: null == skills
                ? _value.skills
                : skills // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            availabilityStatus: null == availabilityStatus
                ? _value.availabilityStatus
                : availabilityStatus // ignore: cast_nullable_to_non_nullable
                      as String,
            isVerified: null == isVerified
                ? _value.isVerified
                : isVerified // ignore: cast_nullable_to_non_nullable
                      as bool,
            role: null == role
                ? _value.role
                : role // ignore: cast_nullable_to_non_nullable
                      as String,
            totalEarnings: null == totalEarnings
                ? _value.totalEarnings
                : totalEarnings // ignore: cast_nullable_to_non_nullable
                      as double,
            avgRating: null == avgRating
                ? _value.avgRating
                : avgRating // ignore: cast_nullable_to_non_nullable
                      as double,
            totalReviews: null == totalReviews
                ? _value.totalReviews
                : totalReviews // ignore: cast_nullable_to_non_nullable
                      as int,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ProfileImplCopyWith<$Res> implements $ProfileCopyWith<$Res> {
  factory _$$ProfileImplCopyWith(
    _$ProfileImpl value,
    $Res Function(_$ProfileImpl) then,
  ) = __$$ProfileImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String displayName,
    String username,
    String email,
    String? avatar,
    String? bio,
    List<String> skills,
    String availabilityStatus,
    bool isVerified,
    String role,
    double totalEarnings,
    double avgRating,
    int totalReviews,
    DateTime createdAt,
  });
}

/// @nodoc
class __$$ProfileImplCopyWithImpl<$Res>
    extends _$ProfileCopyWithImpl<$Res, _$ProfileImpl>
    implements _$$ProfileImplCopyWith<$Res> {
  __$$ProfileImplCopyWithImpl(
    _$ProfileImpl _value,
    $Res Function(_$ProfileImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Profile
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? displayName = null,
    Object? username = null,
    Object? email = null,
    Object? avatar = freezed,
    Object? bio = freezed,
    Object? skills = null,
    Object? availabilityStatus = null,
    Object? isVerified = null,
    Object? role = null,
    Object? totalEarnings = null,
    Object? avgRating = null,
    Object? totalReviews = null,
    Object? createdAt = null,
  }) {
    return _then(
      _$ProfileImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
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
        avatar: freezed == avatar
            ? _value.avatar
            : avatar // ignore: cast_nullable_to_non_nullable
                  as String?,
        bio: freezed == bio
            ? _value.bio
            : bio // ignore: cast_nullable_to_non_nullable
                  as String?,
        skills: null == skills
            ? _value._skills
            : skills // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        availabilityStatus: null == availabilityStatus
            ? _value.availabilityStatus
            : availabilityStatus // ignore: cast_nullable_to_non_nullable
                  as String,
        isVerified: null == isVerified
            ? _value.isVerified
            : isVerified // ignore: cast_nullable_to_non_nullable
                  as bool,
        role: null == role
            ? _value.role
            : role // ignore: cast_nullable_to_non_nullable
                  as String,
        totalEarnings: null == totalEarnings
            ? _value.totalEarnings
            : totalEarnings // ignore: cast_nullable_to_non_nullable
                  as double,
        avgRating: null == avgRating
            ? _value.avgRating
            : avgRating // ignore: cast_nullable_to_non_nullable
                  as double,
        totalReviews: null == totalReviews
            ? _value.totalReviews
            : totalReviews // ignore: cast_nullable_to_non_nullable
                  as int,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
      ),
    );
  }
}

/// @nodoc

@JsonSerializable(fieldRename: FieldRename.snake)
class _$ProfileImpl extends _Profile {
  const _$ProfileImpl({
    required this.id,
    required this.displayName,
    required this.username,
    required this.email,
    this.avatar,
    this.bio,
    final List<String> skills = const [],
    this.availabilityStatus = 'available',
    this.isVerified = false,
    this.role = 'user',
    this.totalEarnings = 0.0,
    this.avgRating = 0.0,
    this.totalReviews = 0,
    required this.createdAt,
  }) : _skills = skills,
       super._();

  factory _$ProfileImpl.fromJson(Map<String, dynamic> json) =>
      _$$ProfileImplFromJson(json);

  @override
  final String id;
  @override
  final String displayName;
  @override
  final String username;
  @override
  final String email;
  @override
  final String? avatar;
  @override
  final String? bio;
  final List<String> _skills;
  @override
  @JsonKey()
  List<String> get skills {
    if (_skills is EqualUnmodifiableListView) return _skills;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_skills);
  }

  @override
  @JsonKey()
  final String availabilityStatus;
  @override
  @JsonKey()
  final bool isVerified;
  @override
  @JsonKey()
  final String role;
  @override
  @JsonKey()
  final double totalEarnings;
  @override
  @JsonKey()
  final double avgRating;
  @override
  @JsonKey()
  final int totalReviews;
  @override
  final DateTime createdAt;

  @override
  String toString() {
    return 'Profile(id: $id, displayName: $displayName, username: $username, email: $email, avatar: $avatar, bio: $bio, skills: $skills, availabilityStatus: $availabilityStatus, isVerified: $isVerified, role: $role, totalEarnings: $totalEarnings, avgRating: $avgRating, totalReviews: $totalReviews, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ProfileImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.displayName, displayName) ||
                other.displayName == displayName) &&
            (identical(other.username, username) ||
                other.username == username) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.avatar, avatar) || other.avatar == avatar) &&
            (identical(other.bio, bio) || other.bio == bio) &&
            const DeepCollectionEquality().equals(other._skills, _skills) &&
            (identical(other.availabilityStatus, availabilityStatus) ||
                other.availabilityStatus == availabilityStatus) &&
            (identical(other.isVerified, isVerified) ||
                other.isVerified == isVerified) &&
            (identical(other.role, role) || other.role == role) &&
            (identical(other.totalEarnings, totalEarnings) ||
                other.totalEarnings == totalEarnings) &&
            (identical(other.avgRating, avgRating) ||
                other.avgRating == avgRating) &&
            (identical(other.totalReviews, totalReviews) ||
                other.totalReviews == totalReviews) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    displayName,
    username,
    email,
    avatar,
    bio,
    const DeepCollectionEquality().hash(_skills),
    availabilityStatus,
    isVerified,
    role,
    totalEarnings,
    avgRating,
    totalReviews,
    createdAt,
  );

  /// Create a copy of Profile
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ProfileImplCopyWith<_$ProfileImpl> get copyWith =>
      __$$ProfileImplCopyWithImpl<_$ProfileImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ProfileImplToJson(this);
  }
}

abstract class _Profile extends Profile {
  const factory _Profile({
    required final String id,
    required final String displayName,
    required final String username,
    required final String email,
    final String? avatar,
    final String? bio,
    final List<String> skills,
    final String availabilityStatus,
    final bool isVerified,
    final String role,
    final double totalEarnings,
    final double avgRating,
    final int totalReviews,
    required final DateTime createdAt,
  }) = _$ProfileImpl;
  const _Profile._() : super._();

  factory _Profile.fromJson(Map<String, dynamic> json) = _$ProfileImpl.fromJson;

  @override
  String get id;
  @override
  String get displayName;
  @override
  String get username;
  @override
  String get email;
  @override
  String? get avatar;
  @override
  String? get bio;
  @override
  List<String> get skills;
  @override
  String get availabilityStatus;
  @override
  bool get isVerified;
  @override
  String get role;
  @override
  double get totalEarnings;
  @override
  double get avgRating;
  @override
  int get totalReviews;
  @override
  DateTime get createdAt;

  /// Create a copy of Profile
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ProfileImplCopyWith<_$ProfileImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

PublicProfile _$PublicProfileFromJson(Map<String, dynamic> json) {
  return _PublicProfile.fromJson(json);
}

/// @nodoc
mixin _$PublicProfile {
  String get id => throw _privateConstructorUsedError;
  String get displayName => throw _privateConstructorUsedError;
  String get username => throw _privateConstructorUsedError;
  String? get avatar => throw _privateConstructorUsedError;
  String? get bio => throw _privateConstructorUsedError;
  List<String> get skills => throw _privateConstructorUsedError;
  String get availabilityStatus => throw _privateConstructorUsedError;
  bool get isVerified => throw _privateConstructorUsedError;
  double get avgRating => throw _privateConstructorUsedError;
  int get totalReviews => throw _privateConstructorUsedError;
  int get completedOrders => throw _privateConstructorUsedError;
  DateTime get memberSince => throw _privateConstructorUsedError;

  /// Serializes this PublicProfile to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of PublicProfile
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PublicProfileCopyWith<PublicProfile> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PublicProfileCopyWith<$Res> {
  factory $PublicProfileCopyWith(
    PublicProfile value,
    $Res Function(PublicProfile) then,
  ) = _$PublicProfileCopyWithImpl<$Res, PublicProfile>;
  @useResult
  $Res call({
    String id,
    String displayName,
    String username,
    String? avatar,
    String? bio,
    List<String> skills,
    String availabilityStatus,
    bool isVerified,
    double avgRating,
    int totalReviews,
    int completedOrders,
    DateTime memberSince,
  });
}

/// @nodoc
class _$PublicProfileCopyWithImpl<$Res, $Val extends PublicProfile>
    implements $PublicProfileCopyWith<$Res> {
  _$PublicProfileCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PublicProfile
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? displayName = null,
    Object? username = null,
    Object? avatar = freezed,
    Object? bio = freezed,
    Object? skills = null,
    Object? availabilityStatus = null,
    Object? isVerified = null,
    Object? avgRating = null,
    Object? totalReviews = null,
    Object? completedOrders = null,
    Object? memberSince = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            displayName: null == displayName
                ? _value.displayName
                : displayName // ignore: cast_nullable_to_non_nullable
                      as String,
            username: null == username
                ? _value.username
                : username // ignore: cast_nullable_to_non_nullable
                      as String,
            avatar: freezed == avatar
                ? _value.avatar
                : avatar // ignore: cast_nullable_to_non_nullable
                      as String?,
            bio: freezed == bio
                ? _value.bio
                : bio // ignore: cast_nullable_to_non_nullable
                      as String?,
            skills: null == skills
                ? _value.skills
                : skills // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            availabilityStatus: null == availabilityStatus
                ? _value.availabilityStatus
                : availabilityStatus // ignore: cast_nullable_to_non_nullable
                      as String,
            isVerified: null == isVerified
                ? _value.isVerified
                : isVerified // ignore: cast_nullable_to_non_nullable
                      as bool,
            avgRating: null == avgRating
                ? _value.avgRating
                : avgRating // ignore: cast_nullable_to_non_nullable
                      as double,
            totalReviews: null == totalReviews
                ? _value.totalReviews
                : totalReviews // ignore: cast_nullable_to_non_nullable
                      as int,
            completedOrders: null == completedOrders
                ? _value.completedOrders
                : completedOrders // ignore: cast_nullable_to_non_nullable
                      as int,
            memberSince: null == memberSince
                ? _value.memberSince
                : memberSince // ignore: cast_nullable_to_non_nullable
                      as DateTime,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$PublicProfileImplCopyWith<$Res>
    implements $PublicProfileCopyWith<$Res> {
  factory _$$PublicProfileImplCopyWith(
    _$PublicProfileImpl value,
    $Res Function(_$PublicProfileImpl) then,
  ) = __$$PublicProfileImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String displayName,
    String username,
    String? avatar,
    String? bio,
    List<String> skills,
    String availabilityStatus,
    bool isVerified,
    double avgRating,
    int totalReviews,
    int completedOrders,
    DateTime memberSince,
  });
}

/// @nodoc
class __$$PublicProfileImplCopyWithImpl<$Res>
    extends _$PublicProfileCopyWithImpl<$Res, _$PublicProfileImpl>
    implements _$$PublicProfileImplCopyWith<$Res> {
  __$$PublicProfileImplCopyWithImpl(
    _$PublicProfileImpl _value,
    $Res Function(_$PublicProfileImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of PublicProfile
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? displayName = null,
    Object? username = null,
    Object? avatar = freezed,
    Object? bio = freezed,
    Object? skills = null,
    Object? availabilityStatus = null,
    Object? isVerified = null,
    Object? avgRating = null,
    Object? totalReviews = null,
    Object? completedOrders = null,
    Object? memberSince = null,
  }) {
    return _then(
      _$PublicProfileImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        displayName: null == displayName
            ? _value.displayName
            : displayName // ignore: cast_nullable_to_non_nullable
                  as String,
        username: null == username
            ? _value.username
            : username // ignore: cast_nullable_to_non_nullable
                  as String,
        avatar: freezed == avatar
            ? _value.avatar
            : avatar // ignore: cast_nullable_to_non_nullable
                  as String?,
        bio: freezed == bio
            ? _value.bio
            : bio // ignore: cast_nullable_to_non_nullable
                  as String?,
        skills: null == skills
            ? _value._skills
            : skills // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        availabilityStatus: null == availabilityStatus
            ? _value.availabilityStatus
            : availabilityStatus // ignore: cast_nullable_to_non_nullable
                  as String,
        isVerified: null == isVerified
            ? _value.isVerified
            : isVerified // ignore: cast_nullable_to_non_nullable
                  as bool,
        avgRating: null == avgRating
            ? _value.avgRating
            : avgRating // ignore: cast_nullable_to_non_nullable
                  as double,
        totalReviews: null == totalReviews
            ? _value.totalReviews
            : totalReviews // ignore: cast_nullable_to_non_nullable
                  as int,
        completedOrders: null == completedOrders
            ? _value.completedOrders
            : completedOrders // ignore: cast_nullable_to_non_nullable
                  as int,
        memberSince: null == memberSince
            ? _value.memberSince
            : memberSince // ignore: cast_nullable_to_non_nullable
                  as DateTime,
      ),
    );
  }
}

/// @nodoc

@JsonSerializable(fieldRename: FieldRename.snake)
class _$PublicProfileImpl extends _PublicProfile {
  const _$PublicProfileImpl({
    required this.id,
    required this.displayName,
    required this.username,
    this.avatar,
    this.bio,
    final List<String> skills = const [],
    this.availabilityStatus = 'available',
    this.isVerified = false,
    this.avgRating = 0.0,
    this.totalReviews = 0,
    this.completedOrders = 0,
    required this.memberSince,
  }) : _skills = skills,
       super._();

  factory _$PublicProfileImpl.fromJson(Map<String, dynamic> json) =>
      _$$PublicProfileImplFromJson(json);

  @override
  final String id;
  @override
  final String displayName;
  @override
  final String username;
  @override
  final String? avatar;
  @override
  final String? bio;
  final List<String> _skills;
  @override
  @JsonKey()
  List<String> get skills {
    if (_skills is EqualUnmodifiableListView) return _skills;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_skills);
  }

  @override
  @JsonKey()
  final String availabilityStatus;
  @override
  @JsonKey()
  final bool isVerified;
  @override
  @JsonKey()
  final double avgRating;
  @override
  @JsonKey()
  final int totalReviews;
  @override
  @JsonKey()
  final int completedOrders;
  @override
  final DateTime memberSince;

  @override
  String toString() {
    return 'PublicProfile(id: $id, displayName: $displayName, username: $username, avatar: $avatar, bio: $bio, skills: $skills, availabilityStatus: $availabilityStatus, isVerified: $isVerified, avgRating: $avgRating, totalReviews: $totalReviews, completedOrders: $completedOrders, memberSince: $memberSince)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PublicProfileImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.displayName, displayName) ||
                other.displayName == displayName) &&
            (identical(other.username, username) ||
                other.username == username) &&
            (identical(other.avatar, avatar) || other.avatar == avatar) &&
            (identical(other.bio, bio) || other.bio == bio) &&
            const DeepCollectionEquality().equals(other._skills, _skills) &&
            (identical(other.availabilityStatus, availabilityStatus) ||
                other.availabilityStatus == availabilityStatus) &&
            (identical(other.isVerified, isVerified) ||
                other.isVerified == isVerified) &&
            (identical(other.avgRating, avgRating) ||
                other.avgRating == avgRating) &&
            (identical(other.totalReviews, totalReviews) ||
                other.totalReviews == totalReviews) &&
            (identical(other.completedOrders, completedOrders) ||
                other.completedOrders == completedOrders) &&
            (identical(other.memberSince, memberSince) ||
                other.memberSince == memberSince));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    displayName,
    username,
    avatar,
    bio,
    const DeepCollectionEquality().hash(_skills),
    availabilityStatus,
    isVerified,
    avgRating,
    totalReviews,
    completedOrders,
    memberSince,
  );

  /// Create a copy of PublicProfile
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PublicProfileImplCopyWith<_$PublicProfileImpl> get copyWith =>
      __$$PublicProfileImplCopyWithImpl<_$PublicProfileImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$PublicProfileImplToJson(this);
  }
}

abstract class _PublicProfile extends PublicProfile {
  const factory _PublicProfile({
    required final String id,
    required final String displayName,
    required final String username,
    final String? avatar,
    final String? bio,
    final List<String> skills,
    final String availabilityStatus,
    final bool isVerified,
    final double avgRating,
    final int totalReviews,
    final int completedOrders,
    required final DateTime memberSince,
  }) = _$PublicProfileImpl;
  const _PublicProfile._() : super._();

  factory _PublicProfile.fromJson(Map<String, dynamic> json) =
      _$PublicProfileImpl.fromJson;

  @override
  String get id;
  @override
  String get displayName;
  @override
  String get username;
  @override
  String? get avatar;
  @override
  String? get bio;
  @override
  List<String> get skills;
  @override
  String get availabilityStatus;
  @override
  bool get isVerified;
  @override
  double get avgRating;
  @override
  int get totalReviews;
  @override
  int get completedOrders;
  @override
  DateTime get memberSince;

  /// Create a copy of PublicProfile
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PublicProfileImplCopyWith<_$PublicProfileImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UpdateProfileInput _$UpdateProfileInputFromJson(Map<String, dynamic> json) {
  return _UpdateProfileInput.fromJson(json);
}

/// @nodoc
mixin _$UpdateProfileInput {
  String? get displayName => throw _privateConstructorUsedError;
  String? get username => throw _privateConstructorUsedError;
  String? get bio => throw _privateConstructorUsedError;
  List<String>? get skills => throw _privateConstructorUsedError;
  String? get availabilityStatus => throw _privateConstructorUsedError;

  /// Serializes this UpdateProfileInput to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of UpdateProfileInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $UpdateProfileInputCopyWith<UpdateProfileInput> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UpdateProfileInputCopyWith<$Res> {
  factory $UpdateProfileInputCopyWith(
    UpdateProfileInput value,
    $Res Function(UpdateProfileInput) then,
  ) = _$UpdateProfileInputCopyWithImpl<$Res, UpdateProfileInput>;
  @useResult
  $Res call({
    String? displayName,
    String? username,
    String? bio,
    List<String>? skills,
    String? availabilityStatus,
  });
}

/// @nodoc
class _$UpdateProfileInputCopyWithImpl<$Res, $Val extends UpdateProfileInput>
    implements $UpdateProfileInputCopyWith<$Res> {
  _$UpdateProfileInputCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of UpdateProfileInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? displayName = freezed,
    Object? username = freezed,
    Object? bio = freezed,
    Object? skills = freezed,
    Object? availabilityStatus = freezed,
  }) {
    return _then(
      _value.copyWith(
            displayName: freezed == displayName
                ? _value.displayName
                : displayName // ignore: cast_nullable_to_non_nullable
                      as String?,
            username: freezed == username
                ? _value.username
                : username // ignore: cast_nullable_to_non_nullable
                      as String?,
            bio: freezed == bio
                ? _value.bio
                : bio // ignore: cast_nullable_to_non_nullable
                      as String?,
            skills: freezed == skills
                ? _value.skills
                : skills // ignore: cast_nullable_to_non_nullable
                      as List<String>?,
            availabilityStatus: freezed == availabilityStatus
                ? _value.availabilityStatus
                : availabilityStatus // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$UpdateProfileInputImplCopyWith<$Res>
    implements $UpdateProfileInputCopyWith<$Res> {
  factory _$$UpdateProfileInputImplCopyWith(
    _$UpdateProfileInputImpl value,
    $Res Function(_$UpdateProfileInputImpl) then,
  ) = __$$UpdateProfileInputImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String? displayName,
    String? username,
    String? bio,
    List<String>? skills,
    String? availabilityStatus,
  });
}

/// @nodoc
class __$$UpdateProfileInputImplCopyWithImpl<$Res>
    extends _$UpdateProfileInputCopyWithImpl<$Res, _$UpdateProfileInputImpl>
    implements _$$UpdateProfileInputImplCopyWith<$Res> {
  __$$UpdateProfileInputImplCopyWithImpl(
    _$UpdateProfileInputImpl _value,
    $Res Function(_$UpdateProfileInputImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UpdateProfileInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? displayName = freezed,
    Object? username = freezed,
    Object? bio = freezed,
    Object? skills = freezed,
    Object? availabilityStatus = freezed,
  }) {
    return _then(
      _$UpdateProfileInputImpl(
        displayName: freezed == displayName
            ? _value.displayName
            : displayName // ignore: cast_nullable_to_non_nullable
                  as String?,
        username: freezed == username
            ? _value.username
            : username // ignore: cast_nullable_to_non_nullable
                  as String?,
        bio: freezed == bio
            ? _value.bio
            : bio // ignore: cast_nullable_to_non_nullable
                  as String?,
        skills: freezed == skills
            ? _value._skills
            : skills // ignore: cast_nullable_to_non_nullable
                  as List<String>?,
        availabilityStatus: freezed == availabilityStatus
            ? _value.availabilityStatus
            : availabilityStatus // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc

@JsonSerializable(fieldRename: FieldRename.snake, includeIfNull: false)
class _$UpdateProfileInputImpl extends _UpdateProfileInput {
  const _$UpdateProfileInputImpl({
    this.displayName,
    this.username,
    this.bio,
    final List<String>? skills,
    this.availabilityStatus,
  }) : _skills = skills,
       super._();

  factory _$UpdateProfileInputImpl.fromJson(Map<String, dynamic> json) =>
      _$$UpdateProfileInputImplFromJson(json);

  @override
  final String? displayName;
  @override
  final String? username;
  @override
  final String? bio;
  final List<String>? _skills;
  @override
  List<String>? get skills {
    final value = _skills;
    if (value == null) return null;
    if (_skills is EqualUnmodifiableListView) return _skills;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final String? availabilityStatus;

  @override
  String toString() {
    return 'UpdateProfileInput(displayName: $displayName, username: $username, bio: $bio, skills: $skills, availabilityStatus: $availabilityStatus)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UpdateProfileInputImpl &&
            (identical(other.displayName, displayName) ||
                other.displayName == displayName) &&
            (identical(other.username, username) ||
                other.username == username) &&
            (identical(other.bio, bio) || other.bio == bio) &&
            const DeepCollectionEquality().equals(other._skills, _skills) &&
            (identical(other.availabilityStatus, availabilityStatus) ||
                other.availabilityStatus == availabilityStatus));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    displayName,
    username,
    bio,
    const DeepCollectionEquality().hash(_skills),
    availabilityStatus,
  );

  /// Create a copy of UpdateProfileInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UpdateProfileInputImplCopyWith<_$UpdateProfileInputImpl> get copyWith =>
      __$$UpdateProfileInputImplCopyWithImpl<_$UpdateProfileInputImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$UpdateProfileInputImplToJson(this);
  }
}

abstract class _UpdateProfileInput extends UpdateProfileInput {
  const factory _UpdateProfileInput({
    final String? displayName,
    final String? username,
    final String? bio,
    final List<String>? skills,
    final String? availabilityStatus,
  }) = _$UpdateProfileInputImpl;
  const _UpdateProfileInput._() : super._();

  factory _UpdateProfileInput.fromJson(Map<String, dynamic> json) =
      _$UpdateProfileInputImpl.fromJson;

  @override
  String? get displayName;
  @override
  String? get username;
  @override
  String? get bio;
  @override
  List<String>? get skills;
  @override
  String? get availabilityStatus;

  /// Create a copy of UpdateProfileInput
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UpdateProfileInputImplCopyWith<_$UpdateProfileInputImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
