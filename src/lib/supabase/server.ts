import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

/**
 * Server-side Supabase client for use inside Server Components, Server
 * Actions, and Route Handlers. Reads/writes auth cookies via the Next.js
 * `cookies()` API so a session established on the server stays in sync with
 * the browser client (Phase 4 §4).
 *
 * Still uses the publishable key — RLS is the authorization boundary here
 * too. The secret/service-role key is never used from this factory; see
 * `src/server/edge-functions` for the few jobs that legitimately need it.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component with no response to attach
            // cookies to — safe to ignore because the middleware in
            // `middleware.ts` refreshes the session on every request.
          }
        },
      },
    },
  );
}
