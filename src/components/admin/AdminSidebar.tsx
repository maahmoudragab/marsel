"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  ArrowUpRight,
  Lock,
  Menu,
  X,
  BadgePercent,
  Truck,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    router.push("/admin");
    router.refresh();
  };

  const navLinks = [
    {
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      active: pathname === "/admin/orders",
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: Layers,
      active: pathname === "/admin/products",
    },
    {
      label: "Offers",
      href: "/admin/offers",
      icon: BadgePercent,
      active: pathname === "/admin/offers",
    },
    {
      label: "Deliveries",
      href: "/admin/deliveries",
      icon: Truck,
      active: pathname === "/admin/deliveries" || pathname.startsWith("/admin/deliveries/"),
    },
  ];

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 bg-[#e7ecea] border-b border-black/30 text-black z-40 flex items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-widest text-sm uppercase">marsel</span>
          <span className="text-[10px] text-black/60 uppercase font-medium">ADMIN</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 text-black cursor-pointer"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar View */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 w-64 h-screen shrink-0 bg-[#e7ecea] border-r border-black/30 text-black flex flex-col justify-between transition-transform duration-300 ease-in-out overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {/* Brand Title */}
          <div className="border-b border-black/20 pb-6 mb-8">
            <Link href="/admin" className="text-xl font-bold tracking-[0.2em] uppercase block hover:opacity-75 transition-opacity">
              marsel
            </Link>
            <span className="text-[11px] text-black/60 uppercase tracking-widest font-normal mt-1 block">
              STUDIO DASHBOARD
            </span>
          </div>

          {/* Links */}
          <nav className="space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-colors ${
                    link.active
                      ? "bg-black text-[#e7ecea]"
                      : "text-black/70 hover:text-black hover:bg-black/5"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 sm:p-8 border-t border-black/20 space-y-2 shrink-0 bg-[#e7ecea]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 text-xs uppercase tracking-wider text-black/70 hover:text-black hover:bg-black/5 transition-colors"
          >
            <span>View Store</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs uppercase tracking-wider text-black/60 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
          >
            <span>Lock</span>
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
}
