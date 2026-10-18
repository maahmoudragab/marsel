import { NextRequest, NextResponse } from "next/server";
import { sendTelegramOrderNotification } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    if (!payload || !payload.order_number) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const sent = await sendTelegramOrderNotification(payload);
    return NextResponse.json({ success: true, notified: sent });
  } catch (err) {
    console.error("Order notify API error:", err);
    return NextResponse.json({ error: "Failed to notify" }, { status: 500 });
  }
}