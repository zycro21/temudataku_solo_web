import Image from "next/image";

export default function WhySection() {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-white">
      <div className="max-w-[1100px] mx-auto">
        {/* Section Header */}
        <div className="mb-8 flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT SIDE */}
          <div className="lg:w-[40%]">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Kenapa Harus Ikut Mentoring di TemuDataku?
            </h2>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:w-[60%]">
            <p className="text-base md:text-lg text-gray-600 lg:text-right">
              Karena belajar data sendirian tuh bikin overthinking. Di sini,
              kamu bisa dapat arahan langsung dari praktisi yang udah pernah
              ngerasain struggle-nya. Lebih cepat, lebih jelas, dan pastinya gak
              se-error itu.
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Benefit 1 */}
          <div className="group bg-gray-50 rounded-2xl px-8 py-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-white border border-transparent hover:border-emerald-200">
            <div className="flex flex-col gap-6">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition">
                <Image
                  src={"/assets/mentoringPage/ask.svg"}
                  alt="Ask questions icon"
                  width={44}
                  height={44}
                  className="w-11 h-11"
                />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Tanya Apa Aja, Bebas Judgment
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Gak ngerti SQL? Bingung project portofolio? Pengen curhat soal
                  gagal interview? Boleh banget. Mentor di sini no-judge zone
                  100%.
                </p>
              </div>
            </div>
          </div>

          {/* Benefit 2 */}
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
                  Portofolio Gak Cuma Cakep, Tapi Powerful
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Mentor bantuin review, benerin, bahkan kasih ide project biar
                  portofoliomu bisa &ldquo;speak louder&rdquo; ke recruiter.
                </p>
              </div>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="group bg-gray-50 rounded-2xl px-8 py-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-white border border-transparent hover:border-emerald-200">
            <div className="flex flex-col gap-6">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition">
                <Image
                  src={"/assets/mentoringPage/chat.svg"}
                  alt="Chat icon"
                  width={44}
                  height={44}
                  className="w-11 h-11"
                />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  1-on-1 Session, Biar Kamu Fokus Sama Dirimu
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Gak perlu rebutan mic atau malu ditanya. Kamu dapat sesi
                  pribadi, jadi bisa all out tanya dan eksplor skill-mu sendiri.
                </p>
              </div>
            </div>
          </div>

          {/* Benefit 4 */}
          <div className="group bg-gray-50 rounded-2xl px-8 py-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-white border border-transparent hover:border-emerald-200">
            <div className="flex flex-col gap-6">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition">
                <Image
                  src={"/assets/mentoringPage/gps.svg"}
                  alt="GPS icon"
                  width={44}
                  height={44}
                  className="w-11 h-11"
                />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Mentor = Support System + Career GPS
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Mentor bukan cuma ngarahin, tapi juga nyemangatin. Karena
                  belajar data itu emang berat, tapi gak harus kamu lewatin
                  sendiri.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
