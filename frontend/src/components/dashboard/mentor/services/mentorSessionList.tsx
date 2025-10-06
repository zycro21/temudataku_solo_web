"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface Session {
  id: string;
  serviceId: string;
  status: "Selesai" | "Belum Lengkap" | "Terjadwal";
  program: string;
  title: string;
  date: string;
  time: string;
  participants: number | string;
}

interface MentorSessionListProps {
  searchQuery: string;
  statusFilter: string;
  programFilter: string;
}

// Mapping status API -> UI
const mapStatus = (
  status: string
): "Selesai" | "Belum Lengkap" | "Terjadwal" | null => {
  switch (status) {
    case "scheduled":
      return "Terjadwal";
    case "ongoing":
      return "Belum Lengkap";
    case "completed":
      return "Selesai";
    case "cancelled":
      return null; // skip cancelled
    default:
      return null;
  }
};

// Mapping program API -> UI
const mapProgram = (program: string): string => {
  switch (program) {
    case "one-on-one":
      return "Mentoring 1 on 1";
    case "group":
      return "Mentoring Group";
    case "bootcamp":
      return "Bootcamp";
    case "shortclass":
      return "Short Class";
    case "live class":
      return "Live Class";
    default:
      return "-";
  }
};

export default function MentorSessionList({
  searchQuery,
  statusFilter,
  programFilter,
}: MentorSessionListProps) {
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/mentor/own-mentoring-sessions`,
          {
            // params: { page: 1, limit: 1000 },
            withCredentials: true,
          }
        );

        const mapped: Session[] = res.data
          .map((s: any) => {
            const mappedStatus = mapStatus(s.status);
            if (!mappedStatus) return null; // skip cancelled

            const [day, month, year] = s.date.split("-");
            const parsedDate = new Date(+year, +month - 1, +day);
            const date = parsedDate.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            const start = new Date(s.startTime).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const end = new Date(s.endTime).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return {
              id: s.id,
              serviceId: s.serviceId, // <── tambahkan ini
              status: mappedStatus,
              program: mapProgram(s.serviceType),
              title: s.serviceName || "-",
              date: date,
              time: `${start} - ${end} WIB`,
              participants: "-", // API belum ada jumlah peserta
            };
          })
          .filter(Boolean);

        setSessions(mapped);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter + sort
  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = sessions.filter((s) => {
      const matchSearch =
        s.title.toLowerCase().includes(query) ||
        s.program.toLowerCase().includes(query);
      const matchStatus = statusFilter === "Semua" || s.status === statusFilter;
      const matchProgram =
        programFilter === "Semua" || s.program === programFilter;
      return matchSearch && matchStatus && matchProgram;
    });

    if (statusFilter === "Semua" && programFilter === "Semua") {
      const order = { Terjadwal: 1, "Belum Lengkap": 2, Selesai: 3 };
      result = result.sort((a, b) => order[a.status] - order[b.status]);
    }

    return result;
  }, [sessions, searchQuery, statusFilter, programFilter]);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedSessions = filteredSessions.slice(
    startIdx,
    startIdx + itemsPerPage
  );
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Selesai":
        return "text-green-600";
      case "Belum Lengkap":
        return "text-yellow-600";
      case "Terjadwal":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Selesai":
        return "/assets/dashboard/mentor/service/hijau.svg";
      case "Belum Lengkap":
        return "/assets/dashboard/mentor/service/kuning.svg";
      case "Terjadwal":
        return "/assets/dashboard/mentor/service/merah.svg";
      default:
        return "/assets/dashboard/mentor/service/merah.svg";
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-600 py-10">
            <p>Loading...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="col-span-full text-center text-gray-600 py-10">
            {searchQuery ? (
              <p>
                Hasil pencarian untuk "
                <span className="font-semibold">{searchQuery}</span>" tidak
                ditemukan.
              </p>
            ) : statusFilter === "Semua" && programFilter !== "Semua" ? (
              <p>Anda tidak memiliki jenis program {programFilter}.</p>
            ) : programFilter === "Semua" && statusFilter !== "Semua" ? (
              <p>Anda tidak memiliki program dengan status {statusFilter}.</p>
            ) : programFilter !== "Semua" && statusFilter !== "Semua" ? (
              <p>
                Anda tidak memiliki program dengan jenis {programFilter} dan
                statusnya {statusFilter}.
              </p>
            ) : (
              <p>Data tidak tersedia.</p>
            )}
          </div>
        ) : (
          paginatedSessions.map((s) => (
            <Card
              key={s.id}
              className="p-6 pb-3 flex flex-col justify-between border rounded-lg text-base"
            >
              <CardContent className="p-0 mb-4 flex justify-between items-center">
                <div>
                  <div
                    className={`flex items-center mb-3 ${getStatusColor(
                      s.status
                    )}`}
                  >
                    <Image
                      src={getStatusIcon(s.status)}
                      alt={s.status}
                      width={12}
                      height={12}
                      className="mr-2"
                    />
                    <span className="font-semibold">{s.status}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {s.program} - {s.title}
                  </h3>

                  <div className="flex items-center text-gray-600 mb-2">
                    <Image
                      src="/assets/dashboard/mentor/report.svg"
                      alt="date"
                      width={14}
                      height={14}
                      className="mr-2"
                    />
                    <span>{s.date}</span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-2">
                    <Image
                      src="/assets/dashboard/mentor/time.svg"
                      alt="time"
                      width={14}
                      height={14}
                      className="mr-2"
                    />
                    <span>{s.time}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Image
                      src="/assets/dashboard/mentor/service/peserta.svg"
                      alt="users"
                      width={14}
                      height={14}
                      className="mr-2"
                    />
                    <span>{s.participants} peserta</span>
                  </div>
                </div>

                <CardFooter className="flex flex-col gap-3 p-0 items-end justify-center">
                  <Button
                    variant="outline"
                    className="w-36 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                  >
                    Detail Sesi
                  </Button>

                  <Button
                    variant="default"
                    onClick={() =>
                      router.push(
                        `/dashboard/mentor/services/project?serviceId=${s.serviceId}`
                      )
                    }
                    className="w-36 bg-emerald-500 text-white hover:bg-white hover:text-emerald-600 hover:border hover:border-emerald-500"
                  >
                    Lihat Project
                  </Button>
                </CardFooter>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredSessions.length > 0 && !loading && (
        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <p>
            Menampilkan {startIdx + 1} -{" "}
            {Math.min(startIdx + itemsPerPage, filteredSessions.length)} dari{" "}
            {filteredSessions.length} data
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              {"<"}
            </button>

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

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
  );
}
