"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { FaStar } from "react-icons/fa";

export default function MentorPerformance() {
  const router = useRouter();
  const rating = 3.7;
  const feedbackCount = 253;

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
            {["Supportive", "Terstruktur", "Seru"].map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-gray-300 text-black"
              >
                {tag}
              </span>
            ))}
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
