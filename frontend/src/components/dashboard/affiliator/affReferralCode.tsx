"use client";

import { Card } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
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
    <Card className="p-6 rounded-2xl shadow-sm border border-gray-200 bg-white">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Kode Referral Anda
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : codes.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">
          Belum ada kode referral
        </p>
      ) : (
        <div className="space-y-3">
          {codes.map((rc) => (
            <div
              key={rc.id}
              className={`flex items-center justify-between px-5 py-4 rounded-xl ${
                rc.isActive ? "bg-emerald-500" : "bg-gray-300"
              }`}
            >
              <div>
                <p className="text-xs font-medium text-white/70 mb-0.5">
                  {rc.isActive ? "Kode Referral Aktif" : "Tidak Aktif"}
                </p>
                <p className="text-2xl font-extrabold tracking-wide text-white">
                  {rc.code}
                </p>
              </div>
              <button
                onClick={() => handleCopy(rc.code)}
                disabled={!rc.isActive}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                {copied === rc.code ? (
                  <>
                    <Check size={14} /> Tersalin
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Salin
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
