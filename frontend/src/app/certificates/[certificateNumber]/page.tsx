"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CertificateVerifiedCard, {
  type CertificateVerifyData,
} from "@/components/certificates/CertificateVerifiedCard";
import CertificateNotFoundState from "@/components/certificates/CertificateNotFoundState";
import CertificateLoadingState from "@/components/certificates/CertificateLoadingState";
import CertificateBrandHeader from "@/components/certificates/CertificateBrandHeader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type ViewState = "loading" | "found" | "not-found" | "error";

export default function CertificateVerifyPage() {
  const params = useParams();
  const certificateNumber = params?.certificateNumber as string;

  const [data, setData] = useState<CertificateVerifyData | null>(null);
  const [state, setState] = useState<ViewState>("loading");

  useEffect(() => {
    if (!certificateNumber) return;

    const fetchCertificate = async () => {
      setState("loading");
      try {
        // Endpoint PUBLIK, sengaja tidak pakai withCredentials — halaman
        // ini harus tetap bisa diakses orang yang belum/tidak login
        // (siapapun yang scan QR fisik sertifikat).
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCertificate/certificates/verify/${certificateNumber}`,
        );
        setData(res.data?.data ?? null);
        setState("found");
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setState("not-found");
        } else {
          console.error("Gagal memuat data sertifikat:", err);
          setState("error");
        }
      }
    };

    fetchCertificate();
  }, [certificateNumber]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 via-white to-white">
      <Navbar />

      <div className="flex-1 mx-auto flex max-w-2xl flex-col items-center px-4 py-10 sm:py-16">
        <CertificateBrandHeader />

        <div className="mt-8 w-full">
          {state === "loading" && <CertificateLoadingState />}

          {state === "found" && data && <CertificateVerifiedCard data={data} />}

          {(state === "not-found" || state === "error") && (
            <CertificateNotFoundState isError={state === "error"} />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
