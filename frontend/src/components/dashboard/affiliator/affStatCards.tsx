"use client";

import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export default function AffStatCards() {
  const stats = [
    {
      title: "Total Pendapatan",
      value: "Rp1.500.000,00",
      image: "/assets/dashboard/affiliator/keranjang.svg",
    },
    {
      title: "Total Referral",
      value: "150",
      image: "/assets/dashboard/affiliator/person.svg",
    },
    {
      title: "Saldo Tersedia",
      value: "Rp1.250.000,00",
      image: "/assets/dashboard/affiliator/keranjang.svg",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {stats.map((item, idx) => (
        <Card
          key={idx}
          className="max-w-[360px] w-full flex flex-col justify-between px-0 py-2
                     hover:shadow-md hover:-translate-y-1 transform transition-all duration-200"
        >
          {/* Header: icon (local image) + title ; chevron right */}
          <CardHeader className="flex items-center justify-between px-6 pt-2 pb-0">
            <div className="flex items-center gap-2">
              <Image
                src={item.image}
                alt={item.title}
                width={16}
                height={16}
                className="w-4 h-4 object-contain opacity-80"
              />
              <CardTitle className="text-sm font-medium text-gray-700">
                {item.title}
              </CardTitle>
            </div>

            <CardAction className="text-gray-700">
              <ChevronRight className="h-4 w-4" />
            </CardAction>
          </CardHeader>

          {/* Value */}
          <CardContent className="px-6 pt-0 pb-2">
            <h3 className="text-3xl font-semibold text-gray-900">
              {item.value}
            </h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
