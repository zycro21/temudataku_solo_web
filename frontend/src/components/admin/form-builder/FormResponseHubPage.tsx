"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  ListChecks,
  Search,
} from "lucide-react";
import { StatusBadge, TypeBadge } from "./FormBadges";
import {
  FORM_API,
  PAGE_SIZE,
  STATUS_LABEL,
  TYPE_LABEL,
  formResponsesHref,
  formatDate,
  formatTime,
  getApiErrorMessage,
  useDebouncedValue,
  type FormListItem,
  type FormStatus,
  type FormType,
  type Pagination,
} from "./shared";

type TypeFilter = "" | FormType;
type StatusFilterValue = "" | FormStatus;

const selectClass =
  "w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs text-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

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

// Menu sidebar "Respon": pilih form dulu, lalu buka daftar respons form itu.
// Respons selalu milik satu form, jadi halaman ini jadi pintu masuknya.
export default function FormResponseHubPage() {
  const [type, setType] = useState<TypeFilter>("");
  const [status, setStatus] = useState<StatusFilterValue>("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<FormListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    // AbortController: kalau filter berubah cepat, respons lama dibuang
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    axios
      .get(`${FORM_API}/forms`, {
        params: {
          type: type || undefined,
          status: status || undefined,
          search: debouncedSearch || undefined,
          sortBy: "updatedAt",
          sortOrder: "desc",
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
  }, [type, status, debouncedSearch, page, reloadTick]);

  // Kalau halaman terakhir jadi kosong, mundur satu halaman
  useEffect(() => {
    if (!loading && !error && items.length === 0 && page > 1) {
      setPage(page - 1);
    }
  }, [loading, error, items.length, page]);

  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;
  const hasFilter = !!debouncedSearch || !!type || !!status;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Respon Form</h1>
        <p className="mt-0.5 text-xs text-gray-500">
          Pilih form untuk melihat dan mengelola respons yang masuk.
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative w-full lg:w-44">
          <select
            aria-label="Filter tipe form"
            value={type}
            onChange={(e) => {
              setType(e.target.value as TypeFilter);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">Semua Tipe</option>
            <option value="EVENT">{TYPE_LABEL.EVENT}</option>
            <option value="NON_EVENT">{TYPE_LABEL.NON_EVENT}</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative w-full lg:w-44">
          <select
            aria-label="Filter status form"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusFilterValue);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">Semua Status</option>
            <option value="PUBLISHED">{STATUS_LABEL.PUBLISHED}</option>
            <option value="DRAFT">{STATUS_LABEL.DRAFT}</option>
            <option value="ARCHIVED">{STATUS_LABEL.ARCHIVED}</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari judul form..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500">
                <th className="px-4 py-3">Judul Form</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Respons</th>
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
                    {hasFilter
                      ? "Tidak ada form yang cocok dengan filter."
                      : "Belum ada form."}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                items.map((f) => (
                  <tr key={f.id} className="align-middle hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <ListChecks className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={formResponsesHref(f.id)}
                            className="block max-w-[18rem] truncate text-sm font-medium text-gray-900 hover:text-emerald-600"
                          >
                            {f.title}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <TypeBadge type={f.type} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      <span className="line-clamp-2 max-w-[11rem]">
                        {f.category?.name || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {f.responseCount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      <div>{formatDate(f.updatedAt)}</div>
                      <div className="text-gray-400">
                        {formatTime(f.updatedAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={formResponsesHref(f.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Lihat Respon
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!loading && !error && total > 0 && (
          <div className="flex flex-col gap-2 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              Menampilkan {(page - 1) * PAGE_SIZE + 1}-
              {(page - 1) * PAGE_SIZE + items.length} dari{" "}
              {total.toLocaleString("id-ID")} form
            </p>
            {totalPages > 1 && (
              <div className="flex gap-1.5">
                <button
                  aria-label="Halaman sebelumnya"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
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
                      onClick={() => setPage(p)}
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
                  onClick={() => setPage(page + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
