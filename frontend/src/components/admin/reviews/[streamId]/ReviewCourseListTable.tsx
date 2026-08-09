"use client";

import Link from "next/link";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Inbox,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { CourseReviewListItem } from "@/app/admin/elearning/reviews/[streamId]/page";

interface Props {
  streamId: string;
  streamTitle: string;
  courses: CourseReviewListItem[];
  isLoading: boolean;
}

type SortField = "title" | "orderNumber" | "reviewCount" | "averageRating";
type SortDir = "asc" | "desc";

const LIMIT_OPTIONS = [5, 10, 20, 50];

export default function ReviewCourseListTable({
  streamId,
  streamTitle,
  courses,
  isLoading,
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortField, setSortField] = useState<SortField>("reviewCount");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (field: SortField) => {
    let newDir: SortDir = "desc";
    if (sortField === field) {
      newDir = sortDir === "desc" ? "asc" : "desc";
    }
    setSortField(field);
    setSortDir(newDir);
    setPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const result = keyword
      ? courses.filter((c) => c.title.toLowerCase().includes(keyword))
      : courses;

    const sorted = [...result].sort((a, b) => {
      let diff = 0;
      if (sortField === "title") {
        diff = a.title.localeCompare(b.title);
      } else {
        diff = (a[sortField] ?? 0) - (b[sortField] ?? 0);
      }
      return sortDir === "asc" ? diff : -diff;
    });

    return sorted;
  }, [courses, search, sortField, sortDir]);

  const total = filtered.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm mb-15">
      {/* HEADER + SEARCH */}
      <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-gray-900">Daftar Course</h2>
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari judul course..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
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
              <th
                className="cursor-pointer select-none px-5 py-3 hover:text-gray-700"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center gap-1">
                  Course
                  {getSortIcon("title")}
                </div>
              </th>
              {/* <th className="px-5 py-3">Level</th> */}
              <th className="px-5 py-3">Estimasi Waktu</th>
              <th
                className="cursor-pointer select-none px-5 py-3 text-center hover:text-gray-700"
                onClick={() => handleSort("reviewCount")}
              >
                <div className="flex items-center justify-center gap-1">
                  Total Review
                  {getSortIcon("reviewCount")}
                </div>
              </th>
              <th
                className="cursor-pointer select-none px-5 py-3 text-center hover:text-gray-700"
                onClick={() => handleSort("averageRating")}
              >
                <div className="flex items-center justify-center gap-1">
                  Rating Rata-rata
                  {getSortIcon("averageRating")}
                </div>
              </th>
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

            {!isLoading && paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Inbox size={32} />
                    <p className="text-sm">Belum ada course ditemukan.</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              paginated.map((c) => (
                <tr key={c.id} className="transition hover:bg-gray-50/80">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">{c.title}</p>
                  </td>
                  {/* <td className="px-5 py-4 text-gray-600">{c.level ?? "-"}</td> */}
                  <td className="px-5 py-4 text-gray-600">
                    {c.estimatedTime ?? "-"}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {c.reviewCount > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {c.reviewCount}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {c.reviewCount > 0 ? (
                      <span className="inline-flex items-center justify-center gap-1 font-semibold text-gray-900">
                        <Star
                          size={14}
                          className="fill-amber-400 text-amber-400"
                        />
                        {c.averageRating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={{
                        pathname: `/admin/elearning/reviews/${streamId}/${c.id}`,
                        query: { title: c.title, stream: streamTitle },
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500 bg-white px-4 py-2 text-sm font-semibold text-emerald-600 transition-all duration-200 hover:bg-emerald-50 hover:shadow-sm active:scale-95"
                    >
                      <span>Lihat Review</span>
                      <ChevronRight size={15} className="shrink-0" />
                    </Link>
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
            Menampilkan {(currentPage - 1) * limit + 1} -{" "}
            {Math.min(currentPage * limit, total)} dari {total} course
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage >= totalPages}
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
