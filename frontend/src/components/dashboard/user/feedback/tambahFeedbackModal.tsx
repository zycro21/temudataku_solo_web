"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import SuccessModal from "./successModal";
import axios from "axios";
import { toast } from "sonner";

interface TambahFeedbackModalProps {
  sessionId: string;
  feedbackTitle: string;
  feedbackDate: string;
  feedbackTime: string;
  onSuccess?: () => void;
}

export default function TambahFeedbackModal({
  sessionId,
  feedbackTitle,
  feedbackDate,
  feedbackTime,
  onSuccess,
}: TambahFeedbackModalProps) {
  const [open, setOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const questions = [
    "Materi yang diberikan dalam pertemuan ini mudah dimengerti",
    "Mentor menyampaikan materi dengan jelas dan interaktif",
    "Mentor telah menjawab/merespon pertanyaan yang saya ajukan dengan baik",
    "Waktu pelaksanaan berjalan tepat waktu",
    "Jadwal sesuai dan tidak mengganggu waktu saya",
    "Platform yang digunakan untuk kelas (Zoom/Google Meet, dll) berjalan dengan lancar tanpa kendala berarti",
  ];

  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");

  const handleSelect = (qIndex: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };

  const allAnswered =
    questions.every((_, i) => !!answers[i]) &&
    input1.trim() !== "" &&
    input2.trim() !== "";

  const handleClose = () => {
    setOpen(false);
    setAnswers({});
    setInput1("");
    setInput2("");
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Konversi jawaban mentee jadi rating (1–5)
      const ratingValues: Record<string, number> = {
        "Sangat Setuju": 5,
        "Setuju": 4,
        "Tidak Setuju": 2,
        "Sangat Tidak Setuju": 1,
      };

      const numericAnswers = Object.values(answers).map(
        (ans) => ratingValues[ans] ?? 0
      );
      const avgRating =
        numericAnswers.reduce((a, b) => a + b, 0) / numericAnswers.length;

      // Payload ke backend
      const payload = {
        sessionId,
        rating: Math.round(avgRating),
        comment: `${input1}\n\nCatatan tambahan: ${input2}`,
        isAnonymous: false,
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feedback/createFeedbacks`,
        payload,
        {
          withCredentials: true,
        }
      );

      toast.success(res.data.message || "Feedback berhasil dikirim.");
      if (onSuccess) onSuccess();
      handleClose();
      setSuccessOpen(true);
    } catch (error: any) {
      console.error("Error saat kirim feedback:", error);
      toast.error(
        error.response?.data?.message ||
          "Gagal mengirim feedback. Coba lagi nanti."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Tombol trigger */}
      <Button
        onClick={() => setOpen(true)}
        className="bg-emerald-500 hover:bg-emerald-600 text-white w-full"
      >
        Tambah Review
      </Button>

      {/* Modal Tambah Feedback */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogOverlay />
        <DialogContent
          className="bg-white rounded-xl shadow-lg w-full max-w-xl flex flex-col max-h-[90vh] p-0"
          showCloseButton={false}
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b space-y-1 shrink-0">
            <DialogTitle className="text-lg font-semibold">
              Tambah Review
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-800">
              {feedbackTitle}
            </DialogDescription>
            <p className="text-xs text-gray-500">
              {feedbackDate} • {feedbackTime}
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-4 flex-1 overflow-y-auto space-y-6">
            {questions.map((q, i) => (
              <div key={i}>
                <p className="text-sm font-medium mb-3">
                  {q} <span className="text-emerald-500 font-bold">*</span>
                </p>
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
                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer w-fit transition ${
                          selected
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${i}`}
                          value={opt}
                          checked={selected}
                          onChange={() => handleSelect(i, opt)}
                          className="hidden"
                        />
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selected
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-gray-400"
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
                Masukan dari peserta untuk meningkatkan kualitas pembelajaran{" "}
                <span className="text-emerald-500 font-bold">*</span>
              </p>
              <textarea
                placeholder="Masukan anda..."
                value={input1}
                onChange={(e) => setInput1(e.target.value)}
                className="w-full border rounded-lg p-3 text-sm resize-none"
                rows={4}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">
                Apakah ada hal lain yang perlu disampaikan kepada mentor?{" "}
                <span className="text-emerald-500 font-bold">*</span>
              </p>
              <textarea
                placeholder="Tulis catatan tambahan..."
                value={input2}
                onChange={(e) => setInput2(e.target.value)}
                className="w-full border rounded-lg p-3 text-sm resize-none"
                rows={4}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 flex justify-center gap-3 bg-white border-t shrink-0">
            <Button variant="outline" onClick={handleClose} className="w-32">
              Batal
            </Button>
            <Button
              disabled={!allAnswered || loading}
              className={`w-32 ${
                allAnswered && !loading
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleSubmit}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Success */}
      <SuccessModal open={successOpen} onClose={() => setSuccessOpen(false)} />
    </>
  );
}
