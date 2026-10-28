import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
  createSessionToken,
  verifyAdminPassword,
} from "@/lib/auth";

// Rate limiting against brute-force attacks (max 5 failed attempts per 15 mins per IP)
const failedAttemptsMap = new Map<string, { count: number; lockedUntil: number }>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const now = Date.now();
    const entry = failedAttemptsMap.get(ip);

    if (entry && entry.lockedUntil > now) {
      const waitMinutes = Math.ceil((entry.lockedUntil - now) / 60000);
      return NextResponse.json(
        { error: `محاولات تسجيل دخول خاطئة متعددة. برجاء المحاولة بعد ${waitMinutes} دقيقة.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      const current = failedAttemptsMap.get(ip) || { count: 0, lockedUntil: 0 };
      const newCount = current.count + 1;
      if (newCount >= 5) {
        failedAttemptsMap.set(ip, { count: newCount, lockedUntil: now + 15 * 60 * 1000 }); // lock 15 mins
      } else {
        failedAttemptsMap.set(ip, { count: newCount, lockedUntil: 0 });
      }
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    // Reset failed attempts on success
    failedAttemptsMap.delete(ip);

    const token = await createSessionToken();
    const cookieStore = await cookies();

    cookieStore.set(ADMIN_SESSION_COOKIE, token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_SECONDS, // 24 hours
    });

    return NextResponse.json({ success: true, message: "Logged in successfully" });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}