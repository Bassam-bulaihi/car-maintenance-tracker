"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { completeOnboarding, type AuthFormState } from "@/lib/auth/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { TextInput, FieldLabel } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

export function OnboardingForm({
  name,
  locale,
  t,
}: {
  name: string;
  locale: Locale;
  t: Dictionary;
}) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    completeOnboarding,
    undefined,
  );

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="name">{t.auth.signup.name}</FieldLabel>
        <TextInput id="name" name="name" autoComplete="name" defaultValue={name} required />
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
        icon={<Check className="h-4 w-4" />}
        className="mt-2"
      >
        {pending ? t.auth.onboarding.submitting : t.auth.onboarding.submit}
      </Button>
    </form>
  );
}
