"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button"; // gunakan Button custom

interface Session {
  id: number;
  status: "Selesai" | "Belum Lengkap" | "Terjadwal";
  program: string;
  title: string;
  date: string;
  time: string;
  participants: number;
}

interface MentorSessionListProps {
  searchQuery: string;
  statusFilter: string;
  programFilter: string;
}

export default function MentorSessionList({
  searchQuery,
  statusFilter,
  programFilter,
}: MentorSessionListProps) {
  const router = useRouter();

  const sessions: Session[] = [
    {
      id: 1,
      status: "Terjadwal",
      program: "Mentoring Group",
      title: "Data Science",
      date: "Senin, 1 Mei 2025",
      time: "19.00 - 19.45 WIB",
      participants: 4,
    },
    {
      id: 2,
      status: "Belum Lengkap",
      program: "Mentoring Group",
      title: "Data Science",
      date: "Selasa, 2 Mei 2025",
      time: "18.00 - 18.45 WIB",
      participants: 3,
    },
    {
      id: 3,
      status: "Selesai",
      program: "Bootcamp",
      title: "Data Analyst",
      date: "Rabu, 3 Mei 2025",
      time: "20.00 - 20.45 WIB",
      participants: 5,
    },
    {
      id: 4,
      status: "Selesai",
      program: "Mentoring Group",
      title: "Web Development",
      date: "Kamis, 4 Mei 2025",
      time: "19.00 - 19.45 WIB",
      participants: 6,
    },
    {
      id: 5,
      status: "Terjadwal",
      program: "Bootcamp",
      title: "UI/UX Design",
      date: "Jumat, 5 Mei 2025",
      time: "17.00 - 17.45 WIB",
      participants: 8,
    },
    {
      id: 6,
      status: "Belum Lengkap",
      program: "Mentoring Group",
      title: "Machine Learning",
      date: "Sabtu, 6 Mei 2025",
      time: "16.00 - 16.45 WIB",
      participants: 2,
    },
    {
      id: 7,
      status: "Selesai",
      program: "Bootcamp",
      title: "Cloud Computing",
      date: "Minggu, 7 Mei 2025",
      time: "15.00 - 15.45 WIB",
      participants: 10,
    },
    {
      id: 8,
      status: "Terjadwal",
      program: "Mentoring Group",
      title: "Cyber Security",
      date: "Senin, 8 Mei 2025",
      time: "19.30 - 20.15 WIB",
      participants: 7,
    },
    {
      id: 9,
      status: "Belum Lengkap",
      program: "Bootcamp",
      title: "Mobile Development",
      date: "Selasa, 9 Mei 2025",
      time: "18.30 - 19.15 WIB",
      participants: 3,
    },
    {
      id: 10,
      status: "Selesai",
      program: "Mentoring Group",
      title: "Digital Marketing",
      date: "Rabu, 10 Mei 2025",
      time: "20.30 - 21.15 WIB",
      participants: 9,
    },
    {
      id: 11,
      status: "Terjadwal",
      program: "Bootcamp",
      title: "DevOps Fundamentals",
      date: "Kamis, 11 Mei 2025",
      time: "19.00 - 19.45 WIB",
      participants: 4,
    },
    {
      id: 12,
      status: "Belum Lengkap",
      program: "Mentoring Group",
      title: "Product Management",
      date: "Jumat, 12 Mei 2025",
      time: "17.30 - 18.15 WIB",
      participants: 6,
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // ⬅ jadikan state

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

    // Urutkan jika status & program = Semua
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
        {filteredSessions.length === 0 ? (
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
                {/* Left content */}
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

                {/* Right content: action buttons */}
                <CardFooter className="flex flex-col gap-3 p-0 items-end justify-center">
                  {/* Detail Sesi */}
                  <Button
                    variant="outline"
                    className="w-36 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                  >
                    Detail Sesi
                  </Button>

                  <Button
                    variant="default"
                    onClick={() =>
                      router.push("/dashboard/mentor/services/project")
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
      {filteredSessions.length > 0 && (
        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <p>
            Menampilkan {startIdx + 1} -{" "}
            {Math.min(startIdx + itemsPerPage, filteredSessions.length)} dari{" "}
            {filteredSessions.length} data
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
  );
}
