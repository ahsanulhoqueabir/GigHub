"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import Image from "next/image";
import { useAuthStore } from "@/store/auth.store";
import { useProfileStore } from "@/store/profile.store";
import { Button } from "@/components/ui/button";
import { compressImageToFile } from "@/lib/image-compression";
import { signUpSchema, type SignUpFormValues } from "@/schema/signup.zod";

type Step = 1 | 2 | 3;

type StepIndicatorProps = {
  step: Step;
};

const StepIndicator = ({ step }: StepIndicatorProps) => (
  <div className="mb-8 flex items-center justify-center gap-2">
    {([1, 2, 3] as const).map((s) => (
      <div key={s} className="flex items-center gap-2">
        <div
          className={`flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
            step === s
              ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
              : step > s
                ? "bg-green-500 text-white"
                : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {step > s ? "✓" : s}
        </div>
        {s < 3 && (
          <div
            className={`h-px w-8 transition-colors ${
              step > s ? "bg-green-500" : "bg-zinc-200 dark:bg-zinc-700"
            }`}
          />
        )}
      </div>
    ))}
  </div>
);

export default function SignUpPage() {
  const router = useRouter();

  const signUp = useAuthStore((s) => s.signUp);
  const isProcessing = useAuthStore((s) => s.isProcessing);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const checkUsername = useProfileStore((s) => s.checkUsername);
  const clearUsernameCheck = useProfileStore((s) => s.clearUsernameCheck);
  const isCheckingUsername = useProfileStore((s) => s.isCheckingUsername);
  const usernameExists = useProfileStore((s) => s.usernameExists);
  const usernameCheckError = useProfileStore((s) => s.usernameCheckError);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Step state ──────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>(1);

  // Step 2: Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Step 3: Bio & skills
  const [skillInput, setSkillInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    getValues,
    trigger,
    control,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      avatar: null,
      bio: "",
      skills: [],
    },
    mode: "onTouched",
  });

  const [name, username, email, password] = useWatch({
    control,
    name: ["name", "username", "email", "password"],
  });
  const skills = useWatch({ control, name: "skills" }) || [];

  // ── Step 1: Validation ───────────────────────────────────────────────────
  const isStep1Valid =
    !!name?.trim() && !!email?.trim() && (password?.length ?? 0) >= 6;

  const handleStep1Next = async () => {
    clearError();
    const step1Valid = await trigger(["name", "email", "password", "username"]);
    if (!step1Valid) return;

    const trimmedUsername = username?.trim();
    if (trimmedUsername) {
      if (isCheckingUsername) {
        setError("username", {
          message: "Checking username availability...",
        });
        return;
      }

      if (usernameExists) {
        setError("username", { message: "Username already exists" });
        return;
      }

      if (usernameCheckError) {
        setError("username", {
          message: usernameCheckError,
        });
        return;
      }
    }

    setStep(2);
  };

  useEffect(() => {
    const trimmed = username?.trim() || "";

    if (!trimmed) {
      clearUsernameCheck();
      clearErrors("username");
      return;
    }

    if (
      errors.username?.message === "Username already exists" ||
      errors.username?.message === "Checking username availability..." ||
      errors.username?.message === usernameCheckError
    ) {
      clearErrors("username");
    }

    const timeoutId = setTimeout(() => {
      checkUsername(trimmed);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    username,
    checkUsername,
    clearUsernameCheck,
    clearErrors,
    errors.username?.message,
    usernameCheckError,
  ]);

  // ── Step 2: Avatar ───────────────────────────────────────────────────────
  const handleAvatarSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compress client-side before storing in state
    const compressed = await compressImageToFile(file, {
      maxWidth: 600,
      maxHeight: 600,
      quality: 0.8,
      format: "image/webp",
    });

    setValue("avatar", compressed, { shouldValidate: true });
    setAvatarPreview(URL.createObjectURL(compressed));
  };

  const handleRemoveAvatar = () => {
    setValue("avatar", null, { shouldValidate: true });
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ── Step 3: Skills ───────────────────────────────────────────────────────
  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setValue("skills", [...skills, trimmed], { shouldValidate: true });
      setSkillInput("");
    }
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setValue(
      "skills",
      skills.filter((s) => s !== skill),
      { shouldValidate: true },
    );
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = async (values: SignUpFormValues) => {
    clearError();

    try {
      await signUp({
        email: values.email,
        password: values.password,
        name: values.name,
        username: values.username?.trim() || undefined,
        avatar: values.avatar || undefined,
        bio: values.bio?.trim() || undefined,
        skills:
          values.skills && values.skills.length > 0 ? values.skills : undefined,
      });
      router.push("/");
    } catch {
      // error is already set in the store
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="px-4 py-12 ">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Create an account
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {step === 1 && "Tell us about yourself."}
            {step === 2 && "Add a profile picture (optional)."}
            {step === 3 && "Tell others what you do."}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <StepIndicator step={step} />

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ══════════ Step 1: Name, Email, Password ══════════ */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    {...register("name")}
                    className="block w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-400"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Username (optional) */}
                <div>
                  <label
                    htmlFor="username"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Username{" "}
                    <span className="text-zinc-400 dark:text-zinc-500">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="johndoe"
                    {...register("username")}
                    className="block w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-400"
                  />
                  {isCheckingUsername && !errors.username && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Checking availability...
                    </p>
                  )}
                  {!isCheckingUsername &&
                    !errors.username &&
                    username?.trim() &&
                    usernameExists === false && (
                      <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                        Username is available
                      </p>
                    )}
                  {!isCheckingUsername &&
                    !errors.username &&
                    username?.trim() &&
                    usernameExists === true && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        Username already exists
                      </p>
                    )}
                  {!isCheckingUsername &&
                    !errors.username &&
                    username?.trim() &&
                    usernameCheckError && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {usernameCheckError}
                      </p>
                    )}
                  {errors.username && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className="block w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-400"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    {...register("password")}
                    className="block w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-400"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Next */}
                <Button
                  type="button"
                  disabled={!isStep1Valid}
                  className="w-full"
                  size="lg"
                  onClick={handleStep1Next}
                >
                  Continue
                </Button>
              </div>
            )}

            {/* ══════════ Step 2: Avatar ══════════ */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Avatar preview / upload */}
                <div className="flex flex-col items-center gap-4">
                  {avatarPreview ? (
                    <div className="relative">
                      <Image
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="size-28 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-700"
                        width={112}
                        height={112}
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex size-28 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-zinc-300 bg-zinc-100 text-zinc-400 transition-colors hover:border-zinc-400 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
                    >
                      <svg
                        className="size-9"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
                        />
                      </svg>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarSelect}
                  />

                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    PNG, JPG or WebP. Max 600px. Compressed automatically.
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    size="lg"
                    onClick={() => setStep(3)}
                  >
                    {getValues("avatar") ? "Next" : "Skip"}
                  </Button>
                </div>
              </div>
            )}

            {/* ══════════ Step 3: Bio & Skills ══════════ */}
            {step === 3 && (
              <div className="space-y-5">
                {/* Bio */}
                <div>
                  <label
                    htmlFor="bio"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Bio{" "}
                    <span className="text-zinc-400 dark:text-zinc-500">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    placeholder="Tell us about yourself, your skills, and what you offer…"
                    {...register("bio")}
                    className="block w-full resize-none rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-400"
                  />
                  {errors.bio && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.bio.message}
                    </p>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <label
                    htmlFor="skills-input"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Skills{" "}
                    <span className="text-zinc-400 dark:text-zinc-500">
                      (optional)
                    </span>
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      id="skills-input"
                      type="text"
                      placeholder="e.g. Web Development"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      className="block flex-1 rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-400"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddSkill}
                      disabled={!skillInput.trim()}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Skill tags */}
                  {skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-zinc-400 hover:text-red-500"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {errors.skills && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                      {errors.skills.message}
                    </p>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1"
                    size="lg"
                  >
                    {isProcessing ? "Creating account…" : "Create account"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-white"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
