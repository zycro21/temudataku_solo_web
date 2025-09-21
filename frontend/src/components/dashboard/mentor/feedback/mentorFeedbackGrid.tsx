"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

interface Feedback {
  id: number;
  mentee: string;
  program: string;
  skill: string;
  rating: number;
  comment: string;
  date: string;
  avatarUrl?: string; // optional avatar
}

interface MentorFeedbackGridProps {
  feedbacks: Feedback[];
  programFilter: string;
  skillFilter: string;
  searchQuery: string;
}

// fungsi ekstrak keyword sederhana
function extractKeywords(text: string, max: number = 3): string[] {
  const stopwords = [
    "yang",
    "dan",
    "di",
    "ke",
    "dari",
    "saya",
    "itu",
    "untuk",
    "ada",
    "karena",
    "dengan",
    "pada",
    "tapi",
    "agar",
    "lebih",
    "sudah",
    "bisa",
    "akan",
    "dalam",
  ];

  const words = text
    .toLowerCase()
    .replace(/[.,!?"']/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopwords.includes(w));

  const freq: Record<string, number> = {};
  words.forEach((w) => {
    freq[w] = (freq[w] || 0) + 1;
  });

  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w);

  return sorted.slice(0, max);
}

export default function MentorFeedbackGrid({
  feedbacks,
  programFilter,
  skillFilter,
  searchQuery,
}: MentorFeedbackGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const filteredData = useMemo(() => {
    return feedbacks.filter((f) => {
      const matchProgram =
        programFilter === "Semua" || f.program === programFilter;
      const matchSkill =
        skillFilter === "Semua" ||
        f.skill.toLowerCase() === skillFilter.toLowerCase();
      const matchSearch =
        searchQuery === "" ||
        f.mentee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.comment.toLowerCase().includes(searchQuery.toLowerCase());

      return matchProgram && matchSkill && matchSearch;
    });
  }, [feedbacks, programFilter, skillFilter, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentRows = filteredData.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div>
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentRows.length > 0 ? (
          currentRows.map((f) => {
            const keywords = extractKeywords(f.comment);
            return (
              <div
                key={f.id}
                className="bg-gray-100 rounded-lg shadow border border-black p-5 flex flex-col justify-between"
              >
                {/* Comment */}
                <p className="text-gray-700 mb-3 leading-relaxed text-sm">
                  "{f.comment}"
                </p>

                {/* Keywords */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="bg-white border border-black text-black font-semibold px-3 py-1 rounded-full text-sm"
                    >
                      {kw.charAt(0).toUpperCase() + kw.slice(1)}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={f.avatarUrl || "/assets/dashboard/user/avatar.png"}
                        alt={f.mentee}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-base">
                        {f.mentee}
                      </p>
                      <p className="text-sm text-gray-600">{f.program}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{f.date}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full flex justify-center items-center py-10">
            <p className="text-gray-500 text-lg font-medium">
              Tidak ada data ditemukan
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <p>
            Menampilkan {startIdx + 1} -{" "}
            {Math.min(startIdx + itemsPerPage, filteredData.length)} dari{" "}
            {filteredData.length} data
          </p>

          <div className="flex items-center gap-2">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              {"<"}
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (num) =>
                  num >= Math.max(1, currentPage - 2) &&
                  num <= Math.min(totalPages, currentPage + 2)
              )
              .map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === num
                      ? "bg-emerald-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {num}
                </button>
              ))}

            {/* Next */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              {">"}
            </button>
          </div>

          {/* Select per halaman */}
          <div className="flex items-center gap-2">
            <span>Tampilkan per halaman</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={6}>6</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
