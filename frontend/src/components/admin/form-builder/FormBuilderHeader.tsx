"use client";

import { ChevronDown, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormType, SortOrder, StatusFilter, TYPE_LABEL } from "./shared";

interface Props {
  type: FormType;
  onTypeChange: (v: FormType) => void;
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (v: StatusFilter) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (v: SortOrder) => void;
  onCreateClick: () => void;
}

const TABS: FormType[] = ["EVENT", "NON_EVENT"];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Diarsipkan" },
];

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "desc", label: "Terbaru" },
  { value: "asc", label: "Terlama" },
];

function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <div className="relative w-full sm:w-44">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs text-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

export default function FormBuilderHeader({
  type,
  onTypeChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortOrder,
  onSortOrderChange,
  onCreateClick,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Judul + tombol */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Form Builder</h1>
          <p className="mt-0.5 text-xs text-gray-500">
            Kelola form untuk event non-kelas, presensi, survei, feedback,
            pendaftaran, dan lainnya.
          </p>
        </div>
        <Button
          onClick={onCreateClick}
          className="shrink-0 bg-emerald-500 text-white hover:bg-emerald-600"
        >
          <Plus className="mr-1 h-4 w-4" />
          Buat Form
        </Button>
      </div>

      {/* Tab tipe form */}
      <div role="tablist" className="flex gap-6 border-b border-gray-200">
        {TABS.map((t) => {
          const active = t === type;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              onClick={() => onTypeChange(t)}
              className={`-mb-px border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
                active
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {TYPE_LABEL[t]}
            </button>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <FilterSelect
          label="Filter status"
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={STATUS_OPTIONS}
        />
        <FilterSelect
          label="Urutkan"
          value={sortOrder}
          onChange={onSortOrderChange}
          options={SORT_OPTIONS}
        />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari judul form atau event..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}
