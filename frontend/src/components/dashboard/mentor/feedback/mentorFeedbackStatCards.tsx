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
import { FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";

// Helper: cek apakah date masuk minggu berjalan
function isThisWeek(date: Date) {
  const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return localDate >= startOfWeek && localDate <= endOfWeek;
}

// fungsi ekstrak keyword sederhana
function extractKeywords(text: string, max: number = 3): string[] {
  const stopwords = [
    "yang",
    "dan",
    "di",
    "ke",
    "dari",
    "saya",
    "itu",
    "untuk",
    "ada",
    "karena",
    "dengan",
    "pada",
    "tapi",
    "agar",
    "lebih",
    "sudah",
    "bisa",
    "akan",
    "dalam",
  ];

  const words = text
    .toLowerCase()
    .replace(/[.,!?"']/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopwords.includes(w));

  const freq: Record<string, number> = {};
  words.forEach((w) => {
    freq[w] = (freq[w] || 0) + 1;
  });

  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w);

  return sorted.slice(0, max);
}

export default function MentorFeedbackStatCards() {
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [feedbackChange, setFeedbackChange] = useState(0);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feedback/mentor/feedbacks?limit=1000`,
          { withCredentials: true }
        );

        const { data } = res.data;
        setFeedbacks(data);
        setFeedbackCount(data.length);

        const newThisWeek = data.filter((f: any) =>
          isThisWeek(new Date(f.submittedDate))
        );
        setFeedbackChange(newThisWeek.length);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    fetchFeedbacks();
  }, []);

  // rata-rata rating
  const avgRating =
    feedbacks.reduce((sum, f) => sum + f.rating, 0) / (feedbacks.length || 1);

  // ambil semua komentar jadi satu string
  const allComments = feedbacks.map((f) => f.comment).join(" ");
  const topKeywords = extractKeywords(allComments, 3);

  const stats = [
    {
      title: "Jumlah Feedback",
      value: feedbackCount,
      change: `+${feedbackChange} minggu ini`,
      image: "/assets/dashboard/mentor/laporan.svg",
    },
    {
      title: "Rating Feedback",
      value: avgRating,
      rating: true,
      image: "/assets/dashboard/mentor/star.svg",
    },
    {
      title: "Kata Kunci Feedback",
      keywords: topKeywords,
      image: "/assets/dashboard/mentor/keyword.svg",
    },
  ];

  // Render bintang
  const renderStars = (rating: number) => {
    const r = Math.max(0, Math.min(5, rating));
    return Array.from({ length: 5 }).map((_, idx) => {
      const starValue = idx + 1;
      const fill =
        r >= starValue
          ? 100
          : r > starValue - 1
          ? (r - (starValue - 1)) * 100
          : 0;

      return (
        <div key={idx} className="relative w-6 h-6" aria-hidden>
          <FaStar className="text-gray-300 absolute top-0 left-0 w-6 h-6" />
          <div
            className="overflow-hidden absolute top-0 left-0 h-6"
            style={{ width: `${fill}%` }}
          >
            <FaStar className="text-amber-400 w-6 h-6" />
          </div>
        </div>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {stats.map((item, idx) => {
        const raw = item.value;
        const parsed =
          typeof raw === "number" ? raw : raw ? parseFloat(String(raw)) : 0;
        const ratingNum = Number.isNaN(parsed) ? 0 : parsed;

        return (
          <Card
            key={idx}
            className="w-full flex flex-col px-0 py-3 pb-2 shadow-md rounded-lg border border-gray-200 bg-white"
          >
            {/* Header */}
            <CardHeader className="flex items-center justify-between px-6 pt-2 pb-0">
              <div className="flex items-center gap-3">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={12}
                  height={12}
                  className="object-contain opacity-90 relative top-[-0.6px]"
                />
                <CardTitle className="text-base font-semibold text-gray-700">
                  {item.title}
                </CardTitle>
              </div>
              <CardAction className="text-gray-500">
                <ChevronRight className="h-5 w-5" />
              </CardAction>
            </CardHeader>

            {/* Content */}
            <CardContent className="px-6 pt-1 pb-4">
              {item.title === "Jumlah Feedback" && (
                <div className="flex items-center gap-4">
                  <h3 className="text-4xl font-bold text-gray-900">
                    {item.value}
                  </h3>
                  {item.change && (
                    <span className="inline-block text-sm font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                      {item.change}
                    </span>
                  )}
                </div>
              )}

              {item.title === "Rating Feedback" && (
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-4xl font-bold text-gray-900">
                      {ratingNum.toFixed(1)}
                    </h3>
                    <div className="flex items-center gap-3">
                      {renderStars(ratingNum)}
                    </div>
                  </div>
                </div>
              )}

              {item.title === "Kata Kunci Feedback" && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.keywords?.map((kw) => (
                    <span
                      key={kw}
                      className="px-3 py-1 bg-white border border-black text-black text-sm font-semibold rounded-md"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
