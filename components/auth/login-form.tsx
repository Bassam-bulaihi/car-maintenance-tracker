"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { login, type AuthFormState } from "@/lib/auth/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { TextInput, FieldLabel } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

export function LoginForm({
  confirmEmail,
  locale,
  t,
}: {
  confirmEmail?: boolean;
  locale: Locale;
  t: Dictionary;
}) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    login,
    undefined,
  );

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      {confirmEmail && <p className="text-sm text-success">{t.auth.login.confirmed}</p>}

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="email">{t.auth.login.email}</FieldLabel>
        <TextInput id="email" name="email" type="email" required dir="ltr" />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="password">{t.auth.login.password}</FieldLabel>
        <TextInput id="password" name="password" type="password" required dir="ltr" />
      </div>

      {state?.error && (
        <p className="text-sm text-m-red" role="alert">
          {state.error}
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
