"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthFormState } from "@/lib/auth/actions";

const inputClass =
  "h-12 w-full rounded-none border border-hairline bg-surface-card px-4 text-on-dark placeholder:text-muted focus:border-on-dark focus:outline-none";

const labelClass = "text-sm text-body";

export function SignupForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signup,
    undefined,
  );

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="name">
          الاسم الكامل
        </label>
        <input id="name" name="name" required className={inputClass} />
      </div>

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
        <label className={labelClass} htmlFor="phone_number">
          رقم الجوال (واتساب)
        </label>
        <input
          id="phone_number"
          name="phone_number"
          type="tel"
          placeholder="+966501234567"
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
          minLength={8}
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
        {pending ? "جارِ الإنشاء..." : "إنشاء حساب"}
      </button>

      <p className="text-sm text-muted">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="text-on-dark underline">
          تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
