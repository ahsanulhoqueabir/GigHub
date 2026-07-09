"use client";

import { Button } from "@/components/ui/button";
import { branding } from "@/config/brand.config";
import { useReturnTo } from "@/hooks/use-return-to";
import { loginSchema, type LoginInput } from "@/lib/validations/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const router = useRouter();
  const { returnTo } = useReturnTo("/");

  const login = useAuthStore((s) => s.login);
  const isProcessing = useAuthStore((s) => s.isProcessing);
  const authError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    clearError();

    try {
      await login(data);
      router.push(returnTo);
    } catch {
      // error is already set in the store
    }
  };

  return (
    <div
      className={` min-h-screen font-sans lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[7fr_5fr]`}
    >
      <style>{`
        .threshold-path {
          stroke-dasharray: 620;
          stroke-dashoffset: 620;
          animation: draw-threshold 1.8s cubic-bezier(0.65, 0, 0.35, 1) 0.2s forwards;
        }
        .threshold-dot {
          opacity: 0;
          animation: fade-dot 0.6s ease-out 1.9s forwards;
        }
        @keyframes draw-threshold {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fade-dot {
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .threshold-path { animation: none; stroke-dashoffset: 0; }
          .threshold-dot { animation: none; opacity: 1; }
        }
      `}</style>

      {/* Threshold panel — full on desktop, collapses to a strip on mobile */}
      <div className="relative flex items-center justify-between bg-primary/20 px-6 py-5 lg:flex-col lg:items-stretch lg:justify-between lg:px-14 lg:py-12">
        <Image
          src={branding.logo}
          alt=""
          className="h-16 w-auto "
          height={40}
          width={40}
        />

        {/* Mobile-only compact tagline */}
        <p className="font-serif text-sm text-primary lg:hidden">
          Good to see you again.
        </p>

        {/* Desktop content */}
        <div className="hidden lg:block">
          <h1
            className="max-w-md text-[2.75rem] font-medium leading-[1.08] tracking-tight text-primary"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Good to see you again.
          </h1>
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-[#5B6D63]">
            Sign in to pick up exactly where you left off.
          </p>
        </div>

        {/* Signature line art — decorative threshold motif */}
        <svg
          viewBox="0 0 320 200"
          fill="none"
          aria-hidden="true"
          className="hidden h-auto w-full max-w-xs text-[#C79A4C] lg:block"
        >
          <path
            className="threshold-path"
            d="M20 180 C 20 100, 60 40, 160 40 C 260 40, 300 100, 300 180"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            className="threshold-path"
            x1="20"
            y1="180"
            x2="300"
            y2="180"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ strokeDasharray: 280, strokeDashoffset: 280 }}
          />
          <circle
            className="threshold-dot"
            cx="160"
            cy="40"
            r="4"
            fill="currentColor"
          />
        </svg>

        <span className="hidden text-xs text-[#5B6D63] lg:block">
          Members only, no exceptions.
        </span>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-xl font-semibold tracking-tight text-[#1C1C1A]">
              Sign in
            </h2>
            <p className="mt-1.5 text-sm text-[#1C1C1A]/60">
              Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email or Username */}
            <div>
              <label
                htmlFor="emailOrUsername"
                className="mb-1.5 block text-sm font-medium text-[#1C1C1A]/80"
              >
                Email or Username
              </label>
              <input
                id="emailOrUsername"
                type="text"
                autoComplete="username"
                placeholder="you@example.com or username"
                {...register("emailOrUsername")}
                className="block w-full rounded-md border border-[#E2DED3] bg-white px-3.5 py-2.5 text-sm text-[#1C1C1A] placeholder-[#1C1C1A]/35 outline-none transition-colors focus:border-[#C79A4C] focus:ring-2 focus:ring-[#C79A4C]/25"
              />
              {errors.emailOrUsername && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.emailOrUsername.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-[#1C1C1A]/80"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                {...register("password")}
                className="block w-full rounded-md border border-[#E2DED3] bg-white px-3.5 py-2.5 text-sm text-[#1C1C1A] placeholder-[#1C1C1A]/35 outline-none transition-colors focus:border-[#C79A4C] focus:ring-2 focus:ring-[#C79A4C]/25"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Auth Error */}
            {authError && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {authError}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isProcessing}
              size="lg"
              className="w-full bg-[#C79A4C] text-[#14261F] hover:bg-[#B98A3C] focus-visible:ring-[#C79A4C]/40"
            >
              {isProcessing ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-[#1C1C1A]/60">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-[#1C1C1A] underline-offset-2 hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
