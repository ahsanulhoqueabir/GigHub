// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'profile_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ProfileImpl _$$ProfileImplFromJson(Map<String, dynamic> json) =>
    _$ProfileImpl(
      id: json['id'] as String,
      displayName: json['display_name'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
      avatar: json['avatar'] as String?,
      bio: json['bio'] as String?,
      skills:
          (json['skills'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      availabilityStatus: json['availability_status'] as String? ?? 'available',
      isVerified: json['is_verified'] as bool? ?? false,
      role: json['role'] as String? ?? 'user',
      totalEarnings: (json['total_earnings'] as num?)?.toDouble() ?? 0.0,
      avgRating: (json['avg_rating'] as num?)?.toDouble() ?? 0.0,
      totalReviews: (json['total_reviews'] as num?)?.toInt() ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
    );

Map<String, dynamic> _$$ProfileImplToJson(_$ProfileImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'display_name': instance.displayName,
      'username': instance.username,
      'email': instance.email,
      'avatar': instance.avatar,
      'bio': instance.bio,
      'skills': instance.skills,
      'availability_status': instance.availabilityStatus,
      'is_verified': instance.isVerified,
      'role': instance.role,
      'total_earnings': instance.totalEarnings,
      'avg_rating': instance.avgRating,
      'total_reviews': instance.totalReviews,
      'created_at': instance.createdAt.toIso8601String(),
    };

_$PublicProfileImpl _$$PublicProfileImplFromJson(Map<String, dynamic> json) =>
    _$PublicProfileImpl(
      id: json['id'] as String,
      displayName: json['display_name'] as String,
      username: json['username'] as String,
      avatar: json['avatar'] as String?,
      bio: json['bio'] as String?,
      skills:
          (json['skills'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      availabilityStatus: json['availability_status'] as String? ?? 'available',
      isVerified: json['is_verified'] as bool? ?? false,
      avgRating: (json['avg_rating'] as num?)?.toDouble() ?? 0.0,
      totalReviews: (json['total_reviews'] as num?)?.toInt() ?? 0,
      completedOrders: (json['completed_orders'] as num?)?.toInt() ?? 0,
      memberSince: DateTime.parse(json['member_since'] as String),
    );

Map<String, dynamic> _$$PublicProfileImplToJson(_$PublicProfileImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'display_name': instance.displayName,
      'username': instance.username,
      'avatar': instance.avatar,
      'bio': instance.bio,
      'skills': instance.skills,
      'availability_status': instance.availabilityStatus,
      'is_verified': instance.isVerified,
      'avg_rating': instance.avgRating,
      'total_reviews': instance.totalReviews,
      'completed_orders': instance.completedOrders,
      'member_since': instance.memberSince.toIso8601String(),
    };

_$UpdateProfileInputImpl _$$UpdateProfileInputImplFromJson(
  Map<String, dynamic> json,
) => _$UpdateProfileInputImpl(
  displayName: json['display_name'] as String?,
  username: json['username'] as String?,
  bio: json['bio'] as String?,
  skills: (json['skills'] as List<dynamic>?)?.map((e) => e as String).toList(),
  availabilityStatus: json['availability_status'] as String?,
);

Map<String, dynamic> _$$UpdateProfileInputImplToJson(
  _$UpdateProfileInputImpl instance,
) => <String, dynamic>{
  if (instance.displayName case final value?) 'display_name': value,
  if (instance.username case final value?) 'username': value,
  if (instance.bio case final value?) 'bio': value,
  if (instance.skills case final value?) 'skills': value,
  if (instance.availabilityStatus case final value?)
    'availability_status': value,
};
