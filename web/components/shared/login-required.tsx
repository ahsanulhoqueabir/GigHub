"use client";

import Link from "next/link";
import { IconLock } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAuthStore, selectIsAuthenticated } from "@/store/auth.store";

interface LoginRequiredProps {
  /** Content to show when authenticated */
  children: React.ReactNode;
  /** Optional message to show instead of default */
  message?: string;
  /** Optional redirect path after login (default: current page) */
  redirectTo?: string;
}

/**
 * LoginRequired — a wall that replaces children when the user is not
 * authenticated, showing a friendly "please log in" prompt with links
 * to /login and /signup.
 *
 * Use it to wrap action sections (CTA buttons, order forms, etc.) that
 * require a logged-in user.
 *
 * @example
 * <LoginRequired>
 *   <Button>Apply Now</Button>
 * </LoginRequired>
 */
export function LoginRequired({
  children,
  message,
  redirectTo,
}: LoginRequiredProps) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isProcessing = useAuthStore((s) => s.isProcessing);
  const isAuthenticated = useAuthStore((s) => selectIsAuthenticated(s));

  // Still loading auth state — show nothing to avoid flash
  if (!hasHydrated || isProcessing) {
    return null;
  }

  // User is authenticated — render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  const loginHref = redirectTo
    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
    : "/login";

  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <IconLock size={22} className="text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        Login Required
      </h3>
      <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
        {message ?? "Please log in or create an account to continue."}
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button asChild>
          <Link href={loginHref}>Log In</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
