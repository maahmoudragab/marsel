import React from "react";
import Link from "next/link";
import { BRAND_CONFIG } from "@/config/brand";

export default function Footer() {
  return (
    <footer className="border-t border-black mt-20 py-10 px-4 sm:px-8 bg-[#e7ecea]">
      <div className="max-w-[1700px] mx-auto flex flex-col items-center justify-center text-center space-y-4 text-black">
        <div className="text-sm font-bold tracking-[0.25em] uppercase">
          {BRAND_CONFIG.name}
        </div>

        <p className="text-[11px] font-normal uppercase tracking-wider text-black/70">
          {BRAND_CONFIG.tagline}
        </p>

        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-medium uppercase tracking-wider text-black max-w-xl">
          <Link href="/about" className="hover:underline underline-offset-4">
            ABOUT
          </Link>
          <span className="text-black/30">•</span>
          <Link href="/track" className="hover:underline underline-offset-4">
            TRACK ORDER
          </Link>
          <span className="text-black/30">•</span>
          <Link href="/returns" className="hover:underline underline-offset-4">
            RETURNS & EXCHANGES
          </Link>
          <span className="text-black/30">•</span>
          <Link href="/terms" className="hover:underline underline-offset-4">
            TERMS
          </Link>
          <span className="text-black/30">•</span>
          <Link href="/privacy" className="hover:underline underline-offset-4">
            PRIVACY
          </Link>
          <span className="text-black/30">•</span>
          <a
            href={BRAND_CONFIG.social.whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline underline-offset-4"
          >
            WHATSAPP
          </a>
          <span className="text-black/30">•</span>
          <a
            href={BRAND_CONFIG.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline underline-offset-4"
          >
            INSTAGRAM
          </a>
          {BRAND_CONFIG.social.tiktok?.url && (
            <>
              <span className="text-black/30">•</span>
              <a
                href={BRAND_CONFIG.social.tiktok.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline underline-offset-4"
              >
                TIKTOK
              </a>
            </>
          )}
        </nav>

        <div className="text-[10px] text-black/50 uppercase tracking-widest pt-2">
          © {new Date().getFullYear()} {BRAND_CONFIG.legalName}
        </div>
      </div>
    </footer>
  );
}
