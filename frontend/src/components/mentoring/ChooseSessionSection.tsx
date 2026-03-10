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
    <section className="py-16 px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Pilih Gaya Belajar Sesuai Vibenya Kamu!
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Mau belajar bareng mentor secara intensif atau fleksibel sesuai
            waktu kamu? TemuDataku punya beberapa pilihan mentoring yang bisa
            disesuaikan sama kebutuhan dan ritme belajar kamu.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 1-on-1 Card */}
          <Card className="relative overflow-hidden py-0">
            <div className="relative h-64">
              <Image
                src={"/assets/mentoringPage/mentoring1on1.svg"}
                alt="1-on-1 Mentoring"
                fill
                className="object-cover"
              />
            </div>

            <CardContent className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl font-bold">
                  Mentoring 1 on 1
                </CardTitle>
              </CardHeader>

              <div className="mb-6">
                <div className="text-sm text-gray-500 line-through">
                  Rp 199.000
                </div>
                <div className="text-3xl font-bold">Rp 99.000</div>
              </div>

              <div className="space-y-3 mb-8">
                {oneOnOneFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSelectService("one-on-one")}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? "Memuat..." : "Ikuti Sesi"}
              </Button>
            </CardContent>
          </Card>

          {/* Group Card */}
          <Card className="relative overflow-hidden py-0">
            <div className="relative h-64">
              <Image
                src={"/assets/mentoringPage/mentoringgroup.svg"}
                alt="Group Mentoring"
                fill
                className="object-cover"
              />
            </div>

            <CardContent className="p-6 flex flex-col">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl font-bold">
                  Mentoring Group
                </CardTitle>
              </CardHeader>

              <div className="mb-6">
                <div className="text-sm text-gray-500 line-through">
                  Rp 270.000
                </div>
                <div className="text-3xl font-bold">Rp 249.000</div>
              </div>

              <div className="space-y-3 mb-8">
                {groupFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSelectService("group")}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-auto"
              >
                {loading ? "Memuat..." : "Ikuti Sesi"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimers */}
        <div className="mt-12 text-start space-y-2">
          <p className="text-sm text-gray-600">
            * Garansi kepuasan bisa didapatkan jika peserta tidak puas dan
            mengisi form untuk melakukan klaim garansi serta memberikan bukti
            valid.
          </p>
          <p className="text-sm text-gray-600">
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
