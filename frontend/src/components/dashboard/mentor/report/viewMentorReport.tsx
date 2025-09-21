"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface ShowMentorReportModalProps {
  open: boolean;
  onClose: () => void;
  program?: string;
  date?: string;
  time?: string;
  reportData?: {
    understanding: string;
    participation: string;
    challenges: string;
    questions: string;
    recommendations: string;
    notes: string;
  };
}

export default function ShowMentorReportModal({
  open,
  onClose,
  program,
  date,
  time,
  reportData,
}: ShowMentorReportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Laporan Mentor
          </DialogTitle>
          {program && (
            <div>
              <p className="text-base font-bold text-gray-800">{program}</p>
              {date && time && (
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  {date} pukul {time}
                </p>
              )}
            </div>
          )}
        </DialogHeader>

        {/* Konten scrollable */}
        <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-6 text-sm">
          {/* Pemahaman Mentee */}
          <div>
            <p className="font-medium mb-2">
              Pemahaman Mentee terhadap Materi{" "}
              <span className="text-emerald-600">*</span>
            </p>
            <div className="space-y-2 ml-1">
              {[
                "Sangat Paham",
                "Cukup Paham",
                "Kurang Paham",
                "Tidak Paham",
              ].map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <input
                    type="radio"
                    name="understanding"
                    value={opt}
                    checked={reportData?.understanding === opt}
                    readOnly
                    className="accent-emerald-600 pointer-events-none"
                  />

                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Respon dan Partisipasi */}
          <div>
            <p className="font-medium mb-2">
              Respon dan Partisipasi Mentee{" "}
              <span className="text-emerald-600">*</span>
            </p>
            <div className="space-y-2 ml-1">
              {[
                "Sangat Aktif",
                "Cukup Aktif",
                "Kurang Aktif",
                "Tidak Aktif",
              ].map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <input
                    type="radio"
                    name="participation"
                    value={opt}
                    checked={reportData?.participation === opt}
                    readOnly
                    className="accent-emerald-600 pointer-events-none"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Tantangan */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image
                src="/assets/dashboard/mentor/tantangan.svg"
                alt="challenges icon"
                width={12}
                height={12}
                className="relative top-[-0.5px]"
              />
              <p className="font-medium">
                Tantangan atau Kesulitan yang Dihadapi Mentee{" "}
                <span className="text-emerald-600">*</span>
              </p>
            </div>
            <p className="ml-6 text-black whitespace-pre-line">
              {reportData?.challenges || "-"}
            </p>
          </div>

          {/* Pertanyaan */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image
                src="/assets/dashboard/mentor/ask.svg"
                alt="questions icon"
                width={12}
                height={12}
                className="relative top-[-0.5px]"
              />
              <p className="font-medium">
                Apa Saja Pertanyaan yang Paling Sering Diajukan Mentee?{" "}
                <span className="text-emerald-600">*</span>
              </p>
            </div>
            <p className="ml-6 text-black whitespace-pre-line">
              {reportData?.questions || "-"}
            </p>
          </div>

          {/* Rekomendasi */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image
                src="/assets/dashboard/mentor/service/openbook.svg"
                alt="recommendations icon"
                width={12}
                height={12}
                className="relative top-[-0.5px]"
              />
              <p className="font-medium">
                Rekomendasi atau Fokus untuk Sesi Berikutnya{" "}
                <span className="text-emerald-600">*</span>
              </p>
            </div>
            <p className="ml-6 text-black whitespace-pre-line">
              {reportData?.recommendations || "-"}
            </p>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image
                src="/assets/dashboard/mentor/laporan.svg"
                alt="notes icon"
                width={12}
                height={12}
                className="relative top-[-0.5px]"
              />
              <p className="font-medium">
                Apakah Ada Hal Lain yang Perlu Tim TemuDataku Ketahui?{" "}
                <span className="text-gray-800">(opsional)</span>
              </p>
            </div>
            <p className="ml-6 text-black whitespace-pre-line">
              {reportData?.notes || "-"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
