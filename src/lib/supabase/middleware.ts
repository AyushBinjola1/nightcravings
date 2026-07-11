import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";

/**
 * Refreshes the Supabase auth session on every request. Required because
 * Server Components cannot write cookies themselves (see the catch block in
 * `server.ts`) — this is what actually persists a refreshed token back to
 * the browser (Phase 4 §4, "Remember me" / multi-device).
 *
 * Not yet wired into a root `src/proxy.ts` — that happens in Stage 2
 * (Authentication), once there's a real Supabase project and a sign-in flow
 * for it to protect. Activating it earlier would make every route depend on
 * Supabase env vars before Stage 3 (Database) even provisions a project.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Revalidates the session with Supabase Auth (not just decoding the local
  // JWT) so a revoked/expired session is caught immediately rather than on
  // the next natural token refresh.
  await supabase.auth.getUser();

  return response;
}
