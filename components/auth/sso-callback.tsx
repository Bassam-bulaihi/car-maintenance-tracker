"use client";

import { useRouter } from "next/navigation";
import { HandleSSOCallback } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export function SsoCallback() {
  const router = useRouter();
  const go = (url: string) => (url.startsWith("http") ? (window.location.href = url) : router.push(url));

  return (
    <>
      <Loader2 className="h-6 w-6 animate-spin text-on-dark" aria-hidden="true" />
      <HandleSSOCallback
        navigateToApp={({ decorateUrl }) => go(decorateUrl("/dashboard"))}
        navigateToSignIn={() => router.push("/login")}
        navigateToSignUp={() => router.push("/signup")}
      />
    </>
  );
}
