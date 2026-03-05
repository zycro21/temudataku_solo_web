import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Practice } from "../ElearningSelection";

interface HeroSectionProps {
  practice: Practice;
}

export default function HeroSection({ practice }: HeroSectionProps) {
  return (
    <section className="bg-gradient-to-br py-16 px-4 md:px-6 lg:px-12 relative overflow-hidden">
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
        <div className="grid lg:grid-cols-2 gap-10 xl:gap-12 items-center">
          {/* Left - Illustration */}
          <div className="relative flex items-center justify-center">
            <Image
              src="/assets/practicePage/practiceGroup.svg"
              alt="ilustration"
              width={580}
              height={400}
              className="w-full max-w-lg xl:max-w-xl h-auto"
            />
          </div>

          {/* Right - Content */}
          <div className="space-y-8 order-1 lg:order-2 max-w-3xl">
            {/* Title & Description */}
            <div className="space-y-5">
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 leading-tight">
                {practice.title}
              </h1>

              <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-4xl">
                {practice.deskripsi}
              </p>
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-3">
              {practice.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="
                    px-4 py-1.5
                    rounded-full
                    text-sm font-medium
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
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <Button
                size="lg"
                className="
                  bg-emerald-600 
                  hover:bg-emerald-700 
                  text-white 
                  px-8 py-6 
                  text-base 
                  font-semibold 
                  shadow-lg 
                  transition-all duration-300 
                  hover:scale-105 
                  hover:shadow-2xl
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
                  px-8 py-6 
                  text-base 
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
