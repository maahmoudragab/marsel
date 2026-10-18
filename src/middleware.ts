import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const forwardedHost = request.headers.get("x-forwarded-host") || "";

  // Check if request is arriving through an admin subdomain
  // e.g. admin.marsel.studio, admin.localhost:3000, admin.vercel.app
  const isAdminSubdomain =
    host.startsWith("admin.") ||
    host.includes("admin.localhost") ||
    forwardedHost.startsWith("admin.");

  // Map subdomain paths cleanly to /admin internal routes
  let effectivePath = pathname;
  if (isAdminSubdomain && !pathname.startsWith("/api")) {
    if (pathname === "/") {
      effectivePath = "/admin";
    } else if (!pathname.startsWith("/admin")) {
      effectivePath = `/admin${pathname}`;
    }
  }

  // Protect admin routes
  if (effectivePath.startsWith("/admin")) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const isAuthorized = await verifySessionToken(token);

    // Inner admin pages (/admin/orders, /admin/products, /admin/offers, etc.)
    // MUST return 404 if not authenticated.
    if (effectivePath !== "/admin" && !isAuthorized) {
      return NextResponse.rewrite(new URL("/not-found", request.url));
    }

    // If on admin subdomain and path was mapped (e.g. /orders -> /admin/orders)
    if (isAdminSubdomain && effectivePath !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = effectivePath;
      return NextResponse.rewrite(url);
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};