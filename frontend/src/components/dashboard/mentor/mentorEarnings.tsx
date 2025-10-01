"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function MentorEarnings() {
  const router = useRouter();

  // state untuk earnings
  const [totalEarnings, setTotalEarnings] = useState<string>("-");
  const [growthPercent, setGrowthPercent] = useState<string>("0%");
  const [loading, setLoading] = useState<boolean>(true);

  // state untuk chart
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>(
    []
  );

  const SERVICE_TYPES = [
    "one-on-one",
    "group",
    "bootcamp",
    "shortclass",
    "live class",
  ];

  const COLORS = ["#065F46", "#059669", "#22C55E", "#14B8A6", "#0d9488"];

  // fetch API earnings
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/mentor/earnings`,
          { withCredentials: true }
        );

        if (res.data?.data) {
          const { total, growthPercent } = res.data.data;

          // format ke Rupiah tanpa spasi
          const formattedTotal =
            "Rp" +
            new Intl.NumberFormat("id-ID", {
              minimumFractionDigits: 0,
            }).format(total);

          setTotalEarnings(formattedTotal);
          setGrowthPercent(`${growthPercent}%`);
        }
      } catch (err) {
        console.error("Gagal fetch earnings:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchServices = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/mentor/mentoring-services`,
          { withCredentials: true }
        );

        if (res.data?.data) {
          const services = res.data.data;

          // Group by serviceType
          const grouped: Record<string, number> = {};
          services.forEach((svc: any) => {
            const type = svc.serviceType?.toLowerCase() || "unknown";
            if (!grouped[type]) grouped[type] = 0;
            grouped[type] += 1;
          });

          // Pastikan semua SERVICE_TYPES ada (kalau ga ada → value=0)
          const chartArr = SERVICE_TYPES.map((type) => ({
            name: type,
            value: grouped[type] || 0,
          }));

          setChartData(chartArr);
        }
      } catch (err) {
        console.error("Gagal fetch services:", err);
      }
    };

    fetchEarnings();
    fetchServices();
  }, []);

  return (
    <Card
      onClick={() => router.push("/dashboard/mentor/services")}
      className="w-full h-full px-0 py-2 flex flex-col justify-between 
             hover:shadow-md transition-all duration-200 cursor-pointer 
             rounded-md"
    >
      {/* Header */}
      <CardHeader className="flex items-center justify-between px-6 pt-3 pb-0">
        <div className="flex items-center gap-2">
          <Image
            src="/assets/dashboard/mentor/pendapatan.svg"
            alt="icon"
            width={14}
            height={14}
            className="relative top-[-1px]"
          />
          <CardTitle className="text-md font-medium text-gray-500 leading-none">
            Total Pendapatan
          </CardTitle>
        </div>
        <ChevronRight className="h-6 w-6 text-gray-600" />
      </CardHeader>

      {/* Content */}
      <CardContent className="px-6 py-4 pt-0 grid grid-cols-2 gap-4 items-center">
        {/* Left: Earnings Text */}
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900">
            {loading ? "Loading..." : totalEarnings}
          </h2>
          <p className="text-sm text-gray-500 mt-3">
            Akumulasi total yang telah diperoleh sejak sebulan ini,{" "}
            <span className="text-emerald-600 font-semibold">
              meningkat {loading ? "..." : growthPercent} dari bulan lalu.
            </span>
          </p>
        </div>

        {/* Right: Pie Chart + Custom Legend */}
        <div className="flex flex-col items-center">
          <div className="h-25 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={35}
                  paddingAngle={0}
                  dataKey="value"
                  labelLine={false}
                >
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>

                {/* Tooltip bawaan */}
                <Tooltip
                  formatter={(value, name) => {
                    const total = chartData.reduce(
                      (sum, item) => sum + item.value,
                      0
                    );
                    const percent = ((Number(value) / total) * 100).toFixed(1);
                    return [`${value} Service/Layanan (${percent}%)`, name];
                  }}
                  contentStyle={{
                    fontSize: "11px",
                    borderRadius: "6px",
                    padding: "2px 6px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                  itemStyle={{
                    color: "#374151",
                  }}
                />

                {/* titik pusat */}
                <circle cx="50%" cy="50%" r="2" fill="#fff" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Manual Legend */}
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {chartData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
