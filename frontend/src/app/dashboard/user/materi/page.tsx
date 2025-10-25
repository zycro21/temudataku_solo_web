"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import MateriFilters from "@/components/dashboard/user/materi/materiFilters";
import MateriSection from "@/components/dashboard/user/materi/materiSection";
import { Ban } from "lucide-react";
import Link from "next/link";

interface Materi {
  id: string;
  title: string;
  description: string;
  program: string;
  category: string;
  dateRange: string;
  image: string;
  pptLink?: string;
  videoLink?: string;
  mentorName?: string;
}

// Mapping label sesuai serviceType di backend
const PROGRAM_LABELS: Record<string, string> = {
  "one-on-one": "Mentoring 1 on 1",
  group: "Mentoring Group",
  bootcamp: "Bootcamp",
  shortclass: "Short Class",
  "live class": "Live Class",
};

export default function MateriDashboardUserPage() {
  const [programFilter, setProgramFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/mentee/bookings`,
          {
            params: { page: 1, limit: 1000 },
            withCredentials: true,
          }
        );

        const bookings = res.data.data.data;

        // 🔄 Normalisasi data mentoring sessions
        const materiData: Materi[] = bookings.flatMap((booking: any) =>
          (booking.mentoringService?.mentoringSessions || []).map(
            (session: any) => {
              const rawProgram = booking.mentoringService?.serviceType || "";
              const normalizedProgram = rawProgram.toLowerCase().trim();

              return {
                id: session.id,
                title: session.notes || `Pertemuan ${session.date}`,
                description:
                  booking.mentoringService?.description ||
                  "Deskripsi tidak tersedia.",
                program: normalizedProgram,
                category:
                  booking.mentoringService?.serviceName || "Mentoring Session",
                dateRange: session.date,
                image: "/assets/dashboard/user/kokok.png",
                pptLink: session.pptLink || undefined,
                videoLink: session.recordingLink || undefined,
                mentorName:
                  session.mentors?.[0]?.mentorProfile?.user?.fullName ||
                  "Mentor belum terdaftar",
              };
            }
          )
        );

        setMateriList(materiData);
      } catch (error) {
        console.error("Gagal fetch materi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMateri();
  }, []);

  // ✅ Filter hanya yang sesuai label
  const allMateri: Materi[] = materiList.filter((m) =>
    Object.keys(PROGRAM_LABELS).includes(m.program)
  );

  // 🔍 Filter berdasarkan program & pencarian
  const filteredMateri = useMemo(() => {
    return allMateri.filter((m) => {
      const matchProgram =
        programFilter === "Semua" ||
        PROGRAM_LABELS[m.program] === programFilter;
      const matchSearch =
        searchQuery === "" ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProgram && matchSearch;
    });
  }, [allMateri, programFilter, searchQuery]);

  // 📚 Group berdasarkan kategori
  const groupedMateri = useMemo(() => {
    const groups: Record<string, Materi[]> = {};
    filteredMateri.forEach((m) => {
      if (!groups[m.category]) groups[m.category] = [];
      groups[m.category].push(m);
    });
    return groups;
  }, [filteredMateri]);

  const isEmpty = Object.keys(groupedMateri).length === 0;

  // 🧭 Tentukan link fallback berdasarkan program
  const getCobaLink = () => {
    const targetProgram =
      programFilter === "Semua" ? "Bootcamp" : programFilter;

    if (["Bootcamp", "Short Class", "Live Class"].includes(targetProgram)) {
      return "/programs";
    }
    if (["Mentoring Group", "Mentoring 1 on 1"].includes(targetProgram)) {
      return "/mentoring";
    }
    return "/";
  };

  return (
    <div className="flex mb-8">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-72">
        <DashboardHeader />
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">Materi</h1>

          {/* Filter Section */}
          <MateriFilters
            programFilter={programFilter}
            searchQuery={searchQuery}
            onProgramChange={setProgramFilter}
            onSearchChange={setSearchQuery}
          />

          {/* Loading / Kosong / Data */}
          {loading ? (
            <div className="text-center py-20 text-gray-500">
              Memuat materi...
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <Ban className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-700 font-semibold mb-1">
                Belum ada {programFilter === "Semua" ? "materi" : programFilter}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Saat ini, Anda belum memiliki{" "}
                {programFilter === "Semua" ? "materi" : programFilter} yang
                dapat diakses
              </p>
              <Link
                href={getCobaLink()}
                className="px-4 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition cursor-pointer"
              >
                Coba {programFilter === "Semua" ? "Bootcamp" : programFilter}
              </Link>
            </div>
          ) : (
            Object.entries(groupedMateri).map(([category, materis]) => (
              <MateriSection
                key={category}
                title={category}
                materis={materis.map((m) => ({
                  ...m,
                  program: PROGRAM_LABELS[m.program] || m.program,
                }))}
              />
            ))
          )}
        </main>
      </div>
    </div>
  );
}
