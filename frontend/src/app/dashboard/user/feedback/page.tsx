"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import FeedbackFilters from "@/components/dashboard/user/feedback/feedbackFilters";
import FeedbackSection from "@/components/dashboard/user/feedback/feedbackSection";

interface Feedback {
  id: string;
  title: string;
  description: string;
  program: string; // Bootcamp, Short Class, Mentoring, dll
  category: string; // misal "Bootcamp Data Science", "Short Class Python"
  date: string;
  time: string;
  mentor: string;
  image: string;
  status: "Belum" | "Sudah"; // Belum -> Tambah Umpan Balik, Sudah -> Lihat Umpan Balik
  answers?: { [key: number]: string }; // optional, hanya ada kalau Sudah
  input1?: string;
  input2?: string;
}

export default function FeedbackDashboardUserPage() {
  const [programFilter, setProgramFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const allFeedbacks: Feedback[] = [
    {
      id: "1",
      title: "Data Science Class Week 3",
      description:
        "Pertemuan 1 membahas seberapa penting data science dan bagaimana step by step menjadi data scientist.",
      program: "Bootcamp",
      category: "Bootcamp Data Science",
      date: "2 Mei 2025",
      time: "10:00 - 12:00",
      mentor: "Kak Rina",
      image: "",
      status: "Belum",
    },
    {
      id: "2",
      title: "Data Science Class Week 2",
      description:
        "Pertemuan 1 membahas seberapa penting data science dan bagaimana step by step menjadi data scientist.",
      program: "Bootcamp",
      category: "Bootcamp Data Science",
      date: "2 Mei 2025",
      time: "10:00 - 12:00",
      mentor: "Kak Rina",
      image: "",
      status: "Belum",
    },
    {
      id: "3",
      title: "Data Science Class Week 1",
      description:
        "Pertemuan 1 membahas seberapa penting data science dan bagaimana step by step menjadi data scientist.",
      program: "Bootcamp",
      category: "Bootcamp Data Science",
      date: "2 Mei 2025",
      time: "10:00 - 12:00",
      mentor: "Kak Rina",
      image: "",
      status: "Sudah",
      answers: {
        0: "Sangat Setuju",
        1: "Setuju",
        2: "Sangat Setuju",
        3: "Setuju",
        4: "Tidak Setuju",
        5: "Setuju",
        6: "Sangat Setuju",
      },
      input1:
        "Menurut saya materinya sudah cukup bagus, mungkin bisa lebih banyak contoh real project.",
      input2:
        "Terima kasih banyak untuk mentor, semoga kelas berikutnya lebih interaktif lagi.",
    },
    {
      id: "4",
      title: "Python Short Class",
      description:
        "Pertemuan 1 membahas seberapa penting data science dan bagaimana step by step menjadi data scientist.",
      program: "Short Class",
      category: "Short Class Python",
      date: "2 Mei 2025",
      time: "10:00 - 12:00",
      mentor: "Kak Rina",
      image: "",
      status: "Belum",
    },
    {
      id: "5",
      title: "Python Live Class",
      description:
        "Pertemuan 1 membahas seberapa penting data science dan bagaimana step by step menjadi data scientist.",
      program: "Live Class",
      category: "Live Class Python",
      date: "10 Mei 2025",
      time: "10:00 - 12:00",
      mentor: "Kak Rina",
      image: "g",
      status: "Belum",
    },
  ];

  // Filter data
  const filteredFeedbacks = useMemo(() => {
    return allFeedbacks.filter((f) => {
      const matchProgram =
        programFilter === "Semua" || f.program === programFilter;
      const matchSearch =
        searchQuery === "" ||
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchProgram && matchSearch;
    });
  }, [programFilter, searchQuery]);

  // Grouping per category (Bootcamp Data Science, Short Class Python, dst)
  const groupedFeedbacks = useMemo(() => {
    const groups: Record<string, Feedback[]> = {};
    filteredFeedbacks.forEach((f) => {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    });
    return groups;
  }, [filteredFeedbacks]);

  return (
    <div className="flex mb-8">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-72">
        <DashboardHeader />
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            Feedback
          </h1>

          {/* Filter Section */}
          <FeedbackFilters
            programFilter={programFilter}
            searchQuery={searchQuery}
            onProgramChange={setProgramFilter}
            onSearchChange={setSearchQuery}
          />

          {/* Section per Kategori */}
          {Object.keys(groupedFeedbacks).length === 0 ? (
            <p className="text-gray-500">
              Tidak ada feedback dalam kategori {programFilter}.
            </p>
          ) : (
            Object.entries(groupedFeedbacks).map(([category, feedbacks]) => (
              <FeedbackSection
                key={category}
                title={category}
                feedbacks={feedbacks}
              />
            ))
          )}
        </main>
      </div>
    </div>
  );
}
