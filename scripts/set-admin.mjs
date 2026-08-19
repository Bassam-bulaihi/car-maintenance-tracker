// One-off operator script to grant the admin role to a user.
//
// There is deliberately no self-service "become admin" UI or API route —
// role lives in auth.users.app_metadata (never user-editable), so granting
// it requires the secret key. Run manually:
//
//   node scripts/set-admin.mjs someone@example.com
//
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const env = {};
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (match) env[match[1]] = match[2].trim();
  }
  return env;
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/set-admin.mjs <email>");
  process.exit(1);
}

const env = loadEnvLocal();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: profile, error: lookupError } = await supabase
  .from("users")
  .select("id")
  .eq("email", email)
  .single();

if (lookupError || !profile) {
  console.error(`No user found with email ${email}. They must sign up first.`);
  process.exit(1);
}

const { error: updateError } = await supabase.auth.admin.updateUserById(profile.id, {
  app_metadata: { role: "admin" },
});

if (updateError) {
  console.error(updateError.message);
  process.exit(1);
}

console.log(`${email} is now an admin. They must sign out and back in for it to take effect.`);
