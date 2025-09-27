"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function AffReferralCode() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferralCode = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/referral-codes`,
          {
            params: { page: 1, limit: 1 }, // ambil 1 paling baru (karena di service orderBy createdAt: "desc")
            withCredentials: true,
          }
        );

        if (res.data.success) {
          const codes = res.data.data.referralCodes;
          if (codes && codes.length > 0) {
            setReferralCode(codes[0].code); // hanya ambil yang paling terakhir dibuat
          }
        } else {
          toast.error("Gagal memuat referral code");
        }
      } catch (err) {
        console.error("Error fetch referral code:", err);
        toast.error("Terjadi kesalahan mengambil referral code");
      } finally {
        setLoading(false);
      }
    };

    fetchReferralCode();
  }, []);

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    toast.success("Kode referral berhasil disalin!");
  };

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
            {loading ? "Loading..." : referralCode ?? "-"}
          </span>
        </div>

        <Button
          variant="secondary"
          size="lg"
          disabled={!referralCode}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-5 py-2 text-base font-semibold"
          onClick={handleCopy}
        >
          <Copy className="h-5 w-5 mr-2" /> Salin
        </Button>
      </div>
    </Card>
  );
}
