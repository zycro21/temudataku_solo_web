"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

export default function AffReferralCode() {
  const referralCode = "GILANG1717";

  return (
    <Card className="p-6  rounded-2xl shadow-sm border border-gray-200 bg-white">
      {/* Judul */}
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        Kode Referral Anda
      </h2>

      {/* Box Referral */}
      <div className="flex items-center justify-between bg-emerald-500 text-white px-7 py-6 rounded-xl">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white/80 mb-1">
            Kode Referral
          </span>
          <span className="text-3xl font-extrabold tracking-wide">
            {referralCode}
          </span>
        </div>

        <Button
          variant="secondary"
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-5 py-2 text-base font-semibold"
          onClick={() => navigator.clipboard.writeText(referralCode)}
        >
          <Copy className="h-5 w-5 mr-2" /> Salin
        </Button>
      </div>
    </Card>
  );
}
