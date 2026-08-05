"use client";

import Link from "next/link";
import { Search, ChevronRight, Inbox } from "lucide-react";
import type { AssignmentListItem } from "@/app/admin/elearning/submissions/page";

interface Props {
  assignments: AssignmentListItem[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
}

export default function AssignmentListTable({
  assignments,
  isLoading,
  search,
  onSearchChange,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* ================= HEADER + SEARCH ================= */}
      <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold text-gray-900">Daftar Assignment</h2>

        <div className="relative w-full sm:w-72">
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
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">Assignment</th>
              <th className="px-5 py-3">Course</th>
              <th className="px-5 py-3 text-center">Terkirim</th>
              <th className="px-5 py-3 text-center">Belum Dinilai</th>
              <th className="px-5 py-3 text-center">Sudah Dinilai</th>
              <th className="px-5 py-3" />
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
                const total = a.submissions.length;
                const reviewed = a.submissions.filter(
                  (s) => s.score !== null,
                ).length;
                const pending = total - reviewed;

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
                      {total}
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
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-500 px-3 py-1.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
                      >
                        Lihat Submission
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
