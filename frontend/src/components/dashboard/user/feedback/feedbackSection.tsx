"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import TambahFeedbackModal from "./tambahFeedbackModal";
import LihatFeedbackModal from "./lihatFeedbackModal";

interface Feedback {
  id: string;
  title: string;
  description: string;
  program: string;
  category: string;
  date: string;
  time: string;
  mentor: string;
  image: string;
  status: "Belum" | "Sudah";
  answers?: { [key: number]: string };
  input1?: string;
  input2?: string;
}

interface FeedbackSectionProps {
  title: string;
  feedbacks: Feedback[];
  onFeedbackSubmitted: () => void;
}

function renderFormattedDescription(text: string) {
  if (!text) return null;

  // ubah /n jadi newline
  const lines = text.split("/n");

  const formatInline = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|_.*?_|)/g);

    return parts.map((part, index) => {
      if (!part) return null;

      // **bold**
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.replace(/\*\*/g, "")}</strong>;
      }

      // _underline_
      if (part.startsWith("_") && part.endsWith("_")) {
        return (
          <span key={index} className="underline">
            {part.replace(/_/g, "")}
          </span>
        );
      }

      // *italic* (manual skew)
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <span key={index} className="-skew-x-6 inline-block">
            {part.replace(/\*/g, "")}
          </span>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  return lines.map((line, i) => <p key={i}>{formatInline(line)}</p>);
}

export default function FeedbackSection({
  title,
  feedbacks,
  onFeedbackSubmitted,
}: FeedbackSectionProps) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-gray-800 mb-3">{title}</h2>

      {feedbacks.length === 0 ? (
        <p className="text-gray-500 text-xs">Belum ada feedback.</p>
      ) : (
        <>
          {/* Versi DESKTOP/tablet — grid card vertikal ASLI, TIDAK diubah
              sama sekali, cuma dibungkus "hidden sm:grid" (dulu "grid"
              polos) biar identik mulai sm: ke atas dan disembunyikan di
              mobile (digantikan list horizontal di bawah). */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {feedbacks.map((feedback) => (
              <Card
                key={feedback.id}
                className="p-0 overflow-hidden flex flex-col"
              >
                {/* IMAGE */}
                <div className="relative w-full h-32">
                  <Image
                    src={
                      feedback.image &&
                      (feedback.image.startsWith("/") ||
                        feedback.image.startsWith("http"))
                        ? feedback.image
                        : "/assets/dashboard/user/kokok.png"
                    }
                    alt={feedback.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* CONTENT */}
                <CardContent className="px-3 py-3 flex-1 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">
                    {feedback.title}
                  </h3>

                  <div className="text-xs text-gray-600 space-y-1 line-clamp-3 break-words">
                    {renderFormattedDescription(feedback.description)}
                  </div>
                </CardContent>

                {/* FOOTER */}
                <CardFooter className="flex flex-col items-start gap-2 px-3 pb-3 mt-auto">
                  <div className="flex items-center text-xs gap-1.5 text-gray-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="break-words">
                      {feedback.date} • {feedback.time}
                    </span>
                  </div>

                  <div className="flex items-center text-xs gap-1.5 text-gray-600">
                    <User className="w-3.5 h-3.5" />
                    <span className="break-words">{feedback.mentor}</span>
                  </div>

                  {/* ACTION */}
                  <div className="w-full">
                    {feedback.status === "Belum" ? (
                      <TambahFeedbackModal
                        sessionId={feedback.id}
                        feedbackTitle={feedback.title}
                        feedbackDate={feedback.date}
                        feedbackTime={feedback.time}
                        onSuccess={onFeedbackSubmitted}
                      />
                    ) : (
                      <LihatFeedbackModal
                        feedbackTitle={feedback.title}
                        feedbackDate={feedback.date}
                        feedbackTime={feedback.time}
                      />
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* 🔥 BARU: versi MOBILE (sm:hidden) — list horizontal, bukan
              grid vertikal. Tiap baris: thumbnail kotak kecil di kiri,
              judul+tanggal+mentor di kanan (line-clamp 1 biar ringkas),
              tombol aksi full-width di bawah. Data & komponen aksi
              (TambahFeedbackModal/LihatFeedbackModal) SAMA PERSIS dengan
              versi desktop, cuma tata letaknya beda. */}
          <div className="sm:hidden space-y-3">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-white border border-gray-200 rounded-lg p-3"
              >
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={
                        feedback.image &&
                        (feedback.image.startsWith("/") ||
                          feedback.image.startsWith("http"))
                          ? feedback.image
                          : "/assets/dashboard/user/kokok.png"
                      }
                      alt={feedback.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-1">
                      {feedback.title}
                    </h3>

                    <div className="mt-1.5 flex items-center text-[11px] gap-1.5 text-gray-500">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {feedback.date} • {feedback.time}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center text-[11px] gap-1.5 text-gray-500">
                      <User className="w-3 h-3 shrink-0" />
                      <span className="truncate">{feedback.mentor}</span>
                    </div>
                  </div>
                </div>

                {/* ACTION — full-width di bawah, terpisah dari baris info */}
                <div className="w-full mt-3">
                  {feedback.status === "Belum" ? (
                    <TambahFeedbackModal
                      sessionId={feedback.id}
                      feedbackTitle={feedback.title}
                      feedbackDate={feedback.date}
                      feedbackTime={feedback.time}
                      onSuccess={onFeedbackSubmitted}
                    />
                  ) : (
                    <LihatFeedbackModal
                      feedbackTitle={feedback.title}
                      feedbackDate={feedback.date}
                      feedbackTime={feedback.time}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
