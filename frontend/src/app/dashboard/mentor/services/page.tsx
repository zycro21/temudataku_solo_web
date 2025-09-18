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
          <div className="max-w-[100%] mb-6">
            <MentorStatCards />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Riwayat Sesi
            </h2>
            {/* Konten Utama */}
            <div className="bg-white rounded-lg shadow-sm p-6 pb-2">
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
              <section className="mb-8">
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
