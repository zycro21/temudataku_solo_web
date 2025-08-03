import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import Image from "next/image";
import ornamen from "@/assets/homePage/ornamenBenefit.svg";
const benefits = [
  {
    id: 1,
    title: "Lorem Ipsum",
    description: "Lorem ipsum dolor sit amet consectetur. Urna ornare quam facilisis elit est quam.",
  },
  {
    id: 2,
    title: "Lorem Ipsum",
    description: "Lorem ipsum dolor sit amet consectetur. Urna ornare quam facilisis elit est quam.",
  },
  {
    id: 3,
    title: "Lorem Ipsum",
    description: "Lorem ipsum dolor sit amet consectetur. Urna ornare quam facilisis elit est quam.",
  },
  {
    id: 4,
    title: "Lorem Ipsum",
    description: "Lorem ipsum dolor sit amet consectetur. Urna ornare quam facilisis elit est quam.",
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-16 bg-[#E5E7EB] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-0 w-40 h-40 ">
        <Image src={ornamen} alt="ornamen" className="scale-200" />
      </div>
      <div className="absolute bottom-10 -left-0  w-40 h-40 ">
        <Image src={ornamen} alt="ornamen" className="scale-200" />
      </div>

      <div className="container mx-auto px-8 md:px-[100px] relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left side - Text content */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Benefit</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Kenapa Belajar di TemuDataku?</h2>
              <p className="text-gray-600 leading-relaxed mb-8 max-w-lg">
                TemuDataku hadir sebagai platform learning terdepan untuk membantu Anda menguasai dunia data. Kami tidak sekedar mengajar, tapi menghubungkan Anda dengan masa depan karier yang cemerlang di bidang data science, analytics,
                dan teknologi informasi.
              </p>
            </div>

            <Button className="bg-[#0CA678] hover:bg-[#08916C] text-white px-8 py-3 rounded-md font-medium">Lihat Jalur Belajar</Button>
          </div>

          {/* Right side - Benefits grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.id} className="bg-white shadow-sm hover:shadow-md transition-shadow border-0">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-[#0CA678] rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
