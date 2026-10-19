import { NextRequest, NextResponse } from "next/server";
import {
  verifyFactoryPasscode,
  createFactorySessionToken,
  FACTORY_SESSION_COOKIE,
  FACTORY_SESSION_DURATION_SECONDS,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { passcode } = await request.json();

    if (!passcode || typeof passcode !== "string") {
      return NextResponse.json({ error: "Passcode is required" }, { status: 400 });
    }

    const isValid = verifyFactoryPasscode(passcode);
    if (!isValid) {
      return NextResponse.json({ error: "رمز الدخول غير صحيح، برجاء المحاولة مرة أخرى" }, { status: 401 });
    }

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
