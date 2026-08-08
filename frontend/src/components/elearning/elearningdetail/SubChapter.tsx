"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  ImageOff,
  Sparkles,
  Bell,
  CircleGauge,
  BookOpen,
  Clock,
} from "lucide-react";
import type { ElearningCourseDetailApiItem } from "@/hooks/useElearningCourseDetail";
import {
  useElearningCourseProgress,
  type ElearningSubChapterProgressStatus,
} from "@/hooks/useElearningCourseProgress";

interface Props {
  course: ElearningCourseDetailApiItem;
  from?: "elearning" | "elearningfull";
}

// 🔥 coverImage dari DB sudah termasuk path lengkapnya sendiri, sama
// seperti thumbnailImages di level course.
function resolveThumbnailImage(thumbnail: string | null | undefined) {
  if (!thumbnail) return null;
  if (thumbnail.startsWith("http")) return thumbnail;
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}${thumbnail}`;
}

const taskLabelMap: Record<string, string> = {
  QUIZ: "Quiz",
  PROJECT: "Projek",
  QUIZ_AND_PROJECT: "Quiz & Projek",
};

const levelLabelMap: Record<string, string> = {
  Beginner: "Pemula",
  Intermediate: "Menengah",
  Advanced: "Lanjutan",
  Professional: "Profesional",
};

// 🔥 Kalau value level dari API tidak persis match key di levelLabelMap
// (beda casing, mis. "intermediate"/"advance"), jangan ditampilkan mentah
// — capitalize huruf depannya dulu supaya tetap konsisten (Intermediate,
// Advance, dst) bukan huruf kecil semua.
function formatLevelLabel(level: string) {
  const mapped = levelLabelMap[level];
  if (mapped) return mapped;

  return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
}

// 🔥 Format lastActivityAt jadi teks relatif ("2 jam lalu") buat ditampilkan
// di samping progress bar tiap kartu.
function formatRelativeTime(dateStr: string | null) {
  if (!dateStr) return null;

  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} hari lalu`;
}

// 🔥 Label tombol aksi tiap kartu tergantung status progress subChapter:
// belum mulai -> "Mulai", masih jalan -> "Lanjut", sudah 100% -> "Ulangi".
function getActionLabel(status?: ElearningSubChapterProgressStatus) {
  if (status === "completed") return "Ulangi";
  if (status === "in_progress") return "Lanjut";
  return "Mulai";
}

export default function SubChapterSection({
  course,
  from = "elearning",
}: Props) {
  const subChapters = course.subChapters ?? [];
  const total = subChapters.length;

  // 🔥 Progress overall course + progress tiap subChapter, satu request
  const { progress } = useElearningCourseProgress(course.id);

  const progressBySubChapter = useMemo(() => {
    const map = new Map<
      string,
      NonNullable<typeof progress>["subChapterProgress"][number]
    >();

    progress?.subChapterProgress.forEach((sc) => {
      map.set(sc.subChapterId, sc);
    });

    return map;
  }, [progress]);

  // 🔥 STATE: show more / less
  const MAX_VISIBLE = 8;
  const [showAll, setShowAll] = useState(false);

  const displayedSubChapters = showAll
    ? subChapters
    : subChapters.slice(0, MAX_VISIBLE);

  return (
    <section
      id="materi-belajar"
      className="py-10 px-3 md:px-5 lg:px-6 scroll-mt-24"
    >
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            Apa yang Akan Kamu Pelajari
          </h2>

          {progress ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CircleGauge className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Progress:{" "}
                <span className="font-semibold text-gray-900">
                  {progress.progressPercent}%
                </span>
              </span>
              <span className="text-gray-300">•</span>
              <span>
                (
                <span className="font-semibold text-gray-900">
                  {progress.completedSubChapter}
                </span>{" "}
                / {progress.totalSubChapter} kelas)
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{total}</span> Kelas
              tersedia
            </span>
          )}
        </div>

        {total === 0 ? (
          <div className="relative overflow-hidden flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/70 via-white to-white">
            {/* Ambient glow blobs */}
            <div className="pointer-events-none absolute -top-16 -left-14 w-48 h-48 bg-emerald-200/40 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -right-14 w-52 h-52 bg-teal-200/30 rounded-full blur-3xl" />

            {/* Dot-grid texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.3]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(16,185,129,0.18) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />

            {/* Icon with rotating dashed ring */}
            <div className="relative mb-5 flex items-center justify-center w-20 h-20">
              <span
                className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-300 animate-spin"
                style={{ animationDuration: "12s" }}
              />
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold px-3 py-1 mb-3">
              <Bell className="w-3 h-3" />
              Segera Hadir
            </span>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Materi Sedang Disiapkan
            </h3>

            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              Tim mentor kami sedang menyusun kelas terbaik untuk kamu. Pantau
              terus halaman ini -- materi akan muncul di sini begitu siap
              dipelajari.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedSubChapters.map((chapter) => {
              const moduleCount = chapter.subBabs?.length ?? 0;
              const coverImage = resolveThumbnailImage(chapter.coverImage);

              return (
                <div
                  key={chapter.id}
                  className="
                    group bg-white rounded-xl border border-gray-200
                    hover:shadow-xl hover:-translate-y-1
                    transition-all duration-300
                  "
                >
                  {/* Image */}
                  <div className="relative p-2">
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden h-[160px]">
                      {coverImage ? (
                        <Image
                          src={coverImage}
                          alt={chapter.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageOff className="w-6 h-6" />
                        </div>
                      )}

                      {chapter.level && (
                        <span
                          className="
                            absolute top-2 right-2
                            bg-indigo-600 text-white
                            text-[11px] font-medium
                            px-3 py-1.5
                            rounded-full
                          "
                        >
                          {formatLevelLabel(chapter.level)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {chapter.title}
                    </h3>

                    {chapter.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {chapter.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-gray-600 mb-3">
                      <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg">
                        <BookOpen className="w-3 h-3" />
                        {moduleCount} modul
                      </span>

                      {chapter.estimatedTime && (
                        <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3 h-3" />
                          {chapter.estimatedTime} Menit
                        </span>
                      )}

                      {chapter.taskType && (
                        <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg">
                          <Image
                            src="/assets/elearning/quizprojecsubchapter.svg"
                            alt="quiz"
                            width={12}
                            height={12}
                          />
                          {taskLabelMap[chapter.taskType] ?? chapter.taskType}
                        </span>
                      )}
                    </div>

                    {/* Progress + Action */}
                    {(() => {
                      const chapterProgress = progressBySubChapter.get(
                        chapter.id,
                      );
                      const relativeTime = formatRelativeTime(
                        chapterProgress?.lastActivityAt ?? null,
                      );
                      const hasStarted =
                        chapterProgress &&
                        chapterProgress.status !== "not_started";

                      return (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            {hasStarted ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                  <span>
                                    Progress:{" "}
                                    <span className="font-semibold text-gray-900">
                                      {chapterProgress!.progressPercent}%
                                    </span>
                                  </span>
                                  {relativeTime && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span>{relativeTime}</span>
                                    </>
                                  )}
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-emerald-500 transition-all"
                                    style={{
                                      width: `${chapterProgress!.progressPercent}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-gray-400">
                                Belum dimulai
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/elearning/${course.id}/${chapter.id}?from=${from}`}
                          >
                            <Button
                              size="sm"
                              className={
                                chapterProgress?.status === "completed"
                                  ? // 🔥 BARU: state "Ulangi" — outline, bukan solid, biar visually
                                    // beda dari "Mulai"/"Lanjut" (yang masih ada progress
                                    // berjalan/belum mulai). Solid emerald dipertahankan cuma
                                    // buat aksi yang "mendorong maju", sedangkan "Ulangi" itu
                                    // aksi opsional (subChapter-nya sudah 100%), jadi lebih pas
                                    // ditonjolkan lebih ringan/secondary.
                                    "bg-white px-4 py-2 text-xs text-emerald-600 border border-emerald-600 hover:bg-emerald-50 shrink-0"
                                  : "bg-emerald-600 px-4 py-2 text-xs text-white hover:bg-emerald-700 shrink-0"
                              }
                            >
                              {getActionLabel(chapterProgress?.status)}
                            </Button>
                          </Link>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TOGGLE BUTTON */}
        {total > MAX_VISIBLE && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="
                group flex items-center gap-1.5
                border-emerald-600 text-emerald-600
                hover:bg-emerald-50 hover:text-emerald-700
                transition-all duration-300
                px-5 py-2 text-sm
              "
            >
              <span className="font-medium">
                {showAll ? "Tampilkan Lebih Sedikit" : "Tampilkan Lebih Banyak"}
              </span>

              {showAll ? (
                <ChevronUp className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
              ) : (
                <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
