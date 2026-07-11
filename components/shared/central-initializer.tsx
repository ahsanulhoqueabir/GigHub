"use client";

import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";
import { useCategoriesStore } from "@/store/categories.store";
import { useDepartmentsStore } from "@/store/departments.store";
import { useGeneralStore } from "@/store/general.store";
import { useSiteDataStore } from "@/store/site-data.store";
import { useEffect, useRef } from "react";

/**
 * CentralDataInitializer — fetches site-wide data on mount.
 *
 * Responsibilities (in order):
 * 1. Re-validates the stored auth token (if any) via `initAuth()`.
 * 2. Fetches **public site data** (system config, hero banners, ad banners, announcements).
 * 3. Fetches **categories** (limit=40) — cached in Zustand so every
 *    component reads from the same state.
 * 4. Fetches **departments** (limit=40) — same caching pattern.
 * 5. Fetches **latest gigs** (limit=8) — for homepage hero/preview.
 * 6. Fetches **latest jobs** (limit=6) — for homepage hero/preview.
 *
 * Place this component once in your root layout, inside `<body>`.
 */
export function CentralDataInitializer() {
  const hasInitialized = useRef(false);

  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const initAuth = useAuthStore((s) => s.initAuth);

  const siteHasFetched = useSiteDataStore((s) => s.hasFetched);
  const fetchSiteData = useSiteDataStore((s) => s.fetchSiteData);

  const catHasFetched = useCategoriesStore((s) => s.hasFetched);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);

  const deptHasFetched = useDepartmentsStore((s) => s.hasFetched);
  const fetchDepartments = useDepartmentsStore((s) => s.fetchDepartments);

  const homepageData = useGeneralStore((s) => s.homepageData);
  const fetchHomepageData = useGeneralStore((s) => s.fetchHomepageData);

  useEffect(() => {
    if (!hasHydrated || hasInitialized.current) return;

    hasInitialized.current = true;

    const storedUser = useAuthStore.getState().user;
    const storedToken = useAuthStore.getState().accessToken;

    // Only call initAuth if we have a persisted token to validate
    if (storedToken && storedUser) {
      initAuth();
    }
  }, [hasHydrated, initAuth]);

  // ── Fetch public site data once (system config, banners, announcements) ──
  useEffect(() => {
    if (siteHasFetched) return;
    fetchSiteData();
  }, [siteHasFetched, fetchSiteData]);

  // ── Fetch categories once ──────────────────────────────────────
  useEffect(() => {
    if (catHasFetched) return;
    fetchCategories(1, 40);
  }, [catHasFetched, fetchCategories]);

  // ── Fetch departments once ─────────────────────────────────────
  useEffect(() => {
    if (deptHasFetched) return;
    fetchDepartments(1, 40);
  }, [deptHasFetched, fetchDepartments]);

  // ── Fetch homepage data once ───────────────────────────────────
  useEffect(() => {
    if (homepageData) return;
    fetchHomepageData();
  }, [homepageData, fetchHomepageData]);

  return null;
}

/**
 * AuthGate — renders children only after auth has been validated.
 * Useful for wrapping parts of the UI that depend on auth state.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = selectIsAuthenticated(useAuthStore.getState());

  if (!hasHydrated) {
    return null; // or a minimal skeleton
  }

  if (!isAuthenticated) {
    return null; // or a redirect to /login handled by middleware
  }

  return <>{children}</>;
}
