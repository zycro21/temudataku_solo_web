"use client"

import Image from "next/image";

import MentorSidebar from "@/components/dashboard/mentor/sidebarDashboardMentor";
import DashboardAffHeader from "@/components/dashboard/mentor/headerDashboardMentor";
import MentorStatCards from "@/components/dashboard/mentor/mentorStatCards";
import MentorPerformance from "@/components/dashboard/mentor/mentorPerformance";
import MentorEarnings from "@/components/dashboard/mentor/mentorEarnings";
import MentorSessionChart from "@/components/dashboard/mentor/mentorSessionChart";
import MentorTasks from "@/components/dashboard/mentor/mentorTasks";

export default function MainDashboardMentorPage() {
  return (
    <div className="flex mb-8">
      <MentorSidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-72">
        <DashboardAffHeader />
        {/* Main content */}
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          {/* Welcome Section */}
          <div className="flex flex-row gap-5 items-center mb-10">
            <Image
              src="/assets/dashboard/user/avatar.png"
              alt="User Avatar"
              width={50}
              height={50}
              className="rounded-full"
            />
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Selamat Datang Kembali, Maudy!
              </h1>
              <p className="text-md text-gray-500 tracking-wide">
                Senang melihatmu lagi. Siap memulai sesi mentoring hari ini?
              </p>
            </div>
          </div>

          {/* Section: Stat Cards */}
          <div className="max-w-[100%]">
            <MentorStatCards />
          </div>

          {/* Section: Performance + Earnings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 max-w-[100%]">
            <MentorPerformance />
            <MentorEarnings />
          </div>

          {/* Section: Session Chart + Tasks */}
          <div className="flex flex-col lg:flex-row gap-6 mt-6 max-w-[100%]">
            <div className="lg:basis-[55%]">
              <MentorSessionChart />
            </div>
            <div className="lg:basis-[45%]">
              <MentorTasks />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
