"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import SertifikatFilters from "@/components/dashboard/user/sertifikat/sertifikatFilters";
import SertifikatSection from "@/components/dashboard/user/sertifikat/sertifikatSection";
import { Ban } from "lucide-react"; // ikon kosong
import Link from "next/link";

interface Sertifikat {
  id: string;
  title: string;
  description: string;
  program: string; // Bootcamp, Short Class, Live Class
  category: string;
  dateRange: string;
  image: string;
  downloadLink?: string;
}

const VALID_PROGRAMS = ["Bootcamp", "Short Class", "Live Class"];

export default function SertifikatDashboardUserPage() {
  const [programFilter, setProgramFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy data sertifikat
  const allSertifikat: Sertifikat[] = [
    {
      id: "1",
      title: "Bootcamp Data Scientist",
      description:
        "Mempelajari seluruh step by step menjadi data scientist profesional dengan portfolio project",
      program: "Bootcamp",
      category: "Bootcamp",
      dateRange: "April - Juli 2025",
      image: "",
      downloadLink: "#",
    },
    {
      id: "2",
      title: "Short Class Python",
      description:
        "Mempelajari seluruh step by step menjadi data scientist profesional dengan portfolio project",
      program: "Short Class",
      category: "Short Class",
      dateRange: "April - Juli 2025",
      image: "",
      downloadLink: "#",
    },
    {
      id: "3",
      title: "Short Class EDA",
      description:
        "Mempelajari seluruh step by step menjadi data scientist profesional dengan portfolio project",
      program: "Short Class",
      category: "Short Class",
      dateRange: "April - Juli 2025",
      image: "",
      downloadLink: "#",
    },
  ].filter((s) => VALID_PROGRAMS.includes(s.program));

  // Filter data
  const filteredSertifikat = useMemo(() => {
    return allSertifikat.filter((s) => {
      const matchProgram =
        programFilter === "Semua" || s.program === programFilter;
      const matchSearch =
        searchQuery === "" ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProgram && matchSearch;
    });
  }, [allSertifikat, programFilter, searchQuery]);

  // Grouping
  const groupedSertifikat = useMemo(() => {
    const groups: Record<string, Sertifikat[]> = {};
    filteredSertifikat.forEach((s) => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }, [filteredSertifikat]);

  const isEmpty = Object.keys(groupedSertifikat).length === 0;

  return (
    <div className="flex mb-8">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-72">
        <DashboardHeader />
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            Sertifikat
          </h1>

          {/* Filter Section */}
          <SertifikatFilters
            programFilter={programFilter}
            searchQuery={searchQuery}
            onProgramChange={setProgramFilter}
            onSearchChange={setSearchQuery}
          />

          {/* Jika kosong → fallback */}
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <Ban className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-700 font-semibold mb-1">
                Belum ada{" "}
                {programFilter === "Semua" ? "sertifikat" : programFilter}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Saat ini, Anda belum memiliki{" "}
                {programFilter === "Semua" ? "sertifikat" : programFilter} yang
                dapat diunduh
              </p>
              <Link
                href="/programs"
                className="px-4 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition cursor-pointer"
              >
                Ikuti Program
              </Link>
            </div>
          ) : (
            Object.entries(groupedSertifikat).map(([category, sertifikats]) => (
              <SertifikatSection
                key={category}
                title={category}
                sertifikats={sertifikats}
              />
            ))
          )}
        </main>
      </div>
    </div>
  );
}
