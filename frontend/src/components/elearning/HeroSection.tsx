"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

export default function HeroSection() {
  const handleScrollToSubscription = () => {
    document
      .getElementById("pilihan-elearning")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // 🔥 BARU: klik "Konsultasi Gratis" langsung buka chat WhatsApp
  // TemuDataku di tab baru.
  const openWhatsApp = () => {
    window.open("https://wa.me/6285156750480", "_blank", "noopener,noreferrer");
  };

  // 🔥 BARU: klik "Apa yang mereka katakan?" auto scroll ke section
  // testimoni (AlumniSays.tsx, id="alumni-says"). Posisi scroll dikurangi
  // NAVBAR_OFFSET supaya section-nya nggak ketutup Navbar sticky di atas
  // (sama seperti fix serupa di HeroSection halaman /programs & /mentoring).
  const NAVBAR_OFFSET = 64; // px — sesuaikan kalau tinggi Navbar berubah

  const scrollToAlumniSays = () => {
    const section = document.getElementById("alumni-says");
    if (!section) return;

    const top =
      section.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  };

  // Sample mentor data - in real app this would come from props or API
  const mentors = [
    {
      id: 1,
      name: "Mentor 1",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 2,
      name: "Mentor 2",
      image:
        "https://images.unsplash.com/photo-1612000529646-f424a2aa1bff?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Mentor 3",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 4,
      name: "Mentor 4",
      image:
        "https://images.unsplash.com/photo-1612000529646-f424a2aa1bff?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 5,
      name: "Mentor 5",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
  ];
  return (
    <section className="bg-gradient-to-br pt-12 pb-32 px-3 md:px-5 lg:px-6 relative overflow-hidden">
      <Image
        src="/assets/mentoringPage/vectorHeroSection.svg"
        alt="vector background"
        fill
        className="object-cover object-center z-0"
        priority
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Left side - Illustration */}
          <div className="relative flex items-center justify-center">
            <Image
              src="/assets/practicePage/practiceGroup.svg"
              alt="ilustration"
              width={480}
              height={320}
              className="w-full h-auto max-w-[420px] mx-auto"
            />
          </div>

          {/* Right side - Content */}
          <div className="space-y-4 order-1 lg:order-2">
            {/* Main Heading */}
            <div className="space-y-2">
              <h1 className="text-lg md:text-xl lg:text-3xl font-extrabold text-gray-900 leading-snug">
                Upgrade Pengetahuan Anda,
                <br /> Kapan Saja, Dimana Saja.
              </h1>

              <p className="text-base md:text-lg font-semibold leading-relaxed max-w-xl">
                #LangkahKecilHasilBesar
              </p>

              {/* Description */}
              <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-xl">
                Skill itu tumbuh kalau dipraktikkan. Yuk, pelajari materi
                interaktif dan coba sendiri langkah-langkahnya!
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                size="lg"
                onClick={handleScrollToSubscription}
                className="
      bg-emerald-600 
      hover:bg-emerald-700 
      text-white 
      px-4 py-3 
      h-[38px]
      text-sm 
      font-medium 
      shadow-md 
      transition-all duration-300 
      hover:scale-105 
      hover:shadow-xl
      hover:cursor-pointer
    "
              >
                Pilihan E-Learning
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={openWhatsApp}
                className="
      border-emerald-600 
      text-emerald-600 
      hover:bg-emerald-50 
      px-4 py-3 
      h-[38px]
      text-sm 
      font-medium 
      transition-all duration-300
      hover:cursor-pointer
    "
              >
                Konsultasi Gratis
              </Button>
            </div>

            {/* Mentor Avatars and Stats */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Avatar Stack */}
                <div className="flex gap-1.5 flex-wrap">
                  {mentors.map((mentor, index) => (
                    <Avatar key={mentor.id} className="w-9 h-9 shadow-sm">
                      <AvatarImage src={mentor.image} alt={mentor.name} />
                      <AvatarFallback className="bg-emerald-200 text-emerald-700 font-medium text-xs">
                        M{index + 1}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>

                {/* Count */}
                <div className="text-xs md:text-sm text-gray-500 font-medium transition-all duration-300 hover:text-gray-700">
                  + 112 mentee telah mendaftar
                </div>
              </div>

              {/* Testimonial Link */}
              <div className="pt-1">
                <button
                  onClick={scrollToAlumniSays}
                  className="
      text-sm
      text-gray-500 
      font-medium 
      underline 
      underline-offset-2 
      transition-all duration-300
      hover:text-gray-700
      hover:underline-offset-4
    "
                >
                  Apa yang mereka katakan?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
