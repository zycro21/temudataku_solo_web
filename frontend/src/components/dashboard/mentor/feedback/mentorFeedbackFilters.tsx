"use client";

import { Search } from "lucide-react";

interface MentorFeedbackFiltersProps {
  programFilter: string;
  skillFilter: string;
  searchQuery: string;
  onProgramChange: (value: string) => void;
  onSkillChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (value: "table" | "grid") => void;
}

export default function MentorFeedbackFilters({
  programFilter,
  searchQuery,
  onProgramChange,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: MentorFeedbackFiltersProps) {
  const programOptions = [
    "Semua",
    "Mentoring 1 on 1",
    "Mentoring Group",
    "Bootcamp",
  ];

  return (
    <div className="mb-4">
      {/* Search Input + Dropdown */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan program dan keterampilan"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          />
        </div>
        {/* Dropdown untuk pilih tampilan */}
        <select
          value={viewMode}
          onChange={(e) => onViewModeChange(e.target.value as "table" | "grid")}
          className="border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="table">Tabel</option>
          <option value="grid">Grid</option>
        </select>
      </div>

      {/* Filter Jenis Program */}
      <div className="flex items-center mb-3 gap-x-2">
        <p className="text-sm font-semibold text-gray-700 w-32">
          Jenis Program:
        </p>
        <div className="flex flex-wrap gap-2">
          {programOptions.map((option) => (
            <button
              key={option}
              onClick={() => onProgramChange(option)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
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
