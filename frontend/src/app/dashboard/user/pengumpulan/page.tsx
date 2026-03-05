"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import PengumpulanFilters from "@/components/dashboard/user/pengumpulan/pengumpulanFilters";
import PengumpulanWrapper from "@/components/dashboard/user/pengumpulan/pengumpulanSection";

interface Submission {
  id: string;
  title: string;
  filePaths: string[];
  projectLink?: string | null;
  submissionDate: string;
  fileDetails?: {
    filePath: string;
    size: string;
  }[];

  // properti untuk hasil review
  briefScore?: string;
  technicalScore?: string;
  creativityScore?: string;
  completenessScore?: string;
  mentorFeedback?: string;
  mentorSuggestion?: string;
  isRevisedRequired?: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string;
  program: string; // nama program, misal "Bootcamp - Data Science"
  serviceType: string; // jenis program: bootcamp, shortclass, live class
  periode: string;
  image: string;
  status: string;
  detailLink?: string;
  submissions?: Submission[];
}

export default function PengumpulanDashboardUserPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [programFilter, setProgramFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/mentee/bookings`,

          {
            params: { page: 1, limit: 1000 },
            withCredentials: true,
          },
        );

        const bookingsRaw = res.data?.data?.data || [];

        const bookings = bookingsRaw.filter((b: any) =>
          ["confirmed", "completed"].includes(
            (b.status || "").toLowerCase().trim(),
          ),
        );

        const mappedProjects: Project[] = bookings.flatMap((booking: any) => {
          const service = booking.mentoringService;
          const periode = service?.mentoringSessions?.[0]?.date || "-";
          const program = service?.serviceName || "-";
          const serviceType = service?.serviceType || "-"; // << penting!
          const image = `/assets/dashboard/user/kokok.png`;

          return (service?.projects || []).map((proj: any) => ({
            id: proj.id,
            title: proj.title,
            description: proj.description,
            program,
            serviceType, // simpan di project
            periode,
            image,
            status: proj.status || "Belum Dikumpulkan",
            detailLink: proj.detailLink || undefined,
            submissions: proj.submissions || [],
          }));
        });

        setProjects(mappedProjects);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const normalize = (str: string) => str.toLowerCase().replace(/\s/g, "");

      const matchProgram =
        programFilter === "Semua" ||
        normalize(project.serviceType) === normalize(programFilter);

      // tambahkan mapping untuk filter "Selesai" agar sesuai dengan data API
      const normalizedStatusFilter = (() => {
        if (statusFilter === "Selesai") return "Sudah Dikumpulkan";
        if (statusFilter === "Sudah Direview") return "Sudah Direview"; // tetap
        return statusFilter;
      })();

      const matchStatus =
        normalizedStatusFilter === "Semua" ||
        (normalizedStatusFilter === "Sudah Direview"
          ? project.status === "Sudah Direview" ||
            project.status === "Perlu Revisi"
          : project.status === normalizedStatusFilter);

      const matchSearch =
        searchQuery === "" ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.program.toLowerCase().includes(searchQuery.toLowerCase());

      return matchProgram && matchStatus && matchSearch;
    });
  }, [programFilter, statusFilter, searchQuery, projects]);

  return (
    <div className="flex mb-8">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-72">
        <DashboardHeader />
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            Pengumpulan
          </h1>

          <PengumpulanFilters
            programFilter={programFilter}
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            onProgramChange={setProgramFilter}
            onStatusChange={setStatusFilter}
            onSearchChange={setSearchQuery}
          />

          {loading ? (
            <p className="text-gray-500 text-sm">Memuat project...</p>
          ) : filteredProjects.length === 0 ? (
            <p className="text-gray-500">
              Tidak ada project untuk filter {programFilter} - {statusFilter}.
            </p>
          ) : (
            <PengumpulanWrapper projects={filteredProjects} />
          )}
        </main>
      </div>
    </div>
  );
}
