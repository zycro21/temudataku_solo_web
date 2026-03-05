import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-emerald-50/40 relative overflow-hidden">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* LEFT SIDE - Logo Card */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-emerald-200/40 blur-2xl rounded-3xl opacity-70 group-hover:opacity-100 transition duration-500"></div>

              {/* Card */}
              <div className="relative bg-white rounded-3xl shadow-xl p-10 transition duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                <Image
                  src="/assets/tentangKamiPage/logo.svg"
                  alt="TemuDataku Logo"
                  width={1000}
                  height={1000}
                  className="w-72 mx-auto"
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Content */}
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Siapa Kami?
            </h2>

            <div className="space-y-5 text-gray-700 leading-relaxed text-base md:text-lg">
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
