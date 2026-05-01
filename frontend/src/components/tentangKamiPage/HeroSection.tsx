import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="py-10 sm:py-12 px-4 sm:px-5 md:px-5 lg:px-6 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 relative overflow-hidden">
      <div className="max-w-[1100px] mx-auto relative">
        {/* Emerald Card Container */}
        <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-xl overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-400/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-300/20 rounded-full blur-3xl"></div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center px-5 py-7 sm:px-6 sm:py-8 md:px-10 md:py-10 relative z-10 text-center lg:text-left">
            {/* LEFT SIDE - Content */}
            <div className="space-y-3 sm:space-y-4 text-white mx-auto lg:mx-0 max-w-md lg:max-w-none">
              <h1 className="text-xl md:text-2xl lg:text-4xl font-bold leading-tight tracking-tight">
                Kami Pernah Ada di Posisi <br />
                Kamu. Itulah Mengapa Kami <br />
                Membangun <span className="text-emerald-200">TemuDataku</span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-emerald-50 leading-relaxed max-w-md sm:max-w-lg mx-auto lg:mx-0">
                TemuDataku adalah platform yang menghubungkan calon profesional
                data dengan mentor industri, pembelajaran berbasis proyek, dan
                komunitas yang suportif. Kami percaya bahwa setiap orang bisa
                sukses di dunia data dengan bimbingan dan ekosistem yang tepat.
              </p>
            </div>

            {/* RIGHT SIDE - Illustration */}
            <div className="relative flex items-center justify-center mt-4 sm:mt-6 lg:mt-0">
              <Image
                src={"/assets/tentangKamiPage/heroSection.svg"}
                width={500}
                height={350}
                alt="ilustration"
                className="w-[70%] sm:w-[75%] lg:w-[90%] max-w-xs sm:max-w-sm drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
