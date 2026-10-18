// MARSEL STORE — Local Telegram Bot Polling Service
// Run: npm run bot (or node --env-file=.env.local scripts/telegram-bot-poll.mjs)

import { createClient } from "@supabase/supabase-js";

const token = process.env.TELEGRAM_BOT_TOKEN;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!token || !supabaseUrl || !supabaseKey) {
  console.error("❌ Missing TELEGRAM_BOT_TOKEN or NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("⚡ MARSEL Telegram Bot Listener is active...");
console.log("📡 Listening for commands: stats, pending, out, orders, order numbers, phone numbers...");

let offset = 0;

async function sendTelegramMessage(chatId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (e) {
    console.error("Failed to send reply:", e.message);
  }
}

function createWhatsAppConfirmationUrl(ord) {
  const cleanPhone = (ord.secondary_phone || ord.phone || "").replace(/[^0-9]/g, "");
  const waPhone = cleanPhone.startsWith("0") ? `2${cleanPhone}` : cleanPhone.startsWith("20") ? cleanPhone : `2${cleanPhone}`;
  const safeOrderNum = String(ord.order_number || "").replace(/^#+/, "").trim();
  const safeCustomer = String(ord.customer_name || "").replace(/[#&]/g, "").trim();
  const safeAddress = String(ord.address || "").replace(/[#&]/g, " ").trim();
  const safeArea = String(ord.area || "").replace(/[#&]/g, " ").trim();
  const safeGov = String(ord.governorate || "").replace(/[#&]/g, " ").trim();
  const safeNotes = ord.notes ? String(ord.notes).replace(/[#&]/g, " ").trim() : "";

  const itemsList = (ord.order_items || [])
    .map((it) => `• ${String(it.title || "").replace(/[#&]/g, "")} (Size: ${it.size}${it.color ? `, Color: ${it.color}` : ""}) x${it.quantity}`)
    .join("\n");

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://marsel.studio").replace(/\/+$/, "");
  const confirmUrl = `${siteUrl}/confirm-order/${safeOrderNum}`;

  const waText = `Hello ${safeCustomer}!

This is MARSEL STORE confirming your recent order.

Order: ${safeOrderNum}
Pieces:
${itemsList}

Total on Delivery: ${Number(ord.total_amount).toLocaleString()} EGP (Cash on Delivery)
Delivery Address: ${safeGov} — ${safeArea}
Address Details: ${safeAddress}${safeNotes ? `\nNotes: ${safeNotes}` : ""}

1-Click Order Confirmation:
${confirmUrl}

Please confirm your delivery address via the link above so we can dispatch your pieces right away.
Thank you for choosing MARSEL STORE.`.trim();

  return `https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}`;
}

async function handleMessage(chatId, text) {
  const cleanText = (text || "").trim();
  const lowerText = cleanText.toLowerCase();

  // 1. STATS
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
      await sendTelegramMessage(chatId, `❌ Error retrieving store analytics: ${error?.message}`);
      return;
    }

    const totalOrders = allOrders.length;
    const validOrders = allOrders.filter((o) => o.status !== "cancelled");
    const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayOrders = validOrders.filter((o) => new Date(o.created_at) >= todayStart);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    const pendingOrders = allOrders.filter((o) => o.status === "pending").length;
    const outForDelivery = allOrders.filter((o) => o.status === "out_for_delivery").length;
    const delivered = allOrders.filter((o) => o.status === "delivered").length;

    const productCounts = {};
    validOrders.forEach((o) => {
      o.order_items?.forEach((it) => {
        productCounts[it.title] = (productCounts[it.title] || 0) + (it.quantity || 1);
      });
    });
    const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];

    const reply = `
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

    await sendTelegramMessage(chatId, reply);
    return;
  }

  // 2. PENDING ORDERS
  if (lowerText === "pending" || lowerText === "/pending") {
    const { data: pendingList, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      await sendTelegramMessage(chatId, `❌ Error: ${error.message}`);
      return;
    }
    if (!pendingList || pendingList.length === 0) {
      await sendTelegramMessage(chatId, `✨ <b>No pending orders!</b> All orders are confirmed or in transit.`);
      return;
    }

    const rows = pendingList
      .map((ord, i) => {
        const items = (ord.order_items || [])
          .map((it) => `${it.title} (${it.size}) x${it.quantity}`)
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

    const reply = `
⏳ <b>Pending Orders Awaiting Confirmation (${pendingList.length}):</b>
━━━━━━━━━━━━━━━━━━━━
${rows}
`.trim();

    await sendTelegramMessage(chatId, reply);
    return;
  }

  // 3. OUT FOR DELIVERY
  if (lowerText === "out" || lowerText === "/out") {
    const { data: outList, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("status", "out_for_delivery")
      .order("created_at", { ascending: false });

    if (error) {
      await sendTelegramMessage(chatId, `❌ Error: ${error.message}`);
      return;
    }
    if (!outList || outList.length === 0) {
      await sendTelegramMessage(chatId, `🚚 <b>No active shipments with couriers right now.</b>`);
      return;
    }

    const rows = outList
      .map(
        (ord, i) =>
          `#${i + 1} <code>#${ord.order_number}</code> — <b>${ord.customer_name}</b> (${ord.phone})\n📍 ${ord.governorate} — ${ord.area}\n💰 Collect upon Delivery: <b>${Number(ord.total_amount).toLocaleString()} EGP</b>`
      )
      .join("\n\n");

    const reply = `
🚚 <b>Active Shipments with Couriers (${outList.length}):</b>
━━━━━━━━━━━━━━━━━━━━
${rows}
`.trim();

    await sendTelegramMessage(chatId, reply);
    return;
  }

  // 4. RECENT ORDERS
  if (lowerText === "orders" || lowerText === "/orders") {
    const { data: recentList, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error || !recentList || recentList.length === 0) {
      await sendTelegramMessage(chatId, `📦 No orders recorded yet.`);
      return;
    }

    const rows = recentList
      .map(
        (ord, i) =>
          `#${i + 1} <code>#${ord.order_number}</code> — <b>${ord.customer_name}</b>\n📊 Status: <b>${ord.status.toUpperCase()}</b> | Amount: ${Number(ord.total_amount).toLocaleString()} EGP`
      )
      .join("\n\n");

    const reply = `
📦 <b>Latest 5 Store Orders:</b>
━━━━━━━━━━━━━━━━━━━━
${rows}
`.trim();

    await sendTelegramMessage(chatId, reply);
    return;
  }

  // 5. PHONE NUMBER SEARCH
  if (
    /^(01[0125]\d{8}|\+?201[0125]\d{8})$/.test(cleanText.replace(/[\s-]/g, "")) ||
    (cleanText.length >= 10 && cleanText.length <= 14 && /^\d+$/.test(cleanText))
  ) {
    const searchPhone = cleanText.replace(/[^\d]/g, "").slice(-10);
    const { data: matchedOrders, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .or(`phone.ilike.%${searchPhone}%,secondary_phone.ilike.%${searchPhone}%`)
      .order("created_at", { ascending: false });

    if (error) {
      await sendTelegramMessage(chatId, `❌ Search error: ${error.message}`);
      return;
    }
    if (!matchedOrders || matchedOrders.length === 0) {
      await sendTelegramMessage(chatId, `🔍 <b>No customer orders found for phone:</b> <code>${cleanText}</code>`);
      return;
    }

    const firstOrder = matchedOrders[0];
    const statusMap = {
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
          .map((it) => `  - ${it.title} (Size: ${it.size}) x${it.quantity}`)
          .join("\n");
        return `
#${idx + 1} <b>Order:</b> <code>#${ord.order_number}</code>
<b>Date:</b> ${new Date(ord.created_at).toLocaleDateString("en-GB")}
<b>Status:</b> ${statusMap[ord.status] || ord.status}
<b>Total:</b> <b>${Number(ord.total_amount).toLocaleString()} EGP</b>
<b>Pieces:</b>
${items || "  - No items"}
`.trim();
      })
      .join("\n\n───────────────\n\n");

    const reply = `
👤 <b>Customer Order Profile:</b> <b>${firstOrder.customer_name}</b>
📞 <b>Phone:</b> <code>${firstOrder.phone}</code>
📍 <b>Destination:</b> ${firstOrder.governorate} — ${firstOrder.area}
📦 <b>Total Orders:</b> ${matchedOrders.length}
───────────────
${ordersSummary}
`.trim();

    await sendTelegramMessage(chatId, reply);
    return;
  }

  // 6. ORDER NUMBER SEARCH
  if (
    cleanText.toUpperCase().startsWith("MRS-") ||
    cleanText.startsWith("#") ||
    /^\d{2,6}$/.test(cleanText) ||
    lowerText.startsWith("order ")
  ) {
    const orderQuery = cleanText.replace(/^[#\s]|order\s+/gi, "").trim();
    const { data: matchedOrder, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .or(`order_number.ilike.%${orderQuery}%`)
      .maybeSingle();

    if (error) {
      await sendTelegramMessage(chatId, `❌ Search error: ${error.message}`);
      return;
    }
    if (!matchedOrder) {
      await sendTelegramMessage(chatId, `🔍 <b>No order found matching:</b> <code>${orderQuery}</code>`);
      return;
    }

    const waUrl = createWhatsAppConfirmationUrl(matchedOrder);

    const items = (matchedOrder.order_items || [])
      .map((it) => `• <b>${it.title}</b> (${it.size}) x${it.quantity} — ${(it.price * it.quantity).toLocaleString()} EGP`)
      .join("\n");

    const reply = `
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

    await sendTelegramMessage(chatId, reply);
    return;
  }

  // 7. DEFAULT HELP
  const reply = `
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

  await sendTelegramMessage(chatId, reply);
}

async function answerCallbackQuery(queryId, text, showAlert = false) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: queryId,
        text,
        show_alert: showAlert,
      }),
    });
  } catch (err) {
    console.error("answerCallbackQuery error:", err.message);
  }
}

async function handleCallbackQuery(cb) {
  const queryId = cb.id;
  const data = cb.data || "";
  const chatId = cb.message?.chat?.id;

  console.log(`🔘 [${new Date().toLocaleTimeString()}] Callback from ${cb.from?.first_name || "Admin"}: "${data}"`);

  if (data.startsWith("confirm:")) {
    const orderNum = data.replace("confirm:", "").trim();
    const { data: updated, error } = await supabase
      .from("orders")
      .update({ status: "confirmed", whatsapp_confirmed: true })
      .eq("order_number", orderNum)
      .select("customer_name, total_amount, governorate, area")
      .maybeSingle();

    if (error || !updated) {
      await answerCallbackQuery(queryId, `❌ Error: ${error?.message || "Order not found"}`, true);
      return;
    }

    await answerCallbackQuery(queryId, `✅ Order #${orderNum} confirmed successfully!`, false);
    await sendTelegramMessage(
      chatId,
      `✅ <b>Order #${orderNum} Confirmed via Telegram!</b>\n━━━━━━━━━━━━━━━━━━━━\n👤 Customer: <b>${updated.customer_name}</b>\n📍 Destination: ${updated.governorate} — ${updated.area}\n💰 Amount: <b>${Number(updated.total_amount).toLocaleString()} EGP</b>\n🚀 Status set to (CONFIRMED). Ready for packing & fulfillment!`
    );
  } else if (data.startsWith("courier:")) {
    const orderNum = data.replace("courier:", "").trim();
    const { data: updated, error } = await supabase
      .from("orders")
      .update({ status: "out_for_delivery" })
      .eq("order_number", orderNum)
      .select("customer_name, total_amount, phone")
      .maybeSingle();

    if (error || !updated) {
      await answerCallbackQuery(queryId, `❌ Error: ${error?.message || "Order not found"}`, true);
      return;
    }

    await answerCallbackQuery(queryId, `🚚 Order #${orderNum} handed to courier!`, false);
    await sendTelegramMessage(
      chatId,
      `🚚 <b>Order #${orderNum} Transferred to (OUT FOR DELIVERY)!</b>\n━━━━━━━━━━━━━━━━━━━━\n👤 Customer: <b>${updated.customer_name}</b> (<code>${updated.phone}</code>)\n💰 Collect upon Delivery: <b>${Number(updated.total_amount).toLocaleString()} EGP</b>\n📦 Parcel is out with the courier for delivery today.`
    );
  }
}

async function poll() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=25`);
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.result?.length) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          if (update.message?.text && update.message?.chat?.id) {
            console.log(`📩 [${new Date().toLocaleTimeString()}] From ${update.message.from?.first_name || "User"}: "${update.message.text}"`);
            await handleMessage(update.message.chat.id, update.message.text);
          }
          if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
          }
        }
      }
    }
  } catch (err) {
    console.error("Polling network notice:", err.message);
  }

  setTimeout(poll, 1200);
}

poll();
