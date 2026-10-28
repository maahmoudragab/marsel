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
    const { orderNumber, customerNote, phone } = await request.json();

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
          { error: "التحقق مطلوب: يجب توفير رقم الهاتف المرتبط بالطلب لتأكيده." },
          { status: 403 }
        );
      }
    }

    // 2. If already confirmed or advanced
    if (order.status !== "pending") {
      return NextResponse.json({
        success: true,
        alreadyConfirmed: true,
        status: order.status,
        message: "Order is already confirmed.",
      });
    }

    // 3. Update status to confirmed
    const updates: Record<string, any> = {
      status: "confirmed",
      whatsapp_confirmed: true,
    };

    const cleanNote = customerNote && typeof customerNote === "string" ? customerNote.trim().slice(0, 500) : "";
    if (cleanNote) {
      const existingNotes = order.notes ? `${order.notes} | ` : "";
      updates.notes = `${existingNotes}Customer note: ${cleanNote}`;
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", order.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 4. Send Telegram Alert to store owner
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (token && chatId) {
      try {
        const cleanPhone = (order.secondary_phone || order.phone).replace(/[^0-9]/g, "");
        const waPhone = cleanPhone.startsWith("0") ? `2${cleanPhone}` : cleanPhone;
        const safeNote = escapeTelegramHtml(cleanNote);
        const alertHtml = `
🎉 <b>CUSTOMER CONFIRMED ORDER ONLINE!</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>Order:</b> <code>#${escapeTelegramHtml(order.order_number)}</code>
👤 <b>Customer:</b> <b>${escapeTelegramHtml(order.customer_name)}</b>
📞 <b>Phone:</b> <code>${escapeTelegramHtml(order.phone)}</code>
📍 <b>Destination:</b> <b>${escapeTelegramHtml(order.governorate)} — ${escapeTelegramHtml(order.area)}</b>
💰 <b>Total COD:</b> <b>${Number(order.total_amount).toLocaleString()} EGP</b>
${safeNote ? `📝 <b>Customer Added Note:</b> <i>${safeNote}</i>\n` : ""}
✅ <b>Status:</b> Automatically updated to <b>CONFIRMED</b> in database!
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
        console.warn("[Order Confirm] Telegram alert failed:", tgErr);
      }
    }

    return NextResponse.json({
      success: true,
      alreadyConfirmed: false,
      status: "confirmed",
    });
  } catch (err: any) {
    console.error("[Order Confirm API] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to confirm order" }, { status: 500 });
  }
}
