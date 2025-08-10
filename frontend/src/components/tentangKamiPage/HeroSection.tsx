import Image from "next/image";
export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br py-12 px-4 md:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl bg-emerald-600 mx-auto relative z-10 rounded-3xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center p-10">
          {/* Left side - Illustration */}
          <div className="relative flex items-center justify-center order-first lg:order-last">
            <Image src={"/assets/tentangKamiPage/heroSection.svg"} width={600} height={400} alt="ilustration" className="w-3/4 h-3/4" />
          </div>
          {/* Right side - Content */}
          <div className="space-y-6 ">
            {/* Main Heading */}
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl lg:text-4xl font-semibold text-[#F3F4F6] leading-tight">
                Kami Pernah Ada di Posisi <br /> Kamu. Itulah Mengapa Kami <br />
                Membangun <span className="text-[#243A77]">TemuDataku</span>
              </h1>

              {/* Description */}
              <p className="max-sm:text-sm text-md text-[#F3F4F6] leading-relaxed max-w-2xl">
                TemuDataku adalah platform yang menghubungkan calon profesional data dengan mentor industri, pembelajaran berbasis proyek, dan komunitas yang suportif. Kami percaya bahwa setiap orang bisa sukses di dunia data dengan
                bimbingan dan ekosistem yang tepat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
