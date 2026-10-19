"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Clock,
  Printer,
  Truck,
  CheckCheck,
  RotateCw,
  LogOut,
  Layers,
  X,
  FileText,
} from "lucide-react";
import { useFactory } from "./FactoryContext";

export default function FactorySidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    refreshing,
    refreshOrders,
    queueOrders,
    processingOrders,
    readyOrders,
    deliveredOrders,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    setShowCuttingModal,
  } = useFactory();

  const handleLogout = async () => {
    await fetch("/api/factory/auth", { method: "DELETE" });
    router.refresh();
  };

  const navLinks = [
    {
      href: "/atelier-hub-9821/queue",
      label: "1. في الانتظار",
      icon: Clock,
      count: queueOrders.length,
    },
    {
      href: "/atelier-hub-9821/processing",
      label: "2. قيد التجهيز",
      icon: Printer,
      count: processingOrders.length,
    },
    {
      href: "/atelier-hub-9821/ready",
      label: "3. جاهز للتسليم",
      icon: Truck,
      count: readyOrders.length,
    },
    {
      href: "/atelier-hub-9821/delivered",
      label: "4. تم التسليم",
      icon: CheckCheck,
      count: deliveredOrders.length,
    },
  ];

  return (
    <>
      {/* SIDEBAR CONTAINER */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-neutral-950 text-neutral-100 flex flex-col justify-between border-l border-neutral-800 transition-transform duration-200 lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 ${
          mobileSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Brand Header */}
          <div className="border-b border-neutral-850 pb-5">
            <div className="flex items-center justify-between mb-3 lg:hidden">
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 font-bold uppercase">
                MARSEL ATELIER
              </span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full bg-white rounded-xl py-3.5 px-4 flex items-center justify-center shadow-md">
              <img
                src="/logo/Black-without-bg.png"
                alt="MARSEL"
                className="w-full h-auto max-h-12 object-contain"
              />
            </div>
            
            <div className="mt-3 text-center">
              <h1 className="text-xs font-black tracking-wider text-white font-mono uppercase">ATELIER & PRODUCTION</h1>
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">نظام تشغيل وتجهيز المصنع</p>
            </div>
          </div>

          {/* Navigation Links to Separate Pages */}
          <nav className="space-y-1.5">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block px-2 mb-2">
              مراحل وخطوات التشغيل
            </span>

            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isActive
                      ? "bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-neutral-400" />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                      isActive
                        ? "bg-white text-neutral-900"
                        : "bg-neutral-850 text-neutral-300"
                    }`}
                  >
                    {item.count}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Cutting Summary Modal Trigger */}
          <div className="pt-2">
            <button
              onClick={() => {
                setShowCuttingModal(true);
                setMobileSidebarOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-neutral-850 text-neutral-300 transition-colors cursor-pointer border border-neutral-800"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-neutral-400" />
                <span>كشف تقطيع وتجهيز القماش</span>
              </div>
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-neutral-800 space-y-2">
          <button
            onClick={() => refreshOrders()}
            disabled={refreshing}
            className="w-full py-2 px-3 text-xs font-bold bg-neutral-900 hover:bg-neutral-850 text-neutral-300 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>تحديث البيانات</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 text-xs font-bold text-neutral-400 hover:text-red-400 hover:bg-neutral-900 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BACKDROP */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </>
  );
}
