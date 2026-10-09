"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { clerkErrorMessage } from "@/lib/auth/clerk-errors";
import { finalizeNavigate } from "@/lib/auth/navigate";
import { safeNextPath } from "@/lib/auth/validation";
import { TextInput, FieldLabel } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { VerifyCodeStep } from "@/components/auth/verify-code-step";

export function LoginForm({
  next,
  locale,
  t,
}: {
  next?: string;
  locale: Locale;
  t: Dictionary;
}) {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "code">("credentials");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const pending = fetchStatus === "fetching";

  async function finish() {
    const { error } = await signIn.finalize({
      navigate: finalizeNavigate(router, safeNextPath(next)),
    });
    if (error) setError(clerkErrorMessage(error, t));
  }

  // A sign-in from a new device (client trust) or with a second factor
  // continues with a one-time code emailed by Clerk.
  async function continueAfterFirstFactor() {
    if (signIn.status === "complete") return finish();
    if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
      const { error } = await signIn.mfa.sendEmailCode();
      if (error) return setError(clerkErrorMessage(error, t));
      return setStep("code");
    }
    setError(t.auth.errors.generic);
  }

  async function handleCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const emailValue = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setEmail(emailValue);

    const { error } = await signIn.password({ identifier: emailValue, password });
    if (error) return setError(clerkErrorMessage(error, t, "invalidCredentials"));
    await continueAfterFirstFactor();
  }

  async function handleCode(code: string) {
    setError(null);
    const { error } = await signIn.mfa.verifyEmailCode({ code });
    if (error) return setError(clerkErrorMessage(error, t, "invalidCode"));
    if (signIn.status === "complete") return finish();
    setError(t.auth.errors.generic);
  }

  async function handleResend() {
    setError(null);
    const { error } = await signIn.mfa.sendEmailCode();
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
    <form onSubmit={handleCredentials} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="email">{t.auth.login.email}</FieldLabel>
        <TextInput id="email" name="email" type="email" autoComplete="email" required dir="ltr" />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="password">{t.auth.login.password}</FieldLabel>
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
        />
      </div>

      {error && (
        <p className="text-sm text-m-red" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        locale={locale}
        icon={<LogIn className="h-4 w-4" />}
        className="mt-2"
      >
        {pending ? t.auth.login.submitting : t.auth.login.submit}
      </Button>

      <p className="text-sm text-muted">
        {t.auth.login.noAccount}{" "}
        <Link href="/signup" className="text-on-dark underline">
          {t.auth.login.signupLink}
        </Link>
      </p>
    </form>
  );
}
