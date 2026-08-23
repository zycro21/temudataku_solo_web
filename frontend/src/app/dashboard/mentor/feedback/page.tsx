"use client";

import { useState } from "react";
import MentorSidebar from "@/components/dashboard/mentor/sidebarDashboardMentor";
import DashboardAffHeader from "@/components/dashboard/mentor/headerDashboardMentor";
import MentorFeedbackStatCards from "@/components/dashboard/mentor/feedback/mentorFeedbackStatCards";
import MentorFeedbackFilters from "@/components/dashboard/mentor/feedback/mentorFeedbackFilters";
import MentorFeedbackTable from "@/components/dashboard/mentor/feedback/mentorFeedbackTable";
import MentorFeedbackGrid from "@/components/dashboard/mentor/feedback/mentorFeedbackGrid";

export default function FeedbackDashboardMentorPage() {
  // state untuk filter
  const [programFilter, setProgramFilter] = useState("Semua");
  const [skillFilter, setSkillFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  interface Feedback {
    id: number;
    mentee: string;
    program: string;
    skill: string;
    rating: number;
    comment: string;
    date: string;
  }

  return (
    <div className="flex mb-8">
      <MentorSidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-64">
        <DashboardAffHeader />
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          {/* Title + Deskripsi */}
          <h1 className="text-xl font-semibold text-gray-800">
            Umpan Balik Mentee
          </h1>
          <p className="mt-0 mb-6 text-sm text-gray-500">
            Halaman ini menampilkan umpan balik yang diberikan mentee setelah
            sesi mentoring, bootcamp, dan short class. Gunakan ini untuk
            mengevaluasi pembelajaran Anda.
          </p>

          {/* Section Cards */}
          <div className="max-w-[85%] mb-4">
            <MentorFeedbackStatCards />
          </div>

          {/* Section Filters + Table */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Riwayat Umpan Balik
            </h2>
            <div className="bg-white rounded-lg shadow-sm p-5 pb-2">
              {/* Section Filters */}
              <section className="mb-2">
                <MentorFeedbackFilters
                  programFilter={programFilter}
                  skillFilter={skillFilter}
                  searchQuery={searchQuery}
                  onProgramChange={setProgramFilter}
                  onSkillChange={setSkillFilter}
                  onSearchChange={setSearchQuery}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </section>

              <section className="mb-3">
                {viewMode === "table" ? (
                  <MentorFeedbackTable
                    programFilter={programFilter}
                    skillFilter={skillFilter}
                    searchQuery={searchQuery}
                  />
                ) : (
                  <MentorFeedbackGrid
                    programFilter={programFilter}
                    skillFilter={skillFilter}
                    searchQuery={searchQuery}
                  />
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
