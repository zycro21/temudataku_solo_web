"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type PengumpulanSudahModalProps = {
  open: boolean;
  setOpen: (val: boolean) => void;
  bootcampTitle: string;
  schedule: string;
  projectTitle: string;
  reviewData?: {
    briefScore?: string;
    technicalScore?: string;
    creativityScore?: string;
    completenessScore?: string;
    mentorFeedback?: string;
    mentorSuggestion?: string;
    isRevisedRequired?: boolean;
  };
};

export default function PengumpulanSudahModal({
  open,
  setOpen,
  bootcampTitle,
  schedule,
  projectTitle,
  reviewData,
}: PengumpulanSudahModalProps) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (open) setStep(1);
  }, [open]);

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) setStep(1);
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white w-full">
          Lihat Project -{" "}
          <span className="text-blue-700 font-semibold">Sudah Direview</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Lihat Review</DialogTitle>
          <p className="text-xs text-gray-500">
            <span className="text-gray-800 font-medium">{projectTitle}</span> :{" "}
            {schedule}
          </p>
        </DialogHeader>

        {/* STEP 1: Penilaian */}
        {step === 1 && (
          <div className="space-y-6 mt-2">
            <h3 className="text-emerald-600 font-semibold">
              Section 1 - Penilaian Proyek
            </h3>

            <div className="border-t border-gray-200 pt-4 mt-1 space-y-3">
              {[
                {
                  label: "Kesesuaian dengan Brief atau Tujuan Awal",
                  options: [
                    "Sangat Sesuai",
                    "Cukup Sesuai",
                    "Kurang Sesuai",
                    "Tidak Sesuai",
                  ],
                  value: reviewData?.briefScore,
                  name: "brief",
                },
                {
                  label: "Kualitas Teknis (Coding / Desain / Analisis)",
                  options: [
                    "Sangat Baik",
                    "Cukup Baik",
                    "Buruk",
                    "Sangat Buruk",
                  ],
                  value: reviewData?.technicalScore,
                  name: "technical",
                },
                {
                  label: "Kreativitas dan Inisiatif",
                  options: [
                    "Sangat Baik",
                    "Cukup Baik",
                    "Buruk",
                    "Sangat Buruk",
                  ],
                  value: reviewData?.creativityScore,
                  name: "creativity",
                },
                {
                  label: "Kelengkapan Proyek",
                  options: ["Lengkap", "Belum Lengkap", "Perlu Revisi"],
                  value: reviewData?.completenessScore,
                  name: "completeness",
                },
              ].map((group) => (
                <div key={group.name}>
                  <p className="font-medium text-sm mb-2">{group.label}</p>
                  <div className="space-y-2 text-sm">
                    {group.options.map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 ${
                          opt === group.value
                            ? "text-emerald-600 font-semibold"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={group.name}
                          value={opt}
                          checked={opt === group.value}
                          readOnly
                          className="accent-emerald-600"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Umpan Balik */}
        {step === 2 && (
          <div className="space-y-6 mt-2">
            <h3 className="text-emerald-600 font-semibold">
              Section 2 - Umpan Balik
            </h3>

            <div className="border-t border-gray-200 pt-2 mt-2 space-y-6">
              <div>
                <p className="font-medium text-sm mb-2">
                  Komentar Umum / Catatan Mentor
                </p>
                <p className="text-sm text-gray-700">
                  {reviewData?.mentorFeedback || "-"}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-2" />

              <div>
                <p className="font-medium text-sm mb-2">Saran Perbaikan</p>
                <p className="text-sm text-gray-700">
                  {reviewData?.mentorSuggestion || "-"}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-2" />

              <div>
                <p className="font-medium text-sm mb-2">Perlu Revisi Ulang?</p>
                <div className="space-y-2 text-sm">
                  {["Ya", "Tidak"].map((opt) => {
                    const selected =
                      reviewData?.isRevisedRequired === (opt === "Ya");
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 ${
                          selected ? "text-emerald-600 font-semibold" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="revisi"
                          value={opt}
                          checked={selected}
                          readOnly
                          className="accent-emerald-600"
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className="w-1/2"
            onClick={handlePrev}
            disabled={step === 1}
          >
            Sebelumnya
          </Button>
          {step < 2 ? (
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white w-1/2"
              onClick={handleNext}
            >
              Selanjutnya
            </Button>
          ) : (
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white w-1/2"
              onClick={() => setOpen(false)}
            >
              Tutup
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
