"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Download, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { BRAND_CONFIG } from "@/config/brand";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface StoryItem {
  title: string;
  image?: string;
  size?: string;
  color?: string | null;
  price?: number;
}

interface InstagramStoryShareProps {
  orderNumber: string;
  customerName: string;
  items: StoryItem[];
  orderDate?: string;
}

export default function InstagramStoryShare({
  orderNumber,
  customerName,
  items = [],
}: InstagramStoryShareProps) {
  const { isArabic } = useLanguage();
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const safeItems = items.length > 0 ? items : [{
    title: "MARSEL PIECE",
    image: "/hoodie-cropped.png",
  }];

  const currentItem = safeItems[selectedItemIndex] || safeItems[0];
  const primaryItem = currentItem;

  const handleHandle = BRAND_CONFIG.social.instagram.handle.replace(/^@/, "");
  const mentionText = `@${handleHandle}`;

  // Generate 1080x1920 Clean Fashion Billboard Canvas
  const generateStoryCanvas = useCallback(async () => {
    setIsGenerating(true);
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    // 1. Background: Marsel Signature Off-White / Bone Linen (#f6f5f2)
    ctx.fillStyle = "#f6f5f2";
    ctx.fillRect(0, 0, 1080, 1920);

    // Subtle luxury poster inner frame (leaves safe margins at top and bottom for Instagram Story UI)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(60, 220, 960, 1480, 24);
    ctx.stroke();

    // 2. Load and Draw MARSEL Brand Logo (Cohesive header centered in upper portion)
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.src = "/logo/Black-without-bg.png";

    await new Promise<void>((resolve) => {
      logoImg.onload = () => {
        try {
          const maxLogoW = 320;
          const maxLogoH = 70;
          const aspect = logoImg.naturalWidth / logoImg.naturalHeight;
          let drawW = maxLogoW;
          let drawH = drawW / aspect;
          if (drawH > maxLogoH) {
            drawH = maxLogoH;
            drawW = drawH * aspect;
          }
          const drawX = 540 - drawW / 2;
          const drawY = 360 - drawH / 2;
          ctx.drawImage(logoImg, drawX, drawY, drawW, drawH);
        } catch {}
        resolve();
      };
      logoImg.onerror = () => {
        ctx.fillStyle = "#000000";
        ctx.font = "900 58px 'Arial Black', sans-serif";
        ctx.textAlign = "center";
        ctx.letterSpacing = "8px";
        ctx.fillText("MARSEL", 540, 360);
        resolve();
      };
    });

    // 3. Brand Tagline / Slogan right under logo with tight luxury spacing
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#666666";
    ctx.font = "600 20px monospace";
    ctx.letterSpacing = "6px";
    ctx.fillText("MADE TO BE DIFFERENT", 540, 430);

    // 4. Load and Draw Product Image (Centered focal showcase with soft shadow)
    const rawSrc = primaryItem.image || "/hoodie-cropped.png";
    const prodImg = new Image();
    prodImg.crossOrigin = "anonymous";
    prodImg.src = rawSrc;

    await new Promise<void>((resolve) => {
      prodImg.onload = () => {
        try {
          const targetBoxW = 720;
          const targetBoxH = 740;
          const targetBoxX = 540 - targetBoxW / 2;
          const targetBoxY = 490;

          const imgAspect = prodImg.naturalWidth / prodImg.naturalHeight;
          let drawW = targetBoxW;
          let drawH = drawW / imgAspect;

          if (drawH > targetBoxH) {
            drawH = targetBoxH;
            drawW = targetBoxH * imgAspect;
          }

          const drawX = 540 - drawW / 2;
          const drawY = targetBoxY + (targetBoxH - drawH) / 2;

          // Soft natural drop shadow for editorial depth
          ctx.save();
          ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
          ctx.shadowBlur = 45;
          ctx.shadowOffsetY = 20;

          ctx.drawImage(prodImg, drawX, drawY, drawW, drawH);
          ctx.restore();
        } catch {}
        resolve();
      };
      prodImg.onerror = () => resolve();
    });

    // 5. Product Title (Clean, bold, uppercase editorial typography close to product)
    const titleY = 1290;
    ctx.fillStyle = "#0a0a0a";
    ctx.font = "900 42px sans-serif";
    ctx.letterSpacing = "2px";
    const displayTitle = (primaryItem.title || "MARSEL PIECE").toUpperCase();
    ctx.fillText(displayTitle, 540, titleY);

    // 6. Dedicated Empty Frame for Instagram Mention Sticker
    const frameW = 500;
    const frameH = 96;
    const frameX = 540 - frameW / 2;
    const frameY = 1360;

    // Subtle background fill for the sticker area
    ctx.fillStyle = "rgba(0, 0, 0, 0.025)";
    ctx.beginPath();
    ctx.roundRect(frameX, frameY, frameW, frameH, 48);
    ctx.fill();

    // Elegant dashed outline indicating the sticker spot
    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(frameX, frameY, frameW, frameH, 48);
    ctx.stroke();
    ctx.restore();

    // Guide text inside the frame
    ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
    ctx.font = "bold 20px monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText(`+ TAG @${handleHandle.toUpperCase()}`, 540, frameY + frameH / 2 + 1);

    // Subtle brand watermark at bottom of the poster card
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.font = "600 15px monospace";
    ctx.letterSpacing = "5px";
    ctx.fillText("MARSEL • CAIRO ATELIER", 540, 1530);

    // Export to Data URL
    try {
      const dataUrl = canvas.toDataURL("image/png");
      setImageUrl(dataUrl);
    } catch (err) {
      console.error("Canvas export error:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [handleHandle, primaryItem]);

  useEffect(() => {
    generateStoryCanvas();
  }, [generateStoryCanvas]);

  // Copy mention to clipboard
  const handleCopyMention = async () => {
    try {
      await navigator.clipboard.writeText(mentionText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {}
  };

  // Direct Download Image Fallback
  const handleDownloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `marsel-story-${primaryItem.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 1-Click Native Share: Sends image directly to native phone apps (Instagram Stories)
  const handleShareToStory = async () => {
    if (!imageUrl) return;
    setIsSharing(true);

    // Auto-copy mention to clipboard immediately
    handleCopyMention();

    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const file = new File([blob], `marsel-story-${orderNumber}.png`, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "MARSEL Piece",
          text: `${mentionText} 🔥`,
        });
        setIsSharing(false);
        return;
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        setIsSharing(false);
        return;
      }
    }

    // Fallback if not supported
    handleDownloadImage();
    setIsSharing(false);
  };

  return (
    <div className="space-y-4 text-center">
      {/* Title only - completely clean */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-black">
        {isArabic ? "شاركنا قطعتك على إنستجرام" : "Share Your Piece With Us on Instagram"}
      </h3>

      {/* Carousel Preview Area */}
      <div className="relative flex flex-col items-center">
        {/* Story Card Mockup */}
        <div className="relative w-44 sm:w-48 aspect-[9/16] bg-[#f6f5f2] rounded-xl p-1 shadow-sm border border-black/15 overflow-hidden">
          {isGenerating ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-black/40 text-[10px] font-mono animate-pulse">
              <span>{isArabic ? "جارٍ التحميل..." : "Loading..."}</span>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={primaryItem.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : null}
        </div>

        {/* Carousel controls if more than 1 product */}
        {safeItems.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-3 select-none">
            <button
              type="button"
              onClick={() => setSelectedItemIndex((prev) => (prev > 0 ? prev - 1 : safeItems.length - 1))}
              className="p-1.5 text-black/60 hover:text-black cursor-pointer rounded-full hover:bg-black/5"
              aria-label="Previous piece"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>

            {/* Slide Dots Indicator */}
            <div className="flex items-center gap-1.5">
              {safeItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedItemIndex(idx)}
                  title={item.title}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    selectedItemIndex === idx
                      ? "w-5 bg-black"
                      : "w-1.5 bg-black/25 hover:bg-black/50"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSelectedItemIndex((prev) => (prev < safeItems.length - 1 ? prev + 1 : 0))}
              className="p-1.5 text-black/60 hover:text-black cursor-pointer rounded-full hover:bg-black/5"
              aria-label="Next piece"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>

      {/* Instagram Handle & Mention Callout with Copy Icon */}
      <div className="max-w-sm mx-auto w-full pt-1">
        <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-black/[0.03] border border-black/10 rounded-xs text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <InstagramIcon className="w-3.5 h-3.5 text-black/70 shrink-0" />
            <span className="text-[11px] text-black/70">
              {isArabic ? "اعمل لنا منشن في الاستوري:" : "Tag us in your story:"}
            </span>
            <span className="font-mono font-bold text-black text-xs">
              {mentionText}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyMention}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-black hover:text-white border border-black/15 text-[10px] font-mono font-bold uppercase transition-colors shrink-0 cursor-pointer rounded-xs"
            title={isArabic ? "نسخ اليوزرنيم" : "Copy username"}
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700">{isArabic ? "تم النسخ" : "Copied"}</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>{isArabic ? "نسخ" : "Copy"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Buttons: Share & Save only */}
      <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto w-full pt-1">
        <button
          type="button"
          onClick={handleShareToStory}
          disabled={isGenerating || !imageUrl || isSharing}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-black text-[#f6f5f2] hover:bg-black/85 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs disabled:opacity-50"
        >
          <InstagramIcon className="w-4 h-4" />
          <span>
            {isSharing
              ? isArabic ? "جارٍ المشاركة..." : "Sharing..."
              : isArabic ? "مشاركة في ستوري إنستجرام" : "Share to Story"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={isGenerating || !imageUrl}
          className="inline-flex items-center justify-center gap-1.5 py-3 px-4 border border-black/25 text-black hover:bg-black/5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          title={isArabic ? "حفظ الصورة" : "Save Image"}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isArabic ? "حفظ الصورة" : "Save"}</span>
        </button>
      </div>
    </div>
  );
}
