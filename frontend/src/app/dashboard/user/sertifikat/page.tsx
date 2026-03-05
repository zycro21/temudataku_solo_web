"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import SertifikatFilters from "@/components/dashboard/user/sertifikat/sertifikatFilters";
import SertifikatSection from "@/components/dashboard/user/sertifikat/sertifikatSection";
import { Ban } from "lucide-react";
import Link from "next/link";

interface Sertifikat {
  id: string;
  title: string;
  description: string;
  program: string;
  category: string;
  dateRange: string;
  image: string;
  downloadLink?: string;
  hasCertificate: boolean;
}

export default function SertifikatDashboardUserPage() {
  const [programFilter, setProgramFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [sertifikats, setSertifikats] = useState<Sertifikat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Ambil daftar booking (semua program yang diikuti mentee)
        const bookingRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/mentee/bookings?page=1&limit=100`,
          { withCredentials: true },
        );

        // Ambil semua sertifikat
        const certRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/certificate/certificates`,
          { withCredentials: true },
        );

        const bookingsRaw = bookingRes.data?.data?.data || [];

        // filter booking status + service type
        const bookings = bookingsRaw.filter((b: any) => {
          const serviceType = b?.mentoringService?.serviceType?.toLowerCase();
          const status = b?.status?.toLowerCase();

          const allowedServiceTypes = ["bootcamp", "live class", "shortclass"];
          const allowedStatus = ["confirmed", "completed"];

          return (
            allowedServiceTypes.includes(serviceType) &&
            allowedStatus.includes(status)
          );
        });

        const certificates = certRes.data?.data?.data || [];

        // Gabungkan booking + sertifikat berdasarkan serviceId
        const merged = bookings.map((b: any) => {
          const service = b.mentoringService || {};
          const cert = certificates.find(
            (c: any) =>
              c.serviceId === service.id ||
              c.mentoringService?.id === service.id, // fallback kalau struktur berbeda
          );

          return {
            id: b.id,
            title: service.serviceName || "Program Mentoring",
            description:
              service.description ||
              "Program mentoring yang diikuti oleh mentee",
            program: service.serviceType || "mentoring",
            category: cert
              ? "Sudah Memiliki Sertifikat"
              : "Belum Memiliki Sertifikat",
            dateRange: cert?.issueDate
              ? new Date(cert.issueDate).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : (() => {
                  const firstSession = service?.mentoringSessions?.[0];
                  if (firstSession?.startTime) {
                    return new Date(firstSession.startTime).toLocaleDateString(
                      "id-ID",
                      {
                        month: "long",
                        year: "numeric",
                      },
                    );
                  }
                  // fallback kalau tidak ada sesi
                  return new Date(b.bookingDate).toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  });
                })(),
            image:
              service.thumbnailUrl ||
              "/assets/dashboard/user/certificate-placeholder.png",
            downloadLink: cert
              ? cert.googleDriveUrl ||
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/certificate/certificatesDownload/${cert.id}`
              : undefined,
            hasCertificate: !!cert,
          };
        });

        setSertifikats(merged);
      } catch (err) {
        console.error("Gagal memuat data sertifikat:", err);
        setError("Gagal memuat data. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter
  const filtered = useMemo(() => {
    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, "");

    return sertifikats.filter((s) => {
      const matchProgram =
        programFilter === "Semua" ||
        normalize(s.program) === normalize(programFilter);
      const matchSearch =
        searchQuery === "" ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProgram && matchSearch;
    });
  }, [sertifikats, programFilter, searchQuery]);

  // Grouping
  const grouped = useMemo(() => {
    const groups: Record<string, Sertifikat[]> = {};
    filtered.forEach((s) => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }, [filtered]);

  const isEmpty = Object.keys(grouped).length === 0;

  return (
    <div className="flex mb-8">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-72">
        <DashboardHeader />
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            Sertifikat
          </h1>

          <SertifikatFilters
            programFilter={programFilter}
            searchQuery={searchQuery}
            onProgramChange={setProgramFilter}
            onSearchChange={setSearchQuery}
          />

          {loading && (
            <p className="text-gray-500 text-sm mt-4">Memuat data...</p>
          )}

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          {!loading &&
            !error &&
            Object.entries(grouped).map(([category, sertifikats]) => (
              <SertifikatSection
                key={category}
                title={category}
                sertifikats={sertifikats}
              />
            ))}

          {!loading && !error && isEmpty && (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <Ban className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-700 font-semibold mb-1">
                Belum ada program mentoring
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Anda belum mengikuti program mentoring apa pun
              </p>
              <Link
                href="/programs"
                className="px-4 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition cursor-pointer"
              >
                Ikuti Program
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
