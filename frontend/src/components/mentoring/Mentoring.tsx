"use client";

import { useRef } from "react";
import HeroSection from "./HeroSection";
import WhySection from "./WhySection";
import ChooseSessionSection from "./ChooseSessionSection";
import ProjectExamples from "./ProjectExamples";
import AlumniSays from "./AlumniSays";
import Help from "./NeedHelp";

export default function Mentoring() {
  // Ref untuk setiap section
  const chooseSessionRef = useRef<HTMLDivElement>(null);
  const alumniSaysRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  // 🔥 FIX: dulu pakai ref.current.scrollIntoView() polos — hasilnya
  // section kepotong/ketutup Navbar yang sticky di atas. Sekarang posisi
  // scroll dihitung manual lalu dikurangi tinggi Navbar (NAVBAR_OFFSET)
  // supaya section berhenti dengan jarak aman di bawah Navbar.
  const NAVBAR_OFFSET = 64; // px — sesuaikan kalau tinggi Navbar berubah

  const scrollToSectionWithOffset = (
    ref: React.RefObject<HTMLDivElement | null>,
  ) => {
    const el = ref.current;
    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  };

  const scrollToChooseSession = () => {
    scrollToSectionWithOffset(chooseSessionRef);
  };

  const scrollToAlumniSays = () => {
    scrollToSectionWithOffset(alumniSaysRef);
  };

  const scrollToHelp = () => {
    helpRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Kirim semua fungsi scroll ke HeroSection */}
      <HeroSection
        onScrollToChooseSession={scrollToChooseSession}
        onScrollToAlumniSays={scrollToAlumniSays}
        onScrollToHelp={scrollToHelp}
      />

      <WhySection />

      {/* Section Pilihan Mentoring */}
      <div ref={chooseSessionRef}>
        <ChooseSessionSection />
      </div>

      <ProjectExamples />

      {/* Section AlumniSays */}
      <div ref={alumniSaysRef}>
        <AlumniSays />
      </div>

      {/* Section Help */}
      <div ref={helpRef}>
        <Help />
      </div>
    </>
  );
}
