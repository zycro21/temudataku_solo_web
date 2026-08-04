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

  // 🔥 FIX: dulu quiz/assignment cuma dicari di SubBab TERAKHIR
  // (`subChapter.subBabs[subChapter.subBabs.length - 1]`), ngikutin asumsi
  // lama "penilaian selalu di akhir kelas". Tapi sesuai skema Prisma,
  // `quiz`/`assignment` itu relasi ke ELearningText (`text.quiz` /
  // `text.assignment`), dan ELearningText bisa ada di SubBab MANA SAJA —
  // bukan cuma yang terakhir. Kalau quiz/assignment-nya nempel di Text di
  // SubBab yang bukan terakhir, kode lama nggak akan pernah nemuin dia sama
  // sekali: Text itu sudah difilter keluar dari `allTexts` (karena
  // `!t.quiz && !t.assignment`), TAPI juga nggak masuk `taskFlow` (karena
  // taskFlow cuma ngecek lastSubBab) — jadi Text itu lenyap total dari
  // sidebar. Itu sebabnya "modulenya kosong": pas SubBab yang punya
  // quiz/assignment itu di-drop/dibuka, nggak ada poin apa pun yang
  // muncul.
  //
  // Fix: scan SEMUA SubBab (bukan cuma yang terakhir) buat nyari Text yang
  // punya quiz/assignment.
  const taskFlow = useMemo(() => {
    if (!subChapter) return [];

    const flow: {
      type: "quiz" | "assignment";
      textId: string;
      title: string;
    }[] = [];

    subChapter.subBabs.forEach((subBab) => {
      const quizText = subBab.texts.find((t) => t.quiz);
      if (quizText?.quiz) {
        flow.push({
          type: "quiz",
          textId: quizText.id,
          title: quizText.quiz.title,
        });
      }

      const assignmentText = subBab.texts.find((t) => t.assignment);
      if (assignmentText?.assignment) {
        flow.push({
          type: "assignment",
          textId: assignmentText.id,
          title: assignmentText.assignment.title,
        });
      }
    });

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

  // 🔥 Quiz/assignment sekarang bisa ada di lebih dari satu SubBab, jadi
  // sidebar butuh tahu textId-nya juga (bukan cuma type-nya) buat nentuin
  // MARKER quiz/assignment yang mana persisnya yang lagi aktif.
  const activeTaskTextId =
    contentMode?.type === "quiz" || contentMode?.type === "assignment"
      ? contentMode.textId
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
    // 🔥 FIX: sama seperti taskFlow di atas — jangan asumsikan lastSubBab,
    // cari SubBab yang BENERAN memiliki Text aktif ini (quiz/assignment
    // bisa ada di SubBab mana saja).
    const activeTask = taskFlow.find(
      (t) => t.type === contentMode.type && t.textId === contentMode.textId,
    );
    if (!activeTask) return null;

    const ownerSubBabIndex = subChapter.subBabs.findIndex((sb) =>
      sb.texts.some((t) => t.id === activeTask.textId),
    );
    const ownerSubBab = subChapter.subBabs[ownerSubBabIndex];
    if (ownerSubBabIndex === -1 || !ownerSubBab) return null;

    return {
      moduleNumber: ownerSubBabIndex + 1,
      moduleTitle: ownerSubBab.title,
      subModuleNumber: ownerSubBab.texts.length,
      totalSubModules: ownerSubBab.texts.length,
      subModuleTitle: ownerSubBab.title,
    };
  }, [subChapter, contentMode, allTexts, taskFlow]);

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
  // 🔥 FIX: navigasi lama nganggep alurnya cuma 2 fase: SEMUA submodule
  // dulu (dari `allTexts`, flat lintas SubBab), baru SEMUA task (dari
  // `taskFlow`, yang sekarang bisa nempel di SubBab mana aja) di paling
  // akhir. Itu cuma benar kalau quiz/assignment SELALU di SubBab terakhir.
  // Sekarang quiz/assignment bisa nempel di SubBab mana pun, jadi alur
  // prev/next yang benar harus di-interleave PER SubBab: materi SubBab itu
  // dulu, baru quiz/assignment SubBab itu (kalau ada), baru lanjut ke
  // SubBab berikutnya — dst.
  const navigationMeta = useMemo(() => {
    if (!contentMode || !subChapter) return { prev: null, next: null };

    type FlowEntry =
      | { kind: "submodule"; id: string; title: string; subBabTitle: string }
      | {
          kind: "task";
          taskType: "quiz" | "assignment";
          id: string;
          title: string;
          subBabTitle: string;
        };

    const flow: FlowEntry[] = [];

    subChapter.subBabs.forEach((subBab) => {
      subBab.texts
        .filter((t) => !t.quiz && !t.assignment)
        .forEach((t) => {
          flow.push({
            kind: "submodule",
            id: t.id,
            title: t.title ?? "",
            subBabTitle: subBab.title,
          });
        });

      const quizText = subBab.texts.find((t) => t.quiz);
      if (quizText?.quiz) {
        flow.push({
          kind: "task",
          taskType: "quiz",
          id: quizText.id,
          title: quizText.quiz.title,
          subBabTitle: subBab.title,
        });
      }

      const assignmentText = subBab.texts.find((t) => t.assignment);
      if (assignmentText?.assignment) {
        flow.push({
          kind: "task",
          taskType: "assignment",
          id: assignmentText.id,
          title: assignmentText.assignment.title,
          subBabTitle: subBab.title,
        });
      }
    });

    const activeIndex = flow.findIndex((entry) =>
      entry.kind === "submodule"
        ? contentMode.type === "submodule" && entry.id === contentMode.textId
        : contentMode.type === entry.taskType &&
          entry.id === contentMode.textId,
    );

    if (activeIndex === -1) return { prev: null, next: null };

    const toNavItem = (entry: FlowEntry) =>
      entry.kind === "submodule"
        ? { id: entry.id, title: entry.title, moduleTitle: entry.subBabTitle }
        : {
            id: entry.id,
            title: entry.title,
            moduleTitle:
              entry.taskType === "quiz" ? "Penilaian Quiz" : "Penilaian Proyek",
            __task: {
              type: entry.taskType,
              textId: entry.id,
              title: entry.title,
            },
          };

    return {
      prev: activeIndex > 0 ? toNavItem(flow[activeIndex - 1]) : null,
      next:
        activeIndex < flow.length - 1 ? toNavItem(flow[activeIndex + 1]) : null,
    };
  }, [contentMode, subChapter]);

  /* ================= MODE UNTUK SubchapterContent ================= */
  const rendererMode = useMemo(() => {
    if (!contentMode || !fullText) return null;

    // 🔥 FIX crash "Cannot read properties of null (reading 'questions'/
    // 'description')" di QuizRenderer/AssignmentRenderer:
    //
    // `fullText` dari useElearningTextDetail(activeTextId) itu STATE —
    // begitu `contentMode` ganti (mis. user klik marker quiz/assignment
    // yang textId-nya beda dari text yang lagi aktif), textId baru
    // langsung diteruskan ke hook, TAPI `fullText` belum ke-update ke data
    // yang baru sampai fetch-nya selesai. Untuk SATU frame render itu,
    // `fullText` masih berisi data TEXT LAMA (mis. materi biasa yang
    // `quiz`/`assignment`-nya null) sementara `contentMode.type` sudah
    // "quiz"/"assignment". Akibatnya `adaptQuizForRenderer(fullText.quiz)`
    // / `adaptAssignmentForRenderer(fullText.assignment)` sempat
    // menghasilkan `data: null` di frame itu, dan QuizRenderer/
    // AssignmentRenderer langsung coba akses `quiz.questions`/
    // `a.description` dari null → crash.
    //
    // Fix: kalau `fullText` yang di tangan BUKAN punya Text yang sesuai
    // dengan textId yang lagi aktif, anggap masih loading (rendererMode
    // null dulu) — parent (`textLoading || !rendererMode`) akan nampilin
    // loader "Memuat konten..." sampai fetch textId yang benar selesai,
    // alih-alih coba render data basi.
    if (fullText.id !== contentMode.textId) return null;

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
          activeTaskTextId={activeTaskTextId}
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

        {/* 🔥 FIX (sidebar ikut menyempit kalau judul materi panjang):
            `min-w-0` di sini WAJIB ada. Sebagai flex item di baris
            `<div className="flex flex-1">` bareng sidebar, div ini
            defaultnya (`min-width: auto`) nggak akan pernah menyusut di
            bawah lebar konten terlebarnya — kalau HeroNavigation di
            dalamnya butuh ruang lebih (judul panjang, dst), div ini bakal
            "maksa" tetap selebar itu, dan sidebar di sebelahnya yang
            akhirnya kena susut walau sudah dikunci `shrink-0` + w-[240px]
            (lihat SubchapterSidebar.tsx). `min-w-0` di sini + `min-w-0` +
            `break-words` di wrapper judul HeroNavigation (lihat
            SubchapterHeroNavigation.tsx) sama-sama diperlukan supaya judul
            panjang WRAP ke bawah, bukan mendorong lebar ke samping. */}
        <div className="flex-1 min-w-0 flex flex-col">
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
