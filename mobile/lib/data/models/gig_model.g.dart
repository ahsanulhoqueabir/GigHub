// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'gig_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$GigSummaryImpl _$$GigSummaryImplFromJson(Map<String, dynamic> json) =>
    _$GigSummaryImpl(
      id: json['id'] as String,
      title: json['title'] as String,
      slug: json['slug'] as String,
      category: Category.fromJson(json['category'] as Map<String, dynamic>),
      seller: PublicProfile.fromJson(json['seller'] as Map<String, dynamic>),
      thumbnail: json['thumbnail'] as String?,
      startingPrice: (json['starting_price'] as num).toDouble(),
      avgRating: (json['avg_rating'] as num).toDouble(),
      totalReviews: (json['total_reviews'] as num).toInt(),
      totalOrders: (json['total_orders'] as num?)?.toInt() ?? 0,
      status: json['status'] as String,
    );

Map<String, dynamic> _$$GigSummaryImplToJson(_$GigSummaryImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'slug': instance.slug,
      'category': instance.category,
      'seller': instance.seller,
      'thumbnail': instance.thumbnail,
      'starting_price': instance.startingPrice,
      'avg_rating': instance.avgRating,
      'total_reviews': instance.totalReviews,
      'total_orders': instance.totalOrders,
      'status': instance.status,
    };

_$GigDetailImpl _$$GigDetailImplFromJson(Map<String, dynamic> json) =>
    _$GigDetailImpl(
      id: json['id'] as String,
      title: json['title'] as String,
      slug: json['slug'] as String,
      category: Category.fromJson(json['category'] as Map<String, dynamic>),
      seller: PublicProfile.fromJson(json['seller'] as Map<String, dynamic>),
      thumbnail: json['thumbnail'] as String?,
      images:
          (json['images'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      description: json['description'] as String,
      startingPrice: (json['starting_price'] as num).toDouble(),
      avgRating: (json['avg_rating'] as num).toDouble(),
      totalReviews: (json['total_reviews'] as num).toInt(),
      totalOrders: (json['total_orders'] as num?)?.toInt() ?? 0,
      status: json['status'] as String,
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
          const [],
      packages:
          (json['packages'] as List<dynamic>?)
              ?.map((e) => GigPackage.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      deliveryDaysMin: (json['delivery_days_min'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$$GigDetailImplToJson(_$GigDetailImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'slug': instance.slug,
      'category': instance.category,
      'seller': instance.seller,
      'thumbnail': instance.thumbnail,
      'images': instance.images,
      'description': instance.description,
      'starting_price': instance.startingPrice,
      'avg_rating': instance.avgRating,
      'total_reviews': instance.totalReviews,
      'total_orders': instance.totalOrders,
      'status': instance.status,
      'tags': instance.tags,
      'packages': instance.packages,
      'delivery_days_min': instance.deliveryDaysMin,
    };

_$GigPackageImpl _$$GigPackageImplFromJson(Map<String, dynamic> json) =>
    _$GigPackageImpl(
      id: json['id'] as String,
      tier: json['tier'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      price: (json['price'] as num).toDouble(),
      deliveryDays: (json['delivery_days'] as num).toInt(),
      revisions: (json['revisions'] as num).toInt(),
      features:
          (json['features'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$GigPackageImplToJson(_$GigPackageImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'tier': instance.tier,
      'title': instance.title,
      'description': instance.description,
      'price': instance.price,
      'delivery_days': instance.deliveryDays,
      'revisions': instance.revisions,
      'features': instance.features,
    };

_$CreateGigInputImpl _$$CreateGigInputImplFromJson(Map<String, dynamic> json) =>
    _$CreateGigInputImpl(
      title: json['title'] as String,
      categoryId: json['category_id'] as String,
      description: json['description'] as String,
      packages: (json['packages'] as List<dynamic>)
          .map((e) => CreatePackageInput.fromJson(e as Map<String, dynamic>))
          .toList(),
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
          const [],
      images:
          (json['images'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$CreateGigInputImplToJson(
  _$CreateGigInputImpl instance,
) => <String, dynamic>{
  'title': instance.title,
  'category_id': instance.categoryId,
  'description': instance.description,
  'packages': instance.packages,
  'tags': instance.tags,
  'images': instance.images,
};

_$CreatePackageInputImpl _$$CreatePackageInputImplFromJson(
  Map<String, dynamic> json,
) => _$CreatePackageInputImpl(
  tier: json['tier'] as String,
  title: json['title'] as String,
  description: json['description'] as String,
  price: (json['price'] as num).toDouble(),
  deliveryDays: (json['delivery_days'] as num).toInt(),
  revisions: (json['revisions'] as num).toInt(),
  features:
      (json['features'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
);

Map<String, dynamic> _$$CreatePackageInputImplToJson(
  _$CreatePackageInputImpl instance,
) => <String, dynamic>{
  'tier': instance.tier,
  'title': instance.title,
  'description': instance.description,
  'price': instance.price,
  'delivery_days': instance.deliveryDays,
  'revisions': instance.revisions,
  'features': instance.features,
};

_$UpdateGigInputImpl _$$UpdateGigInputImplFromJson(Map<String, dynamic> json) =>
    _$UpdateGigInputImpl(
      title: json['title'] as String?,
      categoryId: json['category_id'] as String?,
      description: json['description'] as String?,
      packages: (json['packages'] as List<dynamic>?)
          ?.map((e) => CreatePackageInput.fromJson(e as Map<String, dynamic>))
          .toList(),
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList(),
      images: (json['images'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      status: json['status'] as String?,
    );

Map<String, dynamic> _$$UpdateGigInputImplToJson(
  _$UpdateGigInputImpl instance,
) => <String, dynamic>{
  if (instance.title case final value?) 'title': value,
  if (instance.categoryId case final value?) 'category_id': value,
  if (instance.description case final value?) 'description': value,
  if (instance.packages case final value?) 'packages': value,
  if (instance.tags case final value?) 'tags': value,
  if (instance.images case final value?) 'images': value,
  if (instance.status case final value?) 'status': value,
};
