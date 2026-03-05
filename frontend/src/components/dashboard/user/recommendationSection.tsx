// src/components/dashboard/user/recommendationSection.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface RecommendationItem {
  id: string;
  tag: string;
  title: string;
  type: "Mentoring";
  level?: string;
}

export default function RecommendationSection() {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const meRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
          { withCredentials: true },
        );
        const userData = meRes.data.data;

        const bookingsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/mentee/bookings`,
          {
            params: { page: 1, limit: 1000, status: "confirmed" },
            withCredentials: true,
          },
        );

        const bookedServiceIds =
          bookingsRes.data?.data?.data?.map(
            (b: any) => b.mentoringService?.id,
          ) || [];

        const servicesRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/public-mentoring-services`,
          { params: { limit: 8 } },
        );

        const services = servicesRes.data?.data || [];

        const unbookedServices = services.filter(
          (s: any) => !bookedServiceIds.includes(s.id),
        );

        const merged: RecommendationItem[] = [
          ...unbookedServices.map((s: any) => ({
            id: s.id,
            tag: "Ikuti Mentoring!",
            title: s.serviceName || s.title || "Mentoring Service",
            type: "Mentoring" as const,
            level: s.level || s.serviceType || "General",
          })),
        ].slice(0, 8);

        setRecommendations(merged);
      } catch (err: any) {
        console.error("Error fetch recommendations:", err);
        setError("Gagal memuat rekomendasi.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="mt-8 flex justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-6 relative w-full max-w-[90rem]">
          <p className="text-gray-500">Memuat rekomendasi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 flex justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-6 relative w-full max-w-[90rem]">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="mt-8 flex justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-6 relative w-full max-w-[90rem]">
          <p className="text-gray-500">
            Tidak ada rekomendasi baru untuk saat ini!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 flex justify-center">
      <div className="bg-white rounded-2xl shadow-sm p-6 relative w-full max-w-[90rem]">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Rekomendasi
        </h2>

        <Carousel opts={{ align: "start", loop: false }} className="w-full">
          <CarouselContent>
            {recommendations.map((item, index) => (
              <CarouselItem
                key={index}
                className="basis-full sm:basis-1/2 lg:basis-1/3 flex-shrink-0"
              >
                <div className="relative bg-emerald-100 p-6 rounded-xl overflow-hidden min-h-[120px] flex flex-col justify-between">
                  <Image
                    src="/assets/dashboard/user/leaf.svg"
                    alt="pattern"
                    width={80}
                    height={80}
                    className="absolute right-2 bottom-2 opacity-80"
                  />

                  <div className="relative z-10">
                    <span className="text-sm text-gray-600 block mb-3">
                      {item.tag}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 pr-16 break-words line-clamp-3">
                      {item.title}
                    </h3>
                    <div className="flex items-center text-sm font-medium text-gray-600">
                      <span>{item.type}</span>
                      <span className="mx-2">|</span>
                      <span>{item.level}</span>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
}
