"use client";

import { Search } from "lucide-react";

interface ReportFiltersProps {
  statusFilter: string;
  programFilter: string;
  searchQuery: string;
  onStatusChange: (value: string) => void;
  onProgramChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export default function ReportFilters({
  statusFilter,
  programFilter,
  searchQuery,
  onStatusChange,
  onProgramChange,
  onSearchChange,
}: ReportFiltersProps) {
  const statusOptions = ["Semua", "Selesai", "Belum Lengkap", "Belum Diisi"];
  const programOptions = [
    "Semua",
    "Mentoring 1 on 1",
    "Mentoring Group",
    "Bootcamp",
    "Short Class",
    "Live Class",
  ];

  return (
    <div className="mb-6">
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama, program, dan keterampilan"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
        />
      </div>

      {/* Filter Status Sesi */}
      <div className="flex items-center mb-4 gap-x-3">
        <p className="text-sm font-medium text-gray-700 w-22">Status Sesi:</p>
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

      {/* Filter Jenis Program */}
      <div className="flex items-center mb-4 gap-x-3">
        <p className="text-sm font-medium text-gray-700 w-28">Jenis Program:</p>
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
    </div>
  );
}
