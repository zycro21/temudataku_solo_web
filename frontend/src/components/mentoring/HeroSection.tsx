"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { User } from "lucide-react";

export default function HeroSection({
  onScrollToChooseSession,
  onScrollToAlumniSays,
  onScrollToHelp,
}: {
  onScrollToChooseSession: () => void;
  onScrollToAlumniSays: () => void;
  onScrollToHelp: () => void;
}) {
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
    <section className="bg-gradient-to-br py-18 px-3 md:px-5 lg:px-6 relative overflow-hidden">
      <Image
        src="/assets/mentoringPage/vectorHeroSection.svg"
        alt="vector background"
        fill
        className="object-cover object-center z-0"
        priority
      />

      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Left side - Illustration */}
          <div className="relative flex items-center justify-center">
            <Image
              src="/assets/mentoringPage/mentoringIlust.svg"
              alt="ilustration"
              width={480}
              height={320}
              className="w-full h-auto max-w-[420px]"
            />
          </div>

          {/* Right side - Content */}
          <div className="space-y-4 order-1 lg:order-2">
            {/* Main Heading */}
            <div className="space-y-2">
              <h1 className="text-lg md:text-xl lg:text-3xl font-semibold text-gray-900 leading-snug">
                Bimbingan Langsung dari <br /> Praktisi Data
              </h1>

              <p className="text-base md:text-lg font-semibold leading-relaxed max-w-xl">
                #MentoringBiarNggakError
              </p>

              {/* Description */}
              <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-xl">
                Belajar data tuh gak harus sendirian. Di TemuDataku, kamu bisa
                dapat insight langsung dari praktisi yang udah terjun di dunia
                data analyst, machine learning, dan AI industry.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={onScrollToChooseSession}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 h-[38px] text-sm font-medium shadow-md hover:cursor-pointer"
              >
                Pilihan Mentoring
              </Button>
              <Button
                variant="outline"
                onClick={onScrollToHelp}
                size="lg"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-4 py-3 h-[38px] text-sm font-medium hover:cursor-pointer"
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
                    <Avatar
                      key={mentor.id}
                      className={`w-9 h-9 shadow-sm flex items-center justify-center ${
                        avatarColors[index % avatarColors.length]
                      }`}
                    >
                      <User className="w-4 h-4" />
                    </Avatar>
                  ))}
                </div>

                {/* Count */}
                <div className="text-xs md:text-sm text-gray-600 font-medium">
                  + 95 mentee telah mendaftar
                </div>
              </div>

              {/* Testimonial Link */}
              <div className="pt-1">
                <button
                  onClick={onScrollToAlumniSays}
                  className="text-sm text-secondary-text-color hover:text-emerald-700 font-medium underline underline-offset-2 transition-colors"
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
