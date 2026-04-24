"use client";

import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import ScheduleStatCards from "@/components/dashboard/user/jadwal/scheduleStatCards";
import CalendarSection from "@/components/dashboard/user/jadwal/calendarSection";
import DayEventsSection from "@/components/dashboard/user/jadwal/dayEventsSection";
import { CalendarProvider } from "@/components/dashboard/user/jadwal/calendarContext";

export default function JadwalDashboardUserPage() {
  return (
    <div className="flex">
      <Sidebar />

      {/* ✅ FIX: samakan dengan dashboard utama */}
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <DashboardHeader />

        {/* ✅ FIX: padding diperkecil + anti overflow */}
        <main className="flex-1 px-5 py-4 bg-gray-50 overflow-x-hidden">
          {/* ✅ FIX: font lebih kecil */}
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Jadwal</h1>

          <CalendarProvider>
            {/* ✅ FIX: gap lebih kecil + min-w-0 */}
            <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
              <div className="min-w-0">
                <ScheduleStatCards />
              </div>

              <div className="min-w-0"></div>
            </div>

            {/* ✅ FIX: card lebih compact */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 min-w-0">
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
