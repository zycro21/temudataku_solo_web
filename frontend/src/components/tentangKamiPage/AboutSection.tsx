import Image from "next/image";
export default function AboutSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-8 md:px-[100px]">
        <div className="grid lg:grid-cols-2 items-center">
          {/* Left side - Logo */}
          <div className="flex justify-center lg:justify-start">
            <div className="bg-white rounded-3xl max-w-md">
              <div className="flex items-center justify-center">
                {/* TemuDataku Logo */}
                <div className="flex items-center">
                  <div className="relative">
                    <Image src="/assets/tentangKamiPage/logo.svg" alt="TemuDataku Logo" width={1000} height={1000} className="w-full h-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-6">Siapa Kami?</h2>

            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <strong>TemuDataku</strong> adalah platform edukasi online yang didesain khusus untuk membantu kamu memahami dan menguasai dunia data science dan AI secara praktis.
                <br />
                Kami percaya bahwa setiap orang—baik mahasiswa, fresh graduate, maupun profesional—berhak mendapatkan akses belajar yang personal dan relevan.
                <br />
                Dengan pendekatan <strong>mentoring 1-on-1, bootcamp terstruktur, short class, hingga latihan berbasis studi kasus nyata</strong>, kami hadir untuk menemani perjalanan belajarmu dengan bimbingan mentor berpengalaman langsung
                dari industri.
                <br />
                <span className="font-semibold text-gray-900">Belajar data science jadi lebih terarah, fleksibel, dan berdampak.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
