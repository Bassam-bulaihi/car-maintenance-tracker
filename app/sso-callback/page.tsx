import { getDictionary } from "@/lib/i18n/locale";
import { SsoCallback } from "@/components/auth/sso-callback";

// Where Google (and any other social provider) returns to. Finishes the
// Clerk session, then hands off to the destination the button asked for.
export default async function SsoCallbackPage() {
  const { t } = await getDictionary();
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-body" aria-busy="true">
      <SsoCallback />
      <p>{t.auth.social.finishing}</p>
    </main>
  );
}
