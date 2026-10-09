"use client";

import type { ReactNode } from "react";
import { useClerk } from "@clerk/nextjs";

// Sign-out has to run client-side so Clerk clears its session cookies; the
// wrapped <button> keeps its own styling and keyboard behaviour, and its click
// bubbles up to here.
export function LogoutButton({
  children,
  className = "contents",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { signOut } = useClerk();

  return (
    <span className={className} onClick={() => signOut({ redirectUrl: "/login" })}>
      {children}
    </span>
  );
}
