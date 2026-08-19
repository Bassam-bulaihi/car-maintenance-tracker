import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24">
      <h1 className="text-2xl font-bold text-on-dark">إنشاء حساب</h1>
      <SignupForm />
    </main>
  );
}
