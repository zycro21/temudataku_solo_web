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

type LihatReviewModalProps = {
  bootcampTitle: string;
  schedule: string;
  review: {
    penilaian: {
      kesesuaian: string;
      kualitas: string;
      kreativitas: string;
      kelengkapan: string;
    };
    feedback: {
      komentar: string;
      saran: string;
      perluRevisi: "Ya" | "Tidak";
    };
  };
};

export default function LihatReviewModal({
  bootcampTitle,
  schedule,
  review,
}: LihatReviewModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  // reset step setiap kali modal dibuka
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
        <button className="w-full px-3 py-2 text-sm font-medium rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition">
          Lihat Review
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Lihat Review</DialogTitle>
          <p className="text-xs text-gray-500">
            {bootcampTitle} : {schedule}
          </p>
        </DialogHeader>

        {/* Step 1 - Penilaian Proyek */}
        {step === 1 && (
          <div className="space-y-6 mt-2">
            <h3 className="text-emerald-600 font-semibold">
              Section 1 - Penilaian Proyek
            </h3>
            <div className="border-t border-gray-200 pt-4 mt-1 space-y-3">
              {/* Group 1 */}
              <div>
                <p className="font-medium text-sm mb-2">
                  Kesesuaian dengan Brief atau Tujuan Awal
                </p>
                <div className="space-y-2 text-sm">
                  {[
                    "Sangat Sesuai",
                    "Cukup Sesuai",
                    "Kurang Sesuai",
                    "Tidak Sesuai",
                  ].map((opt) => {
                    const selected = opt === review.penilaian.kesesuaian;
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 ${
                          selected ? "text-emerald-600 font-semibold" : ""
                        }`}
                      >
                        <input
                          type="radio"
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

              {/* Group 2 */}
              <div>
                <p className="font-medium text-sm mb-2">
                  Kualitas Teknis (Coding / Desain / Analisis)
                </p>
                <div className="space-y-2 text-sm">
                  {["Sangat Baik", "Cukup Baik", "Buruk", "Sangat Buruk"].map(
                    (opt) => {
                      const selected = opt === review.penilaian.kualitas;
                      return (
                        <label
                          key={opt}
                          className={`flex items-center gap-2 ${
                            selected ? "text-emerald-600 font-semibold" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            checked={selected}
                            readOnly
                            className="accent-emerald-600"
                          />
                          {opt}
                        </label>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Group 3 */}
              <div>
                <p className="font-medium text-sm mb-2">
                  Kreativitas dan Inisiatif
                </p>
                <div className="space-y-2 text-sm">
                  {["Sangat Baik", "Cukup Baik", "Buruk", "Sangat Buruk"].map(
                    (opt) => {
                      const selected = opt === review.penilaian.kreativitas;
                      return (
                        <label
                          key={opt}
                          className={`flex items-center gap-2 ${
                            selected ? "text-emerald-600 font-semibold" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            checked={selected}
                            readOnly
                            className="accent-emerald-600"
                          />
                          {opt}
                        </label>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Group 4 */}
              <div>
                <p className="font-medium text-sm mb-2">Kelengkapan Practice</p>
                <div className="space-y-2 text-sm">
                  {["Lengkap", "Belum Lengkap", "Perlu Revisi"].map((opt) => {
                    const selected = opt === review.penilaian.kelengkapan;
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 ${
                          selected ? "text-emerald-600 font-semibold" : ""
                        }`}
                      >
                        <input
                          type="radio"
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

        {/* Step 2 - Umpan Balik */}
        {step === 2 && (
          <div className="space-y-6 mt-2">
            <h3 className="text-emerald-600 font-semibold">
              Section 2 - Umpan Balik
            </h3>
            <div className="border-t border-gray-200 pt-2 mt-2 space-y-6">
              {/* Komentar Umum */}
              <div>
                <p className="font-medium text-sm mb-2">
                  Komentar Umum / Catatan Reviewer
                </p>
                <p className="text-sm text-gray-700">
                  {review.feedback.komentar}
                </p>
              </div>

              {/* Saran Perbaikan */}
              <div>
                <p className="font-medium text-sm mb-2">Saran Perbaikan</p>
                <p className="text-sm text-gray-700">{review.feedback.saran}</p>
              </div>

              {/* Perlu Revisi Ulang */}
              <div>
                <p className="font-medium text-sm mb-2">Perlu Revisi Ulang?</p>
                <div className="space-y-2 text-sm">
                  {["Ya", "Tidak"].map((opt) => {
                    const selected = opt === review.feedback.perluRevisi;
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 ${
                          selected ? "text-emerald-600 font-semibold" : ""
                        }`}
                      >
                        <input
                          type="radio"
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
