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
    <section className="py-16 bg-gradient-to-b from-white to-emerald-50/40">
      <div className="max-w-[1050px] mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Mengapa TemuDataku?
          </h2>
          <div className="w-20 h-1 bg-emerald-500 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="relative group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-emerald-200/30 blur-xl opacity-0 group-hover:opacity-100 transition duration-500 rounded-xl"></div>

              <div className="relative space-y-4">
                {/* Top Row */}
                <div className="flex items-center gap-3">
                  {/* Number Badge */}
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-semibold text-sm">
                    {feature.id}
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
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
