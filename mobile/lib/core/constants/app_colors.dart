import 'package:flutter/material.dart';

/// Brand and semantic color constants for the GigHub design system.
///
/// Use these as the single source of truth for colors throughout the app.
abstract class AppColors {
  AppColors._();

  // ── Brand ────────────────────────────────────────────
  static const Color primary = Color(0xFF2563EB); // Blue
  static const Color secondary = Color(0xFF7C3AED); // Purple
  static const Color accent = Color(0xFF06B6D4); // Cyan

  // ── Semantic ─────────────────────────────────────────
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // ── Neutrals (Light) ─────────────────────────────────
  static const Color neutral50 = Color(0xFFF9FAFB);
  static const Color neutral100 = Color(0xFFF3F4F6);
  static const Color neutral200 = Color(0xFFE5E7EB);
  static const Color neutral300 = Color(0xFFD1D5DB);
  static const Color neutral400 = Color(0xFF9CA3AF);
  static const Color neutral500 = Color(0xFF6B7280);
  static const Color neutral600 = Color(0xFF4B5563);
  static const Color neutral700 = Color(0xFF374151);
  static const Color neutral800 = Color(0xFF1F2937);
  static const Color neutral900 = Color(0xFF111827);

  // ── Neutrals (Dark) ──────────────────────────────────
  static const Color darkBg = Color(0xFF0F172A);
  static const Color darkSurface = Color(0xFF1E293B);
  static const Color darkCard = Color(0xFF334155);

  // ── Misc ─────────────────────────────────────────────
  static const Color scaffoldLight = Color(0xFFF8FAFC);
  static const Color scaffoldDark = Color(0xFF0F172A);
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  static const Color transparent = Colors.transparent;
}
