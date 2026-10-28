import { NextRequest, NextResponse } from "next/server";
import { getPrivilegedSupabaseClient } from "@/utils/supabase/adminClient";
import { sendTelegramOrderNotification } from "@/lib/telegram";
import { findZone } from "@/lib/cairoGizaZones";

// IP-based rate limiting to prevent spam order placement (max 10 orders per 10 minutes per IP)
const orderRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const now = Date.now();
    const entry = orderRateLimitMap.get(ip);

    if (entry) {
      if (entry.resetAt > now) {
        if (entry.count >= 10) {
          return NextResponse.json(
            { error: "عدد الطلبات كبير جداً. برجاء المحاولة بعد قليل." },
            { status: 429 }
          );
        }
        entry.count += 1;
      } else {
        orderRateLimitMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
      }
    } else {
      orderRateLimitMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    }

    const body = await request.json();
    const { items, customer, couponCode } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (
      !customer ||
      !customer.name?.trim() ||
      !customer.phone?.trim() ||
      !customer.governorate?.trim() ||
      !customer.area?.trim() ||
      !customer.address?.trim()
    ) {
      return NextResponse.json(
        { error: "بيانات العميل غير مكتملة (الاسم، الهاتف، المحافظة، المنطقة، العنوان مطلوبة)" },
        { status: 400 }
      );
    }

    const supabase = getPrivilegedSupabaseClient();

    // 1. Authoritative Product Prices from Database (Server-side validation)
    const productIds = Array.from(new Set(items.map((it: any) => it.productId).filter(Boolean)));
    const { data: dbProducts, error: prodErr } = await supabase
      .from("products")
      .select("id, title, slug, price, image, is_active")
      .in("id", productIds);

    if (prodErr || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ error: "تعذر التحقق من بيانات المنتجات" }, { status: 400 });
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let calculatedSubtotal = 0;
    const validatedItems: Array<{
      productId: string;
      title: string;
      slug?: string;
      size: string;
      color: string;
      price: number;
      quantity: number;
      total_price: number;
      image: string;
    }> = [];

    for (const item of items) {
      const dbProd = productMap.get(item.productId);
      if (!dbProd || !dbProd.is_active) {
        return NextResponse.json(
          { error: `المنتج غير متاح حالياً` },
          { status: 400 }
        );
      }

      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      const authoritativePrice = Number(dbProd.price);
      calculatedSubtotal += authoritativePrice * quantity;

      validatedItems.push({
        productId: dbProd.id,
        title: dbProd.title,
        slug: dbProd.slug,
        size: String(item.size || "M").trim(),
        color: String(item.color || "").trim(),
        price: authoritativePrice,
        quantity,
        total_price: authoritativePrice * quantity,
        image: item.image || dbProd.image || "/hoodie-cropped.png",
      });
    }

    // 2. Authoritative Shipping Fee from Cairo/Giza Zones Dataset or Database
    let calculatedShippingFee = 60; // Safe fallback
    const matchedZone = findZone(customer.area, customer.governorate);
    if (matchedZone && matchedZone.shippingFee != null) {
      calculatedShippingFee = matchedZone.shippingFee;
    } else {
      const { data: zone } = await supabase
        .from("shipping_zones")
        .select("shipping_fee")
        .eq("governorate", customer.governorate)
        .eq("area", customer.area)
        .eq("is_active", true)
        .maybeSingle();

      if (zone && typeof zone.shipping_fee === "number") {
        calculatedShippingFee = Number(zone.shipping_fee);
      }
    }

    // 3. Active Offers (e.g. Free shipping discounts)
    const totalItemCount = validatedItems.reduce((acc, it) => acc + it.quantity, 0);
    const nowIso = new Date().toISOString();
    const { data: activeOffers } = await supabase
      .from("offers")
      .select("*")
      .eq("is_active", true)
      .lte("starts_at", nowIso)
      .gte("ends_at", nowIso)
      .order("priority", { ascending: false });

    let discountAmount = 0;
    if (activeOffers && activeOffers.length > 0) {
      for (const off of activeOffers) {
        if (
          off.offer_type === "free_shipping_quantity" &&
          off.minimum_quantity &&
          totalItemCount >= off.minimum_quantity
        ) {
          calculatedShippingFee = 0;
          break;
        } else if (
          off.offer_type === "free_shipping_governorate" &&
          off.governorate &&
          off.governorate === customer.governorate
        ) {
          calculatedShippingFee = 0;
          break;
        }
      }
    }

    // 4. Authoritative Coupon Verification
    let appliedCouponCode: string | null = null;
    if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", cleanCode)
        .eq("is_active", true)
        .maybeSingle();

      if (coupon) {
        const isNotExpired = !coupon.expires_at || new Date(coupon.expires_at) > new Date();
        const underMaxUses = !coupon.max_uses || (coupon.used_count || 0) < coupon.max_uses;
        const meetsMinAmount = !coupon.minimum_order_amount || calculatedSubtotal >= Number(coupon.minimum_order_amount);

        if (isNotExpired && underMaxUses && meetsMinAmount) {
          appliedCouponCode = coupon.code;
          if (coupon.discount_type === "percentage") {
            discountAmount = (calculatedSubtotal * Number(coupon.discount_value)) / 100;
          } else {
            discountAmount = Math.min(calculatedSubtotal, Number(coupon.discount_value));
          }

          // Increment coupon used count
          await supabase
            .from("coupons")
            .update({ used_count: (Number(coupon.used_count) || 0) + 1 })
            .eq("id", coupon.id);
        }
      }
    }

    const finalOrderTotal = Math.max(0, calculatedSubtotal - discountAmount + calculatedShippingFee);
    const generatedOrderNumber = `MRS-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    // 5. Insert Order securely into database
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: generatedOrderNumber,
        customer_name: customer.name.trim(),
        customer_age: customer.age ? parseInt(customer.age) : null,
        phone: customer.phone.trim(),
        secondary_phone: customer.whatsapp?.trim() || customer.phone.trim(),
        governorate: customer.governorate.trim(),
        area: customer.area.trim(),
        address: customer.address.trim(),
        notes: customer.notes?.trim() || null,
        location_latitude: customer.location_latitude ?? null,
        location_longitude: customer.location_longitude ?? null,
        location_url: customer.location_url ?? null,
        city_area: customer.city_area ?? null,
        building_apartment: customer.building_apartment ?? null,
        landmark: customer.landmark ?? null,
        subtotal_amount: calculatedSubtotal,
        discount_amount: discountAmount,
        shipping_fee: calculatedShippingFee,
        total_amount: finalOrderTotal,
        coupon_code: appliedCouponCode,
        payment_method: "cash_on_delivery",
        status: "pending",
      })
      .select("id")
      .single();

    if (orderError || !orderData) {
      console.error("[Create Order] DB Insert error:", orderError);
      return NextResponse.json({ error: "فشل في حفظ الطلب في قاعدة البيانات" }, { status: 500 });
    }

    // 6. Insert Order Items
    const orderItemsToInsert = validatedItems.map((it) => ({
      order_id: orderData.id,
      product_id: it.productId,
      title: it.title,
      size: it.size,
      color: it.color,
      price: it.price,
      unit_price: it.price,
      quantity: it.quantity,
      total_price: it.total_price,
      image: it.image,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItemsToInsert);
    if (itemsError) {
      console.error("[Create Order Items] Error:", itemsError);
    }

    // 7. Trigger Telegram Notification immediately from server
    try {
      await sendTelegramOrderNotification({
        order_number: generatedOrderNumber,
        customer_name: customer.name.trim(),
        customer_age: customer.age ? parseInt(customer.age) : null,
        phone: customer.phone.trim(),
        secondary_phone: customer.whatsapp?.trim() || customer.phone.trim(),
        governorate: customer.governorate.trim(),
        area: customer.area.trim(),
        address: customer.address.trim(),
        notes: customer.notes?.trim() || null,
        subtotal_amount: calculatedSubtotal,
        discount_amount: discountAmount,
        shipping_fee: calculatedShippingFee,
        total_amount: finalOrderTotal,
        coupon_code: appliedCouponCode,
        items: validatedItems.map((it) => ({
          product_id: it.productId,
          slug: it.slug,
          title: it.title,
          size: it.size,
          color: it.color,
          quantity: it.quantity,
          price: it.price,
          image: it.image,
        })),
      });
    } catch (notifErr) {
      console.warn("[Create Order] Telegram alert non-blocking error:", notifErr);
    }

    return NextResponse.json({
      success: true,
      orderNumber: generatedOrderNumber,
      totalAmount: finalOrderTotal,
    });
  } catch (error: any) {
    console.error("[Create Order] Server exception:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ غير متوقع أثناء معالجة الطلب" },
      { status: 500 }
    );
  }
}
