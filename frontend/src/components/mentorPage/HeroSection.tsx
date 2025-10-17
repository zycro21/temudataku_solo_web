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
    <section className="bg-gradient-to-br py-12 px-4 md:px-12 lg:px-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Illustration */}
          <div className="relative flex items-center justify-center order-first lg:order-last">
            <Image
              src={"/assets/mentorPage/heroSection.svg"}
              width={600}
              height={400}
              alt="ilustration"
              className="w-full h-full"
            />
          </div>
          {/* Right side - Content */}
          <div className="space-y-6 ">
            {/* Main Heading */}
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl lg:text-4xl font-semibold text-gray-900 leading-tight">
                Belajar Lebih Cepat dengan <br /> Mentor Berpengalaman
              </h1>

              {/* Description */}
              <p className="max-sm:text-sm text-md text-gray-600 leading-relaxed max-w-2xl">
                Dapatkan bimbingan langsung dari praktisi data di perusahaan
                ternama. Dengan pengalaman nyata dan wawasan industri, mereka
                siap membantu kamu mencapai tujuan karier di dunia data.
              </p>
            </div>

            {/* Register Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-6 text-base font-medium shadow-lg hover:cursor-pointer flex items-center gap-2"
                onClick={scrollToMentor}
              >
                Lihat Mentor
                <ArrowDown className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
