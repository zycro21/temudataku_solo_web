"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, SearchX } from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProgramsDetail from "@/components/programs/detail/Program";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/public-mentoring-services/${id}`,
          {
            withCredentials: true,
          },
        );
        setData(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  // 🔥 LOADING DESIGN
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-700">
              Memuat Detail Program...
            </h2>
            <p className="text-sm text-gray-500">Mohon tunggu sebentar ya 🚀</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // 🔥 EMPTY STATE DESIGN
  if (!data) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
          <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md w-full text-center">
            <SearchX className="w-14 h-14 mx-auto text-gray-400 mb-4" />

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Program Tidak Ditemukan
            </h2>

            <p className="text-gray-500 mb-6">
              Sepertinya program yang kamu cari tidak tersedia atau sudah
              dihapus.
            </p>

            <button
              onClick={() => router.push("/programs")}
              className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
            >
              Kembali ke Daftar Program
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <ProgramsDetail data={data} />
      <Footer />
    </>
  );
}
