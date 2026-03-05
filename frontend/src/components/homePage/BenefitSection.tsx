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
    <section className="py-16 mt-16 bg-[#E5E7EB] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-0 w-40 h-40 ">
        <Image
          src="/assets/homePage/ornamenBenefit.svg"
          alt="ornamen"
          width={160}
          height={160}
          className="scale-200"
        />
      </div>
      <div className="absolute bottom-10 -left-0  w-40 h-40 ">
        <Image
          src="/assets/homePage/ornamenBenefit.svg"
          alt="ornamen"
          width={160}
          height={160}
          className="scale-200"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left side - Text content */}
          <div className="space-y-6">
            <div>
              <p className="text-base font-semibold text-blue-900 mb-4">
                Nilai <span className="font-bold">Plus</span>
              </p>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Kenapa Belajar di <br />
                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  TemuDataku?
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-loose mb-10 max-w-2xl">
                TemuDataku hadir untuk mempercepat karier kamu di dunia Data &
                AI. Kami fokus memberikan bimbingan yang tepat, menghubungkan
                kamu dengan mentor industri, dan membekali kamu dengan
                keterampilan praktis untuk masa depan karier yang cemerlang di
                data science dan AI.
              </p>
            </div>

            <Button
              onClick={onClickCTA}
              className="bg-[#0CA678] hover:bg-[#08916C] text-white px-10 py-4 rounded-md font-semibold text-lg"
            >
              Lihat Jalur Belajar
            </Button>
          </div>

          {/* Right side - Benefits grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <Card
                key={benefit.id}
                className="bg-white shadow-sm hover:shadow-md transition-shadow border-0"
              >
                <CardContent className="p-6 pt-0 pb-2">
                  <div className="mb-4">
                    <div className="w-14 h-14 flex items-center justify-center">
                      <Image
                        src="/assets/homePage/greenbook.svg"
                        alt="icon benefit"
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
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
