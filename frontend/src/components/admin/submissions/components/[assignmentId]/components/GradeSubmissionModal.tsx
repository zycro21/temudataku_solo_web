"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Loader2,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Pencil,
  UserCheck,
} from "lucide-react";
import type { SubmissionListItem } from "@/app/admin/elearning/submissions/[assignmentId]/page";
import {
  MAX_ASSIGNMENT_ATTEMPTS,
  PASSING_SCORE_THRESHOLD,
  getAssignmentReviewOutcome,
  type AssignmentReviewOutcome,
} from "@/hooks/useElearningAssignmentSubmission";

interface Props {
  submission: SubmissionListItem;
  onClose: () => void;
  onSuccess: () => void;
}

interface ReviewerInfo {
  id: string;
  fullName: string;
  email: string;
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

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scoreTone(value: number) {
  if (value >= 80)
    return {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      ring: "ring-emerald-200",
    };
  if (value >= 60)
    return {
      text: "text-amber-700",
      bg: "bg-amber-50",
      ring: "ring-amber-200",
    };
  return { text: "text-red-700", bg: "bg-red-50", ring: "ring-red-200" };
}

// 🔥 FIX: status "REVIEWED" dihapus dari sini — label itu ambigu (tidak
// bilang lolos atau tidak). Badge sekarang dibangun dari
// AssignmentReviewOutcome (PENDING / REVISION_REQUIRED / APPROVED /
// REJECTED) yang diturunkan lewat getAssignmentReviewOutcome, bukan dari
// `status` mentah backend — biar konsisten dengan tampilan mentee.
const OUTCOME_META: Record<
  AssignmentReviewOutcome,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Belum Direview",
    className: "bg-yellow-100 text-yellow-700",
  },
  REVISION_REQUIRED: {
    label: "Perlu Revisi",
    className: "bg-amber-100 text-amber-700",
  },
  APPROVED: { label: "Lolos", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Tidak Lolos", className: "bg-red-100 text-red-700" },
};

function StatusBadge({ outcome }: { outcome: AssignmentReviewOutcome }) {
  const cfg = OUTCOME_META[outcome];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

type Step = "detail" | "form" | "confirm";

export default function GradeSubmissionModal({
  submission,
  onClose,
  onSuccess,
}: Props) {
  const alreadyReviewed = submission.status !== "PENDING";

  // 🔥 BARU: attempt terakhir (attemptNumber >= MAX_ASSIGNMENT_ATTEMPTS)
  // TIDAK BOLEH lagi ditandai "perlu revisi" — mentee sudah tidak punya
  // kesempatan mengumpulkan ulang. Ini adalah fix untuk celah yang
  // sebelumnya ada: reviewer mencentang "perlu revisi" di attempt
  // terakhir → mentee terjebak selamanya di status "Perlu Revisi" tanpa
  // jalan keluar. Form di bawah menyembunyikan opsi revisi kalau ini
  // attempt terakhir, dan lolos/tidaknya ditentukan otomatis dari skor
  // terhadap PASSING_SCORE_THRESHOLD.
  const isLastAttempt = submission.attemptNumber >= MAX_ASSIGNMENT_ATTEMPTS;

  // Hasil akhir submission yang SUDAH TERSIMPAN (dipakai di step "detail"
  // read-only) — beda dari `pendingOutcome` di bawah yang menghitung
  // preview live selagi admin masih mengisi form.
  const submissionOutcome: AssignmentReviewOutcome = getAssignmentReviewOutcome(
    {
      status: submission.status,
      isRevisionRequired: submission.isRevisionRequired,
      score: submission.score,
      isLastAttempt,
    },
  );

  // 🔥 Kalau submission sudah pernah direview, modal dibuka dalam mode
  // "detail" (read-only) dulu — bukan langsung form — supaya yang menilai
  // tidak bingung dan tidak sengaja mereview ulang. Form hanya dibuka
  // kalau admin sengaja klik "Edit Penilaian".
  const [step, setStep] = useState<Step>(alreadyReviewed ? "detail" : "form");

  const [reviewer, setReviewer] = useState<ReviewerInfo | null>(null);
  const [reviewedAt, setReviewedAt] = useState<string | null>(
    submission.reviewedAt,
  );
  const [isLoadingDetail, setIsLoadingDetail] = useState(alreadyReviewed);

  // 🔥 Ambil detail lengkap (termasuk data reviewer) dari endpoint
  // GET /submissions/:id — data di tabel list tidak menyertakan nama
  // reviewer, cuma reviewedById.
  useEffect(() => {
    if (!alreadyReviewed) return;
    let isMounted = true;
    (async () => {
      setIsLoadingDetail(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubmission/submissions/${submission.id}`,
          { withCredentials: true },
        );
        const data = res.data?.data;
        if (isMounted && data) {
          setReviewer(data.reviewer ?? null);
          setReviewedAt(data.reviewedAt ?? null);
        }
      } catch {
        // gagal ambil detail reviewer bukan hal fatal — data inti
        // (skor, feedback) tetap bisa ditampilkan dari data submission
        // yang sudah ada.
      } finally {
        if (isMounted) setIsLoadingDetail(false);
      }
    })();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission.id]);

  // 🔥 Kalau submission ini sebelumnya sudah pernah direview (mis. admin
  // mau koreksi ulang), form di-prefill dari data yang sudah ada supaya
  // nggak perlu isi ulang dari nol.
  const [score, setScore] = useState<string>(
    typeof submission.score === "number" ? String(submission.score) : "",
  );
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  // 🔥 FIX: di attempt terakhir, toggle "perlu revisi" dipaksa false
  // sejak awal — opsinya memang tidak ditampilkan sama sekali di form
  // (lihat step === "form" di bawah), jadi state ini nggak akan pernah
  // ke-set true untuk attempt terakhir.
  const [isRevisionRequired, setIsRevisionRequired] = useState(
    isLastAttempt ? false : (submission.isRevisionRequired ?? false),
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
  // Attempt terakhir tidak punya opsi revisi sama sekali → deadline tidak
  // relevan dan tidak perlu divalidasi.
  const isDeadlineValid =
    isLastAttempt || !isRevisionRequired || revisionDeadline !== "";
  const isFormValid = isScoreValid && isFeedbackValid && isDeadlineValid;

  // 🔥 BARU: hasil akhir yang AKAN tersimpan kalau form ini disubmit,
  // dihitung live pakai sumber kebenaran yang sama dengan sisi mentee —
  // dipakai untuk keterangan ambang batas & preview di step konfirmasi.
  const pendingOutcome: AssignmentReviewOutcome = getAssignmentReviewOutcome({
    status: "REVIEWED", // sudah pasti bukan PENDING lagi setelah disimpan
    isRevisionRequired: isLastAttempt ? false : isRevisionRequired,
    score: isScoreValid ? scoreNumber : null,
    isLastAttempt,
  });

  const handleReviewClick = () => {
    if (!isFormValid) return;
    setStep("confirm");
  };

  const handleConfirmSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 🔥 FIX: di attempt terakhir isRevisionRequired dipaksa false apa
      // pun isinya, jaga-jaga andai state-nya somehow ke-set true (mis.
      // dari prefill data lama) — backend tidak boleh menerima "perlu
      // revisi" untuk attempt yang sudah tidak bisa diulang lagi.
      const finalIsRevisionRequired = isLastAttempt
        ? false
        : isRevisionRequired;

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubmission/submissions/${submission.id}/review`,
        {
          score: scoreNumber,
          feedback: feedback.trim(),
          isRevisionRequired: finalIsRevisionRequired,
          ...(finalIsRevisionRequired
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
      setStep("form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tone = isScoreValid ? scoreTone(scoreNumber) : scoreTone(0);

  const headerCopy: Record<Step, { title: string; subtitle: string }> = {
    detail: {
      title: "Detail Penilaian",
      subtitle: "Submission ini sudah direview. Berikut hasil penilaiannya.",
    },
    form: {
      title: alreadyReviewed ? "Edit Penilaian" : "Nilai Submission",
      subtitle: "Periksa file & catatan mentee, lalu isi penilaian di bawah.",
    },
    confirm: {
      title: "Konfirmasi Penilaian",
      subtitle: "Pastikan detail berikut sudah benar sebelum disimpan.",
    },
  };

  const menteeInfoCard = (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">
          {submission.user.fullName}
        </p>
        <p className="truncate text-xs text-gray-500">
          {submission.user.email}
        </p>
      </div>
      <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
        Attempt #{submission.attemptNumber}
      </span>
    </div>
  );

  const filesAndNotesSection = (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">
        File yang Dikumpulkan
      </h4>
      {submission.files.length === 0 && (
        <p className="rounded-lg border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-400">
          Mentee tidak melampirkan file.
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {submission.files.map((fileUrl, idx) => {
          const resolvedUrl = resolveMediaUrl(fileUrl);
          const fileName = getFileNameFromUrl(fileUrl);
          return (
            <a
              key={idx}
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={fileName}
              className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm transition hover:border-emerald-300 hover:bg-emerald-50/50"
            >
              <span className="flex min-w-0 items-center gap-2">
                <FileText size={16} className="shrink-0 text-emerald-500" />
                <span className="min-w-0 truncate">{fileName}</span>
              </span>
              <ExternalLink size={14} className="shrink-0 text-gray-400" />
            </a>
          );
        })}
      </div>

      {submission.notes && (
        <div>
          <h4 className="mb-1 text-sm font-semibold text-gray-700">
            Catatan Mentee
          </h4>
          <p className="whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
            {submission.notes}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="flex max-h-[88vh] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0"
      >
        {/* ================= HEADER (sticky) ================= */}
        <DialogHeader className="sticky top-0 z-10 shrink-0 space-y-1 border-b border-emerald-100 bg-white px-6 py-4 pr-12">
          <DialogTitle className="text-lg font-bold text-gray-900">
            {headerCopy[step].title}
          </DialogTitle>
          <p className="text-sm text-gray-500">{headerCopy[step].subtitle}</p>
        </DialogHeader>

        {/* ================= BODY (scrollable) ================= */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === "detail" && (
            <div className="space-y-6">
              {menteeInfoCard}
              {filesAndNotesSection}

              <hr className="border-emerald-100" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Hasil Penilaian
                  </h4>
                  <StatusBadge outcome={submissionOutcome} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Skor
                    </p>
                    {typeof submission.score === "number" ? (
                      <p
                        className={`mt-1 inline-flex rounded-lg px-3 py-1 text-2xl font-bold ${
                          scoreTone(submission.score).bg
                        } ${scoreTone(submission.score).text}`}
                      >
                        {submission.score}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-400">-</p>
                    )}
                    {/* 🔥 BARU: keterangan ambang batas — cuma ditampilkan
                        kalau ini attempt terakhir, karena hanya di
                        situlah skor jadi penentu tunggal lolos/tidak. */}
                    {isLastAttempt && (
                      <p className="mt-1 text-[11px] text-gray-400">
                        Attempt terakhir · ambang batas lolos ≥{" "}
                        {PASSING_SCORE_THRESHOLD}
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Hasil Akhir
                    </p>
                    <p className="mt-2 text-sm font-semibold">
                      {submissionOutcome === "REVISION_REQUIRED" ? (
                        <span className="text-amber-600">Perlu Direvisi</span>
                      ) : submissionOutcome === "APPROVED" ? (
                        <span className="text-emerald-600">Lolos</span>
                      ) : (
                        <span className="text-red-600">Tidak Lolos</span>
                      )}
                    </p>
                    {submissionOutcome === "REVISION_REQUIRED" &&
                      submission.revisionDeadline && (
                        <p className="mt-1 text-xs text-gray-500">
                          Batas waktu:{" "}
                          {formatDateTime(submission.revisionDeadline)}
                        </p>
                      )}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Feedback untuk Mentee
                  </p>
                  <p className="whitespace-pre-wrap break-words text-sm text-gray-700">
                    {submission.feedback || "-"}
                  </p>
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
                  <UserCheck size={16} className="mt-0.5 shrink-0" />
                  {isLoadingDetail ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin" />
                      Memuat info reviewer...
                    </span>
                  ) : reviewer ? (
                    <p>
                      Direview oleh{" "}
                      <span className="font-semibold">{reviewer.fullName}</span>{" "}
                      pada {formatDateTime(reviewedAt)}.
                    </p>
                  ) : (
                    <p>Direview pada {formatDateTime(reviewedAt)}.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === "form" && (
            <div className="space-y-6">
              {menteeInfoCard}
              {filesAndNotesSection}

              <hr className="border-emerald-100" />

              {/* ===== FORM PENILAIAN ===== */}
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

                  {/* 🔥 BARU: keterangan ambang batas + preview hasil
                      LIVE — cuma tampil di attempt terakhir, karena di
                      situ skor jadi satu-satunya penentu lolos/tidak
                      (tidak ada lagi opsi revisi). */}
                  {isLastAttempt && (
                    <div className="mt-2 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-800">
                      <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                      <p>
                        Ini attempt terakhir mentee ({submission.attemptNumber}/
                        {MAX_ASSIGNMENT_ATTEMPTS}
                        ), jadi opsi &ldquo;perlu revisi&rdquo; tidak tersedia
                        lagi. Skor{" "}
                        <span className="font-semibold">
                          ≥ {PASSING_SCORE_THRESHOLD}
                        </span>{" "}
                        akan otomatis dinyatakan{" "}
                        <span className="font-semibold text-emerald-700">
                          Lolos
                        </span>
                        , di bawah itu{" "}
                        <span className="font-semibold text-red-700">
                          Tidak Lolos
                        </span>
                        {isScoreValid && (
                          <>
                            {" "}
                            — dengan skor saat ini ({scoreNumber}), hasilnya
                            akan tersimpan sebagai{" "}
                            <span
                              className={`font-semibold ${
                                pendingOutcome === "APPROVED"
                                  ? "text-emerald-700"
                                  : "text-red-700"
                              }`}
                            >
                              {pendingOutcome === "APPROVED"
                                ? "Lolos"
                                : "Tidak Lolos"}
                            </span>
                          </>
                        )}
                        .
                      </p>
                    </div>
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

                {/* 🔥 FIX: opsi "perlu revisi" HANYA muncul kalau ini
                    BUKAN attempt terakhir. Ini akar dari perbaikan celah
                    yang diminta — sebelumnya toggle ini selalu muncul
                    walau attempt sudah yang terakhir, sehingga mentee
                    bisa terjebak di status "Perlu Revisi" tanpa
                    kesempatan mengumpulkan ulang. */}
                {!isLastAttempt && (
                  <>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 px-4 py-3 transition hover:border-emerald-300">
                      <input
                        type="checkbox"
                        checked={isRevisionRequired}
                        onChange={(e) =>
                          setIsRevisionRequired(e.target.checked)
                        }
                        className="h-4 w-4 accent-emerald-600"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Tugas ini perlu direvisi mentee
                      </span>
                    </label>
                    <p className="-mt-2 text-xs text-gray-400">
                      Ini attempt {submission.attemptNumber} dari{" "}
                      {MAX_ASSIGNMENT_ATTEMPTS} - mentee masih punya kesempatan
                      mengumpulkan ulang. Kalau Revisi tidak dicentang, mentee langsung
                      dinyatakan{" "}
                      <span className="font-semibold text-emerald-600">
                        Lolos
                      </span>
                      , berapa pun skornya.
                    </p>

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
                  </>
                )}
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-5">
              {menteeInfoCard}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Skor
                  </p>
                  <p
                    className={`mt-1 inline-flex rounded-lg px-3 py-1 text-2xl font-bold ${tone.bg} ${tone.text}`}
                  >
                    {scoreNumber}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Hasil Akhir
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-800">
                    {pendingOutcome === "REVISION_REQUIRED" ? (
                      <span className="text-amber-600">Perlu Direvisi</span>
                    ) : pendingOutcome === "APPROVED" ? (
                      <span className="text-emerald-600">Lolos</span>
                    ) : (
                      <span className="text-red-600">Tidak Lolos</span>
                    )}
                  </p>
                  {pendingOutcome === "REVISION_REQUIRED" &&
                    revisionDeadline && (
                      <p className="mt-1 text-xs text-gray-500">
                        Batas waktu: {formatDateTime(revisionDeadline)}
                      </p>
                    )}
                  {isLastAttempt && (
                    <p className="mt-1 text-xs text-gray-500">
                      Attempt terakhir · ambang batas lolos ≥{" "}
                      {PASSING_SCORE_THRESHOLD}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Feedback untuk Mentee
                </p>
                <p className="whitespace-pre-wrap break-words text-sm text-gray-700">
                  {feedback.trim()}
                </p>
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
                <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                <p>
                  Setelah disimpan, mentee akan bisa melihat skor dan feedback
                  ini. Pastikan semua data sudah sesuai sebelum melanjutkan.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ================= FOOTER (sticky) ================= */}
        <div className="sticky bottom-0 z-10 flex shrink-0 justify-end gap-3 border-t border-emerald-100 bg-white px-6 py-4">
          {step === "detail" && (
            <>
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Tutup
              </button>
              <button
                onClick={() => setStep("form")}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                <Pencil size={16} />
                Edit Penilaian
              </button>
            </>
          )}

          {step === "form" && (
            <>
              <button
                onClick={() =>
                  alreadyReviewed ? setStep("detail") : onClose()
                }
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleReviewClick}
                disabled={!isFormValid}
                className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition ${
                  !isFormValid
                    ? "cursor-not-allowed bg-gray-300"
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                Simpan Penilaian
              </button>
            </>
          )}

          {step === "confirm" && (
            <>
              <button
                onClick={() => setStep("form")}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
              >
                <ArrowLeft size={16} />
                Cek Kembali
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {isSubmitting ? "Menyimpan..." : "Ya, Simpan Penilaian"}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
