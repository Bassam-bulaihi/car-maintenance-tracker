import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/auth/actions";

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

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24">
      <h1 className="text-2xl font-bold text-on-dark">
        مرحباً{profile?.name ? `، ${profile.name}` : ""}
      </h1>
      <p className="text-body">لوحة التحكم قيد الإنشاء.</p>
      <form action={logout}>
        <button
          type="submit"
          className="h-12 rounded-none border border-on-dark px-8 text-sm font-bold text-on-dark transition-colors hover:bg-on-dark hover:text-canvas"
        >
          تسجيل الخروج
        </button>
      </form>
    </main>
  );
}
