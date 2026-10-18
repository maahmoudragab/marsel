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
  const rawPhone = searchParams.get("phone")?.trim();

  if (!rawPhone) {
    return NextResponse.json({ found: false, error: "Phone number is required" }, { status: 400 });
  }

  // Normalize Egyptian phone number
  let cleanPhone = rawPhone.replace(/[^0-9]/g, "");
  if (cleanPhone.startsWith("20") && cleanPhone.length === 12) {
    cleanPhone = cleanPhone.substring(1);
  }

  if (cleanPhone.length < 10) {
    return NextResponse.json({ found: false }, { status: 200 });
  }

  try {
    const supabase = getAdminClient();

    // Query most recent order by phone or secondary_phone (WhatsApp)
    const { data: order, error } = await supabase
      .from("orders")
      .select("customer_name, customer_age, phone, secondary_phone, governorate, area, address")
      .or(`phone.eq.${cleanPhone},secondary_phone.eq.${cleanPhone},phone.eq.2${cleanPhone},phone.eq.+2${cleanPhone}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !order || !order.customer_name) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    return NextResponse.json({
      found: true,
      customer: {
        name: order.customer_name || "",
        age: order.customer_age ? String(order.customer_age) : "",
        phone: order.phone || cleanPhone,
        whatsapp: order.secondary_phone || order.phone || cleanPhone,
        governorate: order.governorate || "Cairo",
        area: order.area || "",
        address: order.address || "",
      },
    });
  } catch (err) {
    console.warn("[CustomerLookup] Error:", err);
    return NextResponse.json({ found: false }, { status: 200 });
  }
}
