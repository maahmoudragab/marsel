"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface GalleryViewerModalProps {
  images: string[];
  initialIndex?: number;
  title: string;
  onClose: () => void;
}

export default function GalleryViewerModal({
  images,
  initialIndex = 0,
  title,
  onClose,
}: GalleryViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const total = images.length;

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  }, [total]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  }, [total]);

  // Keyboard navigation listener (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrev, goToNext, onClose]);

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const imageLabel =
    currentIndex === 0
      ? "الواجهة الأمامية (الوش)"
      : currentIndex === 1
      ? "الواجهة الخلفية (الضهر)"
      : `صورة تفصيلية ${currentIndex + 1}`;

  return (
    <div
      dir="ltr"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 no-print cursor-pointer select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[95vh] flex flex-col justify-between p-4 cursor-default text-white space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 px-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">{title}</h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded">
              {currentIndex + 1} / {total}
            </span>
            <span className="text-xs font-bold text-neutral-400 font-sans hidden sm:inline">
              ({imageLabel})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={currentImage}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="تحميل الصورة الأصلية"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">تحميل الأصلية</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white cursor-pointer transition-colors"
              title="إغلاق (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* IMAGE DISPLAY WITH KEYBOARD & ON-SCREEN ARROWS */}
        <div className="relative flex items-center justify-center min-h-[50vh] max-h-[72vh] overflow-hidden rounded-xl bg-neutral-950/60 p-2">
          {/* Previous Arrow Button */}
          {total > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-neutral-900/80 hover:bg-white hover:text-neutral-950 text-white transition-all shadow-lg cursor-pointer z-10"
              title="الصورة السابقة (سهم يسار ◀)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Current Main Image */}
          <img
            src={currentImage}
            alt={`${title} - ${currentIndex + 1}`}
            className="max-h-[70vh] max-w-full w-auto object-contain rounded-lg transition-transform duration-150"
          />

          {/* Next Arrow Button */}
          {total > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-neutral-900/80 hover:bg-white hover:text-neutral-950 text-white transition-all shadow-lg cursor-pointer z-10"
              title="الصورة التالية (سهم يمين ▶)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* BOTTOM THUMBNAILS STRIP & SHORTCUT HINT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-neutral-800 px-2">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-900 border-2 transition-all cursor-pointer shrink-0 ${
                  currentIndex === idx ? "border-white scale-105" : "border-neutral-700 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain p-0.5" />
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-neutral-400 font-medium text-right sm:text-left">
            تنقل بأسهم الكيبورد: <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-white">◀</kbd> أو <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-white">▶</kbd> | اضغط <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-white">Esc</kbd> للإغلاق
          </div>
        </div>
      </div>
    </div>
  );
}
