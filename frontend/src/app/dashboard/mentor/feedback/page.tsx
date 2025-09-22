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

  const feedbacks: Feedback[] = [
    {
      id: 1,
      mentee: "Anonim #1",
      program: "Mentoring 1 on 1",
      skill: "Data Analysis",
      rating: 4.8,
      comment: "Mentor sangat sabar menjelaskan...",
      date: "01-06-2025",
    },
    {
      id: 2,
      mentee: "Anonim #2",
      program: "Mentoring Group",
      skill: "Machine Learning",
      rating: 4.2,
      comment: "Diskusinya menarik, tapi waktunya agak terbatas.",
      date: "03-06-2025",
    },
    {
      id: 3,
      mentee: "Anonim #3",
      program: "Bootcamp",
      skill: "Data Science",
      rating: 5.0,
      comment: "Luar biasa! Materinya lengkap dan langsung bisa dipraktikkan.",
      date: "05-06-2025",
    },
    {
      id: 4,
      mentee: "Anonim #4",
      program: "Mentoring 1 on 1",
      skill: "Machine Learning",
      rating: 3.9,
      comment:
        "Mentornya baik, tapi sesi terlalu singkat untuk mendalami topik.",
      date: "07-06-2025",
    },
    {
      id: 5,
      mentee: "Anonim #5",
      program: "Workshop",
      skill: "Data Analysis",
      rating: 4.5,
      comment: "Workshopnya interaktif, saya suka ada studi kasus langsung.",
      date: "09-06-2025",
    },
    {
      id: 6,
      mentee: "Anonim #6",
      program: "Mentoring Group",
      skill: "Data Science",
      rating: 4.0,
      comment: "Diskusinya seru, tapi beberapa peserta terlalu dominan.",
      date: "12-06-2025",
    },
    {
      id: 7,
      mentee: "Anonim #7",
      program: "Mentoring 1 on 1",
      skill: "Machine Learning",
      rating: 4.7,
      comment:
        "Mentor memberikan tips praktis yang bisa langsung saya terapkan.",
      date: "15-06-2025",
    },
    {
      id: 8,
      mentee: "Anonim #8",
      program: "Bootcamp",
      skill: "Data Analysis",
      rating: 3.8,
      comment: "Materi banyak, tapi agak padat untuk waktu yang singkat.",
      date: "18-06-2025",
    },
    {
      id: 9,
      mentee: "Anonim #9",
      program: "Workshop",
      skill: "Data Science",
      rating: 4.9,
      comment: "Fasilitator ramah dan materinya sesuai kebutuhan saya.",
      date: "20-06-2025",
    },
    {
      id: 10,
      mentee: "Anonim #10",
      program: "Mentoring Group",
      skill: "Data Analysis",
      rating: 4.3,
      comment:
        "Banyak insight dari pengalaman peserta lain, sangat bermanfaat.",
      date: "22-06-2025",
    },
    {
      id: 11,
      mentee: "Anonim #11",
      program: "Workshop",
      skill: "Machine Learning",
      rating: 3.5,
      comment:
        "Agak sulit mengikuti karena terlalu teknis, tapi tetap menambah wawasan.",
      date: "24-06-2025",
    },
    {
      id: 12,
      mentee: "Anonim #12",
      program: "Bootcamp",
      skill: "Data Science",
      rating: 5.0,
      comment:
        "Saya benar-benar merasa terbantu, kurikulum sangat terstruktur, mentor kompeten, dan saya bisa langsung menerapkannya di pekerjaan sehari-hari.",
      date: "25-06-2025",
    },
    {
      id: 13,
      mentee: "Anonim #13",
      program: "Mentoring 1 on 1",
      skill: "Data Analysis",
      rating: 4.6,
      comment: "Sangat jelas!",
      date: "26-06-2025",
    },
    {
      id: 14,
      mentee: "Anonim #14",
      program: "Mentoring Group",
      skill: "Machine Learning",
      rating: 3.8,
      comment:
        "Koneksi internet sempat bermasalah, tapi mentor tetap sabar menunggu.",
      date: "27-06-2025",
    },
    {
      id: 15,
      mentee: "Anonim #15",
      program: "Workshop",
      skill: "Data Science",
      rating: 4.2,
      comment:
        "Workshop ini membuka mata saya bahwa data science bukan hanya teori, tapi juga praktik nyata di berbagai industri.",
      date: "28-06-2025",
    },
    {
      id: 16,
      mentee: "Anonim #16",
      program: "Bootcamp",
      skill: "Machine Learning",
      rating: 4.9,
      comment:
        "Mentor selalu memastikan semua peserta paham sebelum lanjut ke materi berikutnya.",
      date: "29-06-2025",
    },
    {
      id: 17,
      mentee: "Anonim #17",
      program: "Mentoring 1 on 1",
      skill: "Data Analysis",
      rating: 3.7,
      comment: "Materi menarik tapi terlalu cepat disampaikan.",
      date: "30-06-2025",
    },
    {
      id: 18,
      mentee: "Anonim #18",
      program: "Mentoring Group",
      skill: "Data Science",
      rating: 4.4,
      comment:
        "Saya suka ada sesi tanya jawab, membuat suasana lebih interaktif dan membantu memahami topik sulit.",
      date: "01-07-2025",
    },
    {
      id: 19,
      mentee: "Anonim #19",
      program: "Workshop",
      skill: "Machine Learning",
      rating: 4.1,
      comment: "Butuh tambahan waktu agar pembahasan lebih mendalam.",
      date: "02-07-2025",
    },
    {
      id: 20,
      mentee: "Anonim #20",
      program: "Bootcamp",
      skill: "Data Analysis",
      rating: 5.0,
      comment:
        "Pengalaman bootcamp ini luar biasa panjang dan detail sekali, saya bisa belajar dari mentor ahli, melakukan praktik langsung, berdiskusi dengan sesama peserta, dan mendapatkan banyak insight baru yang tidak pernah saya bayangkan sebelumnya.",
      date: "03-07-2025",
    },
    {
      id: 21,
      mentee: "Anonim #21",
      program: "Bootcamp",
      skill: "Web Development",
      rating: 4.7,
      comment:
        "Materi tentang frontend sangat jelas, terutama bagian React. Contoh kodenya praktis dan bisa langsung dipakai.",
      date: "04-07-2025",
    },
    {
      id: 22,
      mentee: "Anonim #22",
      program: "Mentoring Group",
      skill: "UI/UX",
      rating: 4.3,
      comment:
        "Sesi desain UI/UX cukup menarik, hanya saja saya berharap ada lebih banyak studi kasus nyata.",
      date: "05-07-2025",
    },
    {
      id: 23,
      mentee: "Anonim #23",
      program: "Workshop",
      skill: "Cloud Computing",
      rating: 4.8,
      comment:
        "Penjelasan tentang deployment ke cloud sangat detail, saya jadi lebih percaya diri untuk mencoba di proyek pribadi.",
      date: "06-07-2025",
    },
    {
      id: 24,
      mentee: "Anonim #24",
      program: "Bootcamp",
      skill: "Cybersecurity",
      rating: 4.5,
      comment:
        "Topik keamanan jaringan dan praktik simulasi serangan sangat membantu memahami pentingnya proteksi data.",
      date: "07-07-2025",
    },
    {
      id: 25,
      mentee: "Anonim #25",
      program: "Mentoring Group",
      skill: "Project Management",
      rating: 4.2,
      comment:
        "Pembahasan tentang Agile dan Scrum bermanfaat sekali, saya bisa langsung terapkan di pekerjaan.",
      date: "08-07-2025",
    },
  ];

  return (
    <div className="flex mb-8">
      <MentorSidebar />
      <div className="flex-1 flex flex-col ml-72">
        <DashboardAffHeader />
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          {/* Title + Deskripsi */}
          <h1 className="text-2xl font-semibold text-gray-800">
            Umpan Balik Mentee
          </h1>
          <p className="mt-0 mb-8 text-gray-500">
            Halaman ini menampilkan umpan balik yang diberikan mentee setelah
            sesi mentoring, bootcamp, dan short class. Gunakan ini untuk
            mengevaluasi pembelajaran Anda.
          </p>

          {/* Section Cards */}
          <div className="max-w-[85%] mb-6">
            <MentorFeedbackStatCards feedbacks={feedbacks} />
          </div>

          {/* Section Filters + Table */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Riwayat Umpan Balik
            </h2>
            <div className="bg-white rounded-lg shadow-sm p-6 pb-2">
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

              <section className="mb-4">
                {viewMode === "table" ? (
                  <MentorFeedbackTable
                    feedbacks={feedbacks}
                    programFilter={programFilter}
                    skillFilter={skillFilter}
                    searchQuery={searchQuery}
                  />
                ) : (
                  <MentorFeedbackGrid
                    feedbacks={feedbacks}
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
