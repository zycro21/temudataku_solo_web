"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Clock, Tag } from "lucide-react";

export default function HeroSection({
  data,
  onRegister,
  isLoading,
  alreadyPurchased,
  checkingPurchase,
}: {
  data: any;
  onRegister: () => void;
  isLoading: boolean;
  alreadyPurchased: boolean;
  checkingPurchase: boolean;
}) {
  const router = useRouter();

  const formatDescription = (text: string) => {
    if (!text) return "";

    // Pisahkan berdasarkan newline
    const paragraphs = text.split("\n");

    return paragraphs
      .map((para) => {
        let formatted = para;

        // bold **text**
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // underline _text_
        formatted = formatted.replace(/_(.*?)_/g, "<u>$1</u>");

        return `<p class="mb-2">${formatted}</p>`;
      })
      .join("");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <section className="bg-gradient-to-br py-12 px-4 md:px-6 lg:px-8 relative overflow-hidden">
      <Image
        src="/assets/mentoringPage/vectorHeroSection.svg"
        alt="vector background"
        fill
        className="object-cover object-center z-0"
        priority
      />

      {/* Breadcrumb */}
      <div className="max-w-[1200px] mx-auto px-4 py-4 relative z-10">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{data?.category ?? "Bootcamp"}</span>
          <span>&gt;</span>
          <span className="text-gray-900 font-medium">
            {data?.serviceName ?? "Detail Program"}
          </span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-10 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Illustration */}
          <div className="relative flex items-center justify-center">
            <Image
              src={
                data?.thumbnail ||
                "/assets/programsPage/programsIllustration.svg"
              }
              alt="programs illustration"
              width={600}
              height={400}
              className="w-full h-full"
            />
          </div>

          {/* Right Content */}
          <div className="space-y-6">
            {/* Level Ribbon */}
            <div className="relative inline-block">
              {/* Left Ribbon Cut */}
              <div
                className="absolute left-0 top-0 w-0 h-0 
      border-t-[24px] border-b-[24px] border-r-[20px]
      border-t-transparent border-b-transparent border-r-white"
              ></div>

              <div className="relative bg-blue-900 text-white px-8 py-3 text-lg font-bold tracking-wide">
                Level {data?.level ?? "-"}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {data?.serviceName ?? "-"}
            </h1>

            {/* Description */}
            <div
              className="text-gray-600 text-[12px] leading-relaxed max-w-3xl"
              dangerouslySetInnerHTML={{
                __html: formatDescription(data?.description || ""),
              }}
            />

            <div className="space-y-3 pt-2">
              {/* Duration */}
              <div className="flex items-center gap-4">
                <Clock className="w-7 h-7 text-gray-700" />
                <span className="text-lg font-semibold text-gray-800">
                  {data?.sessionDateRange
                    ? data.sessionDateRange
                        .split(" - ")
                        .map((date: string) => formatDate(date))
                        .join(" - ")
                    : "Tanggal belum tersedia"}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <Tag className="w-7 h-7 text-gray-700" />

                <div className="flex flex-col">
                  {/* Harga Coret */}
                  <span className="text-base text-gray-400 line-through">
                    Rp
                    {Math.round(
                      Number(data?.price || 0) / 0.875,
                    ).toLocaleString("id-ID")}
                  </span>

                  {/* Harga Diskon */}
                  <span className="text-3xl font-bold text-gray-900">
                    Rp{Number(data?.price || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 pt-2">
              <Button
                size="lg"
                onClick={onRegister}
                disabled={isLoading || alreadyPurchased || checkingPurchase}
                className={`
    px-10 py-8 text-lg font-semibold rounded-xl
    ${
      alreadyPurchased
        ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
        : "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
    }
  `}
              >
                {checkingPurchase
                  ? "Memeriksa..."
                  : alreadyPurchased
                    ? "Sudah Dibeli"
                    : isLoading
                      ? "Memproses..."
                      : "Daftar Sekarang"}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-10 py-8 text-lg font-semibold rounded-xl"
              >
                Konsultasi Gratis
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
