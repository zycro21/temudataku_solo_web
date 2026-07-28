"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type {
  ElearningSubChapterDetailApiItem,
  ElearningTextSummaryApiItem,
} from "@/hooks/Useelearningsubchapterdetail";

interface TextWithSubBab extends ElearningTextSummaryApiItem {
  subBabId: string;
  subBabTitle: string;
}

interface Props {
  subChapter: ElearningSubChapterDetailApiItem;
  courseId: string;
  activeTextId?: string;
  navigationSource?: "manual" | "footer";

  activeTaskType?: "quiz" | "assignment" | null;

  // 🔥 Progress overall course untuk SubChapter ini — belum ada endpoint
  // progress per-SubBab/Text, jadi checklist selesai/belum per item materi
  // sengaja TIDAK ditampilkan dulu (daripada dipalsukan).
  progressPercent?: number;
  lastActivityAt?: string | null;

  onSelectText?: (text: TextWithSubBab) => void;
  onSelectTask?: (task: {
    type: "quiz" | "assignment";
    textId: string;
    title: string;
  }) => void;
}

export default function ModuleSidebar({
  subChapter,
  courseId,
  activeTextId,
  navigationSource,
  activeTaskType,
  progressPercent = 0,
  lastActivityAt,
  onSelectText,
  onSelectTask,
}: Props) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (navigationSource !== "footer" || !activeTextId) return;

    const activeSubBab = subChapter.subBabs.find((sb) =>
      sb.texts.some((t) => t.id === activeTextId),
    );

    if (!activeSubBab) return;

    setOpenModules({ [activeSubBab.id]: true });
  }, [activeTextId, navigationSource, subChapter]);

  const timeAgo = (dateString?: string | null) => {
    if (!dateString) return "-";

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

  const lastAccessed = timeAgo(lastActivityAt);

  const filteredSubBabs = useMemo(() => {
    if (!keyword) return subChapter.subBabs;
    const key = keyword.toLowerCase();

    return subChapter.subBabs.filter(
      (sb) =>
        sb.title.toLowerCase().includes(key) ||
        sb.texts.some((t) => (t.title ?? "").toLowerCase().includes(key)),
    );
  }, [keyword, subChapter]);

  /* ================= TASKS (QUIZ & ASSIGNMENT) — dari SubBab terakhir ================= */
  const tasks = useMemo(() => {
    if (!subChapter.subBabs.length) return [];

    const lastSubBab = subChapter.subBabs[subChapter.subBabs.length - 1];
    const result: {
      type: "quiz" | "assignment";
      label: string;
      title: string;
      icon: string;
      textId: string;
    }[] = [];

    const quizText = lastSubBab.texts.find((t) => t.quiz);
    if (quizText?.quiz) {
      result.push({
        type: "quiz",
        label: "Penilaian Quiz",
        title: quizText.quiz.title,
        icon: "/assets/elearning/penilaian.svg",
        textId: quizText.id,
      });
    }

    const assignmentText = lastSubBab.texts.find((t) => t.assignment);
    if (assignmentText?.assignment) {
      result.push({
        type: "assignment",
        label: "Penilaian Proyek",
        title: assignmentText.assignment.title,
        icon: "/assets/elearning/penilaian.svg",
        textId: assignmentText.id,
      });
    }

    return result;
  }, [subChapter]);

  return (
    <aside
      className="w-[240px] sticky top-0 bg-white border-r hidden lg:flex flex-col"
      style={{ height: "calc(100vh - 60px)" }}
    >
      {/* HEADER */}
      <div className="p-4 border-b">
        <button
          onClick={() => router.push(`/elearning/${courseId}`)}
          className="flex items-center gap-2 text-[11px] text-gray-500 hover:text-gray-700 cursor-pointer transition-colors mb-4"
        >
          <Image
            src="/assets/elearning/arrowback.svg"
            alt="back"
            width={7}
            height={7}
          />
          Kembali
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-4 text-left">
          {subChapter.title}
        </h2>

        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between text-[11px] font-bold text-gray-600">
            <span>Progress: {Math.round(progressPercent)}%</span>
            <span>Terakhir diakses: {lastAccessed}</span>
          </div>

          <div className="h-1.5 w-full bg-gray-100 rounded-full">
            <div
              className="h-1.5 bg-emerald-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="relative mt-6">
          <Image
            src="/assets/elearning/search.svg"
            alt="search"
            width={12}
            height={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-60"
          />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cari"
            className="w-full pl-8 pr-3 py-2 text-xs bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-xs pb-8">
        {filteredSubBabs.map((subBab) => {
          const isOpen = openModules[subBab.id] ?? false;

          // 🔥 "materi" biasa = text yang tidak punya quiz/assignment
          const materiTexts = subBab.texts.filter(
            (t) => !t.quiz && !t.assignment,
          );

          return (
            <div key={subBab.id} className="space-y-1.5">
              <button
                onClick={() =>
                  setOpenModules((p) => ({
                    ...p,
                    [subBab.id]: !isOpen,
                  }))
                }
                className="flex items-center justify-between w-full px-1.5 py-1 rounded-md text-left
                cursor-pointer transition hover:bg-gray-100"
              >
                <div className="flex items-center gap-2 text-[11px] text-black">
                  <Image
                    src="/assets/elearning/arrowup.svg"
                    alt="toggle"
                    width={9}
                    height={9}
                    className={`transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                  {subBab.title}
                </div>
              </button>

              {isOpen && (
                <ul className="pl-5 space-y-1.5">
                  {materiTexts.map((text) => {
                    const isActive =
                      !activeTaskType && text.id === activeTextId;

                    return (
                      <li
                        key={text.id}
                        onClick={() =>
                          onSelectText?.({
                            ...text,
                            subBabId: subBab.id,
                            subBabTitle: subBab.title,
                          })
                        }
                        className={`flex items-center gap-2 px-1.5 py-1 rounded-md cursor-pointer transition
${
  isActive
    ? "bg-emerald-500 text-white font-bold py-1.5"
    : "text-gray-900 hover:text-gray-600 hover:bg-gray-100"
}`}
                      >
                        <div className="flex items-center justify-center w-3 h-3">
                          <Image
                            src="/assets/elearning/submodule-unfinished.svg"
                            alt="status"
                            width={9}
                            height={9}
                            className={isActive ? "brightness-0 invert" : ""}
                          />
                        </div>

                        <span className="text-[10px] leading-relaxed text-left">
                          {text.title}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        {/* PENILAIAN */}
        {tasks.map((task) => {
          const isTaskActive = activeTaskType === task.type;

          return (
            <button
              key={task.type}
              onClick={() =>
                onSelectTask?.({
                  type: task.type,
                  textId: task.textId,
                  title: task.title,
                })
              }
              className={`w-full text-left rounded-lg px-2.5 py-2.5 transition cursor-pointer
        ${
          isTaskActive
            ? "bg-emerald-500 text-white"
            : "hover:bg-gray-100 text-gray-800"
        }`}
            >
              {/* LABEL */}
              <div
                className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase
          ${isTaskActive ? "text-white" : "text-gray-500"}`}
              >
                <Image
                  src={task.icon}
                  alt={task.type}
                  width={12}
                  height={12}
                  className={isTaskActive ? "brightness-0 invert" : ""}
                />
                <span>{task.label}</span>
              </div>

              {/* TITLE */}
              <div className="pl-[18px] mt-1 text-xs font-semibold">
                {task.title}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
