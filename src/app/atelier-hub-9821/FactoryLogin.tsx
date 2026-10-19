"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft, ShieldCheck } from "lucide-react";

export default function FactoryLogin() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/factory/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "رمز الدخول غير صحيح");
      }

      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء الدخول";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 font-[family-name:var(--font-cairo)] text-neutral-900"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 sm:p-8">
        {/* Header Icon & Logo */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/logo/Black-without-bg.png"
              alt="MARSEL"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">بوابة المصنع والإنتاج</h1>
            <p className="text-sm text-neutral-500 font-medium mt-1">
              MARSEL ATELIER — تشغيل وتجهيز الأوردرات
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-5 p-3.5 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl text-center font-bold">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-2">
              رمز الدخول السري (PIN / Passcode)
            </label>
            <input
              type="password"
              inputMode="text"
              autoFocus
              placeholder="اكتب رمز الدخول هنا..."
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-4 py-3 text-base text-center font-bold tracking-widest border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent bg-neutral-50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !passcode.trim()}
            className="w-full py-3.5 bg-neutral-900 text-white rounded-xl font-bold text-base hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
          >
            <span>{loading ? "جاري التحقق..." : "دخول للبوابة"}</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-center gap-2 text-xs text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>منطقة مخصصة لمدير الإنتاج بالمصنع فقط</span>
        </div>
      </div>
    </div>
  );
}
