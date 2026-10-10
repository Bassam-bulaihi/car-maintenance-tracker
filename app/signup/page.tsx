import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignupForm } from "@/components/auth/signup-form";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { SocialSignIn } from "@/components/auth/social-sign-in";
import { getDictionary } from "@/lib/i18n/locale";

export default async function SignupPage() {
  const { isAuthenticated } = await auth();
  if (isAuthenticated) redirect("/dashboard");

  const { locale, t } = await getDictionary();

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24">
      <div className="absolute end-6 top-6">
        <LanguageToggle locale={locale} />
      </div>
      <h1 className="text-[32px] font-bold leading-tight text-on-dark">{t.auth.signup.title}</h1>
      <SocialSignIn mode="signUp" locale={locale} t={t} />
      <SignupForm locale={locale} t={t} />
    </main>
  );
}
