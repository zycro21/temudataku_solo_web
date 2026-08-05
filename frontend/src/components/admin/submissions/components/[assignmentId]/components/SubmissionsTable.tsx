"use client";

import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import type { SubmissionListItem } from "@/app/admin/elearning/submissions/[assignmentId]/page";

interface Props {
  submissions: SubmissionListItem[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: "submittedAt" | "score";
  sortOrder: "asc" | "desc";
  onSortChange: (by: "submittedAt" | "score", order: "asc" | "desc") => void;
  onGrade: (submission: SubmissionListItem) => void;
}

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "PENDING", label: "Belum Direview" },
  { value: "REVISION_REQUIRED", label: "Perlu Revisi" },
  { value: "APPROVED", label: "Lolos" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "REVIEWED", label: "Sudah Direview" },
];

function StatusBadge({ status }: { status: SubmissionListItem["status"] }) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING: {
      label: "Belum Direview",
      className: "bg-yellow-100 text-yellow-700",
    },
    REVISION_REQUIRED: {
      label: "Perlu Revisi",
      className: "bg-amber-100 text-amber-700",
    },
    APPROVED: { label: "Lolos", className: "bg-emerald-100 text-emerald-700" },
    REJECTED: { label: "Ditolak", className: "bg-red-100 text-red-700" },
    REVIEWED: { label: "Direview", className: "bg-blue-100 text-blue-700" },
  };
  const cfg = map[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

export default function SubmissionsTable({
  submissions,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  onGrade,
}: Props) {
  const handleSortToggle = (field: "submittedAt" | "score") => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(field, "desc");
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* ================= FILTER BAR ================= */}
      <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold text-gray-900">
          Daftar Submission ({total})
        </h2>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative w-full sm:w-64">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari nama mentee / catatan..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">Mentee</th>
              <th className="px-5 py-3 text-center">Attempt</th>
              <th
                className="cursor-pointer select-none px-5 py-3"
                onClick={() => handleSortToggle("submittedAt")}
              >
                Tanggal Kirim{" "}
                {sortBy === "submittedAt" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-5 py-3">Status</th>
              <th
                className="cursor-pointer select-none px-5 py-3 text-center"
                onClick={() => handleSortToggle("score")}
              >
                Skor {sortBy === "score" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading &&
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td className="px-5 py-4" colSpan={6}>
                    <div className="h-5 w-full animate-pulse rounded bg-gray-100" />
                  </td>
                </tr>
              ))}

            {!isLoading && submissions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Inbox size={32} />
                    <p className="text-sm">Belum ada submission ditemukan.</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              submissions.map((s) => (
                <tr key={s.id} className="transition hover:bg-gray-50/80">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">
                      {s.user.fullName}
                    </p>
                    <p className="text-xs text-gray-500">{s.user.email}</p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                      #{s.attemptNumber}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {s.submittedAt
                      ? new Date(s.submittedAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-5 py-4 text-center font-semibold text-gray-900">
                    {typeof s.score === "number" ? s.score : "-"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => onGrade(s)}
                      className="rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                    >
                      Menilai
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
          <p className="text-sm text-gray-500">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(page - 1, 1))}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange(Math.min(page + 1, totalPages))}
              disabled={page >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
