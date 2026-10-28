import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { escapeTelegramHtml } from "@/lib/telegramBotService";

function getSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/[^0-9]/g, "");
  return digits.slice(-10); // Match last 10 digits
}

export async function POST(request: NextRequest) {
  try {
    const { orderNumber, reason, phone } = await request.json();

    if (!orderNumber || typeof orderNumber !== "string") {
      return NextResponse.json({ error: "Order number is required" }, { status: 400 });
    }

    const cleanOrderNum = orderNumber.replace(/^#+/, "").trim();
    const supabase = getSupabase();

    // 1. Fetch current order
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_number", cleanOrderNum)
      .maybeSingle();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 1.1 Authorization Gate: verify caller is admin OR customer who owns the order
    const cookieStore = await cookies();
    const adminToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    const isAdmin = await verifySessionToken(adminToken);

    if (!isAdmin) {
      const orderPhoneNorm = normalizePhone(order.phone);
      const secondaryPhoneNorm = normalizePhone(order.secondary_phone);
      const reqPhoneNorm = normalizePhone(phone);

      const isMatch =
        reqPhoneNorm &&
        (reqPhoneNorm === orderPhoneNorm || reqPhoneNorm === secondaryPhoneNorm);

      if (!isMatch) {
        return NextResponse.json(
          { error: "التحقق مطلوب: يجب توفير رقم الهاتف المرتبط بالطلب لإلغائه." },
          { status: 403 }
        );
      }
    }

    // 2. If already cancelled
    if (order.status === "cancelled") {
      return NextResponse.json({
        success: true,
        alreadyCancelled: true,
        status: "cancelled",
        message: "Order is already cancelled.",
      });
    }

    // 3. Do not allow cancellation if order is already out for delivery or delivered
    if (order.status === "out_for_delivery" || order.status === "delivered") {
      return NextResponse.json(
        { error: `Order cannot be cancelled online because it is already ${order.status.replace("_", " ")}.` },
        { status: 400 }
      );
    }

    // 4. Update status to cancelled in database
    const updates: Record<string, any> = {
      status: "cancelled",
      updated_at: new Date().toISOString(),
    };

    const cleanReason = reason && typeof reason === "string" ? reason.trim().slice(0, 500) : "";
    if (cleanReason) {
      const existingNotes = order.notes ? `${order.notes} | ` : "";
      updates.notes = `${existingNotes}Cancellation reason: ${cleanReason}`;
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", order.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 5. Send Telegram Notification to store owner
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (token && chatId) {
      try {
        const cleanPhone = (order.secondary_phone || order.phone).replace(/[^0-9]/g, "");
        const waPhone = cleanPhone.startsWith("0") ? `2${cleanPhone}` : cleanPhone;
        const safeReason = escapeTelegramHtml(cleanReason);
        const alertHtml = `
❌ <b>ORDER CANCELLED BY CUSTOMER</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>Order:</b> <code>#${escapeTelegramHtml(order.order_number)}</code>
👤 <b>Customer:</b> <b>${escapeTelegramHtml(order.customer_name)}</b>
📞 <b>Phone:</b> <code>${escapeTelegramHtml(order.phone)}</code>
📍 <b>Destination:</b> <b>${escapeTelegramHtml(order.governorate)} — ${escapeTelegramHtml(order.area)}</b>
💰 <b>Total COD:</b> <b>${Number(order.total_amount).toLocaleString()} EGP</b>
${safeReason ? `📝 <b>Reason:</b> <i>${safeReason}</i>\n` : ""}
🛑 <b>Status:</b> Automatically updated to <b>CANCELLED</b> in database.
👉 <a href="https://wa.me/${waPhone}">Chat on WhatsApp</a>
`.trim();

        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: alertHtml,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        });
      } catch (tgErr) {
        console.warn("[Order Cancel] Telegram alert failed:", tgErr);
      }
    }

    return NextResponse.json({
      success: true,
      status: "cancelled",
      orderNumber: order.order_number,
    });
  } catch (error: any) {
    console.error("Order cancellation error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
