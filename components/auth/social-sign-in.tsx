"use client";

import { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { FaGoogle } from "react-icons/fa6";
import { Loader2 } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { clerkErrorMessage } from "@/lib/auth/clerk-errors";
import { safeNextPath } from "@/lib/auth/validation";

/**
 * "Continue with Google" above the email form, on both /login and /signup.
 * Redirects to Google; /sso-callback finishes the session. One button works
 * for new and existing users alike — Clerk turns a sign-in for an unknown
 * Google account into a sign-up, and links a Google account to an existing
 * account with the same verified email.
 */
export function SocialSignIn({
  mode,
  next,
  locale,
  t,
}: {
  mode: "signIn" | "signUp";
  next?: string;
  locale: Locale;
  t: Dictionary;
}) {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tabCase = locale === "en" ? "uppercase tracking-[1.5px]" : "";

  async function continueWithGoogle() {
    setPending(true);
    setError(null);
    const params = {
      strategy: "oauth_google" as const,
      redirectUrl: safeNextPath(next),
      redirectCallbackUrl: "/sso-callback",
    };
    const { error } = mode === "signIn" ? await signIn.sso(params) : await signUp.sso(params);
    if (error) {
      setError(clerkErrorMessage(error, t));
      setPending(false);
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <button
        type="button"
        onClick={continueWithGoogle}
        disabled={pending}
        aria-busy={pending}
        className={`inline-flex h-12 items-center justify-center gap-3 border border-hairline bg-surface-card px-6 text-sm font-bold text-on-dark transition-colors duration-200 hover:border-on-dark hover:bg-on-dark hover:text-canvas active:translate-y-px disabled:cursor-progress disabled:opacity-70 ${tabCase}`}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FaGoogle className="h-4 w-4" aria-hidden="true" />}
        {pending ? t.auth.social.redirecting : t.auth.social.google}
      </button>
      {error && (
        <p className="text-sm text-m-red" role="alert">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3 text-xs text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-hairline" />
        {t.auth.social.or}
        <span className="h-px flex-1 bg-hairline" />
      </div>
    </div>
  );
}
