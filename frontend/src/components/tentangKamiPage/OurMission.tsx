export default function OurMission() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-emerald-50/40 relative overflow-hidden">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT SIDE - Text */}
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Visi Kami?
            </h2>

            <div className="relative">
              {/* Decorative Quote */}
              <span className="absolute -top-6 -left-4 text-7xl text-emerald-100 font-bold select-none">
                "
              </span>

              <p className="relative text-lg md:text-xl font-semibold text-gray-700 leading-relaxed pl-4 border-l-4 border-emerald-500">
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
              <div className="absolute -inset-6 bg-emerald-200/40 blur-3xl rounded-3xl opacity-70 group-hover:opacity-100 transition duration-500"></div>

              {/* Emerald Card */}
              <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl w-[420px] h-[220px] shadow-2xl transition duration-500 group-hover:-translate-y-2 group-hover:shadow-emerald-300/40 flex items-center justify-center">
                
                <div className="text-center text-white px-6">
                  <p className="text-lg font-semibold tracking-wide">
                    Empowering Future
                  </p>
                  <p className="text-2xl font-bold">
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