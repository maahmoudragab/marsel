import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutClient from "./CheckoutClient";
import { getCheckoutDataServer } from "@/lib/serverCheckout";

export const metadata: Metadata = {
  title: "Checkout | MARSEL",
  description: "Secure checkout and direct cash on delivery across Egypt with MARSEL.",
  robots: {
    index: false,
    follow: false,
  },
};

// Force dynamic rendering so offers and coupons are evaluated in real-time
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CheckoutPage() {
  const { shippingZones, offers } = await getCheckoutDataServer();

  return (
    <div className="min-h-screen flex flex-col bg-[#e7ecea] text-black">
      <Header />

      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-8">
        <CheckoutClient
          initialShippingZones={shippingZones}
          initialOffers={offers}
        />
      </main>

      <Footer />
    </div>
  );
}