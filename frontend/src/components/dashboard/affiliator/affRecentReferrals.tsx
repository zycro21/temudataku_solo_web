"use client";

import { Card } from "@/components/ui/card";

export default function AffRecentReferrals() {
  const referrals = [
    {
      name: "Saraf Wijayanto",
      time: "2 menit yang lalu",
      amount: "+Rp70.000,00",
    },
    {
      name: "Arif Widyanto",
      time: "4 menit yang lalu",
      amount: "+Rp40.000,00",
    },
    { name: "Ratna Putri", time: "11 menit yang lalu", amount: "+Rp50.000,00" },
    { name: "Dinda Huwa", time: "19 menit yang lalu", amount: "+Rp50.000,00" },
    {
      name: "Budi Santoso",
      time: "25 menit yang lalu",
      amount: "+Rp30.000,00",
    },
    { name: "Siti Aisyah", time: "32 menit yang lalu", amount: "+Rp20.000,00" },
    {
      name: "Rudi Hartono",
      time: "40 menit yang lalu",
      amount: "+Rp60.000,00",
    },
    {
      name: "Mega Lestari",
      time: "51 menit yang lalu",
      amount: "+Rp80.000,00",
    },
    { name: "Andi Saputra", time: "1 jam yang lalu", amount: "+Rp100.000,00" },
    { name: "Nina Marlina", time: "2 jam yang lalu", amount: "+Rp90.000,00" },
  ];

  return (
    <Card className="p-6 rounded-2xl shadow-sm border border-gray-200 bg-white">
      <h3 className="text-2xl font-bold text-gray-800 mb-1">
        Referral Terbaru
      </h3>

      {/* scroll container: max 5 visible items, scroll thin */}
      <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto scroll-thin pr-4">
        {referrals.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-3">
            {/* Avatar inisial (ungu) */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                {item.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-base font-medium text-gray-800 mb-1">
                  {item.name}
                </p>
                <p className="text-sm text-gray-400">{item.time}</p>
              </div>
            </div>

            <p className="text-base font-semibold text-emerald-600">
              {item.amount}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
