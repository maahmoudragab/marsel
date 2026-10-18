import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#e7ecea] text-black flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-8">
        <div className="pt-2 pb-2">
          <nav className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-black/55 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-black transition-colors">marsel</Link>
            <span>/</span>
            <span className="text-black font-semibold">404 not found</span>
          </nav>
        </div>

        <div className="py-24 text-center max-w-md mx-auto space-y-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-black/50 block">Error 404</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs text-black/60 uppercase tracking-widest leading-relaxed">
            The requested piece or URL does not exist or has been relocated.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center h-12 px-8 bg-black text-[#e7ecea] text-xs font-bold uppercase tracking-widest hover:bg-black/85 transition-colors shadow-sm"
            >
              Return to Store
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
