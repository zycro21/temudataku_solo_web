"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FORM_API,
  PAGE_SIZE,
  formResponseHubHref,
  formResponsesHref,
  formatDate,
  formatTime,
  getApiErrorMessage,
  useDebouncedValue,
  type Pagination,
} from "./shared";

const RESPONSE_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/formresponse`;

// Default backend: SUBMITTED. Draft autosave responder bukan submission final.
type ResponseStatusFilter = "SUBMITTED" | "DRAFT" | "ALL";

// Item dari GET /api/formresponse/forms/:id/responses
interface ResponseListItem {
  id: string;
  status: "DRAFT" | "SUBMITTED";
  submittedAt: string | null;
  updatedAt: string;
  email: string | null;
  respondent: { id: string; fullName: string; email: string } | null;
}

const STATUS_OPTIONS: { value: ResponseStatusFilter; label: string }[] = [
  { value: "SUBMITTED", label: "Terkirim" },
  { value: "DRAFT", label: "Draft" },
  { value: "ALL", label: "Semua Status" },
];

const dateInputClass =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

const responseDetailHref = (formId: string, responseId: string) =>
  `${formResponsesHref(formId)}/${responseId}`;

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

// Saat responseType "blob", pesan error dari backend ikut berbentuk Blob
async function getExportErrorMessage(err: unknown): Promise<string> {
  const fallback = "Gagal mengekspor respons";
  if (axios.isAxiosError(err) && err.response?.data instanceof Blob) {
    try {
      const parsed = JSON.parse(await err.response.data.text());
      if (typeof parsed?.message === "string") return parsed.message;
    } catch {
      /* bukan JSON, pakai pesan bawaan */
    }
    return fallback;
  }
  return getApiErrorMessage(err, fallback);
}

function ResponseStatusBadge({ status }: { status: "DRAFT" | "SUBMITTED" }) {
  const submitted = status === "SUBMITTED";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
        submitted
          ? "bg-emerald-50 text-emerald-600"
          : "bg-amber-50 text-amber-600"
      }`}
    >
      {submitted ? "Terkirim" : "Draft"}
    </span>
  );
}

// Halaman "Respon" satu form: daftar response + filter + export CSV
export default function FormResponsesPage() {
  const params = useParams();
  const formId = String(params?.id ?? "");

  const [formTitle, setFormTitle] = useState<string | null>(null);

  const [status, setStatus] = useState<ResponseStatusFilter>("SUBMITTED");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<ResponseListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [exporting, setExporting] = useState(false);

  // Judul form untuk breadcrumb & heading
  useEffect(() => {
    if (!formId) return;
    const controller = new AbortController();
    axios
      .get(`${FORM_API}/forms/${formId}`, {
        withCredentials: true,
        signal: controller.signal,
      })
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setFormTitle(data?.title ?? null);
      })
      .catch(() => {
        /* judul hanya pelengkap; daftar response tetap jalan */
      });
    return () => controller.abort();
  }, [formId]);

  useEffect(() => {
    if (!formId) return;
    // AbortController: kalau filter berubah cepat, respons lama dibuang
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    axios
      .get(`${RESPONSE_API}/forms/${formId}/responses`, {
        params: {
          status,
          search: debouncedSearch || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
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
        setError(getApiErrorMessage(err, "Gagal memuat daftar respons"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [formId, status, debouncedSearch, startDate, endDate, page, reloadTick]);

  // Kalau halaman terakhir jadi kosong, mundur satu halaman
  useEffect(() => {
    if (!loading && !error && items.length === 0 && page > 1) {
      setPage(page - 1);
    }
  }, [loading, error, items.length, page]);

  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;
  const hasFilter =
    !!debouncedSearch || !!startDate || !!endDate || status !== "SUBMITTED";

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    const toastId = toast.loading("Menyiapkan file export...");
    try {
      // Memakai filter yang sedang aktif di tabel
      const res = await axios.get(
        `${RESPONSE_API}/forms/${formId}/responses/export`,
        {
          params: {
            format: "csv",
            status,
            search: debouncedSearch || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            sortOrder: "desc",
          },
          responseType: "blob",
          withCredentials: true,
        },
      );
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `respon-form-${formId}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("File export diunduh", { id: toastId });
    } catch (err) {
      toast.error(await getExportErrorMessage(err), { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400"
      >
        <Link href={formResponseHubHref} className="hover:text-gray-600">
          Respon
        </Link>
        <span>›</span>
        <span className="max-w-[16rem] truncate text-gray-600">
          {formTitle ?? "Form"}
        </span>
      </nav>

      {/* Judul + Export */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {formTitle === null ? (
            <div className="h-6 w-64 animate-pulse rounded bg-gray-100" />
          ) : (
            <h1 className="truncate text-xl font-bold text-gray-900">
              Respon Form {formTitle}
            </h1>
          )}
          <p className="mt-0.5 text-xs text-gray-500">
            Lihat dan kelola daftar respons yang masuk dari form ini.
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={exporting || total === 0}
          className="shrink-0 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-1 h-4 w-4" />
          )}
          Export
        </Button>
      </div>

      {/* Filter */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative w-full lg:w-44">
          <select
            aria-label="Filter status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ResponseStatusFilter);
              setPage(1);
            }}
            className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs text-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-500">
          Mulai
          <input
            type="date"
            aria-label="Tanggal mulai"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className={dateInputClass}
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-500">
          Selesai
          <input
            type="date"
            aria-label="Tanggal selesai"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className={dateInputClass}
          />
        </label>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama atau email responder..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500">
                <th className="w-14 px-4 py-3">No</th>
                <th className="px-4 py-3">Tanggal Submit</th>
                <th className="px-4 py-3">Responder</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-8 animate-pulse rounded-md bg-gray-100" />
                    </td>
                  </tr>
                ))}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
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
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    {hasFilter
                      ? "Tidak ada respons yang cocok dengan filter."
                      : "Belum ada respons yang masuk."}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                items.map((r, i) => (
                  <tr key={r.id} className="align-middle hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {(page - 1) * PAGE_SIZE + i + 1}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {r.submittedAt ? (
                        <>
                          <div>{formatDate(r.submittedAt)}</div>
                          <div className="text-gray-400">
                            {formatTime(r.submittedAt)}
                          </div>
                        </>
                      ) : (
                        <>
                          <div>-</div>
                          <div className="text-gray-400">
                            Diubah {formatDate(r.updatedAt)}
                          </div>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {r.respondent?.fullName ?? (
                        <span className="font-normal text-gray-400">
                          Anonim
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {r.email ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <ResponseStatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={responseDetailHref(formId, r.id)}
                        title="Lihat detail respons"
                        aria-label="Lihat detail respons"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        <Eye className="h-4 w-4" />
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
              {total.toLocaleString("id-ID")} respons
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
