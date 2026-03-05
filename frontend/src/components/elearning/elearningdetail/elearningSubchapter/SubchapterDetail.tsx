"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { practices } from "@/data/practice";
import SubchapterNavbar from "./SubchapterNavbar";
import SubchapterSidebar from "./SubchapterSidebar";
import SubchapterHeroNavigation from "./SubchapterHeroNavigation";
import SubchapterContent from "./SubchapterContent";
import SubchapterFooter from "./SubchapterFooter";

interface Props {
  practiceId: string;
  subChapterId: string;
}

export default function SubChapterDetail({ practiceId, subChapterId }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const practice = practices.find((p) => String(p.id) === String(practiceId));
  if (!practice)
    return <div className="p-10 text-center">Practice tidak ditemukan</div>;

  const subChapter = practice.subChapters.find(
    (sc) => String(sc.id) === String(subChapterId),
  );
  if (!subChapter)
    return <div className="p-10 text-center">Subchapter tidak ditemukan</div>;

  const moduleParam = searchParams.get("module");
  const subModuleParam = searchParams.get("submodule");
  const taskParam = searchParams.get("task");

  let initialSubModule = null;
  let initialMode: any = null;

  // === TASK MODE ===
  if (taskParam === "quiz") {
    const lastModule = subChapter.modules[subChapter.modules.length - 1];
    if (lastModule?.quiz) {
      initialMode = { type: "quiz", data: lastModule.quiz };
    }
  }

  if (taskParam === "assignment") {
    const lastModule = subChapter.modules[subChapter.modules.length - 1];
    if (lastModule?.assignment) {
      initialMode = { type: "assignment", data: lastModule.assignment };
    }
  }

  // === SUBMODULE MODE ===
  if (!initialMode && moduleParam && subModuleParam) {
    const module = subChapter.modules[Number(moduleParam) - 1];
    const subModule = module?.subModules?.[Number(subModuleParam) - 1];

    if (subModule) {
      initialSubModule = subModule;
      initialMode = { type: "submodule", data: subModule };
    }
  }

  // fallback
  if (!initialMode) {
    const first = subChapter.modules?.[0]?.subModules?.[0];
    if (first) {
      initialSubModule = first;
      initialMode = { type: "submodule", data: first };
    }
  }

  const [activeSubModule, setActiveSubModule] = useState(initialSubModule);

  const [navigationSource, setNavigationSource] = useState<"manual" | "footer">(
    "manual",
  );

  const [contentMode, setContentMode] = useState<
    | { type: "submodule"; data: any }
    | { type: "quiz"; data: any }
    | { type: "assignment"; data: any }
    | null
  >(initialMode);

  const activeTaskType =
    contentMode?.type === "quiz" || contentMode?.type === "assignment"
      ? contentMode.type
      : null;

  useEffect(() => {
    // kalau sudah ada query, jangan ganggu
    if (moduleParam || subModuleParam || taskParam) return;

    // kalau mode submodule (default fallback)
    if (initialSubModule) {
      const moduleIndex = subChapter.modules.findIndex((m) =>
        m.subModules?.some((s) => s.id === initialSubModule.id),
      );

      const subModuleIndex =
        subChapter.modules[moduleIndex]?.subModules?.findIndex(
          (s) => s.id === initialSubModule.id,
        ) ?? 0;

      router.replace(
        `?module=${moduleIndex + 1}&submodule=${subModuleIndex + 1}`,
        { scroll: false },
      );
    }
  }, []);

  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [assignmentScore, setAssignmentScore] = useState<number | null>(null);

  /* ================= HERO META ================= */
  const heroMeta = useMemo(() => {
    // ================= SUBMODULE MODE =================
    if (contentMode?.type === "submodule" && activeSubModule) {
      const moduleIndex = subChapter.modules.findIndex((m) =>
        m.subModules?.some((sm) => sm.id === activeSubModule.id),
      );

      const module = subChapter.modules[moduleIndex];
      if (!module || !module.subModules) return null;

      const subModuleIndex = module.subModules.findIndex(
        (sm) => sm.id === activeSubModule.id,
      );

      return {
        moduleNumber: moduleIndex + 1,
        moduleTitle: module.title,
        subModuleNumber: subModuleIndex + 1,
        totalSubModules: module.subModules.length,
        subModuleTitle: activeSubModule.title,
      };
    }

    // ================= QUIZ / ASSIGNMENT MODE =================
    if (contentMode?.type === "quiz" || contentMode?.type === "assignment") {
      const lastModule = subChapter.modules[subChapter.modules.length - 1];
      if (!lastModule) return null;

      return {
        moduleNumber: subChapter.modules.length,
        moduleTitle: lastModule.title,
        subModuleNumber: lastModule.subModules?.length ?? 0,
        totalSubModules: lastModule.subModules?.length ?? 0,
        subModuleTitle: lastModule.title,
      };
    }

    return null;
  }, [contentMode, activeSubModule, subChapter.modules]);

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

  const allSubModules = useMemo(() => {
    return subChapter.modules.flatMap((module) =>
      (module.subModules ?? []).map((sm) => ({
        ...sm,
        moduleId: module.id,
        moduleTitle: module.title,
      })),
    );
  }, [subChapter.modules]);

  const taskFlow = useMemo(() => {
    const lastModule = subChapter.modules[subChapter.modules.length - 1];
    if (!lastModule) return [];

    const flow: { type: "quiz" | "assignment"; data: any }[] = [];

    if (lastModule.quiz) {
      flow.push({ type: "quiz", data: lastModule.quiz });
    }

    if (lastModule.assignment) {
      flow.push({ type: "assignment", data: lastModule.assignment });
    }

    return flow;
  }, [subChapter.modules]);

  const navigationMeta = useMemo(() => {
    // ================= SUBMODULE MODE =================
    if (contentMode?.type === "submodule" && activeSubModule) {
      const index = allSubModules.findIndex(
        (sm) => sm.id === activeSubModule.id,
      );

      const isLastSubModule = index === allSubModules.length - 1;

      return {
        prev: index > 0 ? allSubModules[index - 1] : null,
        next: !isLastSubModule
          ? allSubModules[index + 1]
          : taskFlow.length > 0
            ? {
                id: -1,
                title: taskFlow[0].data.title,
                moduleTitle:
                  taskFlow[0].type === "quiz"
                    ? "Penilaian Quiz"
                    : "Penilaian Assignment",
                __task: taskFlow[0],
              }
            : null,
      };
    }

    // ================= TASK MODE =================
    if (contentMode?.type === "quiz" || contentMode?.type === "assignment") {
      const taskIndex = taskFlow.findIndex((t) => t.type === contentMode.type);

      return {
        prev:
          taskIndex > 0
            ? {
                id: -1,
                title: taskFlow[taskIndex - 1].data.title,
                moduleTitle:
                  taskFlow[taskIndex - 1].type === "quiz"
                    ? "Penilaian Quiz"
                    : "Penilaian Assignment",
                __task: taskFlow[taskIndex - 1],
              }
            : (allSubModules[allSubModules.length - 1] ?? null),

        next:
          taskIndex < taskFlow.length - 1
            ? {
                id: -1,
                title: taskFlow[taskIndex + 1].data.title,
                moduleTitle:
                  taskFlow[taskIndex + 1].type === "quiz"
                    ? "Penilaian Quiz"
                    : "Penilaian Proyek",
                __task: taskFlow[taskIndex + 1],
              }
            : null,
      };
    }

    return { prev: null, next: null };
  }, [contentMode, activeSubModule, allSubModules, taskFlow]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex flex-1">
        <SubchapterSidebar
          practice={practice}
          subChapterId={String(subChapter.id)}
          activeSubModuleId={activeSubModule?.id}
          navigationSource={navigationSource}
          activeTaskType={activeTaskType} // ⬅️ INI
          onSelectSubModule={(sm) => {
            setNavigationSource("manual");
            setActiveSubModule(sm);
            setContentMode({ type: "submodule", data: sm });

            const moduleIndex = subChapter.modules.findIndex((m) =>
              m.subModules?.some((s) => s.id === sm.id),
            );

            if (moduleIndex === -1) return;

            const subModuleIndex =
              subChapter.modules[moduleIndex]?.subModules?.findIndex(
                (s) => s.id === sm.id,
              ) ?? 0;

            router.push(
              `?module=${moduleIndex + 1}&submodule=${subModuleIndex + 1}`,
              { scroll: false },
            );
          }}
          onSelectTask={(task) => {
            setActiveSubModule(null);
            setQuizScore(null);
            setIsQuizSubmitted(false);
            setAssignmentScore(null);

            setContentMode({ type: task.type, data: task.data });

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
            {contentMode && (
              <SubchapterContent
                mode={contentMode}
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

          // ================= TASK =================
          if ((item as any).__task) {
            const task = (item as any).__task;

            setActiveSubModule(null);
            setQuizScore(null);
            setIsQuizSubmitted(false);
            setAssignmentScore(null);

            setContentMode({
              type: task.type,
              data: task.data,
            });

            // TAMBAH INI
            router.push(`?task=${task.type}`, { scroll: false });

            return;
          }

          // ================= SUBMODULE =================
          setActiveSubModule(item);
          setContentMode({ type: "submodule", data: item });

          const moduleIndex = subChapter.modules.findIndex((m) =>
            m.subModules?.some((s) => s.id === item.id),
          );

          const subModuleIndex =
            subChapter.modules[moduleIndex]?.subModules?.findIndex(
              (s) => s.id === item.id,
            ) ?? 0;

          // TAMBAH INI
          router.push(
            `?module=${moduleIndex + 1}&submodule=${subModuleIndex + 1}`,
            { scroll: false },
          );
        }}
      />
    </div>
  );
}
