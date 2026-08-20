"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
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
import { useElearningSubChapterTextProgress } from "@/hooks/useElearningSubChapterTextProgress";
import {
  useElearningTextProgress,
  type SubChapterProgressRecord,
} from "@/hooks/useElearningTextProgress";
import { useElearningSubChapterReview } from "@/hooks/Useelearningsubchapterreview";
import { useElearningSubChapterCertificate } from "@/hooks/useElearningSubChapterCertificate";
import {
  Loader2,
  SearchX,
  Lock,
  LogIn,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

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

  // 🔥 Asal halaman ini dibuka, dipakai buat tombol "Kembali" di
  // state login/subscription/not-found di bawah — samain sama pola
  // yang dipakai ElearningDetail supaya konsisten balik ke tempat yang
  // benar (bukan `router.back()`).
  const from =
    searchParams.get("from") === "elearningfull"
      ? "elearningfull"
      : "elearning";

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

  // 🔥 BARU: id-id ELearningText & ELearningSubBab yang sudah selesai —
  // dipakai SubchapterSidebar buat render centang di tiap materi & di
  // header modul. Di-refetch (lihat callback useElearningTextProgress di
  // bawah) setiap kali satu item baru ditandai selesai, biar centangnya
  // muncul SEKETIKA tanpa nunggu reload halaman.
  const {
    completedTextIds,
    completedSubBabIds,
    refetch: refetchTextChecklist,
  } = useElearningSubChapterTextProgress(subChapterId);

  // 🔥 FIX (loop kelap-kelip sertifikat): callback ini SEBELUMNYA inline
  // arrow function langsung di argumen useElearningTextProgress(...) —
  // artinya identity-nya berubah SETIAP render SubchapterDetail. Karena
  // `syncSubChapterProgress` di dalam hook itu di-useCallback dengan
  // dependency `[onProgressUpdated]`, identity syncSubChapterProgress ikut
  // berubah tiap render juga — lalu itu jadi dependency di
  // handleContentCompleted di bawah, yang jadi dependency lagi di effect
  // quiz/assignment di SubchapterContent.tsx (via prop onContentCompleted)
  // — rantai identity yang terus berubah ini yang bikin effect di sana
  // re-run terus-terusan tiap render, manggil ensureCertificate berkali-
  // kali, yang setiap kali setStatus() → trigger re-render → loop lagi.
  // Fix: bungkus jadi useCallback yang STABIL (cuma berubah kalau
  // subChapterId atau refetchTextChecklist beneran berubah).
  const handleProgressUpdated = useCallback(
    (updated: SubChapterProgressRecord) => {
      if (updated.subChapterId === subChapterId) {
        setProgressOverride(updated);
      }
      refetchTextChecklist();
    },
    [subChapterId, refetchTextChecklist],
  );

  const { markTextComplete, syncSubChapterProgress } = useElearningTextProgress(
    handleProgressUpdated,
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
    notEligibleReason, // 🔥 BARU
    ensureCertificate,
  } = useElearningSubChapterCertificate();

  useEffect(() => {
    if (!subChapterId) return;
    if (displayProgressPercent < 100) return;
    ensureCertificate(subChapterId, displayProgressPercent);
  }, [displayProgressPercent, subChapterId, ensureCertificate]);

  // 🔥 FIX (loop kelap-kelip sertifikat): handler ini SEBELUMNYA inline
  // arrow function langsung di prop `onContentCompleted` <SubchapterContent
  // />. Efek quiz/assignment di SubchapterContent.tsx (baris yang
  // manggil `onContentCompleted?.(textId)`) punya `onContentCompleted`
  // sebagai dependency effect — jadi kalau identity-nya berubah TIAP
  // render (seperti inline arrow function), efek itu dianggap "berubah"
  // dan re-run terus, manggil `ensureCertificate` berkali-kali. Setiap
  // panggilan itu manggil `setStatus(...)` di dalam hook sertifikat →
  // trigger re-render SubchapterDetail → onContentCompleted baru lagi →
  // efek di SubchapterContent re-run lagi → LOOP TANPA HENTI (inilah
  // yang bikin sidebar kelap-kelip: checking → generating → not-eligible
  // → checking → ... terus-menerus).
  //
  // Fix: bungkus jadi useCallback yang STABIL — cuma berubah identity
  // kalau salah satu dependency-nya BENERAN berubah (subChapterId,
  // displayProgressPercent, atau syncSubChapterProgress/ensureCertificate
  // — yang sekarang juga sudah stabil, lihat handleProgressUpdated di
  // atas & fix di useElearningSubChapterCertificate.ts).
  const handleContentCompleted = useCallback(
    (completedTextId: string) => {
      // Quiz & assignment TIDAK ditandai lewat markTextComplete (yang
      // nulis ke ELearningTextProgress — cocoknya buat materi doang).
      // Sumber kebenaran quiz/assignment ada di
      // ELearningQuizAttempt/ELearningSubmission sendiri, jadi cukup
      // minta backend hitung ULANG dari situ.
      syncSubChapterProgress(subChapterId, completedTextId);

      // Re-cek eligibility sertifikat di sini juga, bukan cuma
      // mengandalkan effect `[displayProgressPercent]` — kalau progress
      // SUDAH 100% sebelum ini (attempt quiz kedua, atau assignment yang
      // baru selesai direview mentor di attempt kedua),
      // `displayProgressPercent` tidak berubah nilainya sama sekali,
      // sehingga effect itu TIDAK akan re-run. Panggil manual di sini
      // supaya syarat skor yang BARU langsung dicek ulang.
      ensureCertificate(subChapterId, displayProgressPercent);
    },
    [
      subChapterId,
      displayProgressPercent,
      syncSubChapterProgress,
      ensureCertificate,
    ],
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

  // 🔥 BARU: urutan akses SEHARUSNYA — flat SEMUA ELearningText (materi
  // + quiz + assignment) lintas SubBab, diurut PERSIS kayak yang
  // dirender di sidebar: per SubBab (sesuai `orderNumber`), materinya
  // dulu (sesuai `orderNumber`), baru quiz-nya (kalau ada), baru
  // assignment-nya (kalau ada) — lanjut ke SubBab berikutnya, dst. Ini
  // "kunci kebenaran" buat nentuin locked/unlocked, jadi sengaja
  // dihitung terpisah dari `allTexts`/`taskFlow`/`navigationMeta`
  // (yang masing-masing punya bentuk & kebutuhan beda) daripada
  // ngerombak logic yang sudah jalan.
  const globalFlow = useMemo(() => {
    if (!subChapter) return [];

    const flow: {
      id: string;
      kind: "submodule" | "quiz" | "assignment";
      subBabId: string;
    }[] = [];

    subChapter.subBabs.forEach((subBab) => {
      subBab.texts
        .filter((t) => !t.quiz && !t.assignment)
        .forEach((t) =>
          flow.push({ id: t.id, kind: "submodule", subBabId: subBab.id }),
        );

      const quizText = subBab.texts.find((t) => t.quiz);
      if (quizText)
        flow.push({ id: quizText.id, kind: "quiz", subBabId: subBab.id });

      const assignmentText = subBab.texts.find((t) => t.assignment);
      if (assignmentText)
        flow.push({
          id: assignmentText.id,
          kind: "assignment",
          subBabId: subBab.id,
        });
    });

    return flow;
  }, [subChapter]);

  // 🔥 BARU: Set berisi id ELearningText yang BOLEH diakses sekarang —
  // sebuah entry di `globalFlow` cuma boleh diakses kalau SEMUA entry
  // SEBELUM dia (bukan cuma satu sebelumnya) sudah completed
  // (`completedTextIds`, dari useElearningSubChapterTextProgress di
  // atas). Entry pertama selalu boleh diakses. Ini otomatis
  // menangani SEMUA kasus yang diminta:
  // - materi ke-3 butuh materi 1 & 2 SubBab yang sama selesai duluan
  //   (keduanya entry SEBELUM materi ke-3 di flow ini).
  // - quiz/assignment SubBab X butuh SEMUA materi SubBab X selesai
  //   (materi-materinya persis entry SEBELUM quiz/assignment itu).
  // - materi pertama SubBab berikutnya butuh SubBab sebelumnya (materi
  //   + quiz/assignment-nya) selesai TOTAL duluan.
  // Sengaja HANYA gate di sisi FE (bukan nambah validasi urutan di
  // backend) — sesuai yang diminta, cukup "kalau mau lompat, kelock".
  const unlockedTextIds = useMemo(() => {
    const unlocked = new Set<string>();
    let allPriorCompleted = true;

    for (const entry of globalFlow) {
      if (allPriorCompleted) unlocked.add(entry.id);
      allPriorCompleted = allPriorCompleted && completedTextIds.has(entry.id);
    }

    return unlocked;
  }, [globalFlow, completedTextIds]);

  // 🔥 BARU: item PALING AWAL di `globalFlow` yang belum completed —
  // ini "titik lanjut yang benar" buat tombol di pesan terkunci (lihat
  // cabang `isActiveLocked` di CONTENT AREA di bawah & `goToFlowEntry`
  // setelah state quiz/assignment). Karena `unlockedTextIds` dihitung
  // dari urutan yang SAMA, item ini SELALU unlocked (kalaupun belum
  // completed) — aman buat langsung dituju.
  const resumeEntry = useMemo(
    () => globalFlow.find((entry) => !completedTextIds.has(entry.id)) ?? null,
    [globalFlow, completedTextIds],
  );

  const moduleParam = searchParams.get("module");
  const subModuleParam = searchParams.get("submodule");
  const taskParam = searchParams.get("task");

  const [contentMode, setContentMode] = useState<ContentMode>(null);
  const [navigationSource, setNavigationSource] = useState<"manual" | "footer">(
    "manual",
  );

  // 🔥 BARU: apakah quiz/assignment yang lagi aktif punya jawaban/draft
  // yang BELUM disubmit — dilaporkan real-time oleh QuizRenderer/
  // AssignmentRenderer di SubchapterContent.tsx lewat prop
  // `onUnsavedChangesChange`. Dipakai buat mutuskan apa navigasi ke
  // materi/task lain (klik sidebar, tombol "Kembali", footer
  // Sebelumnya/Selanjutnya) perlu di-guard modal konfirmasi dulu, supaya
  // mentee nggak nggak sadar kehilangan jawaban yang sudah diisi.
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 🔥 BARU: nyimpen AKSI NAVIGASI yang sempat "ditahan" karena
  // `hasUnsavedChanges` masih true saat diklik — begitu mentee konfirmasi
  // "Ya, Tinggalkan" di modal, fungsi ini yang dijalankan. `null` berarti
  // modal konfirmasi lagi tertutup.
  const [pendingNavigation, setPendingNavigation] = useState<
    (() => void) | null
  >(null);

  // 🔥 BARU: satu pintu buat SEMUA aksi navigasi user-triggered (pindah
  // materi/quiz/assignment/sertifikat lewat sidebar, tombol "Kembali",
  // "Lanjutkan dari Urutan yang Benar", footer Sebelumnya/Selanjutnya).
  // Kalau lagi nggak ada draft belum tersimpan, aksinya langsung jalan
  // seperti biasa. Kalau ADA, aksinya ditahan dulu di `pendingNavigation`
  // dan modal konfirmasi muncul — baru dieksekusi kalau mentee pilih "Ya,
  // Tinggalkan" (lihat modal-nya di JSX paling bawah).
  const guardNavigation = useCallback(
    (action: () => void) => {
      if (hasUnsavedChanges) {
        setPendingNavigation(() => action);
        return;
      }
      action();
    },
    [hasUnsavedChanges],
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

  // 🔥 BARU: id yang lagi DIMINTA lewat `contentMode` — sumbernya BISA
  // dari klik sidebar/footer (yang sudah di-guard duluan lewat
  // `unlockedTextIds` di masing-masing handler), TAPI JUGA bisa
  // LANGSUNG dari query param URL (`?module=&submodule=` / `?task=`)
  // di effect bootstrap di atas — itu satu-satunya jalan "lompat" yang
  // nggak lewat guard klik sama sekali (mis. refresh / ubah URL manual
  // ke materi yang belum gilirannya).
  const requestedTextId =
    contentMode && contentMode.type !== "certificate"
      ? contentMode.textId
      : null;

  // 🔥 BARU: begitu ketauan textId yang diminta itu locked, JANGAN fetch
  // detail text/quiz/assignment-nya sama sekali (`activeTextId` di-null-
  // kan) — biar isinya nggak sempat ke-load ke browser cuma gara-gara
  // orang ubah URL manual, dan biar area KONTEN (bukan cuma sidebar)
  // nampilin pesan terkunci alih-alih render materinya (lihat cabang
  // `isActiveLocked` di CONTENT AREA di bawah).
  const isActiveLocked =
    !!requestedTextId && !unlockedTextIds.has(requestedTextId);
  const activeTextId = isActiveLocked ? null : requestedTextId;
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

  // 🔥 BARU: `navigationMeta.next` ADA (bukan materi/task terakhir),
  // tapi belum boleh diakses (materi/task sebelumnya belum semuanya
  // selesai) — beda kondisi dari `next === null` (memang sudah paling
  // akhir). Dipakai SubchapterFooter buat nampilin tombol "Selanjutnya"
  // dalam kondisi terkunci (ikon gembok + disabled + tooltip) alih-alih
  // panah biasa. `next.id` di navigationMeta SELALU textId-nya (materi
  // MAUPUN task, lihat `toNavItem` di atas), jadi cukup satu pengecekan
  // ke `unlockedTextIds` yang sama dipakai buat sidebar.
  const nextLocked =
    !!navigationMeta.next && !unlockedTextIds.has(navigationMeta.next.id);

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
    // 🔥 Belum login sama sekali → jangan kasih info apa pun soal
    // materinya, paksa login dulu. Beda treatment dari no-subscription /
    // not-found di bawah, makanya di-cek duluan.
    if (errorType === "unauthenticated") {
      return (
        <div
          className={`${jakartaSans.className} relative flex items-center justify-center min-h-screen px-4 py-10 sm:px-5 overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-white`}
        >
          {/* Ambient glow blobs */}
          <div className="pointer-events-none absolute -top-16 -left-14 w-48 h-48 sm:-top-28 sm:-left-20 sm:w-72 sm:h-72 bg-emerald-200/40 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-14 w-52 h-52 sm:-bottom-28 sm:-right-20 sm:w-80 sm:h-80 bg-teal-200/30 rounded-full blur-3xl" />

          {/* Dot-grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(16,185,129,0.18) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          <div className="relative w-full max-w-sm sm:max-w-md">
            <button
              type="button"
              onClick={() =>
                router.push(`/elearning/${practiceId}?from=${from}`)
              }
              className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Course
            </button>

            <div className="relative rounded-2xl sm:rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur-sm shadow-xl shadow-emerald-900/5 px-5 py-8 sm:px-7 sm:py-10 text-center">
              {/* Top accent bar */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-12 sm:w-16 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />

              {/* Icon with rotating dashed ring */}
              <div className="relative mx-auto mb-5 sm:mb-6 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
                <span
                  className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-300 animate-spin"
                  style={{ animationDuration: "12s" }}
                />
                <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] sm:text-[11px] font-semibold px-2.5 sm:px-3 py-1 mb-3 sm:mb-4 leading-tight">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>Login untuk Mengakses Materi</span>
              </span>

              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-snug">
                Login dulu, yuk
              </h2>

              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6 sm:mb-7">
                Kamu perlu login dulu untuk mengakses materi ini. Kalau sesi
                kamu sebelumnya sudah habis, login ulang aja ya.
              </p>

              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new Event("auth:open-login"))
                }
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-3 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Masuk Sekarang
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 🔥 Sudah login, tapi belum punya elearningSubscription aktif.
    if (errorType === "no-subscription") {
      return (
        <div
          className={`${jakartaSans.className} relative flex items-center justify-center min-h-screen px-4 py-10 sm:px-5 overflow-hidden bg-gradient-to-b from-amber-50/70 via-white to-white`}
        >
          {/* Ambient glow blobs */}
          <div className="pointer-events-none absolute -top-16 -left-14 w-48 h-48 sm:-top-28 sm:-left-20 sm:w-72 sm:h-72 bg-amber-200/40 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-14 w-52 h-52 sm:-bottom-28 sm:-right-20 sm:w-80 sm:h-80 bg-orange-200/30 rounded-full blur-3xl" />

          {/* Dot-grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(245,158,11,0.18) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          <div className="relative w-full max-w-sm sm:max-w-md">
            <button
              type="button"
              onClick={() =>
                router.push(`/elearning/${practiceId}?from=${from}`)
              }
              className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Course
            </button>

            <div className="relative rounded-2xl sm:rounded-3xl border border-amber-100 bg-white/80 backdrop-blur-sm shadow-xl shadow-amber-900/5 px-5 py-8 sm:px-7 sm:py-10 text-center">
              {/* Top accent bar */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-12 sm:w-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />

              {/* Icon with rotating dashed ring */}
              <div className="relative mx-auto mb-5 sm:mb-6 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
                <span
                  className="absolute inset-0 rounded-full border-2 border-dashed border-amber-300 animate-spin"
                  style={{ animationDuration: "12s" }}
                />
                <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] sm:text-[11px] font-semibold px-2.5 sm:px-3 py-1 mb-3 sm:mb-4 leading-tight">
                <Lock className="w-3 h-3 shrink-0" />
                <span>Berlangganan Diperlukan</span>
              </span>

              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-snug">
                Kamu Belum Berlangganan
              </h2>

              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6 sm:mb-7">
                Materi ini cuma bisa diakses mentee dengan langganan E-Learning
                aktif. Aktifkan dulu langgananmu buat lanjut belajar di sini.
              </p>

              <button
                type="button"
                onClick={() =>
                  // 🔥 Arahkan langsung ke section pilihan langganan
                  // (id="pilihan-elearning" di SubscriptionElearning.tsx),
                  // bukan cuma ke atas halaman /elearning.
                  router.push(`/elearning#pilihan-elearning`)
                }
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-3 shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:-translate-y-0.5"
              >
                Lihat Detail Berlangganan
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 🔥 not-found / unknown → subChapter memang tidak ada atau error
    // lain yang tak terduga.
    return (
      <div
        className={`${jakartaSans.className} relative flex items-center justify-center min-h-screen px-4 py-10 sm:px-5 overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-white`}
      >
        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute -top-16 -left-14 w-48 h-48 sm:-top-28 sm:-left-20 sm:w-72 sm:h-72 bg-emerald-200/40 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-14 w-52 h-52 sm:-bottom-28 sm:-right-20 sm:w-80 sm:h-80 bg-teal-200/30 rounded-full blur-3xl" />

        {/* Dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(16,185,129,0.18) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />

        <div className="relative w-full max-w-sm sm:max-w-md">
          <button
            type="button"
            onClick={() => router.push(`/elearning/${practiceId}?from=${from}`)}
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Course
          </button>

          <div className="relative rounded-2xl sm:rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur-sm shadow-xl shadow-emerald-900/5 px-5 py-8 sm:px-7 sm:py-10 text-center">
            {/* Top accent bar */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-12 sm:w-16 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />

            {/* Icon with rotating dashed ring */}
            <div className="relative mx-auto mb-5 sm:mb-6 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
              <span
                className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-300 animate-spin"
                style={{ animationDuration: "12s" }}
              />
              <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <SearchX className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-snug">
              Materi Tidak Ditemukan
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6 sm:mb-7">
              Mungkin link-nya salah, atau materi ini sudah tidak tersedia lagi.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(`/elearning/${practiceId}?from=${from}`)
              }
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-3 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5"
            >
              Kembali ke Course
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 BARU: navigasi ke satu entry `globalFlow` (materi/quiz/
  // assignment) — dipakai tombol "Lanjutkan" di pesan terkunci (cabang
  // `isActiveLocked` di CONTENT AREA di bawah). Logic-nya sama persis
  // dengan `onSelectText`/`onSelectTask` yang dikirim ke
  // SubchapterSidebar (set contentMode + sinkronkan query param URL),
  // cuma bentuk parameternya beda (entry `globalFlow`, bukan objek dari
  // sidebar). Sengaja ditaruh SETELAH guard `!subChapter` di atas (bukan
  // di dekat state quiz/assignment) supaya TypeScript tahu `subChapter`
  // di sini sudah pasti bukan null.
  const goToFlowEntry = (entry: {
    id: string;
    kind: "submodule" | "quiz" | "assignment";
    subBabId: string;
  }) => {
    guardNavigation(() => {
      setNavigationSource("manual");
      setQuizScore(null);
      setIsQuizSubmitted(false);
      setAssignmentScore(null);

      if (entry.kind === "submodule") {
        setContentMode({ type: "submodule", textId: entry.id });

        const subBabIndex = subChapter.subBabs.findIndex(
          (sb) => sb.id === entry.subBabId,
        );
        const textsInSubBab = allTexts.filter(
          (t) => t.subBabId === entry.subBabId,
        );
        const textIndex = textsInSubBab.findIndex((t) => t.id === entry.id);

        router.push(`?module=${subBabIndex + 1}&submodule=${textIndex + 1}`, {
          scroll: false,
        });
        return;
      }

      setContentMode({ type: entry.kind, textId: entry.id });
      router.push(`?task=${entry.kind}`, { scroll: false });
    });
  };

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
          completedTextIds={completedTextIds}
          completedSubBabIds={completedSubBabIds}
          unlockedTextIds={unlockedTextIds}
          certificateStatus={certificateStatus}
          isCertificateActive={contentMode?.type === "certificate"}
          onSelectText={(text) => {
            // 🔥 BARU: jaga-jaga dobel dengan guard yang sudah ada di
            // SubchapterSidebar.tsx sendiri (li onClick materi) — kalau
            // ada pemanggil lain ke prop ini di masa depan, akses
            // "lompat" ke materi yang masih terkunci tetap dicegah di
            // sini juga.
            if (!unlockedTextIds.has(text.id)) return;

            // 🔥 BARU: kalau quiz/assignment yang lagi aktif masih ada
            // jawaban/draft belum disubmit, tahan dulu aksi pindah
            // materi ini — tampilkan modal konfirmasi (lihat
            // `guardNavigation`/`pendingNavigation`). Begitu mentee
            // konfirmasi, isi closure di bawah ini yang dijalankan.
            guardNavigation(() => {
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
              const textIndex = textsInSubBab.findIndex(
                (t) => t.id === text.id,
              );

              router.push(
                `?module=${subBabIndex + 1}&submodule=${textIndex + 1}`,
                { scroll: false },
              );
            });
          }}
          onSelectTask={(task) => {
            // 🔥 BARU: sama seperti onSelectText — quiz/assignment cuma
            // boleh diakses kalau SEMUA materi (dan penilaian SubBab
            // sebelumnya) sudah selesai.
            if (!unlockedTextIds.has(task.textId)) return;

            guardNavigation(() => {
              setNavigationSource("manual");
              setQuizScore(null);
              setIsQuizSubmitted(false);
              setAssignmentScore(null);
              setContentMode({ type: task.type, textId: task.textId });
              router.push(`?task=${task.type}`, { scroll: false });
            });
          }}
          onSelectCertificate={() => {
            // 🔥 BARU: buka sertifikat DI AREA KONTEN UTAMA — sama
            // treatment-nya kayak klik quiz/assignment, cuma nggak perlu
            // fetch fullText apa pun (lihat rendering di bawah, cabang
            // `contentMode?.type === "certificate"` di-render LANGSUNG,
            // di luar alur textLoading/rendererMode).
            guardNavigation(() => {
              setNavigationSource("manual");
              setQuizScore(null);
              setIsQuizSubmitted(false);
              setAssignmentScore(null);
              setContentMode({ type: "certificate" });
              router.push(`?task=certificate`, { scroll: false });
            });
          }}
          onBack={() =>
            guardNavigation(() => router.push(`/elearning/${practiceId}`))
          }
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
            className="flex-1 overflow-y-auto px-15 py-8 pb-24 bg-white"
          >
            {contentMode?.type === "certificate" ? (
              <SubchapterCertificateContent
                status={certificateStatus}
                certificate={certificate}
                notEligibleReason={notEligibleReason}
                onRetry={() =>
                  ensureCertificate(subChapterId, displayProgressPercent)
                }
              />
            ) : isActiveLocked ? (
              // 🔥 BARU: `contentMode` lagi nunjuk ke materi/quiz/
              // assignment yang BELUM gilirannya — kejadian ini cuma bisa
              // dari `?module=&submodule=` / `?task=` di URL yang diubah
              // manual (refresh/bookmark/ketik langsung), karena semua
              // jalur klik (sidebar & footer) sudah di-guard duluan.
              // `activeTextId` sengaja sudah di-null-kan di atas (nggak
              // fetch detail-nya sama sekali), jadi di sini TINGGAL kasih
              // tau alasannya + tombol buat lanjut dari titik yang benar.
              <div className="relative overflow-hidden flex flex-col items-center justify-center min-h-[40vh] px-6 py-12 text-center">
                <div className="pointer-events-none absolute -top-16 -left-14 w-48 h-48 bg-slate-200/40 rounded-full blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -right-14 w-52 h-52 bg-gray-200/30 rounded-full blur-3xl" />

                <div className="relative w-full max-w-sm">
                  <div className="relative rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-xl shadow-gray-900/5 px-6 py-9">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-12 rounded-full bg-gradient-to-r from-gray-400 to-slate-500" />

                    <div className="relative mx-auto mb-5 flex items-center justify-center w-16 h-16">
                      <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-gray-500 to-slate-600 flex items-center justify-center shadow-lg shadow-gray-500/30">
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      Materi Ini Masih Terkunci
                    </h3>

                    <p className="text-sm text-gray-500 leading-relaxed mb-6">
                      Akses materi harus berurutan. Selesaikan dulu materi,
                      quiz, atau tugas sebelumnya untuk membuka ini.
                    </p>

                    {resumeEntry && (
                      <button
                        type="button"
                        onClick={() => goToFlowEntry(resumeEntry)}
                        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                      >
                        Lanjutkan dari Urutan yang Benar
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
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
                onContentCompleted={handleContentCompleted}
                onUnsavedChangesChange={setHasUnsavedChanges}
              />
            )}
          </main>
        </div>
      </div>

      <SubchapterFooter
        prev={navigationMeta?.prev ?? null}
        next={navigationMeta?.next ?? null}
        nextLocked={nextLocked}
        onNavigate={(item) => {
          // 🔥 BARU: footer "Selanjutnya/Sebelumnya" cuma nuju SATU
          // langkah dari posisi sekarang, tapi kalau materi/task yang
          // AKTIF sekarang belum completed, item "Selanjutnya" itu bisa
          // saja masih terkunci (mis. quiz baru boleh diakses kalau
          // SEMUA materi SubBab-nya selesai) — cek di sini juga.
          const targetId = (item as any).__task
            ? (item as any).__task.textId
            : item.id;
          if (!unlockedTextIds.has(targetId)) return;

          guardNavigation(() => {
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

            router.push(
              `?module=${subBabIndex + 1}&submodule=${textIndex + 1}`,
              { scroll: false },
            );
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

      {/* ================= CONFIRM LEAVE MODAL ================= */}
      {/* 🔥 BARU: muncul begitu mentee coba pindah materi/quiz/assignment
          lain (klik sidebar, tombol "Kembali", "Lanjutkan dari Urutan yang
          Benar", atau footer Sebelumnya/Selanjutnya) SEMENTARA quiz/
          assignment yang lagi aktif masih ada jawaban/draft yang belum
          disubmit (`hasUnsavedChanges`, dilaporkan dari
          SubchapterContent.tsx). Ini pelengkap peringatan `beforeunload`
          (yang cuma nangkep refresh/tutup tab) — navigasi DI DALAM app
          (client-side routing Next.js) sama sekali nggak lewat
          `beforeunload`, jadi butuh modal sendiri di sini. */}
      {pendingNavigation && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center space-y-4 shadow-2xl">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Tinggalkan Halaman Ini?
            </h2>

            <p className="text-gray-700 text-base leading-relaxed">
              Jawaban atau berkas yang sudah kamu isi belum dikirim/
              dikumpulkan. Kalau pindah sekarang, semuanya akan hilang.
            </p>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setPendingNavigation(null)}
                className="flex-1 border border-emerald-500 text-emerald-600 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition"
              >
                Batal, Kembali Isi
              </button>

              <button
                onClick={() => {
                  const action = pendingNavigation;
                  setPendingNavigation(null);
                  setHasUnsavedChanges(false);
                  action?.();
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition"
              >
                Ya, Tinggalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
