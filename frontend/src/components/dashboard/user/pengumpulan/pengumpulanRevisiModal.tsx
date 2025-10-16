"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";

interface ReviewData {
  briefScore?: string;
  technicalScore?: string;
  creativityScore?: string;
  completenessScore?: string;
  mentorFeedback?: string;
  mentorSuggestion?: string;
  isRevisedRequired?: boolean;
  revisionDeadline?: string;
}

interface PengumpulanRevisiModalProps {
  submissionId: string;
  bootcampTitle: string;
  schedule: string;
  projectTitle: string;
  reviewData?: ReviewData;
  defaultTitle?: string;
  defaultLink?: string;
  withTrigger?: boolean;
}

export default function PengumpulanRevisiModal({
  submissionId,
  bootcampTitle,
  schedule,
  projectTitle,
  reviewData,
  defaultTitle = "",
  defaultLink = "",
  withTrigger = true,
}: PengumpulanRevisiModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(defaultTitle);
  const [projectLink, setProjectLink] = useState(defaultLink);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [successOpen, setSuccessOpen] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (open) setStep(1);
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFiles(e.target.files);

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleRedirectNow = () => {
    setSuccessOpen(false);
    setOpen(false);
    resetForm();
    // misal redirect ke dashboard
    window.location.href = "/dashboard/user/pengumpulan";
  };

  const handleSubmit = async () => {
    setError("");

    if (!title && !files && !projectLink) {
      setError("Harus mengisi setidaknya satu field (judul, file, atau link)");
      toast.error(
        "Harus mengisi setidaknya satu field (judul, file, atau link)"
      );
      return;
    }

    const formData = new FormData();
    if (title) formData.append("title", title);
    if (projectLink) formData.append("projectLink", projectLink);
    if (files)
      Array.from(files).forEach((f) => formData.append("submissionFile", f));

    try {
      setLoading(true);
      const res = await axios.put(
        `${baseUrl}/api/project/menteeSubmitProjects/${submissionId}/revise`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // buka modal success
      setSuccessOpen(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal mengirim revisi");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = (idx: number) => {
    if (!files) return;
    const filesArray = Array.from(files);
    filesArray.splice(idx, 1);

    // Convert back to FileList using DataTransfer
    const dataTransfer = new DataTransfer();
    filesArray.forEach((file) => dataTransfer.items.add(file));
    setFiles(dataTransfer.files);
  };

  const resetForm = () => {
    setTitle(defaultTitle);
    setProjectLink(defaultLink);
    setFiles(null);
    setStep(1);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {withTrigger && (
          <DialogTrigger asChild>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white w-full"
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
            >
              Lihat Project <span className="text-white">- </span>
              <span className="text-red-500 font-semibold">REVISI </span>
              <span className="text-white">- </span>
              <span className="text-red-500 font-semibold">Sudah Direview</span>
            </Button>
          </DialogTrigger>
        )}

        <DialogContent
          className="sm:max-w-lg"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {step === 1
                ? "Penilaian Proyek oleh Mentor"
                : step === 2
                ? "Penilaian Proyek oleh Mentor"
                : step === 3
                ? "Upload Revisi Proyek"
                : "Revisi Berhasil"}
            </DialogTitle>
            <DialogDescription>
              {bootcampTitle}: {schedule}
            </DialogDescription>
          </DialogHeader>

          {/* ---------- STEP 1 : PENILAIAN ---------- */}
          {step === 1 && (
            <div className="space-y-6 mt-2">
              <h3 className="text-emerald-600 font-semibold">
                Section 1 – Penilaian Proyek
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
                  },
                  {
                    label: "Kualitas Teknis (Coding / Desain / Analisis)",
                    options: [
                      "Sangat Baik",
                      "Cukup Baik",
                      "Kurang Baik",
                      "Sangat Buruk",
                    ],
                    value: reviewData?.technicalScore,
                  },
                  {
                    label: "Kreativitas dan Inisiatif",
                    options: [
                      "Sangat Baik",
                      "Cukup Baik",
                      "Kurang Baik",
                      "Sangat Buruk",
                    ],
                    value: reviewData?.creativityScore,
                  },
                  {
                    label: "Kelengkapan Proyek",
                    options: ["Lengkap", "Belum Lengkap", "Perlu Revisi"],
                    value: reviewData?.completenessScore,
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="font-bold text-sm mb-2">{item.label}</p>
                    <div className="space-y-1 text-sm">
                      {item.options.map((opt) => (
                        <label
                          key={opt}
                          className={`flex items-center gap-2 ${
                            opt === item.value
                              ? "text-emerald-600 font-semibold"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            readOnly
                            checked={opt === item.value}
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

          {/* ---------- STEP 2 : UMPAN BALIK & DEADLINE ---------- */}
          {step === 2 && (
            <div className="space-y-6 mt-2">
              <h3 className="text-emerald-600 font-semibold">
                Section 2 – Umpan Balik Mentor
              </h3>
              <div className="border-t border-gray-200 pt-3 space-y-4">
                <div>
                  <p className="font-bold text-sm mb-2">
                    Komentar Umum Mentor
                  </p>
                  <p className="text-sm text-gray-700">
                    {reviewData?.mentorFeedback || "-"}
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-3" />
                <div>
                  <p className="font-bold text-sm mb-2">Saran Perbaikan</p>
                  <p className="text-sm text-gray-700">
                    {reviewData?.mentorSuggestion || "-"}
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-3" />

                {/* === BLOK PERLU REVISI + DEADLINE === */}
                <div>
                  <p className="text-sm font-bold mb-2">
                    Perlu Revisi Ulang?
                  </p>
                  <div className="ml-2 space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-black">
                        <input
                          type="radio"
                          name="revision"
                          value="yes"
                          checked={reviewData?.isRevisedRequired === true}
                          disabled
                          className="accent-emerald-600"
                        />
                        Ya
                      </label>
                      {reviewData?.isRevisedRequired && (
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-500">
                            Tenggat:
                          </label>
                          <input
                            type="date"
                            className="border rounded-md p-1 text-sm bg-gray-100"
                            value={
                              reviewData?.revisionDeadline
                                ? new Date(reviewData.revisionDeadline)
                                    .toISOString()
                                    .split("T")[0]
                                : ""
                            }
                            disabled
                          />
                        </div>
                      )}
                    </div>

                    <label className="flex items-center gap-2 text-sm text-black">
                      <input
                        type="radio"
                        name="revision"
                        value="no"
                        checked={reviewData?.isRevisedRequired === false}
                        disabled
                        className="accent-emerald-600"
                      />
                      Tidak
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------- STEP 3 : UPLOAD REVISI (DESAIN BARU SESUAI PENGUMPULANBELUM) ---------- */}
          {step === 3 && (
            <div className="flex flex-col gap-6 mt-2">
              <h3 className="text-emerald-600 font-semibold">
                Section 3 – Upload Revisi Proyek
              </h3>

              {/* Judul Revisi */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Judul Revisi</label>
                <input
                  type="text"
                  placeholder="Tugas Revisi Website Portfolio"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Media Upload */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Upload File Revisi
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center py-6 gap-3">
                  <Image
                    src="/assets/dashboard/user/cloud.svg"
                    alt="Upload"
                    width={40}
                    height={40}
                    className="text-emerald-500"
                  />
                  <p className="text-sm text-gray-500 text-center">
                    select your file or drag and drop
                    <br />
                    <span className="text-xs">
                      png, pdf, psd, xls, csv, docx, ipynb, pptx accepted
                    </span>
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".png,.pdf,.psd,.xls,.csv,.docx,.ipynb,.pptx"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      type="button"
                      asChild
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 cursor-pointer"
                    >
                      <span>Upload</span>
                    </Button>
                  </label>
                </div>

                {files && files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {Array.from(files).map((file, idx) => (
                      <div
                        key={idx}
                        className="border rounded-md p-2 flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">📄</span>
                          <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[150px]">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                            <a
                              href={URL.createObjectURL(file)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 text-xs mt-1 underline"
                            >
                              Click to view
                            </a>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="ml-3 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-sm text-gray-500 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* Upload via URL */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Upload dari URL</label>
                <input
                  type="url"
                  placeholder="Add file URL"
                  value={projectLink}
                  onChange={(e) => setProjectLink(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
              )}
            </div>
          )}

          {/* ---------- FOOTER NAVIGATION ---------- */}
          {step <= 3 && (
            <DialogFooter className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="w-1/2"
                onClick={handlePrev}
                disabled={step === 1 || loading}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Sebelumnya
              </Button>

              {step < 3 ? (
                <Button
                  className="bg-emerald-500 hover:bg-emerald-600 text-white w-1/2 flex justify-center items-center"
                  onClick={handleNext}
                  disabled={loading}
                >
                  Selanjutnya
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-1/2 flex justify-center items-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      Kirim Revisi
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Success */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent
          className="sm:max-w-md flex flex-col items-center justify-center text-center py-10"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="sr-only">Success</DialogTitle>
          </DialogHeader>
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-semibold mt-6">Horray!</h2>
          <p className="text-sm text-gray-600">
            Projectmu berhasil dikumpulkan!
          </p>
          <Button
            className="bg-emerald-500 hover:bg-emerald-600 text-white mt-6"
            onClick={handleRedirectNow}
          >
            Kembali ke Dashboard
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
