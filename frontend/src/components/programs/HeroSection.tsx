"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
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

  const scrollToPractice = () => {
    const section = document.getElementById("practice-selection");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const avatarColors = [
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
    "bg-indigo-100 text-indigo-700",
    "bg-teal-100 text-teal-700",
    "bg-cyan-100 text-cyan-700",
    "bg-lime-100 text-lime-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-sky-100 text-sky-700",
  ];

  return (
    <section className="bg-gradient-to-br py-12 px-4 md:px-6 lg:px-8 relative overflow-hidden">
      <Image
        src="/assets/mentoringPage/vectorHeroSection.svg"
        alt="vector background"
        fill
        className="object-cover object-center z-0"
        priority
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Illustration */}
          <div className="relative flex items-center justify-center">
            <Image
              src="/assets/programsPage/programsIllustration.svg"
              alt="ilustration"
              width={600}
              height={400}
              className="w-full h-full"
            />
          </div>

          {/* Right side - Content */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Main Heading */}
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl lg:text-4xl font-semibold text-gray-900 leading-tight">
                Materi Terstruktur & Praktik Langsung dengan Bootcamp
              </h1>

              <p className="text-xl font-semibold leading-relaxed max-w-2xl">
                #GasBelajarData
              </p>

              {/* Description */}
              <p className="max-sm:text-sm text-md text-gray-600 leading-relaxed max-w-2xl">
                Bootcamp TemuDataku dirancang buat kamu yang pengen belajar data
                dari nol sampai paham, tanpa pusing. Materinya udah disusun rapi
                dan langsung dipraktikkin, jadi kamu nggak cuma belajar—tapi
                juga beneran bisa!
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={scrollToPractice}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-6 text-base font-medium shadow-lg hover:cursor-pointer"
              >
                Pilihan Bootcamp
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-4 py-6 text-base font-medium hover:cursor-pointer"
              >
                Konsultasi Gratis
              </Button>
            </div>

            {/* Mentor Avatars and Stats */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {/* Avatar Stack */}

                <div className="flex gap-2 flex-wrap">
                  {mentors.map((mentor, index) => (
                    <Avatar
                      key={mentor.id}
                      className={`w-12 h-12 shadow-md flex items-center justify-center ${avatarColors[index % avatarColors.length]}`}
                    >
                      <User className="w-6 h-6" />
                    </Avatar>
                  ))}
                </div>

                {/* Count */}
                <div className="text-gray-600 font-medium">
                  + 95 mentee telah mendaftar
                </div>
              </div>

              {/* Testimonial Link */}
              <div className="pt-2">
                <button className="text-secondary-text-color hover:text-emerald-700 font-medium underline underline-offset-4 transition-colors">
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
