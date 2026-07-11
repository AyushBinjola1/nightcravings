import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const CONSOLE_PREFIX = "/console";
const STAFF_LOGIN_PATH = "/console/login";
const STAFF_HOME_PATH = "/console/dashboard";

/**
 * Refreshes the Supabase session on every request (Phase 4 §4) and, per
 * Phase 3's requirement that only authenticated staff ever reach the Owner
 * Console, redirects unauthenticated visitors from any `/console/*` route
 * to sign-in — and a signed-in staff member away from the sign-in page to
 * the dashboard, so it never shows a stale sign-in form to someone already
 * signed in.
 *
 * The Owner Console lives entirely under `/console` — a deliberate prefix,
 * not the bare `/dashboard`, `/orders`, etc. originally used: those
 * collided with the customer-facing `/orders/[orderId]` tracking route
 * (Phase 2 §9), which this proxy would otherwise have wrongly redirected
 * to staff login. Caught while building Stage 6.
 *
 * Role-based route scoping (manager vs. delivery partner, Phase 4 §5) is
 * enforced at the RLS/query layer, not here — this proxy only answers "is
 * anyone signed in," not "which role."
 */
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isConsoleRoute =
    pathname === CONSOLE_PREFIX || pathname.startsWith(`${CONSOLE_PREFIX}/`);
  const isLoginRoute = pathname === STAFF_LOGIN_PATH;

  if (isConsoleRoute && !isLoginRoute && !user) {
    const redirectUrl = new URL(STAFF_LOGIN_PATH, request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL(STAFF_HOME_PATH, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on every route except static assets and image optimization
     * files, so the auth session refreshes on every real navigation
     * without doing unnecessary work on non-page requests.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
