"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import type {
  ContentBlock,
  AdditionalContent,
  AdditionalContentType,
  ImageVideoContent,
  MultipleChoiceContent,
  MatchingContent,
  InteractiveCodeContent,
} from "@/components/elearning/ElearningSelection";
import {
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Database,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  FileText,
  FolderKanban,
  ClipboardList,
  TrendingUp,
  Layers,
  Check,
  X,
} from "lucide-react";

/* ================= TYPES ================= */

interface ModeProps {
  mode:
    | { type: "submodule"; data: any }
    | { type: "quiz"; data: any }
    | { type: "assignment"; data: any };
  onQuizSubmitScore?: (score: number) => void;
  onQuizReset?: () => void;
  onAssignmentScore?: (score: number | null) => void;
}

/* ================= QUIZ ================= */
const QuizRenderer = ({
  quiz,
  onSubmitScore,
  onReset,
}: {
  quiz: any;
  onSubmitScore?: (score: number) => void;
  onReset?: () => void;
}) => {
  const questions = [...quiz.questions].sort(
    (a: any, b: any) => a.orderNumber - b.orderNumber,
  );

  const isStepMode = questions.length > 5;

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [submitted, setSubmitted] = useState(false);

  /* ================= LOGIC ================= */

  const toggleAnswer = (questionId: number, option: string) => {
    if (submitted) return;

    setAnswers((prev) => {
      const current = prev[questionId] || [];

      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];

      return { ...prev, [questionId]: updated };
    });
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const checkIsCorrect = (question: any) => {
    const selected = answers[question.id] || [];
    return (
      selected.length === question.correctAnswers.length &&
      selected.every((ans: string) => question.correctAnswers.includes(ans))
    );
  };

  const allAnswered = questions.every(
    (q: any) => (answers[q.id] || []).length > 0,
  );

  const correctCount = questions.filter((q: any) => checkIsCorrect(q)).length;

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= 80;

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrentStep(0);
    onReset?.();
  };

  // Setelah submit → tampil semua (scroll mode)
  const visibleQuestions =
    isStepMode && !submitted ? [questions[currentStep]] : questions;

  return (
    <div className="w-full max-w-6xl">
      {/* ================= STEP HEADER ================= */}
      {isStepMode && (
        <section className="relative w-screen bg-[#F8FAFC] -mx-6 -mt-8">
          <div className="pl-10 pt-10 pb-8 space-y-4">
            <p className="text-2xl font-bold text-black">
              Pertanyaan {currentStep + 1} dari {questions.length}
            </p>

            <p className="text-base text-gray-600">
              Silakan pilih jawaban yang paling tepat sebelum melanjutkan.
            </p>

            <div className="flex flex-wrap gap-4 pt-3">
              {questions.map((question: any, idx: number) => {
                const isActive = idx === currentStep;
                const isCorrectQuestion = checkIsCorrect(question);
                const hasAnswer = (answers[question.id] || []).length > 0;

                let stepStyle =
                  "bg-[#E5E7EB] border-[#E5E7EB] text-gray-700 hover:bg-gray-300";

                if (submitted) {
                  stepStyle = isCorrectQuestion
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-red-500 border-red-500 text-white";
                } else if (hasAnswer) {
                  stepStyle = "bg-emerald-500 border-emerald-500 text-white";
                } else if (isActive) {
                  stepStyle = "bg-white border-emerald-500 text-emerald-600";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!submitted) {
                        setCurrentStep(idx);
                      } else {
                        const el = document.getElementById(`question-${idx}`);
                        el?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                    className={`w-14 h-14 rounded-lg text-lg font-bold transition border ${stepStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ================= QUESTION AREA ================= */}
      <div className="bg-white pt-6 pl-28 pr-8 pb-12 space-y-12">
        {visibleQuestions.map((q: any, index: number) => {
          const currentAnswers = answers[q.id] || [];
          const isCorrect = checkIsCorrect(q);

          return (
            <div key={q.id} id={`question-${index}`} className="space-y-4">
              <p className="text-2xl font-bold text-black">
                Pertanyaan{" "}
                {isStepMode && !submitted ? currentStep + 1 : index + 1}
              </p>

              <p className="max-w-4xl text-base font-semibold text-black leading-relaxed">
                {q.textQuestion}
              </p>

              {/* OPTIONS */}
              <div className="pl-8 space-y-4 pt-4">
                {q.options.map((opt: string) => {
                  const checked = currentAnswers.includes(opt);
                  const isCorrectOption = q.correctAnswers.includes(opt);

                  let borderStyle = "border-gray-200";
                  let checkboxStyle =
                    "w-6 h-6 border-2 border-gray-500 rounded-full";

                  if (submitted && checked) {
                    if (isCorrectOption) {
                      borderStyle = "border-emerald-500";
                      checkboxStyle =
                        "w-6 h-6 bg-emerald-500 rounded-md p-[3px]";
                    } else {
                      borderStyle = "border-red-500";
                      checkboxStyle = "w-6 h-6 bg-red-500 rounded-md p-[3px]";
                    }
                  } else if (checked) {
                    checkboxStyle = "w-6 h-6 bg-emerald-500 rounded-md p-[3px]";
                  }

                  return (
                    <label
                      key={opt}
                      className={`flex items-center gap-4 px-5 py-4 border rounded-xl cursor-pointer transition hover:bg-gray-50 ${borderStyle}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAnswer(q.id, opt)}
                        disabled={submitted}
                        className="hidden"
                      />

                      <div
                        className={`flex items-center justify-center transition-all duration-200 ${checkboxStyle}`}
                      >
                        {checked && (
                          <Image
                            src="/assets/elearning/ceklisputih.svg"
                            alt="check"
                            width={12}
                            height={12}
                          />
                        )}
                      </div>

                      <span className="text-black text-sm">{opt}</span>
                    </label>
                  );
                })}
              </div>

              {/* RESULT PER QUESTION */}
              {submitted && (
                <div
                  className={`mt-6 border rounded-xl p-5 flex gap-4 ${
                    isCorrect
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-red-500 bg-red-50"
                  }`}
                >
                  <Image
                    src={
                      isCorrect
                        ? "/assets/elearning/icon-park-solid_check-one.svg"
                        : "/assets/elearning/salah.svg"
                    }
                    alt="result"
                    width={28}
                    height={28}
                  />

                  <div>
                    <p
                      className={`font-bold text-lg ${
                        isCorrect ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {isCorrect ? "Benar!" : "Belum Tepat."}
                    </p>

                    {isCorrect && q.explanation && (
                      <p className="text-sm text-gray-700 mt-1">
                        {q.explanation}
                      </p>
                    )}

                    {!isCorrect && (
                      <p className="text-sm text-gray-700 mt-1">
                        Silakan pelajari kembali materi terkait sebelum
                        melanjutkan.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= BOTTOM ACTION ================= */}
      {!isStepMode && !submitted && (
        <div className="bg-white flex justify-center pl-28 pr-8 pb-16">
          <button
            disabled={!allAnswered || submitted}
            onClick={() => setShowConfirmModal(true)}
            className={`flex items-center gap-3 px-10 py-4 rounded-xl font-semibold text-base transition ${
              !allAnswered || submitted
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-emerald-500 text-white hover:bg-emerald-600"
            }`}
          >
            Selesaikan Quiz
            <ArrowRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* ================= STEP MODE NAVIGATION ================= */}
      {isStepMode && !submitted && (
        <div className="bg-white flex justify-between items-center pl-28 pr-8 pt-2 pb-12">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((p) => p - 1)}
            className="px-8 py-4 rounded-xl bg-emerald-500 text-white"
          >
            Sebelumnya
          </button>

          {currentStep === questions.length - 1 ? (
            <button
              disabled={!allAnswered}
              onClick={() => setShowConfirmModal(true)}
              className={`flex items-center gap-3 px-10 py-4 rounded-xl font-semibold transition ${
                !allAnswered
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-500 text-white hover:bg-emerald-600"
              }`}
            >
              Selesaikan Quiz
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep((p) => p + 1)}
              className="px-8 py-4 rounded-xl bg-emerald-500 text-white"
            >
              Selanjutnya
            </button>
          )}
        </div>
      )}

      {/* ================= CONFIRM SUBMIT MODAL ================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center space-y-4 shadow-2xl">
            <div className="flex justify-center">
              <Image
                src="/assets/elearning/confirm-quiz.svg"
                alt="confirm"
                width={180}
                height={140}
              />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Selesaikan Kuis?
            </h2>

            <p className="text-gray-700 text-base leading-relaxed">
              Pastikan semua jawaban sudah sesuai sebelum dikirim.
            </p>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 border border-emerald-500 text-emerald-600 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition"
              >
                Cek Lagi
              </button>

              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSubmitted(true);
                  onSubmitScore?.(score);
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition"
              >
                Kirim Jawaban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= AFTER SUBMIT RESULT PANEL ================= */}
      {submitted && (
        <div className="w-full flex justify-center mb-16">
          <div className="bg-[#F9F9F9] border border-gray-200 rounded-2xl ml-20 p-10 text-center space-y-6 max-w-3xl w-full">
            {!passed ? (
              <>
                <h2 className="text-2xl font-bold text-gray-800">
                  Belum Lulus ..
                </h2>

                <p className="text-gray-600">
                  Nilai kamu {score} poin. Nilai minimum kelulusan adalah 80
                  poin. Silakan mengulang kuis untuk meningkatkan pemahaman
                  sebelum melanjutkan.
                </p>

                <button
                  onClick={handleReset}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                  Ulangi Kuis
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800">
                  Selamat! 🎉
                </h2>

                <p className="text-gray-600">
                  Nilai kamu {score} poin dan telah mencapai nilai minimum
                  kelulusan. Silakan mengunduh sertifikat atau ulangi kuis untuk
                  memperdalam pemahaman.
                </p>

                <div className="flex justify-center gap-4 pt-2">
                  <button
                    onClick={handleReset}
                    className="border border-emerald-500 text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition"
                  >
                    Ulangi Kuis
                  </button>

                  <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition">
                    Unduh Sertifikat
                    <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= ASSIGNMENT ================= */
const formatFileSize = (kb: number) => {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
};

function AssignmentRenderer({
  a,
  onAssignmentScore,
}: {
  a: any;
  onAssignmentScore?: (score: number | null) => void;
}) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);

  type ReviewStatus = "pending" | "passed" | "failed";
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>("pending");
  const [mentorFeedback, setMentorFeedback] = useState<string | null>(null);
  const [reviewedAt, setReviewedAt] = useState<Date | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const applyReview = (
    status: ReviewStatus,
    scoreValue?: number,
    feedbackValue?: string,
  ) => {
    setReviewStatus(status);

    if (status === "pending") {
      setScore(null);
      setMentorFeedback(null);
      setReviewedAt(null);
      onAssignmentScore?.(null);
    } else {
      setScore(scoreValue ?? null);
      setMentorFeedback(feedbackValue ?? null);
      setReviewedAt(new Date());

      onAssignmentScore?.(scoreValue ?? null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileFormat = (name: string) =>
    name.split(".").pop()?.toUpperCase() ?? "";

  const getEstimatedPageCount = (file: File) => {
    if (file.type === "application/pdf")
      return Math.max(1, Math.round(file.size / 120000));
    return null;
  };

  return (
    <div className="w-full max-w-full h-[calc(100vh-270px)] overflow-hidden">
      {/* 300px = navbar + hero + footer space */}

      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6 h-full px-6 min-h-0">
        {/* ================= LEFT (65%) ================= */}
        <section className="overflow-y-auto pr-6 space-y-10 pb-6 min-h-0">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-black">Deskripsi Proyek</h2>
            <p className="text-base text-gray-800 leading-relaxed">
              {a.description}
            </p>
          </div>

          {a.instruction && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-black">
                Instruksi Pengerjaan
              </h2>
              <ol className="list-decimal pl-6 space-y-3 text-base text-gray-800">
                {a.instruction.map((i: string, idx: number) => (
                  <li key={idx}>{i}</li>
                ))}
              </ol>
            </div>
          )}

          {a.supportingFiles && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-black">
                Dokumen yang Perlu Diunduh
              </h2>

              <div className="space-y-3">
                {a.supportingFiles.map((f: any) => (
                  <a
                    key={f.id}
                    href={f.url}
                    className="flex items-center justify-between border rounded-lg px-5 py-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <Image
                        src="/assets/elearning/download-1.svg"
                        alt="file"
                        width={36}
                        height={36}
                      />

                      <div>
                        <p className="text-base font-semibold text-black mb-1">
                          {f.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {f.pageCount ? `${f.pageCount} pages | ` : ""}
                          {f.format.toUpperCase()} | {formatFileSize(f.sizeKB)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(f.url, "_blank");
                      }}
                      className="shrink-0 hover:scale-105 transition"
                    >
                      <Image
                        src="/assets/elearning/download.svg"
                        alt="download"
                        width={20}
                        height={20}
                      />
                    </button>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        {showConfirmModal && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center space-y-6 shadow-2xl">
              <div className="flex justify-center">
                <Image
                  src="/assets/elearning/confirm-quiz.svg"
                  alt="confirm"
                  width={200}
                  height={150}
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-800">
                Kirim Tugas Proyek?
              </h2>

              <p className="text-gray-600 text-sm leading-relaxed">
                Setelah dikirim, tugas tidak dapat diedit atau dikirim ulang.
              </p>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 border border-emerald-500 text-emerald-600 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition"
                >
                  Cek Lagi
                </button>

                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setIsSubmitted(true);
                    setSubmittedAt(new Date());

                    // ===== MANUAL TESTING =====
                    // Ubah ini untuk testing
                    // applyReview("pending");
                    // applyReview("passed", 88, "Struktur laporan sangat baik.");
                    applyReview(
                      "failed",
                      60,
                      "Perlu perbaikan pada analisis data.",
                    );
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  Kirim Tugas
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ================= RIGHT (35%) ================= */}
        {!isSubmitted ? (
          <>
            <section className="overflow-y-auto pl-4 pr-4 space-y-6 pb-10">
              <h2 className="text-xl font-bold text-black">Unggah File</h2>

              {/* UPLOAD BOX */}
              <label
                htmlFor="assignment-upload"
                className="border-2 border-dashed rounded-xl px-4 py-10 text-center hover:border-emerald-500 transition cursor-pointer bg-gray-50 block"
              >
                <input
                  id="assignment-upload"
                  type="file"
                  multiple
                  accept=".pdf,.csv,.xls,.xlsx,.doc,.docx,.ipynb"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                <div className="flex flex-col items-center gap-3">
                  <Image
                    src="/assets/elearning/upload.svg"
                    alt="upload"
                    width={40}
                    height={40}
                  />
                  <p className="text-sm text-gray-600">
                    Klik untuk unggah file (PDF, XLS, DOC, IPYNB)
                  </p>
                </div>
              </label>

              {/* PREVIEW FILES */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg px-5 py-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <Image
                          src="/assets/elearning/download-1.svg"
                          alt="file"
                          width={36}
                          height={36}
                        />

                        <div className="min-w-0">
                          <p className="text-base font-semibold text-black mb-1 truncate">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getEstimatedPageCount(file)
                              ? `${getEstimatedPageCount(file)} pages | `
                              : ""}
                            {getFileFormat(file.name)} |{" "}
                            {formatFileSize(Math.round(file.size / 1024))}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFile(idx)}
                        className="shrink-0 hover:scale-110 transition"
                      >
                        <Image
                          src="/assets/elearning/delete.svg"
                          alt="hapus file"
                          width={14}
                          height={14}
                          className="cursor-pointer ml-2"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-semibold text-black">
                  Catatan Tambahan (opsional)
                </p>
                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={uploadedFiles.length === 0}
                  className={`w-2/5 text-sm font-medium py-2.5 rounded-lg transition ${
                    uploadedFiles.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}
                >
                  Kumpulkan Proyek →
                </button>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="overflow-y-auto pl-4 pr-4 space-y-6 pb-10 min-h-0">
              {/* Tanggal */}
              <div className="flex justify-between items-center border rounded-lg px-4 py-3 bg-gray-50">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Dikumpulkan pada:</p>
                  <p className="text-base font-semibold text-black">
                    {submittedAt?.toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <span
                  className={`text-sm md:text-base font-bold px-4 py-1.5 rounded-full
    ${
      reviewStatus === "pending"
        ? "bg-yellow-100 text-yellow-600"
        : reviewStatus === "passed"
          ? "bg-emerald-100 text-emerald-600"
          : "bg-red-100 text-red-600"
    }`}
                >
                  {reviewStatus === "pending"
                    ? "Belum Direview"
                    : reviewStatus === "passed"
                      ? "Lulus"
                      : "Tidak Lulus"}
                </span>
              </div>

              {reviewStatus !== "pending" && (
                <div className="border rounded-lg p-5 bg-gray-50 space-y-3">
                  <h3 className="text-base font-semibold text-emerald-600">
                    Masukan dari Mentor
                  </h3>

                  <p className="text-sm text-gray-700 leading-relaxed">
                    {mentorFeedback}
                  </p>

                  {reviewedAt && (
                    <p className="text-xs text-gray-500">
                      Dinilai pada{" "}
                      {reviewedAt.toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              )}

              {/* File Proyek */}
              <div>
                <h3 className="text-base font-bold text-black mb-3">
                  File Proyek
                </h3>

                <div className="space-y-3">
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg px-5 py-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <Image
                          src="/assets/elearning/download-1.svg"
                          alt="file"
                          width={36}
                          height={36}
                        />

                        <div className="min-w-0">
                          <p className="text-base font-semibold text-black mb-1 truncate">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getEstimatedPageCount(file)
                              ? `${getEstimatedPageCount(file)} halaman | `
                              : ""}
                            {getFileFormat(file.name)} |{" "}
                            {formatFileSize(Math.round(file.size / 1024))}
                          </p>
                        </div>
                      </div>

                      <Image
                        src="/assets/elearning/download.svg"
                        alt="download"
                        width={20}
                        height={20}
                        className="cursor-pointer ml-2"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Catatan */}
              <div>
                <h3 className="text-base font-bold text-black mb-2">
                  Catatan Tambahan
                </h3>

                <p className="text-sm text-gray-700">
                  {note.trim() !== "" ? note : "-"}
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= SUBMODULE CONTENT ================= */
type BlockContent = ContentBlock["contents"][number];

interface SubModule {
  id: number;
  title: string;
  progress?: number;
  blocks?: ContentBlock[];
}

function RenderSubModuleContent({ subModule }: { subModule: SubModule }) {
  /* ================= SORT BLOCKS ================= */
  const sortedBlocks = [...(subModule.blocks ?? [])]
    .filter((b): b is ContentBlock => typeof b.orderNumber === "number")
    .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));

  /* ================= HEADING SIZE MAP ================= */
  const headingSizeMap: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
    1: "text-4xl",
    2: "text-3xl",
    3: "text-2xl",
    4: "text-xl",
    5: "text-lg",
    6: "text-base", // sama dengan paragraf normal
  };

  const [openAccordions, setOpenAccordions] = useState<
    Record<string, number[]>
  >({});

  const [carouselIndexes, setCarouselIndexes] = useState<
    Record<string, number>
  >({});

  const sliderRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragStartX = useRef(0);
  const isDragging = useRef(false);

  const [expandedCards, setExpandedCards] = useState<Record<string, number[]>>(
    {},
  );

  const [activeTabs, setActiveTabs] = useState<Record<string, number>>({});

  const formatContent = (text?: string) => {
    if (!text) return null;

    const paragraphs = text.split("\n");

    return paragraphs.map((paragraph, pIndex) => {
      // Split bold (**text**)
      const boldSplit = paragraph.split(/(\*\*.*?\*\*)/g);

      return (
        <p
          key={pIndex}
          className="mb-4 last:mb-0 text-base text-black leading-relaxed"
        >
          {boldSplit.map((boldPart, bIndex) => {
            // BOLD
            if (boldPart.startsWith("**") && boldPart.endsWith("**")) {
              return (
                <strong key={bIndex}>{boldPart.replace(/\*\*/g, "")}</strong>
              );
            }

            // Split underline (__text__)
            const underlineSplit = boldPart.split(/(__.*?__)/g);

            return underlineSplit.map((underlinePart, uIndex) => {
              if (
                underlinePart.startsWith("__") &&
                underlinePart.endsWith("__")
              ) {
                return (
                  <u key={`${bIndex}-${uIndex}`}>
                    {underlinePart.replace(/__/g, "")}
                  </u>
                );
              }

              // Split italic (*text*)
              const italicSplit = underlinePart.split(/(\*.*?\*)/g);

              return italicSplit.map((italicPart, iIndex) => {
                if (
                  italicPart.startsWith("*") &&
                  italicPart.endsWith("*") &&
                  !italicPart.startsWith("**")
                ) {
                  return (
                    <span
                      key={`${bIndex}-${uIndex}-${iIndex}`}
                      className="skew-x-[-8deg] inline-block"
                    >
                      {italicPart.replace(/\*/g, "")}
                    </span>
                  );
                }

                return (
                  <span key={`${bIndex}-${uIndex}-${iIndex}`}>
                    {italicPart}
                  </span>
                );
              });
            });
          })}
        </p>
      );
    });
  };

  /* ================= RENDER CONTENT ================= */
  const renderContent = (content: BlockContent) => {
    switch (content.type) {
      case "heading":
        return (
          <div
            key={content.id}
            className={`${headingSizeMap[content.level]} font-bold text-black leading-snug`}
          >
            {content.text}
          </div>
        );

      case "paragraph":
        return <div key={content.id}>{formatContent(content.text)}</div>;

      case "accordion":
        return (
          <div key={content.id} className="space-y-5">
            {/* ================= TITLE & DESCRIPTION ================= */}
            <div className="pl-0 space-y-2">
              {/* TITLE ROW */}
              <div className="flex items-center gap-3">
                {/* ICON WRAPPER */}
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#F8FAFC]">
                  <Image
                    src="/assets/elearning/iconaccordion.svg"
                    alt="icon"
                    width={18}
                    height={18}
                  />
                </div>

                <h5 className={`${headingSizeMap[4]} font-semibold text-black`}>
                  {content.title}
                </h5>
              </div>

              {/* DESCRIPTION */}
              {content.description && (
                <div className="ml-[42px]">
                  {formatContent(content.description)}
                </div>
              )}
            </div>

            {/* ================= ACCORDION ITEMS (CENTER) ================= */}
            <div className="w-3/4 mx-auto space-y-4">
              {content.items.map((item, index) => {
                const openIndexes = openAccordions[content.id] ?? [];
                const isOpen = openIndexes.includes(index);

                return (
                  <div key={index} className="rounded-xl overflow-hidden">
                    {/* HEADER */}
                    <button
                      onClick={() =>
                        setOpenAccordions((prev) => {
                          const current = prev[content.id] ?? [];

                          return {
                            ...prev,
                            [content.id]: isOpen
                              ? current.filter((i) => i !== index)
                              : [...current, index],
                          };
                        })
                      }
                      className="w-full flex justify-between items-center px-5 py-4 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                    >
                      <span className="font-bold text-lg text-black">
                        {item.title}
                      </span>

                      <div className="p-2 rounded-full border border-emerald-500">
                        <ChevronDown
                          size={18}
                          className={`text-emerald-500 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </div>
                    </button>

                    {/* CONTENT */}
                    {isOpen && (
                      <div className="px-5 py-5 text-base text-black leading-relaxed whitespace-pre-line bg-gray-50">
                        {formatContent(item.content)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "highlight":
        return (
          <div key={content.id} className="w-full">
            <div className="w-[75%] mx-auto rounded-md overflow-hidden flex bg-[#F8FAFC]">
              {/* Left Dark Strip */}
              <div className="w-4 bg-[#D1D5DC]" />

              {/* Content */}
              <div className="px-6 py-6 text-md">
                {formatContent(content.text)}
              </div>
            </div>
          </div>
        );

      case "carousel": {
        const cardsPerSlide = content.cardsPerSlide ?? 2;
        const totalItems = content.items.length;

        const currentIndex = carouselIndexes[content.id] ?? 0;
        const maxIndex = Math.max(totalItems - cardsPerSlide, 0);

        const goNext = () => {
          if (currentIndex >= maxIndex) return;
          setCarouselIndexes((prev) => ({
            ...prev,
            [content.id]: Math.min(currentIndex + 1, maxIndex),
          }));
        };

        const goPrev = () => {
          if (currentIndex <= 0) return;
          setCarouselIndexes((prev) => ({
            ...prev,
            [content.id]: Math.max(currentIndex - 1, 0),
          }));
        };

        const translatePercentage = (100 / cardsPerSlide) * currentIndex;

        const isPrevDisabled = currentIndex === 0;
        const isNextDisabled = currentIndex === maxIndex;

        const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
          isDragging.current = true;
          dragStartX.current =
            "touches" in e ? e.touches[0].clientX : e.clientX;
        };

        const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
          if (!isDragging.current) return;

          const endX =
            "changedTouches" in e
              ? e.changedTouches[0].clientX
              : (e as React.MouseEvent).clientX;

          const diff = dragStartX.current - endX;

          const threshold = 50; // minimal geser sebelum pindah slide

          if (diff > threshold && currentIndex < maxIndex) {
            goNext();
          } else if (diff < -threshold && currentIndex > 0) {
            goPrev();
          }

          isDragging.current = false;
        };

        return (
          <div key={content.id} className="space-y-6">
            {/* ================= TITLE & DESCRIPTION ================= */}
            <div className="pl-0 space-y-2">
              {/* TITLE ROW */}
              <div className="flex items-center gap-3">
                {/* ICON WRAPPER */}
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#F8FAFC]">
                  <Image
                    src="/assets/elearning/iconaccordion.svg"
                    alt="icon"
                    width={18}
                    height={18}
                  />
                </div>

                <h5 className={`${headingSizeMap[4]} font-semibold text-black`}>
                  {content.title}
                </h5>
              </div>

              {/* DESCRIPTION */}
              {content.description && (
                <div className="ml-[42px]">
                  {formatContent(content.description)}
                </div>
              )}
            </div>

            {/* ================= CAROUSEL ================= */}
            <div className="relative w-[70%] mx-auto">
              {/* LEFT ARROW */}
              <button
                onClick={goPrev}
                disabled={isPrevDisabled}
                className={`
            absolute -left-16 top-1/2 -translate-y-1/2
            w-12 h-12 flex items-center justify-center
            bg-white border border-emerald-500
            text-2xl font-bold text-emerald-600
            rounded-lg shadow-md
            transition
            ${
              isPrevDisabled
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-emerald-50"
            }
          `}
              >
                ‹
              </button>

              {/* RIGHT ARROW */}
              <button
                onClick={goNext}
                disabled={isNextDisabled}
                className={`
            absolute -right-16 top-1/2 -translate-y-1/2
            w-12 h-12 flex items-center justify-center
            bg-white border border-emerald-500
            text-2xl font-bold text-emerald-600
            rounded-lg shadow-md
            transition
            ${
              isNextDisabled
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-emerald-50"
            }
          `}
              >
                ›
              </button>

              {/* SLIDER CONTAINER */}
              <div
                className="overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseDown={handleDragStart}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchEnd={handleDragEnd}
              >
                <div
                  className="flex items-stretch transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${translatePercentage}%)`,
                  }}
                >
                  {content.items.map((item, index) => (
                    <div
                      key={index}
                      className="px-3 flex-shrink-0 flex"
                      style={{ width: `${100 / cardsPerSlide}%` }}
                    >
                      <div
                        className="
    group
    flex flex-col
    h-full
    w-full
    rounded-xl
    overflow-hidden
    border border-gray-200
    shadow-sm
    transition-all duration-300 ease-out
    hover:shadow-xl
    hover:-translate-y-2
    hover:border-emerald-300
    hover:scale-[1.01]
  "
                      >
                        {/* ===== TITLE HEADER ===== */}
                        <div
                          className="py-4 px-4 text-center"
                          style={{ backgroundColor: "#F8FAFC" }}
                        >
                          <h6 className="text-xl font-bold text-emerald-600 transition-colors duration-300 group-hover:text-emerald-700">
                            {item.title}
                          </h6>
                        </div>

                        {/* ===== CONTENT AREA ===== */}
                        <div
                          className="p-6 text-center border-t border-gray-200"
                          style={{ backgroundColor: "#FFFFFF" }}
                        >
                          {item.image && (
                            <div className="mb-4">
                              <Image
                                src={item.image}
                                alt={item.title}
                                width={500}
                                height={300}
                                className="w-full h-auto rounded-md object-cover"
                              />
                            </div>
                          )}

                          {item.content && (
                            <div>{formatContent(item.content)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case "content_card": {
        const cardsPerSlide = 3;
        const totalItems = content.items.length;

        const currentIndex = carouselIndexes[content.id] ?? 0;
        const maxIndex = Math.max(totalItems - cardsPerSlide, 0);

        const goNext = () => {
          if (currentIndex >= maxIndex) return;
          setCarouselIndexes((prev) => ({
            ...prev,
            [content.id]: Math.min(currentIndex + 1, maxIndex),
          }));
        };

        const goPrev = () => {
          if (currentIndex <= 0) return;
          setCarouselIndexes((prev) => ({
            ...prev,
            [content.id]: Math.max(currentIndex - 1, 0),
          }));
        };

        const translatePercentage = (100 / cardsPerSlide) * currentIndex;
        const expandedIndexes = expandedCards[content.id] ?? [];

        const isSimpleMode = content.disableExpandableContent === true;

        const dataIcons = [
          Database,
          BarChart3,
          LineChart,
          PieChart,
          Activity,
          FileText,
          FolderKanban,
          ClipboardList,
          TrendingUp,
          Layers,
        ];

        return (
          <div key={content.id} className="space-y-8">
            {/* ================= TITLE & DESCRIPTION ================= */}
            <div className="pl-0 space-y-2">
              <div className="flex items-center gap-3">
                {/* Wrapper Icon - Disederhanakan karena isinya sama saja */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#F8FAFC]">
                  <Image
                    src={
                      isSimpleMode
                        ? "/assets/elearning/iconcardcontent2.svg"
                        : "/assets/elearning/iconcarousel.svg"
                    }
                    alt="icon"
                    width={16}
                    height={16}
                    className="mt-1"
                  />
                </div>

                {/* Heading dengan perbaikan backticks */}
                <h5 className={`${headingSizeMap[4]} font-semibold text-black`}>
                  {content.title}
                </h5>
              </div>

              {content.description && (
                <>
                  <div className="ml-[42px]">{content.description}</div>

                  {!isSimpleMode && (
                    <p className="ml-[42px] text-sm text-gray-500 mt-1 tracking-wide">
                      <span className="skew-x-[-8deg] inline-block">
                        (Arahkan kursor untuk melihat detail)
                      </span>
                    </p>
                  )}
                </>
              )}
            </div>

            {/* ================= CARD CONTAINER ================= */}
            <div className="relative w-[80%] mx-auto">
              {totalItems > 3 && (
                <>
                  {/* PREVIOUS */}
                  <button
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    className={`
        absolute -left-16 top-1/2 -translate-y-1/2
        w-14 h-14
        flex items-center justify-center
        rounded-full
        bg-white shadow-md
        transition-all duration-300
        ${
          currentIndex === 0
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-emerald-50 hover:scale-110"
        }
      `}
                  >
                    <ChevronLeft
                      size={28}
                      className={`
          ${currentIndex === 0 ? "text-gray-400" : "text-emerald-600"}
        `}
                    />
                  </button>

                  {/* NEXT */}
                  <button
                    onClick={goNext}
                    disabled={currentIndex === maxIndex}
                    className={`
        absolute -right-16 top-1/2 -translate-y-1/2
        w-14 h-14
        flex items-center justify-center
        rounded-full
        bg-white shadow-md
        transition-all duration-300
        ${
          currentIndex === maxIndex
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-emerald-50 hover:scale-110"
        }
      `}
                  >
                    <ChevronRight
                      size={28}
                      className={`
          ${currentIndex === maxIndex ? "text-gray-400" : "text-emerald-600"}
        `}
                    />
                  </button>
                </>
              )}

              <div className="overflow-hidden">
                <div
                  className="
    flex transition-transform duration-500 ease-in-out
  "
                  style={{
                    transform: `translateX(-${translatePercentage}%)`,
                  }}
                >
                  {content.items.map((item, index) => {
                    const isExpanded = expandedIndexes.includes(index);

                    return (
                      <div
                        key={index}
                        className="px-4 flex-shrink-0"
                        style={{ width: `${100 / cardsPerSlide}%` }}
                      >
                        {/* ================= SIMPLE MODE (TRUE) ================= */}
                        {isSimpleMode ? (
                          <div
                            className="
      rounded-2xl
      bg-[#F8FAFC]
      py-8
      px-5
      text-center
      shadow-sm
      hover:shadow-md
      transition-all duration-300
      hover:-translate-y-1
      h-full
      flex flex-col
    "
                          >
                            {/* ICON */}
                            <div className="mb-6 flex justify-center">
                              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                                {(() => {
                                  const RandomIcon =
                                    dataIcons[index % dataIcons.length];
                                  return (
                                    <RandomIcon
                                      size={26}
                                      className="text-emerald-600"
                                      strokeWidth={2}
                                    />
                                  );
                                })()}
                              </div>
                            </div>

                            {/* TITLE */}
                            <h6 className="text-2xl font-semibold text-black mb-4">
                              {item.title}
                            </h6>

                            {/* DESCRIPTION */}
                            <div className="flex-grow">
                              {formatContent(item.content)}
                            </div>
                          </div>
                        ) : (
                          /* ================= EXPANDABLE MODE (FALSE) ================= */
                          <div
                            className="
    rounded-2xl
    shadow-sm
    hover:shadow-md
    transition-all duration-300
    overflow-hidden
    flex flex-col
    bg-white
  "
                          >
                            {/* TOP WHITE */}
                            <div className="p-8 text-center bg-white">
                              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F8FAFC] flex items-center justify-center">
                                {(() => {
                                  const RandomIcon =
                                    dataIcons[index % dataIcons.length];
                                  return (
                                    <RandomIcon
                                      size={32}
                                      className="text-emerald-600"
                                      strokeWidth={2}
                                    />
                                  );
                                })()}
                              </div>

                              <h6 className="text-2xl font-semibold text-black mb-4">
                                {item.title}
                              </h6>

                              <div className="flex-grow">
                                {formatContent(item.content)}
                              </div>
                            </div>

                            {/* BOTTOM GREY */}
                            {item.expandableContent && (
                              <div className="bg-[#F8FAFC] w-full mt-auto">
                                <div
                                  className={`
          overflow-hidden
          transition-all duration-500
          ${
            isExpanded
              ? "max-h-96 opacity-100 py-6 px-8"
              : "max-h-0 opacity-0 px-8"
          }
        `}
                                >
                                  <div className="flex justify-center">
                                    <div className="text-center">
                                      {formatContent(item.expandableContent)}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() =>
                                    setExpandedCards((prev) => {
                                      const current = prev[content.id] ?? [];

                                      return {
                                        ...prev,
                                        [content.id]: isExpanded
                                          ? current.filter((i) => i !== index)
                                          : [...current, index],
                                      };
                                    })
                                  }
                                  className="
          w-full
          flex items-center justify-center gap-1.5
          py-4
          text-sm
          text-gray-600
          hover:text-black
          transition-all duration-300
        "
                                >
                                  <span className="skew-x-[-8deg] inline-block">
                                    {isExpanded
                                      ? "Lihat lebih sedikit"
                                      : "Lihat lebih banyak"}
                                  </span>

                                  {isExpanded ? (
                                    <ChevronUp size={16} />
                                  ) : (
                                    <ChevronDown size={16} />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case "tab_navigation": {
        const activeIndex = activeTabs[content.id] ?? 0;

        return (
          <div key={content.id} className="space-y-6">
            {/* ================= TITLE & DESCRIPTION ================= */}
            <div className="pl-0 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#F8FAFC]">
                  <Image
                    src="/assets/elearning/iconcarousel.svg"
                    alt="icon"
                    width={16}
                    height={16}
                    className="mt-1"
                  />
                </div>

                <h5 className={`${headingSizeMap[4]} font-semibold text-black`}>
                  {content.title}
                </h5>
              </div>

              {content.description && (
                <div className="ml-[42px]">
                  {formatContent(content.description)}
                </div>
              )}
            </div>

            {/* ================= TAB WRAPPER (CENTER) ================= */}
            <div className="w-[85%] mx-auto">
              {/* ================= TAB HEADER ================= */}
              <div className="flex w-full">
                {content.tabs.map((tab, index) => {
                  const isActive = activeIndex === index;

                  return (
                    <button
                      key={index}
                      onClick={() =>
                        setActiveTabs((prev) => ({
                          ...prev,
                          [content.id]: index,
                        }))
                      }
                      className={`
            flex-1 py-5 text-base font-semibold tracking-wide
            transition-all duration-300 ease-in-out
            ${
              isActive
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }
            hover:shadow-md
            hover:brightness-105
            ${index === 0 ? "rounded-tl-2xl" : ""}
            ${index === content.tabs.length - 1 ? "rounded-tr-2xl" : ""}
          `}
                    >
                      {tab.title}
                    </button>
                  );
                })}
              </div>

              {/* ================= CONTENT AREA ================= */}
              <div
                className="
      bg-white
      rounded-b-2xl
      p-8
      text-base
      text-black
      leading-relaxed
      shadow-sm
      transition-all duration-300 ease-in-out
      hover:shadow-md
      hover:ring-1 hover:ring-emerald-100
    "
              >
                {formatContent(content.tabs[activeIndex]?.content)}
              </div>
            </div>
          </div>
        );
      }

      case "summary":
        return (
          <div key={content.id} className="w-full">
            <div className="w-[85%] mx-auto bg-[#F8FAFC] rounded-2xl p-10 shadow-sm">
              {/* TITLE */}
              <h4 className="text-5xl font-bold mb-8">
                <span className="text-emerald-600">Ringkasan</span>
              </h4>

              {/* LIST COMMENTS */}
              <ul className="space-y-4 text-lg text-black leading-relaxed list-disc pl-6">
                {content.comments.map((comment, index) => (
                  <li key={index}>{formatContent(comment)}</li>
                ))}
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* ================= RENDER IMAGE / VIDEO ================= */
  const renderImageVideo = (item: AdditionalContent) => {
    if (item.type !== "image_video") return null;

    const data = item.content as ImageVideoContent;
    const url = data.url.toLowerCase();
    const cleanUrl = url.split("?")[0];

    /* ================= DETECTION LIST ================= */

    const videoExtensions = [
      ".mp4",
      ".webm",
      ".ogg",
      ".mov",
      ".m4v",
      ".avi",
      ".mkv",
    ];

    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",
      ".avif",
      ".svg",
    ];

    const videoPlatforms = [
      "youtube.com",
      "youtu.be",
      "vimeo.com",
      "dailymotion.com",
    ];

    const imagePlatforms = [
      "images.unsplash.com",
      "unsplash.com",
      "res.cloudinary.com",
      "images.pexels.com",
      "pexels.com",
      "cdn.pixabay.com",
      "pixabay.com",
    ];

    const isVideo =
      videoExtensions.some((ext) => cleanUrl.endsWith(ext)) ||
      videoPlatforms.some((platform) => url.includes(platform));

    const isImage =
      imageExtensions.some((ext) => cleanUrl.endsWith(ext)) ||
      imagePlatforms.some((platform) => url.includes(platform));

    /* ================= YOUTUBE EMBED FIX ================= */

    const getYoutubeEmbedUrl = (url: string) => {
      if (url.includes("youtu.be")) {
        const videoId = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (url.includes("watch?v=")) {
        const videoId = url.split("watch?v=")[1]?.split("&")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }

      return url;
    };

    /* ================= DYNAMIC WIDTH ================= */
    const maxWidthClass = isVideo ? "max-w-2xl" : "max-w-xl";

    return (
      <div className="w-full flex justify-center">
        <div className={`w-full ${maxWidthClass}`}>
          {isVideo ? (
            <div className="w-full aspect-video rounded-xl overflow-hidden shadow-md">
              {videoExtensions.some((ext) => url.endsWith(ext)) ? (
                <video
                  src={data.url}
                  controls
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <iframe
                  src={getYoutubeEmbedUrl(data.url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          ) : isImage ? (
            <img
              src={data.url}
              alt="additional"
              className="w-full max-h-[400px] object-contain rounded-xl shadow-md"
            />
          ) : (
            <p className="text-center text-red-500">Unsupported media format</p>
          )}

          {data.caption && (
            <p className="text-center text-base font-medium text-gray-600 mt-4">
              {data.caption}
            </p>
          )}
        </div>
      </div>
    );
  };

  const [mcAnswers, setMcAnswers] = useState<Record<string, string>>({});
  const [mcSubmitted, setMcSubmitted] = useState<Record<string, boolean>>({});

  const renderMultipleChoice = (item: AdditionalContent) => {
    if (item.type !== "multiple_choice") return null;

    const data = item.content as MultipleChoiceContent;
    const isSubmitted = mcSubmitted[data.id] ?? false;

    const handleSelect = (optionId: string, value: "true" | "false") => {
      if (isSubmitted) return;

      setMcAnswers((prev) => ({
        ...prev,
        [`${data.id}-${optionId}`]: value,
      }));
    };

    const handleSubmit = () => {
      setMcSubmitted((prev) => ({
        ...prev,
        [data.id]: true,
      }));
    };

    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-3xl bg-white border-2 border-emerald-600 rounded-xl p-8">
          {/* QUESTION */}
          <h3 className="text-2xl font-bold text-black text-center">
            {data.question}
          </h3>

          {/* DESCRIPTION */}
          {data.description && (
            <p className="text-center text-gray-600 mt-3">{data.description}</p>
          )}

          {/* TABLE */}
          <div className="mt-8">
            {/* HEADER */}
            <div className="grid grid-cols-[60px_1fr_80px_80px] font-semibold text-center border-b pb-3">
              <div>No</div>
              <div className="text-left">Pernyataan</div>
              <div>Benar</div>
              <div>Salah</div>
            </div>

            <div className="divide-y">
              {data.options.map((option, index) => {
                const userValue = mcAnswers[`${data.id}-${option.id}`];

                const isCorrect = data.correctAnswers.includes(option.id);
                const correctValue = isCorrect ? "true" : "false";

                const isWrong =
                  isSubmitted && userValue && userValue !== correctValue;

                const isRight = isSubmitted && userValue === correctValue;

                return (
                  <div
                    key={option.id}
                    className={`grid grid-cols-[60px_1fr_80px_80px] items-center py-4 text-center transition
                    ${isWrong ? "bg-red-50" : ""}
                    ${isRight ? "bg-emerald-50" : ""}
                  `}
                  >
                    {/* NOMOR */}
                    <div className="font-medium">{index + 1}</div>

                    {/* PERNYATAAN */}
                    <div
                      className={`text-left pr-4 transition ${
                        isWrong ? "text-red-600 font-medium" : ""
                      }`}
                    >
                      {option.text}
                    </div>

                    {/* TRUE */}
                    <div>
                      <input
                        type="radio"
                        name={`${data.id}-${option.id}`}
                        checked={userValue === "true"}
                        onChange={() => handleSelect(option.id, "true")}
                        className="w-5 h-5 accent-emerald-600"
                      />
                    </div>

                    {/* FALSE */}
                    <div>
                      <input
                        type="radio"
                        name={`${data.id}-${option.id}`}
                        checked={userValue === "false"}
                        onChange={() => handleSelect(option.id, "false")}
                        className="w-5 h-5 accent-emerald-600"
                      />
                    </div>

                    {/* FEEDBACK */}
                    {isSubmitted && (
                      <div className="col-span-4 text-sm mt-1 text-left pl-[60px]">
                        {isRight && (
                          <span className="flex items-center gap-2 text-emerald-600 font-medium">
                            <Check size={16} />
                            Jawaban benar
                          </span>
                        )}
                        {isWrong && (
                          <span className="flex items-center gap-2 text-red-600 font-medium">
                            <X size={16} />
                            Jawaban salah
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          {!isSubmitted && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
              >
                Submit Jawaban
              </button>
            </div>
          )}

          {/* EXPLANATION */}
          {isSubmitted && data.explanation && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 p-6 rounded-lg">
              <h4 className="font-semibold mb-2 text-emerald-700">
                Penjelasan:
              </h4>
              <div>{formatContent(data.explanation)}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const [matchingAnswers, setMatchingAnswers] = useState<
    Record<string, Record<string, string>>
  >({});
  // { [matchingId]: { [leftId]: rightId } }

  const [matchingSubmitted, setMatchingSubmitted] = useState<
    Record<string, boolean>
  >({});

  const [recentlyCancelled, setRecentlyCancelled] = useState<
    Record<string, string | null>
  >({});

  const renderMatching = (item: AdditionalContent) => {
    if (item.type !== "matching") return null;

    const data = item.content as MatchingContent;
    const isSubmitted = matchingSubmitted[data.id] ?? false;
    const answers = matchingAnswers[data.id] ?? {};

    // 🔥 Semua rightId yang sudah dipakai
    const usedRightIds = Object.values(answers);

    const handleDrop = (leftId: string, rightId: string) => {
      if (isSubmitted) return;

      // 🔥 Kalau rightId sudah dipakai di tempat lain → tolak
      const alreadyUsed = usedRightIds.includes(rightId);
      if (alreadyUsed && answers[leftId] !== rightId) return;

      setMatchingAnswers((prev) => ({
        ...prev,
        [data.id]: {
          ...prev[data.id],
          [leftId]: rightId,
        },
      }));
    };

    const handleSubmit = () => {
      setMatchingSubmitted((prev) => ({
        ...prev,
        [data.id]: true,
      }));
    };

    const isCorrectPair = (leftId: string, rightId: string) => {
      return data.correctPairs.some(
        (pair) => pair.leftId === leftId && pair.rightId === rightId,
      );
    };

    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-4xl bg-white border-2 border-emerald-600 rounded-xl p-8">
          {/* QUESTION */}
          <h3 className="text-2xl font-bold text-black text-center">
            {data.question}
          </h3>

          {data.description && (
            <p className="text-center text-gray-600 mt-3">{data.description}</p>
          )}

          {/* INSTRUCTION */}
          <p className="text-center text-sm text-gray-500 mt-4 italic">
            (Seret dan lepaskan card ke area kosong yang tersedia)
          </p>

          {/* ============================= */}
          {/* 🔥 PILIHAN JAWABAN DI ATAS */}
          {/* ============================= */}
          {!isSubmitted && (
            <div className="mt-10">
              <h4 className="text-center font-semibold mb-4">
                Pilihan Jawaban
              </h4>

              <div className="flex flex-wrap gap-4 justify-center">
                {data.rightItems.map((right) => {
                  const isUsed = usedRightIds.includes(right.id);

                  return (
                    <div
                      key={right.id}
                      draggable={!isUsed}
                      onDragStart={(e) => {
                        if (isUsed) return;
                        e.dataTransfer.setData("text/plain", right.id);
                      }}
                      className={`
                      px-5 py-2 rounded-lg shadow-sm border transition
                      ${
                        isUsed
                          ? "bg-red-50 border-red-400 text-red-600 cursor-not-allowed opacity-70"
                          : "bg-white border-emerald-500 hover:bg-emerald-50 cursor-grab active:cursor-grabbing"
                      }
                    `}
                    >
                      {right.text}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================= */}
          {/* MATCH AREA CENTERED */}
          {/* ============================= */}
          <div className="mt-14 flex flex-col items-center space-y-8">
            {data.leftItems.map((left) => {
              const selectedRightId = answers[left.id];
              const selectedRight = data.rightItems.find(
                (r) => r.id === selectedRightId,
              );

              const isCorrect =
                isSubmitted &&
                selectedRightId &&
                isCorrectPair(left.id, selectedRightId);

              const isWrong =
                isSubmitted &&
                selectedRightId &&
                !isCorrectPair(left.id, selectedRightId);

              return (
                <div
                  key={left.id}
                  className="flex items-center justify-center gap-8 w-full max-w-3xl"
                >
                  {/* LEFT */}
                  <div className="w-1/3 bg-gray-100 px-4 py-3 rounded-lg font-medium text-center">
                    {left.text}
                  </div>

                  {/* 🔥 ARROW LEBIH BESAR & TEBAL */}
                  <ArrowRight
                    className="text-emerald-700"
                    size={40}
                    strokeWidth={3}
                  />

                  {/* DROP ZONE */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const rightId = e.dataTransfer.getData("text/plain");
                      handleDrop(left.id, rightId);
                    }}
                    className={`
                    w-1/3 min-h-[52px] flex items-center justify-center
                    border-2 border-dashed rounded-lg px-4 py-3 transition text-center
                    ${isCorrect ? "border-emerald-500 bg-emerald-50" : ""}
                    ${isWrong ? "border-red-500 bg-red-50" : ""}
                    ${!selectedRight ? "border-gray-300 bg-gray-50" : ""}
                  `}
                  >
                    {selectedRight ? (
                      <div
                        title={
                          recentlyCancelled[data.id] === left.id
                            ? "Cancelled Answer"
                            : "Undrop Answer"
                        }
                        onClick={() => {
                          if (isSubmitted) return;

                          // 🔥 remove answer
                          setMatchingAnswers((prev) => {
                            const newAnswers = { ...prev[data.id] };
                            delete newAnswers[left.id];

                            return {
                              ...prev,
                              [data.id]: newAnswers,
                            };
                          });

                          // 🔥 trigger cancelled tooltip
                          setRecentlyCancelled((prev) => ({
                            ...prev,
                            [data.id]: left.id,
                          }));

                          // reset tooltip back setelah 1.5 detik
                          setTimeout(() => {
                            setRecentlyCancelled((prev) => ({
                              ...prev,
                              [data.id]: null,
                            }));
                          }, 1500);
                        }}
                        className={`
      font-medium text-red-600 cursor-pointer
      hover:opacity-80 transition
    `}
                      >
                        {selectedRight.text}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        Drop di sini
                      </span>
                    )}
                  </div>

                  {/* RESULT ICON */}
                  {isSubmitted && selectedRightId && (
                    <div>
                      {isCorrect ? (
                        <Check className="text-emerald-600" />
                      ) : (
                        <X className="text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* SUBMIT */}
          {!isSubmitted && (
            <div className="flex justify-center mt-12">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
              >
                Submit Jawaban
              </button>
            </div>
          )}

          {/* EXPLANATION */}
          {isSubmitted && data.explanation && (
            <div className="mt-8 bg-emerald-50 border border-emerald-200 p-6 rounded-lg">
              <h4 className="font-semibold mb-2 text-emerald-700">
                Penjelasan:
              </h4>
              <div>{formatContent(data.explanation)}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const [codeOutputs, setCodeOutputs] = useState<Record<string, string>>({});
  const [codeRunCount, setCodeRunCount] = useState<Record<string, number>>({});

  const renderInteractiveCode = (item: AdditionalContent) => {
    if (item.type !== "interactive_code") return null;

    const data = item.content as InteractiveCodeContent;

    const output = codeOutputs[data.id];
    const runCount = codeRunCount[data.id] ?? 0;

    const handleRunCode = () => {
      // setiap run akan overwrite output (bisa berkali-kali)
      setCodeOutputs((prev) => ({
        ...prev,
        [data.id]: data.expectedResult,
      }));

      setCodeRunCount((prev) => ({
        ...prev,
        [data.id]: runCount + 1,
      }));
    };

    const normalizeCode = (text: string) => {
      return text.replace(/\\n/g, "\n");
    };

    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-3xl">
          {/* ================= KETERANGAN ================= */}
          <p className="ml-1 mb-2 text-base font-medium text-gray-700">
            Berikut adalah contoh Code-nya:
          </p>

          {/* ================= CODE CONTAINER ================= */}
          <div className="bg-[#0F172A] rounded-xl overflow-hidden shadow-xl">
            {/* ================= HEADER ================= */}
            <div className="flex items-center justify-between px-5 py-3 bg-[#1E293B] border-b border-slate-700">
              <span className="text-sm font-medium text-emerald-400 uppercase tracking-wide">
                {data.language}
              </span>

              <button
                onClick={handleRunCode}
                className="px-4 py-1.5 text-sm font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
              >
                Run Code
              </button>
            </div>

            {/* ================= CODE BLOCK ================= */}
            <pre className="p-6 text-sm text-slate-200 font-mono whitespace-pre-wrap overflow-x-auto">
              {normalizeCode(data.initialCode)}
            </pre>

            {/* ================= OUTPUT ================= */}
            {output && (
              <div className="border-t border-slate-700 bg-black px-6 py-4">
                <p className="text-xs text-gray-400 mb-2">Output:</p>
                <pre className="text-emerald-400 text-sm font-mono whitespace-pre-wrap">
                  {normalizeCode(output)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const isInteractiveType = (type: AdditionalContentType) =>
    type === "multiple_choice" || type === "matching";

  return (
    <article className="w-full pb-7">
      {/* Antar Block → Lebih Jauh */}
      <div className="space-y-10">
        {sortedBlocks.map((block) => {
          const sortedContents = [...(block.contents ?? [])]
            .filter((c) => typeof c.orderNumber === "number")
            .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));

          const sortedAdditional =
            block.additionalContents
              ?.filter((a) => typeof a.orderNumber === "number")
              .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)) ??
            [];

          const beforeItems = sortedAdditional.filter(
            (a) => a.position === "before",
          );

          const afterItems = sortedAdditional.filter(
            (a) => a.position === "after",
          );

          const inlineItems = sortedAdditional.filter(
            (a) => a.position === "inline",
          );

          const totalContents = sortedContents.length;

          // menentukan index inline
          const inlineIndex =
            totalContents % 2 === 0
              ? totalContents / 2
              : Math.floor(totalContents / 2);

          return (
            <div key={block.id}>
              {/* ================= BEFORE (1x per block) ================= */}
              {beforeItems.map((item) => (
                <div
                  key={item.id}
                  className={
                    isInteractiveType(item.type) ? "mb-12 mt-10" : "mb-4"
                  }
                >
                  {item.type === "image_video"
                    ? renderImageVideo(item)
                    : item.type === "multiple_choice"
                      ? renderMultipleChoice(item)
                      : item.type === "matching"
                        ? renderMatching(item)
                        : item.type === "interactive_code"
                          ? renderInteractiveCode(item)
                          : null}
                </div>
              ))}

              {/* ================= CONTENT LOOP ================= */}
              {sortedContents.map((content, index) => {
                const prev = sortedContents[index - 1];

                let marginTop = "";

                if (index === 0) marginTop = "";
                else if (
                  prev?.type === "paragraph" &&
                  content.type === "paragraph"
                )
                  marginTop = "mt-3";
                else if (prev?.type === "heading") marginTop = "mt-4";
                else marginTop = "mt-7";

                return (
                  <div key={content.id} className={marginTop}>
                    {/* INLINE (muncul 1x di tengah block) */}
                    {inlineItems.length > 0 && index === inlineIndex && (
                      <div
                        className={
                          inlineItems.some((i) => isInteractiveType(i.type))
                            ? "my-12"
                            : "mb-5"
                        }
                      >
                        {inlineItems.map((item) => (
                          <div key={item.id}>
                            {item.type === "image_video"
                              ? renderImageVideo(item)
                              : item.type === "multiple_choice"
                                ? renderMultipleChoice(item)
                                : item.type === "matching"
                                  ? renderMatching(item)
                                  : item.type === "interactive_code"
                                    ? renderInteractiveCode(item)
                                    : null}
                          </div>
                        ))}
                      </div>
                    )}

                    {renderContent(content)}
                  </div>
                );
              })}

              {/* ================= AFTER (1x per block) ================= */}
              {afterItems.map((item) => (
                <div
                  key={item.id}
                  className={
                    isInteractiveType(item.type) ? "mt-12 mb-10" : "mt-5"
                  }
                >
                  {item.type === "image_video"
                    ? renderImageVideo(item)
                    : item.type === "multiple_choice"
                      ? renderMultipleChoice(item)
                      : item.type === "matching"
                        ? renderMatching(item)
                        : item.type === "interactive_code"
                          ? renderInteractiveCode(item)
                          : null}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </article>
  );
}

/* ================= MAIN EXPORT ================= */

export default function SubchapterContent({
  mode,
  onQuizSubmitScore,
  onQuizReset,
  onAssignmentScore,
}: ModeProps) {
  if (mode.type === "quiz")
    return (
      <QuizRenderer
        quiz={mode.data}
        onSubmitScore={onQuizSubmitScore}
        onReset={onQuizReset}
      />
    );

  if (mode.type === "assignment")
    return (
      <AssignmentRenderer a={mode.data} onAssignmentScore={onAssignmentScore} />
    );

  return <RenderSubModuleContent subModule={mode.data} />;
}
