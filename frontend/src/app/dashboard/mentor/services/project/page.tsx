"use client";

import { useState } from "react";
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
      <div className="flex-1 flex flex-col ml-72">
        <DashboardAffHeader />
        {/* Main content */}
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <p className="flex items-center">Session Services</p>
            <ChevronRight className="w-4 h-4 mx-2" />
            <p className="flex font-bold items-center">
              Detail Proyek Bootcamp Data Analyst
            </p>
          </div>

          <h1 className="text-2xl font-semibold text-gray-800">
            Proyek Bootcamp Data Analyst
          </h1>

          <p className="mt-0 mb-10 text-gray-500">
            Halaman ini menampilkan kumpulan proyek yang telah dikerjakan oleh
            peserta bootcamp sebagai bentuk penerapan keterampilan analisis data
            yang telah dipelajari.
          </p>

          <div className="max-w-[100%] mb-8">
            <MentorStatCards />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Proyek Mentee
            </h2>
            {/* Konten Utama */}
            <div className="bg-white rounded-lg shadow-sm p-6 pb-2">
              {/* Filter & Search */}
              <div className="mb-6">
                <ProjectFilters
                  searchQuery={searchQuery}
                  statusFilter={statusFilter}
                  onSearchChange={setSearchQuery}
                  onStatusChange={setStatusFilter}
                />
              </div>

              {/* Table Section */}
              <div className="mb-8">
                <ProjectTable
                  searchQuery={searchQuery}
                  statusFilter={statusFilter}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
