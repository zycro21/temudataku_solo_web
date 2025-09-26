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
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function AffStatCards() {
  const [totalPendapatan, setTotalPendapatan] = useState<number>(0);
  const [totalReferral, setTotalReferral] = useState<number>(0);
  const [saldoTersedia, setSaldoTersedia] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil referral codes affiliator
        const refRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/referral-codes`,
          { withCredentials: true }
        );

        if (
          refRes.data.success &&
          refRes.data.data?.referralCodes?.length > 0
        ) {
          const referralCodes = refRes.data.data.referralCodes;

          // 2. Hitung total pendapatan (komisi) paralel
          const comPromises = referralCodes.map((rc: any) =>
            axios
              .get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/referral-codes-commissions/${rc.id}`,
                { withCredentials: true }
              )
              .catch((err) => {
                console.warn("Gagal ambil komisi untuk", rc.id, err);
                return null;
              })
          );

          const comResults = await Promise.all(comPromises);

          let totalKomisi = 0;
          for (const res of comResults) {
            if (res?.data?.success) {
              const commissions = res.data.data.commissions || [];
              totalKomisi += commissions.reduce(
                (sum: number, c: any) => sum + (c.amount || 0),
                0
              );
            }
          }

          // 3. Hitung total referral usage paralel
          const usagePromises = referralCodes.map((rc: any) =>
            axios
              .get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/referral-codes-usages/${rc.id}`,
                { withCredentials: true }
              )
              .catch((err) => {
                console.warn("Gagal ambil usage untuk", rc.id, err);
                return null;
              })
          );

          const usageResults = await Promise.all(usagePromises);

          let totalUsage = 0;
          for (const res of usageResults) {
            if (res?.data?.success) {
              totalUsage += res.data.data.pagination?.total || 0;
            }
          }

          // 4. Hitung total pembayaran (status = paid)
          let totalPaid = 0;
          let page = 1;
          let hasMore = true;
          let safetyCounter = 0;

          while (hasMore && safetyCounter < 100) {
            try {
              const payRes = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/commission-payments`,
                {
                  params: { status: "paid", page, limit: 50 },
                  withCredentials: true,
                }
              );

              if (payRes.data.success) {
                const { data, totalPages } = payRes.data.data;
                totalPaid += data.reduce(
                  (sum: number, p: any) => sum + (p.amount || 0),
                  0
                );

                page++;
                hasMore = page <= totalPages;
              } else {
                console.warn("API gagal di halaman:", page);
                hasMore = false;
              }
            } catch (err) {
              console.warn("Error saat fetch payments halaman", page, err);
              hasMore = false;
            }
            safetyCounter++;
          }

          // 5. Update state sekali
          setTotalPendapatan(totalKomisi);
          setTotalReferral(totalUsage);
          setSaldoTersedia(Math.max(totalKomisi - totalPaid, 0));
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        toast.error("Gagal mengambil data affiliator");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: "Total Pendapatan",
      value: loading
        ? "Loading..."
        : `Rp${totalPendapatan.toLocaleString("id-ID")}`,
      image: "/assets/dashboard/affiliator/keranjang.svg",
    },
    {
      title: "Total Referral",
      value: loading ? "Loading..." : `${totalReferral}`,
      image: "/assets/dashboard/affiliator/person.svg",
    },
    {
      title: "Saldo Tersedia",
      value: loading
        ? "Loading..."
        : `Rp${saldoTersedia.toLocaleString("id-ID")}`,
      image: "/assets/dashboard/affiliator/keranjang.svg",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
      {stats.map((item, idx) => (
        <Card
          key={idx}
          className="max-w-[360px] w-full flex flex-col justify-between px-0 py-2
                     hover:shadow-md hover:-translate-y-1 transform transition-all duration-200"
        >
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
