"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import ScheduleStatCards from "@/components/dashboard/user/jadwal/scheduleStatCards";
import CalendarSection from "@/components/dashboard/user/jadwal/calendarSection";
import DayEventsSection from "@/components/dashboard/user/jadwal/dayEventsSection";
import { CalendarProvider } from "@/components/dashboard/user/jadwal/calendarContext";

export default function JadwalDashboardUserPage() {
  // 🔥 BARU: state drawer sidebar mobile — pola sama persis kayak
  // page.tsx Overview.
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 🔥 DIUBAH: "ml-64" (fixed) → "ml-0 md:ml-64" — sama pola kayak
          Overview: di mobile sidebar jadi drawer (nggak makan tempat),
          balik PERSIS "ml-64" mulai md: ke atas. */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64 min-w-0">
        <DashboardHeader
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* 🔥 DIUBAH: px-5 → px-3 md:px-5, biar nggak mepet ke tepi layar
            di HP; balik PERSIS px-5 mulai md: ke atas. */}
        <main className="flex-1 px-3 md:px-5 py-4 bg-gray-50 overflow-x-hidden">
          {/* 🔥 BARU: kartu judul khusus MOBILE (md:hidden) — konsisten
              sama pola kartu sapaan di Overview. TIDAK muncul di desktop
              (digantikan <h1> di bawahnya). */}
          <div className="md:hidden mb-4 rounded-xl bg-white border border-gray-200 p-4">
            <p className="text-base font-semibold text-gray-800">Jadwal</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Lihat jadwal mentoring kamu di sini
            </p>
          </div>

          {/* 🔥 DIUBAH: <h1> ASLI tidak diubah sama sekali — cuma ditambah
              "hidden md:block" biar disembunyikan di mobile (digantikan
              kartu di atas) dan identik seperti semula mulai md: ke atas. */}
          <h1 className="hidden md:block text-xl font-semibold text-gray-800 mb-4">
            Jadwal
          </h1>

          <CalendarProvider>
            <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
              <div className="min-w-0">
                <ScheduleStatCards />
              </div>

              <div className="min-w-0"></div>
            </div>

            {/* 🔥 DIUBAH: p-4 → p-3 sm:p-4, sedikit lebih rapat di mobile,
                balik PERSIS p-4 mulai sm: ke atas. */}
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 min-w-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-w-0">
                {/* Kiri */}
                <div className="lg:col-span-2 min-w-0">
                  <CalendarSection />
                </div>

                {/* Kanan */}
                <div className="lg:col-span-1 min-w-0">
                  <DayEventsSection />
                </div>
              </div>
            </div>
          </CalendarProvider>
        </main>
      </div>
    </div>
  );
}
