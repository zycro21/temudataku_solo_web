"use client";

import { useState } from "react";
import MentorSidebar from "@/components/dashboard/mentor/sidebarDashboardMentor";
import DashboardAffHeader from "@/components/dashboard/mentor/headerDashboardMentor";
import MentorStatCards from "@/components/dashboard/mentor/report/mentorStatCardsReport";
import ReportFilters from "@/components/dashboard/mentor/report/reportFilters";
import ReportList from "@/components/dashboard/mentor/report/reportList";

export default function ReportDashboardMentorPage() {
  // state untuk filter
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [programFilter, setProgramFilter] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <div className="flex mb-8">
      <MentorSidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-64">
        <DashboardAffHeader />
        {/* Main content */}
        <main className="flex-1 p-5 pl-6 bg-gray-50 overflow-x-hidden">
          <h1 className="text-xl font-semibold text-gray-800 mb-1">
            Laporan Mentor
          </h1>
          <p className="mt-0 mb-6 text-sm text-gray-500">
            Halaman ini berisi laporan mentoring yang Anda isi setelah setiap
            sesi untuk mencatat perkembangan mentee, evaluasi pemahaman, serta
            catatan penting lainnya.
          </p>

          {/* 1. Stat cards */}
          <div className="max-w-[100%] mb-5">
            <MentorStatCards />
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              Riwayat Laporan
            </h2>
            {/* Konten Utama */}
            <div className="bg-white rounded-lg shadow-sm p-5 pb-2">
              {/* 2. Filter section */}
              <section className="mb-1">
                <ReportFilters
                  statusFilter={statusFilter}
                  programFilter={programFilter}
                  searchQuery={searchQuery}
                  onStatusChange={(val) => setStatusFilter(val)}
                  onProgramChange={(val) => setProgramFilter(val)}
                  onSearchChange={(val) => setSearchQuery(val)}
                />
              </section>

              <section className="mb-6">
                <ReportList
                  statusFilter={statusFilter}
                  programFilter={programFilter}
                  searchQuery={searchQuery}
                />
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
