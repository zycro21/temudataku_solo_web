"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Clock, ArrowRight } from "lucide-react";

interface SubscriptionHistoryItem {
  id: string;
  status: string;
  computedStatus: string;
  startAt: string;
  endAt: string;
  plan: {
    id: string;
    name: string;
    durationDay: number;
  };
}

export default function SubscriptionStatusBanner() {
  const [loading, setLoading] = useState(true);
  const [combinedEndAt, setCombinedEndAt] = useState<Date | null>(null);
  const [stackedCount, setStackedCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchSubscriptions = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubscription/elearning/subscriptions/me`,
          {
            withCredentials: true,
            params: { status: "confirmed", limit: 100, page: 1 },
          },
        );

        const subscriptions: SubscriptionHistoryItem[] =
          res.data?.data?.subscriptions ?? [];

        if (!isMounted) return;

        // Hanya yang secara real-time masih valid (belum lewat endAt-nya).
        // "confirmed" di query cuma filter status DB, jadi tetap perlu
        // cek computedStatus (yang sudah mempertimbangkan endAt < now).
        const stillValid = subscriptions.filter(
          (sub) => sub.computedStatus === "confirmed",
        );

        if (stillValid.length === 0) {
          setCombinedEndAt(null);
          setStackedCount(0);
          return;
        }

        // 🔥 Subscription yang ditumpuk dibuat berantai di backend
        // (startAt subscription baru = endAt subscription sebelumnya),
        // jadi ujung validitas gabungan = endAt PALING JAUH di antara
        // semua yang masih valid.
        const latestEndAt = stillValid.reduce((latest, sub) => {
          const end = new Date(sub.endAt);
          return end > latest ? end : latest;
        }, new Date(stillValid[0].endAt));

        setCombinedEndAt(latestEndAt);
        setStackedCount(stillValid.length);
      } catch {
        // belum login / gagal fetch → banner disembunyikan saja, tidak
        // mengganggu halaman marketing yang publik
        if (isMounted) {
          setCombinedEndAt(null);
          setStackedCount(0);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Fetch pertama kali saat komponen mount
    fetchSubscriptions();

    // 🔥 Fetch ulang begitu ada event "login/register berhasil" — perlu ini
    // karena router.push ke path yang SAMA (mis. sudah di /elearning lalu
    // di-push ke /elearning lagi) tidak me-remount komponen ini, jadi
    // useEffect mount tidak akan jalan ulang tanpa trigger manual ini.
    const handleAuthChanged = () => {
      fetchSubscriptions();
    };

    window.addEventListener(
      "elearning-subscription:refresh",
      handleAuthChanged,
    );

    return () => {
      isMounted = false;
      window.removeEventListener(
        "elearning-subscription:refresh",
        handleAuthChanged,
      );
    };
  }, []);

  if (loading || !combinedEndAt) return null;

  const now = new Date();
  const remainingMs = combinedEndAt.getTime() - now.getTime();
  const remainingDays = Math.max(
    Math.ceil(remainingMs / (1000 * 60 * 60 * 24)),
    0,
  );

  const formattedEndDate = combinedEndAt.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const isEndingSoon = remainingDays <= 7;

  return (
    <div className="relative mb-6 sm:mb-8 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-teal-50">
      {/* Ambient glow accent */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-emerald-200/40 rounded-full blur-3xl" />

      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <span className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30">
            <Clock className="w-5 h-5 text-white" />
          </span>

          <div>
            <p className="text-xs sm:text-sm font-semibold text-emerald-900 leading-snug">
              Subscription E-Learning kamu aktif -- {remainingDays} hari lagi
            </p>
            <p className="text-[11px] sm:text-xs text-emerald-700/80 mt-0.5">
              Berlaku sampai {formattedEndDate}
              {stackedCount > 1
                ? ` · Gabungan ${stackedCount} Paket Pembelian/Redeem`
                : ""}
            </p>
          </div>
        </div>

        {isEndingSoon && (
          <Link
            href="/elearning"
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-full px-4 py-1.5 sm:py-2 transition-all shrink-0 shadow-sm shadow-emerald-500/25"
          >
            Perpanjang Sekarang
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
