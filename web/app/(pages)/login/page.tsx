"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site.config";
import { loginSchema, type LoginFormValues } from "@/schema/login.zod";

export default function LoginPage() {
  const router = useRouter();

  const login = useAuthStore((s) => s.login);
  const isProcessing = useAuthStore((s) => s.isProcessing);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    clearError();

    try {
      await login(values);
      router.push("/"); // redirect to home on success
    } catch {
      // error is already set in the store
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f4ef] px-4 py-12 text-zinc-950 dark:bg-[#0b0f0f] dark:text-white">
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.35),transparent_65%)]" />
      <div className="pointer-events-none absolute -right-28 bottom-0 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.35),transparent_65%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_70%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-4xl items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400">
              {siteConfig.name}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Welcome back — enter your credentials to continue.
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.5)] backdrop-blur dark:border-white/10 dark:bg-white/5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="block w-full rounded-lg border border-zinc-200 bg-white/90 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/10 dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-300"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...register("password")}
                    className="block w-full rounded-lg border border-zinc-200 bg-white/90 px-3.5 py-2.5 pr-11 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/10 dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <IconEyeOff size={18} />
                    ) : (
                      <IconEye size={18} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-white"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
