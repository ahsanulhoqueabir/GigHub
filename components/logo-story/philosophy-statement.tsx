"use client";

import { logostore } from "@/config/logo-story.config";

export function PhilosophyStatement() {
  return (
    <div className="mx-auto mt-24 max-w-5xl px-4">
      <div className="rounded-3xl border border-border bg-muted/20 p-8 md:p-10 text-center">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Ecosystem Philosophy
        </h3>
        <p className="text-base md:text-lg leading-relaxed text-muted-foreground font-medium max-w-4xl mx-auto italic">
          &ldquo;{logostore.hidden_message.statement}&rdquo;
        </p>
      </div>
    </div>
  );
}
