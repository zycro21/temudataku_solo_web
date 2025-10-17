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
  skillFilter,
  searchQuery,
  onProgramChange,
  onSkillChange,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: MentorFeedbackFiltersProps) {
  const programOptions = [
    "Semua",
    "Mentoring 1 on 1",
    "Mentoring Group",
    "Bootcamp",
    "Short Class",
    "Live Class",
  ];

  const skillOptions = [
    "Semua",
    "Data Analysis",
    "Data Science",
    "Machine Learning",
    "Lain-Lain",
  ];

  return (
    <div className="mb-6">
      {/* Search Input + Dropdown */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan program dan keterampilan"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          />
        </div>
        {/* Dropdown untuk pilih tampilan */}
        <select
          value={viewMode}
          onChange={(e) => onViewModeChange(e.target.value as "table" | "grid")}
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="table">Tabel</option>
          <option value="grid">Grid</option>
        </select>
      </div>

      {/* Filter Jenis Program */}
      <div className="flex items-center mb-4 gap-x-3">
        <p className="text-lg font-semibold text-gray-700 w-38">
          Jenis Program:
        </p>
        <div className="flex flex-wrap gap-2">
          {programOptions.map((option) => (
            <button
              key={option}
              onClick={() => onProgramChange(option)}
              className={`px-4 py-2 rounded-lg text-md font-medium transition-colors ${
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

      {/* Filter Jenis Keterampilan */}
      <div className="flex items-center mb-4 gap-x-3">
        <p className="text-lg font-semibold text-gray-700 w-48">
          Jenis Keterampilan:
        </p>
        <div className="flex flex-wrap gap-2">
          {skillOptions.map((option) => (
            <button
              key={option}
              onClick={() => onSkillChange(option)}
              className={`px-4 py-2 rounded-lg text-md font-medium transition-colors ${
                skillFilter === option
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
