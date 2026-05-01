"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import RegisterModal from "@/components/RegisterModal";

export default function HeroSection() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <section className="bg-gradient-to-br py-10 px-4 md:px-5 lg:px-6 relative overflow-hidden">
      <Image
        src="/assets/homePage/vectorHeroSection.svg"
        alt="vector background"
        fill
        className="object-cover object-center z-0"
        priority
      />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-6 items-center">
          {/* Left side - Illustration */}
          <div className="relative flex items-center justify-center order-first lg:order-last px-2">
            <Image
              src="/assets/homePage/illustrationHero.svg"
              alt="ilustration"
              width={500}
              height={320}
              priority
              fetchPriority="high"
              className="w-full max-w-xs sm:max-w-md h-auto"
            />
          </div>

          {/* Right side - Content */}
          <div className="space-y-5 text-center lg:text-left">
            {/* Main Heading */}
            <div className="space-y-2">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 leading-snug">
                Jembatan Menuju Karier <br /> Impian di Dunia Data
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Temukan jalur belajar yang terstruktur, bimbingan dari mentor
                industri, dan proyek nyata untuk mengasah keterampilan datamu.
              </p>
            </div>

            {/* Register Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 items-center lg:items-start">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 text-sm sm:text-base font-medium shadow-md hover:cursor-pointer w-full sm:w-auto"
                onClick={() => setShowRegister(true)}
              >
                Daftar Sekarang
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Daftar */}
      <RegisterModal
        isOpen={showRegister}
        setIsOpen={setShowRegister}
        openLogin={() => {
          setShowRegister(false);
        }}
      />
    </section>
  );
}
