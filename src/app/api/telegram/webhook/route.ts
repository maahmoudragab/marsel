import { NextRequest, NextResponse } from "next/server";
import { processTelegramMessage, processTelegramCallback } from "@/lib/telegramBotService";

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (webhookSecret) {
      const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
      if (headerSecret !== webhookSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

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
