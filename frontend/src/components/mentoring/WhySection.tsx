import Image from "next/image";

export default function WhySection() {
  return (
    <section className="py-10 md:py-14 px-3 md:px-5 lg:px-6 bg-white">
      <div className="max-w-[1000px] mx-auto">
        {/* Section Header */}
        <div className="mb-6 flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT SIDE */}
          <div className="lg:w-[40%]">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-snug">
              Kenapa Harus Ikut Mentoring di TemuDataku?
            </h2>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:w-[60%]">
            <p className="text-sm md:text-base text-gray-600 lg:text-right leading-relaxed">
              Karena belajar data sendirian tuh bikin overthinking. Di sini,
              kamu bisa dapat arahan langsung dari praktisi yang udah pernah
              ngerasain struggle-nya. Lebih cepat, lebih jelas, dan pastinya gak
              se-error itu.
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
          {/* Card */}
          {[
            {
              icon: "/assets/mentoringPage/ask.svg",
              title: "Tanya Apa Aja, Bebas Judgment",
              desc: "Gak ngerti SQL? Bingung project portofolio? Pengen curhat soal gagal interview? Boleh banget. Mentor di sini no-judge zone 100%.",
              alt: "Ask questions icon",
            },
            {
              icon: "/assets/mentoringPage/book.svg",
              title: "Portofolio Gak Cuma Cakep, Tapi Powerful",
              desc: "Mentor bantuin review, benerin, bahkan kasih ide project biar portofoliomu bisa “speak louder” ke recruiter.",
              alt: "Book icon",
            },
            {
              icon: "/assets/mentoringPage/chat.svg",
              title: "1-on-1 Session, Biar Kamu Fokus Sama Dirimu",
              desc: "Gak perlu rebutan mic atau malu ditanya. Kamu dapat sesi pribadi, jadi bisa all out tanya dan eksplor skill-mu sendiri.",
              alt: "Chat icon",
            },
            {
              icon: "/assets/mentoringPage/gps.svg",
              title: "Mentor = Support System + Career GPS",
              desc: "Mentor bukan cuma ngarahin, tapi juga nyemangatin. Karena belajar data itu emang berat, tapi gak harus kamu lewatin sendiri.",
              alt: "GPS icon",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group bg-gray-50 rounded-lg px-5 py-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:bg-white border border-transparent hover:border-emerald-200"
            >
              <div className="flex flex-col gap-4">
                {/* Icon */}
                <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow transition">
                  <Image
                    src={item.icon}
                    alt={item.alt}
                    width={28}
                    height={28}
                    className="w-7 h-7"
                  />
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
