import 'package:flutter/material.dart';

/// Maps icon name strings from the API to Material [IconData].
///
/// The backend returns icon names matching Material Icons identifiers
/// (e.g., "code" → Icons.code, "palette" → Icons.palette).
/// Add new entries here as the backend expands its icon set.
class CategoryIconMapper {
  CategoryIconMapper._();

  static final Map<String, IconData> _map = {
    'code': Icons.code,
    'palette': Icons.palette,
    'trending_up': Icons.trending_up,
    'description': Icons.description,
    'movie': Icons.movie,
    'music_note': Icons.music_note,
    'business': Icons.business,
    'spa': Icons.spa,
    'build': Icons.build,
    'language': Icons.language,
    'design_services': Icons.design_services,
    'campaign': Icons.campaign,
    'school': Icons.school,
    'brush': Icons.brush,
    'camera_alt': Icons.camera_alt,
    'headphones': Icons.headphones,
    'favorite': Icons.favorite,
    'star': Icons.star,
    'auto_awesome': Icons.auto_awesome,
    'insert_chart': Icons.insert_chart,
    'support_agent': Icons.support_agent,
    'translate': Icons.translate,
    'video_library': Icons.video_library,
    'web': Icons.web,
    'article': Icons.article,
  };

  /// Resolve an icon name string to [IconData].
  ///
  /// Returns `null` if the icon name is not recognized, allowing the UI
  /// to fall back gracefully (e.g., show no icon or a default icon).
  static IconData? resolve(String? iconName) {
    if (iconName == null || iconName.isEmpty) return null;
    return _map[iconName];
  }
}
