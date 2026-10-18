import { NextRequest, NextResponse } from "next/server";
import { processTelegramMessage, processTelegramCallback } from "@/lib/telegramBotService";

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    if (update && update.message && update.message.text) {
      const chatId = update.message.chat?.id;
      const text = update.message.text;

      if (chatId && text) {
        await processTelegramMessage(chatId, text);
      }
    } else if (update && update.callback_query) {
      await processTelegramCallback(update.callback_query);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Telegram Webhook] Error:", error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram so it doesn't retry infinitely
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    bot: "MARSEL STORE Bot Webhook",
  });
}
