"use client";

import Image from "next/image";
import MentorSidebar from "@/components/dashboard/mentor/sidebarDashboardMentor";
import DashboardAffHeader from "@/components/dashboard/mentor/headerDashboardMentor";
import MentorStatCards from "@/components/dashboard/mentor/report/mentorStatCardsReport";
// import ReportFilters from "@/components/dashboard/mentor/report/reportFilters";
// import ReportList from "@/components/dashboard/mentor/report/reportList";
// import ReportPagination from "@/components/dashboard/mentor/report/reportPagination";

export default function ReportDashboardMentorPage() {
  return (
    <div className="flex mb-8">
      <MentorSidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-72">
        <DashboardAffHeader />
        {/* Main content */}
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">
            Laporan Mentor
          </h1>
          <p className="mt-0 mb-10 text-gray-500">
            Halaman ini berisi laporan mentoring yang Anda isi setelah setiap
            sesi untuk mencatat perkembangan mentee, evaluasi pemahaman, serta
            catatan penting lainnya.
          </p>

          {/* 1. Stat cards */}
          <MentorStatCards />

          {/* 2. Filter section */}
          {/* <ReportFilters /> */}

          {/* 3. Report list */}
          {/* <ReportList /> */}

          {/* 4. Pagination */}
          {/* <ReportPagination /> */}
        </main>
      </div>
    </div>
  );
}
