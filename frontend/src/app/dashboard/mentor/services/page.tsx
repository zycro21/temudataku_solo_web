"use client";

import Image from "next/image";
import { useState } from "react";
import MentorSidebar from "@/components/dashboard/mentor/sidebarDashboardMentor";
import DashboardAffHeader from "@/components/dashboard/mentor/headerDashboardMentor";
import MentorStatCards from "@/components/dashboard/mentor/services/mentorStatCardServices";
import MentorSessionFilters from "@/components/dashboard/mentor/services/mentorSessionFilters";
import MentorSessionList from "@/components/dashboard/mentor/services/mentorSessionList";

export default function ServicesDashboardMentorPage() {
  // State untuk filter & search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [programFilter, setProgramFilter] = useState("Semua");

  return (
    <div className="flex mb-8">
      <MentorSidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-64">
        <DashboardAffHeader />
        {/* Main content */}
        <main className="flex-1 p-5 pl-6 bg-gray-50 overflow-x-hidden">
          <h1 className="text-xl font-semibold text-gray-800">
            Session Services
          </h1>
          <p className="mt-0 mb-6 text-sm text-gray-500">
            Halaman ini membantu Anda melacak perkembangan dan memahami proses
            belajar mentee yang Anda dampingi.
          </p>

          {/* Stat Cards */}
          <div className="max-w-[100%] mb-5">
            <MentorStatCards />
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              Riwayat Sesi
            </h2>
            {/* Konten Utama */}
            <div className="bg-white rounded-lg shadow-sm p-5 pb-2">
              {/* Filter & Search */}
              <section className="mb-1">
                <MentorSessionFilters
                  searchQuery={searchQuery}
                  statusFilter={statusFilter}
                  programFilter={programFilter}
                  onSearchChange={setSearchQuery}
                  onStatusChange={setStatusFilter}
                  onProgramChange={setProgramFilter}
                />
              </section>

              {/* Session List */}
              <section className="mb-6">
                <MentorSessionList
                  searchQuery={searchQuery}
                  statusFilter={statusFilter}
                  programFilter={programFilter}
                />
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
