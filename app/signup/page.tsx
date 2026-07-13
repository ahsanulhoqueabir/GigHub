"use client";

import { AuthSidebar } from "@/components/shared/auth-sidebar";
import { Button } from "@/components/ui/button";
import { branding } from "@/config/brand.config";
import { useReturnTo } from "@/hooks/use-return-to";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { useDepartmentsStore } from "@/store/departments.store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconArrowUpRight,
  IconId,
  IconLock,
  IconMail,
  IconSchool,
  IconUser,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function SignUpPageContent() {
  const router = useRouter();
  const { returnTo } = useReturnTo("/");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const signUp = useAuthStore((s) => s.signUp);
  const isProcessing = useAuthStore((s) => s.isProcessing);
  const authError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const { departments, fetchDepartments, hasFetched } = useDepartmentsStore();

  useEffect(() => {
    if (!hasFetched) {
      fetchDepartments(1, 100);
    }
  }, [hasFetched, fetchDepartments]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const container = document.getElementById("department-container");
      if (container && !container.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.acronym &&
        d.acronym.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      student_id: "",
      department: "",
    },
  });

  const onSubmit = async (data: SignUpInput) => {
    clearError();

    try {
      await signUp({
        name: data.name,
        email: data.email,
        password: data.password,
        student_id: data.student_id,
        department: data.department,
      });
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
          defaultTitle="Join the Opportunity Loop."
          defaultDesc="Create a verified campus profile, unlock freelance tasks, hire peer students, and build a real-world career portfolio."
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
              Join the Campus Loop.
            </p>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground bg-linear-to-r from-foreground to-foreground/80 bg-clip-text">
              Create an account
            </h2>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Fill in the details below to get started.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground/80"
              >
                Full Name
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60 transition-colors group-focus-within:text-primary">
                  <IconUser className="size-4.5" />
                </span>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Ahsanul Hoque"
                  {...register("name")}
                  className="block w-full rounded-xl border border-border bg-background/40 pl-11 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 outline-hidden transition-all focus:border-primary focus:ring-3 focus:ring-primary/10"
                />
              </div>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive mt-1 font-medium pl-1"
                >
                  {errors.name.message}
                </motion.p>
              )}
            </div>

            {/* Student ID and Department (Grid) */}
            {/* Student ID */}
            <div className="space-y-1.5">
              <label
                htmlFor="student_id"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground/80"
              >
                Student ID
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60 transition-colors group-focus-within:text-primary">
                  <IconId className="size-4.5" />
                </span>
                <input
                  id="student_id"
                  type="text"
                  autoComplete="off"
                  placeholder="B210305040"
                  {...register("student_id")}
                  className="block w-full rounded-xl border border-border bg-background/40 pl-11 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 outline-hidden transition-all focus:border-primary focus:ring-3 focus:ring-primary/10"
                />
              </div>
              {errors.student_id && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive mt-1 font-medium pl-1"
                >
                  {errors.student_id.message}
                </motion.p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-1.5 relative" id="department-container">
              <label
                htmlFor="department-search"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground/80"
              >
                Department
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60 transition-colors group-focus-within:text-primary">
                  <IconSchool className="size-4.5" />
                </span>
                <input
                  id="department-search"
                  type="text"
                  autoComplete="off"
                  placeholder="Search or select department"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setValue("department", "");
                    setIsOpen(true);
                  }}
                  onFocus={() => setIsOpen(true)}
                  className="block w-full rounded-xl border border-border bg-background/40 pl-11 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 outline-hidden transition-all focus:border-primary focus:ring-3 focus:ring-primary/10"
                />
                <input type="hidden" {...register("department")} />
              </div>

              {/* Dropdown list */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-border/80 bg-card/95 backdrop-blur-md shadow-xl p-1 scrollbar-thin"
                  >
                    {filteredDepts.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                        No departments found
                      </div>
                    ) : (
                      filteredDepts.map((dept) => (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => {
                            setSearchQuery(dept.name);
                            setValue("department", dept.id, {
                              shouldValidate: true,
                            });
                            setIsOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-primary/10 hover:text-primary outline-hidden flex items-center justify-between"
                        >
                          <span>{dept.name}</span>
                          {dept.acronym && (
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground font-semibold uppercase">
                              {dept.acronym}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {errors.department && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive mt-1 font-medium pl-1"
                >
                  {errors.department.message}
                </motion.p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground/80"
              >
                Email Address
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60 transition-colors group-focus-within:text-primary">
                  <IconMail className="size-4.5" />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@gighub.com"
                  {...register("email")}
                  className="block w-full rounded-xl border border-border bg-background/40 pl-11 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 outline-hidden transition-all focus:border-primary focus:ring-3 focus:ring-primary/10"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive mt-1 font-medium pl-1"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground/80"
              >
                Password
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60 transition-colors group-focus-within:text-primary">
                  <IconLock className="size-4.5" />
                </span>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  {...register("password")}
                  className="block w-full rounded-xl border border-border bg-background/40 pl-11 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 outline-hidden transition-all focus:border-primary focus:ring-3 focus:ring-primary/10"
                />
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive mt-1 font-medium pl-1"
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
              className="w-full relative overflow-hidden bg-linear-to-r from-primary to-[#2C6A4F] hover:from-[#2C6A4F] hover:to-primary text-white border-none shadow-md shadow-primary/10 active:scale-[0.98] transition-all duration-300 py-6 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold tracking-wide mt-2"
            >
              <span>
                {isProcessing ? "Creating account…" : "Create account"}
              </span>
              {!isProcessing && <IconArrowUpRight className="size-4" />}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SignUpPageContent />
    </Suspense>
  );
}
