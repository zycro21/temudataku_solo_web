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
        // 1. Ambil semua referral codes
        const refRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/referral-codes`,
          { withCredentials: true }
        );

        if (!refRes.data.success) throw new Error("Gagal ambil referral codes");
        const referralCodes = refRes.data.data.referralCodes || [];

        // 2. Ambil semua usages untuk tiap referral code
        let allUsages: any[] = [];
        for (const rc of referralCodes) {
          let page = 1;
          let hasMore = true;

          while (hasMore) {
            const usageRes = await axios.get(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/referral-codes-usages/${rc.id}`,
              { params: { page, limit: 50 }, withCredentials: true }
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

        // 3. Agregasi YEARLY (Jan–Dec)
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
        const yearlyAgg = months.map((m, idx) => ({
          month: m,
          referrals: allUsages.filter((u) => {
            const d = new Date(u.usedAt);
            return d.getFullYear() === year && getMonth(d) === idx;
          }).length,
        }));
        setYearlyData(yearlyAgg);

        // 4. Agregasi WEEKLY (minggu berjalan)
        const today = new Date();
        const start = startOfWeek(today, { weekStartsOn: 0 });
        const end = endOfWeek(today, { weekStartsOn: 0 });

        const weeklyAgg = eachDayOfInterval({ start, end }).map((date) => ({
          day: format(date, "EEE", { locale: id }),
          referrals: allUsages.filter(
            (u) =>
              isWithinInterval(new Date(u.usedAt), { start, end }) &&
              format(new Date(u.usedAt), "yyyy-MM-dd") ===
                format(date, "yyyy-MM-dd")
          ).length,
        }));
        setWeeklyData(weeklyAgg);
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
        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={currentData}
              margin={{ top: 5, right: 20, bottom: 5, left: -40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={isWeekly ? "day" : "month"} stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
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
        )}
      </CardContent>
    </Card>
  );
}
