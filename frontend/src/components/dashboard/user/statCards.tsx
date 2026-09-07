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

    // 🔥 DIUBAH: dulu hardcode 0 (belum ada endpoint) — sekarang ambil
    // total sub-chapter PUBLISHED (= "total course tersedia") dari
    // endpoint count baru.
    const fetchJumlahMateri = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubChapter/subchapterss/count`,
          { withCredentials: true },
        );
        setMateriCount(res.data?.data?.total ?? 0);
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.response?.data?.message ||
            "Gagal memuat data jumlah e-learning.",
        );
        setMateriCount(0);
      }
    };

    // 🔥 DIUBAH: sekarang gabungan 2 sumber — sertifikat mentoring
    // (Certificate, status "verified", endpoint lama) DITAMBAH sertifikat
    // e-learning (ELearningCertificate, tidak perlu filter status — begitu
    // ada barisnya di /certificates/me berarti sudah "diterima" mentee).
    const fetchJumlahSertifikat = async () => {
      try {
        const [mentoringRes, elearningRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/certificate/certificates`,
            {
              params: { status: "verified", page: 1, limit: 1000 },
              withCredentials: true,
            },
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCertificate/certificates/me`,
            {
              params: { page: 1, limit: 1000 },
              withCredentials: true,
            },
          ),
        ]);

        const mentoringTotal = mentoringRes.data?.data?.total ?? 0;
        const elearningTotal = elearningRes.data?.meta?.total ?? 0;

        setCertificateCount(mentoringTotal + elearningTotal);
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.response?.data?.message || "Gagal memuat data sertifikat.",
        );
      }
    };

    // 🔥 DIUBAH: dulu dihitung dari ProjectSubmission yang sudah direview
    // — sekarang dihitung dari jumlah SubChapter yang statusnya SELESAI
    // (progress 100% atau sudah dapat sertifikat), lewat endpoint baru
    // /api/elearningProgress/progress/completed-count.
    const fetchTugasSelesai = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningProgress/progress/completed-count`,
          { withCredentials: true },
        );
        setTugasSelesaiCount(res.data?.data?.total ?? 0);
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.response?.data?.message || "Gagal memuat data tugas selesai.",
        );
        setTugasSelesaiCount(0);
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
      title: "Jumlah E-Learning Selesai",
      // 🔥 BARU: versi teks khusus mobile — opsional, cuma item ini yang
      // diisi. Item lain nggak punya field ini jadi otomatis fallback ke
      // `title` yang sama persis (nggak berubah).
      mobileTitle: "E-Learning Selesai",
      value: tugasSelesaiCount ?? 0,
      icon: "/assets/dashboard/user/tugasselesai.svg",
    },
  ];

  return (
    // 🔥 DIUBAH: dulu "grid-cols-1 sm:grid-cols-2 gap-4" (1 kolom di HP
    // sempit <640px, br screenshot kamu). Sekarang "grid-cols-2" dari
    // awal (2 kolom bahkan di HP paling sempit) + gap lebih rapat di
    // mobile ("gap-3"). Begitu masuk breakpoint sm (≥640px) ke atas,
    // "sm:gap-4" balik PERSIS sama seperti semula — jadi tampilan
    // desktop/tablet tidak berubah sedikit pun.
    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
      {stats.map((item, idx) => (
        <div
          key={idx}
          // 🔥 DIUBAH: padding sedikit lebih rapat di mobile (p-2.5),
          // balik ke p-3 (original) mulai sm: ke atas.
          className="relative p-2.5 sm:p-3 bg-white border border-gray-200 rounded-md shadow-sm w-full"
        >
          <ChevronRight className="absolute top-2 right-2 w-3 h-3 text-gray-700" />

          <div className="flex items-center gap-1.5">
            <Image src={item.icon} alt={item.title} width={14} height={14} />
            {/* 🔥 DIUBAH: dulu satu <span> nampilin item.title langsung.
                Sekarang 2 <span> — versi mobile pakai mobileTitle (kalau
                ada, fallback ke title kalau nggak ada), versi sm: ke atas
                SELALU pakai title asli. Ukuran font (text-[11px]
                sm:text-[12px]) tetap sama seperti sebelumnya. */}
            <span className="text-[11px] sm:text-[12px] text-gray-600 leading-tight">
              <span className="sm:hidden">
                {item.mobileTitle ?? item.title}
              </span>
              <span className="hidden sm:inline">{item.title}</span>
            </span>
          </div>

          {/* 🔥 DIUBAH: jarak & ukuran angka sedikit dikecilkan khusus
              mobile (mt-2, text-lg), balik ke ukuran original (mt-3,
              text-xl) mulai sm: ke atas. */}
          <div className="mt-2 sm:mt-3 h-7 flex items-center">
            {loading ? (
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                {item.value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
