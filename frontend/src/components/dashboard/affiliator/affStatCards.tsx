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
import { useAffiliatorProfile } from "@/hooks/useAffiliatorProfile";

function formatRupiah(n: number) {
  return `Rp${n.toLocaleString("id-ID")}`;
}

export default function AffStatCards() {
  const { data, loading } = useAffiliatorProfile();
  const summary = data?.commissionSummary;

  const stats = [
    {
      title: "Total Pendapatan",
      value: loading ? "..." : formatRupiah(summary?.totalEarned ?? 0),
      image: "/assets/dashboard/affiliator/keranjang.svg",
    },
    {
      title: "Saldo Tersedia",
      value: loading ? "..." : formatRupiah(summary?.availableBalance ?? 0),
      image: "/assets/dashboard/affiliator/keranjang.svg",
    },
    {
      title: "Menunggu Pencairan",
      value: loading ? "..." : formatRupiah(summary?.pendingWithdrawal ?? 0),
      image: "/assets/dashboard/affiliator/person.svg",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-1">
      {stats.map((item, idx) => (
        <Card
          key={idx}
          className="w-full flex flex-col justify-between px-0 py-1.5
                     hover:shadow-md hover:-translate-y-0.5 transform transition-all duration-200"
        >
          <CardHeader className="flex items-center justify-between px-4 pt-2 pb-0">
            <div className="flex items-center gap-1.5">
              <Image
                src={item.image}
                alt={item.title}
                width={13}
                height={13}
                className="object-contain opacity-80"
              />
              <CardTitle className="text-xs font-medium text-gray-500">
                {item.title}
              </CardTitle>
            </div>
            <CardAction className="text-gray-400">
              <ChevronRight className="h-3.5 w-3.5" />
            </CardAction>
          </CardHeader>
          <CardContent className="px-4 pt-1 pb-3">
            <h3 className="text-xl font-bold text-gray-900">{item.value}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
