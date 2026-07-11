import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const OWNER_CONSOLE_PREFIX = "/dashboard";
const OWNER_CONSOLE_ROUTES = [
  "/dashboard",
  "/orders",
  "/inventory",
  "/customers",
  "/analytics",
  "/settings",
];
const STAFF_LOGIN_PATH = "/login";

/**
 * Refreshes the Supabase session on every request (Phase 4 §4) and, per
 * Phase 3's requirement that only authenticated staff ever reach the Owner
 * Console, redirects unauthenticated visitors from any console route to
 * `/login` — and a signed-in staff member away from `/login` to the
 * dashboard, so it never shows a stale sign-in form to someone already
 * signed in.
 *
 * Role-based route scoping (manager vs. delivery partner, Phase 4 §5) is
 * enforced at the RLS/query layer once Stage 3 (Database) exists — this
 * proxy only answers "is anyone signed in," not "which role."
 */
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isOwnerConsoleRoute = OWNER_CONSOLE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isOwnerConsoleRoute && !user) {
    const redirectUrl = new URL(STAFF_LOGIN_PATH, request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === STAFF_LOGIN_PATH && user) {
    return NextResponse.redirect(new URL(OWNER_CONSOLE_PREFIX, request.url));
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
