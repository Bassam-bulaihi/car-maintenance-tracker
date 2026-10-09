import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Browser client that acts as the signed-in Clerk user. Pass the session's
 * token getter, e.g. `createClient(() => session?.getToken() ?? null)` with
 * `useSession()` from @clerk/nextjs.
 */
export function createClient(getToken: () => Promise<string | null>) {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { accessToken: getToken },
  );
}
