"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function MentorEarnings() {
  const router = useRouter();
  const data = [
    { name: "Mentoring Group", value: 40 },
    { name: "Short Class", value: 30 },
    { name: "Bootcamp", value: 20 },
    { name: "Mentoring 1 on 1", value: 10 },
  ];

  const COLORS = ["#065F46", "#059669", "#22C55E", "#14B8A6"];

  const totalEarnings = "Rp 750.000";
  const growthPercent = "15%";

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
            {totalEarnings}
          </h2>
          <p className="text-sm text-gray-500 mt-3">
            Akumulasi total yang telah diperoleh sejak sebulan ini,{" "}
            <span className="text-emerald-600 font-semibold">
              meningkat {growthPercent} dari bulan lalu.
            </span>
          </p>
        </div>

        {/* Right: Pie Chart + Custom Legend */}
        <div className="flex flex-col items-center">
          <div className="h-25 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={35}
                  paddingAngle={0}
                  dataKey="value"
                  labelLine={false}
                >
                  {data.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>

                {/* titik pusat */}
                <circle cx="50%" cy="50%" r="2" fill="#fff" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Manual Legend */}
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {data.map((item, idx) => (
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
