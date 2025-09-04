"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface LihatFeedbackModalProps {
  feedbackTitle: string;
  feedbackDate: string;
  feedbackTime: string;
  answers: { [key: number]: string };
  input1: string;
  input2: string;
}

export default function LihatFeedbackModal({
  feedbackTitle,
  feedbackDate,
  feedbackTime,
  answers,
  input1,
  input2,
}: LihatFeedbackModalProps) {
  const questions = [
    "Materi yang diberikan dalam pertemuan ini mudah dimengerti",
    "Mentor menyampaikan materi dengan jelas dan interaktif",
    "Adanya studi kasus/contoh penerapan yang tepat dalam materi",
    "Waktu penyampaian berjalan tepat waktu",
    "Jumlah peserta ideal, mengganggu waktu saya",
    "Pertanyaan yang diberikan relevan",
    "Peralatan yang digunakan sudah sesuai (Zoom/Google Meet, dll)",
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50"
        >
          Lihat Review
        </Button>
      </DialogTrigger>

      <DialogContent
        className="bg-white rounded-xl shadow-lg w-full max-w-xl max-h-[90vh] p-0 flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b space-y-1 shrink-0">
          <DialogTitle className="text-lg font-semibold">
            Lihat Review
          </DialogTitle>
          <p className="text-sm text-gray-800">{feedbackTitle}</p>
          <p className="text-xs text-gray-500">
            {feedbackDate} • {feedbackTime}
          </p>
        </DialogHeader>

        {/* Body (scrollable) */}
        <div className="px-6 py-4 flex-1 overflow-y-auto space-y-6">
          {questions.map((q, i) => (
            <div key={i}>
              <p className="text-sm font-medium mb-3">{q}</p>

              {/* Pilihan jawaban */}
              <div className="flex flex-col gap-2">
                {[
                  "Sangat Setuju",
                  "Setuju",
                  "Tidak Setuju",
                  "Sangat Tidak Setuju",
                ].map((opt) => {
                  const selected = answers[i] === opt;
                  return (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 px-3 py-2 w-fit ${
                        selected
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-white text-gray-500"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${i}`}
                        value={opt}
                        checked={selected}
                        readOnly
                        className="hidden"
                      />
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selected
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selected && (
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                        )}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Textareas */}
          <div>
            <p className="text-sm font-medium mb-2">
              Masukan dari peserta untuk meningkatkan kualitas pembelajaran
            </p>
            <textarea
              value={input1}
              readOnly
              className="w-full border rounded-lg p-3 text-sm resize-none bg-gray-50 text-gray-700"
              rows={4}
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">
              Apakah ada hal lain yang perlu disampaikan kepada mentor?
            </p>
            <textarea
              value={input2}
              readOnly
              className="w-full border rounded-lg p-3 text-sm resize-none bg-gray-50 text-gray-700"
              rows={4}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-center gap-3 bg-white border-t shrink-0">
          <DialogClose asChild>
            <Button className="w-32 bg-emerald-500 hover:bg-emerald-600 text-white">
              Tutup
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
