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

interface ShowReviewModalProps {
  open: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    email: string;
    projectTitle: string;
    projectLink: string;
    date: string;
    scheduleStart: string;
    scheduleEnd: string;
    zoomSchedule: string;
    reviewAnswers?: {
      brief: string;
      technical: string;
      creativity: string;
      completeness: string;
      generalComment: string;
      improvement: string;
      revision: "yes" | "no";
      revisionDate: string;
      confirmation: "true" | "false";
    };
  } | null;
}

export default function ShowReviewModal({
  open,
  onClose,
  project,
}: ShowReviewModalProps) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (project?.reviewAnswers) {
      setAnswers(project.reviewAnswers);
    }
  }, [project]);

  if (!project) return null;

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
    } catch {
      return <span className="font-semibold">{project.zoomSchedule}</span>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-lg overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Detail Peninjauan Proyek
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-0 mb-2">
            {formatProjectSchedule(project)}
          </p>
        </DialogHeader>

        {/* Page 1: Identitas Proyek */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h4 className="text-emerald-600 font-semibold">
                Section 1 - Identitas Proyek
              </h4>
              <div className="border-b border-gray-300 w-full mt-2 mb-2" />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image
                  src="/assets/dashboard/mentor/person.svg"
                  alt="user"
                  width={12}
                  height={12}
                />
                <p className="text-sm font-medium">Nama Lengkap Mentee</p>
              </div>
              <p className="text-gray-700 ml-[20px]">{project.name}</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image
                  src="/assets/dashboard/mentor/person.svg"
                  alt="email"
                  width={12}
                  height={12}
                />
                <p className="text-sm font-medium">Email Mentee</p>
              </div>
              <p className="text-gray-700 ml-[20px]">{project.email}</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image
                  src="/assets/dashboard/mentor/service/openbook.svg"
                  alt="project"
                  width={12}
                  height={12}
                />
                <p className="text-sm font-medium">Judul Proyek</p>
              </div>
              <p className="text-gray-700 ml-[20px]">{project.projectTitle}</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image
                  src="/assets/dashboard/mentor/service/link.svg"
                  alt="link"
                  width={12}
                  height={12}
                />
                <p className="text-sm font-medium">Link Proyek</p>
              </div>
              <a
                href={project.projectLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 underline ml-[20px]"
              >
                {project.projectLink}
              </a>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image
                  src="/assets/dashboard/mentor/calendar.svg"
                  alt="calendar"
                  width={12}
                  height={12}
                />
                <p className="text-sm font-medium">Waktu Pengumpulan</p>
              </div>
              <p className="text-gray-700 ml-[20px]">{project.date}</p>
            </div>
          </div>
        )}

        {/* Page 2: Penilaian Proyek */}
        {step === 2 && (
          <div className="max-h-[400px] overflow-y-auto pr-1 space-y-6">
            <div>
              <h4 className="text-emerald-600 font-semibold">
                Section 2 - Penilaian Proyek
              </h4>
              <div className="border-b border-gray-300 w-full mt-2 mb-0" />
            </div>
            {[
              {
                key: "brief",
                label: "Kesesuaian dengan Brief atau Tujuan Awal",
                options: [
                  "Sangat Sesuai",
                  "Cukup Sesuai",
                  "Kurang Sesuai",
                  "Tidak Sesuai",
                ],
              },
              {
                key: "technical",
                label: "Kualitas Teknis (Coding / Desain / Analisis)",
                options: [
                  "Sangat Baik",
                  "Cukup Baik",
                  "Kurang Baik",
                  "Sangat Buruk",
                ],
              },
              {
                key: "creativity",
                label: "Kreativitas dan Inisiatif",
                options: [
                  "Sangat Baik",
                  "Cukup Baik",
                  "Kurang Baik",
                  "Sangat Buruk",
                ],
              },
              {
                key: "completeness",
                label: "Kelengkapan Proyek",
                options: ["Lengkap", "Belum Lengkap", "Perlu Revisi"],
              },
            ].map((q) => (
              <div key={q.key}>
                <p className="text-sm font-medium mb-2">{q.label}</p>
                <div className="space-y-2 ml-2">
                  {q.options.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="radio"
                        name={q.key}
                        value={opt}
                        checked={answers[q.key] === opt}
                        disabled
                        className="accent-emerald-600"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Page 3: Umpan Balik */}
        {step === 3 && (
          <div className="max-h-[400px] overflow-y-auto pr-1 space-y-4">
            <div>
              <h4 className="text-emerald-600 font-semibold">
                Section 3 - Penilaian Proyek
              </h4>
              <div className="border-b border-gray-300 w-full mt-2" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image
                  src="/assets/dashboard/mentor/service/pen1.svg"
                  alt="icon komentar"
                  width={10}
                  height={10}
                  className="relative top-[-0.5px]"
                />
                <p className="text-sm font-medium">Komentar Umum</p>
              </div>
              <textarea
                className="w-full border rounded-md p-2 text-sm bg-white resize-none"
                rows={5}
                value={answers["generalComment"] || ""}
                disabled
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image
                  src="/assets/dashboard/mentor/service/pen2.svg"
                  alt="icon saran"
                  width={12}
                  height={12}
                  className="relative top-[-0.2px]"
                />
                <p className="text-sm font-medium">Saran Perbaikan</p>
              </div>
              <textarea
                className="w-full border rounded-md p-2 text-sm bg-white resize-none"
                rows={5}
                value={answers["improvement"] || ""}
                disabled
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Perlu Revisi Ulang?</p>
              <div className="ml-2 space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-black">
                    <input
                      type="radio"
                      name="revision"
                      value="yes"
                      checked={answers["revision"] === "yes"}
                      disabled
                      className="accent-emerald-600"
                    />
                    Ya
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-500">Tenggat:</label>
                    <input
                      type="date"
                      className="border rounded-md p-1 text-sm bg-gray-100"
                      value={answers["revisionDate"] || ""}
                      disabled
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-black">
                  <input
                    type="radio"
                    name="revision"
                    value="no"
                    checked={answers["revision"] === "no"}
                    disabled
                    className="accent-emerald-600"
                  />
                  Tidak
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex gap-2 mt-3">
          {step === 1 ? (
            <DialogClose asChild>
              <Button
                variant="outline"
                className="w-1/2 border-emerald-500 text-emerald-600"
              >
                Tutup
              </Button>
            </DialogClose>
          ) : (
            <Button
              variant="outline"
              className="w-1/2 border-emerald-500 text-emerald-600"
              onClick={() => setStep(step - 1)}
            >
              Sebelumnya
            </Button>
          )}

          {step < 3 ? (
            <Button
              className="w-1/2 bg-emerald-600 text-white"
              onClick={() => setStep(step + 1)}
            >
              Selanjutnya
            </Button>
          ) : (
            <DialogClose asChild>
              <Button className="w-1/2 bg-emerald-600 text-white">Tutup</Button>
            </DialogClose>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
