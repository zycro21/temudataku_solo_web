"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function StatCards() {
  const [programCount, setProgramCount] = useState<number | null>(null);
  const [materiCount, setMateriCount] = useState<number | null>(0); // sementara 0
  const [certificateCount, setCertificateCount] = useState<number | null>(null);
  const [tugasSelesaiCount, setTugasSelesaiCount] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProgramTerdaftar = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/mentee/bookings`,
          {
            params: { page: 1, limit: 1000, status: "confirmed" },
            withCredentials: true,
          },
        );

        const total = res.data?.data?.pagination?.total ?? 0;
        setProgramCount(total);
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.response?.data?.message ||
            "Gagal memuat data program terdaftar.",
        );
      }
    };

    // sementara e-learning belum ada endpoint
    const fetchJumlahMateri = async () => {
      setMateriCount(0);
    };

    const fetchJumlahSertifikat = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/certificate/certificates`,
          {
            params: { status: "verified", page: 1, limit: 1000 },
            withCredentials: true,
          },
        );

        const total = res.data?.data?.total ?? 0;
        setCertificateCount(total);
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.response?.data?.message || "Gagal memuat data sertifikat.",
        );
      }
    };

    // sekarang hanya menghitung project yang sudah direview
    const fetchTugasSelesai = async () => {
      try {
        const projectRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/project/menteesSubmissions`,
          {
            params: { page: 1, limit: 1000 },
            withCredentials: true,
          },
        );

        const projectSubmissions = projectRes.data?.data ?? [];

        const reviewedProjects = projectSubmissions.filter(
          (item: any) =>
            item.isReviewed === true || item.reviewStatus === "REVIEWED",
        ).length;

        setTugasSelesaiCount(reviewedProjects);
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.response?.data?.message || "Gagal memuat data tugas selesai.",
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
      title: "Jumlah Mentoring",
      value: programCount ?? 0,
      icon: "/assets/dashboard/user/programterdaftar.svg",
    },
    {
      title: "Jumlah E-Learning",
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      {stats.map((item, idx) => (
        <div
          key={idx}
          className="relative p-3 bg-white border border-gray-200 rounded-md shadow-sm w-full"
        >
          <ChevronRight className="absolute top-2 right-2 w-3 h-3 text-gray-700" />

          <div className="flex items-center gap-1.5">
            <Image src={item.icon} alt={item.title} width={14} height={14} />
            <span className="text-[12px] text-gray-600">{item.title}</span>
          </div>

          <div className="mt-3 h-7 flex items-center">
            {loading ? (
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              <span className="text-xl font-bold text-gray-900">
                {item.value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
