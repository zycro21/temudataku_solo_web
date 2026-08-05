"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Loader2, ExternalLink } from "lucide-react";
import type { SubmissionListItem } from "@/app/admin/elearning/submissions/[assignmentId]/page";

interface Props {
  submission: SubmissionListItem;
  onClose: () => void;
  onSuccess: () => void;
}

// Sama pola resolveMediaUrl di SubchapterContent.tsx (sisi mentee) — url
// dari backend bisa relatif ("/uploads/...") atau sudah absolute.
function resolveMediaUrl(url?: string | null): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

function getFileNameFromUrl(url: string) {
  return decodeURIComponent(url.split("/").pop() ?? url);
}

// datetime-local (mis. "2026-08-10T10:00") tidak punya info timezone/detik
// — dikonversi ke ISO string dulu sebelum dikirim, karena validator backend
// pakai z.string().datetime() yang butuh format ISO 8601 penuh.
function toISOStringOrUndefined(localDateTime: string): string | undefined {
  if (!localDateTime) return undefined;
  const date = new Date(localDateTime);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export default function GradeSubmissionModal({
  submission,
  onClose,
  onSuccess,
}: Props) {
  // 🔥 Kalau submission ini sebelumnya sudah pernah direview (mis. admin
  // mau koreksi ulang), form di-prefill dari data yang sudah ada supaya
  // nggak perlu isi ulang dari nol.
  const [score, setScore] = useState<string>(
    typeof submission.score === "number" ? String(submission.score) : "",
  );
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [isRevisionRequired, setIsRevisionRequired] = useState(
    submission.isRevisionRequired ?? false,
  );
  const [revisionDeadline, setRevisionDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scoreNumber = Number(score);
  const isScoreValid =
    score !== "" &&
    !Number.isNaN(scoreNumber) &&
    scoreNumber >= 0 &&
    scoreNumber <= 100;
  const isFeedbackValid = feedback.trim().length > 0;
  const isDeadlineValid = !isRevisionRequired || revisionDeadline !== "";
  const isFormValid = isScoreValid && isFeedbackValid && isDeadlineValid;

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubmission/submissions/${submission.id}/review`,
        {
          score: scoreNumber,
          feedback: feedback.trim(),
          isRevisionRequired,
          ...(isRevisionRequired
            ? { revisionDeadline: toISOStringOrUndefined(revisionDeadline) }
            : {}),
        },
        { withCredentials: true },
      );

      toast.success("Penilaian berhasil disimpan");
      onSuccess();
    } catch (err: any) {
      const data = err?.response?.data;
      const message =
        data?.errors?.[0]?.message ??
        data?.message ??
        "Gagal menyimpan penilaian, silakan coba lagi";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nilai Submission</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* ================= INFO MENTEE ================= */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {submission.user.fullName}
              </p>
              <p className="text-xs text-gray-500">{submission.user.email}</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600">
              Attempt #{submission.attemptNumber}
            </span>
          </div>

          {/* ================= FILE & NOTES DARI MENTEE ================= */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">
              File yang Dikumpulkan
            </h4>
            {submission.files.length === 0 && (
              <p className="text-sm text-gray-400">
                Mentee tidak melampirkan file.
              </p>
            )}
            <div className="space-y-2">
              {submission.files.map((fileUrl, idx) => {
                const resolvedUrl = resolveMediaUrl(fileUrl);
                const fileName = getFileNameFromUrl(fileUrl);
                return (
                  <a
                    key={idx}
                    href={resolvedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition hover:bg-gray-50"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText size={16} className="shrink-0 text-gray-400" />
                      <span className="truncate" title={fileName}>
                        {fileName}
                      </span>
                    </span>
                    <ExternalLink
                      size={14}
                      className="shrink-0 text-gray-400"
                    />
                  </a>
                );
              })}
            </div>

            {submission.notes && (
              <div>
                <h4 className="mb-1 text-sm font-semibold text-gray-700">
                  Catatan Mentee
                </h4>
                <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                  {submission.notes}
                </p>
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* ================= FORM PENILAIAN ================= */}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Skor (0 - 100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Contoh: 85"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {score !== "" && !isScoreValid && (
                <p className="mt-1 text-xs text-red-500">
                  Skor harus di antara 0 - 100.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Feedback
              </label>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Berikan masukan untuk mentee..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {!isFeedbackValid && feedback !== "" && (
                <p className="mt-1 text-xs text-red-500">
                  Feedback wajib diisi.
                </p>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 px-4 py-3">
              <input
                type="checkbox"
                checked={isRevisionRequired}
                onChange={(e) => setIsRevisionRequired(e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              <span className="text-sm font-medium text-gray-700">
                Tugas ini perlu direvisi mentee
              </span>
            </label>

            {isRevisionRequired && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Batas Waktu Revisi
                </label>
                <input
                  type="datetime-local"
                  value={revisionDeadline}
                  onChange={(e) => setRevisionDeadline(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {isRevisionRequired && !revisionDeadline && (
                  <p className="mt-1 text-xs text-red-500">
                    Batas waktu revisi wajib diisi.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ================= ACTIONS ================= */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition ${
                !isFormValid || isSubmitting
                  ? "cursor-not-allowed bg-gray-300"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Simpan Penilaian
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
