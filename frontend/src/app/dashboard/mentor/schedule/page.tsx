import Image from "next/image";

import MentorSidebar from "@/components/dashboard/mentor/sidebarDashboardMentor";
import DashboardAffHeader from "@/components/dashboard/mentor/headerDashboardMentor";
// import MentorStatCards from "@/components/dashboard/mentor/mentorStatCardSchedule";

export default function ScheduleDashboardMentorPage() {
  return (
    <div className="flex mb-8">
      <MentorSidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-72">
        <DashboardAffHeader />
        {/* Main content */}
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-2xl font-semibold text-gray-800">Schedule</h1>
          <p className="mt-0 mb-10 text-gray-500">
            Halaman ini menampilkan jadwal sesi mentoring, bootcamp, dan
            shortclass Anda, baik yang akan datang maupun yang telah
            berlangsung.
          </p>

          <div className="max-w-[100%]">
            {/* <MentorStatCards /> */}
          </div>
        </main>
      </div>
    </div>
  );
}
