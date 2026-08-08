"use client";

import {
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import type { SubmissionListItem } from "@/app/admin/elearning/submissions/[assignmentId]/page";
import {
  MAX_ASSIGNMENT_ATTEMPTS,
  PASSING_SCORE_THRESHOLD,
  getAssignmentReviewOutcome,
  type AssignmentReviewOutcome,
} from "@/hooks/useElearningAssignmentSubmission";

interface Props {
  submissions: SubmissionListItem[];
  isLoading: boolean;
  page: number;
  limit: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: "submittedAt" | "score";
  sortOrder: "asc" | "desc";
  onSortChange: (by: "submittedAt" | "score", order: "asc" | "desc") => void;
  onGrade: (submission: SubmissionListItem) => void;
}

// 🔥 FIX: opsi filter "Sudah Direview" (raw status REVIEWED) diganti jadi
// "Lolos" / "Tidak Lolos" yang eksplisit — nilai yang dikirim ke backend
// masih string status mentah yang sama (REVIEWED), karena backend belum
// membedakan APPROVED/REJECTED secara literal; bedanya dihitung di
// frontend lewat getAssignmentReviewOutcome. Jadi filter ini tetap
// mengambil submission yang statusnya "sudah dinilai", lalu badge di tiap
// baris tabel yang menampilkan hasil sebenarnya (Lolos/Tidak Lolos).
const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "PENDING", label: "Belum Direview" },
  { value: "REVISION_REQUIRED", label: "Perlu Revisi" },
  { value: "REVIEWED", label: "Sudah Dinilai (Lolos / Tidak Lolos)" },
];

const LIMIT_OPTIONS = [5, 10, 20, 50];

const OUTCOME_META: Record<
  AssignmentReviewOutcome,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Belum Direview",
    className: "bg-yellow-100 text-yellow-700",
  },
  REVISION_REQUIRED: {
    label: "Perlu Revisi",
    className: "bg-amber-100 text-amber-700",
  },
  APPROVED: { label: "Lolos", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Tidak Lolos", className: "bg-red-100 text-red-700" },
};

function StatusBadge({ submission }: { submission: SubmissionListItem }) {
  const outcome = getAssignmentReviewOutcome({
    status: submission.status,
    isRevisionRequired: submission.isRevisionRequired,
    score: submission.score,
    isLastAttempt: submission.attemptNumber >= MAX_ASSIGNMENT_ATTEMPTS,
  });
  const cfg = OUTCOME_META[outcome];

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
  limit,
  totalPages,
  total,
  onPageChange,
  onLimitChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  onGrade,
}: Props) {
  const [sortField, setSortField] = useState<"submittedAt" | "score">(sortBy);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(sortOrder);

  const handleSort = (field: "submittedAt" | "score") => {
    let newOrder: "asc" | "desc" = "desc";
    if (sortField === field) {
      if (sortDir === "desc") newOrder = "asc";
      else if (sortDir === "asc") newOrder = "desc";
    }
    setSortField(field);
    setSortDir(newOrder);
    onSortChange(field, newOrder);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* 🔥 BARU: keterangan ambang batas kelulusan attempt terakhir —
          biar admin/curdev paham kenapa suatu submission bisa "Tidak
          Lolos" walau tidak ada opsi revisi lagi yang dipilih. */}
      {/* <div className="flex items-start gap-2 border-b border-gray-100 bg-blue-50/60 px-5 py-2.5 text-xs text-blue-800">
        <span>
          Ambang batas: di attempt ke-{MAX_ASSIGNMENT_ATTEMPTS} (attempt
          terakhir), skor{" "}
          <span className="font-semibold">≥ {PASSING_SCORE_THRESHOLD}</span>{" "}
          otomatis <span className="font-semibold">Lolos</span>, di bawah itu{" "}
          <span className="font-semibold">Tidak Lolos</span>. Opsi &ldquo;perlu
          revisi&rdquo; hanya tersedia sebelum attempt terakhir.
        </span>
      </div> */}

      {/* FILTER BAR */}
      <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-gray-900">
            Daftar Submission
          </h2>
          <span className="text-sm text-gray-500">({total} total)</span>
        </div>

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

          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {LIMIT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt} per halaman
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">Mentee</th>
              <th className="px-5 py-3 text-center">Attempt</th>
              <th
                className="cursor-pointer select-none px-5 py-3 hover:text-gray-700"
                onClick={() => handleSort("submittedAt")}
              >
                <div className="flex items-center gap-1">
                  Tanggal Kirim
                  {getSortIcon("submittedAt")}
                </div>
              </th>
              <th className="px-5 py-3">Status</th>
              <th
                className="cursor-pointer select-none px-5 py-3 text-center hover:text-gray-700"
                onClick={() => handleSort("score")}
              >
                <div className="flex items-center justify-center gap-1">
                  Skor
                  {getSortIcon("score")}
                </div>
              </th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading &&
              Array.from({ length: limit }).map((_, idx) => (
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
                    <StatusBadge submission={s} />
                  </td>
                  <td className="px-5 py-4 text-center font-semibold text-gray-900">
                    {typeof s.score === "number" ? s.score : "-"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {s.status === "PENDING" ? (
                      <button
                        onClick={() => onGrade(s)}
                        className="rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                      >
                        Menilai
                      </button>
                    ) : (
                      <button
                        onClick={() => onGrade(s)}
                        className="rounded-lg border border-emerald-500 px-4 py-1.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
                      >
                        Lihat Detail
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Menampilkan {(page - 1) * limit + 1} -{" "}
            {Math.min(page * limit, total)} dari {total} submission
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(page - 1, 1))}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600">
              Halaman {page} dari {totalPages}
            </span>
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
