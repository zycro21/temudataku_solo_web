import { Button } from "@/components/ui/button";
import Image from "next/image";
import vector from "@/assets/homePage/vectorHeroSection.svg";
import ilustration from "@/assets/homePage/illustrationHero.svg";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br py-12 px-4 md:px-6 lg:px-8 relative overflow-hidden">
      <Image src={vector} alt="vector background" fill className="object-cover object-center z-0" priority />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Illustration */}
          <div className="relative flex items-center justify-center order-first lg:order-last">
            <Image src={ilustration} alt="ilustration" className="w-full h-full" />
          </div>
          {/* Right side - Content */}
          <div className="space-y-6 ">
            {/* Main Heading */}
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl lg:text-4xl font-semibold text-gray-900 leading-tight">
                Jembatan Menuju Karier <br /> Impian di Dunia Data
              </h1>

              {/* Description */}
              <p className="max-sm:text-sm text-md text-gray-600 leading-relaxed max-w-2xl">Temukan jalur belajar yang terstruktur, bimbingan dari mentor industri, dan proyek nyata untuk mengasah keterampilan datamu.</p>
            </div>

            {/* Register Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-6 text-base font-medium shadow-lg hover:cursor-pointer">
                Daftar Sekarang
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
