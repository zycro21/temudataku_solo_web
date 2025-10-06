"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { X } from "lucide-react";
import DiscardChangesModal from "./discardChangesModal";
import SuccessCardAddReviewModal from "./successCardAddReview";
import axios from "axios";
import { toast } from "sonner";

interface AddReviewModalProps {
  open: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    email: string;
    projectTitle: string;
    projectCreatedAt: string;
    title: string;
    projectLink: string;
    date: string;
    scheduleStart: string;
    scheduleEnd: string;
    zoomSchedule: string;
  } | null;
}

export default function AddReviewModal({
  open,
  onClose,
  project,
}: AddReviewModalProps) {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setAnswers({});
      setCompletedSteps([]);
      setShowSuccessModal(false);
    }
  }, [open]);

  if (!project) return null;

  // helper: apakah step sudah selesai?
  const isStepCompleted = (s: number) => completedSteps.includes(s);

  // cukup 3 step total
  const stepMapping = (s: number) => s;
  const currentStep = stepMapping(step);

  const handleAnswer = (name: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [name]: value }));
  };

  // cek semua field step 2 sudah terisi
  const isStep2Valid = [
    "brief",
    "technical",
    "creativity",
    "completeness",
  ].every((field) => answers[field]);

  useEffect(() => {
    if (isStep2Valid && !completedSteps.includes(2)) {
      setCompletedSteps((prev) => [...prev, 2]);
    }
  }, [isStep2Valid, completedSteps]);

  const isStep3Valid =
    (answers["generalComment"]?.trim() || "").length > 0 &&
    (answers["improvement"]?.trim() || "").length > 0 &&
    (answers["revision"] === "yes" || answers["revision"] === "no") &&
    (answers["revision"] === "no" ||
      (answers["revision"] === "yes" && answers["revisionDate"])) &&
    answers["confirmation"] === "true";

  const stepLabels = [
    { title: "Bagian 1", desc: "Identitas Proyek" },
    { title: "Bagian 2", desc: "Penilaian Proyek" },
    { title: "Bagian 3", desc: "Umpan Balik" },
  ];

  const formatProjectSchedule = (project: {
    zoomSchedule: string;
    scheduleStart: string;
    scheduleEnd: string;
  }) => {
    try {
      const start = new Date(project.scheduleStart);
      const end = new Date(project.scheduleEnd);

      const dayName = format(start, "EEEE", { locale: id });
      const dateStr = format(start, "dd MMMM yyyy", { locale: id });
      const startTime = format(start, "HH.mm", { locale: id });
      const endTime = format(end, "HH.mm", { locale: id });

      return (
        <>
          <span className="font-semibold">{project.zoomSchedule}</span>:{" "}
          {dayName}, {dateStr} pukul {startTime}-{endTime} WIB
        </>
      );
    } catch (error) {
      return <span className="font-semibold">{project.zoomSchedule}</span>;
    }
  };

  const handleSubmitReview = async () => {
    if (!project) return;
    if (!isStep3Valid) {
      toast.error("Lengkapi semua isian terlebih dahulu.");
      return;
    }

    try {
      const payload = {
        score: 0, // opsional
        briefScore: answers["brief"],
        technicalScore: answers["technical"],
        creativityScore: answers["creativity"],
        completenessScore: answers["completeness"],
        mentorFeedback: answers["generalComment"],
        mentorSuggestion: answers["improvement"],
        isRevisedRequired: answers["revision"] === "yes",
        revisionDeadline:
          answers["revision"] === "yes" && answers["revisionDate"]
            ? new Date(answers["revisionDate"]).toISOString()
            : null,
      };

      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/project/mentors/submissions/${project.id}`,
        payload,
        {
          withCredentials: true,
        }
      );

      toast.success("Penilaian berhasil dikirim!");
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Gagal mengirim penilaian proyek."
      );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          className="sm:max-w-lg overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
          showCloseButton={false} // sembunyikan default X
        >
          {/* Tombol X custom */}
          {(step === 2 || step === 3) && (
            <button
              onClick={() => setShowDiscardModal(true)}
              className="absolute top-4 right-4 opacity-70 hover:opacity-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Peninjauan Proyek
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-0 mb-2">
              {project.projectTitle} :{" "}
              {format(new Date(project.projectCreatedAt), "EEEE, dd-MM-yyyy HH:mm", {
                locale: id,
              })}{" "}
              WIB
            </p>
          </DialogHeader>

          {/* Stepper */}
          <div className="flex justify-between items-center mb-3 relative">
            {/* garis background abu2 */}
            <div className="absolute top-3 left-[13.2%] right-[13.2%] h-1.5 bg-gray-300" />

            {/* garis progress dinamis */}
            <div
              className="absolute top-3 left-[13.2%] h-1.5 bg-emerald-600 transition-all duration-300"
              style={{
                width:
                  currentStep === 1 ? "0%" : currentStep === 2 ? "37%" : "70%",
              }}
            />

            {stepLabels.map((label, i) => {
              const s = i + 1;
              const completed = isStepCompleted(s);

              return (
                <div
                  key={s}
                  className="flex-1 flex flex-col items-center relative"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold z-10
          ${
            completed || s === 1
              ? "bg-emerald-600 text-white"
              : currentStep === s
              ? "bg-white border-2 border-emerald-600 text-emerald-600"
              : "bg-gray-300 text-gray-600"
          }`}
                  >
                    {s}
                  </div>

                  <div className="text-center mt-2">
                    <p
                      className={`text-xs font-medium ${
                        currentStep === s || completed
                          ? "text-emerald-600"
                          : "text-gray-500"
                      }`}
                    >
                      {label.title}
                    </p>
                    <p
                      className={`text-xs ${
                        currentStep === s || completed
                          ? "text-emerald-600"
                          : "text-gray-400"
                      }`}
                    >
                      {label.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Page 1: Identitas Proyek */}
          {step === 1 && (
            <div className="max-h-[400px] overflow-y-auto pr-1 space-y-4 px-1 break-words">
              {/* Nama Lengkap */}
              <div className="grid grid-cols-[16px_1fr] gap-3">
                <Image
                  src="/assets/dashboard/mentor/person.svg"
                  alt="user"
                  width={12}
                  height={12}
                  className="relative top-[2px]"
                />
                <div>
                  <p className="text-sm font-medium mb-1">
                    Nama Lengkap Mentee
                  </p>
                  <p className="text-gray-700">{project.name}</p>
                </div>
              </div>

              {/* Email */}
              <div className="grid grid-cols-[16px_1fr] gap-3">
                <Image
                  src="/assets/dashboard/mentor/person.svg"
                  alt="email"
                  width={12}
                  height={12}
                  className="relative top-[2px]"
                />
                <div>
                  <p className="text-sm font-medium mb-1">Email Mentee</p>
                  <p className="text-gray-700">{project.email}</p>
                </div>
              </div>

              {/* Judul Proyek */}
              <div className="grid grid-cols-[16px_1fr] gap-3">
                <Image
                  src="/assets/dashboard/mentor/service/openbook.svg"
                  alt="project"
                  width={12}
                  height={12}
                  className="relative top-[2px]"
                />
                <div>
                  <p className="text-sm font-medium mb-1">
                    Judul atau Nama Proyek
                  </p>
                  <p className="text-gray-700 break-words whitespace-normal">
                    {project.title}
                  </p>
                </div>
              </div>

              {/* Link Proyek */}
              <div className="grid grid-cols-[16px_1fr] gap-3">
                <Image
                  src="/assets/dashboard/mentor/service/link.svg"
                  alt="link"
                  width={12}
                  height={12}
                  className="relative top-[2px]"
                />
                <div>
                  <p className="text-sm font-medium mb-1">Link Hasil Proyek</p>
                  <a
                    href={project.projectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 underline break-all whitespace-normal"
                  >
                    {project.projectLink}
                  </a>
                </div>
              </div>

              {/* Waktu Pengumpulan */}
              <div className="grid grid-cols-[16px_1fr] gap-3">
                <Image
                  src="/assets/dashboard/mentor/calendar.svg"
                  alt="calendar"
                  width={12}
                  height={12}
                  className="relative top-[2px]"
                />
                <div>
                  <p className="text-sm font-medium mb-1">Waktu Pengumpulan</p>
                  <p className="text-gray-700">
                    {format(new Date(project.date), "EEEE, dd-MM-yyyy HH:mm", {
                      locale: id,
                    })}{" "}
                    WIB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Page 2: Penilaian Proyek */}
          {step === 2 && (
            <div className="max-h-[400px] overflow-y-auto pr-1 space-y-6">
              {/* Pertanyaan 1 */}
              <div>
                <p className="text-sm font-medium mb-2">
                  Kesesuaian dengan Brief atau Tujuan Awal{" "}
                  <span className="text-emerald-500 font-bold">*</span>
                </p>
                <div className="space-y-2 ml-2">
                  {[
                    "Sangat Sesuai",
                    "Cukup Sesuai",
                    "Kurang Sesuai",
                    "Tidak Sesuai",
                  ].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="radio"
                        name="brief"
                        value={opt}
                        checked={answers["brief"] === opt}
                        onChange={(e) => handleAnswer("brief", e.target.value)}
                        className="text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* Pertanyaan 2 */}
              <div>
                <p className="text-sm font-medium mb-2">
                  Kualitas Teknis (Coding / Desain / Analisis){" "}
                  <span className="text-emerald-500 font-bold">*</span>
                </p>
                <div className="space-y-2 ml-2">
                  {[
                    "Sangat Baik",
                    "Cukup Baik",
                    "Kurang Baik",
                    "Sangat Buruk",
                  ].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="radio"
                        name="technical"
                        value={opt}
                        checked={answers["technical"] === opt}
                        onChange={(e) =>
                          handleAnswer("technical", e.target.value)
                        }
                        className="text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* Pertanyaan 3 */}
              <div>
                <p className="text-sm font-medium mb-2">
                  Kreativitas dan Inisiatif{" "}
                  <span className="text-emerald-500 font-bold">*</span>
                </p>
                <div className="space-y-2 ml-2">
                  {[
                    "Sangat Baik",
                    "Cukup Baik",
                    "Kurang Baik",
                    "Sangat Buruk",
                  ].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="radio"
                        name="creativity"
                        value={opt}
                        checked={answers["creativity"] === opt}
                        onChange={(e) =>
                          handleAnswer("creativity", e.target.value)
                        }
                        className="text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* Pertanyaan 4 */}
              <div>
                <p className="text-sm font-medium mb-2">
                  Kelengkapan Proyek{" "}
                  <span className="text-emerald-500 font-bold">*</span>
                </p>
                <div className="space-y-2 ml-2">
                  {["Lengkap", "Belum Lengkap", "Perlu Revisi"].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="radio"
                        name="completeness"
                        value={opt}
                        checked={answers["completeness"] === opt}
                        onChange={(e) =>
                          handleAnswer("completeness", e.target.value)
                        }
                        className="text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Page 3: Umpan Balik */}
          {step === 3 && (
            <div className="max-h-[400px] overflow-y-auto pr-1 space-y-4">
              {/* Komentar Umum */}
              <div>
                <p className="text-sm font-medium mb-2">
                  Komentar Umum / Catatan Mentor
                </p>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2 text-sm 
               bg-gray-100 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  rows={5}
                  placeholder="Berikan komentar atau catatan pada proyek"
                  value={answers["generalComment"] || ""}
                  onChange={(e) =>
                    handleAnswer("generalComment", e.target.value)
                  }
                />
              </div>

              {/* Saran Perbaikan */}
              <div>
                <p className="text-sm font-medium mb-2">
                  Saran Perbaikan (Jika ada)
                </p>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2 text-sm 
               bg-gray-100 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  rows={5}
                  placeholder="Berikan saran perbaikan untuk proyek ini"
                  value={answers["improvement"] || ""}
                  onChange={(e) => handleAnswer("improvement", e.target.value)}
                />
              </div>

              {/* Perlu Revisi Ulang */}
              <div>
                <p className="text-sm font-medium mb-2">
                  Perlu Revisi Ulang?{" "}
                  <span className="text-emerald-500 font-bold">*</span>
                </p>
                <div className="ml-2 space-y-3">
                  {/* Ya + Tenggat Waktu */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-black">
                      <input
                        type="radio"
                        name="revision"
                        value="yes"
                        checked={answers["revision"] === "yes"}
                        onChange={(e) =>
                          handleAnswer("revision", e.target.value)
                        }
                        className="accent-emerald-600 focus:ring-emerald-500"
                      />
                      Ya
                    </label>

                    <div className="flex items-center gap-2">
                      <label
                        className={`text-sm ${
                          answers["revision"] === "yes"
                            ? "text-gray-700"
                            : "text-gray-400"
                        }`}
                      >
                        Atur Tenggat Waktu:
                      </label>
                      <input
                        type="date"
                        className="border border-gray-300 rounded-md p-1 text-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"
                        disabled={answers["revision"] !== "yes"}
                        value={answers["revisionDate"] || ""}
                        onChange={(e) =>
                          handleAnswer("revisionDate", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Tidak */}
                  <label className="flex items-center gap-2 text-sm text-black">
                    <input
                      type="radio"
                      name="revision"
                      value="no"
                      checked={answers["revision"] === "no"}
                      onChange={(e) => handleAnswer("revision", e.target.value)}
                      className="accent-emerald-600 focus:ring-emerald-500"
                    />
                    Tidak
                  </label>
                </div>
              </div>

              {/* Konfirmasi */}
              <div>
                <p className="text-sm font-medium mb-2">
                  Konfirmasi{" "}
                  <span className="text-emerald-500 font-bold">*</span>
                </p>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="confirmation"
                    checked={answers["confirmation"] === "true"}
                    onChange={(e) =>
                      handleAnswer(
                        "confirmation",
                        e.target.checked ? "true" : "false"
                      )
                    }
                    className="accent-emerald-600 focus:ring-emerald-500"
                  />
                  Saya telah meninjau proyek ini secara menyeluruh
                </label>
              </div>
            </div>
          )}

          {/* Footer navigation */}
          <div className="flex gap-2 mt-3">
            {step === 1 ? (
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="w-1/2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                >
                  Batal
                </Button>
              </DialogClose>
            ) : (
              <Button
                variant="outline"
                className="w-1/2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                onClick={() => {
                  if (step === 2) {
                    // reset jawaban step 2
                    setAnswers({});
                    setCompletedSteps((prev) => prev.filter((s) => s !== 2));
                  } else if (step === 3) {
                    // reset jawaban step 3
                    setAnswers((prev) => {
                      const newAnswers = { ...prev };
                      delete newAnswers.generalComment;
                      delete newAnswers.improvement;
                      delete newAnswers.revision;
                      delete newAnswers.revisionDate;
                      delete newAnswers.confirmation;
                      return newAnswers;
                    });
                    setCompletedSteps((prev) => prev.filter((s) => s !== 3));
                  }
                  setStep(step - 1);
                }}
              >
                Sebelumnya
              </Button>
            )}

            {step < 3 ? (
              <Button
                className="w-1/2 bg-emerald-600 text-white hover:bg-emerald-700 
           disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:cursor-not-allowed"
                disabled={step === 2 && !isStep2Valid}
                onClick={() => {
                  if (step === 2 && isStep2Valid) {
                    setCompletedSteps((prev) =>
                      prev.includes(2) ? prev : [...prev, 2]
                    );
                    setStep(step + 1);
                  } else if (step !== 2) {
                    setCompletedSteps((prev) =>
                      prev.includes(step) ? prev : [...prev, step]
                    );
                    setStep(step + 1);
                  }
                }}
              >
                Selanjutnya
              </Button>
            ) : (
              <Button
                className="w-1/2 bg-emerald-600 text-white hover:bg-emerald-700
    disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={!isStep3Valid}
                onClick={async () => {
                  await handleSubmitReview();
                }}
              >
                Kirim Penilaian
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DiscardChangesModal
        open={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        onConfirm={() => {
          setShowDiscardModal(false);
          onClose(); // tutup AddReviewModal
        }}
      />

      <SuccessCardAddReviewModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => {
          setShowSuccessModal(false);
          window.location.href = "/dashboard/mentor/services/project";
        }}
      />
    </>
  );
}
