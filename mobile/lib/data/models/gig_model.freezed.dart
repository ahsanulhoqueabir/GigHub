// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'gig_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

GigImage _$GigImageFromJson(Map<String, dynamic> json) {
  return _GigImage.fromJson(json);
}

/// @nodoc
mixin _$GigImage {
  String get url => throw _privateConstructorUsedError;
  int get sortOrder => throw _privateConstructorUsedError;

  /// Serializes this GigImage to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of GigImage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $GigImageCopyWith<GigImage> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $GigImageCopyWith<$Res> {
  factory $GigImageCopyWith(GigImage value, $Res Function(GigImage) then) =
      _$GigImageCopyWithImpl<$Res, GigImage>;
  @useResult
  $Res call({String url, int sortOrder});
}

/// @nodoc
class _$GigImageCopyWithImpl<$Res, $Val extends GigImage>
    implements $GigImageCopyWith<$Res> {
  _$GigImageCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of GigImage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? url = null, Object? sortOrder = null}) {
    return _then(
      _value.copyWith(
            url: null == url
                ? _value.url
                : url // ignore: cast_nullable_to_non_nullable
                      as String,
            sortOrder: null == sortOrder
                ? _value.sortOrder
                : sortOrder // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$GigImageImplCopyWith<$Res>
    implements $GigImageCopyWith<$Res> {
  factory _$$GigImageImplCopyWith(
    _$GigImageImpl value,
    $Res Function(_$GigImageImpl) then,
  ) = __$$GigImageImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String url, int sortOrder});
}

/// @nodoc
class __$$GigImageImplCopyWithImpl<$Res>
    extends _$GigImageCopyWithImpl<$Res, _$GigImageImpl>
    implements _$$GigImageImplCopyWith<$Res> {
  __$$GigImageImplCopyWithImpl(
    _$GigImageImpl _value,
    $Res Function(_$GigImageImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of GigImage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? url = null, Object? sortOrder = null}) {
    return _then(
      _$GigImageImpl(
        url: null == url
            ? _value.url
            : url // ignore: cast_nullable_to_non_nullable
                  as String,
        sortOrder: null == sortOrder
            ? _value.sortOrder
            : sortOrder // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc

@JsonSerializable(fieldRename: FieldRename.snake)
class _$GigImageImpl extends _GigImage {
  const _$GigImageImpl({this.url = '', this.sortOrder = 0}) : super._();

  factory _$GigImageImpl.fromJson(Map<String, dynamic> json) =>
      _$$GigImageImplFromJson(json);

  @override
  @JsonKey()
  final String url;
  @override
  @JsonKey()
  final int sortOrder;

  @override
  String toString() {
    return 'GigImage(url: $url, sortOrder: $sortOrder)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$GigImageImpl &&
            (identical(other.url, url) || other.url == url) &&
            (identical(other.sortOrder, sortOrder) ||
                other.sortOrder == sortOrder));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, url, sortOrder);

  /// Create a copy of GigImage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$GigImageImplCopyWith<_$GigImageImpl> get copyWith =>
      __$$GigImageImplCopyWithImpl<_$GigImageImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$GigImageImplToJson(this);
  }
}

abstract class _GigImage extends GigImage {
  const factory _GigImage({final String url, final int sortOrder}) =
      _$GigImageImpl;
  const _GigImage._() : super._();

  factory _GigImage.fromJson(Map<String, dynamic> json) =
      _$GigImageImpl.fromJson;

  @override
  String get url;
  @override
  int get sortOrder;

  /// Create a copy of GigImage
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$GigImageImplCopyWith<_$GigImageImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

GigSummary _$GigSummaryFromJson(Map<String, dynamic> json) {
  return _GigSummary.fromJson(json);
}

/// @nodoc
mixin _$GigSummary {
  String get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get slug => throw _privateConstructorUsedError;
  Category get category => throw _privateConstructorUsedError;
  PublicProfile get seller => throw _privateConstructorUsedError;
  List<GigImage> get images => throw _privateConstructorUsedError;
  @JsonKey(fromJson: _doubleFromAnything)
  double get startingPrice => throw _privateConstructorUsedError;
  @JsonKey(fromJson: _doubleFromAnything)
  double get avgRating => throw _privateConstructorUsedError;
  int get totalReviews => throw _privateConstructorUsedError;
  int get totalOrders => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;

  /// Serializes this GigSummary to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of GigSummary
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $GigSummaryCopyWith<GigSummary> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $GigSummaryCopyWith<$Res> {
  factory $GigSummaryCopyWith(
    GigSummary value,
    $Res Function(GigSummary) then,
  ) = _$GigSummaryCopyWithImpl<$Res, GigSummary>;
  @useResult
  $Res call({
    String id,
    String title,
    String slug,
    Category category,
    PublicProfile seller,
    List<GigImage> images,
    @JsonKey(fromJson: _doubleFromAnything) double startingPrice,
    @JsonKey(fromJson: _doubleFromAnything) double avgRating,
    int totalReviews,
    int totalOrders,
    String status,
  });

  $CategoryCopyWith<$Res> get category;
  $PublicProfileCopyWith<$Res> get seller;
}

/// @nodoc
class _$GigSummaryCopyWithImpl<$Res, $Val extends GigSummary>
    implements $GigSummaryCopyWith<$Res> {
  _$GigSummaryCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of GigSummary
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? slug = null,
    Object? category = null,
    Object? seller = null,
    Object? images = null,
    Object? startingPrice = null,
    Object? avgRating = null,
    Object? totalReviews = null,
    Object? totalOrders = null,
    Object? status = null,
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
            category: null == category
                ? _value.category
                : category // ignore: cast_nullable_to_non_nullable
                      as Category,
            seller: null == seller
                ? _value.seller
                : seller // ignore: cast_nullable_to_non_nullable
                      as PublicProfile,
            images: null == images
                ? _value.images
                : images // ignore: cast_nullable_to_non_nullable
                      as List<GigImage>,
            startingPrice: null == startingPrice
                ? _value.startingPrice
                : startingPrice // ignore: cast_nullable_to_non_nullable
                      as double,
            avgRating: null == avgRating
                ? _value.avgRating
                : avgRating // ignore: cast_nullable_to_non_nullable
                      as double,
            totalReviews: null == totalReviews
                ? _value.totalReviews
                : totalReviews // ignore: cast_nullable_to_non_nullable
                      as int,
            totalOrders: null == totalOrders
                ? _value.totalOrders
                : totalOrders // ignore: cast_nullable_to_non_nullable
                      as int,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }

  /// Create a copy of GigSummary
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $CategoryCopyWith<$Res> get category {
    return $CategoryCopyWith<$Res>(_value.category, (value) {
      return _then(_value.copyWith(category: value) as $Val);
    });
  }

  /// Create a copy of GigSummary
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $PublicProfileCopyWith<$Res> get seller {
    return $PublicProfileCopyWith<$Res>(_value.seller, (value) {
      return _then(_value.copyWith(seller: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$GigSummaryImplCopyWith<$Res>
    implements $GigSummaryCopyWith<$Res> {
  factory _$$GigSummaryImplCopyWith(
    _$GigSummaryImpl value,
    $Res Function(_$GigSummaryImpl) then,
  ) = __$$GigSummaryImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String title,
    String slug,
    Category category,
    PublicProfile seller,
    List<GigImage> images,
    @JsonKey(fromJson: _doubleFromAnything) double startingPrice,
    @JsonKey(fromJson: _doubleFromAnything) double avgRating,
    int totalReviews,
    int totalOrders,
    String status,
  });

  @override
  $CategoryCopyWith<$Res> get category;
  @override
  $PublicProfileCopyWith<$Res> get seller;
}

/// @nodoc
class __$$GigSummaryImplCopyWithImpl<$Res>
    extends _$GigSummaryCopyWithImpl<$Res, _$GigSummaryImpl>
    implements _$$GigSummaryImplCopyWith<$Res> {
  __$$GigSummaryImplCopyWithImpl(
    _$GigSummaryImpl _value,
    $Res Function(_$GigSummaryImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of GigSummary
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? slug = null,
    Object? category = null,
    Object? seller = null,
    Object? images = null,
    Object? startingPrice = null,
    Object? avgRating = null,
    Object? totalReviews = null,
    Object? totalOrders = null,
    Object? status = null,
  }) {
    return _then(
      _$GigSummaryImpl(
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
        category: null == category
            ? _value.category
            : category // ignore: cast_nullable_to_non_nullable
                  as Category,
        seller: null == seller
            ? _value.seller
            : seller // ignore: cast_nullable_to_non_nullable
                  as PublicProfile,
        images: null == images
            ? _value._images
            : images // ignore: cast_nullable_to_non_nullable
                  as List<GigImage>,
        startingPrice: null == startingPrice
            ? _value.startingPrice
            : startingPrice // ignore: cast_nullable_to_non_nullable
                  as double,
        avgRating: null == avgRating
            ? _value.avgRating
            : avgRating // ignore: cast_nullable_to_non_nullable
                  as double,
        totalReviews: null == totalReviews
            ? _value.totalReviews
            : totalReviews // ignore: cast_nullable_to_non_nullable
                  as int,
        totalOrders: null == totalOrders
            ? _value.totalOrders
            : totalOrders // ignore: cast_nullable_to_non_nullable
                  as int,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc

@JsonSerializable(fieldRename: FieldRename.snake)
class _$GigSummaryImpl extends _GigSummary {
  const _$GigSummaryImpl({
    required this.id,
    required this.title,
    required this.slug,
    required this.category,
    required this.seller,
    final List<GigImage> images = const [],
    @JsonKey(fromJson: _doubleFromAnything) required this.startingPrice,
    @JsonKey(fromJson: _doubleFromAnything) required this.avgRating,
    required this.totalReviews,
    this.totalOrders = 0,
    required this.status,
  }) : _images = images,
       super._();

  factory _$GigSummaryImpl.fromJson(Map<String, dynamic> json) =>
      _$$GigSummaryImplFromJson(json);

  @override
  final String id;
  @override
  final String title;
  @override
  final String slug;
  @override
  final Category category;
  @override
  final PublicProfile seller;
  final List<GigImage> _images;
  @override
  @JsonKey()
  List<GigImage> get images {
    if (_images is EqualUnmodifiableListView) return _images;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_images);
  }

  @override
  @JsonKey(fromJson: _doubleFromAnything)
  final double startingPrice;
  @override
  @JsonKey(fromJson: _doubleFromAnything)
  final double avgRating;
  @override
  final int totalReviews;
  @override
  @JsonKey()
  final int totalOrders;
  @override
  final String status;

  @override
  String toString() {
    return 'GigSummary(id: $id, title: $title, slug: $slug, category: $category, seller: $seller, images: $images, startingPrice: $startingPrice, avgRating: $avgRating, totalReviews: $totalReviews, totalOrders: $totalOrders, status: $status)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$GigSummaryImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.slug, slug) || other.slug == slug) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.seller, seller) || other.seller == seller) &&
            const DeepCollectionEquality().equals(other._images, _images) &&
            (identical(other.startingPrice, startingPrice) ||
                other.startingPrice == startingPrice) &&
            (identical(other.avgRating, avgRating) ||
                other.avgRating == avgRating) &&
            (identical(other.totalReviews, totalReviews) ||
                other.totalReviews == totalReviews) &&
            (identical(other.totalOrders, totalOrders) ||
                other.totalOrders == totalOrders) &&
            (identical(other.status, status) || other.status == status));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    title,
    slug,
    category,
    seller,
    const DeepCollectionEquality().hash(_images),
    startingPrice,
    avgRating,
    totalReviews,
    totalOrders,
    status,
  );

  /// Create a copy of GigSummary
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$GigSummaryImplCopyWith<_$GigSummaryImpl> get copyWith =>
      __$$GigSummaryImplCopyWithImpl<_$GigSummaryImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$GigSummaryImplToJson(this);
  }
}

abstract class _GigSummary extends GigSummary {
  const factory _GigSummary({
    required final String id,
    required final String title,
    required final String slug,
    required final Category category,
    required final PublicProfile seller,
    final List<GigImage> images,
    @JsonKey(fromJson: _doubleFromAnything) required final double startingPrice,
    @JsonKey(fromJson: _doubleFromAnything) required final double avgRating,
    required final int totalReviews,
    final int totalOrders,
    required final String status,
  }) = _$GigSummaryImpl;
  const _GigSummary._() : super._();

  factory _GigSummary.fromJson(Map<String, dynamic> json) =
      _$GigSummaryImpl.fromJson;

  @override
  String get id;
  @override
  String get title;
  @override
  String get slug;
  @override
  Category get category;
  @override
  PublicProfile get seller;
  @override
  List<GigImage> get images;
  @override
  @JsonKey(fromJson: _doubleFromAnything)
  double get startingPrice;
  @override
  @JsonKey(fromJson: _doubleFromAnything)
  double get avgRating;
  @override
  int get totalReviews;
  @override
  int get totalOrders;
  @override
  String get status;

  /// Create a copy of GigSummary
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$GigSummaryImplCopyWith<_$GigSummaryImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

GigDetail _$GigDetailFromJson(Map<String, dynamic> json) {
  return _GigDetail.fromJson(json);
}

/// @nodoc
mixin _$GigDetail {
  String get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get slug => throw _privateConstructorUsedError;
  Category get category => throw _privateConstructorUsedError;
  PublicProfile get seller => throw _privateConstructorUsedError;
  List<GigImage> get images => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  @JsonKey(fromJson: _doubleFromAnything)
  double get startingPrice => throw _privateConstructorUsedError;
  @JsonKey(fromJson: _doubleFromAnything)
  double get avgRating => throw _privateConstructorUsedError;
  int get totalReviews => throw _privateConstructorUsedError;
  int get totalOrders => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  List<String> get tags => throw _privateConstructorUsedError;
  List<GigPackage> get packages => throw _privateConstructorUsedError;
  int get deliveryDaysMin => throw _privateConstructorUsedError;

  /// Serializes this GigDetail to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of GigDetail
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $GigDetailCopyWith<GigDetail> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $GigDetailCopyWith<$Res> {
  factory $GigDetailCopyWith(GigDetail value, $Res Function(GigDetail) then) =
      _$GigDetailCopyWithImpl<$Res, GigDetail>;
  @useResult
  $Res call({
    String id,
    String title,
    String slug,
    Category category,
    PublicProfile seller,
    List<GigImage> images,
    String description,
    @JsonKey(fromJson: _doubleFromAnything) double startingPrice,
    @JsonKey(fromJson: _doubleFromAnything) double avgRating,
    int totalReviews,
    int totalOrders,
    String status,
    List<String> tags,
    List<GigPackage> packages,
    int deliveryDaysMin,
  });

  $CategoryCopyWith<$Res> get category;
  $PublicProfileCopyWith<$Res> get seller;
}

/// @nodoc
class _$GigDetailCopyWithImpl<$Res, $Val extends GigDetail>
    implements $GigDetailCopyWith<$Res> {
  _$GigDetailCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of GigDetail
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? slug = null,
    Object? category = null,
    Object? seller = null,
    Object? images = null,
    Object? description = null,
    Object? startingPrice = null,
    Object? avgRating = null,
    Object? totalReviews = null,
    Object? totalOrders = null,
    Object? status = null,
    Object? tags = null,
    Object? packages = null,
    Object? deliveryDaysMin = null,
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
            category: null == category
                ? _value.category
                : category // ignore: cast_nullable_to_non_nullable
                      as Category,
            seller: null == seller
                ? _value.seller
                : seller // ignore: cast_nullable_to_non_nullable
                      as PublicProfile,
            images: null == images
                ? _value.images
                : images // ignore: cast_nullable_to_non_nullable
                      as List<GigImage>,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            startingPrice: null == startingPrice
                ? _value.startingPrice
                : startingPrice // ignore: cast_nullable_to_non_nullable
                      as double,
            avgRating: null == avgRating
                ? _value.avgRating
                : avgRating // ignore: cast_nullable_to_non_nullable
                      as double,
            totalReviews: null == totalReviews
                ? _value.totalReviews
                : totalReviews // ignore: cast_nullable_to_non_nullable
                      as int,
            totalOrders: null == totalOrders
                ? _value.totalOrders
                : totalOrders // ignore: cast_nullable_to_non_nullable
                      as int,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            tags: null == tags
                ? _value.tags
                : tags // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            packages: null == packages
                ? _value.packages
                : packages // ignore: cast_nullable_to_non_nullable
                      as List<GigPackage>,
            deliveryDaysMin: null == deliveryDaysMin
                ? _value.deliveryDaysMin
                : deliveryDaysMin // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }

  /// Create a copy of GigDetail
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $CategoryCopyWith<$Res> get category {
    return $CategoryCopyWith<$Res>(_value.category, (value) {
      return _then(_value.copyWith(category: value) as $Val);
    });
  }

  /// Create a copy of GigDetail
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $PublicProfileCopyWith<$Res> get seller {
    return $PublicProfileCopyWith<$Res>(_value.seller, (value) {
      return _then(_value.copyWith(seller: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$GigDetailImplCopyWith<$Res>
    implements $GigDetailCopyWith<$Res> {
  factory _$$GigDetailImplCopyWith(
    _$GigDetailImpl value,
    $Res Function(_$GigDetailImpl) then,
  ) = __$$GigDetailImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String title,
    String slug,
    Category category,
    PublicProfile seller,
    List<GigImage> images,
    String description,
    @JsonKey(fromJson: _doubleFromAnything) double startingPrice,
    @JsonKey(fromJson: _doubleFromAnything) double avgRating,
    int totalReviews,
    int totalOrders,
    String status,
    List<String> tags,
    List<GigPackage> packages,
    int deliveryDaysMin,
  });

  @override
  $CategoryCopyWith<$Res> get category;
  @override
  $PublicProfileCopyWith<$Res> get seller;
}

/// @nodoc
class __$$GigDetailImplCopyWithImpl<$Res>
    extends _$GigDetailCopyWithImpl<$Res, _$GigDetailImpl>
    implements _$$GigDetailImplCopyWith<$Res> {
  __$$GigDetailImplCopyWithImpl(
    _$GigDetailImpl _value,
    $Res Function(_$GigDetailImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of GigDetail
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? slug = null,
    Object? category = null,
    Object? seller = null,
    Object? images = null,
    Object? description = null,
    Object? startingPrice = null,
    Object? avgRating = null,
    Object? totalReviews = null,
    Object? totalOrders = null,
    Object? status = null,
    Object? tags = null,
    Object? packages = null,
    Object? deliveryDaysMin = null,
  }) {
    return _then(
      _$GigDetailImpl(
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
        category: null == category
            ? _value.category
            : category // ignore: cast_nullable_to_non_nullable
                  as Category,
        seller: null == seller
            ? _value.seller
            : seller // ignore: cast_nullable_to_non_nullable
                  as PublicProfile,
        images: null == images
            ? _value._images
            : images // ignore: cast_nullable_to_non_nullable
                  as List<GigImage>,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        startingPrice: null == startingPrice
            ? _value.startingPrice
            : startingPrice // ignore: cast_nullable_to_non_nullable
                  as double,
        avgRating: null == avgRating
            ? _value.avgRating
            : avgRating // ignore: cast_nullable_to_non_nullable
                  as double,
        totalReviews: null == totalReviews
            ? _value.totalReviews
            : totalReviews // ignore: cast_nullable_to_non_nullable
                  as int,
        totalOrders: null == totalOrders
            ? _value.totalOrders
            : totalOrders // ignore: cast_nullable_to_non_nullable
                  as int,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        tags: null == tags
            ? _value._tags
            : tags // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        packages: null == packages
            ? _value._packages
            : packages // ignore: cast_nullable_to_non_nullable
                  as List<GigPackage>,
        deliveryDaysMin: null == deliveryDaysMin
            ? _value.deliveryDaysMin
            : deliveryDaysMin // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc

@JsonSerializable(fieldRename: FieldRename.snake)
class _$GigDetailImpl extends _GigDetail {
  const _$GigDetailImpl({
    required this.id,
    required this.title,
    required this.slug,
    required this.category,
    required this.seller,
    final List<GigImage> images = const [],
    required this.description,
    @JsonKey(fromJson: _doubleFromAnything) required this.startingPrice,
    @JsonKey(fromJson: _doubleFromAnything) required this.avgRating,
    required this.totalReviews,
    this.totalOrders = 0,
    required this.status,
    final List<String> tags = const [],
    final List<GigPackage> packages = const [],
    this.deliveryDaysMin = 1,
  }) : _images = images,
       _tags = tags,
       _packages = packages,
       super._();

  factory _$GigDetailImpl.fromJson(Map<String, dynamic> json) =>
      _$$GigDetailImplFromJson(json);

  @override
  final String id;
  @override
  final String title;
  @override
  final String slug;
  @override
  final Category category;
  @override
  final PublicProfile seller;
  final List<GigImage> _images;
  @override
  @JsonKey()
  List<GigImage> get images {
    if (_images is EqualUnmodifiableListView) return _images;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_images);
  }

  @override
  final String description;
  @override
  @JsonKey(fromJson: _doubleFromAnything)
  final double startingPrice;
  @override
  @JsonKey(fromJson: _doubleFromAnything)
  final double avgRating;
  @override
  final int totalReviews;
  @override
  @JsonKey()
  final int totalOrders;
  @override
  final String status;
  final List<String> _tags;
  @override
  @JsonKey()
  List<String> get tags {
    if (_tags is EqualUnmodifiableListView) return _tags;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_tags);
  }

  final List<GigPackage> _packages;
  @override
  @JsonKey()
  List<GigPackage> get packages {
    if (_packages is EqualUnmodifiableListView) return _packages;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_packages);
  }

  @override
  @JsonKey()
  final int deliveryDaysMin;

  @override
  String toString() {
    return 'GigDetail(id: $id, title: $title, slug: $slug, category: $category, seller: $seller, images: $images, description: $description, startingPrice: $startingPrice, avgRating: $avgRating, totalReviews: $totalReviews, totalOrders: $totalOrders, status: $status, tags: $tags, packages: $packages, deliveryDaysMin: $deliveryDaysMin)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$GigDetailImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.slug, slug) || other.slug == slug) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.seller, seller) || other.seller == seller) &&
            const DeepCollectionEquality().equals(other._images, _images) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.startingPrice, startingPrice) ||
                other.startingPrice == startingPrice) &&
            (identical(other.avgRating, avgRating) ||
                other.avgRating == avgRating) &&
            (identical(other.totalReviews, totalReviews) ||
                other.totalReviews == totalReviews) &&
            (identical(other.totalOrders, totalOrders) ||
                other.totalOrders == totalOrders) &&
            (identical(other.status, status) || other.status == status) &&
            const DeepCollectionEquality().equals(other._tags, _tags) &&
            const DeepCollectionEquality().equals(other._packages, _packages) &&
            (identical(other.deliveryDaysMin, deliveryDaysMin) ||
                other.deliveryDaysMin == deliveryDaysMin));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    title,
    slug,
    category,
    seller,
    const DeepCollectionEquality().hash(_images),
    description,
    startingPrice,
    avgRating,
    totalReviews,
    totalOrders,
    status,
    const DeepCollectionEquality().hash(_tags),
    const DeepCollectionEquality().hash(_packages),
    deliveryDaysMin,
  );

  /// Create a copy of GigDetail
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$GigDetailImplCopyWith<_$GigDetailImpl> get copyWith =>
      __$$GigDetailImplCopyWithImpl<_$GigDetailImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$GigDetailImplToJson(this);
  }
}

abstract class _GigDetail extends GigDetail {
  const factory _GigDetail({
    required final String id,
    required final String title,
    required final String slug,
    required final Category category,
    required final PublicProfile seller,
    final List<GigImage> images,
    required final String description,
    @JsonKey(fromJson: _doubleFromAnything) required final double startingPrice,
    @JsonKey(fromJson: _doubleFromAnything) required final double avgRating,
    required final int totalReviews,
    final int totalOrders,
    required final String status,
    final List<String> tags,
    final List<GigPackage> packages,
    final int deliveryDaysMin,
  }) = _$GigDetailImpl;
  const _GigDetail._() : super._();

  factory _GigDetail.fromJson(Map<String, dynamic> json) =
      _$GigDetailImpl.fromJson;

  @override
  String get id;
  @override
  String get title;
  @override
  String get slug;
  @override
  Category get category;
  @override
  PublicProfile get seller;
  @override
  List<GigImage> get images;
  @override
  String get description;
  @override
  @JsonKey(fromJson: _doubleFromAnything)
  double get startingPrice;
  @override
  @JsonKey(fromJson: _doubleFromAnything)
  double get avgRating;
  @override
  int get totalReviews;
  @override
  int get totalOrders;
  @override
  String get status;
  @override
  List<String> get tags;
  @override
  List<GigPackage> get packages;
  @override
  int get deliveryDaysMin;

  /// Create a copy of GigDetail
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$GigDetailImplCopyWith<_$GigDetailImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

GigPackage _$GigPackageFromJson(Map<String, dynamic> json) {
  return _GigPackage.fromJson(json);
}

/// @nodoc
mixin _$GigPackage {
  String get id => throw _privateConstructorUsedError;
  String get tier => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  @JsonKey(fromJson: _doubleFromAnything)
  double get price => throw _privateConstructorUsedError;
  int get deliveryDays => throw _privateConstructorUsedError;
  @JsonKey(name: 'revision_count')
  int get revisions => throw _privateConstructorUsedError;
  List<String> get features => throw _privateConstructorUsedError;

  /// Serializes this GigPackage to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of GigPackage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $GigPackageCopyWith<GigPackage> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $GigPackageCopyWith<$Res> {
  factory $GigPackageCopyWith(
    GigPackage value,
    $Res Function(GigPackage) then,
  ) = _$GigPackageCopyWithImpl<$Res, GigPackage>;
  @useResult
  $Res call({
    String id,
    String tier,
    String title,
    String description,
    @JsonKey(fromJson: _doubleFromAnything) double price,
    int deliveryDays,
    @JsonKey(name: 'revision_count') int revisions,
    List<String> features,
  });
}

/// @nodoc
class _$GigPackageCopyWithImpl<$Res, $Val extends GigPackage>
    implements $GigPackageCopyWith<$Res> {
  _$GigPackageCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of GigPackage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tier = null,
    Object? title = null,
    Object? description = null,
    Object? price = null,
    Object? deliveryDays = null,
    Object? revisions = null,
    Object? features = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            tier: null == tier
                ? _value.tier
                : tier // ignore: cast_nullable_to_non_nullable
                      as String,
            title: null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            price: null == price
                ? _value.price
                : price // ignore: cast_nullable_to_non_nullable
                      as double,
            deliveryDays: null == deliveryDays
                ? _value.deliveryDays
                : deliveryDays // ignore: cast_nullable_to_non_nullable
                      as int,
            revisions: null == revisions
                ? _value.revisions
                : revisions // ignore: cast_nullable_to_non_nullable
                      as int,
            features: null == features
                ? _value.features
                : features // ignore: cast_nullable_to_non_nullable
                      as List<String>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$GigPackageImplCopyWith<$Res>
    implements $GigPackageCopyWith<$Res> {
  factory _$$GigPackageImplCopyWith(
    _$GigPackageImpl value,
    $Res Function(_$GigPackageImpl) then,
  ) = __$$GigPackageImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String tier,
    String title,
    String description,
    @JsonKey(fromJson: _doubleFromAnything) double price,
    int deliveryDays,
    @JsonKey(name: 'revision_count') int revisions,
    List<String> features,
  });
}

/// @nodoc
class __$$GigPackageImplCopyWithImpl<$Res>
    extends _$GigPackageCopyWithImpl<$Res, _$GigPackageImpl>
    implements _$$GigPackageImplCopyWith<$Res> {
  __$$GigPackageImplCopyWithImpl(
    _$GigPackageImpl _value,
    $Res Function(_$GigPackageImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of GigPackage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? tier = null,
    Object? title = null,
    Object? description = null,
    Object? price = null,
    Object? deliveryDays = null,
    Object? revisions = null,
    Object? features = null,
  }) {
    return _then(
      _$GigPackageImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        tier: null == tier
            ? _value.tier
            : tier // ignore: cast_nullable_to_non_nullable
                  as String,
        title: null == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        price: null == price
            ? _value.price
            : price // ignore: cast_nullable_to_non_nullable
                  as double,
        deliveryDays: null == deliveryDays
            ? _value.deliveryDays
            : deliveryDays // ignore: cast_nullable_to_non_nullable
                  as int,
        revisions: null == revisions
            ? _value.revisions
            : revisions // ignore: cast_nullable_to_non_nullable
                  as int,
        features: null == features
            ? _value._features
            : features // ignore: cast_nullable_to_non_nullable
                  as List<String>,
      ),
    );
  }
}

/// @nodoc

@JsonSerializable(fieldRename: FieldRename.snake)
class _$GigPackageImpl extends _GigPackage {
  const _$GigPackageImpl({
    required this.id,
    required this.tier,
    required this.title,
    required this.description,
    @JsonKey(fromJson: _doubleFromAnything) required this.price,
    required this.deliveryDays,
    @JsonKey(name: 'revision_count') required this.revisions,
    final List<String> features = const [],
  }) : _features = features,
       super._();

  factory _$GigPackageImpl.fromJson(Map<String, dynamic> json) =>
      _$$GigPackageImplFromJson(json);

  @override
  final String id;
  @override
  final String tier;
  @override
  final String title;
  @override
  final String description;
  @override
  @JsonKey(fromJson: _doubleFromAnything)
  final double price;
  @override
  final int deliveryDays;
  @override
  @JsonKey(name: 'revision_count')
  final int revisions;
  final List<String> _features;
  @override
  @JsonKey()
  List<String> get features {
    if (_features is EqualUnmodifiableListView) return _features;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_features);
  }

  @override
  String toString() {
    return 'GigPackage(id: $id, tier: $tier, title: $title, description: $description, price: $price, deliveryDays: $deliveryDays, revisions: $revisions, features: $features)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$GigPackageImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.tier, tier) || other.tier == tier) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.price, price) || other.price == price) &&
            (identical(other.deliveryDays, deliveryDays) ||
                other.deliveryDays == deliveryDays) &&
            (identical(other.revisions, revisions) ||
                other.revisions == revisions) &&
            const DeepCollectionEquality().equals(other._features, _features));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    tier,
    title,
    description,
    price,
    deliveryDays,
    revisions,
    const DeepCollectionEquality().hash(_features),
  );

  /// Create a copy of GigPackage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$GigPackageImplCopyWith<_$GigPackageImpl> get copyWith =>
      __$$GigPackageImplCopyWithImpl<_$GigPackageImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$GigPackageImplToJson(this);
  }
}

abstract class _GigPackage extends GigPackage {
  const factory _GigPackage({
    required final String id,
    required final String tier,
    required final String title,
    required final String description,
    @JsonKey(fromJson: _doubleFromAnything) required final double price,
    required final int deliveryDays,
    @JsonKey(name: 'revision_count') required final int revisions,
    final List<String> features,
  }) = _$GigPackageImpl;
  const _GigPackage._() : super._();

  factory _GigPackage.fromJson(Map<String, dynamic> json) =
      _$GigPackageImpl.fromJson;

  @override
  String get id;
  @override
  String get tier;
  @override
  String get title;
  @override
  String get description;
  @override
  @JsonKey(fromJson: _doubleFromAnything)
  double get price;
  @override
  int get deliveryDays;
  @override
  @JsonKey(name: 'revision_count')
  int get revisions;
  @override
  List<String> get features;

  /// Create a copy of GigPackage
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$GigPackageImplCopyWith<_$GigPackageImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CreateGigInput _$CreateGigInputFromJson(Map<String, dynamic> json) {
  return _CreateGigInput.fromJson(json);
}

/// @nodoc
mixin _$CreateGigInput {
  String get title => throw _privateConstructorUsedError;
  String get categoryId => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  List<CreatePackageInput> get packages => throw _privateConstructorUsedError;
  List<String> get tags => throw _privateConstructorUsedError;
  List<String> get images => throw _privateConstructorUsedError;

  /// Serializes this CreateGigInput to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CreateGigInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreateGigInputCopyWith<CreateGigInput> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreateGigInputCopyWith<$Res> {
  factory $CreateGigInputCopyWith(
    CreateGigInput value,
    $Res Function(CreateGigInput) then,
  ) = _$CreateGigInputCopyWithImpl<$Res, CreateGigInput>;
  @useResult
  $Res call({
    String title,
    String categoryId,
    String description,
    List<CreatePackageInput> packages,
    List<String> tags,
    List<String> images,
  });
}

/// @nodoc
class _$CreateGigInputCopyWithImpl<$Res, $Val extends CreateGigInput>
    implements $CreateGigInputCopyWith<$Res> {
  _$CreateGigInputCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreateGigInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? title = null,
    Object? categoryId = null,
    Object? description = null,
    Object? packages = null,
    Object? tags = null,
    Object? images = null,
  }) {
    return _then(
      _value.copyWith(
            title: null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String,
            categoryId: null == categoryId
                ? _value.categoryId
                : categoryId // ignore: cast_nullable_to_non_nullable
                      as String,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            packages: null == packages
                ? _value.packages
                : packages // ignore: cast_nullable_to_non_nullable
                      as List<CreatePackageInput>,
            tags: null == tags
                ? _value.tags
                : tags // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            images: null == images
                ? _value.images
                : images // ignore: cast_nullable_to_non_nullable
                      as List<String>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CreateGigInputImplCopyWith<$Res>
    implements $CreateGigInputCopyWith<$Res> {
  factory _$$CreateGigInputImplCopyWith(
    _$CreateGigInputImpl value,
    $Res Function(_$CreateGigInputImpl) then,
  ) = __$$CreateGigInputImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String title,
    String categoryId,
    String description,
    List<CreatePackageInput> packages,
    List<String> tags,
    List<String> images,
  });
}

/// @nodoc
class __$$CreateGigInputImplCopyWithImpl<$Res>
    extends _$CreateGigInputCopyWithImpl<$Res, _$CreateGigInputImpl>
    implements _$$CreateGigInputImplCopyWith<$Res> {
  __$$CreateGigInputImplCopyWithImpl(
    _$CreateGigInputImpl _value,
    $Res Function(_$CreateGigInputImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CreateGigInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? title = null,
    Object? categoryId = null,
    Object? description = null,
    Object? packages = null,
    Object? tags = null,
    Object? images = null,
  }) {
    return _then(
      _$CreateGigInputImpl(
        title: null == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String,
        categoryId: null == categoryId
            ? _value.categoryId
            : categoryId // ignore: cast_nullable_to_non_nullable
                  as String,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        packages: null == packages
            ? _value._packages
            : packages // ignore: cast_nullable_to_non_nullable
                  as List<CreatePackageInput>,
        tags: null == tags
            ? _value._tags
            : tags // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        images: null == images
            ? _value._images
            : images // ignore: cast_nullable_to_non_nullable
                  as List<String>,
      ),
    );
  }
}

/// @nodoc

@JsonSerializable(fieldRename: FieldRename.snake)
class _$CreateGigInputImpl extends _CreateGigInput {
  const _$CreateGigInputImpl({
    required this.title,
    required this.categoryId,
    required this.description,
    required final List<CreatePackageInput> packages,
    final List<String> tags = const [],
    final List<String> images = const [],
  }) : _packages = packages,
       _tags = tags,
       _images = images,
       super._();

  factory _$CreateGigInputImpl.fromJson(Map<String, dynamic> json) =>
      _$$CreateGigInputImplFromJson(json);

  @override
  final String title;
  @override
  final String categoryId;
  @override
  final String description;
  final List<CreatePackageInput> _packages;
  @override
  List<CreatePackageInput> get packages {
    if (_packages is EqualUnmodifiableListView) return _packages;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_packages);
  }

  final List<String> _tags;
  @override
  @JsonKey()
  List<String> get tags {
    if (_tags is EqualUnmodifiableListView) return _tags;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_tags);
  }

  final List<String> _images;
  @override
  @JsonKey()
  List<String> get images {
    if (_images is EqualUnmodifiableListView) return _images;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_images);
  }

  @override
  String toString() {
    return 'CreateGigInput(title: $title, categoryId: $categoryId, description: $description, packages: $packages, tags: $tags, images: $images)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreateGigInputImpl &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.categoryId, categoryId) ||
                other.categoryId == categoryId) &&
            (identical(other.description, description) ||
                other.description == description) &&
            const DeepCollectionEquality().equals(other._packages, _packages) &&
            const DeepCollectionEquality().equals(other._tags, _tags) &&
            const DeepCollectionEquality().equals(other._images, _images));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    title,
    categoryId,
    description,
    const DeepCollectionEquality().hash(_packages),
    const DeepCollectionEquality().hash(_tags),
    const DeepCollectionEquality().hash(_images),
  );

  /// Create a copy of CreateGigInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreateGigInputImplCopyWith<_$CreateGigInputImpl> get copyWith =>
      __$$CreateGigInputImplCopyWithImpl<_$CreateGigInputImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CreateGigInputImplToJson(this);
  }
}

abstract class _CreateGigInput extends CreateGigInput {
  const factory _CreateGigInput({
    required final String title,
    required final String categoryId,
    required final String description,
    required final List<CreatePackageInput> packages,
    final List<String> tags,
    final List<String> images,
  }) = _$CreateGigInputImpl;
  const _CreateGigInput._() : super._();

  factory _CreateGigInput.fromJson(Map<String, dynamic> json) =
      _$CreateGigInputImpl.fromJson;

  @override
  String get title;
  @override
  String get categoryId;
  @override
  String get description;
  @override
  List<CreatePackageInput> get packages;
  @override
  List<String> get tags;
  @override
  List<String> get images;

  /// Create a copy of CreateGigInput
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreateGigInputImplCopyWith<_$CreateGigInputImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CreatePackageInput _$CreatePackageInputFromJson(Map<String, dynamic> json) {
  return _CreatePackageInput.fromJson(json);
}

/// @nodoc
mixin _$CreatePackageInput {
  String get tier => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  double get price => throw _privateConstructorUsedError;
  int get deliveryDays => throw _privateConstructorUsedError;
  @JsonKey(name: 'revision_count')
  int get revisions => throw _privateConstructorUsedError;
  List<String> get features => throw _privateConstructorUsedError;

  /// Serializes this CreatePackageInput to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CreatePackageInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreatePackageInputCopyWith<CreatePackageInput> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreatePackageInputCopyWith<$Res> {
  factory $CreatePackageInputCopyWith(
    CreatePackageInput value,
    $Res Function(CreatePackageInput) then,
  ) = _$CreatePackageInputCopyWithImpl<$Res, CreatePackageInput>;
  @useResult
  $Res call({
    String tier,
    String title,
    String description,
    double price,
    int deliveryDays,
    @JsonKey(name: 'revision_count') int revisions,
    List<String> features,
  });
}

/// @nodoc
class _$CreatePackageInputCopyWithImpl<$Res, $Val extends CreatePackageInput>
    implements $CreatePackageInputCopyWith<$Res> {
  _$CreatePackageInputCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreatePackageInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? tier = null,
    Object? title = null,
    Object? description = null,
    Object? price = null,
    Object? deliveryDays = null,
    Object? revisions = null,
    Object? features = null,
  }) {
    return _then(
      _value.copyWith(
            tier: null == tier
                ? _value.tier
                : tier // ignore: cast_nullable_to_non_nullable
                      as String,
            title: null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            price: null == price
                ? _value.price
                : price // ignore: cast_nullable_to_non_nullable
                      as double,
            deliveryDays: null == deliveryDays
                ? _value.deliveryDays
                : deliveryDays // ignore: cast_nullable_to_non_nullable
                      as int,
            revisions: null == revisions
                ? _value.revisions
                : revisions // ignore: cast_nullable_to_non_nullable
                      as int,
            features: null == features
                ? _value.features
                : features // ignore: cast_nullable_to_non_nullable
                      as List<String>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CreatePackageInputImplCopyWith<$Res>
    implements $CreatePackageInputCopyWith<$Res> {
  factory _$$CreatePackageInputImplCopyWith(
    _$CreatePackageInputImpl value,
    $Res Function(_$CreatePackageInputImpl) then,
  ) = __$$CreatePackageInputImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String tier,
    String title,
    String description,
    double price,
    int deliveryDays,
    @JsonKey(name: 'revision_count') int revisions,
    List<String> features,
  });
}

/// @nodoc
class __$$CreatePackageInputImplCopyWithImpl<$Res>
    extends _$CreatePackageInputCopyWithImpl<$Res, _$CreatePackageInputImpl>
    implements _$$CreatePackageInputImplCopyWith<$Res> {
  __$$CreatePackageInputImplCopyWithImpl(
    _$CreatePackageInputImpl _value,
    $Res Function(_$CreatePackageInputImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CreatePackageInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? tier = null,
    Object? title = null,
    Object? description = null,
    Object? price = null,
    Object? deliveryDays = null,
    Object? revisions = null,
    Object? features = null,
  }) {
    return _then(
      _$CreatePackageInputImpl(
        tier: null == tier
            ? _value.tier
            : tier // ignore: cast_nullable_to_non_nullable
                  as String,
        title: null == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        price: null == price
            ? _value.price
            : price // ignore: cast_nullable_to_non_nullable
                  as double,
        deliveryDays: null == deliveryDays
            ? _value.deliveryDays
            : deliveryDays // ignore: cast_nullable_to_non_nullable
                  as int,
        revisions: null == revisions
            ? _value.revisions
            : revisions // ignore: cast_nullable_to_non_nullable
                  as int,
        features: null == features
            ? _value._features
            : features // ignore: cast_nullable_to_non_nullable
                  as List<String>,
      ),
    );
  }
}

/// @nodoc

@JsonSerializable(fieldRename: FieldRename.snake)
class _$CreatePackageInputImpl extends _CreatePackageInput {
  const _$CreatePackageInputImpl({
    required this.tier,
    required this.title,
    required this.description,
    required this.price,
    required this.deliveryDays,
    @JsonKey(name: 'revision_count') required this.revisions,
    final List<String> features = const [],
  }) : _features = features,
       super._();

  factory _$CreatePackageInputImpl.fromJson(Map<String, dynamic> json) =>
      _$$CreatePackageInputImplFromJson(json);

  @override
  final String tier;
  @override
  final String title;
  @override
  final String description;
  @override
  final double price;
  @override
  final int deliveryDays;
  @override
  @JsonKey(name: 'revision_count')
  final int revisions;
  final List<String> _features;
  @override
  @JsonKey()
  List<String> get features {
    if (_features is EqualUnmodifiableListView) return _features;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_features);
  }

  @override
  String toString() {
    return 'CreatePackageInput(tier: $tier, title: $title, description: $description, price: $price, deliveryDays: $deliveryDays, revisions: $revisions, features: $features)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreatePackageInputImpl &&
            (identical(other.tier, tier) || other.tier == tier) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.price, price) || other.price == price) &&
            (identical(other.deliveryDays, deliveryDays) ||
                other.deliveryDays == deliveryDays) &&
            (identical(other.revisions, revisions) ||
                other.revisions == revisions) &&
            const DeepCollectionEquality().equals(other._features, _features));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    tier,
    title,
    description,
    price,
    deliveryDays,
    revisions,
    const DeepCollectionEquality().hash(_features),
  );

  /// Create a copy of CreatePackageInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreatePackageInputImplCopyWith<_$CreatePackageInputImpl> get copyWith =>
      __$$CreatePackageInputImplCopyWithImpl<_$CreatePackageInputImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CreatePackageInputImplToJson(this);
  }
}

abstract class _CreatePackageInput extends CreatePackageInput {
  const factory _CreatePackageInput({
    required final String tier,
    required final String title,
    required final String description,
    required final double price,
    required final int deliveryDays,
    @JsonKey(name: 'revision_count') required final int revisions,
    final List<String> features,
  }) = _$CreatePackageInputImpl;
  const _CreatePackageInput._() : super._();

  factory _CreatePackageInput.fromJson(Map<String, dynamic> json) =
      _$CreatePackageInputImpl.fromJson;

  @override
  String get tier;
  @override
  String get title;
  @override
  String get description;
  @override
  double get price;
  @override
  int get deliveryDays;
  @override
  @JsonKey(name: 'revision_count')
  int get revisions;
  @override
  List<String> get features;

  /// Create a copy of CreatePackageInput
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreatePackageInputImplCopyWith<_$CreatePackageInputImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UpdateGigInput _$UpdateGigInputFromJson(Map<String, dynamic> json) {
  return _UpdateGigInput.fromJson(json);
}

/// @nodoc
mixin _$UpdateGigInput {
  String? get title => throw _privateConstructorUsedError;
  String? get categoryId => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  List<CreatePackageInput>? get packages => throw _privateConstructorUsedError;
  List<String>? get tags => throw _privateConstructorUsedError;
  List<String>? get images => throw _privateConstructorUsedError;
  String? get status => throw _privateConstructorUsedError;

  /// Serializes this UpdateGigInput to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of UpdateGigInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $UpdateGigInputCopyWith<UpdateGigInput> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UpdateGigInputCopyWith<$Res> {
  factory $UpdateGigInputCopyWith(
    UpdateGigInput value,
    $Res Function(UpdateGigInput) then,
  ) = _$UpdateGigInputCopyWithImpl<$Res, UpdateGigInput>;
  @useResult
  $Res call({
    String? title,
    String? categoryId,
    String? description,
    List<CreatePackageInput>? packages,
    List<String>? tags,
    List<String>? images,
    String? status,
  });
}

/// @nodoc
class _$UpdateGigInputCopyWithImpl<$Res, $Val extends UpdateGigInput>
    implements $UpdateGigInputCopyWith<$Res> {
  _$UpdateGigInputCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of UpdateGigInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? title = freezed,
    Object? categoryId = freezed,
    Object? description = freezed,
    Object? packages = freezed,
    Object? tags = freezed,
    Object? images = freezed,
    Object? status = freezed,
  }) {
    return _then(
      _value.copyWith(
            title: freezed == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String?,
            categoryId: freezed == categoryId
                ? _value.categoryId
                : categoryId // ignore: cast_nullable_to_non_nullable
                      as String?,
            description: freezed == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String?,
            packages: freezed == packages
                ? _value.packages
                : packages // ignore: cast_nullable_to_non_nullable
                      as List<CreatePackageInput>?,
            tags: freezed == tags
                ? _value.tags
                : tags // ignore: cast_nullable_to_non_nullable
                      as List<String>?,
            images: freezed == images
                ? _value.images
                : images // ignore: cast_nullable_to_non_nullable
                      as List<String>?,
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
abstract class _$$UpdateGigInputImplCopyWith<$Res>
    implements $UpdateGigInputCopyWith<$Res> {
  factory _$$UpdateGigInputImplCopyWith(
    _$UpdateGigInputImpl value,
    $Res Function(_$UpdateGigInputImpl) then,
  ) = __$$UpdateGigInputImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String? title,
    String? categoryId,
    String? description,
    List<CreatePackageInput>? packages,
    List<String>? tags,
    List<String>? images,
    String? status,
  });
}

/// @nodoc
class __$$UpdateGigInputImplCopyWithImpl<$Res>
    extends _$UpdateGigInputCopyWithImpl<$Res, _$UpdateGigInputImpl>
    implements _$$UpdateGigInputImplCopyWith<$Res> {
  __$$UpdateGigInputImplCopyWithImpl(
    _$UpdateGigInputImpl _value,
    $Res Function(_$UpdateGigInputImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UpdateGigInput
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? title = freezed,
    Object? categoryId = freezed,
    Object? description = freezed,
    Object? packages = freezed,
    Object? tags = freezed,
    Object? images = freezed,
    Object? status = freezed,
  }) {
    return _then(
      _$UpdateGigInputImpl(
        title: freezed == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String?,
        categoryId: freezed == categoryId
            ? _value.categoryId
            : categoryId // ignore: cast_nullable_to_non_nullable
                  as String?,
        description: freezed == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String?,
        packages: freezed == packages
            ? _value._packages
            : packages // ignore: cast_nullable_to_non_nullable
                  as List<CreatePackageInput>?,
        tags: freezed == tags
            ? _value._tags
            : tags // ignore: cast_nullable_to_non_nullable
                  as List<String>?,
        images: freezed == images
            ? _value._images
            : images // ignore: cast_nullable_to_non_nullable
                  as List<String>?,
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
class _$UpdateGigInputImpl extends _UpdateGigInput {
  const _$UpdateGigInputImpl({
    this.title,
    this.categoryId,
    this.description,
    final List<CreatePackageInput>? packages,
    final List<String>? tags,
    final List<String>? images,
    this.status,
  }) : _packages = packages,
       _tags = tags,
       _images = images,
       super._();

  factory _$UpdateGigInputImpl.fromJson(Map<String, dynamic> json) =>
      _$$UpdateGigInputImplFromJson(json);

  @override
  final String? title;
  @override
  final String? categoryId;
  @override
  final String? description;
  final List<CreatePackageInput>? _packages;
  @override
  List<CreatePackageInput>? get packages {
    final value = _packages;
    if (value == null) return null;
    if (_packages is EqualUnmodifiableListView) return _packages;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  final List<String>? _tags;
  @override
  List<String>? get tags {
    final value = _tags;
    if (value == null) return null;
    if (_tags is EqualUnmodifiableListView) return _tags;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  final List<String>? _images;
  @override
  List<String>? get images {
    final value = _images;
    if (value == null) return null;
    if (_images is EqualUnmodifiableListView) return _images;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final String? status;

  @override
  String toString() {
    return 'UpdateGigInput(title: $title, categoryId: $categoryId, description: $description, packages: $packages, tags: $tags, images: $images, status: $status)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UpdateGigInputImpl &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.categoryId, categoryId) ||
                other.categoryId == categoryId) &&
            (identical(other.description, description) ||
                other.description == description) &&
            const DeepCollectionEquality().equals(other._packages, _packages) &&
            const DeepCollectionEquality().equals(other._tags, _tags) &&
            const DeepCollectionEquality().equals(other._images, _images) &&
            (identical(other.status, status) || other.status == status));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    title,
    categoryId,
    description,
    const DeepCollectionEquality().hash(_packages),
    const DeepCollectionEquality().hash(_tags),
    const DeepCollectionEquality().hash(_images),
    status,
  );

  /// Create a copy of UpdateGigInput
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UpdateGigInputImplCopyWith<_$UpdateGigInputImpl> get copyWith =>
      __$$UpdateGigInputImplCopyWithImpl<_$UpdateGigInputImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$UpdateGigInputImplToJson(this);
  }
}

abstract class _UpdateGigInput extends UpdateGigInput {
  const factory _UpdateGigInput({
    final String? title,
    final String? categoryId,
    final String? description,
    final List<CreatePackageInput>? packages,
    final List<String>? tags,
    final List<String>? images,
    final String? status,
  }) = _$UpdateGigInputImpl;
  const _UpdateGigInput._() : super._();

  factory _UpdateGigInput.fromJson(Map<String, dynamic> json) =
      _$UpdateGigInputImpl.fromJson;

  @override
  String? get title;
  @override
  String? get categoryId;
  @override
  String? get description;
  @override
  List<CreatePackageInput>? get packages;
  @override
  List<String>? get tags;
  @override
  List<String>? get images;
  @override
  String? get status;

  /// Create a copy of UpdateGigInput
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UpdateGigInputImplCopyWith<_$UpdateGigInputImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
