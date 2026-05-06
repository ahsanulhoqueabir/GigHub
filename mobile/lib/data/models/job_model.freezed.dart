// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'job_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Job _$JobFromJson(Map<String, dynamic> json) {
  return _Job.fromJson(json);
}

/// @nodoc
mixin _$Job {
  String get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get slug => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  Category get category => throw _privateConstructorUsedError;
  PublicProfile get client => throw _privateConstructorUsedError;
  String get type => throw _privateConstructorUsedError;
  double get budgetMin => throw _privateConstructorUsedError;
  double get budgetMax => throw _privateConstructorUsedError;
  String? get deadline => throw _privateConstructorUsedError;
  List<String> get skillsRequired => throw _privateConstructorUsedError;
  String get experienceLevel => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  int get totalProposals => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;

  /// Serializes this Job to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Job
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $JobCopyWith<Job> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $JobCopyWith<$Res> {
  factory $JobCopyWith(Job value, $Res Function(Job) then) =
      _$JobCopyWithImpl<$Res, Job>;
  @useResult
  $Res call({
    String id,
    String title,
    String slug,
    String description,
    Category category,
    PublicProfile client,
    String type,
    double budgetMin,
    double budgetMax,
    String? deadline,
    List<String> skillsRequired,
    String experienceLevel,
    String status,
    int totalProposals,
    DateTime createdAt,
  });

  $CategoryCopyWith<$Res> get category;
  $PublicProfileCopyWith<$Res> get client;
}

/// @nodoc
class _$JobCopyWithImpl<$Res, $Val extends Job> implements $JobCopyWith<$Res> {
  _$JobCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Job
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? slug = null,
    Object? description = null,
    Object? category = null,
    Object? client = null,
    Object? type = null,
    Object? budgetMin = null,
    Object? budgetMax = null,
    Object? deadline = freezed,
    Object? skillsRequired = null,
    Object? experienceLevel = null,
    Object? status = null,
    Object? totalProposals = null,
    Object? createdAt = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            title: null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String,
            slug: null == slug
                ? _value.slug
                : slug // ignore: cast_nullable_to_non_nullable
                      as String,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            category: null == category
                ? _value.category
                : category // ignore: cast_nullable_to_non_nullable
                      as Category,
            client: null == client
                ? _value.client
                : client // ignore: cast_nullable_to_non_nullable
                      as PublicProfile,
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as String,
            budgetMin: null == budgetMin
                ? _value.budgetMin
                : budgetMin // ignore: cast_nullable_to_non_nullable
                      as double,
            budgetMax: null == budgetMax
                ? _value.budgetMax
                : budgetMax // ignore: cast_nullable_to_non_nullable
                      as double,
            deadline: freezed == deadline
                ? _value.deadline
                : deadline // ignore: cast_nullable_to_non_nullable
                      as String?,
            skillsRequired: null == skillsRequired
                ? _value.skillsRequired
                : skillsRequired // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            experienceLevel: null == experienceLevel
                ? _value.experienceLevel
                : experienceLevel // ignore: cast_nullable_to_non_nullable
                      as String,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            totalProposals: null == totalProposals
                ? _value.totalProposals
                : totalProposals // ignore: cast_nullable_to_non_nullable
                      as int,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
          )
          as $Val,
    );
  }

  /// Create a copy of Job
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $CategoryCopyWith<$Res> get category {
    return $CategoryCopyWith<$Res>(_value.category, (value) {
      return _then(_value.copyWith(category: value) as $Val);
    });
  }

  /// Create a copy of Job
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $PublicProfileCopyWith<$Res> get client {
    return $PublicProfileCopyWith<$Res>(_value.client, (value) {
      return _then(_value.copyWith(client: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$JobImplCopyWith<$Res> implements $JobCopyWith<$Res> {
  factory _$$JobImplCopyWith(_$JobImpl value, $Res Function(_$JobImpl) then) =
      __$$JobImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String title,
    String slug,
    String description,
    Category category,
    PublicProfile client,
    String type,
    double budgetMin,
    double budgetMax,
    String? deadline,
    List<String> skillsRequired,
    String experienceLevel,
    String status,
    int totalProposals,
    DateTime createdAt,
  });

  @override
  $CategoryCopyWith<$Res> get category;
  @override
  $PublicProfileCopyWith<$Res> get client;
}

/// @nodoc
class __$$JobImplCopyWithImpl<$Res> extends _$JobCopyWithImpl<$Res, _$JobImpl>
    implements _$$JobImplCopyWith<$Res> {
  __$$JobImplCopyWithImpl(_$JobImpl _value, $Res Function(_$JobImpl) _then)
    : super(_value, _then);

  /// Create a copy of Job
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? slug = null,
    Object? description = null,
    Object? category = null,
    Object? client = null,
    Object? type = null,
    Object? budgetMin = null,
    Object? budgetMax = null,
    Object? deadline = freezed,
    Object? skillsRequired = null,
    Object? experienceLevel = null,
    Object? status = null,
    Object? totalProposals = null,
    Object? createdAt = null,
  }) {
    return _then(
      _$JobImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        title: null == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String,
        slug: null == slug
            ? _value.slug
            : slug // ignore: cast_nullable_to_non_nullable
                  as String,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        category: null == category
            ? _value.category
            : category // ignore: cast_nullable_to_non_nullable
                  as Category,
        client: null == client
            ? _value.client
            : client // ignore: cast_nullable_to_non_nullable
                  as PublicProfile,
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as String,
        budgetMin: null == budgetMin
            ? _value.budgetMin
            : budgetMin // ignore: cast_nullable_to_non_nullable
                  as double,
        budgetMax: null == budgetMax
            ? _value.budgetMax
            : budgetMax // ignore: cast_nullable_to_non_nullable
                  as double,
        deadline: freezed == deadline
            ? _value.deadline
            : deadline // ignore: cast_nullable_to_non_nullable
                  as String?,
        skillsRequired: null == skillsRequired
            ? _value._skillsRequired
            : skillsRequired // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        experienceLevel: null == experienceLevel
            ? _value.experienceLevel
            : experienceLevel // ignore: cast_nullable_to_non_nullable
                  as String,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        totalProposals: null == totalProposals
            ? _value.totalProposals
            : totalProposals // ignore: cast_nullable_to_non_nullable
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
class _$JobImpl extends _Job {
  const _$JobImpl({
    required this.id,
    required this.title,
    required this.slug,
    required this.description,
    required this.category,
    required this.client,
    required this.type,
    required this.budgetMin,
    required this.budgetMax,
    this.deadline,
    final List<String> skillsRequired = const [],
    this.experienceLevel = 'intermediate',
    required this.status,
    this.totalProposals = 0,
    required this.createdAt,
  }) : _skillsRequired = skillsRequired,
       super._();

  factory _$JobImpl.fromJson(Map<String, dynamic> json) =>
      _$$JobImplFromJson(json);

  @override
  final String id;
  @override
  final String title;
  @override
  final String slug;
  @override
  final String description;
  @override
  final Category category;
  @override
  final PublicProfile client;
  @override
  final String type;
  @override
  final double budgetMin;
  @override
  final double budgetMax;
  @override
  final String? deadline;
  final List<String> _skillsRequired;
  @override
  @JsonKey()
  List<String> get skillsRequired {
    if (_skillsRequired is EqualUnmodifiableListView) return _skillsRequired;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_skillsRequired);
  }

  @override
  @JsonKey()
  final String experienceLevel;
  @override
  final String status;
  @override
  @JsonKey()
  final int totalProposals;
  @override
  final DateTime createdAt;

  @override
  String toString() {
    return 'Job(id: $id, title: $title, slug: $slug, description: $description, category: $category, client: $client, type: $type, budgetMin: $budgetMin, budgetMax: $budgetMax, deadline: $deadline, skillsRequired: $skillsRequired, experienceLevel: $experienceLevel, status: $status, totalProposals: $totalProposals, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$JobImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.slug, slug) || other.slug == slug) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.client, client) || other.client == client) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.budgetMin, budgetMin) ||
                other.budgetMin == budgetMin) &&
            (identical(other.budgetMax, budgetMax) ||
                other.budgetMax == budgetMax) &&
            (identical(other.deadline, deadline) ||
                other.deadline == deadline) &&
            const DeepCollectionEquality().equals(
              other._skillsRequired,
              _skillsRequired,
            ) &&
            (identical(other.experienceLevel, experienceLevel) ||
                other.experienceLevel == experienceLevel) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.totalProposals, totalProposals) ||
                other.totalProposals == totalProposals) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    title,
    slug,
    description,
    category,
    client,
    type,
    budgetMin,
    budgetMax,
    deadline,
    const DeepCollectionEquality().hash(_skillsRequired),
    experienceLevel,
    status,
    totalProposals,
    createdAt,
  );

  /// Create a copy of Job
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$JobImplCopyWith<_$JobImpl> get copyWith =>
      __$$JobImplCopyWithImpl<_$JobImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$JobImplToJson(this);
  }
}

abstract class _Job extends Job {
  const factory _Job({
    required final String id,
    required final String title,
    required final String slug,
    required final String description,
    required final Category category,
    required final PublicProfile client,
    required final String type,
    required final double budgetMin,
    required final double budgetMax,
    final String? deadline,
    final List<String> skillsRequired,
    final String experienceLevel,
    required final String status,
    final int totalProposals,
    required final DateTime createdAt,
  }) = _$JobImpl;
  const _Job._() : super._();

  factory _Job.fromJson(Map<String, dynamic> json) = _$JobImpl.fromJson;

  @override
  String get id;
  @override
  String get title;
  @override
  String get slug;
  @override
  String get description;
  @override
  Category get category;
  @override
  PublicProfile get client;
  @override
  String get type;
  @override
  double get budgetMin;
  @override
  double get budgetMax;
  @override
  String? get deadline;
  @override
  List<String> get skillsRequired;
  @override
  String get experienceLevel;
  @override
  String get status;
  @override
  int get totalProposals;
  @override
  DateTime get createdAt;

  /// Create a copy of Job
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$JobImplCopyWith<_$JobImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CreateJobInput _$CreateJobInputFromJson(Map<String, dynamic> json) {
  return _CreateJobInput.fromJson(json);
}

/// @nodoc
mixin _$CreateJobInput {
  String get title => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  String get categoryId => throw _privateConstructorUsedError;
  String get type => throw _privateConstructorUsedError;
  double get budgetMin => throw _privateConstructorUsedError;
  double get budgetMax => throw _privateConstructorUsedError;
  String? get deadline => throw _privateConstructorUsedError;
  List<String> get skillsRequired => throw _privateConstructorUsedError;
  String get experienceLevel => throw _privateConstructorUsedError;

  /// Serializes this CreateJobInput to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CreateJobInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreateJobInputCopyWith<CreateJobInput> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreateJobInputCopyWith<$Res> {
  factory $CreateJobInputCopyWith(
    CreateJobInput value,
    $Res Function(CreateJobInput) then,
  ) = _$CreateJobInputCopyWithImpl<$Res, CreateJobInput>;
  @useResult
  $Res call({
    String title,
    String description,
    String categoryId,
    String type,
    double budgetMin,
    double budgetMax,
    String? deadline,
    List<String> skillsRequired,
    String experienceLevel,
  });
}

/// @nodoc
class _$CreateJobInputCopyWithImpl<$Res, $Val extends CreateJobInput>
    implements $CreateJobInputCopyWith<$Res> {
  _$CreateJobInputCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreateJobInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? title = null,
    Object? description = null,
    Object? categoryId = null,
    Object? type = null,
    Object? budgetMin = null,
    Object? budgetMax = null,
    Object? deadline = freezed,
    Object? skillsRequired = null,
    Object? experienceLevel = null,
  }) {
    return _then(
      _value.copyWith(
            title: null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            categoryId: null == categoryId
                ? _value.categoryId
                : categoryId // ignore: cast_nullable_to_non_nullable
                      as String,
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as String,
            budgetMin: null == budgetMin
                ? _value.budgetMin
                : budgetMin // ignore: cast_nullable_to_non_nullable
                      as double,
            budgetMax: null == budgetMax
                ? _value.budgetMax
                : budgetMax // ignore: cast_nullable_to_non_nullable
                      as double,
            deadline: freezed == deadline
                ? _value.deadline
                : deadline // ignore: cast_nullable_to_non_nullable
                      as String?,
            skillsRequired: null == skillsRequired
                ? _value.skillsRequired
                : skillsRequired // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            experienceLevel: null == experienceLevel
                ? _value.experienceLevel
                : experienceLevel // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CreateJobInputImplCopyWith<$Res>
    implements $CreateJobInputCopyWith<$Res> {
  factory _$$CreateJobInputImplCopyWith(
    _$CreateJobInputImpl value,
    $Res Function(_$CreateJobInputImpl) then,
  ) = __$$CreateJobInputImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String title,
    String description,
    String categoryId,
    String type,
    double budgetMin,
    double budgetMax,
    String? deadline,
    List<String> skillsRequired,
    String experienceLevel,
  });
}

/// @nodoc
class __$$CreateJobInputImplCopyWithImpl<$Res>
    extends _$CreateJobInputCopyWithImpl<$Res, _$CreateJobInputImpl>
    implements _$$CreateJobInputImplCopyWith<$Res> {
  __$$CreateJobInputImplCopyWithImpl(
    _$CreateJobInputImpl _value,
    $Res Function(_$CreateJobInputImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CreateJobInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? title = null,
    Object? description = null,
    Object? categoryId = null,
    Object? type = null,
    Object? budgetMin = null,
    Object? budgetMax = null,
    Object? deadline = freezed,
    Object? skillsRequired = null,
    Object? experienceLevel = null,
  }) {
    return _then(
      _$CreateJobInputImpl(
        title: null == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        categoryId: null == categoryId
            ? _value.categoryId
            : categoryId // ignore: cast_nullable_to_non_nullable
                  as String,
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as String,
        budgetMin: null == budgetMin
            ? _value.budgetMin
            : budgetMin // ignore: cast_nullable_to_non_nullable
                  as double,
        budgetMax: null == budgetMax
            ? _value.budgetMax
            : budgetMax // ignore: cast_nullable_to_non_nullable
                  as double,
        deadline: freezed == deadline
            ? _value.deadline
            : deadline // ignore: cast_nullable_to_non_nullable
                  as String?,
        skillsRequired: null == skillsRequired
            ? _value._skillsRequired
            : skillsRequired // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        experienceLevel: null == experienceLevel
            ? _value.experienceLevel
            : experienceLevel // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc

@JsonSerializable(fieldRename: FieldRename.snake)
class _$CreateJobInputImpl extends _CreateJobInput {
  const _$CreateJobInputImpl({
    required this.title,
    required this.description,
    required this.categoryId,
    required this.type,
    required this.budgetMin,
    required this.budgetMax,
    this.deadline,
    final List<String> skillsRequired = const [],
    this.experienceLevel = 'intermediate',
  }) : _skillsRequired = skillsRequired,
       super._();

  factory _$CreateJobInputImpl.fromJson(Map<String, dynamic> json) =>
      _$$CreateJobInputImplFromJson(json);

  @override
  final String title;
  @override
  final String description;
  @override
  final String categoryId;
  @override
  final String type;
  @override
  final double budgetMin;
  @override
  final double budgetMax;
  @override
  final String? deadline;
  final List<String> _skillsRequired;
  @override
  @JsonKey()
  List<String> get skillsRequired {
    if (_skillsRequired is EqualUnmodifiableListView) return _skillsRequired;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_skillsRequired);
  }

  @override
  @JsonKey()
  final String experienceLevel;

  @override
  String toString() {
    return 'CreateJobInput(title: $title, description: $description, categoryId: $categoryId, type: $type, budgetMin: $budgetMin, budgetMax: $budgetMax, deadline: $deadline, skillsRequired: $skillsRequired, experienceLevel: $experienceLevel)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreateJobInputImpl &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.categoryId, categoryId) ||
                other.categoryId == categoryId) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.budgetMin, budgetMin) ||
                other.budgetMin == budgetMin) &&
            (identical(other.budgetMax, budgetMax) ||
                other.budgetMax == budgetMax) &&
            (identical(other.deadline, deadline) ||
                other.deadline == deadline) &&
            const DeepCollectionEquality().equals(
              other._skillsRequired,
              _skillsRequired,
            ) &&
            (identical(other.experienceLevel, experienceLevel) ||
                other.experienceLevel == experienceLevel));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    title,
    description,
    categoryId,
    type,
    budgetMin,
    budgetMax,
    deadline,
    const DeepCollectionEquality().hash(_skillsRequired),
    experienceLevel,
  );

  /// Create a copy of CreateJobInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreateJobInputImplCopyWith<_$CreateJobInputImpl> get copyWith =>
      __$$CreateJobInputImplCopyWithImpl<_$CreateJobInputImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CreateJobInputImplToJson(this);
  }
}

abstract class _CreateJobInput extends CreateJobInput {
  const factory _CreateJobInput({
    required final String title,
    required final String description,
    required final String categoryId,
    required final String type,
    required final double budgetMin,
    required final double budgetMax,
    final String? deadline,
    final List<String> skillsRequired,
    final String experienceLevel,
  }) = _$CreateJobInputImpl;
  const _CreateJobInput._() : super._();

  factory _CreateJobInput.fromJson(Map<String, dynamic> json) =
      _$CreateJobInputImpl.fromJson;

  @override
  String get title;
  @override
  String get description;
  @override
  String get categoryId;
  @override
  String get type;
  @override
  double get budgetMin;
  @override
  double get budgetMax;
  @override
  String? get deadline;
  @override
  List<String> get skillsRequired;
  @override
  String get experienceLevel;

  /// Create a copy of CreateJobInput
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreateJobInputImplCopyWith<_$CreateJobInputImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UpdateJobInput _$UpdateJobInputFromJson(Map<String, dynamic> json) {
  return _UpdateJobInput.fromJson(json);
}

/// @nodoc
mixin _$UpdateJobInput {
  String? get title => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  String? get categoryId => throw _privateConstructorUsedError;
  String? get type => throw _privateConstructorUsedError;
  double? get budgetMin => throw _privateConstructorUsedError;
  double? get budgetMax => throw _privateConstructorUsedError;
  String? get deadline => throw _privateConstructorUsedError;
  List<String>? get skillsRequired => throw _privateConstructorUsedError;
  String? get experienceLevel => throw _privateConstructorUsedError;
  String? get status => throw _privateConstructorUsedError;

  /// Serializes this UpdateJobInput to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of UpdateJobInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $UpdateJobInputCopyWith<UpdateJobInput> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UpdateJobInputCopyWith<$Res> {
  factory $UpdateJobInputCopyWith(
    UpdateJobInput value,
    $Res Function(UpdateJobInput) then,
  ) = _$UpdateJobInputCopyWithImpl<$Res, UpdateJobInput>;
  @useResult
  $Res call({
    String? title,
    String? description,
    String? categoryId,
    String? type,
    double? budgetMin,
    double? budgetMax,
    String? deadline,
    List<String>? skillsRequired,
    String? experienceLevel,
    String? status,
  });
}

/// @nodoc
class _$UpdateJobInputCopyWithImpl<$Res, $Val extends UpdateJobInput>
    implements $UpdateJobInputCopyWith<$Res> {
  _$UpdateJobInputCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of UpdateJobInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? title = freezed,
    Object? description = freezed,
    Object? categoryId = freezed,
    Object? type = freezed,
    Object? budgetMin = freezed,
    Object? budgetMax = freezed,
    Object? deadline = freezed,
    Object? skillsRequired = freezed,
    Object? experienceLevel = freezed,
    Object? status = freezed,
  }) {
    return _then(
      _value.copyWith(
            title: freezed == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String?,
            description: freezed == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String?,
            categoryId: freezed == categoryId
                ? _value.categoryId
                : categoryId // ignore: cast_nullable_to_non_nullable
                      as String?,
            type: freezed == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as String?,
            budgetMin: freezed == budgetMin
                ? _value.budgetMin
                : budgetMin // ignore: cast_nullable_to_non_nullable
                      as double?,
            budgetMax: freezed == budgetMax
                ? _value.budgetMax
                : budgetMax // ignore: cast_nullable_to_non_nullable
                      as double?,
            deadline: freezed == deadline
                ? _value.deadline
                : deadline // ignore: cast_nullable_to_non_nullable
                      as String?,
            skillsRequired: freezed == skillsRequired
                ? _value.skillsRequired
                : skillsRequired // ignore: cast_nullable_to_non_nullable
                      as List<String>?,
            experienceLevel: freezed == experienceLevel
                ? _value.experienceLevel
                : experienceLevel // ignore: cast_nullable_to_non_nullable
                      as String?,
            status: freezed == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$UpdateJobInputImplCopyWith<$Res>
    implements $UpdateJobInputCopyWith<$Res> {
  factory _$$UpdateJobInputImplCopyWith(
    _$UpdateJobInputImpl value,
    $Res Function(_$UpdateJobInputImpl) then,
  ) = __$$UpdateJobInputImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String? title,
    String? description,
    String? categoryId,
    String? type,
    double? budgetMin,
    double? budgetMax,
    String? deadline,
    List<String>? skillsRequired,
    String? experienceLevel,
    String? status,
  });
}

/// @nodoc
class __$$UpdateJobInputImplCopyWithImpl<$Res>
    extends _$UpdateJobInputCopyWithImpl<$Res, _$UpdateJobInputImpl>
    implements _$$UpdateJobInputImplCopyWith<$Res> {
  __$$UpdateJobInputImplCopyWithImpl(
    _$UpdateJobInputImpl _value,
    $Res Function(_$UpdateJobInputImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UpdateJobInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? title = freezed,
    Object? description = freezed,
    Object? categoryId = freezed,
    Object? type = freezed,
    Object? budgetMin = freezed,
    Object? budgetMax = freezed,
    Object? deadline = freezed,
    Object? skillsRequired = freezed,
    Object? experienceLevel = freezed,
    Object? status = freezed,
  }) {
    return _then(
      _$UpdateJobInputImpl(
        title: freezed == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String?,
        description: freezed == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String?,
        categoryId: freezed == categoryId
            ? _value.categoryId
            : categoryId // ignore: cast_nullable_to_non_nullable
                  as String?,
        type: freezed == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as String?,
        budgetMin: freezed == budgetMin
            ? _value.budgetMin
            : budgetMin // ignore: cast_nullable_to_non_nullable
                  as double?,
        budgetMax: freezed == budgetMax
            ? _value.budgetMax
            : budgetMax // ignore: cast_nullable_to_non_nullable
                  as double?,
        deadline: freezed == deadline
            ? _value.deadline
            : deadline // ignore: cast_nullable_to_non_nullable
                  as String?,
        skillsRequired: freezed == skillsRequired
            ? _value._skillsRequired
            : skillsRequired // ignore: cast_nullable_to_non_nullable
                  as List<String>?,
        experienceLevel: freezed == experienceLevel
            ? _value.experienceLevel
            : experienceLevel // ignore: cast_nullable_to_non_nullable
                  as String?,
        status: freezed == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc

@JsonSerializable(fieldRename: FieldRename.snake, includeIfNull: false)
class _$UpdateJobInputImpl extends _UpdateJobInput {
  const _$UpdateJobInputImpl({
    this.title,
    this.description,
    this.categoryId,
    this.type,
    this.budgetMin,
    this.budgetMax,
    this.deadline,
    final List<String>? skillsRequired,
    this.experienceLevel,
    this.status,
  }) : _skillsRequired = skillsRequired,
       super._();

  factory _$UpdateJobInputImpl.fromJson(Map<String, dynamic> json) =>
      _$$UpdateJobInputImplFromJson(json);

  @override
  final String? title;
  @override
  final String? description;
  @override
  final String? categoryId;
  @override
  final String? type;
  @override
  final double? budgetMin;
  @override
  final double? budgetMax;
  @override
  final String? deadline;
  final List<String>? _skillsRequired;
  @override
  List<String>? get skillsRequired {
    final value = _skillsRequired;
    if (value == null) return null;
    if (_skillsRequired is EqualUnmodifiableListView) return _skillsRequired;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final String? experienceLevel;
  @override
  final String? status;

  @override
  String toString() {
    return 'UpdateJobInput(title: $title, description: $description, categoryId: $categoryId, type: $type, budgetMin: $budgetMin, budgetMax: $budgetMax, deadline: $deadline, skillsRequired: $skillsRequired, experienceLevel: $experienceLevel, status: $status)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UpdateJobInputImpl &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.categoryId, categoryId) ||
                other.categoryId == categoryId) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.budgetMin, budgetMin) ||
                other.budgetMin == budgetMin) &&
            (identical(other.budgetMax, budgetMax) ||
                other.budgetMax == budgetMax) &&
            (identical(other.deadline, deadline) ||
                other.deadline == deadline) &&
            const DeepCollectionEquality().equals(
              other._skillsRequired,
              _skillsRequired,
            ) &&
            (identical(other.experienceLevel, experienceLevel) ||
                other.experienceLevel == experienceLevel) &&
            (identical(other.status, status) || other.status == status));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    title,
    description,
    categoryId,
    type,
    budgetMin,
    budgetMax,
    deadline,
    const DeepCollectionEquality().hash(_skillsRequired),
    experienceLevel,
    status,
  );

  /// Create a copy of UpdateJobInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UpdateJobInputImplCopyWith<_$UpdateJobInputImpl> get copyWith =>
      __$$UpdateJobInputImplCopyWithImpl<_$UpdateJobInputImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$UpdateJobInputImplToJson(this);
  }
}

abstract class _UpdateJobInput extends UpdateJobInput {
  const factory _UpdateJobInput({
    final String? title,
    final String? description,
    final String? categoryId,
    final String? type,
    final double? budgetMin,
    final double? budgetMax,
    final String? deadline,
    final List<String>? skillsRequired,
    final String? experienceLevel,
    final String? status,
  }) = _$UpdateJobInputImpl;
  const _UpdateJobInput._() : super._();

  factory _UpdateJobInput.fromJson(Map<String, dynamic> json) =
      _$UpdateJobInputImpl.fromJson;

  @override
  String? get title;
  @override
  String? get description;
  @override
  String? get categoryId;
  @override
  String? get type;
  @override
  double? get budgetMin;
  @override
  double? get budgetMax;
  @override
  String? get deadline;
  @override
  List<String>? get skillsRequired;
  @override
  String? get experienceLevel;
  @override
  String? get status;

  /// Create a copy of UpdateJobInput
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UpdateJobInputImplCopyWith<_$UpdateJobInputImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
