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
        <input
          type="text"
          placeholder="Cari berdasarkan nama dan program"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
          w-full
          pl-8 pr-3 py-1.5
          border rounded-md
          focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500
          text-xs
        "
        />
      </div>

      {/* Jenis Program */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
        <p className="text-xs font-semibold text-gray-600 shrink-0 sm:w-32">
          Jenis Program:
        </p>

        <div className="flex flex-wrap gap-1.5">
          {programOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onProgramChange(option.value)}
              className={`
              px-2.5 py-1
              rounded-md
              text-xs font-medium
              whitespace-nowrap
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
      </div>
    </div>
  );
}
