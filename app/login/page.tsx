import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { LoginForm } from "@/components/auth/login-form";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { getDictionary } from "@/lib/i18n/locale";
import { safeNextPath } from "@/lib/auth/validation";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  const { isAuthenticated } = await auth();
  if (isAuthenticated) redirect(safeNextPath(next));

  const { locale, t } = await getDictionary();

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24">
      <div className="absolute end-6 top-6">
        <LanguageToggle locale={locale} />
      </div>
      <h1 className="text-[32px] font-bold leading-tight text-on-dark">{t.auth.login.title}</h1>
      <LoginForm next={next} locale={locale} t={t} />
    </main>
  );
}
