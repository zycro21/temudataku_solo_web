"use client";

import { Search } from "lucide-react";

interface PracticeFiltersProps {
  levelFilter: string;
  statusFilter: string;
  searchQuery: string;
  onLevelChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export default function PracticeFilters({
  levelFilter,
  statusFilter,
  searchQuery,
  onLevelChange,
  onStatusChange,
  onSearchChange,
}: PracticeFiltersProps) {
  const levelOptions = ["Semua", "Pemula", "Menengah", "Ahli"];
  const statusOptions = [
    "Semua",
    "Belum Dikerjakan",
    "Selesai",
    "Sudah Direview",
  ];

  return (
    <div className="mb-1 pb-4">
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama practice"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
        />
      </div>

      {/* Filter Level */}
      <div className="flex items-center mb-4 gap-x-2">
        <p className="text-md font-bold text-gray-600 w-15">Level:</p>
        <div className="flex flex-wrap gap-6">
          {levelOptions.map((option) => (
            <button
              key={option}
              onClick={() => onLevelChange(option)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                levelFilter === option
                  ? "bg-emerald-500 text-white scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Status */}
      <div className="flex items-center mb-4 gap-x-2">
        <p className="text-md font-bold text-gray-600 w-18">Status:</p>
        <div className="flex flex-wrap gap-6">
          {statusOptions.map((option) => (
            <button
              key={option}
              onClick={() => onStatusChange(option)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                statusFilter === option
                  ? "bg-emerald-500 text-white scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
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
