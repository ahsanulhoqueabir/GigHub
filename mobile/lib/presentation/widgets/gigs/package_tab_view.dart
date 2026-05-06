import 'package:flutter/material.dart';
import 'package:gighub/core/constants/app_sizes.dart';
import 'package:gighub/data/models/gig_model.dart';

/// Tab-based package comparison view (Basic / Standard / Premium).
class PackageTabView extends StatelessWidget {
  final List<GigPackage> packages;
  final ValueChanged<GigPackage> onContinue;

  const PackageTabView({
    super.key,
    required this.packages,
    required this.onContinue,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final tabs = packages.map((p) => Tab(text: p.title)).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Packages',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: AppSizes.space12),
        DefaultTabController(
          length: tabs.length,
          child: Column(
            children: [
              TabBar(
                tabs: tabs,
                labelColor: theme.colorScheme.primary,
                unselectedLabelColor: theme.colorScheme.onSurfaceVariant,
                indicatorColor: theme.colorScheme.primary,
              ),
              SizedBox(
                height: 260,
                child: TabBarView(
                  children: packages
                      .map(
                        (pkg) => _PackageDetail(
                          pkg: pkg,
                          onContinue: () => onContinue(pkg),
                        ),
                      )
                      .toList(),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _PackageDetail extends StatelessWidget {
  final GigPackage pkg;
  final VoidCallback onContinue;

  const _PackageDetail({required this.pkg, required this.onContinue});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.all(AppSizes.space16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(pkg.description, style: theme.textTheme.bodyMedium),
          const SizedBox(height: AppSizes.space12),
          Row(
            children: [
              Text(
                '\u09F3${pkg.price.toStringAsFixed(0)}',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.primary,
                ),
              ),
              const SizedBox(width: AppSizes.space8),
              Text(
                '| ${pkg.deliveryDays} days delivery',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(width: AppSizes.space8),
              Text(
                '| ${pkg.revisions >= 999 ? "Unlimited" : "${pkg.revisions}"} revisions',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSizes.space12),
          ...pkg.features.map(
            (f) => Padding(
              padding: const EdgeInsets.only(bottom: AppSizes.space4),
              child: Row(
                children: [
                  Icon(Icons.check, size: 16, color: theme.colorScheme.primary),
                  const SizedBox(width: AppSizes.space8),
                  Expanded(child: Text(f, style: theme.textTheme.bodySmall)),
                ],
              ),
            ),
          ),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: onContinue,
              child: Text('Continue (\u09F3${pkg.price.toStringAsFixed(0)})'),
            ),
          ),
        ],
      ),
    );
  }
}
