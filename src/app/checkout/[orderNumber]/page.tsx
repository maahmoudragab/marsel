import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@supabase/supabase-js";
import CheckoutSuccessClient from "./CheckoutSuccessClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}): Promise<Metadata> {
  const { orderNumber } = await params;
  const cleanNumber = orderNumber.replace(/^#+/, "").trim();
  return {
    title: `ORDER #${cleanNumber}`,
    description: "Official MARSEL Order Confirmation & Story Card",
    robots: {
      index: false,
      follow: false,
    },
  };
}

async function getOrder(orderNumber: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return null;

    const cleanNumber = orderNumber.replace(/^#+/, "").trim();
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Try matching order_number
    let { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_number", cleanNumber)
      .maybeSingle();

    // 2. Fallback: match by UUID id if not found
    if (!order && cleanNumber.length >= 20) {
      const res = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", cleanNumber)
        .maybeSingle();
      order = res.data;
      error = res.error;
    }

    if (error || !order) return null;

    // Fetch compare_at_price and images for items if missing
    const productIds = (order.order_items || []).map((it: any) => it.product_id).filter(Boolean);
    if (productIds.length > 0) {
      const { data: prods } = await supabase
        .from("products")
        .select("id, compare_at_price, image, images")
        .in("id", productIds);
      if (prods) {
        const prodMap = new Map(prods.map((p) => [p.id, p]));
        order.order_items = order.order_items.map((it: any) => {
          const matched = prodMap.get(it.product_id);
          return {
            ...it,
            compare_at_price: matched?.compare_at_price ? Number(matched.compare_at_price) : null,
            image: it.image || matched?.image || matched?.images?.[0] || "/hoodie-cropped.png",
          };
        });
      }
    }

    return order;
  } catch (err) {
    console.error("Error fetching order for success page:", err);
    return null;
  }
}

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f6f5f2] text-black flex flex-col">
      <Header />
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-8">
        <CheckoutSuccessClient order={order} />
      </main>
      <Footer />
    </div>
  );
}
