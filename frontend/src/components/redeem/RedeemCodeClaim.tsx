"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  Gift,
  CheckCircle2,
  Clock,
  Lock,
  LogIn,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/LoginModal";

interface AttemptStatus {
  attemptsRemaining: number;
  maxAttempts: number;
  retryAfter: string | null;
}

interface RedeemResult {
  plan: { id: string; name: string; durationDay: number };
  redeemCode: { id: string; code: string };
  subscription: { id: string; startAt: string; endAt: string };
}

// ── Format ms sisa jadi "Xj Ym Zd" ──────────────────────────────────────────
function formatCountdown(ms: number) {
  if (ms <= 0) return "sebentar lagi";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;
}

export default function RedeemCodeClaim() {
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuth();

  const [openLogin, setOpenLogin] = useState(false);

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [status, setStatus] = useState<AttemptStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const [successResult, setSuccessResult] = useState<RedeemResult | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);

  // ─── Fetch sisa kuota percobaan ────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    if (!currentUser) return;
    setStatusLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/redeemCode/redeem/status`,
        { withCredentials: true },
      );
      setStatus(res.data.data);
    } catch (err) {
      console.error("Gagal mengambil status redeem:", err);
    } finally {
      setStatusLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // ─── Tick tiap detik buat countdown ─────────────────────────────────────────
  useEffect(() => {
    if (!status?.retryAfter) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [status?.retryAfter]);

  const isBlocked =
    !!status && status.attemptsRemaining <= 0 && !!status.retryAfter;
  const retryMs = status?.retryAfter
    ? new Date(status.retryAfter).getTime() - now
    : 0;

  // Kuota udah kebuka lagi (waktunya udah lewat) tapi state lama belum
  // di-refresh — refetch otomatis begitu countdown-nya nyampe 0.
  useEffect(() => {
    if (isBlocked && retryMs <= 0) {
      fetchStatus();
    }
  }, [isBlocked, retryMs, fetchStatus]);

  const handleSubmit = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error("Kode wajib diisi");
      return;
    }
    if (isBlocked) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/redeemCode/redeem`,
        { code: trimmed },
        { withCredentials: true },
      );

      setSuccessResult(res.data.data);
      setTimeout(() => setSuccessVisible(true), 10);
      setCode("");
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Gagal klaim kode";
      setErrorMessage(message);
      toast.error(message);
      // Refresh sisa kuota — attempt gagal ini kemungkinan udah kepotong
      // dari kuota di backend, jadi UI perlu nyusul update.
      fetchStatus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSuccess = (redirect: boolean) => {
    setSuccessVisible(false);
    setTimeout(() => {
      setSuccessResult(null);
      if (redirect) router.push("/elearning#elearning-selection");
    }, 250);
  };

  // Auto-redirect beberapa detik setelah sukses, sambil tetap bisa
  // diklik manual lebih cepat kalau mau.
  useEffect(() => {
    if (!successResult) return;
    const timeout = setTimeout(() => handleCloseSuccess(true), 3500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successResult]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""));
  };

  return (
    <main className="relative min-h-[75vh] flex items-center justify-center px-4 py-12 sm:py-24 overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-white">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -top-20 -left-16 w-64 h-64 sm:w-96 sm:h-96 bg-emerald-200/40 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 w-64 h-64 sm:w-96 sm:h-96 bg-teal-200/30 rounded-full blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(16,185,129,0.18) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* ── BELUM LOGIN ─────────────────────────────────────────────────── */}
        {!authLoading && !currentUser ? (
          <div className="rounded-3xl border border-emerald-100 bg-white/90 backdrop-blur-sm shadow-xl shadow-emerald-900/5 px-5 sm:px-7 py-8 sm:py-10 text-center">
            <div className="relative mx-auto mb-5 sm:mb-6 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
              <span
                className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-300 animate-spin"
                style={{ animationDuration: "12s" }}
              />
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              Login dulu, yuk
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-6 sm:mb-7">
              Kamu perlu login buat klaim kode redeem dan dapat akses E-Learning
              Subscription.
            </p>

            <button
              onClick={() => setOpenLogin(true)}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold px-6 py-2.5 sm:py-3 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5"
            >
              <LogIn className="w-4 h-4" />
              Masuk Sekarang
            </button>
          </div>
        ) : authLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            <p className="text-sm text-gray-400">Memuat...</p>
          </div>
        ) : (
          // ── FORM KLAIM ────────────────────────────────────────────────────
          <div className="rounded-3xl border border-emerald-100 bg-white/90 backdrop-blur-sm shadow-xl shadow-emerald-900/5 px-5 sm:px-7 py-7 sm:py-9">
            <div className="text-center mb-6 sm:mb-7">
              <div className="mx-auto mb-4 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 rotate-3">
                <Gift
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                  strokeWidth={2.2}
                />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
                Klaim Kode Redeem
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                Punya kode redeem? Masukkan di bawah buat langsung dapat akses
                E-Learning Subscription — tanpa perlu bayar.
              </p>
            </div>

            {/* Input kode */}
            <div className="mb-3">
              <input
                value={code}
                onChange={handleCodeChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                disabled={submitting || isBlocked}
                type="text"
                placeholder="XXXX-XXXX-XXXX"
                className="w-full text-center font-mono text-base sm:text-lg tracking-[0.1em] sm:tracking-[0.15em] uppercase border-2 border-emerald-200 rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 text-emerald-700 placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-500 text-center mb-3">
                {errorMessage}
              </p>
            )}

            {/* Status kuota / blokir */}
            {!statusLoading && status && (
              <div className="mb-5">
                {isBlocked ? (
                  <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <Clock className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-600 leading-relaxed">
                      Terlalu banyak percobaan gagal. Coba lagi dalam{" "}
                      <span className="font-mono font-semibold">
                        {formatCountdown(retryMs)}
                      </span>
                      .
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center">
                    Sisa percobaan dalam 1 hari:{" "}
                    <span className="font-semibold text-gray-600">
                      {status.attemptsRemaining}/{status.maxAttempts}
                    </span>
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || isBlocked || !code.trim()}
              className="group w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold px-6 py-3.5 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-emerald-500/25"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Klaim Sekarang
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── LOGIN MODAL ──────────────────────────────────────────────────────── */}
      <LoginModal
        isOpen={openLogin}
        setIsOpen={setOpenLogin}
        openRegister={() => {}}
      />

      {/* ── SUCCESS MODAL ────────────────────────────────────────────────────── */}
      {successResult && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center px-4 transition-opacity duration-300 ${
            successVisible
              ? "bg-black/60 backdrop-blur-sm opacity-100"
              : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`relative bg-white w-full max-w-[420px] rounded-3xl shadow-2xl p-6 sm:p-8 text-center overflow-hidden transform transition-all duration-300 ${
              successVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            {/* Decorative top accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400" />

            <div className="flex justify-center mb-5 mt-2">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle2
                    className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                    strokeWidth={2.2}
                  />
                </div>
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              Klaim Berhasil! 🎉
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Kamu sekarang punya akses{" "}
              <span className="font-semibold text-emerald-600">
                {successResult.plan.name}
              </span>{" "}
              selama {successResult.plan.durationDay} hari. Selamat belajar!
            </p>

            <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 mb-6">
              <span className="font-mono text-xs font-semibold text-emerald-700 tracking-wide">
                {successResult.redeemCode.code}
              </span>
            </div>

            <button
              onClick={() => handleCloseSuccess(true)}
              className="group w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold px-6 py-3 shadow-lg shadow-emerald-500/25 transition-all"
            >
              Mulai Belajar Sekarang
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            <p className="text-[11px] text-gray-300 mt-3">
              Otomatis diarahkan ke halaman E-Learning...
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
