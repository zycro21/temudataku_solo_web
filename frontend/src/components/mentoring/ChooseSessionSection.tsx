"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import axios from "axios";
import MentorSelectionModal from "./MentorSelectionModal";
import { toast } from "sonner";

type ServiceType = "one-on-one" | "group";

export default function ChooseSessionSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const oneOnOneFeatures = [
    "Mentoring 45 menit",
    "Tanya apapun permasalahan dalam bidang data science",
    "Rekaman sesi mentoring",
    "Garansi kepuasan*",
    "Dapatkan akses ke praktik data science**",
  ];

  const groupFeatures = [
    "Mentoring 90 menit",
    "Tanya apapun permasalahan dalam bidang data science",
    "Rekaman sesi mentoring",
    "Garansi kepuasan*",
    "Dapatkan akses ke praktik data science**",
  ];

  const handleSelectService = async (type: ServiceType) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/public-mentoring-services`,
        {
          params: {
            serviceType: type,
            page: 1,
            limit: 1,
          },
        },
      );

      const services = response.data?.data || [];

      if (services.length === 0) {
        toast.error("Service belum tersedia.");
        return;
      }

      // ambil service terbaru (karena limit 1 dan default urutan terbaru dari backend)
      const service = services[0];

      setSelectedService(service);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Gagal mengambil service:", error);
      toast.error("Terjadi kesalahan saat mengambil layanan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-15 px-3 md:px-5 lg:px-6">
      <div className="max-w-[1000px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Pilih Gaya Belajar Sesuai Vibenya Kamu!
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Mau belajar bareng mentor secara intensif atau fleksibel sesuai
            waktu kamu? TemuDataku punya beberapa pilihan mentoring yang bisa
            disesuaikan sama kebutuhan dan ritme belajar kamu.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
          {/* 1-on-1 Card */}
          <Card className="relative overflow-hidden py-0 rounded-lg">
            <div className="relative h-44 md:h-48">
              <Image
                src={"/assets/mentoringPage/mentoring1on1.svg"}
                alt="1-on-1 Mentoring"
                fill
                className="object-cover"
              />
            </div>

            <CardContent className="p-4">
              <CardHeader className="p-0 mb-3">
                <CardTitle className="text-lg md:text-xl font-semibold">
                  Mentoring 1 on 1
                </CardTitle>
              </CardHeader>

              <div className="mb-4">
                <div className="text-xs text-gray-500 line-through">
                  Rp 199.000
                </div>
                <div className="text-xl md:text-2xl font-bold">Rp 99.000</div>
              </div>

              <div className="space-y-2.5 mb-5">
                {oneOnOneFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-2.5">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-xs md:text-sm text-gray-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSelectService("one-on-one")}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-[36px]"
              >
                {loading ? "Memuat..." : "Ikuti Sesi"}
              </Button>
            </CardContent>
          </Card>

          {/* Group Card */}
          <Card className="relative overflow-hidden py-0 rounded-lg">
            <div className="relative h-44 md:h-48">
              <Image
                src={"/assets/mentoringPage/mentoringgroup.svg"}
                alt="Group Mentoring"
                fill
                className="object-cover"
              />
            </div>

            <CardContent className="p-4 flex flex-col">
              <CardHeader className="p-0 mb-3">
                <CardTitle className="text-lg md:text-xl font-semibold">
                  Mentoring Group
                </CardTitle>
              </CardHeader>

              <div className="mb-4">
                <div className="text-xs text-gray-500 line-through">
                  Rp 270.000
                </div>
                <div className="text-xl md:text-2xl font-bold">Rp 249.000</div>
              </div>

              <div className="space-y-2.5 mb-5">
                {groupFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-2.5">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-xs md:text-sm text-gray-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSelectService("group")}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-[36px] mt-auto"
              >
                {loading ? "Memuat..." : "Ikuti Sesi"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimers */}
        <div className="mt-8 text-start space-y-1">
          <p className="text-[11px] md:text-xs text-gray-600 leading-snug">
            * Garansi kepuasan bisa didapatkan jika peserta tidak puas dan
            mengisi form untuk melakukan klaim garansi serta memberikan bukti
            valid.
          </p>
          <p className="text-[11px] md:text-xs text-gray-600 leading-snug">
            ** Untuk peserta yang pertama kali mengikuti mentoring akan
            mendapatkan akses ke praktik data science.
          </p>
        </div>

        {/* Modal */}
        <MentorSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          service={selectedService}
        />
      </div>
    </section>
  );
}
