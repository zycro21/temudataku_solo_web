"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import PengumpulanFilters from "@/components/dashboard/user/pengumpulan/pengumpulanFilters";
import PengumpulanSection from "@/components/dashboard/user/pengumpulan/pengumpulanSection";

interface Project {
  id: string;
  title: string;
  description: string;
  program: string;
  periode: string;
  image: string;
  status: string; // Belum Dikumpulkan, Selesai, Sudah Direview
  detailLink?: string; // tambahin field baru
}

export default function PengumpulanDashboardUserPage() {
  const [programFilter, setProgramFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const buildTitle = () => {
    if (programFilter === "Semua" && statusFilter === "Semua") return "Hasil";
    if (programFilter === "Semua") return `Hasil - ${statusFilter}`;
    if (statusFilter === "Semua") return `Hasil ${programFilter}`;
    return `Hasil ${programFilter} - ${statusFilter}`;
  };

  const allProjects: Project[] = [
    {
      id: "1",
      title: "Bootcamp Data Science",
      description:
        "Project pada bootcamp ini merupakan prediksi harga rumah di daerah Jawa Timur.",
      program: "Bootcamp",
      periode: "April - Juli 2025",
      image: "",
      status: "Belum Dikumpulkan",
      detailLink: "https://drive.google.com/file/d/bootcamp-ds",
    },
    {
      id: "2",
      title: "Python Short Class",
      description:
        "Project pada short class ini merupakan analisis dataset Python.",
      program: "Short Class",
      periode: "April - Juli 2025",
      image: "",
      status: "Sudah Direview",
      detailLink: "https://drive.google.com/file/d/python-sc",
    },
    {
      id: "3",
      title: "Data Science Class",
      description: "Project data science untuk analisis prediksi harga rumah.",
      program: "Live Class",
      periode: "April - Juli 2025",
      image: "",
      status: "Belum Dikumpulkan",
      detailLink: "https://drive.google.com/file/d/ds-class",
    },
    {
      id: "4",
      title: "Bootcamp SQL",
      description:
        "Project pada bootcamp ini merupakan analisis data menggunakan SQL.",
      program: "Bootcamp",
      periode: "Jan - Maret 2025",
      image: "",
      status: "Selesai",
      detailLink: "https://drive.google.com/file/d/bootcamp-sql",
    },
  ];

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const matchProgram =
        programFilter === "Semua" || project.program === programFilter;
      const matchStatus =
        statusFilter === "Semua" || project.status === statusFilter;
      const matchSearch =
        searchQuery === "" ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.program.toLowerCase().includes(searchQuery.toLowerCase());

      return matchProgram && matchStatus && matchSearch;
    });
  }, [programFilter, statusFilter, searchQuery, allProjects]);

  return (
    <div className="flex mb-8">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-72">
        <DashboardHeader />
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            Pengumpulan
          </h1>

          {/* Filter section */}
          <PengumpulanFilters
            programFilter={programFilter}
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            onProgramChange={setProgramFilter}
            onStatusChange={setStatusFilter}
            onSearchChange={setSearchQuery}
          />

          {/* Hasil Filter */}
          {filteredProjects.length === 0 ? (
            <p className="text-gray-500">
              Tidak ada projek dalam kategori {programFilter} - {statusFilter}.
            </p>
          ) : (
            <PengumpulanSection
              title={buildTitle()}
              projects={filteredProjects}
            />
          )}
        </main>
      </div>
    </div>
  );
}
