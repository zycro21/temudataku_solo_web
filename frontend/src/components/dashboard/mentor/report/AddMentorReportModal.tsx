"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import DiscardChangesModal from "../services/project/discardChangesModal";
import SuccessCardAddReviewModal from "./succesAddReport";

interface AddMentorReportModalProps {
  open: boolean;
  onClose: () => void;
  program?: string;
  date?: string;
  time?: string;
}

export default function AddMentorReportModal({
  open,
  onClose,
  program,
  date,
  time,
}: AddMentorReportModalProps) {
  const initialForm = {
    understanding: "",
    participation: "",
    challenges: "",
    questions: "",
    recommendations: "",
    notes: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // reset form tiap kali modal utama ditutup
  useEffect(() => {
    if (!open) {
      setFormData(initialForm);
    }
  }, [open]);

  // cek validasi form
  const isFormValid = useMemo(() => {
    return (
      formData.understanding &&
      formData.participation &&
      formData.challenges.trim() &&
      formData.questions.trim() &&
      formData.recommendations.trim()
    );
  }, [formData]);

  // handler ketika klik "Batal" atau "X"
  const handleAttemptClose = () => {
    setShowDiscardModal(true);
  };

  // handler confirm buang perubahan
  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    onClose(); // tutup modal utama
  };

  // handler submit
  const handleSubmit = () => {
    // kalau nanti ada API call bisa ditaruh sini
    setShowSuccessModal(true); // tampilkan modal sukses
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleAttemptClose}>
        <DialogContent
          className="sm:max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header */}
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Laporan Mentor
            </DialogTitle>

            {program && (
              <div className="mt-0">
                <p className="text-base font-bold text-gray-800 leading-tight">
                  {program}
                </p>
                {date && time && (
                  <p className="text-sm text-gray-600 mt-1">
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
                      checked={formData.understanding === opt}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          understanding: e.target.value,
                        }))
                      }
                      className="accent-emerald-600 focus:ring-emerald-500"
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
                      checked={formData.participation === opt}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          participation: e.target.value,
                        }))
                      }
                      className="accent-emerald-600 focus:ring-emerald-500"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Tantangan */}
            <div>
              <p className="font-medium mb-2">
                Tantangan atau Kesulitan yang Dihadapi Mentee{" "}
                <span className="text-emerald-600">*</span>
              </p>
              <textarea
                className="w-full border rounded-md p-2 resize-none bg-gray-100 overflow-y-auto scroll-thin focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows={5}
                placeholder=" Masukkan Tantangan atau Kesulitan yang Dihadapi Mentee"
                value={formData.challenges}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, challenges: e.target.value }))
                }
              />
            </div>

            {/* Pertanyaan */}
            <div>
              <p className="font-medium mb-2">
                Apa Saja Pertanyaan yang Paling Sering Diajukan Mentee dalam
                Pertemuan Ini? <span className="text-emerald-600">*</span>
              </p>
              <textarea
                className="w-full border rounded-md p-2 resize-none bg-gray-100 overflow-y-auto scroll-thin focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows={5}
                placeholder="Masukkan pertanyaan yang paling sering diajukan mentee"
                value={formData.questions}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, questions: e.target.value }))
                }
              />
            </div>

            {/* Rekomendasi */}
            <div>
              <p className="font-medium mb-2">
                Rekomendasi atau Fokus untuk Sesi Berikutnya{" "}
                <span className="text-emerald-600">*</span>
              </p>
              <textarea
                className="w-full border rounded-md p-2 resize-none bg-gray-100 overflow-y-auto scroll-thin focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows={1}
                placeholder="Masukkan rekomendasi untuk sesi mentoring berikutnya"
                value={formData.recommendations}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    recommendations: e.target.value,
                  }))
                }
              />
            </div>

            {/* Catatan Tambahan */}
            <div>
              <p className="font-medium mb-2">
                Apakah Ada Hal Lain yang Perlu Tim TemuDataku Ketahui?{" "}
                <span className="text-gray-800">(opsional)</span>
              </p>
              <textarea
                className="w-full border rounded-md p-2 resize-none bg-gray-100 overflow-y-auto scroll-thin focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows={5}
                placeholder="Tambahkan catatan tambahan lain untuk sesi mentoring ini"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleAttemptClose}
              className="w-1/2 py-3 text-base"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="w-1/2 py-3 text-base bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Batal */}
      <DiscardChangesModal
        open={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        onConfirm={handleConfirmDiscard}
      />

      {/* Modal Sukses */}
      <SuccessCardAddReviewModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => {
          setShowSuccessModal(false);
          onClose();
        }}
      />
    </>
  );
}
