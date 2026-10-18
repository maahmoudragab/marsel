import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function createWhatsAppConfirmationUrl(ord: any) {
  const cleanPhone = (ord.secondary_phone || ord.phone || "").replace(/[^0-9]/g, "");
  const waPhone = cleanPhone.startsWith("0") ? `2${cleanPhone}` : cleanPhone.startsWith("20") ? cleanPhone : `2${cleanPhone}`;
  const safeOrderNum = String(ord.order_number || "").replace(/^#+/, "").trim();
  const safeCustomer = String(ord.customer_name || "").replace(/[#&]/g, "").trim();
  const safeAddress = String(ord.address || "").replace(/[#&]/g, " ").trim();
  const safeArea = String(ord.area || "").replace(/[#&]/g, " ").trim();
  const safeGov = String(ord.governorate || "").replace(/[#&]/g, " ").trim();
  const safeNotes = ord.notes ? String(ord.notes).replace(/[#&]/g, " ").trim() : "";

  const itemsList = (ord.order_items || [])
    .map((it: any) => `- ${String(it.title || "").replace(/[#&]/g, "")} (Size: ${it.size}${it.color ? `, Color: ${it.color}` : ""}) x${it.quantity}`)
    .join("\n");

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://marsel.studio").replace(/\/+$/, "");
  const confirmUrl = `${siteUrl}/confirm-order/${safeOrderNum}`;

  const waText = `Hello ${safeCustomer}!
This is MARSEL STORE confirming your order #${safeOrderNum}.

Ordered Pieces:
${itemsList}
Total to Pay: ${Number(ord.total_amount).toLocaleString()} EGP (Cash on Delivery)

Delivery Address:
${safeGov} - ${safeArea}
${safeAddress}${safeNotes ? `\nNotes: ${safeNotes}` : ""}

Order Confirmation Link:
${confirmUrl}`.trim();

  return `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(waText)}`;
}

export async function processTelegramMessage(chatId: string | number, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("[TelegramBot] Token missing");
    return false;
  }

  const cleanText = (text || "").trim();
  const lowerText = cleanText.toLowerCase();
  const supabase = getSupabase();

  let replyHtml = "";

  try {
    // 1. STATS COMMAND
    if (
      lowerText === "stats" ||
      lowerText === "/stats" ||
      lowerText === "orders stats"
    ) {
      const { data: allOrders, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (error || !allOrders) {
        replyHtml = `❌ Error retrieving store analytics: ${error?.message}`;
      } else {
        const totalOrders = allOrders.length;
        const validOrders = allOrders.filter((o) => o.status !== "cancelled");
        const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

        // Today's orders
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayOrders = validOrders.filter((o) => new Date(o.created_at) >= todayStart);
        const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

        const pendingOrders = allOrders.filter((o) => o.status === "pending").length;
        const outForDelivery = allOrders.filter((o) => o.status === "out_for_delivery").length;
        const delivered = allOrders.filter((o) => o.status === "delivered").length;

        // Top selling piece
        const productCounts: { [title: string]: number } = {};
        validOrders.forEach((o) => {
          o.order_items?.forEach((it: { title: string; quantity: number }) => {
            productCounts[it.title] = (productCounts[it.title] || 0) + (it.quantity || 1);
          });
        });
        const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];

        replyHtml = `
⚡ <b>MARSEL STORE — COMMERCIAL INTELLIGENCE</b>
━━━━━━━━━━━━━━━━━━━━
💰 <b>Total Cumulative Revenue:</b> <b>${totalRevenue.toLocaleString()} EGP</b>
📦 <b>Total Orders:</b> ${totalOrders} drops
━━━━━━━━━━━━━━━━━━━━
🔥 <b>Today's Activity:</b>
• Orders Placed Today: <b>${todayOrders.length}</b>
• Revenue Today: <b>${todayRevenue.toLocaleString()} EGP</b>
━━━━━━━━━━━━━━━━━━━━
📊 <b>Pipeline Status:</b>
• Pending Confirmation: <b>${pendingOrders}</b>
• Out for Delivery: <b>${outForDelivery}</b>
• Delivered & Settled: <b>${delivered}</b>
${topProduct ? `\n👑 <b>Top Selling Piece:</b> ${topProduct[0]} (${topProduct[1]} units)` : ""}
`.trim();
      }
    }

    // 1.1 PENDING ORDERS COMMAND
    else if (lowerText === "pending" || lowerText === "/pending") {
      const { data: pendingList, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        replyHtml = `❌ Error: ${error.message}`;
      } else if (!pendingList || pendingList.length === 0) {
        replyHtml = `✨ <b>No pending orders!</b> All orders are confirmed or in transit.`;
      } else {
        const rows = pendingList
          .map((ord, i) => {
            const items = (ord.order_items || [])
              .map((it: { title: string; size: string; quantity: number }) => `${it.title} (${it.size}) x${it.quantity}`)
              .join(", ");
            const waUrl = createWhatsAppConfirmationUrl(ord);
            return `
#${i + 1} <code>#${ord.order_number}</code> — <b>${ord.customer_name}</b>
📍 ${ord.governorate} — ${ord.area}
💰 ${Number(ord.total_amount).toLocaleString()} EGP
👕 ${items || "No items"}
👉 <a href="${waUrl}">WhatsApp Customer (Pre-filled)</a>
`.trim();
          })
          .join("\n\n───────────────\n\n");

        replyHtml = `
⏳ <b>Pending Orders Awaiting Confirmation (${pendingList.length}):</b>
━━━━━━━━━━━━━━━━━━━━
${rows}
`.trim();
      }
    }

    // 1.2 OUT FOR DELIVERY COMMAND
    else if (
      lowerText === "out" ||
      lowerText === "/out"
    ) {
      const { data: outList, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("status", "out_for_delivery")
        .order("created_at", { ascending: false });

      if (error) {
        replyHtml = `❌ Error: ${error.message}`;
      } else if (!outList || outList.length === 0) {
        replyHtml = `🚚 <b>No active shipments with couriers right now.</b>`;
      } else {
        const rows = outList
          .map(
            (ord, i) =>
              `#${i + 1} <code>#${ord.order_number}</code> — <b>${ord.customer_name}</b> (${ord.phone})\n📍 ${ord.governorate} — ${ord.area}\n💰 Collect upon Delivery: <b>${Number(ord.total_amount).toLocaleString()} EGP</b>`
          )
          .join("\n\n");

        replyHtml = `
🚚 <b>Active Shipments with Couriers (${outList.length}):</b>
━━━━━━━━━━━━━━━━━━━━
${rows}
`.trim();
      }
    }

    // 1.3 RECENT ORDERS LIST
    else if (lowerText === "orders" || lowerText === "/orders") {
      const { data: recentList, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error || !recentList || recentList.length === 0) {
        replyHtml = `📦 No orders recorded yet.`;
      } else {
        const rows = recentList
          .map(
            (ord, i) =>
              `#${i + 1} <code>#${ord.order_number}</code> — <b>${ord.customer_name}</b>\n📊 Status: <b>${ord.status.toUpperCase()}</b> | Amount: ${Number(ord.total_amount).toLocaleString()} EGP`
          )
          .join("\n\n");

        replyHtml = `
📦 <b>Latest 5 Store Orders:</b>
━━━━━━━━━━━━━━━━━━━━
${rows}
`.trim();
      }
    }

    // 2. SEARCH BY PHONE NUMBER
    else if (
      /^(01[0125]\d{8}|\+?201[0125]\d{8})$/.test(cleanText.replace(/[\s-]/g, "")) ||
      (cleanText.length >= 10 && cleanText.length <= 14 && /^\d+$/.test(cleanText))
    ) {
      const searchPhone = cleanText.replace(/[^\d]/g, "").slice(-10); // match last 10 digits
      const { data: matchedOrders, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .or(`phone.ilike.%${searchPhone}%,secondary_phone.ilike.%${searchPhone}%`)
        .order("created_at", { ascending: false });

      if (error) {
        replyHtml = `❌ Search error: ${error.message}`;
      } else if (!matchedOrders || matchedOrders.length === 0) {
        replyHtml = `🔍 <b>No customer orders found for phone:</b> <code>${cleanText}</code>`;
      } else {
        const firstOrder = matchedOrders[0];
        const statusTranslations: { [k: string]: string } = {
          pending: "⏳ Pending Confirmation",
          confirmed: "✅ Confirmed",
          processing: "⚙️ Preparing",
          out_for_delivery: "🚚 Out for Delivery",
          delivered: "🎉 Delivered",
          cancelled: "❌ Cancelled",
        };

        const ordersSummary = matchedOrders
          .map((ord, idx) => {
            const items = (ord.order_items || [])
              .map(
                (it: { title: string; size: string; quantity: number }) =>
                  `  - ${it.title} (Size: ${it.size}) x${it.quantity}`
              )
              .join("\n");
            return `
#${idx + 1} <b>Order:</b> <code>#${ord.order_number}</code>
<b>Date:</b> ${new Date(ord.created_at).toLocaleDateString("en-GB")}
<b>Status:</b> ${statusTranslations[ord.status] || ord.status}
<b>Total:</b> <b>${Number(ord.total_amount).toLocaleString()} EGP</b>
<b>Pieces:</b>
${items || "  - No items"}
`.trim();
          })
          .join("\n\n───────────────\n\n");

        replyHtml = `
👤 <b>Customer Order Profile:</b> <b>${firstOrder.customer_name}</b>
📞 <b>Phone:</b> <code>${firstOrder.phone}</code>
📍 <b>Destination:</b> ${firstOrder.governorate} — ${firstOrder.area}
📦 <b>Total Orders:</b> ${matchedOrders.length}
───────────────
${ordersSummary}
`.trim();
      }
    }

    // 3. SEARCH BY ORDER NUMBER
    else if (
      cleanText.toUpperCase().startsWith("MRS-") ||
      cleanText.startsWith("#") ||
      /^\d{2,6}$/.test(cleanText) ||
      lowerText.startsWith("order ")
    ) {
      const orderQuery = cleanText.replace(/^[#\s]|order\s+/gi, "").trim();
      const { data: matchedOrder, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .or(`order_number.ilike.%${orderQuery}%,id.eq.${orderQuery.length === 36 ? orderQuery : "00000000-0000-0000-0000-000000000000"}`)
        .maybeSingle();

      if (error) {
        replyHtml = `❌ Search error: ${error.message}`;
      } else if (!matchedOrder) {
        replyHtml = `🔍 <b>No order found matching:</b> <code>${orderQuery}</code>`;
      } else {
        const waUrl = createWhatsAppConfirmationUrl(matchedOrder);

        const items = (matchedOrder.order_items || [])
          .map(
            (it: { title: string; size: string; quantity: number; price: number }) =>
              `• <b>${it.title}</b> (${it.size}) x${it.quantity} — ${(it.price * it.quantity).toLocaleString()} EGP`
          )
          .join("\n");

        replyHtml = `
📦 <b>Order Reference:</b> <code>#${matchedOrder.order_number}</code>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Customer:</b> ${matchedOrder.customer_name}
📞 <b>Phone:</b> <code>${matchedOrder.phone}</code>
📍 <b>Destination:</b> ${matchedOrder.governorate} — ${matchedOrder.area}
🏠 <b>Address:</b> ${matchedOrder.address}
📊 <b>Status:</b> <b>${matchedOrder.status.toUpperCase()}</b>
💰 <b>Total Due on Delivery:</b> <b>${Number(matchedOrder.total_amount).toLocaleString()} EGP</b>

👕 <b>Pieces:</b>
${items || "• No items"}

👉 <a href="${waUrl}"><b>Chat on WhatsApp (Pre-filled)</b></a>
`.trim();
      }
    }

    // 4. DEFAULT HELP / GREETING
    else {
      replyHtml = `
🤖 <b>Welcome to MARSEL STORE Bot</b>
━━━━━━━━━━━━━━━━━━━━
You can send any of the following commands:

📊 <b>stats</b> — View today's sales & store revenue.
⏳ <b>pending</b> — View orders awaiting customer confirmation.
🚚 <b>out</b> — View parcels currently out for courier delivery.
📦 <b>orders</b> — View latest 5 store orders.
🔢 <b>Order Code</b> (e.g. <code>MRS-XYZ</code> or <code>1001</code>) — View order details.
📱 <b>Mobile Number</b> (e.g. <code>01012345678</code>) — View customer purchase history.
`.trim();
    }

    // Send reply via Telegram sendMessage
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyHtml,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    return res.ok;
  } catch (err) {
    console.error("[TelegramBot] Error processing message:", err);
    return false;
  }
}

export async function processTelegramCallback(cb: any): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

  const queryId = cb?.id;
  const data = cb?.data || "";
  const chatId = cb?.message?.chat?.id;
  const supabase = getSupabase();

  const answerCallback = async (text: string, showAlert = false) => {
    try {
      await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: queryId, text, show_alert: showAlert }),
      });
    } catch (e) {
      console.warn("answerCallbackQuery failed:", e);
    }
  };

  const sendMsg = async (text: string) => {
    if (!chatId) return;
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      });
    } catch (e) {
      console.warn("sendMsg failed:", e);
    }
  };

  try {
    if (data.startsWith("confirm:")) {
      const orderNum = data.replace("confirm:", "").trim();
      const { data: updated, error } = await supabase
        .from("orders")
        .update({ status: "confirmed", whatsapp_confirmed: true })
        .eq("order_number", orderNum)
        .select("customer_name, total_amount, governorate, area")
        .maybeSingle();

      if (error || !updated) {
        await answerCallback(`❌ Error: ${error?.message || "Order not found"}`, true);
        return false;
      }

      await answerCallback(`✅ Order #${orderNum} confirmed successfully!`, false);
      await sendMsg(
        `✅ <b>Order #${orderNum} Confirmed via Telegram!</b>\n━━━━━━━━━━━━━━━━━━━━\n👤 Customer: <b>${updated.customer_name}</b>\n📍 Destination: ${updated.governorate} — ${updated.area}\n💰 Amount: <b>${Number(updated.total_amount).toLocaleString()} EGP</b>\n🚀 Status set to (CONFIRMED). Ready for packing & fulfillment!`
      );
      return true;
    } else if (data.startsWith("courier:")) {
      const orderNum = data.replace("courier:", "").trim();
      const { data: updated, error } = await supabase
        .from("orders")
        .update({ status: "out_for_delivery" })
        .eq("order_number", orderNum)
        .select("customer_name, total_amount, phone")
        .maybeSingle();

      if (error || !updated) {
        await answerCallback(`❌ Error: ${error?.message || "Order not found"}`, true);
        return false;
      }

      await answerCallback(`🚚 Order #${orderNum} handed to courier!`, false);
      await sendMsg(
        `🚚 <b>Order #${orderNum} Transferred to (OUT FOR DELIVERY)!</b>\n━━━━━━━━━━━━━━━━━━━━\n👤 Customer: <b>${updated.customer_name}</b> (<code>${updated.phone}</code>)\n💰 Collect upon Delivery: <b>${Number(updated.total_amount).toLocaleString()} EGP</b>\n📦 Parcel is out with the courier for delivery today.`
      );
      return true;
    }
  } catch (err) {
    console.error("[TelegramCallback] Error:", err);
  }

  return false;
}
