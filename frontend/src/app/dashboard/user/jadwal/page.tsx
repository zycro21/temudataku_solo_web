// src/app/main/dashboard/user/jadwal/page.tsx
import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import ScheduleStatCards from "@/components/dashboard/user/jadwal/scheduleStatCards";
import CalendarSection from "@/components/dashboard/user/jadwal/calendarSection";
import DayEventsSection from "@/components/dashboard/user/jadwal/dayEventsSection";
import { CalendarProvider } from "@/components/dashboard/user/jadwal/calendarContext";

export default function JadwalDashboardUserPage() {
  return (
    <div className="flex mb-8">
      <Sidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-72">
        <DashboardHeader />
        {/* Main content */}
        <main className="flex-1 p-6 pl-7 bg-gray-50">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">Jadwal</h1>

          <CalendarProvider>
            {/* Section: Stat Cards */}
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kiri: Stat Cards */}
              <div>
                <ScheduleStatCards />
              </div>

              {/* Kanan: Kosong */}
              <div></div>
            </div>

            {/* Section: Calendar & Day Events */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kiri: Kalender (2/3) */}
                <div className="lg:col-span-2">
                  <CalendarSection />
                </div>

                {/* Kanan: Jadwal Hari Ini (1/3) */}
                <div className="lg:col-span-1">
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
