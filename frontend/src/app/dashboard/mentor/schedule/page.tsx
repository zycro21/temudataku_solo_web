"use client";

import MentorSidebar from "@/components/dashboard/mentor/sidebarDashboardMentor";
import DashboardAffHeader from "@/components/dashboard/mentor/headerDashboardMentor";
import MentorStatCards from "@/components/dashboard/mentor/schedule/mentorStatCardSchedule";
import CalendarSectionMentor from "@/components/dashboard/mentor/schedule/calendarSectionMentor";
import DayEventsSectionMentor from "@/components/dashboard/mentor/schedule/dayEventsSectionMentor";

export default function ScheduleDashboardMentorPage() {
  return (
    <div className="flex mb-8">
      <MentorSidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-72">
        <DashboardAffHeader />

        {/* Main content */}
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          {/* Title & description */}
          <h1 className="text-2xl font-semibold text-gray-800">Schedule</h1>
          <p className="mt-0 mb-8 text-gray-500">
            Halaman ini menampilkan jadwal sesi mentoring, bootcamp, dan
            shortclass Anda, baik yang akan datang maupun yang telah
            berlangsung.
          </p>

          {/* Section: Stat Cards */}
          <div className="max-w-[100%]">
            <MentorStatCards />
          </div>

          {/* Section: Calendar & Day Events */}
          <div className="p-6 pl-0 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
              {/* Kiri: Kalender */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Kalender Sesi
                </h2>
                {/* Kirim events ke Calendar */}
                <CalendarSectionMentor />
              </div>

              {/* Kanan: Jadwal Hari Ini */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Jadwal Sesi
                </h2>
                {/* Kirim events ke DayEvents */}
                <DayEventsSectionMentor />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
