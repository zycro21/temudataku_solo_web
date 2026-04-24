import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="py-14 bg-gradient-to-b from-white to-emerald-50/40 relative overflow-hidden">
      <div className="max-w-[1050px] mx-auto px-4 lg:px-6 relative">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* LEFT SIDE - Logo Card */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-3 bg-emerald-200/40 blur-xl rounded-2xl opacity-60 group-hover:opacity-90 transition duration-500"></div>

              {/* Card */}
              <div className="relative bg-white rounded-2xl shadow-lg p-7 transition duration-500 group-hover:-translate-y-1.5 group-hover:shadow-xl">
                <Image
                  src="/assets/tentangKamiPage/logo.svg"
                  alt="TemuDataku Logo"
                  width={800}
                  height={800}
                  className="w-56 mx-auto"
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Content */}
          <div className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Siapa Kami?
            </h2>

            <div className="space-y-4 text-gray-700 leading-relaxed text-sm md:text-base">
              <p>
                <strong>TemuDataku</strong> adalah platform edukasi online yang
                didesain khusus untuk membantu kamu memahami dan menguasai dunia
                data science dan AI secara praktis.
                <br />
                Kami percaya bahwa setiap orang—baik mahasiswa, fresh graduate,
                maupun profesional—berhak mendapatkan akses belajar yang
                personal dan relevan.
                <br />
                Dengan pendekatan{" "}
                <strong>
                  mentoring 1-on-1, bootcamp terstruktur, E-Learning, All You
                  Can Learn, hingga latihan berbasis studi kasus nyata
                </strong>
                , kami hadir untuk menemani perjalanan belajarmu dengan
                bimbingan mentor berpengalaman langsung dari industri.
                <br />
                <span className="font-semibold text-emerald-600">
                  Belajar data science jadi lebih terarah, fleksibel, dan
                  berdampak.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
