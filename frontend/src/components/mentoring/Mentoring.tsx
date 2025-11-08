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

  // Fungsi scroll halus
  const scrollToChooseSession = () => {
    chooseSessionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToAlumniSays = () => {
    alumniSaysRef.current?.scrollIntoView({ behavior: "smooth" });
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
