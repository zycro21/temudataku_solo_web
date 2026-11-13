"use client";

import { GROUP_STYLES } from "./groupStyles";
import type { TableDef } from "./types";
import KeyBadge from "./KeyBadge";

interface Props {
  table: TableDef;
  selected: boolean;
  related: boolean;
  dimmed: boolean;
  onSelect: () => void;
  registerRef: (el: HTMLDivElement | null) => void;
}

export default function TableCard({
  table,
  selected,
  related,
  dimmed,
  onSelect,
  registerRef,
}: Props) {
  const style = GROUP_STYLES[table.group];

  return (
    <div
      ref={registerRef}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Tabel ${table.name}, ${table.rows} baris. Klik untuk melihat detail`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      style={{ gridColumn: table.col, gridRow: table.row }}
      className={`self-start cursor-pointer rounded-xl border bg-white text-left shadow-sm outline-none transition-all duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-emerald-500 ${
        selected
          ? "border-emerald-500 ring-2 ring-emerald-500 shadow-lg"
          : related
            ? "border-emerald-300"
            : "border-gray-200"
      } ${dimmed ? "opacity-40" : "opacity-100"}`}
    >
      <div
        className={`flex items-center justify-between gap-2 rounded-t-xl px-3 py-2 text-white ${style.header}`}
      >
        <span className="truncate text-sm font-semibold">{table.name}</span>
        <span className="shrink-0 rounded-full bg-white/25 px-2 text-xs">
          {table.rows.toLocaleString("id-ID")} baris
        </span>
      </div>
      <ul className="divide-y divide-gray-100 py-1">
        {table.columns.map((col) => (
          <li
            key={col.name}
            className="flex items-center justify-between gap-2 px-3 py-1"
          >
            <span className="truncate font-mono text-xs text-gray-700">
              {col.name}
            </span>
            <span className="flex shrink-0 gap-1">
              {col.keys.map((k) => (
                <KeyBadge key={k} flag={k} />
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
