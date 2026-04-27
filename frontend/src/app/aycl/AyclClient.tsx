"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/aycl/HeroSection";
import AboutSection from "@/components/aycl/AboutSection";
import ScheduleSection from "@/components/aycl/ScheduleSection";
import ForWhoSection from "@/components/aycl/ForWhoSection";
import WhyDifferentSection from "@/components/aycl/WhyDifferentSection";
import MentorsSection from "@/components/aycl/MentorSection";
import CurriculumSection from "@/components/aycl/CurriculumSection";
import BenefitsSection from "@/components/aycl/BenefitsSection";
import RegisterSection from "@/components/aycl/RegisterSection";

// ── Shared types (dipakai oleh semua section) ─────────────────────────────────
export interface AyclSection {
  type:
    | "PROGRAM_INFO"
    | "CHALLENGE"
    | "TARGET"
    | "DIFFERENTIATOR"
    | "BENEFIT"
    | "CLOSING";
  title: string;
  order: number;
  content: any;
}

export interface AyclMaterial {
  title: string;
  description: string | null;
}

export interface AyclSchedule {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  googleMeetLink: string | null;
  quota: number | null;
}

export interface AyclData {
  id: string;
  title: string;
  slug: string;
  whatsappGroupLink: string | null;
  price: number;
  headline: string;
  subHeadline: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  sections: AyclSection[];
  materials: AyclMaterial[];
  schedules: AyclSchedule[];
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-100 pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="h-6 w-48 bg-emerald-100 rounded-full mx-auto" />
          <div className="h-10 w-3/4 bg-gray-200 rounded-xl mx-auto" />
          <div className="h-5 w-2/3 bg-gray-100 rounded-lg mx-auto" />
          <div className="h-4 w-1/2 bg-gray-100 rounded-lg mx-auto" />
          <div className="flex gap-3 justify-center pt-4">
            <div className="h-11 w-40 bg-emerald-200 rounded-lg" />
            <div className="h-11 w-40 bg-gray-100 rounded-lg border border-emerald-100" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 bg-white border border-emerald-100 rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-emerald-600 rounded-2xl p-10 space-y-4">
            <div className="h-3 w-32 bg-emerald-500 rounded" />
            <div className="h-8 w-3/4 bg-emerald-500 rounded-xl" />
            <div className="h-4 w-2/3 bg-emerald-500 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Not found state ───────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
        <span className="text-3xl">📚</span>
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Belum Ada Program Aktif
      </h2>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
        Program AYCL sedang dipersiapkan. Pantau terus untuk info batch
        selanjutnya!
      </p>
    </div>
  );
}

export default function AyclClient({ slug }: { slug?: string }) {
  const [data, setData] = useState<AyclData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPublicAycl = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/aycl/public/aycl`,
          {
            params: { slug },
          },
        );

        setData(res.data.data);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          console.error("Gagal memuat data AYCL:", err);
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPublicAycl();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Suspense fallback={<div />}>
          <Navbar />
        </Suspense>
        <PageSkeleton />
        <Footer />
      </>
    );
  }

  if (notFound || !data) {
    return (
      <>
        <Suspense fallback={<div />}>
          <Navbar />
        </Suspense>
        <NotFound />
        <Footer />
      </>
    );
  }

  // Helper: ambil section by type
  const getSection = (type: AyclSection["type"]) =>
    data.sections.find((s) => s.type === type) ?? null;

  return (
    <>
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>
      <HeroSection
        title={data.title}
        headline={data.headline}
        subHeadline={data.subHeadline}
        description={data.description}
        materials={data.materials}
      />
      <AboutSection
        title={data.title}
        programInfo={getSection("PROGRAM_INFO")}
      />
      <ScheduleSection
        title={data.title}
        schedules={data.schedules}
        challenge={getSection("CHALLENGE")}
      />
      <ForWhoSection target={getSection("TARGET")} />
      <WhyDifferentSection
        differentiator={getSection("DIFFERENTIATOR")}
        title={data.title}
      />
      <MentorsSection />
      <CurriculumSection materials={data.materials} loading={loading} />
      <BenefitsSection
        benefit={getSection("BENEFIT")}
        closing={getSection("CLOSING")}
      />
      <RegisterSection
        title={data.title}
        price={data.price}
        whatsappGroupLink={data.whatsappGroupLink}
        schedules={data.schedules}
        batchId={data.id}
      />
      <Footer />
    </>
  );
}
