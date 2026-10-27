import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { MAINTENANCE_MODE } from "@/config/maintenance";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const forwardedHost = request.headers.get("x-forwarded-host") || "";

  // Check if request is arriving through an admin subdomain
  // e.g. admin.marsel.studio, themarsel-admin.vercel.app, admin-themarsel.vercel.app, admin.localhost:3000
  const isAdminSubdomain =
    host.startsWith("admin.") ||
    host.startsWith("admin-") ||
    host.includes("-admin.") ||
    host.includes("admin.localhost") ||
    forwardedHost.startsWith("admin.") ||
    forwardedHost.startsWith("admin-") ||
    forwardedHost.includes("-admin.");

  // Map subdomain paths cleanly to /admin internal routes
  let effectivePath = pathname;
  if (isAdminSubdomain && !pathname.startsWith("/api")) {
    if (pathname === "/") {
      effectivePath = "/admin";
    } else if (!pathname.startsWith("/admin")) {
      effectivePath = `/admin${pathname}`;
    }
  }

  // 1. Handle Maintenance Mode (🔒 قفل الموقع لحين نزول الكوليكشن من env)
  const envMaintenance = process.env.MAINTENANCE_MODE ?? process.env.NEXT_PUBLIC_MAINTENANCE_MODE;
  const isMaintenanceActive = envMaintenance !== undefined ? envMaintenance === "true" : MAINTENANCE_MODE;

  if (isMaintenanceActive) {
    const previewParam = request.nextUrl.searchParams.get("preview");
    const hasPreviewCookie = request.cookies.get("marsel_preview")?.value === "1";
    const hasAdminSession = Boolean(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

    // Bypass check for admin previewing the store
    const isBypassed =
      previewParam === "marsel2026" ||
      hasPreviewCookie ||
      hasAdminSession;

    const isExemptPath =
      effectivePath.startsWith("/admin") ||
      effectivePath.startsWith("/atelier-hub-9821") ||
      effectivePath.startsWith("/api") ||
      effectivePath === "/coming-soon" ||
      effectivePath === "/robots.txt" ||
      effectivePath === "/sitemap.xml";

    if (!isExemptPath && !isBypassed) {
      const url = request.nextUrl.clone();
      url.pathname = "/coming-soon";
      return NextResponse.rewrite(url);
    }

    if (previewParam === "marsel2026") {
      const response = NextResponse.next();
      response.cookies.set("marsel_preview", "1", {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24, // 24 hours
        sameSite: "lax",
      });
      return response;
    }
  } else {
    // If maintenance is OFF and someone visits /coming-soon, redirect to homepage
    if (pathname === "/coming-soon") {
      return NextResponse.redirect(new URL("/", request.url));
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};