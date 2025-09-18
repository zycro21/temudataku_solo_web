"use client";

import { Search } from "lucide-react";

interface ProjectFiltersProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function ProjectFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: ProjectFiltersProps) {
  const statusOptions = [
    "Semua",
    "Lolos Tinjauan",
    "Belum Ditinjau",
    "Perlu Revisi",
  ];

  return (
    <div className="mb-1 pb-4">
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama dan status review"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
        />
      </div>

      {/* Filter Status Sesi */}
      <div className="flex items-center gap-x-2">
        <p className="text-md font-normal text-gray-600 w-24">Status Sesi:</p>
        <div className="flex flex-wrap gap-3">
          {statusOptions.map((option) => (
            <button
              key={option}
              onClick={() => onStatusChange(option)}
              className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${
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
