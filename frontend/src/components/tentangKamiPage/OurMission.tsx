export default function OurMission() {
  return (
    <section className="py-18 bg-gradient-to-b from-white to-emerald-50/40 relative overflow-hidden">
      <div className="max-w-[1080px] mx-auto px-5 lg:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT SIDE - Text */}
          <div className="space-y-6">
            <h2 className="text-2xl md:text-[30px] font-bold text-gray-900">
              Visi Kami?
            </h2>

            <div className="relative">
              {/* Decorative Quote */}
              <span className="absolute -top-5 -left-3 text-6xl text-emerald-100 font-bold select-none">
                "
              </span>

              <p className="relative text-[15px] md:text-lg font-semibold text-gray-700 leading-relaxed pl-4 border-l-4 border-emerald-500">
                Menjadi platform edukasi Data Science dan AI terdepan yang
                membawa pembelajar dari fundamental hingga mahir melalui
                pendekatan kolaboratif berbasis proyek nyata dan kurikulum
                berbasis industri.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE - Visual Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative group">
              {/* Glow Background */}
              <div className="absolute -inset-5 bg-emerald-200/40 blur-2xl rounded-2xl opacity-70 group-hover:opacity-100 transition duration-500"></div>

              {/* Emerald Card */}
              <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl w-[380px] h-[200px] shadow-xl transition duration-500 group-hover:-translate-y-1.5 group-hover:shadow-emerald-300/40 flex items-center justify-center">
                <div className="text-center text-white px-5">
                  <p className="text-[15px] font-semibold tracking-wide">
                    Empowering Future
                  </p>
                  <p className="text-xl md:text-2xl font-bold">
                    Data Professionals
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
