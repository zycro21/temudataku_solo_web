"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Feedback {
  id: number;
  mentee: string;
  program: string;
  skill: string;
  rating: number;
  comment: string;
  date: string;
  avatarUrl?: string;
}

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  feedbacks: Feedback[];
  startIndex: number;
}

// 🔑 fungsi ekstrak keyword sama dengan grid
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

export default function FeedbackDialog({
  open,
  onClose,
  feedbacks,
  startIndex,
}: FeedbackDialogProps) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    setIndex(startIndex); // reset kalau buka dari index baru
  }, [startIndex]);

  const current = feedbacks[index];
  const keywords = useMemo(
    () => (current ? extractKeywords(current.comment) : []),
    [current],
  );

  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const handleNext = () => {
    if (index < feedbacks.length - 1) setIndex(index + 1);
  };

  if (!current) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl bg-white rounded-xl shadow-lg p-5"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header dengan prev / next */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handlePrev}
            disabled={index === 0}
            className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <DialogTitle asChild>
            <h2 className="text-base font-semibold text-center flex-1">
              Lihat Umpan Balik ({index + 1}/{feedbacks.length})
            </h2>
          </DialogTitle>

          <button
            onClick={handleNext}
            disabled={index === feedbacks.length - 1}
            className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Konten feedback */}
        <div className="space-y-4">
          {/* Avatar + Nama */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              <Image
                src={current.avatarUrl || "/assets/dashboard/user/avatar.png"}
                alt={current.mentee}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">
                {current.mentee || "Anonim"}
              </p>
              <p className="text-xs text-gray-500">{current.program}</p>
            </div>
          </div>

          {/* Komentar */}
          <p className="text-gray-700 leading-relaxed text-sm">
            “{current.comment}”
          </p>

          {/* Keywords dari extractKeywords */}
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((kw, i) => (
              <span
                key={i}
                className="bg-white border border-black text-black font-semibold px-2 py-0.5 rounded-full text-xs"
              >
                {kw.charAt(0).toUpperCase() + kw.slice(1)}
              </span>
            ))}
          </div>

          {/* Tanggal */}
          <p className="text-xs text-gray-600">
            <strong>Tanggal Upload:</strong> {current.date}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
