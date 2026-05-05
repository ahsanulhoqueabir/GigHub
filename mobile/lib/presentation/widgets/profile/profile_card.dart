import 'package:flutter/material.dart';
import 'package:gig_hub/core/constants/app_sizes.dart';
import 'package:gig_hub/presentation/widgets/common/gh_avatar.dart';
import 'package:gig_hub/presentation/widgets/common/gh_rating_stars.dart';

/// Compact profile card showing avatar, name, rating, and skills.
///
/// Used in search results, gig details, and other list views.
class ProfileCard extends StatelessWidget {
  final String name;
  final String username;
  final String? avatarUrl;
  final double rating;
  final int reviewCount;
  final List<String>? skills;
  final String? bio;
  final VoidCallback? onTap;

  const ProfileCard({
    super.key,
    required this.name,
    required this.username,
    this.avatarUrl,
    this.rating = 0,
    this.reviewCount = 0,
    this.skills,
    this.bio,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.space16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GhAvatar(imageUrl: avatarUrl, name: name, radius: 28),
              const SizedBox(width: AppSizes.space12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '@$username',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                    if (bio != null && bio!.isNotEmpty) ...[
                      const SizedBox(height: AppSizes.space4),
                      Text(
                        bio!,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                    const SizedBox(height: AppSizes.space8),
                    Row(
                      children: [
                        GhRatingStars(rating: rating, size: 14),
                        const SizedBox(width: AppSizes.space4),
                        Text(
                          '($reviewCount)',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                    if (skills != null && skills!.isNotEmpty) ...[
                      SizedBox(height: AppSizes.space8),
                      Wrap(
                        spacing: 4,
                        runSpacing: 4,
                        children: skills!.take(3).map((skill) {
                          return Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primaryContainer,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              skill,
                              style: theme.textTheme.labelSmall?.copyWith(
                                color: theme.colorScheme.onPrimaryContainer,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
