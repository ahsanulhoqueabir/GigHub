"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { IconLock, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Optional custom message */
  message?: string;
}

/**
 * AuthModal — a centered overlay modal that prompts unauthenticated users
 * to log in or sign up before accessing a protected feature.
 */
export function AuthModal({ open, onClose, message }: AuthModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-6 sm:p-8 text-center shadow-2xl animate-in fade-in zoom-in-95">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <IconX size={18} />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
          <IconLock size={28} className="text-muted-foreground" />
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-1">
          Authentication Required
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {message ?? "Please log in or create an account to continue."}
        </p>

        <div className="flex flex-col gap-2.5">
          <Button asChild className="w-full">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
