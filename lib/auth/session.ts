import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export type SessionUser = {
  id: string;
  email: string;
  isAdmin: boolean;
  unsafeMetadata: UserUnsafeMetadata;
};

// Fetched from Clerk's Backend API (not just the session token), so a role
// change takes effect immediately. This is the authorization check; the
// proxy's claim check is only an optimistic pre-filter. Cached per request.
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const user = await currentUser();
  if (!user) return null;

  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? "",
    isAdmin: user.publicMetadata.role === "admin",
    unsafeMetadata: user.unsafeMetadata,
  };
});

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdminUser() {
  const user = await requireSessionUser();
  if (!user.isAdmin) redirect("/dashboard");
  return user;
}
