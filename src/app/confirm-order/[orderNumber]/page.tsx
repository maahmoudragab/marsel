import React from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@supabase/supabase-js";
import ConfirmOrderClient from "./ConfirmOrderClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}): Promise<Metadata> {
  const { orderNumber } = await params;
  const cleanNumber = orderNumber.replace(/^#+/, "").trim();
  return {
    title: `Confirm Order ${cleanNumber} | MARSEL STORE`,
    description: "Review order details and confirm delivery at MARSEL STORE.",
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

    const { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_number", cleanNumber)
      .maybeSingle();

    if (error || !order) return null;

    // Fetch compare_at_price for items from products table
    const productIds = (order.order_items || []).map((it: any) => it.product_id).filter(Boolean);
    if (productIds.length > 0) {
      const { data: prods } = await supabase
        .from("products")
        .select("id, compare_at_price")
        .in("id", productIds);
      if (prods) {
        const priceMap = new Map(prods.map((p) => [p.id, p.compare_at_price ? Number(p.compare_at_price) : null]));
        order.order_items = order.order_items.map((it: any) => ({
          ...it,
          compare_at_price: priceMap.get(it.product_id) || null,
        }));
      }
    }

    return order;
  } catch (err) {
    console.error("Error fetching order for confirmation:", err);
    return null;
  }
}

export default async function ConfirmOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber);

  // If order does not exist -> return 404
  if (!order) {
    notFound();
  }

  // If order is already confirmed, shipped, or cancelled, redirect to tracking page
  if (order.status !== "pending") {
    redirect(`/track?order=${encodeURIComponent(order.order_number)}`);
  }

  return (
    <div className="min-h-screen bg-[#f6f5f2] text-black flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-8">
        <ConfirmOrderClient initialOrder={order} />
      </main>

      <Footer />
    </div>
  );
}
