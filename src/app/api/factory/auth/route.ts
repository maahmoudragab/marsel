import { NextRequest, NextResponse } from "next/server";
import {
  verifyFactoryPasscode,
  createFactorySessionToken,
  FACTORY_SESSION_COOKIE,
  FACTORY_SESSION_DURATION_SECONDS,
} from "@/lib/auth";

// Rate limiting against brute-force attacks (max 5 failed attempts per 15 mins per IP)
const failedFactoryAttemptsMap = new Map<string, { count: number; lockedUntil: number }>();

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
    const entry = failedFactoryAttemptsMap.get(ip);

    if (entry && entry.lockedUntil > now) {
      const waitMinutes = Math.ceil((entry.lockedUntil - now) / 60000);
      return NextResponse.json(
        { error: `محاولات خاطئة متعددة. برجاء المحاولة بعد ${waitMinutes} دقيقة.` },
        { status: 429 }
      );
    }

    const { passcode } = await request.json();

    if (!passcode || typeof passcode !== "string") {
      return NextResponse.json({ error: "Passcode is required" }, { status: 400 });
    }

    const isValid = verifyFactoryPasscode(passcode);
    if (!isValid) {
      const current = failedFactoryAttemptsMap.get(ip) || { count: 0, lockedUntil: 0 };
      const newCount = current.count + 1;
      if (newCount >= 5) {
        failedFactoryAttemptsMap.set(ip, { count: newCount, lockedUntil: now + 15 * 60 * 1000 });
      } else {
        failedFactoryAttemptsMap.set(ip, { count: newCount, lockedUntil: 0 });
      }
      return NextResponse.json({ error: "رمز الدخول غير صحيح، برجاء المحاولة مرة أخرى" }, { status: 401 });
    }

    failedFactoryAttemptsMap.delete(ip);

    const token = await createFactorySessionToken();
    const response = NextResponse.json({ success: true });

    response.cookies.set(FACTORY_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: FACTORY_SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(FACTORY_SESSION_COOKIE);
  return response;
}
