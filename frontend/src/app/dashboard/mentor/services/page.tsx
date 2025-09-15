"use client";

import Image from "next/image";
import MentorSidebar from "@/components/dashboard/mentor/sidebarDashboardMentor";
import DashboardAffHeader from "@/components/dashboard/mentor/headerDashboardMentor";
import MentorStatCards from "@/components/dashboard/mentor/services/mentorStatCardServices";
// import MentorSessionFilters from "@/components/dashboard/mentor/services/mentorSessionFilters";
// import MentorSessionList from "@/components/dashboard/mentor/services/mentorSessionList";
// import MentorPagination from "@/components/dashboard/mentor/services/mentorPagination";

export default function ServicesDashboardMentorPage() {
  return (
    <div className="flex mb-8">
      <MentorSidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-72">
        <DashboardAffHeader />
        {/* Main content */}
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-2xl font-semibold text-gray-800">
            Session Services
          </h1>
          <p className="mt-0 mb-10 text-gray-500">
            Halaman ini membantu Anda melacak perkembangan dan memahami proses
            belajar mentee yang Anda dampingi.
          </p>

          {/* Stat Cards */}
          <div className="max-w-[100%] mb-10">
            <MentorStatCards />
          </div>

          {/* Filter & Search */}
          <section className="mb-8">
            {/* <MentorSessionFilters /> */}
          </section>

          {/* Session List */}
          <section className="mb-8">
            {/* <MentorSessionList /> */}
          </section>

          {/* Pagination */}
          <section className="flex justify-between items-center">
            {/* <MentorPagination /> */}
          </section>
        </main>
      </div>
    </div>
  );
}
