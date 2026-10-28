"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { StatusBadge, TypeBadge } from "./FormBadges";
import FormRowActions from "./FormRowActions";
import {
  FORM_API,
  FormListItem,
  FormType,
  PAGE_SIZE,
  Pagination,
  SortOrder,
  StatusFilter,
  formatDate,
  formatTime,
  getApiErrorMessage,
  useDebouncedValue,
} from "./shared";

interface Props {
  type: FormType;
  search: string;
  statusFilter: StatusFilter;
  sortOrder: SortOrder;
  page: number;
  onPageChange: (p: number) => void;
  /** Naikkan nilainya dari luar (mis. setelah buat form) untuk memuat ulang. */
  refreshKey: number;
}

// Warna ikon baris, dipilih stabil dari id form
const ICON_STYLES = [
  "bg-violet-100 text-violet-600",
  "bg-blue-100 text-blue-600",
  "bg-teal-100 text-teal-600",
  "bg-emerald-100 text-emerald-600",
];
function iconStyle(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ICON_STYLES[h % ICON_STYLES.length];
}

// Nomor halaman dengan elipsis, mis. [1, "…", 4, 5, 6, "…", 12]
function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export default function FormBuilderTable({
  type,
  search,
  statusFilter,
  sortOrder,
  page,
  onPageChange,
  refreshKey,
}: Props) {
  const [items, setItems] = useState<FormListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const debouncedSearch = useDebouncedValue(search.trim());

  useEffect(() => {
    // AbortController: kalau filter berubah cepat, respons lama dibuang
    // supaya tidak menimpa hasil terbaru.
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    axios
      .get(`${FORM_API}/forms`, {
        params: {
          type,
          status: statusFilter || undefined,
          search: debouncedSearch || undefined,
          sortBy: "updatedAt",
          sortOrder,
          page,
          limit: PAGE_SIZE,
        },
        withCredentials: true,
        signal: controller.signal,
      })
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setItems(data?.items ?? []);
        setPagination(data?.pagination ?? null);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setItems([]);
        setPagination(null);
        setError(getApiErrorMessage(err, "Gagal memuat daftar form"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [
    type,
    statusFilter,
    debouncedSearch,
    sortOrder,
    page,
    refreshKey,
    reloadTick,
  ]);

  // Kalau halaman terakhir jadi kosong (mis. setelah arsip), mundur satu halaman
  useEffect(() => {
    if (!loading && !error && items.length === 0 && page > 1) {
      onPageChange(page - 1);
    }
  }, [loading, error, items.length, page, onPageChange]);

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] text-left">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500">
              <th className="px-4 py-3">Judul Form</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3">Event Terkait</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Responden</th>
              <th className="px-4 py-3">Terakhir Diperbarui</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-4 py-4">
                    <div className="h-8 animate-pulse rounded-md bg-gray-100" />
                  </td>
                </tr>
              ))}

            {!loading && error && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={() => setReloadTick((n) => n + 1)}
                    className="mt-3 rounded-lg border border-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                  >
                    Coba lagi
                  </button>
                </td>
              </tr>
            )}

            {!loading && !error && items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-sm text-gray-500"
                >
                  {debouncedSearch || statusFilter
                    ? "Tidak ada form yang cocok dengan filter."
                    : "Belum ada form di tab ini."}
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              items.map((f) => (
                <tr key={f.id} className="align-middle hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconStyle(f.id)}`}
                      >
                        <ClipboardList className="h-4 w-4" />
                      </span>
                      <span className="max-w-[16rem] text-sm font-semibold text-gray-900">
                        {f.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={f.type} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    <span className="line-clamp-2 max-w-[11rem]">
                      {f.eventNameSnapshot || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={f.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {f.responseCount.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    <div>{formatDate(f.updatedAt)}</div>
                    <div>{formatTime(f.updatedAt)}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <FormRowActions
                      form={f}
                      onChanged={() => setReloadTick((n) => n + 1)}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end gap-1.5 border-t border-gray-100 px-4 py-3">
          <button
            aria-label="Halaman sebelumnya"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageNumbers(page, totalPages).map((p, i) =>
            p === "…" ? (
              <span
                key={`gap-${i}`}
                className="flex h-8 w-8 items-center justify-center text-xs text-gray-400"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={`h-8 w-8 rounded-md text-xs font-medium ${
                  p === page
                    ? "bg-emerald-500 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ),
          )}
          <button
            aria-label="Halaman berikutnya"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
