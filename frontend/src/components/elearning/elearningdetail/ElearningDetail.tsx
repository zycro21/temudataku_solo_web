"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import HeroSection from "./HeroSection";
import SubChapter from "./SubChapter";
import HelpSection from "../../mentoring/NeedHelp";
import { useElearningCourseDetail } from "@/hooks/useElearningCourseDetail";
import { Loader2, ArrowLeft, SearchX, ArrowRight } from "lucide-react";

export default function ElearningDetail({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { course, loading, errorType } = useElearningCourseDetail(id);

  // 🔥 Asal halaman ini dibuka (dikirim lewat ?from= dari ElearningSelection
  // / ElearningFul saat nge-link ke sini). Dipakai supaya tombol "Kembali"
  // selalu balik ke halaman yang BENAR, bukan pakai router.back() yang
  // gampang salah arah kalau history stack ke-push oleh navigasi lain
  // (mis. dari halaman subchapter materi).
  const from =
    searchParams.get("from") === "elearningfull"
      ? "elearningfull"
      : "elearning";

  const BackButton = (
    <div className="max-w-screen-2xl mx-auto px-3 md:px-5 lg:px-8 pt-5">
      <button
        type="button"
        onClick={() => router.push(`/${from}`)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>
    </div>
  );

  if (loading) {
    return (
      <div>
        {BackButton}
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
          <p className="text-sm text-gray-500">Memuat E-Learning...</p>
        </div>
      </div>
    );
  }

  // errorType di sini seharusnya jarang kejadian karena ElearningAccessGuard
  // di level page sudah menggerbang akses (401/403) sebelum sampai ke sini.
  // Tapi tetap ditangani untuk kasus course memang tidak ditemukan (404)
  // atau error lain yang tak terduga.
  if (!course || errorType) {
    return (
      <div>
        {BackButton}
        <div className="relative overflow-hidden flex items-center justify-center min-h-[55vh] px-4 py-12 sm:px-5">
          {/* Ambient glow blobs */}
          <div className="pointer-events-none absolute -top-16 -left-14 w-56 h-56 bg-emerald-200/40 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-14 w-60 h-60 bg-teal-200/30 rounded-full blur-3xl" />

          {/* Dot-grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.3]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(16,185,129,0.18) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          <div className="relative w-full max-w-sm sm:max-w-md text-center">
            <div className="relative rounded-2xl sm:rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur-sm shadow-xl shadow-emerald-900/5 px-6 py-9 sm:px-8 sm:py-11">
              {/* Top accent bar */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-12 sm:w-16 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />

              {/* Icon with rotating dashed ring */}
              <div className="relative mx-auto mb-5 sm:mb-6 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
                <span
                  className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-300 animate-spin"
                  style={{ animationDuration: "12s" }}
                />
                <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <SearchX className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-snug">
                Yah, Course-nya Tidak Ditemukan
              </h2>

              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6 sm:mb-7">
                Mungkin link-nya salah, atau course ini sudah tidak tersedia
                lagi. Tenang, masih banyak course seru lain yang bisa kamu
                pelajari sambil kami cek yang ini.
              </p>

              <Link
                href="/elearning"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-3 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5"
              >
                Jelajahi Course Lain
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main>
      {BackButton}
      <HeroSection course={course} />
      <SubChapter course={course} from={from} />
      <HelpSection />
    </main>
  );
}
