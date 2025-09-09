"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar } from "lucide-react";

export default function AffReferralAnalytics() {
  const [isWeekly, setIsWeekly] = useState(false);

  // Dummy data tahunan
  const yearlyData = [
    { month: "Jan", referrals: 20 },
    { month: "Feb", referrals: 35 },
    { month: "Mar", referrals: 70 },
    { month: "Apr", referrals: 60 },
    { month: "May", referrals: 40 },
    { month: "Jun", referrals: 50 },
    { month: "Jul", referrals: 75 },
    { month: "Aug", referrals: 90 },
    { month: "Sep", referrals: 55 },
    { month: "Oct", referrals: 85 },
    { month: "Nov", referrals: 65 },
    { month: "Dec", referrals: 45 },
  ];

  // Generate data mingguan (Minggu–Sabtu minggu berjalan)
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 0 }); // Minggu
  const end = endOfWeek(today, { weekStartsOn: 0 }); // Sabtu

  const weeklyData = eachDayOfInterval({ start, end }).map((date) => ({
    day: format(date, "EEE", { locale: id }), // contoh: Min, Sen, Sel
    referrals: Math.floor(Math.random() * 100), // dummy random
  }));

  const currentData = isWeekly ? weeklyData : yearlyData;

  const dateLabel = isWeekly
    ? `${format(start, "dd/MM/yyyy")} – ${format(end, "dd/MM/yyyy")}`
    : "2025 (Yearly)";

  return (
    <Card className="w-full h-[340px] bg-gray-50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Analitik Penggunaan Referral
        </CardTitle>

        <button
          onClick={() => setIsWeekly(!isWeekly)}
          className="flex items-center gap-2 text-sm text-gray-700 border rounded-md px-3 py-1 bg-gray-200 hover:bg-gray-400 transition"
        >
          <Calendar className="w-4 h-4" />
          {dateLabel}
        </button>
      </CardHeader>

      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={currentData}
            margin={{ top: 5, right: 20, bottom: 5, left: -30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={isWeekly ? "day" : "month"} stroke="#6b7280" />
            <YAxis
              stroke="#6b7280"
              domain={[0, 100]}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="referrals"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
