// One-off operator script to grant the admin role to a user.
//
// There is deliberately no self-service "become admin" UI or API route —
// the role lives in the user's Clerk publicMetadata (never user-editable)
// and reaches the app and Supabase RLS through the session token's
// app_metadata.role claim. Run manually:
//
//   node scripts/set-admin.mjs someone@example.com
//
import { loadEnvLocal, requireEnv } from "./env.mjs";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/set-admin.mjs <email>");
  process.exit(1);
}

const env = loadEnvLocal();
requireEnv(env, "CLERK_SECRET_KEY");

async function clerk(path, init = {}) {
  const response = await fetch(`https://api.clerk.com/v1${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${env.CLERK_SECRET_KEY}`, "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`Clerk ${path}: ${response.status} ${await response.text()}`);
  return response.json();
}

const [user] = await clerk(`/users?email_address=${encodeURIComponent(email)}`);
if (!user) {
  console.error(`No Clerk user with email ${email} — they need to sign up first.`);
  process.exit(1);
}

await clerk(`/users/${user.id}/metadata`, {
  method: "PATCH",
  body: JSON.stringify({ public_metadata: { role: "admin" } }),
});
console.log(`Granted admin to ${email} (${user.id}). Takes effect on their next session token refresh.`);
