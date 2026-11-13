"use client";

import { Database, Info } from "lucide-react";
import {
  DATASET_PERIOD,
  DATASET_TAG,
  NOTES,
  RELATIONS,
  TABLES,
  TOTAL_ROWS,
} from "./erdSqlData";
import CodeBlock from "./CodeBlock";

export default function ErdIntro() {
  const stats = [
    { label: "Tabel", value: TABLES.length },
    { label: "Relasi", value: RELATIONS.length },
    { label: "Total baris", value: TOTAL_ROWS.toLocaleString("id-ID") },
    { label: "Periode checkout", value: DATASET_PERIOD },
  ];

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              ERD Data SQL: TemuShop
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-600">
              Dataset latihan SQL untuk e-learning, dari katalog dan checkout
              sampai pembayaran, pengiriman, dan ulasan. Klik tabel pada diagram
              untuk melihat kolom, relasi, data, dan contoh penerapan SQL.
            </p>
          </div>
        </div>
        <div className="w-full lg:w-72">
          <p className="mb-1 text-xs font-medium text-gray-500">
            Baris pertama query di fitur coding, jika ingin menggunakan dataset dibawah
          </p>
          <CodeBlock code={DATASET_TAG} successMessage="Tag dataset disalin" />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-gray-50 px-3 py-2">
            <dt className="text-xs text-gray-500">{s.label}</dt>
            <dd className="text-sm font-bold text-gray-800">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ErdNotes() {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        <Info className="h-4 w-4 text-emerald-600" />
        Catatan penting saat menulis query
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
        {NOTES.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </section>
  );
}
