"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import FeedbackFilters from "@/components/dashboard/user/feedback/feedbackFilters";
import FeedbackSection from "@/components/dashboard/user/feedback/feedbackSection";

function formatDateAndTime(date: string, startTime: string, endTime: string) {
  try {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const [day, month, year] = date.split("-");
    const formattedDate = `${parseInt(day)} ${
      months[parseInt(month) - 1]
    } ${year}`;

    const formatTime = (iso: string) => {
      const d = new Date(iso);
      return d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };

    const start = formatTime(startTime);
    const end = formatTime(endTime);

    return { formattedDate, formattedTime: `${start} - ${end}` };
  } catch {
    return { formattedDate: date, formattedTime: `${startTime} - ${endTime}` };
  }
}

interface Feedback {
  id: string;
  title: string;
  description: string;
  program: string;
  category: string;
  date: string;
  time: string;
  mentor: string;
  image: string;
  status: "Belum" | "Sudah";
  answers?: { [key: number]: string };
  input1?: string;
  input2?: string;
}

export default function FeedbackDashboardUserPage() {
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
  const [programFilter, setProgramFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  // 🔥 BARU: state drawer sidebar mobile — pola sama persis kayak
  // page.tsx Overview/Jadwal.
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/mentee/bookings`,
        {
          params: { page: 1, limit: 1000 },
          withCredentials: true,
        },
      );

      const bookingsRaw = res.data.data.data || [];

      const bookings = bookingsRaw.filter((b: any) =>
        ["confirmed", "completed"].includes(
          (b.status || "").toLowerCase().trim(),
        ),
      );

      const transformed = bookings.flatMap((booking: any) => {
        const service = booking.mentoringService;
        if (!service || !service.mentoringSessions) return [];

        return service.mentoringSessions.map((session: any) => {
          const { formattedDate, formattedTime } = formatDateAndTime(
            session.date,
            session.startTime,
            session.endTime,
          );

          return {
            id: `${booking.id}-${session.id}`, // FIX
            title: session.notes || "Sesi Mentoring",
            description: service.description || "",
            program: service.serviceType || "Mentoring",
            category: service.serviceName,
            date: formattedDate,
            time: formattedTime,
            mentor:
              session.mentors?.[0]?.mentorProfile?.user?.fullName ||
              "Mentor Tidak Diketahui",
            image:
              session.mentors?.[0]?.mentorProfile?.user?.profilePicture || "",
            status: session.feedbacks?.length > 0 ? "Sudah" : "Belum",
          };
        });
      });

      setFeedbackData(transformed);
    } catch (error) {
      console.error("Gagal fetch feedback data:", error);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const filteredFeedbacks = useMemo(() => {
    return feedbackData.filter((f) => {
      const matchProgram =
        programFilter === "Semua" ||
        f.program.toLowerCase() === programFilter.toLowerCase();

      const matchSearch =
        searchQuery === "" ||
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchProgram && matchSearch;
    });
  }, [programFilter, searchQuery, feedbackData]);

  const groupedFeedbacks = useMemo(() => {
    const groups: Record<string, Feedback[]> = {};
    filteredFeedbacks.forEach((f) => {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    });
    return groups;
  }, [filteredFeedbacks]);

  return (
    <div className="flex">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 🔥 DIUBAH: "ml-64" → "ml-0 md:ml-64" — sama pola kayak
          Overview/Jadwal: di mobile sidebar jadi drawer, balik PERSIS
          "ml-64" mulai md: ke atas. */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64 min-w-0">
        <DashboardHeader
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* 🔥 DIUBAH: px-5 → px-3 md:px-5 */}
        <main className="flex-1 px-3 md:px-5 py-4 bg-gray-50 overflow-x-hidden">
          {/* 🔥 BARU: kartu judul khusus MOBILE (md:hidden), konsisten
              sama pola di Overview/Jadwal. TIDAK muncul di desktop. */}
          <div className="md:hidden mb-4 rounded-xl bg-white border border-gray-200 p-4">
            <p className="text-base font-semibold text-gray-800">Feedback</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Isi feedback sesi mentoring yang sudah kamu ikuti
            </p>
          </div>

          {/* 🔥 DIUBAH: <h1> ASLI tidak diubah sama sekali (termasuk
              ukuran text-3xl-nya) — cuma ditambah "hidden md:block". */}
          <h1 className="hidden md:block text-3xl font-semibold text-gray-800 mb-4">
            Feedback
          </h1>

          <div className="space-y-4 min-w-0">
            <FeedbackFilters
              programFilter={programFilter}
              searchQuery={searchQuery}
              onProgramChange={setProgramFilter}
              onSearchChange={setSearchQuery}
            />

            {Object.keys(groupedFeedbacks).length === 0 ? (
              <p className="text-sm text-gray-500">
                Tidak ada feedback dalam kategori {programFilter}.
              </p>
            ) : (
              Object.entries(groupedFeedbacks).map(([category, feedbacks]) => (
                <div key={category} className="min-w-0">
                  <FeedbackSection
                    title={category}
                    feedbacks={feedbacks}
                    onFeedbackSubmitted={fetchFeedbacks}
                  />
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
