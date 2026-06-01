"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";

interface Filters {
  jobTitle: string;
  country: string;
  level: string;
  workType: string;
}

interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onApply: () => void;
  onReset: () => void;
  countries: string[];
  loading?: boolean;
}

const LEVELS = ["Junior", "Senior", "Manager"];
const WORK_TYPES = ["Onsite", "Hybrid", "Remote"];

export default function FilterPanel({
  filters,
  onFilterChange,
  onApply,
  onReset,
  countries,
  loading,
}: FilterPanelProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={16} className="text-emerald-600" />
        <h2 className="text-sm font-semibold text-gray-800 tracking-wide uppercase">
          Query Parameters
        </h2>
      </div>

      {/* Job Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">
          Job Title <span className="text-gray-400 font-normal">(q=)</span>
        </label>
        <input
          type="text"
          value={filters.jobTitle}
          onChange={(e) => onFilterChange("jobTitle", e.target.value)}
          placeholder="e.g. Data Scientist"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
        />
      </div>

      {/* Location / Country */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">
          Location <span className="text-gray-400 font-normal">(country=)</span>
        </label>
        <select
          value={filters.country}
          onChange={(e) => onFilterChange("country", e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white appearance-none transition"
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Level */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">
          Level <span className="text-gray-400 font-normal">(level=)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() =>
                onFilterChange("level", filters.level === lvl ? "" : lvl)
              }
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                filters.level === lvl
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-600"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Work Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">
          Type <span className="text-gray-400 font-normal">(type=)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {WORK_TYPES.map((wt) => (
            <button
              key={wt}
              onClick={() =>
                onFilterChange("workType", filters.workType === wt ? "" : wt)
              }
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                filters.workType === wt
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-600"
              }`}
            >
              {wt}
            </button>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onApply}
          disabled={loading}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition"
        >
          {loading ? "Loading..." : "Apply Filters"}
        </button>
        <button
          onClick={onReset}
          className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-300 transition"
          title="Reset"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </div>
  );
}
