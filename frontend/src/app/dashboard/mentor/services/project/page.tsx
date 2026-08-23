"use client";

import { useState, Suspense } from "react";
import MentorSidebar from "@/components/dashboard/mentor/sidebarDashboardMentor";
import DashboardAffHeader from "@/components/dashboard/mentor/headerDashboardMentor";
import { ChevronRight } from "lucide-react";
import MentorStatCards from "@/components/dashboard/mentor/services/mentorStatCardServices";
import ProjectFilters from "@/components/dashboard/mentor/services/project/projectFilters";
import ProjectTable from "@/components/dashboard/mentor/services/project/projectTable";

export default function ScheduleDashboardMentorPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  return (
    <div className="flex mb-8">
      <MentorSidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-64">
        <DashboardAffHeader />
        {/* Main content */}
        <main className="flex-1 p-5 pl-6 bg-gray-50 overflow-x-hidden">
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <p className="flex items-center">Session Services</p>
            <ChevronRight className="w-3.5 h-3.5 mx-1.5" />
            <p className="flex font-semibold items-center">
              Detail Proyek Bootcamp Data Analyst
            </p>
          </div>

          <h1 className="text-xl font-semibold text-gray-800">
            Proyek Bootcamp Data Analyst
          </h1>

          <p className="mt-0 mb-6 text-sm text-gray-500">
            Halaman ini menampilkan kumpulan proyek yang telah dikerjakan oleh
            peserta bootcamp sebagai bentuk penerapan keterampilan analisis data
            yang telah dipelajari.
          </p>

          <div className="max-w-[100%] mb-6">
            <MentorStatCards />
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              Proyek Mentee
            </h2>
            {/* Konten Utama */}
            <div className="bg-white rounded-lg shadow-sm p-5 pb-2">
              {/* Filter & Search */}
              <div className="mb-5">
                <ProjectFilters
                  searchQuery={searchQuery}
                  statusFilter={statusFilter}
                  onSearchChange={setSearchQuery}
                  onStatusChange={setStatusFilter}
                />
              </div>

              {/* Table Section */}
              <div className="mb-6">
                <Suspense
                  fallback={
                    <div className="text-center py-4">
                      Loading project table...
                    </div>
                  }
                >
                  <ProjectTable
                    searchQuery={searchQuery}
                    statusFilter={statusFilter}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
