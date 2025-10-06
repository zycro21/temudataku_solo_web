"use client";

import Image from "next/image";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import AddReviewModal from "./addReviewModal";
import EditReviewModal from "./editReviewProject";
import ShowReviewModal from "./showReviewModal";

interface ReviewAnswers {
  brief: string;
  technical: string;
  creativity: string;
  completeness: string;
  generalComment: string;
  improvement: string;
  revision: "yes" | "no";
  revisionDate: string; // kosong kalau revision = no
  confirmation: "true" | "false";
}

interface Project {
  id: string;
  menteeId: string;
  name: string;
  email: string;
  photo: string;
  date: string; // tanggal pengumpulan
  zoomSchedule: string; // Nama Sesi Zoom
  scheduleStart: string; // ISO datetime
  scheduleEnd: string; // ISO datetime
  status: "Lolos Tinjauan" | "Belum Ditinjau" | "Perlu Revisi";
  projectTitle: string;
  projectCreatedAt: string;
  title: string;
  projectLink: string;
  reviewAnswers?: ReviewAnswers; // opsional, hanya ada kalau sudah ditinjau
}

interface ProjectTableProps {
  searchQuery: string;
  statusFilter: string;
}

type SortColumn = "id" | "name" | "email" | "date" | "status" | null;
type SortOrder = "asc" | "desc" | null;

export default function ProjectTable({
  searchQuery,
  statusFilter,
}: ProjectTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");

  useEffect(() => {
    if (!serviceId) return;

    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/project/mentor-services/${serviceId}/submissions`,
          {
            withCredentials: true,
          }
        );

        const mappedData = res.data.data.map((item: any) => {
          return {
            id: item.id,
            menteeId: item.menteeId,
            name: item.menteeName,
            email: item.menteeEmail,
            photo: item.menteePhoto || "",
            date: item.submissionDate,
            zoomSchedule: item.zoomSchedule || "",
            scheduleStart: item.submissionDate,
            scheduleEnd: item.submissionDate,
            status:
              item.reviewStatus === "REVIEWED"
                ? "Lolos Tinjauan"
                : item.reviewStatus === "REVISION_REQUIRED"
                ? "Perlu Revisi"
                : "Belum Ditinjau",
            title: item.title, // <- Judul Submission
            projectTitle: item.projectTitle,
            projectCreatedAt: item.projectCreatedAt,
            projectLink: item.projectLink,
          };
        });

        setProjects(mappedData);
      } catch (err) {
        console.error("Gagal fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [serviceId]);

  // Filtering
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.status.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "Semua" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const hasData = filteredProjects.length > 0;

  // Sorting
  const sortedProjects = useMemo(() => {
    if (!sortColumn || !sortOrder) return filteredProjects;

    return [...filteredProjects].sort((a, b) => {
      const valA = a[sortColumn] as string;
      const valB = b[sortColumn] as string;

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredProjects, sortColumn, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentRows = sortedProjects.slice(startIdx, startIdx + itemsPerPage);

  const getStatusBadge = (status: string) => {
    if (status === "Lolos Tinjauan")
      return "bg-emerald-100 text-emerald-600 border border-emerald-300";
    if (status === "Perlu Revisi")
      return "bg-red-100 text-red-600 border border-red-300";
    return "bg-yellow-100 text-yellow-600 border border-yellow-300";
  };

  const handleActionClick = (action: string, project: Project) => {
    setSelectedAction(action);
    setSelectedProject(project);
  };

  const renderActions = (status: string, project: Project) => {
    if (status === "Belum Ditinjau") {
      return (
        <button
          onClick={() => handleActionClick("review", project)}
          className="p-1 hover:bg-green-50 rounded cursor-pointer transition transform hover:scale-105 active:scale-95"
        >
          <Image
            src="/assets/dashboard/mentor/service/review.svg"
            alt="Review"
            width={25}
            height={25}
          />
        </button>
      );
    }
    return (
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => handleActionClick("detail", project)}
          className="p-1 hover:bg-blue-50 rounded cursor-pointer transition transform hover:scale-105 active:scale-95"
        >
          <Image
            src="/assets/dashboard/mentor/service/show.svg"
            alt="Detail"
            width={25}
            height={25}
          />
        </button>
        <button
          onClick={() => handleActionClick("edit", project)}
          className="p-1 hover:bg-yellow-50 rounded cursor-pointer transition transform hover:scale-105 active:scale-95"
        >
          <Image
            src="/assets/dashboard/mentor/service/edit.svg"
            alt="Edit"
            width={25}
            height={25}
          />
        </button>
      </div>
    );
  };

  // Handle sorting click
  const handleSort = (column: SortColumn) => {
    if (sortColumn !== column) {
      setSortColumn(column);
      setSortOrder("asc");
    } else if (sortOrder === "asc") {
      setSortOrder("desc");
    } else if (sortOrder === "desc") {
      setSortColumn(null);
      setSortOrder(null);
    }
  };

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    if (sortOrder === "asc")
      return <ChevronUp className="inline w-4 h-4 ml-1" />;
    if (sortOrder === "desc")
      return <ChevronDown className="inline w-4 h-4 ml-1" />;
    return null;
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-10">
        Sedang memuat data project...
      </div>
    );
  }

  if (!loading && projects.length === 0) {
    return (
      <div className="text-center text-gray-500 py-16 bg-gray-50 rounded-lg shadow-sm">
        <p className="text-lg font-medium">
          Belum ada Submission yang dikumpulkan untuk Service ini.
        </p>
      </div>
    );
  }

  if (!loading && !hasData) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Tidak ada hasil yang cocok dengan pencarian atau filter saat ini.
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="border-b">
              <tr className="bg-white text-left text-sm font-medium text-gray-600">
                {[
                  { key: "id", label: "ID Mentee", px: "px-3" },
                  { key: null, label: "Foto", center: true, px: "px-0" },
                  { key: "name", label: "Nama Lengkap", px: "px-4" },
                  { key: "email", label: "Email", px: "px-4" },
                  { key: "date", label: "Tanggal Pengumpulan", px: "px-4" },
                  { key: "status", label: "Status Review", px: "px-3" },
                  { key: null, label: "Aksi", center: true, px: "px-0" },
                ].map(({ key, label, center, px }, idx) => (
                  <th
                    key={idx}
                    className={`${px} py-3 ${
                      center ? "text-center" : "cursor-pointer select-none"
                    }`}
                    onClick={() => key && handleSort(key as SortColumn)}
                  >
                    <span
                      className={`flex items-center ${
                        center ? "justify-center" : ""
                      } ${
                        key && sortColumn === key
                          ? "text-emerald-600 font-semibold"
                          : ""
                      }`}
                    >
                      {label}
                      {key && renderSortIcon(key as SortColumn)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {currentRows.map((p, i) => (
                <tr
                  key={p.id}
                  className="text-sm hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 py-3">{p.menteeId}</td>

                  {/* Foto center */}
                  <td className="px-2 py-3 text-center">
                    <Image
                      src={
                        p.photo && p.photo !== "default.jpg"
                          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${p.photo}`
                          : "/assets/dashboard/user/avatar.png"
                      }
                      alt={p.name}
                      width={40}
                      height={40}
                      className="rounded-full inline-block object-cover"
                    />
                  </td>

                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.email}</td>
                  <td className="px-4 py-3">
                    {(() => {
                      const localDate = new Date(p.date);
                      const day = String(localDate.getDate()).padStart(2, "0");
                      const month = String(localDate.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const year = localDate.getFullYear();
                      return `${day}-${month}-${year}`;
                    })()}
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className={`px-4 py-1.5 text-sm font-semibold inline-block ${getStatusBadge(
                        p.status
                      )}`}
                    >
                      {p.status}
                    </span>
                  </td>

                  {/* Aksi center */}
                  <td className="px-2 py-3 text-center">
                    {renderActions(p.status, p)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProjects.length > 0 && (
          <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
            <p>
              Menampilkan {startIdx + 1} -{" "}
              {Math.min(startIdx + itemsPerPage, filteredProjects.length)} dari{" "}
              {filteredProjects.length} data
            </p>

            <div className="flex items-center gap-2">
              {/* Tombol prev */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                {"<"}
              </button>

              {/* Hitung range halaman */}
              {(() => {
                const pageNumbers: (number | string)[] = [];
                const startPage = Math.max(1, currentPage - 2);
                const endPage = Math.min(totalPages, currentPage + 2);

                if (startPage > 1) {
                  pageNumbers.push(1);
                  if (startPage > 2) pageNumbers.push("...");
                }

                for (let i = startPage; i <= endPage; i++) {
                  pageNumbers.push(i);
                }

                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) pageNumbers.push("...");
                  pageNumbers.push(totalPages);
                }

                return pageNumbers.map((num, idx) =>
                  typeof num === "number" ? (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(num)}
                      className={`px-3 py-1 border rounded ${
                        currentPage === num
                          ? "bg-emerald-500 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {num}
                    </button>
                  ) : (
                    <span key={idx} className="px-2">
                      {num}
                    </span>
                  )
                );
              })()}

              {/* Tombol next */}
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

            {/* Dropdown pilih per halaman */}
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

        {/* Modal Add Review */}
        {selectedAction === "review" && selectedProject && (
          <AddReviewModal
            open={true}
            onClose={() => setSelectedAction(null)}
            project={selectedProject}
          />
        )}

        {/* Modal Edit Review */}
        {selectedAction === "edit" && selectedProject && (
          <EditReviewModal
            open={true}
            onClose={() => setSelectedAction(null)}
            project={selectedProject}
          />
        )}
      </div>

      {/* Modal Show Review (Detail) */}
      {selectedAction === "detail" && selectedProject && (
        <ShowReviewModal
          open={true}
          onClose={() => setSelectedAction(null)}
          project={selectedProject}
        />
      )}
    </>
  );
}
