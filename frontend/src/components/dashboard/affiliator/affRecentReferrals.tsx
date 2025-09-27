"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface ReferralData {
  id: string;
  userName: string;
  email: string;
  usedAt: string;
  amount: number;
}

export default function AffRecentReferrals() {
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // cegah update state setelah unmount

    const fetchReferrals = async () => {
      try {
        // 1. Ambil referral codes affiliator
        const codesRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/referral-codes`,
          { withCredentials: true }
        );

        const codes = codesRes.data.data.referralCodes;
        if (!codes || codes.length === 0) {
          if (isMounted) {
            setReferrals([]);
            setLoading(false);
          }
          return;
        }

        const referralCodeId = codes[0].id; // contoh pakai kode pertama

        // 2. Ambil usages (user + waktu pakai)
        const usagesRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/referral-codes-usages/${referralCodeId}`,
          { withCredentials: true }
        );
        const usages = usagesRes.data.data.usages || [];

        // 3. Ambil commissions (amount)
        const commissionsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/referral-codes-commissions/${referralCodeId}`,
          { withCredentials: true }
        );
        const commissions = commissionsRes.data.data.commissions || [];

        // 4. Merge berdasarkan bookingId / practicePurchaseId
        const merged: ReferralData[] = usages.map((usage: any) => {
          let commission = null;

          if (usage.booking) {
            commission = commissions.find(
              (c: any) => c.payment?.bookingId === usage.booking.id
            );
          } else if (usage.practicePurchase) {
            commission = commissions.find(
              (c: any) =>
                c.payment?.practicePurchaseId === usage.practicePurchase.id
            );
          }

          return {
            id: usage.id,
            userName: usage.user?.fullName || "Unknown User",
            email: usage.user?.email || "-",
            usedAt: usage.usedAt,
            amount: commission?.amount || 0,
          };
        });

        // 5. Urutkan & batasi 10 referral terbaru
        const limited = merged
          .sort(
            (a, b) =>
              new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime()
          )
          .slice(0, 10);

        if (isMounted) {
          setReferrals(limited);
        }
      } catch (err) {
        console.error("Error fetching referrals", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReferrals();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Card className="p-6 rounded-2xl shadow-sm border border-gray-200 bg-white">
      <h3 className="text-2xl font-bold text-gray-800 mb-1">
        Referral Terbaru
      </h3>

      <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto scroll-thin pr-4">
        {loading ? (
          <p className="text-gray-500 text-sm py-3">Memuat data...</p>
        ) : referrals.length === 0 ? (
          <p className="text-gray-800 font-semibold text-sm py-2">
            Belum ada referral terbaru.
          </p>
        ) : (
          referrals.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-3"
            >
              {/* Avatar inisial */}
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                  {item.userName
                    ? item.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                    : "?"}
                </div>
                <div>
                  <p className="text-base font-medium text-gray-800 mb-1">
                    {item.userName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {formatDistanceToNow(new Date(item.usedAt), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </p>
                </div>
              </div>

              {/* Amount dari API */}
              <p className="text-base font-semibold text-emerald-600">
                +Rp{item.amount.toLocaleString("id-ID")}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
