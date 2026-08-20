import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/locale";
import { BackLink } from "@/components/ui/back-link";
import { BracketLabel } from "@/components/ui/bracket-label";
import { AccountForm } from "@/components/dashboard/account-form";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { locale, t }] = await Promise.all([
    supabase.from("users").select("name, phone_number").eq("id", user.id).single(),
    getDictionary(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <BackLink href="/dashboard">{t.dashboard.backToVehicles}</BackLink>
      <div className="flex flex-col gap-2">
        <BracketLabel>{t.account.eyebrow}</BracketLabel>
        <h1
          className={`text-[32px] font-bold leading-[0.95] text-on-dark ${locale === "en" ? "uppercase tracking-[-0.02em]" : ""}`}
        >
          {t.account.title}
        </h1>
      </div>

      <AccountForm
        name={profile?.name ?? ""}
        email={user.email ?? ""}
        phoneNumber={profile?.phone_number ?? ""}
        locale={locale}
        t={t}
      />
    </main>
  );
}
