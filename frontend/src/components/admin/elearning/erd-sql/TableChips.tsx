"use client";

import { GROUP_STYLES } from "./groupStyles";
import type { TableDef } from "./types";

export default function TableChips({
  tables,
  selected,
  onSelect,
}: {
  tables: TableDef[];
  selected: string | null;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Pilih tabel">
      {tables.map((t) => {
        const active = selected === t.name;
        return (
          <button
            key={t.name}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(t.name)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              active
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-emerald-400 hover:bg-emerald-50"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${active ? "bg-white" : GROUP_STYLES[t.group].dot}`} />
            {t.name}
          </button>
        );
      })}
    </div>
  );
}