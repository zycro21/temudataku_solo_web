"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Loader2, Lock, Sprout, ArrowRight, LogIn } from "lucide-react";

interface ActiveSubscriptionResponse {
  isActive: boolean;
  subscriptionId?: string;
  plan?: {
    id: string;
    name: string;
    durationDay: number;
  };
  startAt?: string;
  endAt?: string;
  remainingDays?: number;
  message?: string;
}

export default function ElearningAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubscription/elearning/subscriptions/me/active`,
          { withCredentials: true },
        );

        const data: ActiveSubscriptionResponse = res.data?.data;

        if (!isMounted) return;

        setHasAccess(!!data?.isActive);
      } catch (err: any) {
        if (!isMounted) return;

        // 401 → user belum login sama sekali
        if (err?.response?.status === 401) {
          setIsLoggedIn(false);
        }

        setHasAccess(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] px-4 sm:px-5 overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-white">
        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute -top-20 -left-16 w-52 h-52 sm:-top-32 sm:-left-24 sm:w-80 sm:h-80 bg-emerald-200/40 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-16 w-52 h-52 sm:-bottom-32 sm:-right-24 sm:w-80 sm:h-80 bg-teal-200/30 rounded-full blur-3xl" />

        {/* Pulsing ring + spinner */}
        <div className="relative flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24">
          <span className="absolute inset-0 rounded-full border-2 border-emerald-300/60 animate-ping [animation-duration:2s]" />
          <span className="absolute inset-2 sm:inset-3 rounded-full border border-emerald-200" />
          <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Loader2 className="w-4 h-4 sm:w-6 sm:h-6 text-white animate-spin" />
          </div>
        </div>

        <p className="mt-5 sm:mt-6 text-xs sm:text-sm font-semibold text-emerald-800 text-center">
          Memeriksa akses langganan kamu
        </p>
        <p className="text-[11px] sm:text-xs text-emerald-600/70 mt-1 text-center">
          Tunggu sebentar ya...
        </p>
      </div>
    );
  }

  // ============================================================
  // LOCKED STATE
  // ============================================================
  if (!hasAccess) {
    return (
      <div className="relative flex items-center justify-center min-h-[60vh] sm:min-h-[70vh] px-4 py-10 sm:px-5 sm:py-14 overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-white">
        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute -top-16 -left-14 w-48 h-48 sm:-top-28 sm:-left-20 sm:w-72 sm:h-72 bg-emerald-200/40 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-14 w-52 h-52 sm:-bottom-28 sm:-right-20 sm:w-80 sm:h-80 bg-teal-200/30 rounded-full blur-3xl" />

        {/* Dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(16,185,129,0.18) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />

        <div className="relative w-full max-w-sm sm:max-w-md">
          <div className="relative rounded-2xl sm:rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur-sm shadow-xl shadow-emerald-900/5 px-5 py-8 sm:px-7 sm:py-10 text-center">
            {/* Top accent bar */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-12 sm:w-16 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />

            {/* Icon with rotating dashed ring */}
            <div className="relative mx-auto mb-5 sm:mb-6 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
              <span
                className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-300 animate-spin"
                style={{ animationDuration: "12s" }}
              />
              <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>

            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] sm:text-[11px] font-semibold px-2.5 sm:px-3 py-1 mb-3 sm:mb-4 leading-tight">
              <Sprout className="w-3 h-3 shrink-0" />
              <span>Hanya Bisa Diakses dengan Subscription E-Learning</span>
            </span>

            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-snug">
              {isLoggedIn ? "Materi ini terkunci untukmu" : "Login dulu, yuk"}
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6 sm:mb-7">
              {isLoggedIn
                ? "Kamu belum memiliki langganan E-Learning yang aktif. Berlangganan sekarang untuk membuka akses penuh ke seluruh materi, kelas, dan modul praktik."
                : "Login ke akun kamu terlebih dahulu untuk mengecek dan mengakses langganan E-Learning."}
            </p>

            {isLoggedIn ? (
              <Link
                href="/elearning"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-3 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5"
              >
                Lihat Paket Langganan
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new Event("auth:open-login"))
                }
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-3 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Masuk Sekarang
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
