"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AddMentorReportModal from "./AddMentorReportModal";
import EditMentorReportModal from "./editMentorReport";
import ShowMentorReportModal from "./viewMentorReport";
import axios from "axios";
import { toast } from "sonner";

// ============================
// TIPE DATA & FETCH LOGIC
// ============================

interface Session {
  id: string;
  serviceName: string;
  serviceType: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface ReportData {
  id: string;
  sessionId: string;
  understanding?: string;
  participation?: string;
  challenges?: string;
  commonQuestions?: string;
  nextFocus?: string;
  additionalNotes?: string;
}

interface CombinedReport {
  id: string;
  program: string;
  type: string;
  date: string;
  time: string;
  participants: number;
  status: "Belum Diisi" | "Belum Lengkap" | "Selesai";
  reportData?: ReportData;
}

interface ReportListProps {
  statusFilter: string;
  programFilter: string;
  searchQuery: string;
}

const mapReportData = (data?: ReportData) => {
  if (!data) return undefined;
  return {
    understanding: data.understanding || "",
    participation: data.participation || "",
    challenges: data.challenges || "",
    questions: data.commonQuestions || "",
    recommendations: data.nextFocus || "",
    notes: data.additionalNotes || "",
  };
};

// Format tanggal ke "Senin, 28 April 2025"
const formatDateIndo = (dateString: string): string => {
  if (!dateString) return "-";

  // Deteksi format dd-mm-yyyy dan ubah ke yyyy-mm-dd biar bisa di-parse
  let formattedDate = dateString;
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split("-");
    formattedDate = `${year}-${month}-${day}`;
  }

  const date = new Date(formattedDate);
  if (isNaN(date.getTime())) return "-";

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  };

  return date.toLocaleDateString("id-ID", options);
};

// Format waktu ke "07.00 - 08.00" WIB
const formatTimeRange = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return "-";
  const start = new Date(startTime);
  const end = new Date(endTime);

  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  };

  const startFormatted = start
    .toLocaleTimeString("id-ID", options)
    .replace(".", ":");
  const endFormatted = end
    .toLocaleTimeString("id-ID", options)
    .replace(".", ":");

  return `${startFormatted} - ${endFormatted}`;
};

export default function ReportList({
  statusFilter,
  programFilter,
  searchQuery,
}: ReportListProps) {
  const [reports, setReports] = useState<CombinedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | "view" | null>(
    null
  );
  const [selectedReport, setSelectedReport] = useState<CombinedReport | null>(
    null
  );
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, programFilter, searchQuery]);

  // ============================
  // FETCH & MERGE DATA LOGIC
  // ============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1️⃣ Ambil semua laporan mentor
        const reportRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorReports/mentor/reports?page=1&limit=1000`,
          { withCredentials: true }
        );
        const reports = reportRes.data.data || [];

        // 2️⃣ Ambil semua sesi mentor
        const sessionRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/mentor/own-mentoring-sessions`,
          { withCredentials: true }
        );
        const sessions = sessionRes.data || [];

        // 3️⃣ Gabungkan data
        const merged: CombinedReport[] = sessions.map((session: Session) => {
          const report = reports.find(
            (r: ReportData) => r.sessionId === session.id
          );

          const isIncomplete = (r?: ReportData) => {
            if (!r) return false;
            const keys = [
              "understanding",
              "participation",
              "challenges",
              "commonQuestions",
              "nextFocus",
            ];
            return keys.some(
              (k) =>
                !r[k as keyof ReportData] || r[k as keyof ReportData] === ""
            );
          };

          let status: CombinedReport["status"];
          if (!report) status = "Belum Diisi";
          else if (isIncomplete(report)) status = "Belum Lengkap";
          else status = "Selesai";

          return {
            id: session.id,
            program: session.serviceName || "-",
            type: session.serviceType || "Mentoring 1 on 1",
            date: formatDateIndo(session.date),
            time: formatTimeRange(session.startTime, session.endTime),
            participants: 1,
            status,
            reportData: report,
          };
        });

        setReports(merged);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data laporan mentor");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============================
  // ⬇️ FILTERING & PAGINATION
  // ============================
  const typeMapping: Record<string, string> = {
    "Mentoring 1 on 1": "one-on-one",
    "Mentoring Group": "group",
    Bootcamp: "bootcamp",
    "Short Class": "shortclass",
    "Live Class": "live class",
  };

  const filteredReports = reports.filter((r) => {
    const matchStatus =
      statusFilter === "Semua" ||
      r.status.toLowerCase() === statusFilter.toLowerCase();

    const matchProgram =
      programFilter === "Semua" ||
      r.type.toLowerCase() === typeMapping[programFilter]?.toLowerCase();

    const matchSearch =
      searchQuery === "" ||
      r.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase());

    return matchStatus && matchProgram && matchSearch;
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredReports.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ============================
  // ⬇️ UI BAGIAN LIST & MODAL
  // ============================

  if (loading)
    return (
      <p className="text-center text-gray-500 py-6">Memuat data laporan...</p>
    );

  if (error) return <p className="text-center text-red-500 py-6">{error}</p>;

  const renderStatusBadge = (status: CombinedReport["status"]) => {
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

  const renderActionButton = (report: CombinedReport) => {
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

      {/* Modal */}
      {modalType === "add" && selectedReport && (
        <AddMentorReportModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          program={selectedReport.program}
          date={selectedReport.date}
          time={selectedReport.time}
        />
      )}

      {modalType === "edit" && selectedReport && (
        <EditMentorReportModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          program={selectedReport.program}
          date={selectedReport.date}
          time={selectedReport.time}
          reportData={mapReportData(selectedReport.reportData)}
        />
      )}

      {modalType === "view" && selectedReport && (
        <ShowMentorReportModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          program={selectedReport.program}
          date={selectedReport.date}
          time={selectedReport.time}
          reportData={mapReportData(selectedReport.reportData)}
        />
      )}
    </>
  );
}
