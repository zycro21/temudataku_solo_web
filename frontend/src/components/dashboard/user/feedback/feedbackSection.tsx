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

export default function FeedbackSection({
  title,
  feedbacks,
  onFeedbackSubmitted,
}: FeedbackSectionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>

      {feedbacks.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada feedback.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map((feedback) => (
            <Card
              key={feedback.id}
              className="p-0 overflow-hidden flex flex-col justify-between"
            >
              <div className="relative w-full h-48">
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

              <CardContent className="px-5 py-6 flex-1 space-y-3">
                <h3 className="text-lg font-bold text-gray-800">
                  {feedback.title}
                </h3>
                <p className="text-sm text-gray-600">{feedback.description}</p>
              </CardContent>

              <CardFooter className="flex flex-col items-start gap-4 px-5 pb-6 mt-auto">
                <div className="flex items-center text-sm gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {feedback.date} • {feedback.time}
                  </span>
                </div>
                <div className="flex items-center text-sm gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{feedback.mentor}</span>
                </div>

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
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
