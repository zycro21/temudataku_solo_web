"use client";

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
  return (
    <section className="relative overflow-hidden bg-[#0CAF6F] text-white">
      {/* ================= DECORATIVE BACKGROUND ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* kiri atas - lingkaran */}
        <div className="absolute top-4 left-6 w-9 h-9 rounded-full bg-white/20" />

        {/* kiri atas agak geser - zigzag */}
        <svg
          className="absolute top-10 left-20 opacity-25 rotate-[-6deg]"
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
        >
          <polyline points="2,6 10,14 18,6" />
        </svg>

        {/* atas tengah - wave */}
        <svg
          className="absolute top-6 left-[55%] -translate-x-1/2 opacity-20"
          width="70"
          height="18"
          viewBox="0 0 48 12"
          fill="none"
          stroke="white"
          strokeWidth="2"
        >
          <path d="M0 6 C6 0, 12 12, 18 6 S30 0, 36 6 S42 12, 48 6" />
        </svg>

        {/* kanan atas - petir */}
        <svg
          className="absolute top-8 right-10 opacity-30 rotate-[18deg]"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M13 2L3 14h7l-1 8 10-12h-7z" />
        </svg>

        {/* kiri tengah bawah - titik */}
        <div className="absolute bottom-10 left-16 w-4 h-4 rounded-full bg-white/20" />

        {/* kanan bawah - wave */}
        <svg
          className="absolute bottom-8 right-24 opacity-20 rotate-[6deg]"
          width="64"
          height="16"
          viewBox="0 0 40 10"
          fill="none"
          stroke="white"
          strokeWidth="2"
        >
          <path d="M0 5 C5 0, 10 10, 15 5 S25 0, 30 5 S35 10, 40 5" />
        </svg>

        {/* soft blur kanan */}
        <div className="absolute -top-16 right-[-40px] w-48 h-48 rounded-full bg-white/10" />

        {/* soft blur kiri bawah */}
        <div className="absolute bottom-[-60px] left-[-40px] w-40 h-40 rounded-full bg-white/08" />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 px-8 py-10 w-full flex items-center justify-between">
        <div>
          <p className="text-sm md:text-base text-white/90 font-medium mb-2 tracking-wide">
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

          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            {overrideTitle ?? subModuleTitle}
          </h1>
        </div>

        {/* SCORE BADGE */}
        {quizScore !== null && (
          <div className="ml-auto pr-2 text-right">
            <p className="text-lg font-semibold text-white mb-1">Skor Anda:</p>
            <p className="text-4xl font-extrabold text-white tracking-tight">
              {quizScore}/100
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
