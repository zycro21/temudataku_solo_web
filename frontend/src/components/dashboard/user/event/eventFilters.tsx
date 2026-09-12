"use client";

import { Search } from "lucide-react";
import type { Category } from "@/app/dashboard/user/event/page"; // sesuaikan path sesuai struktur kamu

interface EventFiltersProps {
  categoryFilter: Category;
  searchQuery: string;
  onCategoryChange: (value: Category) => void;
  onSearchChange: (value: string) => void;
}

export default function EventFilters({
  categoryFilter,
  searchQuery,
  onCategoryChange,
  onSearchChange,
}: EventFiltersProps) {
  const categoryOptions: Category[] = ["Semua", "Berbayar", "Gratis"];

  return (
    // 🔥 DIUBAH: mb-6 pb-4 → mb-4 pb-3 sm:mb-6 sm:pb-4, sedikit lebih
    // rapat di mobile, balik PERSIS mulai sm: ke atas.
    <div className="mb-4 pb-3 sm:mb-6 sm:pb-4">
      {/* Search Input */}
      {/* 🔥 DIUBAH: mb-6 → mb-4 sm:mb-6, py-2 → py-2.5 sm:py-2 (tap
          target sedikit lebih besar di mobile). */}
      <div className="relative mb-4 sm:mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 sm:py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
        />
      </div>

      {/* Jenis Event */}
      {/* 🔥 DIUBAH: dulu selalu "flex items-center" (label + chip 1
          baris). Di mobile label "Pengerjaan:" disembunyikan (chip sudah
          jelas konteksnya persis di bawah search bar) dan chip
          di-scroll horizontal — pola sama seperti feedbackFilters.tsx /
          sertifikatFilters.tsx, termasuk scrollbar hidden + fade
          gradient kanan. Mulai sm: ke atas balik PERSIS layout original
          (label tampil, chip flex-wrap, tanpa scroll). */}
      <div className="flex flex-col sm:flex-row sm:items-center mb-3 gap-2 sm:gap-0">
        <p className="hidden sm:block text-md font-bold text-gray-600 w-28">
          Pengerjaan:
        </p>

        <div className="relative min-w-0 flex-1 sm:flex-none">
          <div
            className="flex gap-2 sm:gap-3 sm:flex-wrap overflow-x-auto sm:overflow-visible whitespace-nowrap pb-1 sm:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categoryOptions.map((option) => (
              <button
                key={option}
                onClick={() => onCategoryChange(option)}
                className={`shrink-0 sm:shrink px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === option
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
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
