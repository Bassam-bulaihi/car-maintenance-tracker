"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthFormState } from "@/lib/auth/actions";

const inputClass =
  "h-12 w-full rounded-none border border-hairline bg-surface-card px-4 text-on-dark placeholder:text-muted focus:border-on-dark focus:outline-none";

const labelClass = "text-sm text-body";

export function LoginForm({ confirmEmail }: { confirmEmail?: boolean }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    login,
    undefined,
  );

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      {confirmEmail && (
        <p className="text-sm text-success">
          تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيد الحساب ثم سجّل الدخول.
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="email">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className={inputClass}
          dir="ltr"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="password">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className={inputClass}
          dir="ltr"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-m-red" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 h-12 rounded-none border border-on-dark px-8 text-sm font-bold text-on-dark transition-colors hover:bg-on-dark hover:text-canvas disabled:opacity-50"
      >
        {pending ? "جارِ الدخول..." : "تسجيل الدخول"}
      </button>

      <p className="text-sm text-muted">
        ليس لديك حساب؟{" "}
        <Link href="/signup" className="text-on-dark underline">
          إنشاء حساب جديد
        </Link>
      </p>
    </form>
  );
}
