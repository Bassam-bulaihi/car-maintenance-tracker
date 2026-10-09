import { auth } from "@clerk/nextjs/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Request-scoped client that acts as the signed-in Clerk user: Supabase
 * verifies the Clerk session token (third-party auth) and RLS reads the
 * Clerk user ID from auth.jwt() ->> 'sub'. Create a new client within each
 * function; never put it in a global.
 */
export async function createClient() {
  const { getToken } = await auth();

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      accessToken: async () => (await getToken()) ?? null,
    },
  );
}
