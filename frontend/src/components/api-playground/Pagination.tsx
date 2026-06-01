"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Tampilkan maks 5 halaman di sekitar halaman aktif
  const getPages = () => {
    const pages: (number | "...")[] = [];
    const delta = 2;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pages = getPages();

  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex items-center gap-1.5 px-3.5 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft size={13} />
        Previous
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-xs">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`w-9 h-9 rounded-lg text-xs font-medium transition ${
              p === page
                ? "bg-emerald-600 text-white shadow-sm"
                : "border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="flex items-center gap-1.5 px-3.5 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Next
        <ChevronRight size={13} />
      </button>
    </div>
  );
}
