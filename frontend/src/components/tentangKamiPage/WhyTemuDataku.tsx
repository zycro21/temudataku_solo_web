import { FileText } from "lucide-react";

const features = [
  {
    id: 1,
    title: "Premium Value, Student Budget",
    description:
      "Dapatkan edukasi dan pelatihan Data Science & AI tanpa harus membayar biaya yang mahal. Kami memastikan kualitas tinggi tetap terjangkau untuk student budget.",
  },
  {
    id: 2,
    title: "Hands on Exercise & Real Project",
    description:
      "Terapkan teori secara langsung. Kamu akan mengerjakan mini project dan studi kasus nyata yang relevan dengan industri, siap untuk menjadi amunisi utama portofolio karirmu.",
  },
  {
    id: 3,
    title: "Mentorship with Industry Mentors",
    description:
      "Belajar dan pecahkan masalahmu secara real-time dengan mentor yang aktif bekerja di industri. Dapatkan panduan personal yang berfokus pada solusi untuk mempercepat pemahamanmu.",
  },
  {
    id: 4,
    title: "Supportive Learning Community",
    description:
      "Akses jaringan yang lebih luas dan suportif. Berdiskusi, berkolaborasi, dan temukan informasi loker serta kompetisi terbaru di komunitas eksklusif kami.",
  },
];

export default function WhyTemuDatakuSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-emerald-50/40">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Mengapa TemuDataku?
          </h2>
          <div className="w-24 h-1 bg-emerald-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="relative group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-emerald-200/30 blur-2xl opacity-0 group-hover:opacity-100 transition duration-500 rounded-2xl"></div>

              <div className="relative space-y-6">
                {/* Top Row */}
                <div className="flex items-center gap-4">
                  {/* Number Badge */}
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold">
                    {feature.id}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    {feature.description}
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
