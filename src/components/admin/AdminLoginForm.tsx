"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";

export default function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Access denied");
      } else {
        router.refresh();
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e7ecea] text-black px-4">
      <div className="w-full max-w-sm border border-black p-8 sm:p-10 bg-transparent space-y-8">
        {/* Header */}
        <div className="space-y-2 border-b border-black/20 pb-6 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold tracking-[0.25em] uppercase">marsel</span>
            <Lock className="w-4 h-4 text-black/60" />
          </div>
          <p className="text-[10px] tracking-widest uppercase text-black/50">
            Studio Control — Authorized Access Only
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="block text-[11px] font-bold uppercase tracking-wider text-black/70"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter studio password"
              required
              className="w-full h-11 text-xs border border-black/20 bg-black/[0.01] px-3 focus:outline-none focus:border-black font-mono transition-colors rounded-none placeholder:text-black/35"
            />
          </div>

          {error && (
            <div className="border border-red-400 bg-red-50/50 p-2.5 text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3.5 bg-black text-[#e7ecea] text-xs font-semibold uppercase tracking-widest hover:bg-black/85 transition-colors cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <span>{loading ? "Verifying..." : "Enter Studio"}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center pt-2">
          <span className="text-[10px] uppercase tracking-wider text-black/40">
            Session valid for 24 hours
          </span>
        </div>
      </div>
    </div>
  );
}