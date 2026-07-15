import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Practice } from "../ElearningSelection";

interface HeroSectionProps {
  practice: Practice;
}

export default function HeroSection({ practice }: HeroSectionProps) {
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
        {/* 🔧 gap dikecilkan */}
        <div className="grid lg:grid-cols-2 gap-6 xl:gap-8 items-center">
          {/* Left - Illustration */}
          <div className="relative flex items-center justify-center">
            <Image
              src="/assets/practicePage/practiceGroup.svg"
              alt="ilustration"
              width={460}
              height={320}
              className="w-full max-w-sm xl:max-w-md h-auto"
            />
          </div>

          {/* Right - Content */}
          <div className="space-y-5 order-1 lg:order-2 max-w-3xl">
            {/* Title & Description */}
            <div className="space-y-3">
              <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-gray-900 leading-tight">
                {practice.title}
              </h1>

              <p className="text-sm md:text-base text-gray-700 leading-relaxed max-w-4xl">
                {practice.deskripsi}
              </p>
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-2">
              {practice.keywords.map((keyword) => (
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

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                className="
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
