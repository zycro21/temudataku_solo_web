"use client";

import { Search } from "lucide-react";

interface PengumpulanFiltersProps {
  programFilter: string;
  statusFilter: string;
  searchQuery: string;
  onProgramChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export default function PengumpulanFilters({
  programFilter,
  statusFilter,
  searchQuery,
  onProgramChange,
  onStatusChange,
  onSearchChange,
}: PengumpulanFiltersProps) {
  const programOptions = ["Semua", "Bootcamp", "Short Class", "Live Class"];
  const statusOptions = [
    "Semua",
    "Belum Dikumpulkan",
    "Selesai",
    "Sudah Direview",
  ];

  return (
    <div className="mb-6 border-b pb-4">
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama dan program"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
        />
      </div>

      {/* Jenis Program */}
      <div className="flex items-center mb-3">
        <p className="text-md font-bold text-gray-600 w-32">Jenis Program:</p>
        <div className="flex flex-wrap gap-2">
          {programOptions.map((option) => (
            <button
              key={option}
              onClick={() => onProgramChange(option)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                programFilter === option
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Pengumpulan */}
      <div className="flex items-center">
        <p className="text-md font-bold text-gray-600 w-32">Pengumpulan:</p>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option}
              onClick={() => onStatusChange(option)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === option
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
