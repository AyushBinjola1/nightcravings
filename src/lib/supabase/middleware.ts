import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export type SessionRefreshResult = {
  response: NextResponse;
  user: User | null;
};

let warnedMissingConfig = false;

/**
 * Refreshes the Supabase auth session on every request. Required because
 * Server Components cannot write cookies themselves (see the catch block in
 * `server.ts`) — this is what actually persists a refreshed token back to
 * the browser (Phase 4 §4, "Remember me" / multi-device).
 *
 * Also returns the revalidated user so `src/proxy.ts` can apply route
 * protection (e.g. the Owner Console) without a second round-trip to
 * Supabase Auth.
 *
 * Runs on every route (see the matcher in `src/proxy.ts`), so a missing or
 * unreachable Supabase project must never crash the whole app — it fails
 * open to "no user," which is the secure default: it can only ever cause a
 * protected route to redirect to `/login`, never grant access it shouldn't.
 */
export async function updateSession(
  request: NextRequest,
): Promise<SessionRefreshResult> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (!warnedMissingConfig) {
      console.warn(
        "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY " +
          "are not set — every request is treated as signed out. See .env.example.",
      );
      warnedMissingConfig = true;
    }
    return { response, user: null };
  }

  const supabase = createServerClient<Database>(url, anonKey, {
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
  });

  try {
    // Revalidates the session with Supabase Auth (not just decoding the
    // local JWT) so a revoked/expired session is caught immediately rather
    // than on the next natural token refresh.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { response, user };
  } catch (error) {
    console.error("[supabase] auth.getUser() failed:", error);
    return { response, user: null };
  }
}
