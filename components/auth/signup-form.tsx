"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { UserPlus } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { clerkErrorMessage } from "@/lib/auth/clerk-errors";
import { finalizeNavigate } from "@/lib/auth/navigate";
import { MIN_PASSWORD_LENGTH, validateProfileFields } from "@/lib/auth/validation";
import { TextInput, FieldLabel } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { VerifyCodeStep } from "@/components/auth/verify-code-step";

export function SignupForm({ locale, t }: { locale: Locale; t: Dictionary }) {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const [step, setStep] = useState<"details" | "code">("details");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const pending = fetchStatus === "fetching";

  async function finish() {
    const { error } = await signUp.finalize({ navigate: finalizeNavigate(router, "/dashboard") });
    if (error) setError(clerkErrorMessage(error, t));
  }

  async function handleDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const emailValue = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const fieldError = validateProfileFields(name);
    if (fieldError) return setError(t.auth.errors[fieldError]);
    if (password.length < MIN_PASSWORD_LENGTH) return setError(t.auth.errors.password);

    setEmail(emailValue);

    // name/language ride along in unsafeMetadata and become the
    // public.users row on first sign-in (lib/auth/profile.ts), where they are
    // validated again server-side.
    const { error } = await signUp.password({
      emailAddress: emailValue,
      password,
      unsafeMetadata: { name, language: locale },
    });
    if (error) return setError(clerkErrorMessage(error, t));

    if (signUp.status === "complete") return finish();

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) return setError(clerkErrorMessage(sendError, t));
    setStep("code");
  }

  async function handleCode(code: string) {
    setError(null);
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) return setError(clerkErrorMessage(error, t, "invalidCode"));
    if (signUp.status === "complete") return finish();
    setError(t.auth.errors.generic);
  }

  async function handleResend() {
    setError(null);
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) setError(clerkErrorMessage(error, t));
  }

  if (step === "code") {
    return (
      <VerifyCodeStep
        email={email}
        pending={pending}
        error={error}
        onVerify={handleCode}
        onResend={handleResend}
        locale={locale}
        t={t}
      />
    );
  }

  return (
    <form onSubmit={handleDetails} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="name">{t.auth.signup.name}</FieldLabel>
        <TextInput id="name" name="name" autoComplete="name" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="email">{t.auth.signup.email}</FieldLabel>
        <TextInput id="email" name="email" type="email" autoComplete="email" required dir="ltr" />
      </div>


      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="password">{t.auth.signup.password}</FieldLabel>
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
          dir="ltr"
        />
      </div>

      {/* Clerk bot protection mounts its CAPTCHA widget here in custom flows. */}
      <div id="clerk-captcha" />

      {error && (
        <p className="text-sm text-m-red" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        locale={locale}
        icon={<UserPlus className="h-4 w-4" />}
        className="mt-2"
      >
        {pending ? t.auth.signup.submitting : t.auth.signup.submit}
      </Button>

      <p className="text-sm text-muted">
        {t.auth.signup.hasAccount}{" "}
        <Link href="/login" className="text-on-dark underline">
          {t.auth.signup.loginLink}
        </Link>
      </p>
    </form>
  );
}
