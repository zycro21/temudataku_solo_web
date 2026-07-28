"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { ElearningCourseDetailApiItem } from "@/hooks/useElearningCourseDetail";

interface HeroSectionProps {
  course: ElearningCourseDetailApiItem;
}

// 🔥 thumbnailImages dari DB sudah termasuk path lengkapnya sendiri
// (mis. "/images/elearningThumbnail/thumbnail-....png"), jadi tinggal
// ditempel ke base URL — sama seperti resolver di halaman katalog.
function resolveThumbnailImage(thumbnail: string | null | undefined) {
  if (!thumbnail) return null;
  if (thumbnail.startsWith("http")) return thumbnail;
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}${thumbnail}`;
}

export default function HeroSection({ course }: HeroSectionProps) {
  const thumbnail = resolveThumbnailImage(course.thumbnailImages?.[0]);

  const scrollToMateri = () => {
    document
      .getElementById("materi-belajar")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="bg-gradient-to-br py-10 px-3 md:px-5 lg:px-8 relative overflow-hidden">
      <Image
        src="/assets/mentoringPage/vectorHeroSection.svg"
        alt="vector background"
        fill
        className="object-cover object-center z-0"
        priority
      />

      {/* Container */}
      <div className="max-w-screen-2xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 xl:gap-8 items-center">
          {/* Left - Thumbnail course (fallback ke ilustrasi kalau kosong) */}
          <div className="relative flex items-center justify-center">
            {thumbnail ? (
              <div className="relative w-full max-w-sm xl:max-w-md aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
                <Image
                  src={thumbnail}
                  alt={course.title}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            ) : (
              <Image
                src="/assets/practicePage/practiceGroup.svg"
                alt="ilustration"
                width={460}
                height={320}
                className="w-full max-w-sm xl:max-w-md h-auto"
              />
            )}
          </div>

          {/* Right - Content */}
          <div className="space-y-5 order-1 lg:order-2 max-w-3xl">
            {/* Title & Description */}
            <div className="space-y-3">
              <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-extrabold text-gray-900 leading-tight">
                {course.title}
              </h1>

              {course.description && (
                <p className="text-sm md:text-base text-gray-700 leading-relaxed max-w-4xl">
                  {course.description}
                </p>
              )}
            </div>

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {course.tags.map((keyword) => (
                  <span
                    key={keyword}
                    className="
                      px-3 py-1
                      rounded-full
                      text-xs font-medium
                      bg-gray-100
                      text-gray-700
                      border border-gray-200
                      transition-all duration-200
                      hover:bg-gray-200
                      hover:text-gray-900
                      hover:shadow-sm
                      hover:-translate-y-0.5
                      cursor-default
                    "
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                onClick={scrollToMateri}
                size="lg"
                className="
                  w-full sm:w-auto
                  bg-emerald-600 
                  hover:bg-emerald-700 
                  text-white 
                  px-5 py-3 
                  h-[38px]
                  text-sm 
                  font-medium 
                  shadow-md 
                  transition-all duration-300 
                  hover:scale-105 
                  hover:shadow-xl
                "
              >
                Mulai Belajar
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="
                  border-emerald-600 
                  text-emerald-600 
                  hover:bg-emerald-50 
                  px-5 py-3 
                  h-[38px]
                  text-sm 
                  font-medium 
                  transition-all duration-300
                "
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
