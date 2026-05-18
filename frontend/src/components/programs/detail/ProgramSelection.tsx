"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Calendar } from "lucide-react";

export default function ProgramSelection({
  currentServiceId,
  openLoginModal,
}: {
  currentServiceId: string;
  openLoginModal: () => void;
}) {
  const [bootcamps, setBootcamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchBootcamps = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/recommended-bootcamps/${currentServiceId}`,
          { withCredentials: true },
        );

        setBootcamps(res.data.data);
        setIsLoggedIn(true);
      } catch (error: any) {
        if (error.response?.status === 401) {
          setIsLoggedIn(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBootcamps();
  }, [currentServiceId]);

  const handleNavigate = (id: string) => {
    router.push(`/programs/${id}`);
  };

  const formatPrice = (price: number) => {
    return `Rp${Number(price).toLocaleString("id-ID")}`;
  };

  const getLevelLabel = (level?: string) => {
    if (!level) return "";
    return `Level ${level}`;
  };

  // Kalau belum login
  if (!isLoggedIn) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center bg-gray-50 p-12 rounded-xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Login Dulu Untuk Melihat Rekomendasi Bootcamp
          </h3>
          <p className="text-gray-600 mb-6">
            Kami hanya menampilkan bootcamp yang belum pernah kamu ikuti.
          </p>
          <Button
            onClick={openLoginModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3"
          >
            Login Sekarang
          </Button>
        </div>
      </section>
    );
  }

  if (loading) return null;

  if (bootcamps.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center bg-gray-50 p-12 rounded-xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Belum Ada Rekomendasi Bootcamp
          </h3>
          <p className="text-gray-600">
            Saat ini belum ada bootcamp lain yang bisa kamu ikuti. Coba cek
            kembali nanti ya!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-start mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Bootcamp Lainnya yang Bisa Kamu Coba
          </h2>
          <p className="text-lg text-gray-600">
            Masih eksplor? Tenang, TemuDataku punya banyak pilihan bootcamp
            sesuai kebutuhan dan minat kamu.
          </p>
        </div>

        <div className="px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {bootcamps.map((bootcamp) => (
                <CarouselItem
                  key={bootcamp.id}
                  className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 rounded-lg p-0 gap-0 h-full">
                    <div className="relative">
                      <Image
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop"
                        alt={bootcamp.serviceName}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover"
                      />

                      <div className="absolute top-0 right-0 bg-gray-500 text-white px-3 p-2 rounded-bl-lg text-sm font-medium">
                        {bootcamp.availableSlots !== null
                          ? `<${bootcamp.availableSlots} Kuota Tersisa`
                          : "Unlimited"}
                      </div>

                      <div className="absolute bottom-0 w-full bg-brand-color-secondary text-white px-4 py-2 text-sm font-medium text-center">
                        {getLevelLabel(bootcamp.level)}
                      </div>
                    </div>

                    <CardContent className="p-6 flex flex-col h-full">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {bootcamp.serviceName}
                      </h3>

                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>{bootcamp.category}</span>
                      </div>

                      <div className="flex items-center gap-2 mb-6">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(bootcamp.price)}
                        </span>
                      </div>

                      <div className="space-y-3 mt-auto">
                        <Button
                          onClick={() => handleNavigate(bootcamp.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
                        >
                          Daftar Sekarang
                        </Button>
                        <Button
                          onClick={() => handleNavigate(bootcamp.id)}
                          variant="outline"
                          className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 py-3"
                        >
                          Lihat Detail
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="-left-12" />
            <CarouselNext className="-right-12" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
