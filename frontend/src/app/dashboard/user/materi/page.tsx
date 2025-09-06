"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import MateriFilters from "@/components/dashboard/user/materi/materiFilters";
import MateriSection from "@/components/dashboard/user/materi/materiSection";
import { Ban } from "lucide-react"; // untuk ikon no data
import Link from "next/link";

interface Materi {
  id: string;
  title: string;
  description: string;
  program: string; // Bootcamp, Short Class, Live Class, Mentoring Group, Mentoring 1 on 1
  category: string;
  dateRange: string;
  image: string;
  pptLink?: string;
  videoLink?: string;
}

// Batasi kategori yang valid
const VALID_PROGRAMS = [
  "Bootcamp",
  "Short Class",
  "Live Class",
  "Mentoring Group",
  "Mentoring 1 on 1",
];

export default function MateriDashboardUserPage() {
  const [programFilter, setProgramFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy data
  const allMateri: Materi[] = [
    {
      id: "1",
      title: "Data Science Week 3",
      description:
        "Pertemuan 1 membahas seberapa penting data science dan bagaimana step by step menjadi data scientist.",
      program: "Bootcamp",
      category: "Bootcamp",
      dateRange: "April - Juli 2025",
      image: "",
      pptLink: "#",
      videoLink: "#",
    },
    {
      id: "2",
      title: "Data Science Week 2",
      description:
        "Pertemuan 2 membahas dasar-dasar Python untuk analisis data.",
      program: "Bootcamp",
      category: "Bootcamp",
      dateRange: "April - Juli 2025",
      image: "",
      pptLink: "#",
      videoLink: "#",
    },
    {
      id: "3",
      title: "Python Short Class",
      description: "Pertemuan membahas dasar-dasar Python untuk analisis data.",
      program: "Short Class",
      category: "Short Class",
      dateRange: "Mei 2025",
      image: "",
      pptLink: "#",
      videoLink: "#",
    },
  ].filter((m) => VALID_PROGRAMS.includes(m.program));

  // Filter data
  const filteredMateri = useMemo(() => {
    return allMateri.filter((m) => {
      const matchProgram =
        programFilter === "Semua" || m.program === programFilter;
      const matchSearch =
        searchQuery === "" ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchProgram && matchSearch;
    });
  }, [allMateri, programFilter, searchQuery]);

  // Grouping
  const groupedMateri = useMemo(() => {
    const groups: Record<string, Materi[]> = {};
    filteredMateri.forEach((m) => {
      if (!groups[m.category]) groups[m.category] = [];
      groups[m.category].push(m);
    });
    return groups;
  }, [filteredMateri]);

  const isEmpty = Object.keys(groupedMateri).length === 0;

  // Tentukan link tombol coba
  const getCobaLink = () => {
    const targetProgram =
      programFilter === "Semua" ? "Bootcamp" : programFilter;

    if (["Bootcamp", "Short Class", "Live Class"].includes(targetProgram)) {
      return "/programs";
    }
    if (["Mentoring Group", "Mentoring 1 on 1"].includes(targetProgram)) {
      return "/mentoring";
    }
    return "/"; // fallback default
  };

  return (
    <div className="flex mb-8">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-72">
        <DashboardHeader />
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">Materi</h1>

          {/* Filter Section */}
          <MateriFilters
            programFilter={programFilter}
            searchQuery={searchQuery}
            onProgramChange={setProgramFilter}
            onSearchChange={setSearchQuery}
          />

          {/* Jika kosong → tampilkan fallback */}
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <Ban className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-700 font-semibold mb-1">
                Belum ada {programFilter === "Semua" ? "materi" : programFilter}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Saat ini, Anda belum memiliki{" "}
                {programFilter === "Semua" ? "materi" : programFilter} yang
                dapat diakses
              </p>
              <Link
                href={getCobaLink()}
                className="px-4 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition cursor-pointer"
              >
                Coba {programFilter === "Semua" ? "Bootcamp" : programFilter}
              </Link>
            </div>
          ) : (
            Object.entries(groupedMateri).map(([category, materis]) => (
              <MateriSection
                key={category}
                title={category}
                materis={materis}
              />
            ))
          )}
        </main>
      </div>
    </div>
  );
}
