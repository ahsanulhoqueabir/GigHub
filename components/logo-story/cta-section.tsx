"use client";

import Link from "next/link";

export function CtaSection() {
  return (
    <div className="mx-auto mt-24 max-w-5xl px-4 text-center">
      <div className="rounded-3xl border border-border bg-linear-to-b from-card to-card/50 p-8 md:p-12 shadow-md">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          Ready to experience the loop?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Join other Jagannath University students currently utilizing GigHub to
          connect, trade skills, and grow.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-colors text-sm shadow-md shadow-primary/10"
          >
            Sign Up (JnU Exclusive)
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl border border-border bg-card/40 hover:bg-muted text-foreground transition-colors text-sm font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
