"use client";

import { Copy, Check, Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAffiliatorProfile } from "@/hooks/useAffiliatorProfile";

export default function AffReferralCode() {
  const { data, loading } = useAffiliatorProfile();
  const [copied, setCopied] = useState<string | null>(null);

  const codes = data?.referralCodes ?? [];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success("Kode referral berhasil disalin!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-emerald-100">
      {/* Header strip */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 px-5 py-3 flex items-center gap-2">
        <Link2 size={14} className="text-white/80" />
        <h2 className="text-sm font-bold text-white">Kode Referral Anda</h2>
        <span className="ml-auto text-[10px] text-white/60 font-medium">
          Bagikan & dapatkan komisi
        </span>
      </div>

      {/* Body */}
      <div className="bg-white px-4 py-3">
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-14 bg-gray-100 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : codes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <Link2 size={24} className="mb-2 opacity-30" />
            <p className="text-xs">Belum ada kode referral</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {codes.map((rc) => (
              <div
                key={rc.id}
                className={`relative rounded-xl overflow-hidden ${
                  rc.isActive
                    ? "bg-gradient-to-r from-emerald-500 to-green-400"
                    : "bg-gray-200"
                }`}
              >
                {/* Dekorasi lingkaran */}
                {rc.isActive && (
                  <>
                    <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />
                    <div className="absolute right-12 top-3 w-8 h-8 rounded-full bg-white/10 pointer-events-none" />
                  </>
                )}

                <div className="relative flex items-center justify-between px-4 py-3">
                  <div>
                    <p
                      className={`text-xl font-black tracking-[0.15em] ${
                        rc.isActive ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {rc.code}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopy(rc.code)}
                    disabled={!rc.isActive}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all ${
                      rc.isActive
                        ? copied === rc.code
                          ? "bg-white text-emerald-600 scale-95"
                          : "bg-white/20 hover:bg-white/30 text-white border border-white/30"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {copied === rc.code ? (
                      <>
                        <Check size={12} /> Tersalin
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Salin
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
