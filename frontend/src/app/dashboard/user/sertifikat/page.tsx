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

// 🔥 BARU: shape response dari /api/elearningCertificate/certificates/me
// (cuma field yang dipakai untuk ditampilkan di dashboard).
interface ElearningCertificateResponse {
  id: string;
  certificateNumber: string;
  certificateUrl: string;
  issuedAt: string;
  status: string;
  subChapter: {
    title: string;
    course: {
      title: string;
    };
  };
}

export default function SertifikatDashboardUserPage() {
  const [programFilter, setProgramFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [sertifikats, setSertifikats] = useState<Sertifikat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔥 BARU: state terpisah untuk sertifikat e-learning yang sudah terbit
  const [elearningCertificates, setElearningCertificates] = useState<
    Sertifikat[]
  >([]);
  const [elearningLoading, setElearningLoading] = useState(true);
  const [elearningError, setElearningError] = useState("");

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

  // 🔥 BARU: fetch sertifikat e-learning yang sudah terbit, dari endpoint
  // `/api/elearningCertificate/certificates/me`. Sengaja dipisah dari
  // `fetchData` di atas (useEffect sendiri + state loading/error sendiri)
  // supaya kalau salah satu gagal, yang lain tetap tampil normal.
  useEffect(() => {
    const fetchElearningCertificates = async () => {
      try {
        setElearningLoading(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCertificate/certificates/me`,
          {
            withCredentials: true,
            params: { sortBy: "issuedAt", sortOrder: "desc" },
          },
        );

        const rows: ElearningCertificateResponse[] = res.data?.data || [];

        // Map ke bentuk `Sertifikat` supaya bisa langsung dipakai sama
        // komponen `SertifikatSection` yang sudah ada, tanpa perlu ubah
        // komponen itu sama sekali.
        const mapped: Sertifikat[] = rows.map((cert) => ({
          id: cert.id,
          title: cert.subChapter?.title || "Kelas E-Learning",
          description: `Sertifikat kelas dari course **${
            cert.subChapter?.course?.title || "-"
          }**`,
          program: "elearning",
          category: "Sertifikat E-Learning",
          dateRange: cert.issuedAt
            ? new Date(cert.issuedAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : "-",
          image: "/assets/dashboard/user/certificate-placeholder.png",
          downloadLink: cert.certificateUrl,
          hasCertificate: true,
        }));

        setElearningCertificates(mapped);
      } catch (err) {
        console.error("Gagal memuat sertifikat e-learning:", err);
        setElearningError("Gagal memuat sertifikat e-learning.");
      } finally {
        setElearningLoading(false);
      }
    };

    fetchElearningCertificates();
  }, []);

  // Filter
  // 🔥 UBAH: sekarang menggabungkan `sertifikats` (bootcamp) +
  // `elearningCertificates` jadi satu list sebelum di-filter, supaya opsi
  // "E-Learning" di `SertifikatFilters` beneran nyaring data e-learning
  // juga (dulu sertifikat e-learning selalu tampil di section terpisah,
  // di luar filter/search).
  // 🔥 UBAH: `normalize` sekarang buang semua karakter non-alfanumerik
  // (bukan cuma spasi), biar "E-Learning" (dari tombol filter) match
  // sama value program "elearning" (tanpa strip).
  const filtered = useMemo(() => {
    const normalize = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9]/g, "");

    const combined = [...sertifikats, ...elearningCertificates];

    return combined.filter((s) => {
      const matchProgram =
        programFilter === "Semua" ||
        normalize(s.program) === normalize(programFilter);
      const matchSearch =
        searchQuery === "" ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProgram && matchSearch;
    });
  }, [sertifikats, elearningCertificates, programFilter, searchQuery]);

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
    <div className="flex">
      <Sidebar />

      {/* Konten kanan */}
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <DashboardHeader />

        <main className="flex-1 px-5 py-4 bg-gray-50 overflow-x-hidden">
          <h1 className="text-3xl font-semibold text-gray-800 mb-4">
            Sertifikat
          </h1>

          <div className="space-y-4 min-w-0">
            <SertifikatFilters
              programFilter={programFilter}
              searchQuery={searchQuery}
              onProgramChange={setProgramFilter}
              onSearchChange={setSearchQuery}
            />

            {(loading || elearningLoading) && (
              <p className="text-sm text-gray-500 mt-2">Memuat data...</p>
            )}

            {(error || elearningError) && (
              <p className="text-sm text-red-500 mt-2">
                {error || elearningError}
              </p>
            )}

            {!loading &&
              !elearningLoading &&
              !error &&
              !elearningError &&
              Object.entries(grouped).map(([category, sertifikats]) => (
                <div key={category} className="min-w-0">
                  <SertifikatSection
                    title={category}
                    sertifikats={sertifikats}
                  />
                </div>
              ))}

            {!loading &&
              !elearningLoading &&
              !error &&
              !elearningError &&
              isEmpty && (
                <div className="flex flex-col items-center justify-center text-center py-14">
                  <Ban className="w-12 h-12 text-gray-300 mb-3" />
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Belum ada program mentoring
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Anda belum mengikuti program mentoring apa pun
                  </p>
                  <Link
                    href="/programs"
                    className="px-3 py-1.5 text-xs rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition"
                  >
                    Ikuti Program
                  </Link>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}
