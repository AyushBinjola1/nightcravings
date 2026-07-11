import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

/**
 * Browser-side Supabase client. Uses the public publishable key only —
 * every read and write made through this client is subject to Row Level
 * Security (Phase 4 §6). Never import the secret/service-role key here or
 * in any module reachable from a Client Component.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
