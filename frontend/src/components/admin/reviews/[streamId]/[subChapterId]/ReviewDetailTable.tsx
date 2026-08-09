"use client";

import {
  Inbox,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ReviewDetailItem } from "@/app/admin/elearning/reviews/[streamId]/[subChapterId]/page";

interface Props {
  reviews: ReviewDetailItem[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (order: "asc" | "desc") => void;
}

const LIMIT_OPTIONS = [5, 10, 20, 50];

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function RatingBadge({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      <Star size={13} className="fill-amber-400 text-amber-400" />
      {rating.toFixed(1)}
    </span>
  );
}

export default function ReviewDetailTable({
  reviews,
  isLoading,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  sortOrder,
  onSortOrderChange,
}: Props) {
  const toggleSort = () => {
    onSortOrderChange(sortOrder === "desc" ? "asc" : "desc");
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm mb-15">
      {/* HEADER */}
      <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-gray-900">Daftar Review</h2>
          <span className="text-sm text-gray-500">({total} total)</span>
        </div>

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

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">Mentee</th>
              <th className="px-5 py-3 text-center">Rating</th>
              <th className="px-5 py-3">Komentar</th>
              <th
                className="cursor-pointer select-none px-5 py-3 text-center hover:text-gray-700"
                onClick={toggleSort}
              >
                <div className="flex items-center justify-center gap-1">
                  Tanggal Review
                  {sortOrder === "asc" ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading &&
              Array.from({ length: limit }).map((_, idx) => (
                <tr key={idx}>
                  <td className="px-5 py-4" colSpan={4}>
                    <div className="h-5 w-full animate-pulse rounded bg-gray-100" />
                  </td>
                </tr>
              ))}

            {!isLoading && reviews.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Inbox size={32} />
                    <p className="text-sm">
                      Belum ada review untuk course ini.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              reviews.map((r) => (
                <tr
                  key={r.id}
                  className="align-top transition hover:bg-gray-50/80"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">
                      {r.user?.fullName ?? "-"}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <RatingBadge rating={Number(r.rating)} />
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {r.comment ? (
                      <p className="max-w-md whitespace-pre-line">
                        {r.comment}
                      </p>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center text-gray-600">
                    {formatDate(r.createdAt)}
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
            {Math.min(page * limit, total)} dari {total} review
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
