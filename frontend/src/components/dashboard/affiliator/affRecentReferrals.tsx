"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { useAffiliatorProfile } from "@/hooks/useAffiliatorProfile";

interface CommissionItem {
  id: string;
  amount: number;
  productType: string | null;
  pointsAwarded: number | null;
  created_at: string;
}

const PRODUCT_LABELS: Record<string, string> = {
  ELEARNING_1M: "E-Learning 1 Bln",
  ELEARNING_3M: "E-Learning 3 Bln",
  ELEARNING_6M: "E-Learning 6 Bln",
  MENTORING_BOOTCAMP: "Bootcamp",
  MENTORING_ONE_ON_ONE: "1-on-1",
  MENTORING_GROUP: "Grup",
  AYCL: "AYCL",
};

export default function AffRecentReferrals() {
  const { data: profileData, loading: profileLoading } = useAffiliatorProfile();
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileLoading || !profileData) return;

    const codes = profileData.referralCodes;
    if (!codes || codes.length === 0) {
      setLoading(false);
      return;
    }

    // Ambil komisi dari kode referral aktif pertama
    const activeCode = codes.find((c) => c.isActive) ?? codes[0];

    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/referral-codes-commissions/${activeCode.id}`,
        { withCredentials: true, params: { page: 1, limit: 10 } },
      )
      .then((res) => {
        setCommissions(res.data.data?.commissions ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [profileData, profileLoading]);

  const isLoading = profileLoading || loading;

  return (
    <Card className="p-6 rounded-2xl shadow-sm border border-gray-200 bg-white">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Komisi Terbaru</h3>

      <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-gray-100 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : commissions.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">
            Belum ada transaksi komisi
          </p>
        ) : (
          commissions.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {PRODUCT_LABELS[c.productType ?? ""] ??
                    c.productType ??
                    "Produk"}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(c.created_at), {
                    addSuffix: true,
                    locale: id,
                  })}
                  {c.pointsAwarded ? ` · +${c.pointsAwarded} poin` : ""}
                </p>
              </div>
              <p className="text-base font-semibold text-emerald-600">
                +Rp{Number(c.amount).toLocaleString("id-ID")}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
