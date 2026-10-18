import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const { orderNumber, customerNote } = await request.json();

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

    if (customerNote && typeof customerNote === "string" && customerNote.trim()) {
      const existingNotes = order.notes ? `${order.notes} | ` : "";
      updates.notes = `${existingNotes}Customer note: ${customerNote.trim()}`;
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
        const alertHtml = `
🎉 <b>CUSTOMER CONFIRMED ORDER ONLINE!</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>Order:</b> <code>#${order.order_number}</code>
👤 <b>Customer:</b> <b>${order.customer_name}</b>
📞 <b>Phone:</b> <code>${order.phone}</code>
📍 <b>Destination:</b> <b>${order.governorate} — ${order.area}</b>
💰 <b>Total COD:</b> <b>${Number(order.total_amount).toLocaleString()} EGP</b>
${customerNote ? `📝 <b>Customer Added Note:</b> <i>${customerNote.trim()}</i>\n` : ""}
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
