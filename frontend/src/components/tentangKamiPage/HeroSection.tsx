import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="py-16 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 relative overflow-hidden">
      <div className="max-w-[1150px] mx-auto relative">
        {/* Emerald Card Container */}
        <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl shadow-2xl overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-400/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl"></div>

          <div className="grid lg:grid-cols-2 gap-12 items-center px-8 py-12 md:px-14 md:py-16 relative z-10">
            {/* LEFT SIDE - Content */}
            <div className="space-y-6 text-white">
              <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold leading-tight tracking-tight">
                Kami Pernah Ada di Posisi <br />
                Kamu. Itulah Mengapa Kami <br />
                Membangun <span className="text-emerald-200">TemuDataku</span>
              </h1>

              <p className="text-base md:text-lg text-emerald-50 leading-relaxed max-w-xl">
                TemuDataku adalah platform yang menghubungkan calon profesional
                data dengan mentor industri, pembelajaran berbasis proyek, dan
                komunitas yang suportif. Kami percaya bahwa setiap orang bisa
                sukses di dunia data dengan bimbingan dan ekosistem yang tepat.
              </p>
            </div>

            {/* RIGHT SIDE - Illustration */}
            <div className="relative flex items-center justify-center">
              <Image
                src={"/assets/tentangKamiPage/heroSection.svg"}
                width={600}
                height={400}
                alt="ilustration"
                className="w-[85%] lg:w-full max-w-md drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
