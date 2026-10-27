import React, { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrackOrderClient from "./TrackOrderClient";

export const metadata: Metadata = {
  title: "TRACK ORDER",
  description: "Real-time parcel status & delivery tracking for MARSEL orders.",
};

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-[#f6f5f2] text-black flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-8">
        <Suspense
          fallback={
            <div className="py-20 text-center text-xs uppercase tracking-widest text-black/40">
              Loading tracking...
            </div>
          }
        >
          <TrackOrderClient />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}