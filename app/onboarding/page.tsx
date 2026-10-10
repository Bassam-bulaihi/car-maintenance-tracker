import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { getDictionary } from "@/lib/i18n/locale";
import { requireSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

// Reached when a signed-in Clerk user has no public.users row yet and the
// signup metadata couldn't create one (lib/auth/profile.ts).
export default async function OnboardingPage() {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("users").select("id").eq("id", user.id).maybeSingle();
  if (profile) redirect("/dashboard");

  const { locale, t } = await getDictionary();

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24">
      <div className="absolute end-6 top-6">
        <LanguageToggle locale={locale} />
      </div>
      <div className="flex max-w-sm flex-col gap-2 text-center">
        <h1 className="text-[32px] font-bold leading-tight text-on-dark">{t.auth.onboarding.title}</h1>
        <p className="text-body">{t.auth.onboarding.intro}</p>
      </div>
      <OnboardingForm
        name={user.unsafeMetadata.name ?? ""}
        locale={locale}
        t={t}
      />
    </main>
  );
}
