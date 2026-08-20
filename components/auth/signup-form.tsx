"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { signup, type AuthFormState } from "@/lib/auth/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { TextInput, FieldLabel } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

export function SignupForm({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signup,
    undefined,
  );

  // React clears uncontrolled <form> fields once the action returns, even on
  // an error — so on failure the user would otherwise have to retype
  // everything. Remount the fields (adjusting state during render, per
  // https://react.dev/learn/you-might-not-need-an-effect) whenever a fresh
  // state comes back, seeding them with the values the action echoed back.
  const [prevState, setPrevState] = useState(state);
  const [fieldsKey, setFieldsKey] = useState(0);
  if (state !== prevState) {
    setPrevState(state);
    setFieldsKey((k) => k + 1);
  }

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="name">{t.auth.signup.name}</FieldLabel>
        <TextInput
          key={`name-${fieldsKey}`}
          id="name"
          name="name"
          required
          defaultValue={state?.values?.name}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="email">{t.auth.signup.email}</FieldLabel>
        <TextInput
          key={`email-${fieldsKey}`}
          id="email"
          name="email"
          type="email"
          required
          dir="ltr"
          defaultValue={state?.values?.email}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="phone_number">{t.auth.signup.phone}</FieldLabel>
        <TextInput
          key={`phone-${fieldsKey}`}
          id="phone_number"
          name="phone_number"
          type="tel"
          placeholder="+966501234567"
          required
          dir="ltr"
          defaultValue={state?.values?.phone_number}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="password">{t.auth.signup.password}</FieldLabel>
        <TextInput id="password" name="password" type="password" minLength={8} required dir="ltr" />
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
