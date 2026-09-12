"use client";

import { Search } from "lucide-react";

interface FeedbackFiltersProps {
  programFilter: string;
  searchQuery: string;
  onProgramChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export default function FeedbackFilters({
  programFilter,
  searchQuery,
  onProgramChange,
  onSearchChange,
}: FeedbackFiltersProps) {
  // value = data dari backend, label = teks yang ditampilkan
  const programOptions = [
    { label: "Semua", value: "Semua" },
    { label: "Bootcamp", value: "bootcamp" },
    { label: "Mentoring 1 on 1", value: "one-on-one" },
    { label: "Mentoring Group", value: "group" },
    // { label: "Short Class", value: "shortclass" },
    // { label: "Live Class", value: "live class" },
  ];

  return (
    <div className="mb-4 border-b pb-3">
      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        {/* 🔥 DIUBAH: py-1.5 → py-2 sm:py-1.5, text-xs → text-sm sm:text-xs
            — tap target & keterbacaan sedikit lebih baik di mobile, balik
            PERSIS ukuran original mulai sm: ke atas. */}
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
          "Jenis Program:" di atas chip. Sekarang di mobile label
          disembunyikan (chip sudah cukup jelas konteksnya karena
          langsung di bawah search bar) dan chip-nya di-scroll horizontal
          (overflow-x-auto, whitespace-nowrap, tanpa wrap) — lebih hemat
          tinggi & konsisten sama pola tab/filter di app mobile. Mulai
          sm: ke atas balik PERSIS layout original (label tampil, chip
          flex-wrap). */}
      {/* Jenis Program */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
        <p className="hidden sm:block text-xs font-semibold text-gray-600 shrink-0 sm:w-32">
          Jenis Program:
        </p>

        {/* 🔥 DIUBAH: wrapper "relative" ditambah buat nampung fade
            gradient di kanan (cuma mobile). Scrollbar dihilangkan total
            (dulu pakai class "scroll-thin" yang ternyata bukan utility
            valid, jadi scrollbar default browser tetap muncul tebal) —
            sekarang pakai kombinasi inline style (Firefox/IE) + arbitrary
            variant Tailwind buat WebKit (Chrome/Safari). */}
        <div className="relative min-w-0 flex-1 sm:flex-none">
          <div
            className="flex gap-1.5 overflow-x-auto whitespace-nowrap pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {programOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onProgramChange(option.value)}
                className={`
                px-2.5 py-1
                rounded-md
                text-xs font-medium
                whitespace-nowrap
                shrink-0 sm:shrink
                transition-colors
                ${
                  programFilter === option.value
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* 🔥 BARU: fade gradient kanan, CUMA mobile (sm:hidden) —
              penanda visual "masih bisa di-scroll ke kanan", pointer-events
              none biar nggak menghalangi tap ke chip di belakangnya. */}
          <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>
    </div>
  );
}
