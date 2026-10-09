"use client";

import { useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { TextInput, FieldLabel } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

// Second step shared by sign-up (verify the email address) and sign-in (new
// device / second factor): Clerk emails a one-time code, the user types it.
export function VerifyCodeStep({
  email,
  pending,
  error,
  onVerify,
  onResend,
  locale,
  t,
}: {
  email: string;
  pending: boolean;
  error: string | null;
  onVerify: (code: string) => void;
  onResend: () => void;
  locale: Locale;
  t: Dictionary;
}) {
  const [code, setCode] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onVerify(code.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <p className="text-sm text-body">
        {t.auth.verify.sentTo}{" "}
        <span dir="ltr" className="text-on-dark">
          {email}
        </span>
      </p>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="code">{t.auth.verify.codeLabel}</FieldLabel>
        <TextInput
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          dir="ltr"
          value={code}
          onChange={(event) => setCode(event.target.value)}
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
        icon={<ShieldCheck className="h-4 w-4" />}
        className="mt-2"
      >
        {pending ? t.auth.verify.submitting : t.auth.verify.submit}
      </Button>

      <button
        type="button"
        onClick={onResend}
        disabled={pending}
        className="self-start text-sm text-muted underline hover:text-on-dark disabled:opacity-50"
      >
        {t.auth.verify.resend}
      </button>
    </form>
  );
}
