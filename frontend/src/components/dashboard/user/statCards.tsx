"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function StatCards() {
  const [programCount, setProgramCount] = useState<number | null>(null);
  const [materiCount, setMateriCount] = useState<number | null>(null);
  const [certificateCount, setCertificateCount] = useState<number | null>(null);
  const [tugasSelesaiCount, setTugasSelesaiCount] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProgramTerdaftar = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/mentee/bookings`,
          {
            params: { page: 1, limit: 1000 },
            withCredentials: true,
          }
        );
        const total = res.data?.data?.pagination?.total ?? 0;
        setProgramCount(total);
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.response?.data?.message ||
            "Gagal memuat data program terdaftar."
        );
      }
    };

    const fetchJumlahMateri = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/practice/mentees/practice-purchases`,
          {
            params: { page: 1, limit: 1000 },
            withCredentials: true,
          }
        );
        const total =
          res.data?.data?.total ?? res.data?.data?.data?.length ?? 0;
        setMateriCount(total);
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.response?.data?.message || "Gagal memuat data jumlah materi."
        );
      }
    };

    const fetchJumlahSertifikat = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/certificate/certificates`,
          {
            params: { status: "verified", page: 1, limit: 1000 },
            withCredentials: true,
          }
        );

        const total = res.data?.data?.total ?? 0;
        setCertificateCount(total);
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.response?.data?.message || "Gagal memuat data sertifikat."
        );
      }
    };

    // Ambil total tugas selesai (project reviewed + practice completed)
    const fetchTugasSelesai = async () => {
      try {
        const [projectRes, practiceRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/project/menteesSubmissions`,
            {
              params: { page: 1, limit: 1000 },
              withCredentials: true,
            }
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/practice/practice/progress`,
            {
              params: { page: 1, limit: 1000 },
              withCredentials: true,
            }
          ),
        ]);

        // Hitung submission yang sudah direview
        const projectSubmissions = projectRes.data?.data ?? [];
        const reviewedProjects = projectSubmissions.filter(
          (item: any) =>
            item.isReviewed === true || item.reviewStatus === "REVIEWED"
        ).length;

        // Hitung practice progress yang sudah selesai
        const practiceData = practiceRes.data?.data?.data ?? [];
        const completedPractices = practiceData.filter(
          (item: any) => item.isCompleted === true
        ).length;

        setTugasSelesaiCount(reviewedProjects + completedPractices);
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.response?.data?.message || "Gagal memuat data tugas selesai."
        );
      }
    };

    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchProgramTerdaftar(),
        fetchJumlahMateri(),
        fetchJumlahSertifikat(),
        fetchTugasSelesai(),
      ]);
      setLoading(false);
    };

    fetchAll();
  }, []);

  const stats = [
    {
      title: "Program Terdaftar",
      value: programCount ?? 0,
      icon: "/assets/dashboard/user/programterdaftar.svg",
    },
    {
      title: "Jumlah Materi",
      value: materiCount ?? 0,
      icon: "/assets/dashboard/user/jumlahmateri.svg",
    },
    {
      title: "Sertifikat",
      value: certificateCount ?? 0,
      icon: "/assets/dashboard/user/sertifikat2.svg",
    },
    {
      title: "Tugas Selesai",
      value: tugasSelesaiCount ?? 0,
      icon: "/assets/dashboard/user/tugasselesai.svg",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-6 gap-y-6 mb-6 justify-items-start">
      {stats.map((item, idx) => (
        <div
          key={idx}
          className="relative p-4 bg-white border border-gray-200 rounded-lg shadow-sm max-w-[264px] w-full"
        >
          <ChevronRight className="absolute top-3 right-3 w-4 h-4 text-gray-800" />
          <div className="flex items-center gap-2">
            <Image
              src={item.icon}
              alt={item.title}
              width={16}
              height={16}
              className="text-gray-600"
            />
            <span className="text-sm text-gray-600">{item.title}</span>
          </div>

          <div className="mt-5 h-9 flex items-center">
            {loading ? (
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                {item.value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
