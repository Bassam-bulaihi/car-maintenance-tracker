import type React from "react";
import { requireProfile } from "@/lib/auth/profile";
import { getDictionary } from "@/lib/i18n/locale";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [{ user, profile }, { locale, t }] = await Promise.all([requireProfile(), getDictionary()]);

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader name={profile.name} isAdmin={user.isAdmin} locale={locale} t={t} />
      {children}
    </div>
  );
}
