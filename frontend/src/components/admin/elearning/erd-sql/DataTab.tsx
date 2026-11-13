"use client";

import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { type Row, loadRows } from "./loadRows";
import type { ColumnDef, TableDef } from "./types";

const PAGE_SIZES = [10, 25, 50, 100];

const isDecimal = (col: ColumnDef) => col.type.startsWith("DECIMAL");

function renderCell(cell: Row[number], col: ColumnDef) {
  if (cell === null) return <span className="italic text-gray-400">NULL</span>;
  if (typeof cell === "number" && isDecimal(col)) return cell.toLocaleString("id-ID");
  return String(cell);
}

export default function DataTab({ table }: { table: TableDef }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState<{ index: number; dir: "asc" | "desc" } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    setError(false);
    loadRows(table.name)
      .then((r) => !cancelled && setRows(r))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [table.name]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    let out = q
      ? rows.filter((r) => r.some((c) => c !== null && String(c).toLowerCase().includes(q)))
      : rows;
    if (sort) {
      const { index, dir } = sort;
      out = [...out].sort((a, b) => {
        const x = a[index];
        const y = b[index];
        if (x === y) return 0;
        if (x === null) return 1; // NULL selalu di bawah
        if (y === null) return -1;
        const cmp =
          typeof x === "number" && typeof y === "number"
            ? x - y
            : String(x).localeCompare(String(y), "id");
        return dir === "asc" ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  const toggleSort = (index: number) =>
    setSort((prev) =>
      prev?.index !== index
        ? { index, dir: "asc" }
        : prev.dir === "asc"
          ? { index, dir: "desc" }
          : null,
    );

  if (error) return <p className="text-sm text-red-600">Gagal memuat data tabel {table.name}.</p>;
  if (!rows) return <p className="text-sm text-gray-500">Memuat {table.rows.toLocaleString("id-ID")} baris...</p>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-40 flex-1">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={`Cari di ${table.name}...`}
            className="w-full rounded-md border border-gray-300 bg-gray-50 py-1.5 pl-7 pr-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          aria-label="Baris per halaman"
          className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n} / halaman
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-600">
        Total data tabel:{" "}
        <span className="font-semibold text-emerald-700">{rows.length.toLocaleString("id-ID")} baris</span>
        {query && (
          <>
            {" "}· cocok dengan pencarian:{" "}
            <span className="font-semibold">{filtered.length.toLocaleString("id-ID")}</span>
          </>
        )}
      </p>

      <div className="max-h-[28rem] overflow-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-left text-xs">
          <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-400">#</th>
              {table.columns.map((c, i) => (
                <th key={c.name} className="whitespace-nowrap px-3 py-2 font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleSort(i)}
                    className="inline-flex items-center gap-1 hover:text-emerald-700"
                    aria-label={`Urutkan berdasarkan ${c.name}`}
                  >
                    {c.name}
                    {sort?.index === i &&
                      (sort.dir === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      ))}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={table.columns.length + 1} className="px-3 py-6 text-center text-gray-500">
                  Tidak ada data yang cocok.
                </td>
              </tr>
            ) : (
              visible.map((row, i) => (
                <tr key={start + i} className="hover:bg-emerald-50/50">
                  <td className="px-3 py-1.5 text-gray-400">{start + i + 1}</td>
                  {row.map((cell, j) => (
                    <td key={j} className="whitespace-nowrap px-3 py-1.5 font-mono text-gray-700">
                      {renderCell(cell, table.columns[j])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
        <span>
          {filtered.length === 0
            ? "0 baris"
            : `${(start + 1).toLocaleString("id-ID")}–${Math.min(start + pageSize, filtered.length).toLocaleString("id-ID")} dari ${filtered.length.toLocaleString("id-ID")}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
            aria-label="Halaman sebelumnya"
            className="rounded-md border border-gray-300 p-1 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-1">
            {current} / {totalPages}
          </span>
          <button
            type="button"
            disabled={current >= totalPages}
            onClick={() => setPage(current + 1)}
            aria-label="Halaman berikutnya"
            className="rounded-md border border-gray-300 p-1 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}