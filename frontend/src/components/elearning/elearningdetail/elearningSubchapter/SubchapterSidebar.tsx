"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type {
  ElearningSubChapterDetailApiItem,
  ElearningTextSummaryApiItem,
} from "@/hooks/Useelearningsubchapterdetail";
import { Award, Loader2 } from "lucide-react";
import type { CertificateStatus } from "@/hooks/useElearningSubChapterCertificate";

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
  activeTaskTextId?: string | null;

  // 🔥 Progress overall course untuk SubChapter ini — belum ada endpoint
  // progress per-SubBab/Text, jadi checklist selesai/belum per item materi
  // sengaja TIDAK ditampilkan dulu (daripada dipalsukan).
  progressPercent?: number;
  lastActivityAt?: string | null;

  // 🔥 BARU: status sertifikat course ini (cek/generate-nya dikontrol dari
  // SubchapterDetail.tsx lewat useElearningSubChapterCertificate — sidebar
  // ini cuma bertugas MENAMPILKAN, bukan memicu).
  certificateStatus?: CertificateStatus;
  isCertificateActive?: boolean;

  onSelectText?: (text: TextWithSubBab) => void;
  onSelectTask?: (task: {
    type: "quiz" | "assignment";
    textId: string;
    title: string;
  }) => void;
  onSelectCertificate?: () => void;
}

export default function ModuleSidebar({
  subChapter,
  courseId,
  activeTextId,
  navigationSource,
  activeTaskType,
  activeTaskTextId,
  progressPercent = 0,
  lastActivityAt,
  certificateStatus = "idle",
  isCertificateActive = false,
  onSelectText,
  onSelectTask,
  onSelectCertificate,
}: Props) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  // 🔥 BARU: dropdown "Penilaian" di bagian bawah sidebar (di luar/bawah
  // semua modul) — cuma relevan kalau subchapter ini punya KEDUANYA (quiz
  // DAN assignment), makanya butuh open-state sendiri, terpisah dari
  // openModules per SubBab di atas.
  const [assessmentOpen, setAssessmentOpen] = useState(false);

  useEffect(() => {
    // 🔥 Quiz/assignment markernya sekarang ada DI DALAM dropdown SubBab
    // masing-masing, jadi navigasi footer ke quiz/assignment juga perlu
    // auto-expand SubBab pemiliknya (sebelumnya cuma ditangani buat
    // submodule lewat activeTextId).
    const targetTextId = activeTextId ?? activeTaskTextId;
    if (navigationSource !== "footer" || !targetTextId) return;

    const activeSubBab = subChapter.subBabs.find((sb) =>
      sb.texts.some((t) => t.id === targetTextId),
    );

    if (!activeSubBab) return;

    setOpenModules({ [activeSubBab.id]: true });
  }, [activeTextId, activeTaskTextId, navigationSource, subChapter]);

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

  // 🔥 BARU: ringkasan "Penilaian apa aja yang ada di subchapter ini" —
  // SAMA PERSIS logic-nya kayak admin (CoursesTable.tsx, kolom
  // "Assessment": hasQuiz/hasProject dihitung dengan `.some()` ke SEMUA
  // SubBab, bukan per-SubBab kayak marker quiz/assignment di dalam
  // dropdown module masing-masing di atas). Bedanya di sini, selain
  // sekadar tau ADA/NGGAK-nya, kita juga butuh Text konkret-nya (buat tau
  // textId & title yang bakal dituju pas diklik) — makanya pakai `.find()`
  // yang nyari ke SEMUA subBab (bukan cuma yang lolos filter search),
  // supaya ringkasan ini tetap konsisten muncul walau user lagi ngetik di
  // kolom "Cari" dan modul yang punya quiz/assignment-nya kefilter keluar.
  const { overallQuizText, overallAssignmentText } = useMemo(() => {
    let quizText: TextWithSubBab | undefined;
    let assignmentText: TextWithSubBab | undefined;

    for (const sb of subChapter.subBabs) {
      for (const t of sb.texts) {
        if (!quizText && t.quiz) {
          quizText = { ...t, subBabId: sb.id, subBabTitle: sb.title };
        }
        if (!assignmentText && t.assignment) {
          assignmentText = { ...t, subBabId: sb.id, subBabTitle: sb.title };
        }
      }
    }

    return { overallQuizText: quizText, overallAssignmentText: assignmentText };
  }, [subChapter]);

  const hasBothAssessments = !!overallQuizText && !!overallAssignmentText;

  // 🔥 FIX: dulu quiz/assignment cuma diambil dari SubBab TERAKHIR
  // (`subChapter.subBabs[subChapter.subBabs.length - 1]`), lalu dirender
  // sebagai SATU seksi "PENILAIAN" global di paling bawah sidebar — di luar
  // dropdown modul mana pun. Tapi sesuai skema Prisma, quiz/assignment itu
  // nempel ke ELearningText (`text.quiz` / `text.assignment`), dan Text
  // itu bisa ada di SubBab (modul) MANA SAJA, bukan cuma yang terakhir.
  // Kalau quiz/assignment-nya ada di SubBab lain, dulu dia nggak pernah
  // muncul sama sekali (Text-nya difilter keluar dari materiTexts karena
  // punya quiz/assignment, tapi juga nggak match "lastSubBab" check) —
  // makanya pas modul itu di-drop, isinya kosong.
  //
  // Fix: quiz/assignment sekarang dihitung PER SubBab (lihat quizText /
  // assignmentText di dalam filteredSubBabs.map di bawah) dan dirender
  // sebagai poin/marker di DALAM dropdown modul yang benar-benar
  // memilikinya — bukan lagi satu seksi global di bawah.

  return (
    <aside
      // 🔥 FIX: dulu nggak ada `shrink-0`, jadi meskipun width-nya
      // "dipatok" 240px lewat `w-[240px]`, sebagai flex item di dalam
      // `<div className="flex flex-1">` (SubchapterDetail.tsx) dia tetap
      // punya flex-shrink default (1) — artinya kalau konten sebelah kanan
      // (HeroNavigation, terutama judul materi yang panjang) butuh ruang
      // lebih dari yang tersedia, browser bakal ambil ruang itu dengan
      // NYUSUTIN sidebar ini duluan, bukan bikin konten kanan yang
      // menyesuaikan/wrap. `shrink-0` di sini mengunci sidebar supaya
      // selalu tetap 240px apa pun yang terjadi di kanan — pasangannya ada
      // di SubchapterHeroNavigation.tsx (`min-w-0` + `break-words` di
      // wrapper judul) supaya judul panjang itu sendiri yang turun ke
      // baris baru, bukan memaksa elemen lain menyempit.
      className="w-[240px] shrink-0 sticky top-0 bg-white border-r hidden lg:flex flex-col"
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

        {/* 🔥 BARU: judul di-batasi maksimal 2 baris (`line-clamp-2`) +
            dipotong pakai "..." kalau kepanjangan, biar nggak makan tempat
            & dorong konten lain ke bawah. Judul lengkapnya tetap bisa
            dibaca lewat native tooltip browser (attribute `title`) pas
            di-hover. */}
        <h2
          className="text-lg font-bold text-gray-900 mb-4 text-left line-clamp-2"
          title={subChapter.title}
        >
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

          // 🔥 Quiz/assignment MILIK SubBab ini sendiri (bisa ada di
          // SubBab mana pun, bukan cuma yang terakhir) — dirender sebagai
          // penanda di dalam dropdown SubBab ini.
          const quizText = subBab.texts.find((t) => t.quiz);
          const assignmentText = subBab.texts.find((t) => t.assignment);

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

                  {/* 🔥 PENANDA quiz/assignment MILIK SubBab ini — cuma
                      penanda bahwa SubBab ini ada penilaiannya, bukan lagi
                      satu seksi global terpisah di bawah semua modul. */}
                  {quizText?.quiz && (
                    <li
                      onClick={() =>
                        onSelectTask?.({
                          type: "quiz",
                          textId: quizText.id,
                          title: quizText.quiz!.title,
                        })
                      }
                      className={`flex items-center gap-2 px-1.5 py-1 rounded-md cursor-pointer transition
${
  activeTaskType === "quiz" && activeTaskTextId === quizText.id
    ? "bg-emerald-500 text-white font-bold py-1.5"
    : "text-gray-900 hover:text-gray-600 hover:bg-gray-100"
}`}
                    >
                      <div className="flex items-center justify-center w-3 h-3">
                        <Image
                          src="/assets/elearning/penilaian.svg"
                          alt="quiz"
                          width={9}
                          height={9}
                          className={
                            activeTaskType === "quiz" &&
                            activeTaskTextId === quizText.id
                              ? "brightness-0 invert"
                              : ""
                          }
                        />
                      </div>

                      <span className="text-[10px] leading-relaxed text-left">
                        Penilaian Quiz — {quizText.quiz.title}
                      </span>
                    </li>
                  )}

                  {assignmentText?.assignment && (
                    <li
                      onClick={() =>
                        onSelectTask?.({
                          type: "assignment",
                          textId: assignmentText.id,
                          title: assignmentText.assignment!.title,
                        })
                      }
                      className={`flex items-center gap-2 px-1.5 py-1 rounded-md cursor-pointer transition
${
  activeTaskType === "assignment" && activeTaskTextId === assignmentText.id
    ? "bg-emerald-500 text-white font-bold py-1.5"
    : "text-gray-900 hover:text-gray-600 hover:bg-gray-100"
}`}
                    >
                      <div className="flex items-center justify-center w-3 h-3">
                        <Image
                          src="/assets/elearning/penilaian.svg"
                          alt="assignment"
                          width={9}
                          height={9}
                          className={
                            activeTaskType === "assignment" &&
                            activeTaskTextId === assignmentText.id
                              ? "brightness-0 invert"
                              : ""
                          }
                        />
                      </div>

                      <span className="text-[10px] leading-relaxed text-left">
                        Penilaian Proyek — {assignmentText.assignment.title}
                      </span>
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= ASSESSMENT SUMMARY (FOOTER) =================
          🔥 BARU: ringkasan penilaian subchapter ini di luar/di bawah
          semua modul, sengaja ditaruh DI LUAR div scrollable "CONTENT" di
          atas (jadi selalu keliatan, nggak ikut ke-scroll) — mirip posisi
          HEADER di atas. Tiga kondisi:
          1) Nggak ada quiz maupun assignment sama sekali → nggak render
             apa-apa (nggak ada gunanya nunjukin section kosong).
          2) Ada KEDUANYA → tampil sebagai satu card dengan dropdown berisi
             2 pilihan (Quiz & Tugas Proyek), masing-masing baris klik
             sendiri-sendiri nuju assessment yang dimaksud.
          3) Cuma ada SALAH SATU → tampil sebagai satu baris info langsung
             (tanpa dropdown/chevron sama sekali), diklik langsung nuju ke
             assessment itu. */}
      {(overallQuizText || overallAssignmentText) && (
        <div className="p-4 border-t bg-gray-50/70 shrink-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-0.5">
            Penilaian
          </p>

          {hasBothAssessments ? (
            <div className="border border-emerald-100 rounded-lg bg-white shadow-sm overflow-hidden">
              <button
                onClick={() => setAssessmentOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-emerald-50/60 transition cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 shrink-0">
                    <Image
                      src="/assets/elearning/penilaian.svg"
                      alt="assessment"
                      width={11}
                      height={11}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-gray-800 truncate">
                    Quiz &amp; Tugas Proyek
                  </span>
                </div>

                <Image
                  src="/assets/elearning/arrowup.svg"
                  alt="toggle"
                  width={9}
                  height={9}
                  className={`shrink-0 transition-transform ${
                    assessmentOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {assessmentOpen && (
                <div className="border-t divide-y">
                  <button
                    onClick={() =>
                      onSelectTask?.({
                        type: "quiz",
                        textId: overallQuizText!.id,
                        title: overallQuizText!.quiz!.title,
                      })
                    }
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition cursor-pointer
${
  activeTaskType === "quiz" && activeTaskTextId === overallQuizText!.id
    ? "bg-emerald-500 text-white"
    : "hover:bg-emerald-50/60 text-gray-800"
}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        activeTaskType === "quiz" &&
                        activeTaskTextId === overallQuizText!.id
                          ? "bg-white"
                          : "bg-emerald-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold">Quiz</p>
                      <p
                        className={`text-[9px] truncate ${
                          activeTaskType === "quiz" &&
                          activeTaskTextId === overallQuizText!.id
                            ? "text-white/80"
                            : "text-gray-500"
                        }`}
                      >
                        {overallQuizText!.quiz!.title}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      onSelectTask?.({
                        type: "assignment",
                        textId: overallAssignmentText!.id,
                        title: overallAssignmentText!.assignment!.title,
                      })
                    }
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition cursor-pointer
${
  activeTaskType === "assignment" &&
  activeTaskTextId === overallAssignmentText!.id
    ? "bg-emerald-500 text-white"
    : "hover:bg-emerald-50/60 text-gray-800"
}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        activeTaskType === "assignment" &&
                        activeTaskTextId === overallAssignmentText!.id
                          ? "bg-white"
                          : "bg-emerald-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold">Tugas Proyek</p>
                      <p
                        className={`text-[9px] truncate ${
                          activeTaskType === "assignment" &&
                          activeTaskTextId === overallAssignmentText!.id
                            ? "text-white/80"
                            : "text-gray-500"
                        }`}
                      >
                        {overallAssignmentText!.assignment!.title}
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            (() => {
              // Cuma salah satu yang ada — nggak butuh dropdown, langsung
              // satu baris klik-able aja.
              const single = overallQuizText
                ? {
                    type: "quiz" as const,
                    textId: overallQuizText.id,
                    title: overallQuizText.quiz!.title,
                    label: "Quiz",
                  }
                : {
                    type: "assignment" as const,
                    textId: overallAssignmentText!.id,
                    title: overallAssignmentText!.assignment!.title,
                    label: "Tugas Proyek",
                  };

              const isActive =
                activeTaskType === single.type &&
                activeTaskTextId === single.textId;

              return (
                <button
                  onClick={() =>
                    onSelectTask?.({
                      type: single.type,
                      textId: single.textId,
                      title: single.title,
                    })
                  }
                  className={`w-full flex items-center gap-2 border rounded-lg shadow-sm px-3 py-2.5 text-left transition cursor-pointer
${
  isActive
    ? "bg-emerald-500 border-emerald-500 text-white"
    : "bg-white border-emerald-100 text-gray-800 hover:bg-emerald-50/60"
}`}
                >
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${
                      isActive ? "bg-white/20" : "bg-emerald-50"
                    }`}
                  >
                    <Image
                      src="/assets/elearning/penilaian.svg"
                      alt="assessment"
                      width={11}
                      height={11}
                      className={isActive ? "brightness-0 invert" : ""}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold">{single.label}</p>
                    <p
                      className={`text-[9px] truncate ${
                        isActive ? "text-white/80" : "text-gray-500"
                      }`}
                    >
                      {single.title}
                    </p>
                  </div>
                </button>
              );
            })()
          )}
        </div>
      )}

      {/* 🔥 DIUBAH: dulu render card sertifikat LANGSUNG di sidebar
          (thumbnail + tombol download nemplok di sini) — sekarang cuma
          TOMBOL PEMICU kecil, gaya sama seperti tombol "Penilaian"
          single-item di atas. Klik tombol ini akan MEMBUKA sertifikatnya
          di AREA KONTEN UTAMA (lihat SubchapterCertificateContent.tsx +
          SubchapterDetail.tsx), bukan lagi ditampilkan langsung di sini.
          Cuma dirender kalau `certificateStatus` bukan "idle" (progress
          course ini sudah 100%). */}
      {certificateStatus !== "idle" && (
        <div className="p-4 border-t bg-gray-50/70 shrink-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-0.5">
            Sertifikat
          </p>

          <button
            onClick={() => {
              if (
                certificateStatus === "ready" ||
                certificateStatus === "error"
              ) {
                onSelectCertificate?.();
              }
            }}
            disabled={
              certificateStatus === "checking" ||
              certificateStatus === "generating"
            }
            className={`w-full flex items-center gap-2 border rounded-lg shadow-sm px-3 py-2.5 text-left transition
${
  certificateStatus === "checking" || certificateStatus === "generating"
    ? "bg-white border-gray-100 text-gray-400 cursor-default"
    : isCertificateActive
      ? "bg-emerald-500 border-emerald-500 text-white cursor-pointer"
      : "bg-white border-emerald-100 text-gray-800 hover:bg-emerald-50/60 cursor-pointer"
}`}
          >
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${
                isCertificateActive ? "bg-white/20" : "bg-emerald-50"
              }`}
            >
              {certificateStatus === "checking" ||
              certificateStatus === "generating" ? (
                <Loader2 size={13} className="animate-spin text-emerald-500" />
              ) : (
                <Award
                  size={13}
                  className={
                    isCertificateActive ? "text-white" : "text-emerald-500"
                  }
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold">Sertifikat</p>
              <p
                className={`text-[9px] truncate ${
                  isCertificateActive ? "text-white/80" : "text-gray-500"
                }`}
              >
                {certificateStatus === "generating"
                  ? "Sedang dibuat..."
                  : certificateStatus === "checking"
                    ? "Memeriksa..."
                    : certificateStatus === "error"
                      ? "Gagal memuat, klik untuk coba lagi"
                      : "Kelas selesai, lihat sertifikatmu"}
              </p>
            </div>
          </button>
        </div>
      )}
    </aside>
  );
}
