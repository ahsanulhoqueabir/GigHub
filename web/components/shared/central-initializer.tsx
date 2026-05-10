"use client";

import { useEffect, useRef } from "react";
import { useAuthStore, selectIsAuthenticated } from "@/store/auth.store";
import { useGigsStore } from "@/store/gig.store";
import { useJobsStore } from "@/store/job.store";

/**
 * CentralDataInitializer — re-validates the stored auth token on mount
 * and fetches fresh gig & job listings for the landing/home page.
 *
 * On every client-side navigation it checks whether a persisted token
 * is still valid by calling `initAuth()` (which hits `GET /api/profiles/me`).
 * If the token is expired the store is cleared and the user is treated
 * as logged-out.
 *
 * After auth is resolved, it fetches the initial page of gigs and jobs
 * so the homepage always has fresh data without extra loaders.
 *
 * Place this component once in your root layout, inside `<body>`.
 */
export function CentralDataInitializer() {
  const hasInitialized = useRef(false);

  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isProcessing = useAuthStore((s) => s.isProcessing);
  const initAuth = useAuthStore((s) => s.initAuth);

  const fetchGigs = useGigsStore((s) => s.fetchGigs);
  const fetchJobs = useJobsStore((s) => s.fetchJobs);

  useEffect(() => {
    if (!hasHydrated || hasInitialized.current) return;

    hasInitialized.current = true;

    const { accessToken, refreshToken } = useAuthStore.getState();

    // Only call initAuth if we have a persisted token to validate
    if (accessToken || refreshToken) {
      initAuth();
    }
  }, [hasHydrated, initAuth]);

  /* ── Fetch gigs & jobs after auth settles ───────────────────── */
  useEffect(() => {
    if (!hasHydrated || isProcessing) return;

    // Small delay to let auth finish resolving
    const timer = setTimeout(() => {
      fetchGigs(1);
      fetchJobs(1);
    }, 100);

    return () => clearTimeout(timer);
  }, [hasHydrated, isProcessing, fetchGigs, fetchJobs]);

  return null;
}

/**
 * AuthGate — renders children only after auth has been validated.
 * Useful for wrapping parts of the UI that depend on auth state.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isProcessing = useAuthStore((s) => s.isProcessing);
  const isAuthenticated = useAuthStore((s) => selectIsAuthenticated(s));

  if (!hasHydrated || isProcessing) {
    return null; // or a minimal skeleton
  }

  if (!isAuthenticated) {
    return null; // or a redirect to /login handled by middleware
  }

  return <>{children}</>;
}
