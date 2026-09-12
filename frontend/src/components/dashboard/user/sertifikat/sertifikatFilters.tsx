"use client";

import { Search } from "lucide-react";

interface SertifikatFiltersProps {
  programFilter: string;
  searchQuery: string;
  onProgramChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export default function SertifikatFilters({
  programFilter,
  searchQuery,
  onProgramChange,
  onSearchChange,
}: SertifikatFiltersProps) {
  const programOptions = ["Semua", "Bootcamp", "E-Learning"];

  return (
    <div className="mb-3 pb-3">
      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        {/* 🔥 DIUBAH: py-1.5 → py-2 sm:py-1.5, text-xs → text-sm sm:text-xs
            — tap target sedikit lebih besar di mobile, balik PERSIS
            ukuran original mulai sm: ke atas. */}
        <input
          type="text"
          placeholder="Cari berdasarkan nama dan program"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
          w-full
          pl-8 pr-3 py-2 sm:py-1.5
          border rounded-md
          focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500
          text-sm sm:text-xs
        "
        />
      </div>

      {/* Jenis Program */}
      {/* 🔥 DIUBAH: dulu selalu "flex-col sm:flex-row" dengan label
          "Jenis Program:" tampil di semua ukuran. Di mobile sekarang
          label disembunyikan (chip sudah cukup jelas persis di bawah
          search bar) dan chip di-scroll horizontal — konsisten sama pola
          yang sudah dipakai di feedbackFilters.tsx. Scrollbar disembunyikan
          total (kombinasi arbitrary variant WebKit + inline style
          Firefox/IE) + fade gradient kanan sebagai penanda masih ada
          chip lain di luar layar. Mulai sm: ke atas balik PERSIS layout
          original (label tampil, chip flex-wrap, tanpa scroll). */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
        <p className="hidden sm:block text-xs font-semibold text-gray-600 shrink-0 sm:w-32">
          Jenis Program:
        </p>

        <div className="relative min-w-0 flex-1 sm:flex-none">
          <div
            className="flex gap-1.5 overflow-x-auto whitespace-nowrap pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {programOptions.map((option) => (
              <button
                key={option}
                onClick={() => onProgramChange(option)}
                className={`
                px-2.5 py-1
                rounded-md
                text-xs font-medium
                whitespace-nowrap
                shrink-0 sm:shrink
                transition-colors
                ${
                  programFilter === option
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>
    </div>
  );
}
