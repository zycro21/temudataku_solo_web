"use client";

import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import FeedbackDialog from "./feedbackDialogModal";
import Image from "next/image";

interface Feedback {
  id: number;
  mentee: string;
  program: string;
  skill: string;
  rating: number;
  comment: string;
  date: string;
}

interface MentorFeedbackTableProps {
  programFilter: string;
  skillFilter: string;
  searchQuery: string;
}

const serviceMap: Record<string, string> = {
  "one-on-one": "Mentoring 1 on 1",
  group: "Mentoring Group",
  bootcamp: "Bootcamp",
  shortclass: "Short Class",
  "live class": "Live Class",
};

export default function MentorFeedbackTable({
  programFilter,
  skillFilter,
  searchQuery,
}: MentorFeedbackTableProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc" | "default";
  }>({ key: null, direction: "default" });

  const detectSkillFromServiceName = (serviceName: string): string => {
    const lower = serviceName.toLowerCase();
    if (lower.includes("analysis")) return "Data Analysis";
    if (lower.includes("science")) return "Data Science";
    if (lower.includes("machine learning") || lower.includes("ml"))
      return "Machine Learning";
    return "Lain-Lain";
  };

  // FETCH FEEDBACK MENTOR (DENGAN FILTER)
  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        // Buat parameter query sesuai filter
        const params: Record<string, string> = {};
        if (programFilter !== "Semua") params.program = programFilter;
        if (sortConfig.key === "rating") params.sortBy = "rating";
        if (sortConfig.direction === "asc" || sortConfig.direction === "desc") {
          params.sortOrder = sortConfig.direction;
        }
        params.limit = String(itemsPerPage);

        const queryString = new URLSearchParams(params).toString();

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feedback/mentor/feedbacks?${queryString}`,
          { withCredentials: true }
        );

        const data = res.data?.data || [];
        const mapped = data.map((item: any, index: number) => {
          const serviceName = item.session.mentoringService.serviceName || "";
          return {
            id: index + 1,
            mentee: item.user.fullName,
            program:
              serviceMap[item.session.mentoringService.serviceType] ||
              serviceName,
            skill: detectSkillFromServiceName(serviceName),
            rating: item.rating,
            comment: item.comment,
            date: new Date(item.submittedDate).toLocaleDateString("id-ID"),
          };
        });

        setFeedbacks(mapped);
      } catch (error) {
        console.error("Gagal mengambil feedback mentor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [programFilter, sortConfig, itemsPerPage]);

  // Filtering
  const filteredData = useMemo(() => {
    return feedbacks.filter((f) => {
      const matchSearch =
        searchQuery === "" ||
        f.mentee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.comment.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSkill = skillFilter === "Semua" || f.skill === skillFilter;

      return matchSearch && matchSkill;
    });
  }, [feedbacks, searchQuery, skillFilter]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        const nextDirection =
          prev.direction === "default"
            ? "asc"
            : prev.direction === "asc"
            ? "desc"
            : "default";
        return { key, direction: nextDirection };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedData = useMemo(() => {
    let data = [...filteredData];
    if (sortConfig.key && sortConfig.direction !== "default") {
      data.sort((a, b) => {
        const valA = a[sortConfig.key as keyof Feedback];
        const valB = b[sortConfig.key as keyof Feedback];

        if (sortConfig.key === "date") {
          const dateA = new Date(valA as string).getTime();
          const dateB = new Date(valB as string).getTime();
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }

        if (typeof valA === "number" && typeof valB === "number") {
          return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        }

        return sortConfig.direction === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    } else {
      data.sort((a, b) => b.id - a.id);
    }
    return data;
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentRows = sortedData.slice(startIdx, startIdx + itemsPerPage);

  const truncate = (text: string, maxLength: number) =>
    text.length <= maxLength ? text : text.slice(0, maxLength) + "...";

  // 🧭 LOADING STATE
  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Memuat data feedback...
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600 font-medium">
                <th
                  onClick={() => handleSort("mentee")}
                  className={`px-4 py-3 cursor-pointer select-none ${
                    sortConfig.key === "mentee" &&
                    sortConfig.direction !== "default"
                      ? "text-emerald-600 font-semibold"
                      : ""
                  }`}
                >
                  Mentee{" "}
                  {sortConfig.key === "mentee" &&
                    (sortConfig.direction === "asc"
                      ? "↑"
                      : sortConfig.direction === "desc"
                      ? "↓"
                      : "")}
                </th>

                <th
                  onClick={() => handleSort("program")}
                  className={`px-4 py-3 cursor-pointer select-none ${
                    sortConfig.key === "program" &&
                    sortConfig.direction !== "default"
                      ? "text-emerald-600 font-semibold"
                      : ""
                  }`}
                >
                  Program{" "}
                  {sortConfig.key === "program" &&
                    (sortConfig.direction === "asc"
                      ? "↑"
                      : sortConfig.direction === "desc"
                      ? "↓"
                      : "")}
                </th>

                <th
                  onClick={() => handleSort("rating")}
                  className={`px-4 py-3 cursor-pointer select-none ${
                    sortConfig.key === "rating" &&
                    sortConfig.direction !== "default"
                      ? "text-emerald-600 font-semibold"
                      : ""
                  }`}
                >
                  Rating{" "}
                  {sortConfig.key === "rating" &&
                    (sortConfig.direction === "asc"
                      ? "↑"
                      : sortConfig.direction === "desc"
                      ? "↓"
                      : "")}
                </th>

                <th
                  onClick={() => handleSort("comment")}
                  className={`px-4 py-3 cursor-pointer select-none ${
                    sortConfig.key === "comment" &&
                    sortConfig.direction !== "default"
                      ? "text-emerald-600 font-semibold"
                      : ""
                  }`}
                >
                  Komentar Singkat{" "}
                  {sortConfig.key === "comment" &&
                    (sortConfig.direction === "asc"
                      ? "↑"
                      : sortConfig.direction === "desc"
                      ? "↓"
                      : "")}
                </th>

                <th
                  onClick={() => handleSort("date")}
                  className={`px-4 py-3 cursor-pointer select-none ${
                    sortConfig.key === "date" &&
                    sortConfig.direction !== "default"
                      ? "text-emerald-600 font-semibold"
                      : ""
                  }`}
                >
                  Tanggal{" "}
                  {sortConfig.key === "date" &&
                    (sortConfig.direction === "asc"
                      ? "↑"
                      : sortConfig.direction === "desc"
                      ? "↓"
                      : "")}
                </th>

                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((f) => (
                  <tr
                    key={f.id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">{f.mentee}</td>
                    <td className="px-4 py-3">{f.program}</td>
                    <td className="px-4 py-3">{f.rating}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {truncate(f.comment, 65)}{" "}
                    </td>
                    <td className="px-4 py-3">{f.date}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="p-1 hover:bg-blue-50 rounded transition cursor-pointer"
                        onClick={() => {
                          const globalIndex = sortedData.findIndex(
                            (d) => d.id === f.id
                          );
                          setSelectedIndex(globalIndex);
                          setDialogOpen(true);
                        }}
                      >
                        <Image
                          src="/assets/dashboard/mentor/service/show.svg"
                          alt="Detail"
                          width={20}
                          height={20}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    Tidak ada data ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                {">"}
              </button>
            </div>

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
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <FeedbackDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        feedbacks={sortedData}
        startIndex={selectedIndex}
      />
    </>
  );
}
