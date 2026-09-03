"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function ArtikelHeroSection() {
  // Tombol "Jelajahi Artikel" scroll ke section pencarian tepat di bawah
  // hero — konsisten sama pola "handleScrollToSubscription" di
  // HeroSection.tsx (elearning/practice), cuma target section-nya beda.
  const scrollToSearch = () => {
    document
      .getElementById("cari-artikel")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // Sama persis pola "openWhatsApp" yang dipakai berulang di HeroSection &
  // NeedHelp — chat WhatsApp TemuDataku di tab baru.
  const openWhatsApp = () => {
    window.open("https://wa.me/6285156750480", "_blank", "noopener,noreferrer");
  };

  return (
    <section className="bg-gradient-to-br pt-12 pb-16 px-3 md:px-5 lg:px-6 relative overflow-hidden">
      <Image
        src="/assets/mentoringPage/vectorHeroSection.svg"
        alt="vector background"
        fill
        className="object-cover object-center z-0"
        priority
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Left side - Illustration — disembunyiin di mobile biar hero
              lebih ringkas & fokus ke teks, tetap tampil dari sm: ke
              atas seperti semula. */}
          <div className="relative hidden items-center justify-center sm:flex">
            {/* 🔥 CATATAN: ganti src ini ke asset ilustrasi khusus halaman
                Artikel begitu asetnya sudah tersedia — sementara masih
                reuse ilustrasi practice/mentoring biar layout-nya bisa
                langsung dicoba. */}
            <Image
              src="/assets/practicePage/practiceGroup.svg"
              alt="ilustrasi orang membaca artikel"
              width={480}
              height={320}
              className="w-full h-auto max-w-[420px] mx-auto"
            />
          </div>

          {/* Right side - Content */}
          <div className="space-y-4 order-1 lg:order-2">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-xl lg:text-3xl font-extrabold text-gray-900 leading-snug">
                Temukan Insight Baru,
                <br />
                <span className="text-emerald-600">
                  Perluas Perspektif Anda
                </span>
              </h1>

              <p className="text-base md:text-lg font-semibold leading-relaxed max-w-xl">
                #LangkahKecilHasilBesar
              </p>

              <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-xl">
                Jelajahi berbagai artikel pilihan seputar data, AI, karier, dan
                berbagai insight yang dapat membantumu terus belajar dan
                berkembang.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                size="lg"
                onClick={scrollToSearch}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 h-[38px] text-sm font-medium shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl hover:cursor-pointer"
              >
                Jelajahi Artikel
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={openWhatsApp}
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-4 py-3 h-[38px] text-sm font-medium transition-all duration-300 hover:cursor-pointer"
              >
                Konsultasi Gratis
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
