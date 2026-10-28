"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ClipboardList, Search } from "lucide-react";
import {
  FORM_API,
  FormCategory,
  FormType,
  getApiErrorMessage,
  useDebouncedValue,
} from "./shared";

interface Props {
  type: FormType;
  selectedId: string;
  onSelect: (c: FormCategory) => void;
  /** Naikkan nilainya dari luar (mis. setelah buat jenis) untuk memuat ulang. */
  refreshKey: number;
}

export default function CategoryStep({
  type,
  selectedId,
  onSelect,
  refreshKey,
}: Props) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const [items, setItems] = useState<FormCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    axios
      .get(`${FORM_API}/categories`, {
        params: { type, search: debouncedSearch || undefined },
        withCredentials: true,
        signal: controller.signal,
      })
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setItems(data?.items ?? []);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setItems([]);
        setError(getApiErrorMessage(err, "Gagal memuat jenis form"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [type, debouncedSearch, refreshKey, reloadTick]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari jenis form..."
          aria-label="Cari jenis form"
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div role="radiogroup" aria-label="Jenis form" className="space-y-2">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[4.5rem] animate-pulse rounded-xl border border-gray-100 bg-gray-50"
            />
          ))}

        {!loading && error && (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => setReloadTick((n) => n + 1)}
              className="mt-3 rounded-lg border border-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
            >
              Coba lagi
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
            {debouncedSearch
              ? "Tidak ada jenis yang cocok dengan pencarian."
              : 'Belum ada jenis form. Klik "Buat Jenis" untuk membuat yang pertama.'}
          </div>
        )}

        {!loading &&
          !error &&
          items.map((c) => {
            const active = c.id === selectedId;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelect(c)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  active
                    ? "border-emerald-500 bg-emerald-50/40"
                    : "border-gray-200 bg-white hover:border-emerald-300"
                }`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <ClipboardList className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-gray-900">
                    {c.name}
                  </span>
                  {c.description && (
                    <span className="mt-0.5 block truncate text-xs text-gray-500">
                      {c.description}
                    </span>
                  )}
                </span>
                <span className="shrink-0 rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  {c.formCount.toLocaleString("id-ID")} form
                </span>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    active ? "border-emerald-500" : "border-gray-300"
                  }`}
                >
                  {active && (
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  )}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
}
