import { redirect } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/auth/actions";
import { getDictionary } from "@/lib/i18n/locale";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("name, phone_number")
    .eq("id", user.sub)
    .single();

  const { locale, t } = await getDictionary();
  const isAdmin = user.app_metadata?.role === "admin";

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24">
      <div className="absolute end-6 top-6">
        <LanguageToggle locale={locale} />
      </div>
      <h1 className="text-[32px] font-bold leading-tight text-on-dark">
        {t.dashboard.welcome}
        {profile?.name ? `، ${profile.name}` : ""}
      </h1>
      <p className="text-body">{t.dashboard.placeholder}</p>
      <div className="flex items-center gap-3">
        {isAdmin && (
          <Link href="/admin/presets">
            <Button variant="outline" locale={locale} icon={<Shield className="h-4 w-4" />}>
              {t.admin.nav.title}
            </Button>
          </Link>
        )}
        <form action={logout}>
          <Button type="submit" locale={locale} icon={<LogOut className="h-4 w-4" />}>
            {t.common.logout}
          </Button>
        </form>
      </div>
    </main>
  );
}
