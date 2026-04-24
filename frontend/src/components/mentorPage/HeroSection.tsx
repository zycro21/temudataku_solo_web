"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { useRef } from "react";

export default function HeroSection() {
  // Scroll ke section mentor
  const scrollToMentor = () => {
    const mentorSection = document.getElementById("mentorSection");
    if (mentorSection) {
      mentorSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="bg-gradient-to-br py-10 px-4 md:px-8 lg:px-14 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Illustration */}
          <div className="relative flex items-center justify-center order-first lg:order-last">
            <Image
              src={"/assets/mentorPage/heroSection.svg"}
              width={520}
              height={340}
              alt="ilustration"
              className="w-full max-w-md h-auto"
            />
          </div>

          {/* Right side - Content */}
          <div className="space-y-4">
            {/* Main Heading */}
            <div className="space-y-1.5">
              <h1 className="text-lg md:text-xl lg:text-3xl font-semibold text-gray-900 leading-snug">
                Belajar Lebih Cepat dengan <br /> Mentor Berpengalaman
              </h1>

              {/* Description */}
              <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-xl">
                Dapatkan bimbingan langsung dari praktisi data di perusahaan
                ternama. Dengan pengalaman nyata dan wawasan industri, mereka
                siap membantu kamu mencapai tujuan karier di dunia data.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-base font-medium shadow-md hover:cursor-pointer flex items-center gap-2"
                onClick={scrollToMentor}
              >
                Lihat Mentor
                <ArrowDown className="w-[18px] h-[18px]" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
