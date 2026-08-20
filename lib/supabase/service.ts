import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Service-role client for trusted server code with no user session — cron
 * jobs and the WhatsApp webhook. Bypasses RLS (docs/PRD.md 7.3, 5.3: these
 * write on behalf of the system, not a signed-in user). Never import this
 * from a client component or anywhere a request might be attacker-controlled
 * without its own auth check (cron routes and the webhook verify their own
 * caller before touching this).
 */
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );
}
