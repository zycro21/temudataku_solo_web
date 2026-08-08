"use client";

import { useState } from "react";
import { Star, Loader2, PartyPopper, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  subChapterTitle: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: { rating: number; comment?: string }) => void;
}

// 🔥 Label per kelipatan 0.5 (1 - 5) — dipakai buat keterangan di bawah
// bintang begitu mentee pilih rating, termasuk buat nilai desimal (bukan
// cuma angka bulat kayak sebelumnya).
const RATING_LABELS: Record<number, string> = {
  1: "Sangat Kurang",
  1.5: "Kurang",
  2: "Kurang Memuaskan",
  2.5: "Cukup",
  3: "Baik",
  3.5: "Baik Sekali",
  4: "Sangat Baik",
  4.5: "Hampir Sempurna",
  5: "Luar Biasa",
};

const STAR_SIZE = 40;

export default function SubchapterReviewModal({
  open,
  subChapterTitle,
  isSubmitting,
  onClose,
  onSubmit,
}: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const displayRating = hoverRating || rating;

  const handleSubmit = () => {
    if (rating < 1) return;
    onSubmit({
      rating,
      comment: comment.trim() ? comment.trim() : undefined,
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-2xl"
        // 🔥 Modal ini sengaja TIDAK BOLEH ketutup dari klik di luar area
        // modal ataupun tombol Escape — satu-satunya jalan keluar cuma
        // lewat tombol X / "Nanti Saja" yang eksplisit di bawah (biar
        // mentee nggak nutup modal ini nggak sengaja pas lagi baca).
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* HEADER — banner emerald dengan sedikit tekstur, biar nggak flat */}
        <DialogHeader className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-6 pb-7 pt-6 text-left">
          {/* dot-grid tekstur halus */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          {/* glow blob */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

          <button
            type="button"
            onClick={() => !isSubmitting && onClose()}
            disabled={isSubmitting}
            aria-label="Tutup"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-1.5 text-white/90 transition hover:bg-white/25 disabled:opacity-40"
          >
            <X size={16} />
          </button>

          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
              <PartyPopper size={22} className="text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold leading-snug text-white">
                Selamat, kelas ini sudah selesai!
              </DialogTitle>
              <p className="mt-1 text-sm leading-relaxed text-emerald-50">
                Yuk kasih review buat{" "}
                <span className="font-semibold text-white">
                  {subChapterTitle}
                </span>{" "}
                — masukanmu membantu mentee lain dan tim mentor kami.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 bg-white px-6 py-6">
          {/* STAR PICKER */}
          <div className="flex flex-col items-center gap-2.5">
            <div
              className="flex items-center gap-1"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const fillPercent =
                  Math.max(0, Math.min(1, displayRating - (star - 1))) * 100;

                return (
                  <div
                    key={star}
                    className="relative"
                    style={{ width: STAR_SIZE, height: STAR_SIZE }}
                  >
                    {/* bintang kosong (background) */}
                    <Star
                      size={STAR_SIZE}
                      className="pointer-events-none absolute inset-0 fill-gray-100 text-gray-300"
                    />
                    {/* bintang terisi, di-clip sesuai persentase (buat efek setengah) */}
                    <div
                      className="pointer-events-none absolute inset-0 overflow-hidden transition-[width] duration-100"
                      style={{ width: `${fillPercent}%` }}
                    >
                      <Star
                        size={STAR_SIZE}
                        className="fill-amber-400 text-amber-400"
                      />
                    </div>
                    {/* zona klik kiri = X.5, kanan = X (bulat) */}
                    <button
                      type="button"
                      aria-label={`Beri rating ${star - 0.5}`}
                      onClick={() => setRating(star - 0.5)}
                      onMouseEnter={() => setHoverRating(star - 0.5)}
                      className="absolute inset-y-0 left-0 w-1/2 cursor-pointer transition-transform hover:scale-110"
                    />
                    <button
                      type="button"
                      aria-label={`Beri rating ${star}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className="absolute inset-y-0 right-0 w-1/2 cursor-pointer transition-transform hover:scale-110"
                    />
                  </div>
                );
              })}
            </div>

            {/* Keterangan rating yang dipilih — angka + label kualitatif */}
            <div className="flex h-6 items-center gap-1.5">
              {displayRating > 0 && (
                <>
                  <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-sm font-bold text-amber-600">
                    {displayRating}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {RATING_LABELS[displayRating]}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* COMMENT */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Ceritakan feedbackmu{" "}
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              placeholder="Materinya jelas, mentornya responsif, dll..."
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {comment.length}/1000
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <Button
            variant="ghost"
            disabled={isSubmitting}
            onClick={onClose}
            className="text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            Nanti Saja
          </Button>
          <Button
            disabled={rating < 1 || isSubmitting}
            onClick={handleSubmit}
            className="bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-1.5 animate-spin" />
                Mengirim...
              </>
            ) : (
              "Kirim Review"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
