"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { RELATIONS } from "./erdSqlData";
import { GROUP_STYLES } from "./groupStyles";
import type { TableDef } from "./types";
import DataTab from "./DataTab";
import { ColumnsTab, QueriesTab, RelationsTab } from "./DetailTabs";

type TabKey = "kolom" | "relasi" | "data" | "query";

const TABS: { key: TabKey; label: string }[] = [
  { key: "kolom", label: "Kolom" },
  { key: "relasi", label: "Relasi" },
  { key: "data", label: "Data" },
  { key: "query", label: "Contoh Penerapan SQL" },
];

interface Props {
  table: TableDef;
  onClose: () => void;
  onSelectTable: (name: string) => void;
}

export default function TableDetailPanel({
  table,
  onClose,
  onSelectTable,
}: Props) {
  const [tab, setTab] = useState<TabKey>("kolom");
  const style = GROUP_STYLES[table.group];

  // Reset ke tab Kolom setiap pindah tabel
  useEffect(() => {
    setTab("kolom");
  }, [table.name]);

  const relCount = RELATIONS.filter(
    (r) => r.parent === table.name || r.child === table.name,
  ).length;
  const stats = [
    { label: "Kolom", value: table.columns.length },
    { label: "Baris", value: table.rows.toLocaleString("id-ID") },
    { label: "Relasi", value: relCount },
  ];

  return (
    <section
      aria-label={`Detail tabel ${table.name}`}
      className="flex min-h-0 flex-1 flex-col bg-white"
    >
      <header className={`px-4 py-3 text-white ${style.header}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs opacity-90">{style.label}</p>
            <DialogTitle className="text-xl font-bold text-white">
              {table.name}
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail"
            className="rounded-md p-1 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-sm">{table.summary}</p>
      </header>

      <div className="border-b border-gray-200 px-4 py-3">
        <p className="text-sm text-gray-600">{table.role}</p>
        <dl className="mt-2 grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg bg-gray-50 px-3 py-1.5 text-center"
            >
              <dt className="text-xs text-gray-500">{s.label}</dt>
              <dd className="text-sm font-bold text-gray-800">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div role="tablist" className="flex border-b border-gray-200 px-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-emerald-500 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-emerald-600"
            }`}
          >
            {t.label}
            {t.key === "data" && (
              <span className="ml-1 rounded-full bg-gray-100 px-1.5 text-xs text-gray-600">
                {table.rows.toLocaleString("id-ID")}
              </span>
            )}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto p-4">
        {tab === "kolom" && (
          <ColumnsTab table={table} onSelectTable={onSelectTable} />
        )}
        {tab === "relasi" && (
          <RelationsTab table={table} onSelectTable={onSelectTable} />
        )}
        {tab === "data" && <DataTab table={table} />}
        {tab === "query" && <QueriesTab table={table} />}
      </div>
    </section>
  );
}
