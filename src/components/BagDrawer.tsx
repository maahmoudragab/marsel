"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, ArrowRight, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function BagDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeFromCart,
    updateQuantity,
    totalCount,
    totalPrice,
    hydrated,
  } = useCart();

  const { isArabic, t, translateTitle, translateColor, formatPrice } = useLanguage();
  const router = useRouter();

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  const handleCheckoutClick = () => {
    closeDrawer();
    router.push("/checkout");
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isDrawerOpen
          ? "opacity-100 visible pointer-events-auto"
          : "opacity-0 invisible pointer-events-none"
      } transition-[opacity,visibility] duration-200`}
      style={{ display: isDrawerOpen ? "block" : "none" }}
      aria-hidden={!isDrawerOpen}
    >
      {/* Backdrop with smooth fade in / out */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer slide-in: from right in LTR, from left in RTL */}
      <div
        className={`fixed inset-y-0 ${
          isArabic ? "left-0 pr-6 sm:pr-10" : "right-0 pl-6 sm:pl-10"
        } max-w-full flex pointer-events-none`}
      >
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={isArabic ? "حقيبة التسوق" : "Shopping Bag"}
          className={`w-screen max-w-md bg-[#f6f5f2] text-black ${
            isArabic ? "border-r" : "border-l"
          } border-black shadow-2xl flex flex-col justify-between pointer-events-auto ${
            isDrawerOpen
              ? "translate-x-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              : isArabic
              ? "-translate-x-full transition-none"
              : "translate-x-full transition-none"
          }`}
          style={{ willChange: "transform", backfaceVisibility: "hidden" }}
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-black/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em]">
                {t("shoppingBag")}
              </span>
              <span className="text-xs text-black/50 font-mono font-bold" suppressHydrationWarning>
                [{totalCount}]
              </span>
            </div>
            <button
              onClick={closeDrawer}
              aria-label={isArabic ? "إغلاق السلة" : "Close Bag"}
              className="p-1 text-black/60 hover:text-black transition-colors cursor-pointer text-sm font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Items list or Empty state */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 divide-y divide-black/10">
            {!hydrated ? (
              <div className="h-full flex items-center justify-center text-center py-16">
                <span className="text-[10px] font-mono uppercase tracking-widest text-black/40">
                  {isArabic ? "جاري تحميل السلة..." : "Loading bag..."}
                </span>
              </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <ShoppingBag className="w-8 h-8 text-black/30" />
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-black">
                    {t("bagEmpty")}
                  </p>
                  <p className="text-[11px] text-black/50 tracking-wide">
                    {t("bagEmptySub")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="px-5 py-2.5 border border-black text-xs font-semibold uppercase tracking-wider hover:bg-black hover:text-[#f6f5f2] transition-colors cursor-pointer"
                >
                  {t("exploreCollection")}
                </button>
              </div>
            ) : (
              items.map((item) => {
                const localizedTitle = translateTitle(item.title, item.slug, item.styling_notes);
                const localizedColor = translateColor(item.color);

                return (
                  <div key={item.id} className="py-4 flex gap-3.5 items-start first:pt-1 last:pb-2">
                    {/* Thumbnail */}
                    <div className="relative w-16 h-20 shrink-0 border border-black/15 bg-white/40 flex items-center justify-center p-1 overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={localizedTitle}
                          fill
                          sizes="160px"
                          quality={85}
                          className="object-contain p-1"
                        />
                      ) : null}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold uppercase tracking-tight truncate">
                          {localizedTitle}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-black/40 hover:text-black text-xs p-0.5 transition-colors cursor-pointer"
                          title={t("remove")}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-black/60 uppercase tracking-wider mt-0.5">
                        <span>
                          {t("sizeLabel")} {item.size}
                        </span>
                        {item.color && <span> · {localizedColor}</span>}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-black/30 bg-transparent">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-xs hover:bg-black/10 transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-xs font-mono font-bold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-xs hover:bg-black/10 transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right rtl:text-left">
                          {item.compareAtPrice && item.compareAtPrice > item.price && (
                            <span className="text-[10px] text-black/40 line-through mr-1 rtl:ml-1 font-mono">
                              {formatPrice(item.compareAtPrice * item.quantity)}
                            </span>
                          )}
                          <span className="text-xs font-bold font-mono">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Checkout CTA */}
          {items.length > 0 && (
            <div className="border-t border-black/20 p-5 sm:p-6 space-y-4 bg-[#f6f5f2]">
              {/* Subtotal */}
              <div className="space-y-1">
                <div className="flex justify-between items-baseline text-xs font-semibold uppercase tracking-wider">
                  <span>{t("subtotal")}</span>
                  <span className="text-base font-bold font-mono">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <p className="text-[10px] text-black/50 tracking-wide">
                  {t("bagCashNotice")}
                </p>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full py-3.5 bg-black text-[#f6f5f2] text-xs font-semibold uppercase tracking-[0.18em] hover:bg-black/85 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t("checkoutButton")}</span>
                {isArabic ? (
                  <ArrowLeft className="w-3.5 h-3.5" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={closeDrawer}
                className="w-full text-center text-[10px] text-black/60 uppercase tracking-widest hover:text-black transition-colors underline underline-offset-4 cursor-pointer"
              >
                {isArabic ? "أو واصل التسوق" : "Or Continue Browsing"}
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
