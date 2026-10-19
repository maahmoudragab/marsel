import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { FACTORY_SESSION_COOKIE, verifyFactorySessionToken } from "@/lib/auth";

function getSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// GET: Fetch production orders (confirmed, processing, out_for_delivery) + product print specs
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(FACTORY_SESSION_COOKIE)?.value;
  const isAuthorized = await verifyFactorySessionToken(token);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabase();

    // 1. Fetch orders in relevant production states with all full details
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select(
        "id, order_number, status, created_at, updated_at, notes, customer_name, customer_age, phone, secondary_phone, governorate, area, address, location_url, total_amount, subtotal_amount, shipping_fee, discount_amount, coupon_code, payment_method"
      )
      .in("status", ["confirmed", "processing", "out_for_delivery", "delivered"])
      .order("created_at", { ascending: false });

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    const orders = ordersData ?? [];
    if (orders.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    // 2. Fetch order items for these orders
    const orderIds = orders.map((o) => o.id);
    const { data: itemsData, error: itemsError } = await supabase
      .from("order_items")
      .select("id, order_id, product_id, title, size, color, quantity, price, unit_price, total_price, image")
      .in("order_id", orderIds);

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // 3. Fetch product specs (print_file_url, color_hex, color_name, images, category, composition, etc.)
    const productIds = Array.from(
      new Set((itemsData ?? []).map((it) => it.product_id).filter(Boolean))
    );

    let productsMap = new Map<
      string,
      {
        print_file_url: string;
        color_hex: string;
        color_name: string;
        images: string[];
        category?: string;
        composition?: string;
        structure?: string;
        fit?: string;
        fit_notes?: string;
        care?: string;
        season?: string;
        collection?: string;
        weight_grams?: number;
      }
    >();
    if (productIds.length > 0) {
      const { data: productsData } = await supabase
        .from("products")
        .select(
          "id, print_file_url, color_hex, color_name, images, image, category, composition, structure, fit, fit_notes, care, season, collection, weight_grams"
        )
        .in("id", productIds);

      for (const prod of productsData ?? []) {
        let imgs: string[] = [];
        if (Array.isArray(prod.images) && prod.images.length > 0) {
          imgs = prod.images.filter(Boolean);
        } else if (prod.image) {
          imgs = [prod.image];
        }

        productsMap.set(prod.id, {
          print_file_url: prod.print_file_url || "",
          color_hex: prod.color_hex || "#111111",
          color_name: prod.color_name || "",
          images: imgs,
          category: prod.category || "",
          composition: prod.composition || "",
          structure: prod.structure || "",
          fit: prod.fit || "",
          fit_notes: prod.fit_notes || "",
          care: prod.care || "",
          season: prod.season || "",
          collection: prod.collection || "",
          weight_grams: prod.weight_grams,
        });
      }
    }

    // 4. Assemble clean enriched orders
    const enrichedOrders = orders.map((order) => {
      const items = (itemsData ?? [])
        .filter((it) => it.order_id === order.id)
        .map((it) => {
          const prodInfo = it.product_id ? productsMap.get(it.product_id) : null;
          const fallbackImages = it.image ? [it.image] : [];
          const allImages =
            prodInfo?.images && prodInfo.images.length > 0
              ? prodInfo.images
              : fallbackImages;

          return {
            ...it,
            print_file_url: prodInfo?.print_file_url || "",
            color_hex: prodInfo?.color_hex || "#111111",
            color: it.color || prodInfo?.color_name || "افتراضي",
            gallery_images: allImages,
            category: prodInfo?.category || "",
            composition: prodInfo?.composition || "",
            structure: prodInfo?.structure || "",
            fit: prodInfo?.fit || "",
            fit_notes: prodInfo?.fit_notes || "",
            care: prodInfo?.care || "",
            season: prodInfo?.season || "",
            collection: prodInfo?.collection || "",
            weight_grams: prodInfo?.weight_grams,
          };
        });

      return {
        ...order,
        items,
      };
    });

    return NextResponse.json({ orders: enrichedOrders });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error loading factory orders";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: Batch or single update status (e.g. move to processing or out_for_delivery)
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(FACTORY_SESSION_COOKIE)?.value;
  const isAuthorized = await verifyFactorySessionToken(token);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderIds, newStatus } = await request.json();

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "orderIds array is required" }, { status: 400 });
    }

    if (!["processing", "out_for_delivery", "delivered", "confirmed"].includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .in("id", orderIds);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // If marked ready (out_for_delivery), optionally send Telegram alert to store owner
    if (newStatus === "out_for_delivery") {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (token && chatId) {
        try {
          const { data: updatedOrders } = await supabase
            .from("orders")
            .select("order_number")
            .in("id", orderIds);

          const orderNumbers = (updatedOrders ?? []).map((o) => `#${o.order_number}`).join(", ");
          const text = `
🏭 <b>إشعار من المصنع: تم الانتهاء من تجهيز القطع!</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>الأوردرات الجاهزة:</b> ${orderNumbers}
✅ <b>الحالة الجديدة:</b> جاهز للتسليم والشحن (Out for Delivery)
🚚 يمكنك الآن إرسال شركة الشحن لاستلام الشحنات من المصنع.
`.trim();

          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text,
              parse_mode: "HTML",
            }),
          });
        } catch (tgErr) {
          console.warn("[Factory] Telegram notify error:", tgErr);
        }
      }
    }

    return NextResponse.json({ success: true, count: orderIds.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating factory orders";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
