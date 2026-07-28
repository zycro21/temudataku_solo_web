"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import SubchapterNavbar from "./SubchapterNavbar";
import SubchapterSidebar from "./SubchapterSidebar";
import SubchapterHeroNavigation from "./SubchapterHeroNavigation";
import SubchapterContent from "./SubchapterContent";
import SubchapterFooter from "./SubchapterFooter";
import { useElearningSubChapterDetail } from "@/hooks/Useelearningsubchapterdetail";
import { useElearningTextDetail } from "@/hooks/Useelearningtextdetail";
import { useElearningCourseProgress } from "@/hooks/useElearningCourseProgress";
import { Loader2, SearchX } from "lucide-react";

// ─── Font ──────────────────────────────────────────────────────────────────
// Samain dengan halaman admin create/edit material — Plus Jakarta Sans,
// di-scope lokal ke halaman belajar ini aja (bukan global lewat layout),
// biar konsisten kelihatannya sama tapi tidak mempengaruhi halaman lain.
const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

interface Props {
  practiceId: string; // courseId
  subChapterId: string;
}

// 🔥 Adaptasi bentuk quiz dari API asli (questionText) ke bentuk yang
// dipakai QuizRenderer di SubchapterContent (textQuestion) — dibuat di
// sini biar SubchapterContent tidak perlu diubah sama sekali.
function adaptQuizForRenderer(quiz: any) {
  if (!quiz) return null;
  return {
    ...quiz,
    questions: (quiz.questions ?? []).map((q: any) => ({
      ...q,
      textQuestion: q.questionText,
    })),
  };
}

// 🔥 Adaptasi bentuk assignment dari API asli (instructions: {instruction,
// orderNumber}[]) ke bentuk yang dipakai AssignmentRenderer (instruction:
// string[]).
function adaptAssignmentForRenderer(assignment: any) {
  if (!assignment) return null;
  return {
    ...assignment,
    instruction: [...(assignment.instructions ?? [])]
      .sort((a: any, b: any) => a.orderNumber - b.orderNumber)
      .map((i: any) => i.instruction),
  };
}

type ContentMode =
  | { type: "submodule"; textId: string }
  | { type: "quiz"; textId: string }
  | { type: "assignment"; textId: string }
  | null;

export default function SubChapterDetail({ practiceId, subChapterId }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { subChapter, loading, errorType } =
    useElearningSubChapterDetail(subChapterId);

  // 🔥 Progress overall course — dipakai buat header progress bar di
  // sidebar (progress per-SubBab/Text belum ada endpoint-nya).
  const { progress } = useElearningCourseProgress(practiceId);
  const courseProgressForThisSubChapter = progress?.subChapterProgress.find(
    (sc) => sc.subChapterId === subChapterId,
  );

  // 🔥 Daftar materi ("submodule") per SubBab — text yang TIDAK punya
  // quiz/assignment dianggap materi biasa. Text yang punya quiz/assignment
  // diperlakukan sebagai node "Penilaian" terpisah (lihat taskFlow di bawah).
  const allTexts = useMemo(() => {
    if (!subChapter) return [];
    return subChapter.subBabs.flatMap((subBab) =>
      subBab.texts
        .filter((t) => !t.quiz && !t.assignment)
        .map((t) => ({
          ...t,
          subBabId: subBab.id,
          subBabTitle: subBab.title,
        })),
    );
  }, [subChapter]);

  // 🔥 Task (quiz + assignment) diambil dari SubBab TERAKHIR di SubChapter
  // ini — mengikuti pola lama (penilaian akhir kelas).
  const taskFlow = useMemo(() => {
    if (!subChapter || subChapter.subBabs.length === 0) return [];

    const lastSubBab = subChapter.subBabs[subChapter.subBabs.length - 1];
    const flow: {
      type: "quiz" | "assignment";
      textId: string;
      title: string;
    }[] = [];

    const quizText = lastSubBab.texts.find((t) => t.quiz);
    if (quizText?.quiz) {
      flow.push({
        type: "quiz",
        textId: quizText.id,
        title: quizText.quiz.title,
      });
    }

    const assignmentText = lastSubBab.texts.find((t) => t.assignment);
    if (assignmentText?.assignment) {
      flow.push({
        type: "assignment",
        textId: assignmentText.id,
        title: assignmentText.assignment.title,
      });
    }

    return flow;
  }, [subChapter]);

  const moduleParam = searchParams.get("module");
  const subModuleParam = searchParams.get("submodule");
  const taskParam = searchParams.get("task");

  const [contentMode, setContentMode] = useState<ContentMode>(null);
  const [navigationSource, setNavigationSource] = useState<"manual" | "footer">(
    "manual",
  );

  // 🔥 Set mode awal begitu struktur subChapter selesai di-load, mengikuti
  // query param (?module=&submodule= / ?task=) atau fallback ke text
  // pertama.
  useEffect(() => {
    if (!subChapter || contentMode) return;

    if (taskParam === "quiz" || taskParam === "assignment") {
      const task = taskFlow.find((t) => t.type === taskParam);
      if (task) {
        setContentMode({ type: task.type, textId: task.textId });
        return;
      }
    }

    if (moduleParam && subModuleParam) {
      const subBab = subChapter.subBabs[Number(moduleParam) - 1];
      const textsInSubBab = allTexts.filter((t) => t.subBabId === subBab?.id);
      const text = textsInSubBab[Number(subModuleParam) - 1];
      if (text) {
        setContentMode({ type: "submodule", textId: text.id });
        return;
      }
    }

    if (allTexts[0]) {
      setContentMode({ type: "submodule", textId: allTexts[0].id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subChapter, allTexts, taskFlow]);

  const activeTextId = contentMode?.textId ?? null;
  const { text: fullText, loading: textLoading } =
    useElearningTextDetail(activeTextId);

  const activeTaskType =
    contentMode?.type === "quiz" || contentMode?.type === "assignment"
      ? contentMode.type
      : null;

  /* ================= HERO META ================= */
  const heroMeta = useMemo(() => {
    if (!subChapter || !contentMode) return null;

    if (contentMode.type === "submodule") {
      const activeText = allTexts.find((t) => t.id === contentMode.textId);
      if (!activeText) return null;

      const subBabIndex = subChapter.subBabs.findIndex(
        (sb) => sb.id === activeText.subBabId,
      );
      const textsInSubBab = allTexts.filter(
        (t) => t.subBabId === activeText.subBabId,
      );
      const textIndex = textsInSubBab.findIndex((t) => t.id === activeText.id);

      return {
        moduleNumber: subBabIndex + 1,
        moduleTitle: activeText.subBabTitle,
        subModuleNumber: textIndex + 1,
        totalSubModules: textsInSubBab.length,
        subModuleTitle: activeText.title ?? "",
      };
    }

    // QUIZ / ASSIGNMENT
    const lastSubBab = subChapter.subBabs[subChapter.subBabs.length - 1];
    if (!lastSubBab) return null;

    return {
      moduleNumber: subChapter.subBabs.length,
      moduleTitle: lastSubBab.title,
      subModuleNumber: lastSubBab.texts.length,
      totalSubModules: lastSubBab.texts.length,
      subModuleTitle: lastSubBab.title,
    };
  }, [subChapter, contentMode, allTexts]);

  const heroOverrideMeta = useMemo(() => {
    if (!contentMode) return null;

    if (contentMode.type === "quiz") {
      return {
        title: "Penilaian Quiz",
        description:
          "Uji pemahamanmu melalui kuis singkat untuk menyelesaikan kelas ini.",
      };
    }

    if (contentMode.type === "assignment") {
      return {
        title: "Penilaian Proyek",
        description:
          "Kerjakan dan kumpulkan proyek sesuai instruksi untuk menyelesaikan kelas ini.",
      };
    }

    return null;
  }, [contentMode]);

  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [assignmentScore, setAssignmentScore] = useState<number | null>(null);

  /* ================= NAVIGATION (prev/next di footer) ================= */
  const navigationMeta = useMemo(() => {
    if (!contentMode) return { prev: null, next: null };

    if (contentMode.type === "submodule") {
      const index = allTexts.findIndex((t) => t.id === contentMode.textId);
      const isLast = index === allTexts.length - 1;

      return {
        prev:
          index > 0
            ? {
                id: allTexts[index - 1].id,
                title: allTexts[index - 1].title ?? "",
                moduleTitle: allTexts[index - 1].subBabTitle,
              }
            : null,
        next: !isLast
          ? {
              id: allTexts[index + 1].id,
              title: allTexts[index + 1].title ?? "",
              moduleTitle: allTexts[index + 1].subBabTitle,
            }
          : taskFlow.length > 0
            ? {
                id: taskFlow[0].textId,
                title: taskFlow[0].title,
                moduleTitle:
                  taskFlow[0].type === "quiz"
                    ? "Penilaian Quiz"
                    : "Penilaian Proyek",
                __task: taskFlow[0],
              }
            : null,
      };
    }

    // TASK MODE
    const taskIndex = taskFlow.findIndex(
      (t) => t.type === contentMode.type && t.textId === contentMode.textId,
    );

    return {
      prev:
        taskIndex > 0
          ? {
              id: taskFlow[taskIndex - 1].textId,
              title: taskFlow[taskIndex - 1].title,
              moduleTitle:
                taskFlow[taskIndex - 1].type === "quiz"
                  ? "Penilaian Quiz"
                  : "Penilaian Proyek",
              __task: taskFlow[taskIndex - 1],
            }
          : allTexts.length > 0
            ? {
                id: allTexts[allTexts.length - 1].id,
                title: allTexts[allTexts.length - 1].title ?? "",
                moduleTitle: allTexts[allTexts.length - 1].subBabTitle,
              }
            : null,
      next:
        taskIndex >= 0 && taskIndex < taskFlow.length - 1
          ? {
              id: taskFlow[taskIndex + 1].textId,
              title: taskFlow[taskIndex + 1].title,
              moduleTitle:
                taskFlow[taskIndex + 1].type === "quiz"
                  ? "Penilaian Quiz"
                  : "Penilaian Proyek",
              __task: taskFlow[taskIndex + 1],
            }
          : null,
    };
  }, [contentMode, allTexts, taskFlow]);

  /* ================= MODE UNTUK SubchapterContent ================= */
  const rendererMode = useMemo(() => {
    if (!contentMode || !fullText) return null;

    if (contentMode.type === "submodule") {
      return { type: "submodule" as const, data: fullText };
    }

    if (contentMode.type === "quiz") {
      return {
        type: "quiz" as const,
        data: adaptQuizForRenderer(fullText.quiz),
      };
    }

    return {
      type: "assignment" as const,
      data: adaptAssignmentForRenderer(fullText.assignment),
    };
  }, [contentMode, fullText]);

  if (loading) {
    return (
      <div
        className={`${jakartaSans.className} flex flex-col items-center justify-center min-h-screen gap-3`}
      >
        <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
        <p className="text-sm text-gray-500">Memuat materi...</p>
      </div>
    );
  }

  if (!subChapter || errorType) {
    return (
      <div
        className={`${jakartaSans.className} flex flex-col items-center justify-center min-h-screen gap-3 text-center px-6`}
      >
        <SearchX className="w-10 h-10 text-gray-300" />
        <p className="text-sm text-gray-500">
          Materi tidak ditemukan atau kamu belum punya akses ke sana.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`${jakartaSans.className} min-h-screen flex flex-col bg-white`}
    >
      <div className="flex flex-1">
        <SubchapterSidebar
          subChapter={subChapter}
          courseId={practiceId}
          activeTextId={
            contentMode?.type === "submodule" ? contentMode.textId : undefined
          }
          navigationSource={navigationSource}
          activeTaskType={activeTaskType}
          progressPercent={
            courseProgressForThisSubChapter?.progressPercent ?? 0
          }
          lastActivityAt={
            courseProgressForThisSubChapter?.lastActivityAt ?? null
          }
          onSelectText={(text) => {
            setNavigationSource("manual");
            setQuizScore(null);
            setIsQuizSubmitted(false);
            setAssignmentScore(null);
            setContentMode({ type: "submodule", textId: text.id });

            const subBabIndex = subChapter.subBabs.findIndex(
              (sb) => sb.id === text.subBabId,
            );
            const textsInSubBab = allTexts.filter(
              (t) => t.subBabId === text.subBabId,
            );
            const textIndex = textsInSubBab.findIndex((t) => t.id === text.id);

            router.push(
              `?module=${subBabIndex + 1}&submodule=${textIndex + 1}`,
              { scroll: false },
            );
          }}
          onSelectTask={(task) => {
            setNavigationSource("manual");
            setQuizScore(null);
            setIsQuizSubmitted(false);
            setAssignmentScore(null);
            setContentMode({ type: task.type, textId: task.textId });
            router.push(`?task=${task.type}`, { scroll: false });
          }}
        />

        <div className="flex-1 flex flex-col">
          <SubchapterNavbar practiceId={practiceId} />

          {heroMeta && (
            <SubchapterHeroNavigation
              moduleNumber={heroMeta.moduleNumber}
              moduleTitle={heroMeta.moduleTitle}
              subModuleNumber={heroMeta.subModuleNumber}
              totalSubModules={heroMeta.totalSubModules}
              subModuleTitle={heroMeta.subModuleTitle}
              overrideTitle={heroOverrideMeta?.title}
              overrideDescription={heroOverrideMeta?.description}
              quizScore={
                contentMode?.type === "quiz" && isQuizSubmitted
                  ? quizScore
                  : contentMode?.type === "assignment" &&
                      assignmentScore !== null
                    ? assignmentScore
                    : null
              }
            />
          )}

          {/* CONTENT AREA */}
          <main className="flex-1 overflow-y-auto px-6 py-8 pb-24 bg-white">
            {textLoading || !rendererMode ? (
              <div className="flex items-center justify-center min-h-[40vh] gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <p className="text-sm text-gray-500">Memuat konten...</p>
              </div>
            ) : (
              <SubchapterContent
                mode={rendererMode}
                onQuizSubmitScore={(score) => {
                  setQuizScore(score);
                  setIsQuizSubmitted(true);
                }}
                onQuizReset={() => {
                  setQuizScore(null);
                  setIsQuizSubmitted(false);
                }}
                onAssignmentScore={(score) => {
                  setAssignmentScore(score);
                }}
              />
            )}
          </main>
        </div>
      </div>

      <SubchapterFooter
        prev={navigationMeta?.prev ?? null}
        next={navigationMeta?.next ?? null}
        onNavigate={(item) => {
          setNavigationSource("footer");
          setQuizScore(null);
          setIsQuizSubmitted(false);
          setAssignmentScore(null);

          // ================= TASK =================
          if ((item as any).__task) {
            const task = (item as any).__task;
            setContentMode({ type: task.type, textId: task.textId });
            router.push(`?task=${task.type}`, { scroll: false });
            return;
          }

          // ================= SUBMODULE (Text) =================
          const text = allTexts.find((t) => t.id === item.id);
          if (!text) return;

          setContentMode({ type: "submodule", textId: text.id });

          const subBabIndex = subChapter.subBabs.findIndex(
            (sb) => sb.id === text.subBabId,
          );
          const textsInSubBab = allTexts.filter(
            (t) => t.subBabId === text.subBabId,
          );
          const textIndex = textsInSubBab.findIndex((t) => t.id === text.id);

          router.push(`?module=${subBabIndex + 1}&submodule=${textIndex + 1}`, {
            scroll: false,
          });
        }}
      />
    </div>
  );
}
