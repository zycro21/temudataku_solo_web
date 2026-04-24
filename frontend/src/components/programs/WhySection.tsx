"use client";
import Image from "next/image";

export default function WhySection() {
  return (
    <section className="py-18 px-4 md:px-5 lg:px-6 bg-white">
      <div className="max-w-[1050px] mx-auto">
        {/* Section Header */}
        <div className="mb-6 flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT */}
          <div className="lg:w-[40%]">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
              Kenapa Harus Ikut Bootcamp di TemuDataku?
            </h2>
          </div>

          {/* RIGHT */}
          <div className="lg:w-[60%]">
            <p className="text-sm md:text-base text-gray-600 lg:text-right">
              Bootcamp ini nggak cuma ngasih teori, tapi juga pengalaman belajar
              yang real dan relevan. Kamu bakal dapet akses ke mentor kece,
              materi yang udah dikurasi, project beneran, dan pastinya komunitas
              seru buat tumbuh bareng!
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
          {/* CARD */}
          <div className="group bg-gray-50 rounded-xl px-6 py-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:bg-white border border-transparent hover:border-emerald-200">
            <div className="flex flex-col gap-4">
              {/* Icon */}
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition">
                <Image
                  src={"/assets/mentoringPage/ask.svg"}
                  alt="Ask questions icon"
                  width={36}
                  height={36}
                  className="w-9 h-9"
                />
              </div>

              {/* Content */}
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  Belajar Langsung Bareng Mentor
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Dapet insight & feedback langsung dari praktisi yang udah
                  berpengalaman di dunia data.
                </p>
              </div>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="group bg-gray-50 rounded-xl px-6 py-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:bg-white border border-transparent hover:border-emerald-200">
            <div className="flex flex-col gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition">
                <Image
                  src={"/assets/programsPage/slides.svg"}
                  alt="slides icon"
                  width={36}
                  height={36}
                  className="w-9 h-9"
                />
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  Project Beneran, Bukan Cuma Teori
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Langsung praktik ngerjain studi kasus biar portofolio kamu
                  makin stand out.
                </p>
              </div>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="group bg-gray-50 rounded-xl px-6 py-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:bg-white border border-transparent hover:border-emerald-200">
            <div className="flex flex-col gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition">
                <Image
                  src={"/assets/mentoringPage/book.svg"}
                  alt="Book icon"
                  width={36}
                  height={36}
                  className="w-9 h-9"
                />
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  Materi Terstruktur & Nggak Ngebosenin
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Disusun step-by-step biar kamu nggak bingung, cocok buat
                  pemula sampai yang mau leveling up.
                </p>
              </div>
            </div>
          </div>

          {/* CARD 4 */}
          <div className="group bg-gray-50 rounded-xl px-6 py-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:bg-white border border-transparent hover:border-emerald-200">
            <div className="flex flex-col gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition">
                <Image
                  src={"/assets/programsPage/community.svg"}
                  alt="community icon"
                  width={36}
                  height={36}
                  className="w-9 h-9"
                />
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  Komunitas Supportive Buat Tumbuh Bareng
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
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
