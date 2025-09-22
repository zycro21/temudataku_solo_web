"use client";

import { useState } from "react";
import Image from "next/image";
import AddMentorReportModal from "./AddMentorReportModal";
import EditMentorReportModal from "./editMentorReport";
import ShowMentorReportModal from "./viewMentorReport";

interface Report {
  id: string;
  program: string;
  type: "Mentoring 1 on 1" | "Mentoring Group" | "Bootcamp" | "ShortClass";
  date: string;
  time: string;
  participants: number;
  status: "Belum Diisi" | "Belum Lengkap" | "Selesai";

  // Tambahan untuk mendukung Edit / Lihat laporan
  reportData?: {
    understanding: string;
    participation: string;
    challenges: string;
    questions: string;
    recommendations: string;
    notes: string;
  };
}

interface ReportListProps {
  reports: Report[];
  statusFilter: string;
  programFilter: string;
  searchQuery: string;
}

export default function ReportList({
  reports,
  statusFilter,
  programFilter,
  searchQuery,
}: ReportListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // state modal
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | "view" | null>(
    null
  );
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // --- Filtering ---
  const filteredReports = reports.filter((r) => {
    const matchStatus =
      statusFilter === "Semua" ||
      r.status.toLowerCase() === statusFilter.toLowerCase();
    const matchProgram =
      programFilter === "Semua" ||
      r.type.toLowerCase().includes(programFilter.toLowerCase());
    const matchSearch =
      searchQuery === "" ||
      r.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchProgram && matchSearch;
  });

  // --- Pagination ---
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredReports.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const renderStatusBadge = (status: Report["status"]) => {
    switch (status) {
      case "Belum Diisi":
        return (
          <span className="flex items-center text-red-500 text-sm font-medium gap-2">
            <Image
              src="/assets/dashboard/mentor/redwarning.svg"
              alt="Belum Diisi"
              width={12}
              height={12}
            />
            Belum diisi
          </span>
        );
      case "Belum Lengkap":
        return (
          <span className="flex items-center text-yellow-500 text-sm font-medium gap-2">
            <Image
              src="/assets/dashboard/mentor/service/kuning.svg"
              alt="Belum Lengkap"
              width={12}
              height={12}
            />
            Belum lengkap
          </span>
        );
      case "Selesai":
        return (
          <span className="flex items-center text-emerald-600 text-sm font-medium gap-2">
            <Image
              src="/assets/dashboard/mentor/service/hijau.svg"
              alt="Selesai"
              width={12}
              height={12}
            />
            Selesai
          </span>
        );
    }
  };

  const renderActionButton = (report: Report) => {
    if (report.status === "Belum Diisi") {
      return (
        <button
          onClick={() => {
            setSelectedReport(report);
            setModalType("add");
            setOpenModal(true);
          }}
          className="px-6 py-3 text-base font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 cursor-pointer"
        >
          Isi Laporan
        </button>
      );
    }
    if (report.status === "Belum Lengkap") {
      return (
        <button
          onClick={() => {
            setSelectedReport(report);
            setModalType("edit");
            setOpenModal(true);
          }}
          className="px-6 py-3 text-base font-medium bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 cursor-pointer"
        >
          Edit Laporan
        </button>
      );
    }
    return (
      <button
        onClick={() => {
          setSelectedReport(report);
          setModalType("view");
          setOpenModal(true);
        }}
        className="px-6 py-3 text-base font-medium bg-white text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 cursor-pointer"
      >
        Lihat Laporan
      </button>
    );
  };

  return (
    <>
      <div>
        {/* List */}
        <div className="space-y-4">
          {currentData.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between border rounded-lg p-6 hover:shadow-sm transition"
            >
              <div className="flex flex-col gap-2">
                {renderStatusBadge(report.status)}

                <h2 className="font-semibold text-gray-800 text-xl mt-1">
                  {report.program}
                </h2>

                <div className="flex flex-col text-sm text-gray-600 mt-1 gap-2">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/assets/dashboard/mentor/batal.svg"
                      alt="Calendar"
                      width={12}
                      height={12}
                      className="relative top-[-0.5px]"
                    />
                    <span>{report.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image
                      src="/assets/dashboard/mentor/time.svg"
                      alt="Clock"
                      width={12}
                      height={12}
                      className="relative top-[-0.5px]"
                    />
                    <span>{report.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image
                      src="/assets/dashboard/mentor/service/peserta.svg"
                      alt="Users"
                      width={12}
                      height={12}
                      className="relative top-[-0.5px]"
                    />
                    <span>{report.participants} peserta</span>
                  </div>
                </div>
              </div>
              {renderActionButton(report)}
            </div>
          ))}

          {currentData.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-6">
              Tidak ada laporan yang sesuai.
            </p>
          )}
        </div>

        {/* Pagination */}
        {totalPages >= 1 && (
          <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
            <p>
              Menampilkan {startIndex + 1} -{" "}
              {Math.min(startIndex + itemsPerPage, filteredReports.length)} dari{" "}
              {filteredReports.length} data
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

              {/* Range halaman */}
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

      {/* ✅ Render modal sesuai type */}
      {modalType === "add" && (
        <AddMentorReportModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          program={selectedReport?.program}
          date={selectedReport?.date}
          time={selectedReport?.time}
        />
      )}

      {modalType === "edit" && (
        <EditMentorReportModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          program={selectedReport?.program}
          date={selectedReport?.date}
          time={selectedReport?.time}
          reportData={selectedReport?.reportData}
        />
      )}

      {modalType === "view" && (
        <ShowMentorReportModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          program={selectedReport?.program}
          date={selectedReport?.date}
          time={selectedReport?.time}
          reportData={selectedReport?.reportData}
        />
      )}
    </>
  );
}
