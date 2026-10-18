// Telegram Bot Instant Order Notifications
// 100% Free & Immediate alerts for store owner with local/remote images, product links & prefilled WhatsApp

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

interface OrderAlertPayload {
  order_number: string;
  customer_name: string;
  customer_age?: number | null;
  phone: string;
  secondary_phone?: string | null;
  governorate: string;
  area: string;
  address: string;
  notes?: string | null;
  subtotal_amount: number;
  discount_amount: number;
  shipping_fee: number;
  total_amount: number;
  coupon_code?: string | null;
  items: Array<{
    product_id?: string;
    slug?: string;
    title: string;
    size: string;
    color?: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
}

interface ResolvedImage {
  blob?: Blob;
  url?: string;
  filename?: string;
}

async function resolveImageToBlobOrUrl(rawImage: string | undefined | null): Promise<ResolvedImage | null> {
  if (!rawImage || typeof rawImage !== "string") return null;
  const clean = rawImage.trim();
  if (!clean) return null;

  // 1. Data URL (Base64)
  if (clean.startsWith("data:")) {
    try {
      const match = clean.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mime = match[1];
        const buffer = Buffer.from(match[2], "base64");
        const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
        return {
          blob: new Blob([buffer], { type: mime }),
          filename: `product.${ext}`,
        };
      }
    } catch (e) {
      console.warn("[Telegram] Base64 image parse error:", e);
    }
    return null;
  }

  // 2. Remote URL (http:// or https://)
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(clean, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const contentType = res.headers.get("content-type") || "image/jpeg";
        const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
        return {
          blob: new Blob([arrayBuf], { type: contentType }),
          filename: `product.${ext}`,
        };
      }
    } catch {
      // Remote fetch failed or timed out, fallback to URL string
    }
    return { url: clean };
  }

  // 3. Local relative path in public directory (e.g. /hoodie-cropped.png or hoodie-cropped.png)
  const relPath = clean.replace(/^\/+/, "");
  const localCandidates = [
    path.join(process.cwd(), "public", relPath),
    path.join(process.cwd(), relPath),
  ];
  for (const candidate of localCandidates) {
    if (fs.existsSync(candidate)) {
      try {
        const buffer = fs.readFileSync(candidate);
        const ext = path.extname(candidate).toLowerCase();
        const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
        return {
          blob: new Blob([buffer], { type: mime }),
          filename: path.basename(candidate),
        };
      } catch (e) {
        console.warn("[Telegram] Local file read error:", e);
      }
    }
  }

  return null;
}

async function enrichOrderItems(items: OrderAlertPayload["items"]): Promise<OrderAlertPayload["items"]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return items;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const titles = items.map((it) => it.title);
    const { data: dbProducts } = await supabase
      .from("products")
      .select("id, title, slug, image, images")
      .in("title", titles);

    if (dbProducts && dbProducts.length > 0) {
      return items.map((it) => {
        const matched = dbProducts.find(
          (p) =>
            (it.product_id && p.id === it.product_id) ||
            p.title.toLowerCase() === it.title.toLowerCase()
        );
        const resolvedImg = it.image || matched?.images?.[0] || matched?.image;
        const resolvedSlug = it.slug || matched?.slug;
        const resolvedProductId = it.product_id || matched?.id;
        return {
          ...it,
          image: resolvedImg,
          slug: resolvedSlug,
          product_id: resolvedProductId,
        };
      });
    }
  } catch (err) {
    console.warn("[Telegram] Could not enrich items from Supabase:", err);
  }

  return items;
}

async function sendTextMessage(
  token: string,
  chatId: string,
  text: string,
  replyMarkup?: any
): Promise<boolean> {
  try {
    const payload: Record<string, any> = {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.error("[Telegram] sendMessage network error:", err);
    return false;
  }
}

export async function sendTelegramOrderNotification(order: OrderAlertPayload): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log(
      "[Telegram] Order alert skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured in .env.local"
    );
    return false;
  }

  try {
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://marsel.studio").replace(/\/+$/, "");

    // 1. Enrich items from Supabase (slug, id, images)
    const enrichedItems = await enrichOrderItems(order.items);

    // 2. Format Items list with product links
    const itemsText = enrichedItems
      .map((it) => {
        const productSlugOrId = it.slug || it.product_id;
        const productUrl = productSlugOrId ? `${siteUrl}/products/${productSlugOrId}` : null;
        return [
          `• <b>${it.title}</b> (Size: <code>${it.size}</code>${it.color ? `, Color: ${it.color}` : ""}) x${it.quantity} — <b>${(it.price * it.quantity).toLocaleString()} EGP</b>`,
          productUrl ? `  🔗 <a href="${productUrl}"><b>View piece:</b> ${productUrl}</a>` : "",
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");

    // 3. Prepare Pre-filled WhatsApp confirmation message (Safe from URL # hash truncation)
    const cleanPhone = (order.secondary_phone || order.phone).replace(/[^0-9]/g, "");
    const waPhone = cleanPhone.startsWith("0") ? `2${cleanPhone}` : cleanPhone.startsWith("20") ? cleanPhone : `2${cleanPhone}`;

    const safeOrderNum = String(order.order_number || "").replace(/^#+/, "").trim();
    const safeCustomer = String(order.customer_name || "").replace(/[#&]/g, "").trim();
    const safeAddress = String(order.address || "").replace(/[#&]/g, " ").trim();
    const safeArea = String(order.area || "").replace(/[#&]/g, " ").trim();
    const safeGov = String(order.governorate || "").replace(/[#&]/g, " ").trim();
    const safeNotes = order.notes ? String(order.notes).replace(/[#&]/g, " ").trim() : "";

    const waItemsList = enrichedItems
      .map(
        (it) =>
          `- ${it.title.replace(/[#&]/g, "")} (Size: ${it.size}${it.color ? `, Color: ${it.color}` : ""}) x${it.quantity}`
      )
      .join("\n");

    const confirmUrl = `${siteUrl}/confirm-order/${safeOrderNum}`;
    const trackUrl = `${siteUrl}/track?order=${safeOrderNum}`;

    const waMessageText = `Hello ${safeCustomer}!
This is MARSEL STORE confirming your order #${safeOrderNum}.

Ordered Pieces:
${waItemsList}
Total to Pay: ${order.total_amount.toLocaleString()} EGP (Cash on Delivery)

Delivery Address:
${safeGov} - ${safeArea}
${safeAddress}${safeNotes ? `\nNotes: ${safeNotes}` : ""}

Order Confirmation Link:
${confirmUrl}`.trim();

    const waUrl = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(waMessageText)}`;

    // Exactly 2 control buttons: WhatsApp customer & Track order (in English)
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "💬 WhatsApp Customer (Confirm Order)", url: waUrl },
        ],
        [
          { text: "📍 Track Order Page", url: trackUrl },
        ],
      ],
    };

    // 4. Telegram Notification HTML (Single comprehensive message containing all details)
    const messageHtml = `
⚡ <b>NEW MARSEL DROP ORDER!</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>Order:</b> <code>#${order.order_number}</code>
👤 <b>Customer:</b> <b>${order.customer_name}</b> ${order.customer_age ? `(${order.customer_age} yrs)` : ""}
📞 <b>Phone:</b> <code>${order.phone}</code>
💬 <b>WhatsApp:</b> <code>${order.secondary_phone || order.phone}</code>
📍 <b>Destination:</b> <b>${order.governorate} — ${order.area}</b>
🏠 <b>Address:</b> ${order.address}
${order.notes ? `📝 <b>Notes:</b> <i>${order.notes}</i>\n` : ""}${order.coupon_code ? `🏷️ <b>Coupon:</b> <code>${order.coupon_code}</code>\n` : ""}
━━━━━━━━━━━━━━━━━━━━
👕 <b>Ordered Pieces:</b>
${itemsText}

━━━━━━━━━━━━━━━━━━━━
💵 <b>Subtotal:</b> ${order.subtotal_amount.toLocaleString()} EGP
🚚 <b>Delivery:</b> ${order.shipping_fee === 0 ? "FREE" : `${order.shipping_fee} EGP`}
${order.discount_amount > 0 ? `🏷️ <b>Discount:</b> -${order.discount_amount.toLocaleString()} EGP\n` : ""}💰 <b>TOTAL (Cash on Delivery):</b> <b>${order.total_amount.toLocaleString()} EGP</b>
`.trim();

    // 5. Send strictly ONE single message with all details and the 2 control buttons
    const firstImage = enrichedItems.find((it) => it.image && typeof it.image === "string" && it.image.trim())?.image;
    const firstImageUrl = firstImage
      ? firstImage.startsWith("http")
        ? firstImage
        : `${siteUrl}${firstImage.startsWith("/") ? "" : "/"}${firstImage}`
      : null;

    const previewPrefix = firstImageUrl ? `<a href="${firstImageUrl}">&#8205;</a>` : "";
    const fullMessageHtml = `${previewPrefix}${messageHtml}`.trim();

    return await sendTextMessage(token, chatId, fullMessageHtml, inlineKeyboard);
  } catch (err) {
    console.error("[Telegram] Notification network error:", err);
    return false;
  }
}