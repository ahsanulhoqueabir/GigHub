"use client";

import type { InitialSiteData } from "@/lib/server/site-data-fetcher";
import { useCategoriesStore } from "@/store/categories.store";
import { useDepartmentsStore } from "@/store/departments.store";
import { useGeneralStore } from "@/store/general.store";
import { useSiteDataStore } from "@/store/site-data.store";
import { useEffect, useRef } from "react";

/**
 * SiteDataHydrator — hydrates Zustand stores with server-fetched data.
 *
 * Place this in the root layout, passing the `initialData` prop from
 * the server component. This runs once on mount to populate the stores
 * so every component can read from them via the usual hooks.
 *
 * After hydration, CentralDataInitializer is no longer needed for
 * site-data, homepage, categories, or departments.
 */
export function SiteDataHydrator({
  initialData,
}: {
  initialData: InitialSiteData;
}) {
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    if (initialData.siteData) {
      useSiteDataStore.getState().hydrate(initialData.siteData);
    }
    if (initialData.homepageData) {
      useGeneralStore.getState().hydrateHomepage(initialData.homepageData);
    }
    if (initialData.categories.length > 0) {
      useCategoriesStore.getState().hydrate(initialData.categories);
    }
    if (initialData.departments.length > 0) {
      useDepartmentsStore.getState().hydrate(initialData.departments);
    }
  }, [initialData]);

  return null;
}
