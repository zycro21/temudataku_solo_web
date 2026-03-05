"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

type SubscriptionItem = {
  id: string;
  month: number;
  populer: boolean;
  title: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  features: string[];
};

export default function ChooseSubscriptionElearning() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const subscriptions: SubscriptionItem[] = [
    {
      id: "6-month",
      month: 6,
      populer: false,
      title: "6 Bulan",
      subtitle: "PAKET VIDEO E-LEARNING",
      originalPrice: "Rp 450.000",
      price: "Rp 159.000",
      features: [
        "100+ materi video Data Science & AI",
        "Materi video interaktif",
        "Sertifikat Tiap Materi",
        "Akses grup komunitas",
        "Akses challenge kompetisi data berhadiah",
        "FREE akses Live Class",
        "Diskon untuk Short class, Bootcamp, dan 1 on 1 Mentoring",
      ],
    },
    {
      id: "3-month",
      month: 3,
      populer: true,
      title: "3 Bulan",
      subtitle: "PAKET VIDEO E-LEARNING",
      originalPrice: "Rp 300.000",
      price: "Rp 99.000",
      features: [
        "100+ materi video Data Science & AI",
        "Materi video interaktif",
        "Sertifikat Tiap Materi",
        "Akses grup komunitas",
        "Akses challenge kompetisi data berhadiah",
        "FREE akses Live Class",
        "Diskon untuk Short class, Bootcamp, dan 1 on 1 Mentoring",
      ],
    },
    {
      id: "1-month",
      month: 1,
      populer: false,
      title: "1 Bulan",
      subtitle: "PAKET VIDEO E-LEARNING",
      originalPrice: "Rp 99.000",
      price: "Rp 29.000",
      features: [
        "100+ materi video Data Science & AI",
        "Materi video interaktif",
        "Sertifikat Tiap Materi",
        "Akses grup komunitas",
        "FREE akses Live Class",
      ],
    },
  ];

  const parseRupiah = (value: string) => Number(value.replace(/[^0-9]/g, ""));

  const formatRupiah = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

  return (
    <section className="py-20 px-0">
      <div className="max-w-[1200px] mx-auto">
        {/* HEADER (PUTIH) */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Langganan Sekarang dan Jadi Lebih Hebat
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            Langganan bulanan untuk akses semua materi, tanpa batas. Makin lama,
            makin hemat dan untung banyak.
          </p>
        </div>
      </div>

      {/* BG ABU-ABU FULL */}
      <div className="relative bg-gray-100 py-12 w-full overflow-hidden">
        {/* ===== DECORATIVE ORNAMENTS ===== */}

        {/* TOP LEFT */}
        <Image
          src="/assets/elearning/Union.svg"
          alt="Ornament Top Left"
          width={260}
          height={260}
          className="absolute top-0 left-0 opacity-30 pointer-events-none z-0"
        />

        {/* TOP RIGHT */}
        <Image
          src="/assets/elearning/Union.svg"
          alt="Ornament Top Right"
          width={300}
          height={300}
          className="absolute top-0 right-0 opacity-30 rotate-180 scale-90 pointer-events-none z-0"
        />

        {/* BOTTOM LEFT */}
        <Image
          src="/assets/elearning/Union.svg"
          alt="Ornament Bottom Left"
          width={300}
          height={300}
          className="absolute bottom-0 left-0 opacity-40 pointer-events-none z-0"
        />

        {/* BOTTOM RIGHT */}
        <Image
          src="/assets/elearning/Union.svg"
          alt="Ornament Bottom Right"
          width={350}
          height={350}
          className="absolute bottom-0 right-0 opacity-40 pointer-events-none z-0"
        />

        <div className="relative z-10 max-w-[1200px] mx-auto grid md:grid-cols-3 gap-3 items-start px-4">
          {subscriptions.map((item) => {
            const isPopuler = item.populer;
            const priceNumber = parseRupiah(item.price);
            const isWeekly = item.month === 1;

            const perUnitPrice = isWeekly
              ? Math.round(priceNumber / 4) // per minggu
              : Math.round(priceNumber / item.month); // per bulan

            return (
              <div
                key={item.id}
                className={`mx-auto w-full max-w-[320px] rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                  isPopuler ? "mt-8 scale-105 border border-[#F49D07]" : "mt-0"
                }`}
              >
                {/* ===== TOP (BERWARNA) ===== */}
                <div
                  className={`relative py-4 pl-5 text-white ${
                    isPopuler ? "bg-emerald-500" : "bg-[#1f3b73]"
                  }`}
                >
                  {isPopuler && (
                    <div className="absolute top-0 left-0 right-0 bg-[#F49D07] text-gray-900 text-sm font-bold py-2.5 text-center tracking-wide">
                      TERPOPULER!
                    </div>
                  )}

                  <h3
                    className={`text-xl md:text-2xl font-bold ${
                      isPopuler ? "mt-10" : "mt-2"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs opacity-90 mt-2 mb-6">
                    {item.subtitle}
                  </p>

                  {item.originalPrice && (
                    <p className="text-sm line-through opacity-80 mb-2">
                      {item.originalPrice}
                    </p>
                  )}

                  <p className="text-3xl md:text-3xl font-extrabold mb-2">
                    {item.price}
                  </p>
                  <p className="text-xs opacity-90 leading-relaxed">
                    Untuk akses semua, setara {formatRupiah(perUnitPrice)}{" "}
                    {isWeekly ? "/ minggu" : "/ bulan"}
                  </p>
                </div>

                {/* ===== BOTTOM (PUTIH) ===== */}
                <div className="bg-white p-8 flex flex-col h-full">
                  <div className="space-y-5 mb-6">
                    {item.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <Image
                          src="/assets/elearning/ceklis.svg"
                          alt="Check"
                          width={16}
                          height={16}
                          className="mt-0 mr-2 flex-shrink-0"
                        />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className={`mt-auto w-full transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-[2px] ${
                      isPopuler
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "bg-white text-[#1f3b73] border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Mulai Berlangganan
                  </Button>

                  {/* ===== STOCK / URGENCY BAR ===== */}
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-red-500 mb-2">
                      Segera Habis 🔥
                    </p>

                    <div className="w-full h-2 rounded-full bg-sky-100 overflow-hidden">
                      <div className="h-full w-[70%] rounded-full bg-teal-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
