import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)", "/onboarding(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isProtectedRoute(request)) return;

  const { userId, sessionClaims } = await auth();

  // A Telegram reminder deep-links straight to one vehicle's page; keep the
  // destination so /login can send the user back to that exact car.
  if (!userId) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Optimistic role check only (role comes from the session token's
  // app_metadata claim, mapped from Clerk publicMetadata). This is a fast
  // pre-filter, not the authorization boundary — every admin read/write
  // re-checks against a freshly-fetched user via lib/auth/session.ts.
  if (isAdminRoute(request) && sessionClaims?.app_metadata?.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
