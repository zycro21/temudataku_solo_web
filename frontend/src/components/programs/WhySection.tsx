import Image from "next/image";

export default function WhySection() {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-white">
      <div className="max-w-[1100px] mx-auto">
        {/* Section Header */}
        <div className="mb-8 flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT SIDE - 25% */}
          <div className="lg:w-[40%]">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Kenapa Harus Ikut Bootcamp di TemuDataku?
            </h2>
          </div>

          {/* RIGHT SIDE - 75% */}
          <div className="lg:w-[60%]">
            <p className="text-base md:text-lg text-gray-600 lg:text-right">
              Bootcamp ini nggak cuma ngasih teori, tapi juga pengalaman belajar
              yang real dan relevan. Kamu bakal dapet akses ke mentor kece,
              materi yang udah dikurasi, project beneran, dan pastinya komunitas
              seru buat tumbuh bareng!
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* CARD TEMPLATE */}
          <div className="group bg-gray-50 rounded-2xl px-8 py-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-white border border-transparent hover:border-emerald-200">
            <div className="flex flex-col gap-6">
              {/* Icon */}
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition">
                <Image
                  src={"/assets/mentoringPage/ask.svg"}
                  alt="Ask questions icon"
                  width={44}
                  height={44}
                  className="w-11 h-11"
                />
              </div>

              {/* Content */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Belajar Langsung Bareng Mentor
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Dapet insight & feedback langsung dari praktisi yang udah
                  berpengalaman di dunia data.
                </p>
              </div>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="group bg-gray-50 rounded-2xl px-8 py-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-white border border-transparent hover:border-emerald-200">
            <div className="flex flex-col gap-6">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition">
                <Image
                  src={"/assets/programsPage/slides.svg"}
                  alt="slides icon"
                  width={44}
                  height={44}
                  className="w-11 h-11"
                />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Project Beneran, Bukan Cuma Teori
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Langsung praktik ngerjain studi kasus biar portofolio kamu
                  makin stand out.
                </p>
              </div>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="group bg-gray-50 rounded-2xl px-8 py-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-white border border-transparent hover:border-emerald-200">
            <div className="flex flex-col gap-6">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition">
                <Image
                  src={"/assets/mentoringPage/book.svg"}
                  alt="Book icon"
                  width={44}
                  height={44}
                  className="w-11 h-11"
                />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Materi Terstruktur & Nggak Ngebosenin
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Disusun step-by-step biar kamu nggak bingung, cocok buat
                  pemula sampai yang mau leveling up.
                </p>
              </div>
            </div>
          </div>

          {/* Benefit 4 */}
          <div className="group bg-gray-50 rounded-2xl px-8 py-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-white border border-transparent hover:border-emerald-200">
            <div className="flex flex-col gap-6">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition">
                <Image
                  src={"/assets/programsPage/community.svg"}
                  alt="community icon"
                  width={44}
                  height={44}
                  className="w-11 h-11"
                />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Komunitas Supportive Buat Tumbuh Bareng
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Nggak belajar sendirian! Ada teman diskusi, semangat bareng,
                  dan networking juga.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
