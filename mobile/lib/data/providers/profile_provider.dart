import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gighub/data/models/profile_model.dart';
import 'package:gighub/data/providers/auth_provider.dart';
import 'package:gighub/data/repositories/profile_repository.dart';

/// [ProfileRepository] — depends on [ApiClient].
final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepository(client: ref.watch(apiClientProvider));
});

/// Current user's full profile (async, fetched from API).
final myProfileProvider = FutureProvider<Profile?>((ref) async {
  final authState = ref.watch(authProvider);
  if (!authState.isAuthenticated) return null;

  final repo = ref.watch(profileRepositoryProvider);
  return repo.getMyProfile();
});

/// Updates the current user's profile and invalidates the cache.
final updateProfileAction = FutureProvider.family<void, UpdateProfileInput>((
  ref,
  input,
) async {
  final repo = ref.watch(profileRepositoryProvider);
  await repo.updateMyProfile(input);
  ref.invalidate(myProfileProvider);
});

/// Upload a new avatar and invalidate the profile cache.
final updateAvatarAction = FutureProvider.family<void, String>((
  ref,
  filePath,
) async {
  final repo = ref.watch(profileRepositoryProvider);
  await repo.updateAvatar(filePath);
  ref.invalidate(myProfileProvider);
});

/// Async provider to fetch a public profile by username.
final publicProfileProvider = FutureProvider.family<PublicProfile, String>((
  ref,
  username,
) async {
  final repo = ref.watch(profileRepositoryProvider);
  return repo.getPublicProfile(username);
});
