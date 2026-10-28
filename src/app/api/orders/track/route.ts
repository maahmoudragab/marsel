import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawQuery = searchParams.get("query")?.trim();

  if (!rawQuery) {
    return NextResponse.json({ error: "Order code or phone is required" }, { status: 400 });
  }

  try {
    const supabase = getAdminClient();
    const cleanOrderNumber = rawQuery.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    const cleanPhone = rawQuery.replace(/[^0-9]/g, "");

    const conditions: string[] = [];
    if (cleanOrderNumber.length >= 3) {
      conditions.push(`order_number.eq.${cleanOrderNumber}`);
    }
    if (cleanPhone.length >= 10) {
      conditions.push(`phone.eq.${cleanPhone}`);
      conditions.push(`secondary_phone.eq.${cleanPhone}`);
    }

    if (conditions.length === 0) {
      return NextResponse.json({ error: "Invalid order code or phone" }, { status: 400 });
    }

    // 1. Search by order_number (e.g. MRS-...) or phone number
    let { data: order, error } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, phone, secondary_phone, governorate, area, address, notes, subtotal_amount, shipping_fee, discount_amount, total_amount, payment_method, status, created_at, updated_at")
      .or(conditions.join(","))
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Fetch order items with product compare_at_price
    const { data: items } = await supabase
      .from("order_items")
      .select("id, product_id, title, size, color, quantity, price, image")
      .eq("order_id", order.id);

    const productIds = (items ?? []).map((it) => it.product_id).filter(Boolean);
    const comparePrices: Record<string, number | null> = {};
    if (productIds.length > 0) {
      const { data: prods } = await supabase
        .from("products")
        .select("id, compare_at_price")
        .in("id", productIds);
      if (prods) {
        prods.forEach((p) => {
          comparePrices[p.id] = p.compare_at_price ? Number(p.compare_at_price) : null;
        });
      }
    }

    const formattedItems = (items ?? []).map((it) => ({
      id: it.id,
      title: it.title,
      size: it.size,
      color: it.color,
      quantity: it.quantity,
      price: it.price,
      compare_at_price: it.product_id ? comparePrices[it.product_id] : null,
      image: it.image,
    }));

    return NextResponse.json({
      success: true,
      order: {
        order_number: order.order_number,
        customer_name: order.customer_name,
        phone: order.phone,
        secondary_phone: order.secondary_phone,
        governorate: order.governorate,
        area: order.area,
        address: order.address,
        notes: order.notes,
        subtotal_amount: order.subtotal_amount,
        shipping_fee: order.shipping_fee,
        discount_amount: order.discount_amount,
        total_amount: order.total_amount,
        payment_method: order.payment_method,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items: formattedItems,
      },
    });
  } catch (err) {
    console.error("Order tracking error:", err);
    return NextResponse.json({ error: "Tracking service unavailable" }, { status: 500 });
  }
}