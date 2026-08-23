import Image from "next/image";

export default function WhySection() {
  return (
    <section className="py-10 md:py-12 px-3 md:px-5 lg:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-8 flex gap-1">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
            Kenapa Harus Mendaftar E-Learning TemuDataku?
          </h2>

          <p className="text-xs md:text-sm text-gray-600 max-w-xl mx-auto text-end leading-relaxed py-1">
            E-Learning TemuDataku dirancang untuk membekali Anda dengan
            keterampilan praktis. Setiap materi disajikan melalui teks
            interaktif, studi kasus nyata, hingga simulasi kerja agar Anda siap
            menghadapi tantangan profesional.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-3 lg:gap-4">
          {/* Benefit 1 */}
          <div className="group flex items-start gap-3 bg-gray-50 rounded-xl px-5 py-6 flex-col transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Image
                  src="/assets/practicePage/stair.svg"
                  alt="stair"
                  width={36}
                  height={36}
                  className="w-9 h-9"
                />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                Belajar Sesuai Ritme Kamu
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Materi pembelajaran bisa diakses kapan aja, jadi kamu bisa
                belajar tanpa terburu-buru dan ulang materi kapan perlu.
              </p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="group flex items-start gap-3 bg-gray-50 rounded-xl px-5 py-6 flex-col transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Image
                  src="/assets/practicePage/db.svg"
                  alt="db"
                  width={36}
                  height={36}
                  className="w-9 h-9"
                />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                Materi Terupdate
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Konten pembelajaran selalu diperbarui sesuai tren dan kebutuhan
                industri terbaru, biar skill kamu tetap relevan.
              </p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="group flex items-start gap-3 bg-gray-50 rounded-xl px-5 py-6 flex-col transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <Image
                  src="/assets/practicePage/case.svg"
                  alt="work"
                  width={36}
                  height={36}
                  className="w-9 h-9"
                />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                Interaktif dan Seru
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Materi dilengkapi kuis, aktivitas interaktif, dan tantangan
                singkat supaya belajar jadi lebih aktif dan nggak bosen.
              </p>
            </div>
          </div>

          {/* Benefit 4 */}
          <div className="group flex items-start gap-3 bg-gray-50 rounded-xl px-5 py-6 flex-col transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <Image
                  src="/assets/practicePage/work.svg"
                  alt="case1"
                  width={36}
                  height={36}
                  className="w-9 h-9"
                />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                Penjelasan Langsung dari Ahlinya
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Setiap materi disusun oleh pakar yang berpengalaman, biar kamu
                paham konsepnya, bukan cuma hafalan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
