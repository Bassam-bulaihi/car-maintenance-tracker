import Link from "next/link";
import { requireAdmin } from "@/lib/admin/data";
import { logout } from "@/lib/auth/actions";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <Link href="/admin/presets" className="text-sm font-bold text-on-dark">
          لوحة تحكم المشرف — نماذج الصيانة
        </Link>
        <form action={logout}>
          <button type="submit" className="text-sm text-muted hover:text-on-dark">
            تسجيل الخروج
          </button>
        </form>
      </header>
      <main className="flex flex-1 flex-col px-6 py-8">{children}</main>
    </div>
  );
}
