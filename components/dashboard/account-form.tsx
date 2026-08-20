"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { updateAccount } from "@/lib/account/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { TextInput, FieldLabel } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

export function AccountForm({
  name,
  email,
  phoneNumber,
  locale,
  t,
}: {
  name: string;
  email: string;
  phoneNumber: string;
  locale: Locale;
  t: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(updateAccount, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-6 border border-hairline bg-surface-card/70 backdrop-blur-sm p-6">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="name">{t.account.nameLabel}</FieldLabel>
        <TextInput id="name" name="name" defaultValue={name} required minLength={2} />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="email">{t.account.emailLabel}</FieldLabel>
        <TextInput id="email" defaultValue={email} disabled dir="ltr" />
        <p className="text-xs text-muted">{t.account.emailNote}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="phone_number">{t.account.phoneLabel}</FieldLabel>
        <TextInput
          id="phone_number"
          name="phone_number"
          defaultValue={phoneNumber}
          required
          dir="ltr"
          placeholder="+9665XXXXXXXX"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending} locale={locale} icon={<Save className="h-4 w-4" />}>
          {pending ? t.account.saving : t.account.save}
        </Button>
        {state && "success" in state && (
          <p className="text-sm text-success" role="status">
            {t.account.success}
          </p>
        )}
        {state && "error" in state && (
          <p className="text-sm text-m-red" role="alert">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
