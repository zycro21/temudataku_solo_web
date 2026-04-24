import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import Image from "next/image";

const benefits = [
  {
    id: 1,
    title: "Premium Value, Student Budget",
    description:
      "Dapatkan edukasi dan pelatihan Data Science & AI tanpa harus membayar biaya  yang mahal. Kami memastikan kualitas tinggi tetap terjangkau untuk student budget.",
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

export default function BenefitsSection({
  onClickCTA,
}: {
  onClickCTA?: () => void;
}) {
  return (
    <section className="py-10 mt-15 bg-[#E5E7EB] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-16 right-0 w-28 h-28">
        <Image
          src="/assets/homePage/ornamenBenefit.svg"
          alt="ornamen"
          width={120}
          height={120}
          className="scale-150"
        />
      </div>
      <div className="absolute bottom-6 left-0 w-28 h-28">
        <Image
          src="/assets/homePage/ornamenBenefit.svg"
          alt="ornamen"
          width={120}
          height={120}
          className="scale-150"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left side */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-2">
                Nilai <span className="font-bold">Plus</span>
              </p>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-snug">
                Kenapa Belajar di <br />
                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  TemuDataku?
                </span>
              </h1>

              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6 max-w-xl">
                TemuDataku hadir untuk mempercepat karier kamu di dunia Data &
                AI. Kami fokus memberikan bimbingan yang tepat, menghubungkan
                kamu dengan mentor industri, dan membekali kamu dengan
                keterampilan praktis untuk masa depan karier yang cemerlang.
              </p>
            </div>

            <Button
              onClick={onClickCTA}
              className="bg-[#0CA678] hover:bg-[#08916C] text-white px-6 py-2.5 rounded-md font-semibold text-base"
            >
              Lihat Jalur Belajar
            </Button>
          </div>

          {/* Right side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <Card
                key={benefit.id}
                className="bg-white shadow-sm hover:shadow-md transition-shadow border-0"
              >
                <CardContent className="p-4 pt-0 pb-2">
                  <div className="mb-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <Image
                        src="/assets/homePage/greenbook.svg"
                        alt="icon benefit"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
