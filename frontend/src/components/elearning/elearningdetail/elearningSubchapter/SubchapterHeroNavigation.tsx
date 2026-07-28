"use client";

import { useMemo } from "react";

interface Props {
  moduleNumber: number;
  moduleTitle: string;
  subModuleNumber: number;
  totalSubModules: number;
  subModuleTitle: string;
  overrideDescription?: string;
  overrideTitle?: string;
  quizScore?: number | null;
}

// ─────────────────────────────────────────────────────────────────────────
// Dekor: shape primitives kecil, semua putih transparan low-opacity biar
// selalu "emerald muda + putih" dan nggak pernah menang kontras lawan teks.
// Ditaruh cuma di "jalur aman": pita paling atas, paling bawah, atau jauh
// di kanan — tidak pernah di area tengah-kiri tempat judul duduk.
// ─────────────────────────────────────────────────────────────────────────

function Dot({ className }: { className: string }) {
  return <div className={`absolute rounded-full bg-white/20 ${className}`} />;
}

function RingOutline({ className }: { className: string }) {
  return (
    <div
      className={`absolute rounded-full border-2 border-white/25 ${className}`}
    />
  );
}

function DashedRing({ className }: { className: string }) {
  return (
    <div
      className={`absolute rounded-full border-2 border-dashed border-white/20 ${className}`}
    />
  );
}

function Wave({ className }: { className: string }) {
  return (
    <svg
      className={`absolute opacity-20 ${className}`}
      width="70"
      height="18"
      viewBox="0 0 48 12"
      fill="none"
      stroke="white"
      strokeWidth="2"
    >
      <path d="M0 6 C6 0, 12 12, 18 6 S30 0, 36 6 S42 12, 48 6" />
    </svg>
  );
}

function Zigzag({ className }: { className: string }) {
  return (
    <svg
      className={`absolute opacity-25 ${className}`}
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
    >
      <polyline points="2,6 10,14 18,6" />
    </svg>
  );
}

function Bolt({ className }: { className: string }) {
  return (
    <svg
      className={`absolute opacity-25 ${className}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="white"
    >
      <path d="M13 2L3 14h7l-1 8 10-12h-7z" />
    </svg>
  );
}

function PlusMark({ className }: { className: string }) {
  return (
    <svg
      className={`absolute opacity-25 ${className}`}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  );
}

function TriangleOutline({ className }: { className: string }) {
  return (
    <svg
      className={`absolute opacity-20 ${className}`}
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
    >
      <path d="M12 3 L21 19 L3 19 Z" strokeLinejoin="round" />
    </svg>
  );
}

function Diamond({ className }: { className: string }) {
  return (
    <div
      className={`absolute border-2 border-white/25 rotate-45 ${className}`}
    />
  );
}

function Sparkle({ className }: { className: string }) {
  return (
    <svg
      className={`absolute opacity-25 ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="white"
    >
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
    </svg>
  );
}

function HexOutline({ className }: { className: string }) {
  return (
    <svg
      className={`absolute opacity-20 ${className}`}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
    >
      <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" strokeLinejoin="round" />
    </svg>
  );
}

function DotCluster({ className }: { className: string }) {
  return (
    <div
      className={`absolute opacity-25 ${className}`}
      style={{
        backgroundImage: "radial-gradient(white 1.5px, transparent 1.5px)",
        backgroundSize: "10px 10px",
      }}
    />
  );
}

function Chevrons({ className }: { className: string }) {
  return (
    <svg
      className={`absolute opacity-20 ${className}`}
      width="34"
      height="20"
      viewBox="0 0 34 20"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="1,1 9,10 1,19" />
      <polyline points="13,1 21,10 13,19" />
    </svg>
  );
}

// Glow ambient — SELALU ADA di semua varian, ini yang bikin "dasar" tetap
// konsisten & rapi walau aksen dekor di atasnya beda-beda tiap materi.
function AmbientGlow() {
  return (
    <>
      <div className="absolute -top-16 right-[-40px] w-48 h-48 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-[-60px] left-[-40px] w-40 h-40 rounded-full bg-white/[0.08] blur-2xl" />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 16 varian aksen dekor. Tiap varian cuma nambah 2-3 shape kecil di jalur
// aman (pita atas, pita bawah, atau jauh di kanan) — nggak pernah nutupin
// area judul.
// ─────────────────────────────────────────────────────────────────────────
const DECOR_VARIANTS: Array<() => React.ReactNode> = [
  // 1
  () => (
    <>
      <Dot className="top-4 left-6 w-9 h-9" />
      <Zigzag className="top-10 left-20 rotate-[-6deg]" />
      <Wave className="top-6 left-[55%] -translate-x-1/2" />
    </>
  ),
  // 2
  () => (
    <>
      <RingOutline className="top-3 right-16 w-10 h-10" />
      <Bolt className="top-8 right-40 rotate-[18deg]" />
      <Dot className="bottom-8 left-24 w-4 h-4" />
    </>
  ),
  // 3
  () => (
    <>
      <DashedRing className="top-2 left-10 w-12 h-12" />
      <PlusMark className="top-12 left-40" />
      <Wave className="bottom-6 right-24 rotate-[6deg]" />
    </>
  ),
  // 4
  () => (
    <>
      <TriangleOutline className="top-4 right-12" />
      <Dot className="top-14 right-40 w-3 h-3" />
      <Chevrons className="bottom-8 left-16" />
    </>
  ),
  // 5
  () => (
    <>
      <Sparkle className="top-6 left-24" />
      <RingOutline className="bottom-10 right-16 w-9 h-9" />
      <Zigzag className="bottom-6 left-[45%] rotate-[10deg]" />
    </>
  ),
  // 6
  () => (
    <>
      <HexOutline className="top-4 right-24" />
      <Dot className="top-10 right-10 w-5 h-5" />
      <Wave className="bottom-8 left-20" />
    </>
  ),
  // 7
  () => (
    <>
      <Diamond className="top-6 left-8 w-6 h-6" />
      <DotCluster className="top-3 right-32 w-16 h-10 rounded-md" />
      <Bolt className="bottom-10 right-20 rotate-[-12deg]" />
    </>
  ),
  // 8
  () => (
    <>
      <PlusMark className="top-5 right-28" />
      <PlusMark className="top-10 right-14" />
      <Wave className="bottom-7 left-28 rotate-[-4deg]" />
    </>
  ),
  // 9
  () => (
    <>
      <Chevrons className="top-5 left-32" />
      <RingOutline className="top-2 right-8 w-7 h-7" />
      <Dot className="bottom-9 right-36 w-4 h-4" />
    </>
  ),
  // 10
  () => (
    <>
      <TriangleOutline className="bottom-8 left-14 rotate-180" />
      <Sparkle className="top-4 right-16" />
      <Zigzag className="top-9 left-[50%] rotate-[8deg]" />
    </>
  ),
  // 11
  () => (
    <>
      <DotCluster className="bottom-4 right-10 w-14 h-14 rounded-full" />
      <DashedRing className="top-3 left-16 w-9 h-9" />
      <Wave className="top-8 right-28" />
    </>
  ),
  // 12
  () => (
    <>
      <HexOutline className="bottom-9 left-24" />
      <Dot className="top-5 left-40 w-3.5 h-3.5" />
      <Chevrons className="top-3 right-20" />
    </>
  ),
  // 13
  () => (
    <>
      <Diamond className="bottom-7 right-16 w-5 h-5" />
      <Bolt className="top-6 left-36 rotate-[10deg]" />
      <RingOutline className="bottom-3 left-8 w-6 h-6" />
    </>
  ),
  // 14
  () => (
    <>
      <Sparkle className="bottom-10 left-32" />
      <PlusMark className="bottom-5 left-14" />
      <Wave className="top-5 right-36 rotate-[-6deg]" />
    </>
  ),
  // 15
  () => (
    <>
      <DotCluster className="top-3 left-28 w-12 h-8 rounded-md" />
      <TriangleOutline className="top-9 right-12" />
      <Dot className="bottom-8 right-28 w-4 h-4" />
    </>
  ),
  // 16
  () => (
    <>
      <Zigzag className="bottom-9 right-24 rotate-[14deg]" />
      <RingOutline className="top-4 left-44 w-8 h-8" />
      <PlusMark className="bottom-4 right-8" />
    </>
  ),
];

// Hash sederhana biar pemilihan varian stabil per konten yang sama, tapi
// kelihatan acak antar materi yang beda.
function hashToIndex(str: string, mod: number) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % mod;
}

export default function SubchapterHeroNavigation({
  moduleNumber,
  moduleTitle,
  subModuleNumber,
  totalSubModules,
  subModuleTitle,
  overrideDescription,
  overrideTitle,
  quizScore,
}: Props) {
  // 🔥 Ganti acak per materi/kelas yang lagi dibuka (bukan literally acak
  // tiap render, biar nggak "kedip" ganti dekor pas cuma quizScore yang
  // update). Kalau mau beneran full-random tiap kali komponen mount ulang,
  // tinggal ganti ini jadi useState(() => Math.floor(Math.random() * DECOR_VARIANTS.length)).
  const decorIndex = useMemo(
    () =>
      hashToIndex(
        `${moduleNumber}-${subModuleNumber}-${subModuleTitle}-${overrideTitle ?? ""}`,
        DECOR_VARIANTS.length,
      ),
    [moduleNumber, subModuleNumber, subModuleTitle, overrideTitle],
  );

  const DecorVariant = DECOR_VARIANTS[decorIndex];

  return (
    <section className="relative overflow-hidden bg-[#0CAF6F] text-white">
      {/* ================= DECORATIVE BACKGROUND ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AmbientGlow />
        <DecorVariant />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 px-6 py-6 w-full flex items-center justify-between">
        <div>
          <p className="text-xs md:text-sm text-white/90 font-medium mb-1.5 tracking-wide">
            {overrideDescription ?? (
              <>
                Modul {moduleNumber}
                <span className="mx-1">•</span>
                {moduleTitle}
                <span className="mx-1">•</span>
                {subModuleNumber} dari {totalSubModules} Materi
              </>
            )}
          </p>

          <h1 className="text-xl md:text-3xl font-bold leading-tight">
            {overrideTitle ?? subModuleTitle}
          </h1>
        </div>

        {/* SCORE BADGE */}
        {quizScore !== null && (
          <div className="ml-auto pr-2 text-right">
            <p className="text-sm font-semibold text-white mb-0.5">
              Skor Anda:
            </p>
            <p className="text-2xl font-extrabold text-white tracking-tight">
              {quizScore}/100
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
