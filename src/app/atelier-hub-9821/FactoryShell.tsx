"use client";

import React from "react";
import { FactoryProvider, useFactory } from "./FactoryContext";
import FactorySidebar from "./FactorySidebar";
import CuttingSummaryModal from "./CuttingSummaryModal";
import { Menu } from "lucide-react";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { setMobileSidebarOpen } = useFactory();

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-neutral-100 text-neutral-900 font-[family-name:var(--font-cairo)] text-right flex flex-col lg:flex-row"
    >
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden bg-neutral-950 text-white px-4 py-3 flex items-center justify-between border-b border-neutral-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 rounded-lg bg-neutral-900 text-white cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="h-7 px-2 rounded-md bg-white flex items-center justify-center">
            <img
              src="/logo/Black-without-bg.png"
              alt="MARSEL"
              className="h-4 w-auto object-contain"
            />
          </div>
          <span className="font-black text-xs tracking-wider text-neutral-300">ATELIER</span>
        </div>
      </div>

      {/* SIDEBAR */}
      <FactorySidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl">
        {children}
      </main>

      {/* CUTTING SUMMARY MODAL */}
      <CuttingSummaryModal />
    </div>
  );
}

export default function FactoryShell({ children }: { children: React.ReactNode }) {
  return (
    <FactoryProvider>
      <ShellInner>{children}</ShellInner>
    </FactoryProvider>
  );
}
