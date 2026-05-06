// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'proposal_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Proposal _$ProposalFromJson(Map<String, dynamic> json) {
  return _Proposal.fromJson(json);
}

/// @nodoc
mixin _$Proposal {
  String get id => throw _privateConstructorUsedError;
  String get jobId => throw _privateConstructorUsedError;
  PublicProfile get freelancer => throw _privateConstructorUsedError;
  String get coverLetter => throw _privateConstructorUsedError;
  double get proposedPrice => throw _privateConstructorUsedError;
  int get estimatedDays => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;

  /// Serializes this Proposal to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Proposal
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ProposalCopyWith<Proposal> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ProposalCopyWith<$Res> {
  factory $ProposalCopyWith(Proposal value, $Res Function(Proposal) then) =
      _$ProposalCopyWithImpl<$Res, Proposal>;
  @useResult
  $Res call({
    String id,
    String jobId,
    PublicProfile freelancer,
    String coverLetter,
    double proposedPrice,
    int estimatedDays,
    String status,
    DateTime createdAt,
  });

  $PublicProfileCopyWith<$Res> get freelancer;
}

/// @nodoc
class _$ProposalCopyWithImpl<$Res, $Val extends Proposal>
    implements $ProposalCopyWith<$Res> {
  _$ProposalCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Proposal
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? jobId = null,
    Object? freelancer = null,
    Object? coverLetter = null,
    Object? proposedPrice = null,
    Object? estimatedDays = null,
    Object? status = null,
    Object? createdAt = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            jobId: null == jobId
                ? _value.jobId
                : jobId // ignore: cast_nullable_to_non_nullable
                      as String,
            freelancer: null == freelancer
                ? _value.freelancer
                : freelancer // ignore: cast_nullable_to_non_nullable
                      as PublicProfile,
            coverLetter: null == coverLetter
                ? _value.coverLetter
                : coverLetter // ignore: cast_nullable_to_non_nullable
                      as String,
            proposedPrice: null == proposedPrice
                ? _value.proposedPrice
                : proposedPrice // ignore: cast_nullable_to_non_nullable
                      as double,
            estimatedDays: null == estimatedDays
                ? _value.estimatedDays
                : estimatedDays // ignore: cast_nullable_to_non_nullable
                      as int,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
          )
          as $Val,
    );
  }

  /// Create a copy of Proposal
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $PublicProfileCopyWith<$Res> get freelancer {
    return $PublicProfileCopyWith<$Res>(_value.freelancer, (value) {
      return _then(_value.copyWith(freelancer: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$ProposalImplCopyWith<$Res>
    implements $ProposalCopyWith<$Res> {
  factory _$$ProposalImplCopyWith(
    _$ProposalImpl value,
    $Res Function(_$ProposalImpl) then,
  ) = __$$ProposalImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String jobId,
    PublicProfile freelancer,
    String coverLetter,
    double proposedPrice,
    int estimatedDays,
    String status,
    DateTime createdAt,
  });

  @override
  $PublicProfileCopyWith<$Res> get freelancer;
}

/// @nodoc
class __$$ProposalImplCopyWithImpl<$Res>
    extends _$ProposalCopyWithImpl<$Res, _$ProposalImpl>
    implements _$$ProposalImplCopyWith<$Res> {
  __$$ProposalImplCopyWithImpl(
    _$ProposalImpl _value,
    $Res Function(_$ProposalImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Proposal
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? jobId = null,
    Object? freelancer = null,
    Object? coverLetter = null,
    Object? proposedPrice = null,
    Object? estimatedDays = null,
    Object? status = null,
    Object? createdAt = null,
  }) {
    return _then(
      _$ProposalImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        jobId: null == jobId
            ? _value.jobId
            : jobId // ignore: cast_nullable_to_non_nullable
                  as String,
        freelancer: null == freelancer
            ? _value.freelancer
            : freelancer // ignore: cast_nullable_to_non_nullable
                  as PublicProfile,
        coverLetter: null == coverLetter
            ? _value.coverLetter
            : coverLetter // ignore: cast_nullable_to_non_nullable
                  as String,
        proposedPrice: null == proposedPrice
            ? _value.proposedPrice
            : proposedPrice // ignore: cast_nullable_to_non_nullable
                  as double,
        estimatedDays: null == estimatedDays
            ? _value.estimatedDays
            : estimatedDays // ignore: cast_nullable_to_non_nullable
                  as int,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
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
class _$ProposalImpl extends _Proposal {
  const _$ProposalImpl({
    required this.id,
    required this.jobId,
    required this.freelancer,
    required this.coverLetter,
    required this.proposedPrice,
    required this.estimatedDays,
    required this.status,
    required this.createdAt,
  }) : super._();

  factory _$ProposalImpl.fromJson(Map<String, dynamic> json) =>
      _$$ProposalImplFromJson(json);

  @override
  final String id;
  @override
  final String jobId;
  @override
  final PublicProfile freelancer;
  @override
  final String coverLetter;
  @override
  final double proposedPrice;
  @override
  final int estimatedDays;
  @override
  final String status;
  @override
  final DateTime createdAt;

  @override
  String toString() {
    return 'Proposal(id: $id, jobId: $jobId, freelancer: $freelancer, coverLetter: $coverLetter, proposedPrice: $proposedPrice, estimatedDays: $estimatedDays, status: $status, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ProposalImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.jobId, jobId) || other.jobId == jobId) &&
            (identical(other.freelancer, freelancer) ||
                other.freelancer == freelancer) &&
            (identical(other.coverLetter, coverLetter) ||
                other.coverLetter == coverLetter) &&
            (identical(other.proposedPrice, proposedPrice) ||
                other.proposedPrice == proposedPrice) &&
            (identical(other.estimatedDays, estimatedDays) ||
                other.estimatedDays == estimatedDays) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    jobId,
    freelancer,
    coverLetter,
    proposedPrice,
    estimatedDays,
    status,
    createdAt,
  );

  /// Create a copy of Proposal
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ProposalImplCopyWith<_$ProposalImpl> get copyWith =>
      __$$ProposalImplCopyWithImpl<_$ProposalImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ProposalImplToJson(this);
  }
}

abstract class _Proposal extends Proposal {
  const factory _Proposal({
    required final String id,
    required final String jobId,
    required final PublicProfile freelancer,
    required final String coverLetter,
    required final double proposedPrice,
    required final int estimatedDays,
    required final String status,
    required final DateTime createdAt,
  }) = _$ProposalImpl;
  const _Proposal._() : super._();

  factory _Proposal.fromJson(Map<String, dynamic> json) =
      _$ProposalImpl.fromJson;

  @override
  String get id;
  @override
  String get jobId;
  @override
  PublicProfile get freelancer;
  @override
  String get coverLetter;
  @override
  double get proposedPrice;
  @override
  int get estimatedDays;
  @override
  String get status;
  @override
  DateTime get createdAt;

  /// Create a copy of Proposal
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ProposalImplCopyWith<_$ProposalImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CreateProposalInput _$CreateProposalInputFromJson(Map<String, dynamic> json) {
  return _CreateProposalInput.fromJson(json);
}

/// @nodoc
mixin _$CreateProposalInput {
  String get coverLetter => throw _privateConstructorUsedError;
  double get proposedPrice => throw _privateConstructorUsedError;
  int get estimatedDays => throw _privateConstructorUsedError;

  /// Serializes this CreateProposalInput to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CreateProposalInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreateProposalInputCopyWith<CreateProposalInput> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreateProposalInputCopyWith<$Res> {
  factory $CreateProposalInputCopyWith(
    CreateProposalInput value,
    $Res Function(CreateProposalInput) then,
  ) = _$CreateProposalInputCopyWithImpl<$Res, CreateProposalInput>;
  @useResult
  $Res call({String coverLetter, double proposedPrice, int estimatedDays});
}

/// @nodoc
class _$CreateProposalInputCopyWithImpl<$Res, $Val extends CreateProposalInput>
    implements $CreateProposalInputCopyWith<$Res> {
  _$CreateProposalInputCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreateProposalInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? coverLetter = null,
    Object? proposedPrice = null,
    Object? estimatedDays = null,
  }) {
    return _then(
      _value.copyWith(
            coverLetter: null == coverLetter
                ? _value.coverLetter
                : coverLetter // ignore: cast_nullable_to_non_nullable
                      as String,
            proposedPrice: null == proposedPrice
                ? _value.proposedPrice
                : proposedPrice // ignore: cast_nullable_to_non_nullable
                      as double,
            estimatedDays: null == estimatedDays
                ? _value.estimatedDays
                : estimatedDays // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CreateProposalInputImplCopyWith<$Res>
    implements $CreateProposalInputCopyWith<$Res> {
  factory _$$CreateProposalInputImplCopyWith(
    _$CreateProposalInputImpl value,
    $Res Function(_$CreateProposalInputImpl) then,
  ) = __$$CreateProposalInputImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String coverLetter, double proposedPrice, int estimatedDays});
}

/// @nodoc
class __$$CreateProposalInputImplCopyWithImpl<$Res>
    extends _$CreateProposalInputCopyWithImpl<$Res, _$CreateProposalInputImpl>
    implements _$$CreateProposalInputImplCopyWith<$Res> {
  __$$CreateProposalInputImplCopyWithImpl(
    _$CreateProposalInputImpl _value,
    $Res Function(_$CreateProposalInputImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CreateProposalInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? coverLetter = null,
    Object? proposedPrice = null,
    Object? estimatedDays = null,
  }) {
    return _then(
      _$CreateProposalInputImpl(
        coverLetter: null == coverLetter
            ? _value.coverLetter
            : coverLetter // ignore: cast_nullable_to_non_nullable
                  as String,
        proposedPrice: null == proposedPrice
            ? _value.proposedPrice
            : proposedPrice // ignore: cast_nullable_to_non_nullable
                  as double,
        estimatedDays: null == estimatedDays
            ? _value.estimatedDays
            : estimatedDays // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc

@JsonSerializable(fieldRename: FieldRename.snake)
class _$CreateProposalInputImpl extends _CreateProposalInput {
  const _$CreateProposalInputImpl({
    required this.coverLetter,
    required this.proposedPrice,
    required this.estimatedDays,
  }) : super._();

  factory _$CreateProposalInputImpl.fromJson(Map<String, dynamic> json) =>
      _$$CreateProposalInputImplFromJson(json);

  @override
  final String coverLetter;
  @override
  final double proposedPrice;
  @override
  final int estimatedDays;

  @override
  String toString() {
    return 'CreateProposalInput(coverLetter: $coverLetter, proposedPrice: $proposedPrice, estimatedDays: $estimatedDays)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreateProposalInputImpl &&
            (identical(other.coverLetter, coverLetter) ||
                other.coverLetter == coverLetter) &&
            (identical(other.proposedPrice, proposedPrice) ||
                other.proposedPrice == proposedPrice) &&
            (identical(other.estimatedDays, estimatedDays) ||
                other.estimatedDays == estimatedDays));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, coverLetter, proposedPrice, estimatedDays);

  /// Create a copy of CreateProposalInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreateProposalInputImplCopyWith<_$CreateProposalInputImpl> get copyWith =>
      __$$CreateProposalInputImplCopyWithImpl<_$CreateProposalInputImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CreateProposalInputImplToJson(this);
  }
}

abstract class _CreateProposalInput extends CreateProposalInput {
  const factory _CreateProposalInput({
    required final String coverLetter,
    required final double proposedPrice,
    required final int estimatedDays,
  }) = _$CreateProposalInputImpl;
  const _CreateProposalInput._() : super._();

  factory _CreateProposalInput.fromJson(Map<String, dynamic> json) =
      _$CreateProposalInputImpl.fromJson;

  @override
  String get coverLetter;
  @override
  double get proposedPrice;
  @override
  int get estimatedDays;

  /// Create a copy of CreateProposalInput
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreateProposalInputImplCopyWith<_$CreateProposalInputImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
