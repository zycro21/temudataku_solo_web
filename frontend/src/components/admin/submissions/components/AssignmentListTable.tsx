"use client";

import Link from "next/link";
import {
  Search,
  ChevronRight,
  Inbox,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import type { AssignmentListItem } from "@/app/admin/elearning/submissions/page";

interface Props {
  assignments: AssignmentListItem[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  // Pagination props
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  // Sorting props
  sortBy: "createdAt" | "updatedAt" | "score" | "submittedAt";
  sortOrder: "asc" | "desc";
  onSortChange: (
    by: "createdAt" | "updatedAt" | "score" | "submittedAt",
    order: "asc" | "desc",
  ) => void;
}

const LIMIT_OPTIONS = [5, 10, 20, 50];

export default function AssignmentListTable({
  assignments,
  isLoading,
  search,
  onSearchChange,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  sortBy,
  sortOrder,
  onSortChange,
}: Props) {
  const [sortField, setSortField] = useState<
    "createdAt" | "updatedAt" | "score" | "submittedAt"
  >(sortBy);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(sortOrder);

  const handleSort = (
    field: "createdAt" | "updatedAt" | "score" | "submittedAt",
  ) => {
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
      {/* HEADER + SEARCH */}
      <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-gray-900">
            Daftar Assignment
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
              placeholder="Cari judul assignment / course..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
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
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">Assignment</th>
              <th className="px-5 py-3">Course</th>
              <th
                className="cursor-pointer select-none px-5 py-3 text-center hover:text-gray-700"
                onClick={() => handleSort("submittedAt")}
              >
                <div className="flex items-center justify-center gap-1">
                  Terkirim
                  {getSortIcon("submittedAt")}
                </div>
              </th>
              <th className="px-5 py-3 text-center">Belum Dinilai</th>
              <th className="px-5 py-3 text-center">Sudah Dinilai</th>
              <th className="px-5 py-3 text-center">Aksi</th>
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

            {!isLoading && assignments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Inbox size={32} />
                    <p className="text-sm">Belum ada assignment ditemukan.</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              assignments.map((a) => {
                const totalSub = a.submissions.length;
                const reviewed = a.submissions.filter(
                  (s) => s.score !== null,
                ).length;
                const pending = totalSub - reviewed;

                return (
                  <tr key={a.id} className="transition hover:bg-gray-50/80">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{a.title}</p>
                      <p className="text-xs text-gray-500">
                        {a.text.subBab.subChapter.title} &middot;{" "}
                        {a.text.subBab.title}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {a.text.subBab.subChapter.course.title}
                    </td>
                    <td className="px-5 py-4 text-center font-semibold text-gray-900">
                      {totalSub}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {pending > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          {pending}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {reviewed > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {reviewed}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={{
                          pathname: `/admin/elearning/submissions/${a.id}`,
                          query: {
                            title: a.title,
                            course: a.text.subBab.subChapter.course.title,
                          },
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500 bg-white px-4 py-2 text-sm font-semibold text-emerald-600 transition-all duration-200 hover:bg-emerald-50 hover:shadow-sm active:scale-95"
                      >
                        <span>Lihat Submission</span>
                        <ChevronRight size={15} className="shrink-0" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Menampilkan {(page - 1) * limit + 1} -{" "}
            {Math.min(page * limit, total)} dari {total} assignment
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
