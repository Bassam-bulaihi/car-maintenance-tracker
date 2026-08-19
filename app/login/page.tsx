import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const confirmEmail = params.confirm === "1";

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24">
      <h1 className="text-2xl font-bold text-on-dark">تسجيل الدخول</h1>
      <LoginForm confirmEmail={confirmEmail} />
    </main>
  );
}
