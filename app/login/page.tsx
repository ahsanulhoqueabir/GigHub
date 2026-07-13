"use client";

import { AuthSidebar } from "@/components/shared/auth-sidebar";
import { Button } from "@/components/ui/button";
import { branding } from "@/config/brand.config";
import { useReturnTo } from "@/hooks/use-return-to";
import { loginSchema, type LoginInput } from "@/lib/validations/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowUpRight, IconLock, IconMail } from "@tabler/icons-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";

function LoginPageContent() {
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
    <div className="relative min-h-screen w-full flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden font-sans">
      {/* Immersive mesh gradients */}
      <div
        className="absolute left-1/4 top-1/4 -z-10 h-75 sm:h-112.5 w-75 sm:w-112.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[100px] sm:blur-[130px] animate-pulse"
        style={{ animationDuration: "12s" }}
      />
      <div
        className="absolute right-1/4 bottom-1/4 -z-10 h-75 sm:h-112.5 w-75 sm:w-112.5 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[100px] sm:blur-[130px] animate-pulse"
        style={{ animationDuration: "16s" }}
      />
      <div className="absolute left-1/2 top-1/2 -z-10 h-62.5 sm:h-87.5 w-62.5 sm:w-87.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 dark:bg-secondary/5 blur-[80px] sm:blur-[100px]" />

      {/* Subtle math/grid backdrop */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(128,128,128,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.02)_1px,transparent_1px)] bg-size-[32px_32px]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(16,185,129,0.03),transparent)]" />

      {/* Glassmorphic Portal Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md lg:max-w-5xl rounded-none border-none bg-transparent backdrop-blur-none shadow-none lg:rounded-3xl lg:border lg:border-border/40 lg:bg-card/35 lg:backdrop-blur-md lg:shadow-2xl overflow-hidden grid lg:grid-cols-12 relative"
      >
        {/* Left Side: Immersive Brand DNA Column (Desktop Only) */}
        <AuthSidebar
          defaultTitle="Good to see you again."
          defaultDesc="Sign in to pick up exactly where you left off. Every completed task builds your verified portfolio."
        />

        {/* Right Side: High-Fidelity Form Column */}
        <div className="lg:col-span-6 flex flex-col justify-between p-2 sm:p-6 lg:p-12 lg:bg-background/25">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="size-8 flex items-center justify-center rounded-lg bg-card border border-border/40">
                <Image
                  src={branding.logo}
                  alt="Logo"
                  width={16}
                  height={16}
                  className="size-4"
                />
              </div>
              <span className="text-sm font-bold tracking-tight text-foreground">
                {branding.title}
              </span>
            </div>
            <p className="font-serif text-xs text-primary">
              Good to see you again.
            </p>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground bg-linear-to-r from-foreground to-foreground/80 bg-clip-text">
              Sign in
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Enter your credentials to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email or Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="emailOrUsername"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground/80"
              >
                Email or Username
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60 transition-colors group-focus-within:text-primary">
                  <IconMail className="size-4.5" />
                </span>
                <input
                  id="emailOrUsername"
                  type="text"
                  autoComplete="username"
                  placeholder="you@example.com or username"
                  {...register("emailOrUsername")}
                  className="block w-full rounded-xl border border-border bg-background/40 pl-11 pr-4 py-3 text-sm text-foreground placeholder-muted-foreground/40 outline-hidden transition-all focus:border-primary focus:ring-3 focus:ring-primary/10"
                />
              </div>
              {errors.emailOrUsername && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive mt-1.5 font-medium pl-1"
                >
                  {errors.emailOrUsername.message}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground/80"
                >
                  Password
                </label>
              </div>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60 transition-colors group-focus-within:text-primary">
                  <IconLock className="size-4.5" />
                </span>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...register("password")}
                  className="block w-full rounded-xl border border-border bg-background/40 pl-11 pr-4 py-3 text-sm text-foreground placeholder-muted-foreground/40 outline-hidden transition-all focus:border-primary focus:ring-3 focus:ring-primary/10"
                />
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive mt-1.5 font-medium pl-1"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Auth Error */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {authError}
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isProcessing}
              size="lg"
              className="w-full relative overflow-hidden bg-linear-to-r from-primary to-[#2C6A4F] hover:from-[#2C6A4F] hover:to-primary text-white border-none shadow-md shadow-primary/10 active:scale-[0.98] transition-all duration-300 py-6 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold tracking-wide"
            >
              <span>{isProcessing ? "Signing in…" : "Sign in"}</span>
              {!isProcessing && <IconArrowUpRight className="size-4" />}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary transition-colors"
            >
              Create one
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginPageContent />
    </Suspense>
  );
}
