"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import SubchapterNavbar from "./SubchapterNavbar";
import SubchapterSidebar from "./SubchapterSidebar";
import SubchapterHeroNavigation from "./SubchapterHeroNavigation";
import SubchapterContent from "./SubchapterContent";
import SubchapterCertificateContent from "./SubchapterCertificateContent";
import SubchapterFooter from "./SubchapterFooter";
import SubchapterReviewModal from "./SubchapterReviewModal";
import { useElearningSubChapterDetail } from "@/hooks/Useelearningsubchapterdetail";
import { useElearningTextDetail } from "@/hooks/Useelearningtextdetail";
import { useElearningCourseProgress } from "@/hooks/useElearningCourseProgress";
import {
  useElearningTextProgress,
  type SubChapterProgressRecord,
} from "@/hooks/useElearningTextProgress";
import { useElearningSubChapterReview } from "@/hooks/Useelearningsubchapterreview";
import { useElearningSubChapterCertificate } from "@/hooks/useElearningSubChapterCertificate";
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
  | { type: "certificate" }
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

  // 🔥 BARU: override lokal buat progress SubChapter ini — begitu mentee
  // menyelesaikan satu item (scroll materi sampai bawah / submit quiz /
  // assignment-nya direview tuntas), backend langsung balikin angka
  // progressPercent + lastActivityAt YANG BARU (lihat
  // useElearningTextProgress.ts). Kita simpan di sini supaya sidebar
  // ke-update SEKETIKA tanpa nunggu refetch penuh `useElearningCourseProgress`
  // (yang datanya course-wide, bukan cuma subchapter ini) — begitu ada
  // nilai di sini, dia menang dibanding angka dari `progress` di atas.
  const [progressOverride, setProgressOverride] =
    useState<SubChapterProgressRecord | null>(null);

  const { markTextComplete, syncSubChapterProgress } = useElearningTextProgress(
    (updated) => {
      if (updated.subChapterId === subChapterId) {
        setProgressOverride(updated);
      }
    },
  );

  const displayProgressPercent =
    progressOverride?.progressPercent ??
    courseProgressForThisSubChapter?.progressPercent ??
    0;
  const displayLastActivityAt =
    progressOverride?.lastActivityAt ??
    courseProgressForThisSubChapter?.lastActivityAt ??
    null;

  // 🔥 BARU: modal review otomatis — begitu progress SubChapter ini
  // nyentuh 100%, cek apakah mentee sudah pernah review. Kalau BELUM,
  // modal otomatis muncul. Modal bisa ditutup (tombol "Nanti Saja" / X)
  // tanpa mengirim apa pun — tapi karena `reviewCheckedRef` di-reset
  // setiap kali komponen ini di-mount ulang (mis. mentee keluar lalu
  // masuk lagi ke SubChapter/course ini), pengecekan akan jalan lagi
  // dari awal tiap kunjungan baru, dan modal akan muncul LAGI selama
  // belum ada review tersimpan — persis sesuai yang diminta. Begitu
  // review berhasil dikirim, `myReview` dari hook langsung terisi, jadi
  // modal nggak akan ke-trigger lagi meski effect ini re-run.
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const reviewCheckedRef = useRef(false);
  const {
    isSubmitting: isSubmittingReview,
    checkMyReview,
    submitReview,
  } = useElearningSubChapterReview();

  useEffect(() => {
    if (displayProgressPercent < 100) return;
    if (reviewCheckedRef.current) return;
    reviewCheckedRef.current = true;

    (async () => {
      const existing = await checkMyReview(subChapterId);
      // `existing === undefined` berarti pengecekannya gagal (mis. network
      // error) — jangan paksa nampilin modal dalam kondisi nggak pasti
      // begini, biar nggak keliru muncul buat mentee yang sebenarnya
      // sudah pernah review.
      if (existing === null) {
        setReviewModalOpen(true);
      }
    })();
  }, [displayProgressPercent, subChapterId, checkMyReview]);

  // 🔥 BARU: sertifikat otomatis — begitu progress SubChapter ini 100%,
  // cek dulu apakah mentee sudah punya sertifikatnya (bisa saja sudah,
  // dari kunjungan sebelumnya), kalau belum langsung generate. Sengaja
  // effect TERPISAH dari effect review modal di atas (beda concern, beda
  // syarat retry) walau triggernya sama-sama `displayProgressPercent`.
  // `ensureCertificate` sendiri yang menjaga supaya tidak nembak API
  // berulang-ulang (lihat useElearningSubChapterCertificate.ts).
  const {
    certificate,
    status: certificateStatus,
    ensureCertificate,
  } = useElearningSubChapterCertificate();

  useEffect(() => {
    if (!subChapterId) return;
    // 🔥 HANYA jalankan kalau progress sudah 100%
    if (displayProgressPercent < 100) return;
    ensureCertificate(subChapterId, displayProgressPercent);
  }, [displayProgressPercent, subChapterId, ensureCertificate]);

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

    // 🔥 BARU: buka langsung ke tampilan sertifikat kalau URL-nya
    // ?task=certificate (mis. dari bookmark/refresh setelah sebelumnya
    // klik tombol "Sertifikat" — lihat router.push di onSelectCertificate
    // di bawah). Tidak perlu validasi macam-macam di sini; komponen
    // SubchapterCertificateContent sendiri yang menangani kalau
    // ternyata sertifikatnya belum siap/gagal (status checking/error).
    if (taskParam === "certificate") {
      setContentMode({ type: "certificate" });
      return;
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
      return;
    }

    // 🔥 TAMBAHAN: fallback ke task (quiz/assignment) pertama kalau memang
    // tidak ada materi biasa, tapi ada quiz/assignment yang published.
    if (taskFlow[0]) {
      setContentMode({ type: taskFlow[0].type, textId: taskFlow[0].textId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subChapter, allTexts, taskFlow]);

  const activeTextId =
    contentMode && contentMode.type !== "certificate"
      ? contentMode.textId
      : null;
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

  // 🔥 BARU: deteksi "sudah scroll sampai bawah" buat materi (submodule)
  // — quiz & assignment progress-nya ditandai dari dalam
  // SubchapterContent.tsx sendiri (lewat onContentCompleted, dipanggil
  // pas attempt/submission sudah final), BUKAN dari scroll, jadi handler
  // ini sengaja no-op kalau `contentMode.type` bukan "submodule". Threshold
  // 32px dari bawah — nggak menuntut PERSIS mentok piksel terakhir (yang
  // gampang meleset gara-gara sub-pixel rounding di browser berbeda-beda).
  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (contentMode?.type !== "submodule" || !activeTextId) return;

    const el = e.currentTarget;
    const SCROLL_BOTTOM_THRESHOLD_PX = 32;
    const reachedBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight <=
      SCROLL_BOTTOM_THRESHOLD_PX;

    if (reachedBottom) {
      markTextComplete(activeTextId);
    }
  };

  // Ref buat container scroll (`<main>` di JSX bawah) — dipakai oleh
  // effect "konten pendek" di bawah `rendererMode` (lihat catatan di
  // sana kenapa effect-nya HARUS ditaruh setelah `rendererMode`
  // dideklarasikan).
  const mainRef = useRef<HTMLDivElement | null>(null);

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

    // 🔥 BARU: mode "certificate" nggak butuh HeroNavigation (komponen
    // SubchapterCertificateContent sudah punya header sendiri) — return
    // null di sini SEKALIGUS menyempitkan (narrow) tipe `contentMode` di
    // bawah supaya TypeScript tahu sisanya cuma "quiz" | "assignment"
    // (keduanya punya `textId`, beda dengan "certificate").
    if (contentMode.type === "certificate") return null;

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

    // 🔥 BARU: mode "certificate" dirender LANGSUNG di JSX (lihat cabang
    // `contentMode?.type === "certificate"` di CONTENT AREA di bawah),
    // sama sekali nggak lewat `fullText`/`rendererMode` — jadi cukup
    // return null di sini (sekaligus narrow tipe `contentMode` supaya
    // `contentMode.textId` di baris bawah aman secara TypeScript, karena
    // variant "certificate" nggak punya field itu).
    if (contentMode.type === "certificate") return null;

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

  // 🔥 BARU: kalau konten materinya PENDEK (lebih pendek dari tinggi area
  // konten, jadi nggak ada apa pun buat di-scroll), `onScroll` di
  // `handleContentScroll` di atas nggak akan pernah kepicu sama sekali —
  // user tetap "sudah baca semuanya" cuma karena buka halamannya, cuma
  // nggak sempat scroll. Effect ini ngecek sekali tiap kali materi
  // (submodule) aktif berganti/selesai loading: kalau isinya nggak
  // melebihi tinggi container (`scrollHeight <= clientHeight`), langsung
  // tandai selesai tanpa nunggu scroll. `requestAnimationFrame` dipakai
  // supaya pengecekan tinggi kontennya dilakukan SETELAH browser selesai
  // layout render terbaru (kalau dicek di frame yang sama, `scrollHeight`
  // bisa masih kepakai nilai dari konten sebelumnya).
  //
  // 🔥 FIX (TS2448/TS2454 "used before its declaration"): effect ini
  // sengaja ditaruh DI SINI — SETELAH `rendererMode` (di atas) selesai
  // didefinisikan — bukan lagi di dekat `handleContentScroll`/`mainRef`
  // seperti sebelumnya. `rendererMode` dideklarasikan pakai `const` lewat
  // `useMemo`, jadi dia kena temporal dead zone: dipakai di dependency
  // array sebuah hook yang letaknya (secara tekstual di source, bukan
  // urutan eksekusi runtime) SEBELUM baris deklarasinya → error di
  // compile time. Ini murni soal urutan baris kode, bukan soal isi
  // logic-nya — makanya cukup dipindah ke bawah sini, isinya sama persis.
  useEffect(() => {
    if (contentMode?.type !== "submodule" || !activeTextId) return;
    if (textLoading || !rendererMode) return;

    const raf = requestAnimationFrame(() => {
      const el = mainRef.current;
      if (!el) return;
      const notScrollable = el.scrollHeight <= el.clientHeight + 4;
      if (notScrollable) markTextComplete(activeTextId);
    });

    return () => cancelAnimationFrame(raf);
  }, [contentMode, activeTextId, textLoading, rendererMode, markTextComplete]);

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
          progressPercent={displayProgressPercent}
          lastActivityAt={displayLastActivityAt}
          certificateStatus={certificateStatus}
          isCertificateActive={contentMode?.type === "certificate"}
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
          onSelectCertificate={() => {
            // 🔥 BARU: buka sertifikat DI AREA KONTEN UTAMA — sama
            // treatment-nya kayak klik quiz/assignment, cuma nggak perlu
            // fetch fullText apa pun (lihat rendering di bawah, cabang
            // `contentMode?.type === "certificate"` di-render LANGSUNG,
            // di luar alur textLoading/rendererMode).
            setNavigationSource("manual");
            setQuizScore(null);
            setIsQuizSubmitted(false);
            setAssignmentScore(null);
            setContentMode({ type: "certificate" });
            router.push(`?task=certificate`, { scroll: false });
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
          <main
            ref={mainRef}
            onScroll={handleContentScroll}
            className="flex-1 overflow-y-auto px-6 py-8 pb-24 bg-white"
          >
            {contentMode?.type === "certificate" ? (
              <SubchapterCertificateContent
                status={certificateStatus}
                certificate={certificate}
                onRetry={() =>
                  ensureCertificate(subChapterId, displayProgressPercent)
                }
              />
            ) : !contentMode &&
              allTexts.length === 0 &&
              taskFlow.length === 0 ? (
              // 🔥 TAMBAHAN: subChapter ini belum punya modul/materi yang
              // published sama sekali — jangan nampilin spinner selamanya,
              // kasih info jelas.
              <div className="relative overflow-hidden flex flex-col items-center justify-center min-h-[40vh] px-6 py-12 text-center">
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

                <div className="relative w-full max-w-sm">
                  <div className="relative rounded-2xl border border-emerald-100 bg-white/80 backdrop-blur-sm shadow-xl shadow-emerald-900/5 px-6 py-9">
                    {/* Top accent bar */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />

                    {/* Icon with rotating dashed ring */}
                    <div className="relative mx-auto mb-5 flex items-center justify-center w-16 h-16">
                      <span
                        className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-300 animate-spin"
                        style={{ animationDuration: "12s" }}
                      />
                      <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <SearchX className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      Materi Belum Tersedia
                    </h3>

                    <p className="text-sm text-gray-500 leading-relaxed">
                      Pemateri masih menyiapkan modul untuk kelas ini. Coba cek
                      kembali lain waktu.
                    </p>
                  </div>
                </div>
              </div>
            ) : textLoading || !rendererMode ? (
              <div className="flex items-center justify-center min-h-[40vh] gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <p className="text-sm text-gray-500">Memuat konten...</p>
              </div>
            ) : (
              <SubchapterContent
                mode={rendererMode}
                textId={activeTextId}
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
                onContentCompleted={(completedTextId) => {
                  // 🔥 FIX: quiz & assignment TIDAK lagi ditandai lewat
                  // markTextComplete (yang nulis ke ELearningTextProgress
                  // — cocoknya buat materi doang, bukan quiz/assignment).
                  // Sumber kebenaran quiz/assignment ada di
                  // ELearningQuizAttempt/ELearningSubmission sendiri, jadi
                  // cukup minta backend hitung ULANG dari situ tiap kali
                  // halaman quiz/assignment ini dibuka & dianggap selesai
                  // — hasilnya selalu segar, nggak nyangkut di angka lama
                  // kalau attempt/submission-nya berubah/dihapus.
                  syncSubChapterProgress(subChapterId, completedTextId);
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

      <SubchapterReviewModal
        open={reviewModalOpen}
        subChapterTitle={subChapter.title}
        isSubmitting={isSubmittingReview}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={async (payload) => {
          const result = await submitReview(subChapterId, payload);
          // 🔥 Cuma tutup modal kalau submit-nya BENERAN sukses (result
          // bukan null) — kalau gagal (mis. rating tidak valid, sudah
          // pernah review dari device lain), modal tetap terbuka biar
          // mentee bisa lihat toast error-nya dan coba lagi.
          if (result) setReviewModalOpen(false);
        }}
      />
    </div>
  );
}
