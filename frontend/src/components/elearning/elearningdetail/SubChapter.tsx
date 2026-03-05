"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Practice } from "../ElearningSelection";
import { Circle, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  practice: Practice;
}

export default function SubChapterSection({ practice }: Props) {
  const total = practice.subChapters.length;
  const completed = practice.subChapters.filter(
    (s) => s.progressPercent === 100,
  ).length;

  const progressPercent = Math.round((completed / total) * 100);

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercent / 100) * circumference;

  // 🔥 STATE: show more / less
  const MAX_VISIBLE = 8;
  const [showAll, setShowAll] = useState(false);

  const displayedSubChapters = showAll
    ? practice.subChapters
    : practice.subChapters.slice(0, MAX_VISIBLE);

  // 🔥 Helper: menit → jam & menit
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) return `${mins} Menit`;
    if (mins === 0) return `${hours} Jam`;
    return `${hours} Jam ${mins} Menit`;
  };

  const getTaskLabel = (taskType: string) => {
    switch (taskType) {
      case "quiz":
        return "Quiz";
      case "project":
        return "Projek";
      case "quiz_and_project":
        return "Quiz & Projek";
      default:
        return "-";
    }
  };

  const timeAgo = (dateString: string | null) => {
    if (!dateString) return null;

    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();

    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${minutes} menit lalu`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;

    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  };

  return (
    <section className="py-16 px-4 md:px-6 lg:px-10">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Apa yang Akan Kamu Pelajari
          </h2>

          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <svg
                className="w-full h-full rotate-[-90deg]"
                viewBox="0 0 40 40"
              >
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  stroke="#facc15"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-900">
                Progress: {progressPercent}%
              </span>
              <Circle className="w-2 h-2 fill-gray-400 text-gray-400" />
              <span className="text-sm text-gray-500">
                ({completed} / {total} kelas)
              </span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedSubChapters.map((chapter) => {
            const totalMinutes = chapter.modules.reduce(
              (acc, m) => acc + m.estimatedMinutes,
              0,
            );

            const isCompleted = chapter.progressPercent === 100;
            const isInProgress =
              chapter.progressPercent > 0 && chapter.progressPercent < 100;

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
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={chapter.coverImage}
                      alt={chapter.title}
                      width={300}
                      height={200}
                      className="w-full h-[200px] object-cover"
                    />

                    <span
                      className="
                        absolute top-3 right-3
                        flex items-center gap-2
                        bg-[#243A77] text-white
                        text-xs font-medium
                        px-4 py-2
                        rounded-full
                      "
                    >
                      <Image
                        src="/assets/elearning/jam.svg"
                        alt="durasi"
                        width={14}
                        height={14}
                      />
                      {formatDuration(totalMinutes)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {chapter.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {chapter.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-gray-600 mb-4">
                    <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-lg">
                      <Image
                        src="/assets/elearning/modulsubchapter.svg"
                        alt="modul"
                        width={14}
                        height={14}
                      />
                      {chapter.modules.length} modul
                    </span>

                    <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-lg capitalize">
                      <Image
                        src="/assets/elearning/quizprojecsubchapter.svg"
                        alt="quiz"
                        width={14}
                        height={14}
                      />
                      {getTaskLabel(chapter.taskType)}
                    </span>
                  </div>

                  {/* Progress / Action */}
                  <div className="flex items-center justify-between gap-4 mt-2">
                    <div className="flex-1 text-xs text-gray-600 min-h-[40px] flex items-center">
                      {isCompleted && (
                        <div className="flex items-center gap-2">
                          <Image
                            src="/assets/elearning/icon-park-solid_check-one.svg"
                            alt="selesai"
                            width={14}
                            height={14}
                          />
                          <span className="text-emerald-600 font-medium">
                            Selesai
                          </span>
                          <Circle className="w-1.5 h-1.5 fill-gray-400 text-gray-400" />
                          <span>{timeAgo(chapter.lastActivityAt)}</span>
                        </div>
                      )}

                      {isInProgress && (
                        <div className="w-full">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800">
                              Progress: {chapter.progressPercent}%
                            </span>
                            <Circle className="w-1.5 h-1.5 fill-gray-400 text-gray-400" />
                            <span>{timeAgo(chapter.lastActivityAt)}</span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{ width: `${chapter.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {!isCompleted && !isInProgress && (
                        <span className="text-sm font-medium text-gray-500">
                          Belum Dimulai
                        </span>
                      )}
                    </div>

                    <div className="w-[40%] max-w-[160px]">
                      <Link href={`/elearning/${practice.id}/${chapter.id}`}>
                        {isCompleted && (
                          <Button
                            size="sm"
                            className="
          w-full py-2.5 px-4
          bg-red-600 text-white
          border border-red-600
          hover:bg-emerald-700
        "
                          >
                            Ulangi
                          </Button>
                        )}

                        {isInProgress && (
                          <Button
                            size="sm"
                            className="
          w-full py-2.5 px-4
          bg-yellow-600 text-white
          border border-yellow-400
          hover:bg-emerald-700
        "
                          >
                            Lanjut
                          </Button>
                        )}

                        {!isCompleted && !isInProgress && (
                          <Button
                            size="sm"
                            className="
          bg-emerald-600 w-full py-2.5 px-4
          text-white
          hover:bg-emerald-700
        "
                          >
                            Mulai
                          </Button>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* TOGGLE BUTTON */}
        {practice.subChapters.length > MAX_VISIBLE && (
          <div className="mt-10 flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="
        group flex items-center gap-2
        border-emerald-600 text-emerald-600
        hover:bg-emerald-50 hover:text-emerald-700
        transition-all duration-300
        px-8 py-3
      "
            >
              <span className="font-medium">
                {showAll ? "Tampilkan Lebih Sedikit" : "Tampilkan Lebih Banyak"}
              </span>

              {showAll ? (
                <ChevronUp
                  className="
            w-4 h-4
            transition-transform duration-300
            group-hover:-translate-y-0.5
          "
                />
              ) : (
                <ChevronDown
                  className="
            w-4 h-4
            transition-transform duration-300
            group-hover:translate-y-0.5
          "
                />
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
