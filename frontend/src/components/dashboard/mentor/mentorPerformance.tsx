"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";

// daftar stopwords sederhana (bisa diperluas sesuai kebutuhan)
const STOPWORDS = [
  "yang",
  "dan",
  "atau",
  "di",
  "ke",
  "dari",
  "untuk",
  "dengan",
  "itu",
  "ini",
  "saya",
  "kami",
  "anda",
  "dia",
  "mereka",
  "karena",
  "sehingga",
  "agar",
  "sudah",
  "akan",
  "sangat",
  "sekali",
  "lebih",
];

// Fungsi ekstrak kata penting
const extractTopKeywords = (comments: string[], topN: number = 3): string[] => {
  const wordCount: Record<string, number> = {};

  comments.forEach((comment) => {
    const words = comment
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\u00C0-\u017F\s]/g, "") // hilangkan tanda baca
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2 && // minimal 3 huruf
          !STOPWORDS.includes(word)
      );

    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });

  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1]) // sort by frekuensi
    .slice(0, topN)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1)); // kapital awal
};

export default function MentorPerformance() {
  const router = useRouter();

  const [rating, setRating] = useState<number>(0);
  const [feedbackCount, setFeedbackCount] = useState<number>(0);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feedback/mentor/feedbacks`,
          { withCredentials: true }
        );

        const feedbacks = res.data.data || [];

        if (feedbacks.length > 0) {
          // Hitung rating
          const totalRating = feedbacks.reduce(
            (sum: number, f: any) => sum + f.rating,
            0
          );
          setFeedbackCount(feedbacks.length);
          setRating(parseFloat((totalRating / feedbacks.length).toFixed(1)));

          // Ambil 3 keyword terbanyak
          const comments = feedbacks.map((f: any) => f.comment || "");
          const topKeywords = extractTopKeywords(comments, 3);
          setTags(topKeywords);
        } else {
          setFeedbackCount(0);
          setRating(0);
          setTags([]);
        }
      } catch (err) {
        console.error("Gagal fetch feedbacks:", err);
        setFeedbackCount(0);
        setRating(0);
        setTags([]);
      }
    };

    fetchFeedbacks();
  }, []);

  const getFeedbackMessage = (rating: number) => {
    if (rating <= 2.5) {
      return "Tingkatkan lagi kinerja mentoring Anda untuk mendapatkan hasil yang lebih baik!";
    } else if (rating <= 4.5) {
      return "Kualitas mentoring Anda sangat baik, tingkatkan dan pertahankan kualitas mentoring Anda!";
    } else {
      return "Kualitas mentoring Anda TERBAIK!! Pertahankan kualitas ini seterusnya!";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, idx) => {
      const starValue = idx + 1;
      const fill =
        rating >= starValue
          ? 100
          : rating > starValue - 1
          ? (rating - (starValue - 1)) * 100
          : 0;

      return (
        <div key={idx} className="relative w-6 h-6">
          <FaStar className="text-gray-300 absolute top-0 left-0 w-6 h-6" />
          <div
            className="overflow-hidden absolute top-0 left-0 h-6"
            style={{ width: `${fill}%` }}
          >
            <FaStar className="text-yellow-400 w-6 h-6" />
          </div>
        </div>
      );
    });
  };

  return (
    <Card
      onClick={() => router.push("/dashboard/mentor/report")}
      className="w-full h-full px-0 py-2 flex flex-col justify-between 
             hover:shadow-md transition-all duration-200 cursor-pointer 
             rounded-md"
    >
      {/* Header */}
      <CardHeader className="flex items-center justify-between px-6 pt-3 pb-0">
        <div className="flex items-center gap-2">
          <FaStar className="text-gray-400 w-4 h-4 opacity-70 relative top-[-1px]" />
          <CardTitle className="text-md font-medium text-gray-500 leading-none">
            Performa Mentor
          </CardTitle>
        </div>
        <ChevronRight className="h-6 w-6 text-gray-600" />
      </CardHeader>

      {/* Content */}
      <CardContent className="px-6 py-4 pt-0 grid grid-cols-2 gap-4 items-center">
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-6xl font-extrabold text-gray-900">{rating}</h2>
            <p className="text-xs text-gray-500">({feedbackCount} feedback)</p>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {renderStars(rating)}
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            {tags.length > 0 ? (
              tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-gray-300 text-black"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">
                Belum ada kata kunci feedback
              </span>
            )}
          </div>
        </div>

        <div className="text-right text-sm space-y-2">
          <p className="text-gray-700">Anda mendapatkan</p>
          <p className="text-emerald-600 font-bold">
            {rating}/5 dari mentee bulan ini.
          </p>
          <p className="text-gray-500">{getFeedbackMessage(rating)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
