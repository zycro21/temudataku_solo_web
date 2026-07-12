"use client";

import { useEffect, useState } from "react";
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
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getMonth,
  isWithinInterval,
} from "date-fns";
import { id } from "date-fns/locale";
import { Calendar } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function AffReferralAnalytics() {
  const [isWeekly, setIsWeekly] = useState(false);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const refRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/referral-codes`,
          { withCredentials: true },
        );

        if (!refRes.data.success) throw new Error("Gagal ambil referral codes");
        const referralCodes = refRes.data.data.referralCodes || [];

        let allUsages: any[] = [];
        for (const rc of referralCodes) {
          let page = 1;
          let hasMore = true;
          while (hasMore) {
            const usageRes = await axios.get(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/referral-codes-usages/${rc.id}`,
              { params: { page, limit: 50 }, withCredentials: true },
            );
            if (usageRes.data.success) {
              const { usages, pagination } = usageRes.data.data;
              allUsages = allUsages.concat(usages);
              page++;
              hasMore = page <= pagination.totalPages;
            } else {
              hasMore = false;
            }
          }
        }

        const year = new Date().getFullYear();
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        setYearlyData(
          months.map((m, idx) => ({
            month: m,
            referrals: allUsages.filter((u) => {
              const d = new Date(u.usedAt);
              return d.getFullYear() === year && getMonth(d) === idx;
            }).length,
          })),
        );

        const today = new Date();
        const start = startOfWeek(today, { weekStartsOn: 0 });
        const end = endOfWeek(today, { weekStartsOn: 0 });
        setWeeklyData(
          eachDayOfInterval({ start, end }).map((date) => ({
            day: format(date, "EEE", { locale: id }),
            referrals: allUsages.filter(
              (u) =>
                isWithinInterval(new Date(u.usedAt), { start, end }) &&
                format(new Date(u.usedAt), "yyyy-MM-dd") ===
                  format(date, "yyyy-MM-dd"),
            ).length,
          })),
        );
      } catch (err) {
        console.error(err);
        toast.error("Gagal mengambil data analytics referral");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const currentData = isWeekly ? weeklyData : yearlyData;
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 0 });
  const end = endOfWeek(today, { weekStartsOn: 0 });
  const dateLabel = isWeekly
    ? `${format(start, "dd/MM/yyyy")} – ${format(end, "dd/MM/yyyy")}`
    : `${today.getFullYear()} (Yearly)`;

  return (
    <Card className="w-full h-[300px] bg-gray-50">
      <CardHeader className="flex flex-row items-center justify-between pb-1 px-4 pt-0">
        <CardTitle className="text-sm font-bold text-gray-700">
          Analitik Penggunaan Referral
        </CardTitle>
        <button
          onClick={() => setIsWeekly(!isWeekly)}
          className="flex items-center gap-1.5 text-xs text-gray-600 border rounded-md px-2.5 py-1 bg-gray-200 hover:bg-gray-300 transition"
        >
          <Calendar className="w-3 h-3" />
          {dateLabel}
        </button>
      </CardHeader>

      <CardContent className="h-[230px] px-4 pb-4">
        {loading ? (
          <p className="text-gray-500 text-xs">Loading...</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={currentData}
              margin={{ top: 5, right: 16, bottom: 5, left: -40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey={isWeekly ? "day" : "month"}
                stroke="#9ca3af"
                tick={{ fontSize: 10 }}
              />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="referrals"
                stroke="#6366f1"
                strokeWidth={1.5}
                dot={{ r: 2.5 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
