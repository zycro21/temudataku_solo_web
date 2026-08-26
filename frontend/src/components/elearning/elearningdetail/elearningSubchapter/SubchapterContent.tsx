"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { InteractiveCodeRunner } from "./InteractiveCodeRunner";
import type {
  ContentBlock,
  AdditionalContent,
  AdditionalContentType,
  ImageVideoContent,
  MultipleChoiceContent,
  MatchingContent,
  InteractiveCodeContent,
} from "@/components/elearning/ElearningSelection";
import {
  normalizeEditorHTML,
  richTextDisplayClass,
} from "@/lib/editorHTMLUtils";
import {
  markdownToHTML,
  decodeFontStyleToken,
  FSTYLE_TOKEN_REGEX,
} from "@/lib/elearningMarkdown";
import {
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Database,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  FileText,
  FolderKanban,
  ClipboardList,
  TrendingUp,
  Layers,
  Check,
  X,
  KeyRound,
  Shield,
  Lock,
  Globe,
  Server,
  Cloud,
  Network,
  Code2,
  Terminal,
  Workflow,
  Brain,
  Sigma,
  Boxes,
  Binary,
  GraduationCap,
  BookOpen,
  Lightbulb,
  Target,
  Users,
  MessageSquare,
  Search,
  Settings,
  Zap,
  AlertCircle,
  CheckCircle2,
  Info,
  HelpCircle,
  Award,
  DollarSign,
  ShoppingCart,
  Calculator,
  Timer,
  MapPin,
  Puzzle,
  Rocket,
  Package,
  Grid3x3,
  RotateCcw,
  PartyPopper,
  XCircle,
  Loader2,
  Clock,
  FileCheck2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useElearningQuizAttempt } from "@/hooks/useElearningQuizAttempt";
import {
  useElearningAssignmentSubmission,
  MAX_ASSIGNMENT_ATTEMPTS,
  PASSING_SCORE_THRESHOLD,
} from "@/hooks/useElearningAssignmentSubmission";

/* ================= KEYWORD → ICON PICKER (block-level title icon) =================
 * 🔥 Dulu icon di kiri title Accordion/Tab Navigation/Content Card/Carousel
 * statis (src="/assets/elearning/iconaccordion.svg" dkk). Sekarang diganti
 * icon lucide-react yang dipilih berdasarkan keyword yang match di
 * title/description/isi block (case-insensitive, tag HTML dibuang dulu
 * sebelum dicocokkan).
 *
 * Kalau tidak ada keyword yang match, fallback ke pool icon lain yang
 * dipilih SECARA STABIL per-konten (hash dari teksnya) — bukan
 * Math.random() murni, supaya icon yang sama tidak "berkedip" ganti tiap
 * kali komponen re-render / parent re-render.
 */
const ICON_KEYWORD_GROUPS: { keywords: string[]; icon: LucideIcon }[] = [
  {
    keywords: [
      "jwt",
      "token",
      "auth",
      "otentikasi",
      "autentikasi",
      "login",
      "kredensial",
      "session",
    ],
    icon: KeyRound,
  },
  {
    keywords: [
      "keamanan",
      "security",
      "enkripsi",
      "encrypt",
      "proteksi",
      "firewall",
    ],
    icon: Shield,
  },
  { keywords: ["password", "sandi", "kunci rahasia"], icon: Lock },
  {
    keywords: [
      "database",
      "basis data",
      "sql",
      "query",
      "tabel data",
      "relasional",
    ],
    icon: Database,
  },
  { keywords: ["api", "endpoint", "request", "response", "http"], icon: Globe },
  { keywords: ["server", "backend", "hosting", "deploy"], icon: Server },
  { keywords: ["cloud", "awan", "aws", "gcp", "azure"], icon: Cloud },
  { keywords: ["jaringan", "network", "koneksi", "protokol"], icon: Network },
  { keywords: ["kode", "code", "program", "script", "syntax"], icon: Code2 },
  { keywords: ["terminal", "command", "cli", "bash"], icon: Terminal },
  {
    keywords: ["algoritma", "algorithm", "alur", "flow", "workflow"],
    icon: Workflow,
  },
  {
    keywords: [
      "machine learning",
      "ml",
      "model",
      "prediksi",
      "ai",
      "kecerdasan buatan",
      "neural",
    ],
    icon: Brain,
  },
  {
    keywords: [
      "statistik",
      "statistic",
      "probabilitas",
      "distribusi",
      "rumus",
      "formula",
    ],
    icon: Sigma,
  },
  {
    keywords: ["grafik", "chart", "visualisasi", "plot", "dashboard"],
    icon: BarChart3,
  },
  {
    keywords: ["tren", "trend", "pertumbuhan", "growth", "meningkat"],
    icon: TrendingUp,
  },
  {
    keywords: ["struktur", "arsitektur", "architecture", "komponen"],
    icon: Boxes,
  },
  {
    keywords: ["variabel", "struktur data", "array", "biner", "binary"],
    icon: Binary,
  },
  {
    keywords: ["dokumen", "artikel", "laporan", "report", "teks"],
    icon: FileText,
  },
  {
    keywords: ["proyek", "project", "kanban", "manajemen"],
    icon: FolderKanban,
  },
  {
    keywords: ["tugas", "task", "checklist", "daftar periksa"],
    icon: ClipboardList,
  },
  {
    keywords: [
      "belajar",
      "kursus",
      "course",
      "materi",
      "edukasi",
      "pembelajaran",
      "mentoring",
    ],
    icon: GraduationCap,
  },
  { keywords: ["buku", "referensi", "bacaan", "modul"], icon: BookOpen },
  { keywords: ["ide", "insight", "tips", "trik"], icon: Lightbulb },
  { keywords: ["target", "tujuan", "goal", "objective"], icon: Target },
  {
    keywords: ["tim", "kolaborasi", "user", "pengguna", "komunitas"],
    icon: Users,
  },
  { keywords: ["diskusi", "chat", "komentar", "pesan"], icon: MessageSquare },
  { keywords: ["cari", "search", "filter", "pencarian"], icon: Search },
  {
    keywords: ["pengaturan", "setting", "konfigurasi", "config"],
    icon: Settings,
  },
  { keywords: ["cepat", "performa", "optimasi", "kecepatan"], icon: Zap },
  {
    keywords: ["peringatan", "warning", "error", "bug", "gagal"],
    icon: AlertCircle,
  },
  { keywords: ["benar", "sukses", "berhasil", "valid"], icon: CheckCircle2 },
  { keywords: ["info", "informasi", "penjelasan"], icon: Info },
  { keywords: ["pertanyaan", "faq", "bantuan"], icon: HelpCircle },
  { keywords: ["penghargaan", "sertifikat", "achievement"], icon: Award },
  {
    keywords: ["harga", "biaya", "revenue", "penjualan", "bisnis"],
    icon: DollarSign,
  },
  { keywords: ["belanja", "produk", "toko", "e-commerce"], icon: ShoppingCart },
  { keywords: ["kalkulasi", "hitung", "matematika"], icon: Calculator },
  { keywords: ["waktu", "jadwal", "timeline", "durasi"], icon: Timer },
  { keywords: ["lokasi", "peta", "map"], icon: MapPin },
];

const ICON_FALLBACK_POOL: LucideIcon[] = [
  Database,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  FileText,
  FolderKanban,
  ClipboardList,
  TrendingUp,
  Layers,
  Code2,
  Boxes,
  Puzzle,
  Rocket,
  Package,
  Grid3x3,
];

function stripHtmlForKeywordMatch(value?: string): string {
  return (value ?? "").replace(/<[^>]*>/g, " ").toLowerCase();
}

function hashTextForFallbackIcon(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/* ================= MEDIA URL RESOLVER (image/video 404 fix) =================
 * 🔥 Backend kadang nyimpen `url` media SUDAH lengkap dengan host
 * (mis. "http://localhost:5001/uploads/elearningMediaContents/xxx.png" —
 * jadi CDN/host lain di luar app Next.js ini), tapi kadang nyimpen path
 * RELATIF aja (mis. "/uploads/elearningMediaContents/xxx.jpg"). Yang
 * relatif ini kalau langsung dipakai sebagai <img src>/<video src> di
 * halaman Next.js bakal di-resolve relatif ke ORIGIN Next.js-nya sendiri
 * (mis. http://localhost:3000/uploads/...) — bukan ke server API-nya
 * (http://localhost:5001) tempat file itu sebenarnya di-serve, makanya
 * 404. Sama persis pola & fix-nya seperti restore additionalContents di
 * admin (page.tsx): "rawUrl.startsWith('/') ? `${NEXT_PUBLIC_API_BASE_URL}${rawUrl}` : rawUrl".
 *
 * Autodetect: kalau url sudah absolute (ada "http://"/"https://" di
 * depan), pakai apa adanya. Kalau nggak (path relatif), tempel
 * NEXT_PUBLIC_API_BASE_URL di depannya.
 */
function resolveMediaUrl(url?: string | null): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

function getContentIcon(...texts: (string | undefined)[]): LucideIcon {
  const combined = texts.map(stripHtmlForKeywordMatch).join(" ").trim();

  for (const group of ICON_KEYWORD_GROUPS) {
    if (group.keywords.some((kw) => combined.includes(kw))) {
      return group.icon;
    }
  }

  const index =
    hashTextForFallbackIcon(combined || "default") % ICON_FALLBACK_POOL.length;
  return ICON_FALLBACK_POOL[index];
}

/* ================= TYPES ================= */

interface ModeProps {
  mode:
    | { type: "submodule"; data: any }
    | { type: "quiz"; data: any }
    | { type: "assignment"; data: any };
  // 🔥 BARU: id ELearningText yang lagi aktif — dibutuhkan buat progress
  // tracking (lihat onContentCompleted di bawah). Baik materi biasa,
  // quiz, maupun assignment semuanya nempel ke satu ELearningText, jadi
  // textId inilah yang dipakai buat nandain "item ini selesai" di
  // ELearningTextProgress (lihat hooks/useElearningTextProgress.ts).
  textId?: string | null;
  onQuizSubmitScore?: (score: number) => void;
  onQuizReset?: () => void;
  onAssignmentScore?: (score: number | null) => void;
  // 🔥 BARU: dipanggil sekali begitu quiz/assignment yang lagi dibuka
  // dianggap "selesai" dari sisi progress tracking — quiz begitu ada
  // attempt yang sudah disubmit (skor apa pun), assignment begitu
  // submission-nya sudah direview tuntas (lolos ATAU tidak lolos, BUKAN
  // saat masih PENDING atau REVISION_REQUIRED). Materi (submodule) TIDAK
  // lewat sini — itu dideteksi dari scroll di SubchapterDetail.tsx,
  // karena container yang scroll ada di luar komponen ini.
  onContentCompleted?: (textId: string) => void;
  // 🔥 BARU: dipanggil tiap kali status "ada jawaban quiz/draft assignment
  // yang belum disubmit" berubah — diteruskan apa adanya ke QuizRenderer/
  // AssignmentRenderer (lihat propnya di masing-masing), dipakai parent
  // (SubchapterDetail.tsx) buat mutuskan apakah perlu nampilin modal
  // konfirmasi "yakin mau tinggalkan halaman ini?" sebelum navigasi ke
  // materi lain / klik "Kembali".
  onUnsavedChangesChange?: (hasUnsaved: boolean) => void;
}

/* ================= QUIZ ================= */
const QuizRenderer = ({
  quiz,
  textId,
  onSubmitScore,
  onReset,
  onContentCompleted,
  onUnsavedChangesChange,
}: {
  quiz: any;
  textId?: string | null;
  onSubmitScore?: (score: number) => void;
  onReset?: () => void;
  onContentCompleted?: (textId: string) => void;
  // 🔥 BARU: dipanggil tiap kali status "ada jawaban yang belum disubmit"
  // berubah — dipakai parent (SubchapterDetail.tsx) buat mutuskan apakah
  // perlu nampilin modal konfirmasi sebelum pindah halaman/materi lain.
  onUnsavedChangesChange?: (hasUnsaved: boolean) => void;
}) => {
  // 🔥 GUARD tambahan (di luar fix race di SubchapterDetail.tsx): kalau
  // karena alasan apa pun `quiz` yang sampai ke sini masih null/undefined
  // (mis. Text-nya kepilih sebagai "quiz" tapi relasi quiz-nya sendiri
  // kosong di DB), tampilkan pesan yang jelas alih-alih crash saat
  // destructure `quiz.questions`.
  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-[30vh] text-sm text-gray-400">
        Quiz tidak ditemukan.
      </div>
    );
  }

  const questions = [...quiz.questions].sort(
    (a: any, b: any) => a.orderNumber - b.orderNumber,
  );

  const isStepMode = questions.length > 5;

  // ================= INTEGRASI API ATTEMPT =================
  // 🔥 BARU: history attempt (buat tau nilai terakhir + sisa kesempatan
  // begitu halaman di-refresh) & fungsi submit jawaban ke backend, lihat
  // hooks/useElearningQuizAttempt.ts.
  const {
    isLoadingHistory,
    latestAttempt,
    // 🔥 DIUBAH: tidak ada lagi batas total percobaan — sekarang berbasis
    // jendela 24 jam. `canAttemptNow` = boleh mengerjakan sekarang,
    // `nextAttemptAvailableAt` = kapan boleh lagi kalau lagi diblokir.
    canAttemptNow,
    nextAttemptAvailableAt,
    isPerfectScore,
    isSubmitting,
    submitAttempt,
  } = useElearningQuizAttempt(quiz.id);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  // 🔥 BARU: true selama user lagi ngerjain ULANG (attempt ke-2) — dipakai
  // supaya effect restore-dari-history di bawah nggak nimpa form kosong
  // yang lagi dikerjain user dengan jawaban attempt sebelumnya.
  const [isRetrying, setIsRetrying] = useState(false);

  // 🔥 BARU: begitu history attempt selesai dimuat, kalau ternyata user
  // SUDAH PERNAH mengerjakan quiz ini (ada latestAttempt), langsung
  // tampilkan hasil percobaan terakhirnya (termasuk kalau halaman baru
  // saja di-refresh) — bukan form kosong.
  useEffect(() => {
    if (isLoadingHistory || isRetrying) return;
    if (!latestAttempt) return;

    const restored: Record<string, string[]> = {};
    Object.entries(latestAttempt.answers ?? {}).forEach(
      ([questionId, value]) => {
        if (Array.isArray(value)) restored[questionId] = value;
        else if (typeof value === "string") restored[questionId] = [value];
      },
    );

    setAnswers(restored);
    setSubmitted(true);

    // 🔥 BARU: dulu `onSubmitScore` cuma dipanggil di handleSubmit (submit
    // BARU saja) — jadi begitu halaman di-refresh, badge skor di
    // SubchapterHeroNavigation.tsx (dikontrol state di SubchapterDetail.tsx)
    // ikut hilang walau mentee sebenarnya SUDAH punya nilai tersimpan.
    // Sekarang begitu attempt lama berhasil dimuat dari history, skornya
    // langsung dilaporkan ke parent juga — sama seperti kalau baru submit.
    onSubmitScore?.(latestAttempt.score ?? 0);
  }, [isLoadingHistory, latestAttempt, isRetrying, onSubmitScore]);

  // 🔥 BARU: progress tracking — quiz dianggap "selesai" begitu ada
  // attempt yang sudah tersimpan di backend (attempt pertama ATAU hasil
  // retry, skor berapa pun — nggak perlu tunggu skor sempurna). Efek ini
  // nutupin DUA skenario sekaligus: (1) history attempt sudah ada waktu
  // halaman ini pertama dibuka/refresh, (2) attempt baru aja berhasil
  // disubmit lewat handleSubmit di bawah (latestAttempt ke-update setelah
  // submitAttempt sukses). onContentCompleted sendiri sudah idempotent
  // (lihat useElearningTextProgress.ts), jadi aman dipanggil berkali-kali
  // selama dependency-nya nggak berubah.
  useEffect(() => {
    if (isLoadingHistory || !latestAttempt || !textId) return;
    onContentCompleted?.(textId);
  }, [isLoadingHistory, latestAttempt, textId, onContentCompleted]);

  // 🔥 BARU: peringatan browser kalau mentee coba refresh/nutup tab
  // sementara masih ada jawaban quiz yang BELUM disubmit. Kondisinya:
  // sudah pilih minimal 1 jawaban (`answers` nggak kosong) TAPI belum
  // `submitted` — begitu quiz sudah disubmit (atau memang belum diisi
  // sama sekali), listener ini otomatis lepas jadi refresh normal aja.
  // Catatan: browser modern (Chrome/Firefox/Safari) SUDAH nggak nampilin
  // teks custom di `e.returnValue` demi keamanan — pesannya diganti
  // otomatis jadi teks bawaan browser ("Changes you made may not be
  // saved" dsb). Tetap wajib di-set (string kosong pun cukup) supaya
  // dialognya muncul sama sekali.
  useEffect(() => {
    const hasUnsavedAnswer = Object.keys(answers).length > 0 && !submitted;
    if (!hasUnsavedAnswer) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [answers, submitted]);

  // 🔥 BARU: laporkan status "ada jawaban belum disubmit" yang sama ke
  // parent (bukan cuma browser lewat beforeunload di atas) — ini yang
  // dipakai buat nge-guard navigasi DI DALAM app (klik sidebar/tombol
  // "Kembali"/footer Selanjutnya-Sebelumnya), yang nggak ketangkep sama
  // sekali oleh `beforeunload` karena itu cuma nyala buat refresh/nutup
  // tab/URL baru, bukan navigasi client-side Next.js. Effect terpisah dari
  // yang di atas (walau kondisinya sama) supaya selalu jalan tiap render,
  // termasuk pas `hasUnsavedAnswer`-nya balik ke `false` (submit/reset) —
  // effect `beforeunload` di atas sengaja early-return duluan kalau false,
  // jadi nggak bisa dipakai buat kasus itu juga.
  useEffect(() => {
    const hasUnsavedAnswer = Object.keys(answers).length > 0 && !submitted;
    onUnsavedChangesChange?.(hasUnsavedAnswer);
  }, [answers, submitted, onUnsavedChangesChange]);

  // 🔥 BARU: begitu QuizRenderer ini di-unmount (mis. mode berubah dari
  // "quiz" ke konten lain setelah navigasi dikonfirmasi user), pastikan
  // flag "ada perubahan belum tersimpan" di parent ikut di-reset. Tanpa
  // ini, kalau sempat true lalu componentnya hilang begitu saja, parent
  // bisa nyangkut mikir masih ada draft padahal komponennya sudah nggak
  // ada.
  useEffect(() => {
    return () => {
      onUnsavedChangesChange?.(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= LOGIC ================= */

  // 🔥 FIX: sebelumnya toggleAnswer selalu treat semua soal sebagai
  // multi-select (push/remove ke array), padahal soal single-answer
  // seharusnya kelakuannya seperti radio button — pilih 1 opsi otomatis
  // mengganti pilihan sebelumnya, bukan menambah ke array. Sekarang
  // dibedakan pakai `isMultiAnswer` (diturunkan dari `correctAnswers.length
  // > 1`, lihat pemanggilannya di bawah): kalau false → ganti total isi
  // array jadi cuma opsi yang baru diklik (atau kosongkan kalau opsi yang
  // sama diklik lagi buat batalkan pilihan); kalau true → tetap
  // toggle/push-remove seperti checkbox biasa.
  const toggleAnswer = (
    questionId: string,
    option: string,
    isMultiAnswer: boolean,
  ) => {
    if (submitted || isSubmitting) return;

    setAnswers((prev) => {
      const current = prev[questionId] || [];

      if (!isMultiAnswer) {
        const alreadySelected = current.includes(option);
        return { ...prev, [questionId]: alreadySelected ? [] : [option] };
      }

      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];

      return { ...prev, [questionId]: updated };
    });
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const checkIsCorrect = (question: any) => {
    const selected = answers[question.id] || [];
    return (
      selected.length === question.correctAnswers.length &&
      selected.every((ans: string) => question.correctAnswers.includes(ans))
    );
  };

  const allAnswered = questions.every(
    (q: any) => (answers[q.id] || []).length > 0,
  );

  // 🔥 Skor yang ditampilkan SETELAH submit selalu ambil dari backend
  // (`latestAttempt.score`) — bukan dihitung ulang di client — supaya
  // nilai yang tersimpan di history konsisten dengan yang di tampilkan.
  // Sebelum ada attempt tersimpan, fallback ke hitungan lokal cuma buat
  // kebutuhan UI non-submitted (tidak pernah benar-benar ditampilkan).
  const localCorrectCount = questions.filter((q: any) =>
    checkIsCorrect(q),
  ).length;
  const score =
    latestAttempt?.score ??
    Math.round((localCorrectCount / questions.length) * 100);
  const isAllCorrect = isPerfectScore;

  // 🔥 DIUBAH: "Coba Lagi" sekarang tersedia kalau belum dapat nilai
  // sempurna DAN jendela 24 jam masih mengizinkan attempt lagi (bukan
  // lagi dibatasi total 2x seumur hidup — lihat useElearningQuizAttempt.ts).
  const canRetry = submitted && !isAllCorrect && canAttemptNow;

  // 🔥 BARU: format tanggal/jam Indonesia untuk pesan "boleh lagi mulai
  // kapan" saat jendela 24 jam lagi penuh.
  const formatNextAttemptTime = (iso: string | null) => {
    if (!iso) return null;
    try {
      return (
        new Date(iso).toLocaleString("id-ID", {
          day: "2-digit",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB"
      );
    } catch {
      return null;
    }
  };

  const handleSubmit = async () => {
    setShowConfirmModal(false);

    // 🔥 Selalu kirim array opsi terpilih per soal (walau soalnya
    // single-answer, cukup array berisi 1 elemen) — backend menormalisasi
    // string vs array jadi Set yang sama, jadi tidak perlu FE bedain
    // single/multi-answer per soal.
    const payloadAnswers: Record<string, string[]> = {};
    questions.forEach((q: any) => {
      const selected = answers[q.id] ?? [];
      if (selected.length > 0) payloadAnswers[q.id] = selected;
    });

    const attempt = await submitAttempt(payloadAnswers);
    if (!attempt) return; // gagal → toast error sudah ditampilkan oleh hook

    setIsRetrying(false);
    setSubmitted(true);
    onSubmitScore?.(attempt.score ?? 0);
  };

  // 🔥 BARU: "Coba Lagi" mengosongkan form (bukan cuma unlock submit) dan
  // masuk mode isRetrying supaya history attempt sebelumnya nggak ikut
  // dipakai buat isi ulang jawaban.
  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrentStep(0);
    setIsRetrying(true);
    onReset?.();
  };

  // Setelah submit → tampil semua (scroll mode)
  const visibleQuestions =
    isStepMode && !submitted ? [questions[currentStep]] : questions;

  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] gap-3 text-sm text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
        Memuat riwayat quiz...
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl">
      {/* ================= STEP HEADER ================= */}
      {isStepMode && (
        <section className="relative bg-[#F8FAFC] -mx-6 -mt-8">
          <div className="pl-10 pr-10 pt-10 pb-8 space-y-4">
            <p className="text-2xl font-bold text-black">
              Pertanyaan {currentStep + 1} dari {questions.length}
            </p>

            <p className="text-base text-gray-600">
              Silakan pilih jawaban yang paling tepat sebelum melanjutkan.
            </p>

            {/* 🔥 FIX: sebelumnya section pembungkus pakai `w-screen`
                (lebar = 100vw), padahal area konten sebenarnya sudah
                menyempit karena ada sidebar (`w-[240px]`) di sebelah kiri.
                Akibatnya baris nomor soal ini "berpikir" dia punya ruang
                selebar layar penuh, jadi flex-wrap baru pecah baris
                setelah selebar viewport → nomor soal yang banyak jadi
                kepotong ke kanan & butuh scroll horizontal (lihat
                screenshot). Sekarang section dibiarkan lebar defaultnya
                (100% dari parent, tetap full-bleed lewat `-mx-6`), jadi
                `flex-wrap` di bawah ini bekerja sesuai lebar asli yang
                kelihatan di layar → otomatis turun ke baris baru kalau
                nggak cukup. `pr-10` ditambah biar simetris dgn `pl-10`. */}
            <div className="flex flex-wrap gap-4 pt-3">
              {questions.map((question: any, idx: number) => {
                const isActive = idx === currentStep;
                const isCorrectQuestion = checkIsCorrect(question);
                const hasAnswer = (answers[question.id] || []).length > 0;

                let stepStyle =
                  "bg-[#E5E7EB] border-[#E5E7EB] text-gray-700 hover:bg-gray-300";

                if (submitted) {
                  stepStyle = isCorrectQuestion
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-red-500 border-red-500 text-white";
                } else if (hasAnswer) {
                  stepStyle = "bg-emerald-500 border-emerald-500 text-white";
                } else if (isActive) {
                  stepStyle = "bg-white border-emerald-500 text-emerald-600";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!submitted) {
                        setCurrentStep(idx);
                      } else {
                        const el = document.getElementById(`question-${idx}`);
                        el?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                    className={`w-14 h-14 rounded-lg text-lg font-bold transition border ${stepStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ================= QUESTION AREA ================= */}
      <div className="bg-white pt-6 pl-28 pr-8 pb-12 space-y-12">
        {visibleQuestions.map((q: any, index: number) => {
          const currentAnswers = answers[q.id] || [];
          const isCorrect = checkIsCorrect(q);

          // 🔥 BARU: backend belum punya field `questionType` eksplisit
          // ("single" | "multiple") kayak di admin (MaterialPreviewModal
          // → QuizModalPreview: `q.questionType === "multiple"`) — tapi FE
          // sudah dapat `correctAnswers` per soal, jadi tipe soal cukup
          // diturunkan dari situ: lebih dari 1 jawaban benar = multi-answer.
          // Ini otomatis konsisten dengan cara backend menilai jawaban
          // (dibandingkan sebagai SET), jadi tidak perlu field tambahan.
          const isMultiAnswer = (q.correctAnswers?.length ?? 0) > 1;

          return (
            <div key={q.id} id={`question-${index}`} className="space-y-4">
              <p className="text-2xl font-bold text-black">
                Pertanyaan{" "}
                {isStepMode && !submitted ? currentStep + 1 : index + 1}
              </p>

              {/* 🔥 FIX: `q.questionText` itu HTML mentah dari
                  RichTextEditor admin (lihat MaterialPreviewModal.tsx:
                  `dangerouslySetInnerHTML={{ __html: q.questionText }}`) —
                  sebelumnya dirender sebagai teks JSX polos jadi tag
                  mentahnya ikut kelihatan literal di layar. Sekarang
                  di-parse juga, konsisten dengan admin. `options` TIDAK
                  disentuh — itu memang plain text (schema `String[]`),
                  admin sendiri render `opt.text` apa adanya tanpa
                  dangerouslySetInnerHTML. */}
              <div
                className={`max-w-4xl text-base font-semibold text-black leading-relaxed break-words [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:my-0.5 ${richTextDisplayClass}`}
                dangerouslySetInnerHTML={{
                  __html: normalizeEditorHTML(
                    markdownToHTML(q.questionText ?? ""),
                  ),
                }}
              />

              {/* 🔥 BARU: keterangan soal multi-answer — sama persis teks
                  & style-nya dengan admin (QuizModalPreview:
                  `q.questionType === "multiple"` → "Pilih semua jawaban
                  yang sesuai."), supaya user tahu soal ini butuh lebih
                  dari satu jawaban dicentang. */}
              {isMultiAnswer && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Pilih semua jawaban yang sesuai.
                </p>
              )}

              {/* OPTIONS */}
              <div className="pl-8 space-y-4 pt-4">
                {q.options.map((opt: string, optIdx: number) => {
                  const checked = currentAnswers.includes(opt);
                  const isCorrectOption = q.correctAnswers.includes(opt);

                  // 🔥 BARU: bentuk indikator sekarang FIX per tipe soal —
                  // bulat (rounded-full, kayak radio button) buat soal
                  // single-answer, kotak (rounded-md, kayak checkbox) buat
                  // soal multi-answer — bukan berubah-ubah tergantung
                  // checked/submitted seperti sebelumnya. Ini yang bikin
                  // user bisa langsung bedain dari bentuknya, bukan cuma
                  // dari teks keterangan di atas.
                  const shapeClass = isMultiAnswer
                    ? "rounded-md"
                    : "rounded-full";

                  let borderStyle = "border-gray-200";
                  let checkboxStyle = `w-6 h-6 border-2 border-gray-500 ${shapeClass}`;

                  if (submitted && checked) {
                    if (isCorrectOption) {
                      borderStyle = "border-emerald-500";
                      checkboxStyle = `w-6 h-6 bg-emerald-500 ${shapeClass} p-[3px]`;
                    } else {
                      borderStyle = "border-red-500";
                      checkboxStyle = `w-6 h-6 bg-red-500 ${shapeClass} p-[3px]`;
                    }
                  } else if (checked) {
                    checkboxStyle = `w-6 h-6 bg-emerald-500 ${shapeClass} p-[3px]`;
                  }

                  // 🔥 FIX: key SEBELUMNYA pakai teks opsi jawaban itu
                  // sendiri (`key={opt}`). Ini bikin error "two children
                  // with the same key" begitu ada 2 opsi dengan teks
                  // identik di satu soal (misal data quiz testing yang
                  // opsinya sama-sama "afafaf") — React nggak bisa bedain
                  // 2 elemen dengan key sama, akibatnya render bisa
                  // duplikat/ke-skip pas user klik jawaban. Key sekarang
                  // dibikin dari `q.id` + index posisi opsi, jadi selalu
                  // unik walau teks opsinya kebetulan sama.
                  return (
                    <label
                      key={`${q.id}-${optIdx}`}
                      className={`flex items-center gap-4 px-5 py-4 border rounded-xl cursor-pointer transition hover:bg-gray-50 ${borderStyle}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAnswer(q.id, opt, isMultiAnswer)}
                        disabled={submitted || isSubmitting}
                        className="hidden"
                      />

                      <div
                        className={`flex items-center justify-center transition-all duration-200 ${checkboxStyle}`}
                      >
                        {checked && (
                          <Image
                            src="/assets/elearning/ceklisputih.svg"
                            alt="check"
                            width={12}
                            height={12}
                          />
                        )}
                      </div>

                      <span className="text-black text-sm">{opt}</span>
                    </label>
                  );
                })}
              </div>

              {/* RESULT PER QUESTION */}
              {submitted && (
                <div
                  className={`mt-6 border rounded-xl p-5 flex gap-4 ${
                    isCorrect
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-red-500 bg-red-50"
                  }`}
                >
                  <Image
                    src={
                      isCorrect
                        ? "/assets/elearning/icon-park-solid_check-one.svg"
                        : "/assets/elearning/salah.svg"
                    }
                    alt="result"
                    width={28}
                    height={28}
                  />

                  <div>
                    <p
                      className={`font-bold text-lg ${
                        isCorrect ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {isCorrect ? "Benar!" : "Belum Tepat."}
                    </p>

                    {isCorrect && q.explanation && (
                      <p className="text-sm text-gray-700 mt-1">
                        {q.explanation}
                      </p>
                    )}

                    {!isCorrect && (
                      <p className="text-sm text-gray-700 mt-1">
                        Silakan pelajari kembali materi terkait sebelum
                        melanjutkan.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= BOTTOM ACTION ================= */}
      {!isStepMode && !submitted && (
        <div className="bg-white flex justify-center pl-28 pr-8 pb-16">
          <button
            disabled={!allAnswered || submitted || isSubmitting}
            onClick={() => setShowConfirmModal(true)}
            className={`flex items-center gap-3 px-10 py-4 rounded-xl font-semibold text-base transition ${
              !allAnswered || submitted || isSubmitting
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-emerald-500 text-white hover:bg-emerald-600"
            }`}
          >
            Selesaikan Quiz
            <ArrowRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* ================= STEP MODE NAVIGATION ================= */}
      {isStepMode && !submitted && (
        <div className="bg-white flex justify-between items-center pl-28 pr-8 pt-2 pb-12">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((p) => p - 1)}
            className="px-8 py-4 rounded-xl bg-emerald-500 text-white"
          >
            Sebelumnya
          </button>

          {currentStep === questions.length - 1 ? (
            <button
              disabled={!allAnswered || isSubmitting}
              onClick={() => setShowConfirmModal(true)}
              className={`flex items-center gap-3 px-10 py-4 rounded-xl font-semibold transition ${
                !allAnswered || isSubmitting
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-500 text-white hover:bg-emerald-600"
              }`}
            >
              Selesaikan Quiz
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep((p) => p + 1)}
              className="px-8 py-4 rounded-xl bg-emerald-500 text-white"
            >
              Selanjutnya
            </button>
          )}
        </div>
      )}

      {/* ================= CONFIRM SUBMIT MODAL ================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center space-y-4 shadow-2xl">
            <div className="flex justify-center">
              <Image
                src="/assets/elearning/confirm-quiz.svg"
                alt="confirm"
                width={180}
                height={140}
              />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Selesaikan Kuis?
            </h2>

            <p className="text-gray-700 text-base leading-relaxed">
              Pastikan semua jawaban sudah sesuai sebelum dikirim.
            </p>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="flex-1 border border-emerald-500 text-emerald-600 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition disabled:opacity-60"
              >
                Cek Lagi
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                Kirim Jawaban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= AFTER SUBMIT RESULT PANEL ================= */}
      {submitted &&
        (() => {
          // 🔥 BARU: satu sumber warna/tone buat seluruh panel — biar nilai
          // & bahasa visualnya konsisten. "warning" (kuning/amber) dipakai
          // khusus buat kondisi "belum tepat semua TAPI masih ada
          // kesempatan" — beda dari "danger" (merah) yang final/sudah
          // habis kesempatan. Ini murni visual, teks & logic-nya sama
          // persis seperti sebelumnya.
          const tone: "success" | "warning" | "danger" = isAllCorrect
            ? "success"
            : canRetry
              ? "warning"
              : "danger";

          const toneStyles = {
            success: {
              panelBg: "bg-gradient-to-b from-emerald-50 via-white to-white",
              panelBorder: "border-emerald-200",
              iconBg: "bg-emerald-500",
              scoreRing: "border-emerald-500",
              scoreGlow: "shadow-[0_0_0_8px_rgba(16,185,129,0.12)]",
              scoreText: "text-emerald-600",
              barColor: "bg-emerald-500",
              badgeBg: "bg-emerald-100 text-emerald-700",
              headline: "text-emerald-700",
            },
            warning: {
              panelBg: "bg-gradient-to-b from-amber-50 via-white to-white",
              panelBorder: "border-amber-200",
              iconBg: "bg-amber-500",
              scoreRing: "border-amber-500",
              scoreGlow: "shadow-[0_0_0_8px_rgba(245,158,11,0.12)]",
              scoreText: "text-amber-600",
              barColor: "bg-amber-500",
              badgeBg: "bg-amber-100 text-amber-700",
              headline: "text-amber-700",
            },
            danger: {
              panelBg: "bg-gradient-to-b from-red-50 via-white to-white",
              panelBorder: "border-red-200",
              iconBg: "bg-red-500",
              scoreRing: "border-red-500",
              scoreGlow: "shadow-[0_0_0_8px_rgba(239,68,68,0.12)]",
              scoreText: "text-red-600",
              barColor: "bg-red-500",
              badgeBg: "bg-red-100 text-red-700",
              headline: "text-red-700",
            },
          }[tone];

          return (
            <div className="w-full flex justify-center mb-16">
              <div
                key={`quiz-result-${quiz.id}-${latestAttempt?.id ?? "local"}`}
                className={`quiz-result-panel ${toneStyles.panelBg} border ${toneStyles.panelBorder} rounded-3xl shadow-lg ml-20 px-10 pt-10 pb-9 text-center max-w-3xl w-full`}
              >
                {/* ================= ICON ================= */}
                <div
                  className={`quiz-result-icon ${
                    tone === "success"
                      ? "quiz-result-icon--success"
                      : "quiz-result-icon--error"
                  } mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${toneStyles.iconBg}`}
                >
                  {tone === "success" ? (
                    <PartyPopper size={30} className="text-white" />
                  ) : tone === "warning" ? (
                    <AlertCircle size={30} className="text-white" />
                  ) : (
                    <XCircle size={30} className="text-white" />
                  )}
                </div>

                {/* ================= SKOR — DITONJOLKAN ================= */}
                <div
                  className={`quiz-score-badge mx-auto mb-6 flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 bg-white ${toneStyles.scoreRing} ${toneStyles.scoreGlow}`}
                >
                  <span
                    className={`text-4xl font-extrabold leading-none ${toneStyles.scoreText}`}
                  >
                    {score}
                  </span>
                  <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    / 100 Poin
                  </span>
                </div>

                {/* Progress bar tipis di bawah skor — representasi visual
                    tambahan dari angka yang sama, bukan info baru. */}
                <div className="mx-auto mb-7 h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`quiz-score-bar h-full rounded-full ${toneStyles.barColor}`}
                    style={{ width: `${Math.max(score, 0)}%` }}
                  />
                </div>

                {tone === "success" ? (
                  <>
                    {/* 🔥 BARU: animasi jawaban benar semua — muncul baik
                        di percobaan pertama maupun kedua, selama skornya
                        100. */}
                    <h2 className={`text-2xl font-bold ${toneStyles.headline}`}>
                      Selamat! Jawabanmu benar semua 🎉
                    </h2>

                    <p className="mt-2 text-gray-600">
                      Nilai kamu {score} poin. Kerja bagus, semua jawaban sudah
                      tepat!
                    </p>

                    {/* 🔥 Skor sempurna → tidak ada tombol "Ulangi Kuis"
                        lagi, sesuai permintaan. */}
                    {/* <div className="flex justify-center gap-4 pt-5">
                      <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition">
                        Unduh Sertifikat
                        <ArrowRight size={18} />
                      </button>
                    </div> */}
                  </>
                ) : tone === "warning" ? (
                  <>
                    <h2 className={`text-2xl font-bold ${toneStyles.headline}`}>
                      Belum Tepat Semua
                    </h2>

                    <p className="mt-2 text-gray-600">
                      Nilai kamu {score} poin. Masih ada jawaban yang kurang
                      tepat.
                    </p>

                    {/* 🔥 DIUBAH: keterangan kesempatan sekarang berbasis
                        jendela 24 jam, bukan sisa dari total 2x tetap —
                        mentee masih boleh coba lagi SEKARANG JUGA. */}
                    <span
                      className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold ${toneStyles.badgeBg}`}
                    >
                      Kamu masih bisa mengerjakan ulang sekarang.
                    </span>

                    <div className="pt-6">
                      <button
                        onClick={handleReset}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold shadow-sm transition"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 🔥 DIUBAH: sudah 2x percobaan dalam 24 jam terakhir &
                        masih belum 100 → nilai final apa adanya, tanpa
                        tombol "Coba Lagi", plus kapan boleh lagi. */}
                    <h2 className={`text-2xl font-bold ${toneStyles.headline}`}>
                      Sayang Sekali..
                    </h2>

                    <p className="mt-2 text-gray-600">
                      Nilai terakhir yang kamu dapatkan adalah {score} poin.
                      Kamu sudah mengerjakan quiz ini 2 kali dalam 24 jam
                      terakhir.
                      {nextAttemptAvailableAt && (
                        <>
                          {" "}
                          Kamu bisa mengerjakan ulang mulai{" "}
                          <span className="font-semibold">
                            {formatNextAttemptTime(nextAttemptAvailableAt)}
                          </span>
                          .
                        </>
                      )}
                    </p>
                  </>
                )}
              </div>

              {/* 🔥 Animasi murni CSS keyframes, sama polanya dengan banner
                  hasil di RenderSubModuleContent (assessment-result-banner)
                  — di-inject sebagai <style> biasa supaya tidak bergantung
                  pada styled-jsx. */}
              <style>{`
                .quiz-result-panel {
                  animation: quizResultIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                }
                .quiz-result-icon--success {
                  animation:
                    quizIconPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both,
                    quizRingPulse 1.6s ease-out 0.65s infinite;
                }
                .quiz-result-icon--error {
                  animation: quizIconShake 0.55s ease-in-out 0.1s both;
                }
                .quiz-score-badge {
                  animation: quizScorePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
                }
                .quiz-score-bar {
                  animation: quizBarGrow 0.8s ease-out 0.35s both;
                }
                @keyframes quizResultIn {
                  from { opacity: 0; transform: translateY(16px) scale(0.96); }
                  to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes quizIconPop {
                  0% { transform: scale(0) rotate(-15deg); opacity: 0; }
                  60% { transform: scale(1.2) rotate(5deg); opacity: 1; }
                  100% { transform: scale(1) rotate(0deg); }
                }
                @keyframes quizIconShake {
                  0%, 100% { transform: translateX(0) scale(1); }
                  20% { transform: translateX(-6px) scale(1.05); }
                  40% { transform: translateX(6px) scale(1.05); }
                  60% { transform: translateX(-4px) scale(1.05); }
                  80% { transform: translateX(4px) scale(1.05); }
                }
                @keyframes quizRingPulse {
                  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45); }
                  100% { box-shadow: 0 0 0 14px rgba(16, 185, 129, 0); }
                }
                @keyframes quizScorePop {
                  0% { transform: scale(0.5); opacity: 0; }
                  70% { transform: scale(1.08); opacity: 1; }
                  100% { transform: scale(1); }
                }
                @keyframes quizBarGrow {
                  from { width: 0%; }
                }
              `}</style>
            </div>
          );
        })()}
    </div>
  );
};

/* ================= ASSIGNMENT ================= */
const formatFileSize = (kb: number) => {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
};

function AssignmentRenderer({
  a,
  textId,
  onAssignmentScore,
  onContentCompleted,
  onUnsavedChangesChange,
}: {
  a: any;
  textId?: string | null;
  onAssignmentScore?: (score: number | null) => void;
  onContentCompleted?: (textId: string) => void;
  // 🔥 BARU: sama seperti di QuizRenderer — laporkan status "ada draft
  // belum dikumpulkan" ke parent, dipakai buat nge-guard navigasi
  // internal (bukan cuma refresh lewat beforeunload).
  onUnsavedChangesChange?: (hasUnsaved: boolean) => void;
}) {
  // ================= INTEGRASI API SUBMISSION =================
  // 🔥 BARU: history submission (buat tau status/nilai/feedback terakhir
  // begitu halaman di-refresh) & fungsi kirim tugas ke backend, lihat
  // hooks/useElearningAssignmentSubmission.ts.
  const {
    isLoadingHistory,
    latestSubmission,
    attemptsRemaining,
    isPending,
    isApproved,
    needsRevision,
    isRejected,
    isLastAttempt,
    canRetry,
    isSubmitting,
    submitAssignment,
  } = useElearningAssignmentSubmission(a?.id);

  // 🔥 BARU: progress tracking — assignment dianggap "selesai" HANYA
  // begitu submission-nya sudah tuntas direview DAN hasilnya final
  // (Lolos ATAU Tidak Lolos). Sengaja BUKAN saat masih PENDING (belum
  // direview) atau REVISION_REQUIRED (mentee masih ada kerjaan lanjutan
  // — belum "selesai" beneran). `isApproved`/`isRejected` di atas sudah
  // menghitung ini dengan benar (termasuk ambang batas skor di attempt
  // terakhir), jadi tinggal dipakai langsung di sini.
  useEffect(() => {
    if (isLoadingHistory || !textId) return;
    if (isApproved || isRejected) onContentCompleted?.(textId);
  }, [isLoadingHistory, isApproved, isRejected, textId, onContentCompleted]);

  // 🔥 BARU: sama seperti fix di QuizRenderer — dulu `onAssignmentScore`
  // cuma dipanggil di handleSubmit (submit BARU saja), jadi begitu halaman
  // di-refresh, badge skor di SubchapterHeroNavigation.tsx ikut hilang
  // walau mentee sebenarnya sudah punya submission lama yang ternilai.
  // Begitu history submission selesai dimuat, skor attempt TERAKHIRnya
  // (kalau sudah dinilai) langsung dilaporkan ke parent juga.
  useEffect(() => {
    if (isLoadingHistory) return;
    if (typeof latestSubmission?.score === "number") {
      onAssignmentScore?.(latestSubmission.score);
    }
  }, [isLoadingHistory, latestSubmission, onAssignmentScore]);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 🔥 BARU: sama seperti di QuizRenderer — peringatan browser kalau
  // mentee coba refresh/nutup tab sementara masih ada file yang sudah
  // di-upload dan/atau catatan yang sudah diketik TAPI belum di-"Kumpulkan"
  // (submit). Begitu file di-upload/note diketik, `uploadedFiles`/`note`
  // dicek isinya di sini; kosongin lagi (baik lewat submit sukses maupun
  // `removeFile`/hapus manual) otomatis lepas peringatannya.
  useEffect(() => {
    const hasUnsavedDraft = uploadedFiles.length > 0 || note.trim() !== "";
    if (!hasUnsavedDraft) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [uploadedFiles, note]);

  // 🔥 BARU: laporkan status draft yang sama ke parent (lihat penjelasan
  // di QuizRenderer) — dipakai buat guard navigasi internal (klik
  // sidebar/tombol "Kembali"/footer).
  useEffect(() => {
    const hasUnsavedDraft = uploadedFiles.length > 0 || note.trim() !== "";
    onUnsavedChangesChange?.(hasUnsavedDraft);
  }, [uploadedFiles, note, onUnsavedChangesChange]);

  // 🔥 BARU: reset flag di parent begitu AssignmentRenderer ini
  // di-unmount (lihat penjelasan yang sama di QuizRenderer).
  useEffect(() => {
    return () => {
      onUnsavedChangesChange?.(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 🔥 BARU: true selama user lagi mengumpulkan REVISI (attempt ke-2) —
  // dipakai supaya form upload tampil kosong lagi walau `latestSubmission`
  // dari attempt pertama masih ada di hook.
  const [isRetrying, setIsRetrying] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileFormat = (name: string) =>
    name.split(".").pop()?.toUpperCase() ?? "";

  const getEstimatedPageCount = (file: File) => {
    if (file.type === "application/pdf")
      return Math.max(1, Math.round(file.size / 120000));
    return null;
  };

  // 🔥 BARU: nama file dari URL yang tersimpan di backend (submission yang
  // sudah dikirim), buat ditampilkan di panel "sudah dikumpulkan" —
  // beda dari `uploadedFiles` (objek File lokal) yang cuma ada selagi
  // ngisi form yang belum disubmit.
  const getFileNameFromUrl = (url: string) =>
    decodeURIComponent(url.split("/").pop() ?? url);

  const handleSubmit = async () => {
    setShowConfirmModal(false);

    const submission = await submitAssignment(uploadedFiles, note);
    if (!submission) return; // gagal → toast error sudah ditampilkan hook

    setIsRetrying(false);
    setUploadedFiles([]);
    setNote("");
    onAssignmentScore?.(submission.score ?? null);
  };

  // 🔥 BARU: "Kumpulkan Revisi" — form dikosongkan total (bukan cuma buka
  // kunci submit), masuk mode isRetrying supaya file/notes attempt
  // sebelumnya nggak ikut nempel di form yang baru.
  const handleStartRevision = () => {
    setUploadedFiles([]);
    setNote("");
    setIsRetrying(true);
  };

  // 🔥 GUARD tambahan (di luar fix race di SubchapterDetail.tsx): kalau
  // karena alasan apa pun `a` yang sampai ke sini masih null/undefined
  // (mis. Text-nya kepilih sebagai "assignment" tapi relasi assignment-nya
  // sendiri kosong di DB), tampilkan pesan yang jelas alih-alih crash saat
  // akses `a.description` dkk. Ditaruh SETELAH semua hooks di atas biar
  // urutan hooks tetap konsisten di setiap render.
  if (!a) {
    return (
      <div className="flex items-center justify-center min-h-[30vh] text-sm text-gray-400">
        Proyek tidak ditemukan.
      </div>
    );
  }

  // 🔥 BARU: form upload ditampilkan kalau belum pernah submit sama
  // sekali, ATAU lagi mode revisi (klik "Kumpulkan Revisi"). Selain itu
  // (submission ada & bukan mode revisi) → tampilkan panel status.
  const showUploadForm = !latestSubmission || isRetrying;

  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] gap-3 text-sm text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
        Memuat status pengumpulan tugas...
      </div>
    );
  }

  return (
    <div className="w-full max-w-full h-[calc(100vh-270px)] overflow-hidden">
      {/* 300px = navbar + hero + footer space */}

      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6 h-full px-6 min-h-0">
        {/* ================= LEFT (65%) ================= */}
        <section className="overflow-y-auto pr-6 space-y-10 pb-6 min-h-0">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-black">Deskripsi Proyek</h2>
            {/* 🔥 FIX: `a.description` itu HTML mentah dari RichTextEditor
                admin (lihat komentar "question disimpan langsung sebagai
                HTML di field description" di buildBlocksPayload/restore
                page.tsx) — sebelumnya dirender sebagai teks JSX polos
                (`{a.description}`) jadi tag mentahnya (`<p>`, `<strong>`,
                dst) ikut kelihatan literal di layar. Sekarang di-parse
                lewat dangerouslySetInnerHTML, sama seperti title/desc
                block lain di file ini & sama seperti admin sendiri
                nge-render `question` di MaterialPreviewModal.tsx. */}
            <div
              className={`text-base text-gray-800 leading-relaxed break-words [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:my-0.5 ${richTextDisplayClass}`}
              dangerouslySetInnerHTML={{
                __html: normalizeEditorHTML(
                  markdownToHTML(a.description ?? ""),
                ),
              }}
            />
          </div>

          {a.instructions && a.instructions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-black">
                Instruksi Pengerjaan
              </h2>
              <ol className="list-decimal pl-6 space-y-3 text-base text-gray-800">
                {a.instructions.map(
                  (i: { id: string; instruction: string }) => (
                    // 🔥 FIX: sama seperti description di atas — tiap
                    // `i.instruction` juga HTML mentah (lihat komentar
                    // "instructions dijadikan ordered list HTML agar
                    // kompatibel dengan RichTextEditor" di page.tsx), jadi
                    // harus di-parse juga, bukan teks JSX polos.
                    <li
                      key={i.id}
                      className={richTextDisplayClass}
                      dangerouslySetInnerHTML={{
                        __html: normalizeEditorHTML(
                          markdownToHTML(i.instruction ?? ""),
                        ),
                      }}
                    />
                  ),
                )}
              </ol>
            </div>
          )}

          {a.supportingFiles && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-black">
                Dokumen yang Perlu Diunduh
              </h2>

              <div className="space-y-3">
                {a.supportingFiles.map((f: any) => {
                  // 🔥 FIX 404 (sama seperti image/video di renderImageVideo):
                  // f.url dari DB kadang absolute
                  // ("http://localhost:5001/uploads/elearningAssignments/...")
                  // kadang relatif ("/uploads/elearningAssignments/...").
                  // Autodetect pakai resolveMediaUrl() yang sama.
                  const resolvedFileUrl = resolveMediaUrl(f.url);

                  return (
                    <a
                      key={f.id}
                      href={resolvedFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-4 border rounded-lg px-5 py-4 hover:bg-gray-50 transition"
                    >
                      {/* 🔥 FIX: sebelumnya wrapper ini nggak punya
                          `min-w-0`, jadi nama file yang panjang bebas
                          melebarkan div ini sampai mendesak/menabrak
                          tombol unduh di kanan (flex child default-nya
                          `min-width: auto`, bukan `0`, jadi nggak pernah
                          mau menyusut). Sekarang dikasih `min-w-0 flex-1`
                          biar wrapper ini yang menyusut duluan, dan nama
                          filenya sendiri di-`truncate` (potong + "...")
                          kalau kepanjangan — sama persis polanya dengan
                          preview file upload di section kanan yang sudah
                          benar dari awal. */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <Image
                          src="/assets/elearning/download-1.svg"
                          alt="file"
                          width={36}
                          height={36}
                          className="shrink-0"
                        />

                        <div className="min-w-0">
                          <p
                            className="text-base font-semibold text-black mb-1 truncate"
                            title={f.name}
                          >
                            {f.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {f.pageCount ? `${f.pageCount} pages | ` : ""}
                            {f.format.toUpperCase()} |{" "}
                            {formatFileSize(f.sizeKB)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(resolvedFileUrl, "_blank");
                        }}
                        className="shrink-0 hover:scale-105 transition"
                      >
                        <Image
                          src="/assets/elearning/download.svg"
                          alt="download"
                          width={20}
                          height={20}
                        />
                      </button>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {showConfirmModal && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center space-y-6 shadow-2xl">
              <div className="flex justify-center">
                <Image
                  src="/assets/elearning/confirm-quiz.svg"
                  alt="confirm"
                  width={200}
                  height={150}
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-800">
                {isRetrying ? "Kirim Revisi Tugas?" : "Kirim Tugas Proyek?"}
              </h2>

              <p className="text-gray-600 text-sm leading-relaxed">
                {isRetrying
                  ? "Ini adalah kesempatan terakhirmu mengumpulkan tugas ini. Pastikan file & catatan sudah sesuai revisi yang diminta."
                  : "Setelah dikirim, tugas akan menunggu penilaian dan tidak dapat diedit sampai hasil review keluar."}
              </p>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 border border-emerald-500 text-emerald-600 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition disabled:opacity-60"
                >
                  Cek Lagi
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting && (
                    <Loader2 size={18} className="animate-spin" />
                  )}
                  Kirim Tugas
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ================= RIGHT (35%) ================= */}
        {showUploadForm ? (
          <>
            <section className="overflow-y-auto pl-4 pr-4 space-y-6 pb-10">
              <div>
                <h2 className="text-xl font-bold text-black">Unggah File</h2>

                {/* 🔥 BARU: keterangan mode revisi + sisa kesempatan,
                    cuma muncul kalau ini attempt ke-2 (revisi). */}
                {isRetrying && (
                  <p className="mt-1 text-sm font-semibold text-amber-600">
                    Ini kesempatan terakhirmu — tidak ada percobaan berikutnya
                    setelah ini.
                  </p>
                )}
              </div>

              {/* UPLOAD BOX */}
              <label
                htmlFor="assignment-upload"
                className="border-2 border-dashed rounded-xl px-4 py-10 text-center hover:border-emerald-500 transition cursor-pointer bg-gray-50 block"
              >
                <input
                  id="assignment-upload"
                  type="file"
                  multiple
                  accept=".pdf,.csv,.xls,.xlsx,.doc,.docx,.ipynb"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                <div className="flex flex-col items-center gap-3">
                  <Image
                    src="/assets/elearning/upload.svg"
                    alt="upload"
                    width={40}
                    height={40}
                  />
                  <p className="text-sm text-gray-600">
                    Klik untuk unggah file (PDF, XLS, DOC, IPYNB)
                  </p>
                </div>
              </label>

              {/* PREVIEW FILES */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg px-5 py-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <Image
                          src="/assets/elearning/download-1.svg"
                          alt="file"
                          width={36}
                          height={36}
                        />

                        <div className="min-w-0">
                          <p className="text-base font-semibold text-black mb-1 truncate">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getEstimatedPageCount(file)
                              ? `${getEstimatedPageCount(file)} pages | `
                              : ""}
                            {getFileFormat(file.name)} |{" "}
                            {formatFileSize(Math.round(file.size / 1024))}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFile(idx)}
                        className="shrink-0 hover:scale-110 transition"
                      >
                        <Image
                          src="/assets/elearning/delete.svg"
                          alt="hapus file"
                          width={14}
                          height={14}
                          className="cursor-pointer ml-2"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-semibold text-black">
                  Catatan Tambahan (opsional)
                </p>
                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                {/* 🔥 BARU: kalau lagi mode revisi, kasih opsi batal balik
                    ke panel status sebelumnya tanpa harus submit. */}
                {isRetrying && (
                  <button
                    onClick={() => setIsRetrying(false)}
                    disabled={isSubmitting}
                    className="text-sm font-medium py-2.5 px-4 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition disabled:opacity-60"
                  >
                    Batal
                  </button>
                )}

                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={uploadedFiles.length === 0 || isSubmitting}
                  className={`w-2/5 text-sm font-medium py-2.5 rounded-lg transition ${
                    uploadedFiles.length === 0 || isSubmitting
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}
                >
                  {isRetrying ? "Kumpulkan Revisi →" : "Kumpulkan Proyek →"}
                </button>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="overflow-y-auto pl-4 pr-4 space-y-6 pb-10 min-h-0">
              {/* Tanggal + status */}
              <div className="flex justify-between items-center border rounded-lg px-4 py-3 bg-gray-50">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Dikumpulkan pada:</p>
                  <p className="text-base font-semibold text-black">
                    {latestSubmission?.submittedAt
                      ? new Date(
                          latestSubmission.submittedAt,
                        ).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </p>
                </div>

                <span
                  className={`text-sm md:text-base font-bold px-4 py-1.5 rounded-full ${
                    isPending
                      ? "bg-yellow-100 text-yellow-600"
                      : isApproved
                        ? "bg-emerald-100 text-emerald-600"
                        : needsRevision
                          ? "bg-amber-100 text-amber-600"
                          : "bg-red-100 text-red-600"
                  }`}
                >
                  {isPending
                    ? "Belum Direview"
                    : isApproved
                      ? "Lulus"
                      : needsRevision
                        ? "Perlu Revisi"
                        : "Tidak Lulus"}
                </span>
              </div>

              {/* ================= MENUNGGU PENILAIAN ================= */}
              {isPending && (
                <div className="assignment-status-card flex flex-col items-center text-center gap-3 rounded-xl border-2 border-dashed border-yellow-300 bg-yellow-50 px-6 py-8">
                  <div className="assignment-status-icon flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400">
                    <Clock size={26} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-yellow-700">
                    Menunggu Penilaian
                  </h3>
                  <p className="max-w-sm text-sm text-yellow-700/80">
                    Tugasmu sudah kami terima dan sedang diperiksa oleh
                    mentor/admin. Hasil penilaian akan muncul di halaman ini
                    begitu selesai direview.
                  </p>
                </div>
              )}

              {/* ================= SUDAH DIREVIEW (lolos / perlu revisi / tidak lolus) ================= */}
              {!isPending && (
                <div
                  className={`assignment-status-card rounded-xl border-2 px-6 py-7 text-center ${
                    isApproved
                      ? "border-emerald-300 bg-emerald-50"
                      : needsRevision
                        ? "border-amber-300 bg-amber-50"
                        : "border-red-300 bg-red-50"
                  }`}
                >
                  <div
                    className={`assignment-status-icon mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${
                      isApproved
                        ? "bg-emerald-500"
                        : needsRevision
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                  >
                    {isApproved ? (
                      <FileCheck2 size={26} className="text-white" />
                    ) : (
                      <AlertCircle size={26} className="text-white" />
                    )}
                  </div>

                  {typeof latestSubmission?.score === "number" && (
                    <p
                      className={`text-4xl font-extrabold ${
                        isApproved
                          ? "text-emerald-600"
                          : needsRevision
                            ? "text-amber-600"
                            : "text-red-600"
                      }`}
                    >
                      {latestSubmission.score}
                      <span className="ml-1 text-base font-semibold text-gray-400">
                        / 100
                      </span>
                    </p>
                  )}

                  <h3
                    className={`mt-2 text-lg font-bold ${
                      isApproved
                        ? "text-emerald-700"
                        : needsRevision
                          ? "text-amber-700"
                          : "text-red-700"
                    }`}
                  >
                    {isApproved
                      ? "Selamat, Tugasmu Lolos! 🎉"
                      : needsRevision
                        ? "Perlu Revisi Sebelum Lolos"
                        : "Belum Memenuhi Kriteria"}
                  </h3>

                  {/* BARU: keterangan ambang batas kelulusan - cuma
                      relevan & ditampilkan kalau ini attempt terakhir,
                      karena di attempt terakhir lolos/tidaknya murni
                      ditentukan dari skor terhadap ambang batas (tidak
                      ada lagi opsi revisi). */}
                  {/* {isLastAttempt && (isApproved || isRejected) && (
                    <p className="mt-1 text-xs text-gray-500">
                      Ini adalah attempt terakhirmu ({MAX_ASSIGNMENT_ATTEMPTS}/
                      {MAX_ASSIGNMENT_ATTEMPTS}). Skor minimal{" "}
                      {PASSING_SCORE_THRESHOLD} dari 100 diperlukan untuk
                      dinyatakan lolos.
                    </p>
                  )} */}

                  {latestSubmission?.feedback && (
                    <div className="mt-4 rounded-lg bg-white/70 p-4 text-left">
                      <h4 className="text-sm font-semibold text-gray-700">
                        Feedback dari Mentor
                      </h4>
                      <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                        {latestSubmission.feedback}
                      </p>
                    </div>
                  )}

                  {latestSubmission?.reviewedAt && (
                    <p className="mt-3 text-xs text-gray-500">
                      Dinilai pada{" "}
                      {new Date(latestSubmission.reviewedAt).toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                  )}

                  {/* 🔥 BARU: batas waktu revisi yang ditetapkan reviewer
                      (admin/curdev) saat menilai — cuma ditampilkan kalau
                      memang perlu revisi & reviewer sudah menetapkan
                      deadline-nya. */}
                  {needsRevision && latestSubmission?.revisionDeadline && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-700">
                      <Clock size={16} className="shrink-0" />
                      Batas waktu revisi:{" "}
                      {new Date(
                        latestSubmission.revisionDeadline,
                      ).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}

                  {/* 🔥 BARU: tombol revisi cuma muncul kalau memang perlu
                      revisi DAN masih ada sisa kesempatan (max 2x). Kalau
                      needsRevision tapi kesempatan sudah habis, tampilkan
                      keterangan final tanpa tombol. */}
                  {needsRevision && (
                    <div className="mt-5">
                      {canRetry ? (
                        <>
                          <p className="mb-3 text-sm font-semibold text-amber-700">
                            Kamu tinggal memiliki {attemptsRemaining} kali
                            kesempatan untuk mengumpulkan ulang.
                          </p>
                          <button
                            onClick={handleStartRevision}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition"
                          >
                            Kumpulkan Revisi
                          </button>
                        </>
                      ) : (
                        <p className="text-sm font-semibold text-red-600">
                          Kesempatan mengumpulkan tugas ini sudah habis.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* File Proyek yang sudah dikirim */}
              <div>
                <h3 className="text-base font-bold text-black mb-3">
                  File Proyek
                </h3>

                <div className="space-y-3">
                  {(latestSubmission?.files ?? []).map((fileUrl, idx) => {
                    const resolvedUrl = resolveMediaUrl(fileUrl);
                    const fileName = getFileNameFromUrl(fileUrl);

                    return (
                      <a
                        key={idx}
                        href={resolvedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border rounded-lg px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <Image
                            src="/assets/elearning/download-1.svg"
                            alt="file"
                            width={36}
                            height={36}
                          />

                          <div className="min-w-0">
                            <p className="text-base font-semibold text-black mb-1 truncate">
                              {fileName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {getFileFormat(fileName)}
                            </p>
                          </div>
                        </div>

                        <Image
                          src="/assets/elearning/download.svg"
                          alt="download"
                          width={20}
                          height={20}
                          className="cursor-pointer ml-2 shrink-0"
                        />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Catatan */}
              <div>
                <h3 className="text-base font-bold text-black mb-2">
                  Catatan Tambahan
                </h3>

                <p className="text-sm text-gray-700">
                  {latestSubmission?.notes?.trim()
                    ? latestSubmission.notes
                    : "-"}
                </p>
              </div>
            </section>
          </>
        )}
      </div>

      {/* 🔥 Animasi murni CSS keyframes, pola sama dengan panel hasil quiz
          (quiz-result-panel) — di-inject sebagai <style> biasa. */}
      <style>{`
        .assignment-status-card {
          animation: assignmentStatusIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .assignment-status-icon {
          animation: assignmentIconPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
        }
        @keyframes assignmentStatusIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes assignmentIconPop {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

/* ================= SUBMODULE CONTENT ================= */
type BlockContent = ContentBlock["contents"][number];

interface SubModule {
  id: number;
  title: string;
  progress?: number;
  blocks?: ContentBlock[];
}

function RenderSubModuleContent({ subModule }: { subModule: SubModule }) {
  /* ================= SORT BLOCKS ================= */
  const sortedBlocks = [...(subModule.blocks ?? [])]
    .filter((b): b is ContentBlock => typeof b.orderNumber === "number")
    .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));

  /* ================= HEADING SIZE MAP ================= */
  const headingSizeMap: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
    1: "text-4xl",
    2: "text-3xl",
    3: "text-2xl",
    4: "text-xl",
    5: "text-lg",
    6: "text-base", // sama dengan paragraf normal
  };

  const [openAccordions, setOpenAccordions] = useState<
    Record<string, number[]>
  >({});

  const [carouselIndexes, setCarouselIndexes] = useState<
    Record<string, number>
  >({});

  const sliderRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragStartX = useRef(0);

  // 🔥 Drag carousel yang "keliatan" — dulu drag cuma dideteksi di
  // mousedown/mouseup (posisi awal vs akhir doang), track-nya nggak pernah
  // ikut gerak selama jari/kursor masih ditahan, jadi user nggak ngerasa
  // lagi "narik" apa-apa (padahal browser mouse event beneran kepencet).
  // Sekarang dibikin match sama pola admin (CarouselPreview di
  // MaterialPreviewModal.tsx): pakai Pointer Events + offset% yang di-track
  // live selama drag (`dragOffsetPct`), jadi track ikut nempel kursor waktu
  // ditarik, baru snap ke slide terdekat pas dilepas. `draggingKey` nyimpen
  // contentKeyOf() carousel mana yang lagi di-drag (bukan boolean tunggal)
  // biar carousel lain di halaman yang sama nggak ikut kepengaruh.
  const [dragOffsetPct, setDragOffsetPct] = useState<Record<string, number>>(
    {},
  );
  const [draggingKey, setDraggingKey] = useState<string | null>(null);

  const [expandedCards, setExpandedCards] = useState<Record<string, number[]>>(
    {},
  );

  const [activeTabs, setActiveTabs] = useState<Record<string, number>>({});

  // 🔥 Backend (getTextById) tidak mengirim `id` untuk contentBlocks sama
  // sekali (heading/paragraph/accordion/dst) — cuma `orderNumber`. Helper
  // ini kasih fallback key stabil buat dipakai sebagai index state
  // (accordion terbuka, slide carousel aktif, card yang di-expand, tab
  // aktif), supaya TS nggak error "undefined cannot be used as index type"
  // dan state-nya tetap konsisten antar render.
  const contentKeyOf = (content: { id?: string; orderNumber?: number }) =>
    content.id ?? `content-${content.orderNumber ?? 0}`;

  const formatContent = (text?: string) => {
    if (!text) return null;

    const paragraphs = text.split("\n");

    return paragraphs.map((paragraph, pIndex) => {
      // Split bold (**text**)
      const boldSplit = paragraph.split(/(\*\*.*?\*\*)/g);

      return (
        <p
          key={pIndex}
          className="mb-4 last:mb-0 text-base text-black leading-relaxed"
        >
          {boldSplit.map((boldPart, bIndex) => {
            // BOLD
            if (boldPart.startsWith("**") && boldPart.endsWith("**")) {
              return (
                <strong key={bIndex}>{boldPart.replace(/\*\*/g, "")}</strong>
              );
            }

            // Split underline (__text__)
            const underlineSplit = boldPart.split(/(__.*?__)/g);

            return underlineSplit.map((underlinePart, uIndex) => {
              if (
                underlinePart.startsWith("__") &&
                underlinePart.endsWith("__")
              ) {
                return (
                  <u key={`${bIndex}-${uIndex}`}>
                    {underlinePart.replace(/__/g, "")}
                  </u>
                );
              }

              // Split italic (*text*)
              const italicSplit = underlinePart.split(/(\*.*?\*)/g);

              return italicSplit.map((italicPart, iIndex) => {
                if (
                  italicPart.startsWith("*") &&
                  italicPart.endsWith("*") &&
                  !italicPart.startsWith("**")
                ) {
                  return (
                    <span
                      key={`${bIndex}-${uIndex}-${iIndex}`}
                      className="skew-x-[-8deg] inline-block"
                    >
                      {italicPart.replace(/\*/g, "")}
                    </span>
                  );
                }

                return (
                  <span key={`${bIndex}-${uIndex}-${iIndex}`}>
                    {italicPart}
                  </span>
                );
              });
            });
          })}
        </p>
      );
    });
  };

  /* ================= RENDER CONTENT ================= */
  const renderContent = (content: BlockContent) => {
    switch (content.type) {
      case "heading": {
        const { rest: headingRest } = decodeFontStyleToken(content.text ?? "");
        return (
          <div
            key={content.id}
            className={`${headingSizeMap[content.level]} font-bold text-black leading-snug break-words [&_*]:font-bold ${richTextDisplayClass}`}
            dangerouslySetInnerHTML={{
              __html: normalizeEditorHTML(markdownToHTML(headingRest)),
            }}
          />
        );
      }

      case "paragraph": {
        const { rest: paragraphRest } = decodeFontStyleToken(
          content.text ?? "",
        );
        return (
          <div
            key={content.id}
            className={`text-base text-gray-800 leading-relaxed break-words
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
              [&_li]:my-1
              [&_strong]:font-bold
              [&_u]:underline
              [&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:italic ${richTextDisplayClass}`}
            dangerouslySetInnerHTML={{
              __html: normalizeEditorHTML(markdownToHTML(paragraphRest)),
            }}
          />
        );
      }

      case "accordion": {
        // 🔥 Sama seperti admin (mapMaterialToCanvasItems case "accordion"):
        // cuma `description` yang di-decode token fstyle-nya (title block
        // level cuma plain text, nggak pernah lewat RichTextEditor). Item
        // title & content SELALU markdownToHTML tanpa decode token (admin
        // juga nggak nyimpen fstyle per-item).
        const { rest: accordionDescRest } = decodeFontStyleToken(
          content.description ?? "",
        );

        const AccordionTitleIcon = getContentIcon(
          content.title,
          content.description,
          ...content.items.map((item) => item.title),
        );

        return (
          <div
            key={content.id}
            className={content.description ? "space-y-5" : "space-y-3"}
          >
            {/* ================= TITLE & DESCRIPTION =================
                🔥 FIX: dulu icon cuma sejajar sama TITLE doang (title & icon
                dalam satu row "flex items-center", description dirender di
                BAWAHNYA sebagai elemen terpisah yang cuma di-indent pakai
                `ml-[42px]` biar "kelihatan" sejajar sama teks title). Itu
                bukan icon di samping title+description — itu icon di
                samping title, sementara description numpang lewat margin
                kiri yang kebetulan sama angkanya.
                Sekarang icon & (title+description) beneran SATU baris flex
                yang sama: icon di kiri, kolom teks (title lalu description,
                kalau ada) di kanannya. Kalau description nggak ada, kolom
                teks otomatis cuma berisi title — icon tetap sejajar cuma
                sama title kayak sebelumnya, TANPA kode tambahan. Ukuran
                icon juga dibesarkan dikit (h-11/18px → h-12/20px). */}
            <div className="flex items-center gap-3">
              {/* ICON WRAPPER */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#F8FAFC]">
                <AccordionTitleIcon size={20} className="text-emerald-600" />
              </div>

              {/* KOLOM TEKS: title + description numpuk vertikal, ikut
                  digeser bareng ke kanan icon (bukan lagi dua elemen
                  terpisah yang "kebetulan" sejajar). */}
              <div className="min-w-0 flex-1 space-y-1">
                {/* 🔥 FIX: content.title itu HTML (bisa ada <b>, dst dari
                    title editor admin) — sebelumnya dirender sebagai teks
                    JSX polos (`{content.title}`) jadi tag mentahnya ikut
                    kelihatan literal di layar. Sekarang di-parse lewat
                    dangerouslySetInnerHTML sama seperti title item di
                    bawahnya. Ukuran juga dibesarkan (dari headingSizeMap[4]
                    / text-xl → text-2xl) supaya jelas beda sama deskripsi
                    di bawahnya yang text-sm. */}
                <h5
                  className={`text-2xl font-bold text-black break-words ${richTextDisplayClass}`}
                  dangerouslySetInnerHTML={{
                    __html: normalizeEditorHTML(
                      markdownToHTML(content.title ?? ""),
                    ),
                  }}
                />

                {/* DESCRIPTION */}
                {content.description && (
                  <div
                    className={`text-sm text-gray-600 leading-relaxed break-words ${richTextDisplayClass}`}
                    dangerouslySetInnerHTML={{
                      __html: normalizeEditorHTML(
                        markdownToHTML(accordionDescRest),
                      ),
                    }}
                  />
                )}
              </div>
            </div>

            {/* ================= ACCORDION ITEMS (CENTER) ================= */}
            <div className="w-3/4 mx-auto space-y-4">
              {content.items.map((item, index) => {
                const openIndexes = openAccordions[contentKeyOf(content)] ?? [];
                const isOpen = openIndexes.includes(index);

                return (
                  <div key={index} className="rounded-xl overflow-hidden">
                    {/* HEADER */}
                    <button
                      onClick={() =>
                        setOpenAccordions((prev) => {
                          const current = prev[contentKeyOf(content)] ?? [];

                          return {
                            ...prev,
                            [contentKeyOf(content)]: isOpen
                              ? current.filter((i) => i !== index)
                              : [...current, index],
                          };
                        })
                      }
                      className="w-full flex justify-between items-center px-5 py-4 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                    >
                      <span
                        className={`font-bold text-lg text-black break-words ${richTextDisplayClass}`}
                        dangerouslySetInnerHTML={{
                          __html: normalizeEditorHTML(
                            markdownToHTML(item.title ?? ""),
                          ),
                        }}
                      />

                      <div className="p-2 rounded-full border border-emerald-500 shrink-0">
                        <ChevronDown
                          size={18}
                          className={`text-emerald-500 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </div>
                    </button>

                    {/* CONTENT */}
                    {isOpen && (
                      <div
                        className={`px-5 py-5 text-base text-black leading-relaxed bg-gray-50 break-words
                          [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 ${richTextDisplayClass}`}
                        dangerouslySetInnerHTML={{
                          __html: normalizeEditorHTML(
                            markdownToHTML(item.content ?? ""),
                          ),
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case "highlight": {
        const { rest: highlightRest } = decodeFontStyleToken(
          content.text ?? "",
        );
        return (
          <div key={content.id} className={`w-full ${richTextDisplayClass}`}>
            <div
              className={`w-[85%] mx-auto rounded-md overflow-hidden flex bg-[#F8FAFC] ${richTextDisplayClass}`}
            >
              {/* Left Dark Strip */}
              <div
                className={`w-4 bg-[#D1D5DC] shrink-0 ${richTextDisplayClass}`}
              />

              {/* Content */}
              <div
                className={`px-6 py-5 text-base text-gray-700 leading-relaxed flex-1 min-w-0 break-words ${richTextDisplayClass}`}
                dangerouslySetInnerHTML={{
                  __html: normalizeEditorHTML(markdownToHTML(highlightRest)),
                }}
              />
            </div>
          </div>
        );
      }

      case "carousel": {
        const cardsPerSlide = content.cardsPerSlide ?? 2;
        const totalItems = content.items.length;
        // 🔥 Sama seperti accordion: cuma description yang di-decode token
        // fstyle-nya (title block-level tetap plain text).
        const { rest: carouselDescRest } = decodeFontStyleToken(
          content.description ?? "",
        );

        const currentIndex = carouselIndexes[contentKeyOf(content)] ?? 0;
        const maxIndex = Math.max(totalItems - cardsPerSlide, 0);

        const goNext = () => {
          if (currentIndex >= maxIndex) return;
          setCarouselIndexes((prev) => ({
            ...prev,
            [contentKeyOf(content)]: Math.min(currentIndex + 1, maxIndex),
          }));
        };

        const goPrev = () => {
          if (currentIndex <= 0) return;
          setCarouselIndexes((prev) => ({
            ...prev,
            [contentKeyOf(content)]: Math.max(currentIndex - 1, 0),
          }));
        };

        const isPrevDisabled = currentIndex === 0;
        const isNextDisabled = currentIndex === maxIndex;

        // 🔥 Key stabil buat carousel ini — dipakai buat nyimpen offset
        // drag & status "lagi di-drag atau nggak" secara terpisah per
        // carousel (lihat komentar dragOffsetPct/draggingKey di atas).
        const carouselKey = contentKeyOf(content);
        const isThisDragging = draggingKey === carouselKey;
        const thisDragOffsetPct = dragOffsetPct[carouselKey] ?? 0;

        // Posisi track = posisi slide aktif, DIKURANGI offset drag yang
        // lagi berjalan — jadi selama kursor/jari ditahan & ditarik, track
        // ikut nempel & gerak live (bukan diam sampai dilepas).
        const translatePercentage =
          (100 / cardsPerSlide) * currentIndex - thisDragOffsetPct;

        const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
          setDraggingKey(carouselKey);
          dragStartX.current = e.clientX;
          setDragOffsetPct((prev) => ({ ...prev, [carouselKey]: 0 }));
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        };

        const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
          if (draggingKey !== carouselKey) return;
          const width = sliderRefs.current[carouselKey]?.offsetWidth || 1;
          const deltaPx = e.clientX - dragStartX.current;
          setDragOffsetPct((prev) => ({
            ...prev,
            [carouselKey]: (deltaPx / width) * 100,
          }));
        };

        const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
          if (draggingKey !== carouselKey) return;
          const width = sliderRefs.current[carouselKey]?.offsetWidth || 1;
          const deltaPx = e.clientX - dragStartX.current;
          const thresholdPx = width * 0.15; // geser minimal 15% lebar visible buat pindah slide

          if (deltaPx <= -thresholdPx && currentIndex < maxIndex) {
            goNext();
          } else if (deltaPx >= thresholdPx && currentIndex > 0) {
            goPrev();
          }

          setDraggingKey(null);
          setDragOffsetPct((prev) => ({ ...prev, [carouselKey]: 0 }));
        };

        const CarouselTitleIcon = getContentIcon(
          content.title,
          content.description,
          ...content.items.map(
            (item) => `${item.title ?? ""} ${item.content ?? ""}`,
          ),
        );

        return (
          <div
            key={content.id}
            className={content.description ? "space-y-6" : "space-y-4"}
          >
            {/* ================= TITLE & DESCRIPTION =================
                🔥 Sama kayak accordion: icon & kolom (title+description)
                sekarang satu baris flex yang sama, bukan icon-sejajar-title
                doang + description numpang lewat margin. Ikon dibesarkan
                dikit juga (h-11/18px → h-12/20px). */}
            <div className="flex items-center gap-3">
              {/* ICON WRAPPER */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#F8FAFC]">
                <CarouselTitleIcon size={20} className="text-emerald-600" />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                {/* 🔥 FIX: sama seperti accordion — content.title adalah
                    HTML, jadi harus di-parse (bukan teks JSX polos), dan
                    ukurannya dibesarkan supaya beda jelas dari deskripsi. */}
                <h5
                  className={`text-2xl font-bold text-black break-words ${richTextDisplayClass}`}
                  dangerouslySetInnerHTML={{
                    __html: normalizeEditorHTML(
                      markdownToHTML(content.title ?? ""),
                    ),
                  }}
                />

                {/* DESCRIPTION */}
                {content.description && (
                  <div
                    className={`text-sm text-gray-600 leading-relaxed break-words ${richTextDisplayClass}`}
                    dangerouslySetInnerHTML={{
                      __html: normalizeEditorHTML(
                        markdownToHTML(carouselDescRest),
                      ),
                    }}
                  />
                )}
              </div>
            </div>

            {/* ================= CAROUSEL ================= */}
            <div className="relative w-[70%] mx-auto">
              {/* LEFT ARROW */}
              <button
                onClick={goPrev}
                disabled={isPrevDisabled}
                className={`
            absolute -left-16 top-1/2 -translate-y-1/2
            w-12 h-12 flex items-center justify-center
            bg-white border border-emerald-500
            text-2xl font-bold text-emerald-600
            rounded-lg shadow-md
            transition
            ${
              isPrevDisabled
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-emerald-50"
            }
          `}
              >
                ‹
              </button>

              {/* RIGHT ARROW */}
              <button
                onClick={goNext}
                disabled={isNextDisabled}
                className={`
            absolute -right-16 top-1/2 -translate-y-1/2
            w-12 h-12 flex items-center justify-center
            bg-white border border-emerald-500
            text-2xl font-bold text-emerald-600
            rounded-lg shadow-md
            transition
            ${
              isNextDisabled
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-emerald-50"
            }
          `}
              >
                ›
              </button>

              {/* SLIDER CONTAINER */}
              <div
                className="overflow-hidden"
                ref={(el) => {
                  sliderRefs.current[carouselKey] = el;
                }}
              >
                <div
                  className={`flex items-stretch select-none cursor-grab active:cursor-grabbing ${
                    isThisDragging
                      ? ""
                      : "transition-transform duration-500 ease-in-out"
                  }`}
                  style={{
                    transform: `translateX(-${translatePercentage}%)`,
                    touchAction: "pan-y",
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onPointerLeave={isThisDragging ? endDrag : undefined}
                >
                  {content.items.map((item, index) => (
                    <div
                      key={index}
                      className="px-3 flex-shrink-0 flex"
                      style={{ width: `${100 / cardsPerSlide}%` }}
                    >
                      <div
                        className={`
    group
    flex flex-col
    h-full
    w-full
    rounded-xl
    overflow-hidden
    border border-gray-200
    shadow-sm
    transition-all duration-300 ease-out
    hover:shadow-xl
    hover:-translate-y-2
    hover:border-emerald-300
    hover:scale-[1.01]
    ${richTextDisplayClass}
  `}
                      >
                        {/* ===== TITLE HEADER ===== */}
                        <div
                          className="py-4 px-4 text-center"
                          style={{ backgroundColor: "#F8FAFC" }}
                        >
                          <h6
                            className={`text-xl font-bold text-emerald-600 transition-colors duration-300 group-hover:text-emerald-700 break-words ${richTextDisplayClass}`}
                            dangerouslySetInnerHTML={{
                              __html: normalizeEditorHTML(
                                markdownToHTML(item.title ?? ""),
                              ),
                            }}
                          />
                        </div>

                        {/* ===== CONTENT AREA =====
                            🔥 item.image TIDAK dirender di sini — di admin
                            (CarouselPreview di MaterialPreviewModal.tsx)
                            field `image` juga tidak pernah ditampilkan sama
                            sekali walau ada di skema backend, jadi biar
                            match persis dengan admin, image card carousel
                            di sini ikut disembunyikan. Kasih tahu saya kalau
                            ternyata ini fitur yang memang mau dipakai. */}
                        <div
                          className="p-6 text-center border-t border-gray-200"
                          style={{ backgroundColor: "#FFFFFF" }}
                        >
                          {item.content && (
                            <div
                              className={`break-words ${richTextDisplayClass}`}
                              dangerouslySetInnerHTML={{
                                __html: normalizeEditorHTML(
                                  markdownToHTML(item.content ?? ""),
                                ),
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ================= NAVIGATION DOTS =================
                  "Lampu" navigasi di bawah carousel — nunjukin ada berapa
                  slide/halaman total & yang mana yang lagi aktif, sekaligus
                  jadi sinyal visual "masih bisa digeser lagi atau nggak"
                  (titik paling kiri/kanan pas nyala = udah mentok). Cuma
                  dimunculin kalau memang ada lebih dari 1 halaman slide. */}
              {maxIndex > 0 && (
                <div className="flex items-center justify-center gap-2 mt-5">
                  {Array.from({ length: maxIndex + 1 }).map((_, dotIndex) => (
                    <button
                      key={dotIndex}
                      type="button"
                      onClick={() =>
                        setCarouselIndexes((prev) => ({
                          ...prev,
                          [carouselKey]: dotIndex,
                        }))
                      }
                      aria-label={`Ke slide ${dotIndex + 1}`}
                      aria-current={dotIndex === currentIndex}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        dotIndex === currentIndex
                          ? "w-6 bg-emerald-500"
                          : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }

      case "content_card": {
        const cardsPerSlide = 3;
        const totalItems = content.items.length;

        const currentIndex = carouselIndexes[contentKeyOf(content)] ?? 0;
        const maxIndex = Math.max(totalItems - cardsPerSlide, 0);

        const goNext = () => {
          if (currentIndex >= maxIndex) return;
          setCarouselIndexes((prev) => ({
            ...prev,
            [contentKeyOf(content)]: Math.min(currentIndex + 1, maxIndex),
          }));
        };

        const goPrev = () => {
          if (currentIndex <= 0) return;
          setCarouselIndexes((prev) => ({
            ...prev,
            [contentKeyOf(content)]: Math.max(currentIndex - 1, 0),
          }));
        };

        // 🔥 Sama seperti carousel di atas: key stabil buat nyimpen offset
        // drag & status dragging punya card carousel ini sendiri.
        const cardCarouselKey = contentKeyOf(content);
        const isThisCardDragging = draggingKey === cardCarouselKey;
        const thisCardDragOffsetPct = dragOffsetPct[cardCarouselKey] ?? 0;

        const translatePercentage =
          (100 / cardsPerSlide) * currentIndex - thisCardDragOffsetPct;
        const expandedIndexes = expandedCards[contentKeyOf(content)] ?? [];

        const handleCardPointerDown = (
          e: React.PointerEvent<HTMLDivElement>,
        ) => {
          setDraggingKey(cardCarouselKey);
          dragStartX.current = e.clientX;
          setDragOffsetPct((prev) => ({ ...prev, [cardCarouselKey]: 0 }));
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        };

        const handleCardPointerMove = (
          e: React.PointerEvent<HTMLDivElement>,
        ) => {
          if (draggingKey !== cardCarouselKey) return;
          const width = sliderRefs.current[cardCarouselKey]?.offsetWidth || 1;
          const deltaPx = e.clientX - dragStartX.current;
          setDragOffsetPct((prev) => ({
            ...prev,
            [cardCarouselKey]: (deltaPx / width) * 100,
          }));
        };

        const endCardDrag = (e: React.PointerEvent<HTMLDivElement>) => {
          if (draggingKey !== cardCarouselKey) return;
          const width = sliderRefs.current[cardCarouselKey]?.offsetWidth || 1;
          const deltaPx = e.clientX - dragStartX.current;
          const thresholdPx = width * 0.15;

          if (deltaPx <= -thresholdPx && currentIndex < maxIndex) {
            goNext();
          } else if (deltaPx >= thresholdPx && currentIndex > 0) {
            goPrev();
          }

          setDraggingKey(null);
          setDragOffsetPct((prev) => ({ ...prev, [cardCarouselKey]: 0 }));
        };

        const isSimpleMode = content.disableExpandableContent === true;

        const dataIcons = [
          Database,
          BarChart3,
          LineChart,
          PieChart,
          Activity,
          FileText,
          FolderKanban,
          ClipboardList,
          TrendingUp,
          Layers,
        ];

        const ContentCardTitleIcon = getContentIcon(
          content.title,
          content.description,
          ...content.items.map(
            (item) => `${item.title ?? ""} ${item.content ?? ""}`,
          ),
        );

        return (
          <div
            key={content.id}
            className={content.description ? "space-y-8" : "space-y-3"}
          >
            {/* ================= TITLE & DESCRIPTION =================
                🔥 Sama kayak accordion/carousel: icon & kolom
                (title+description+hint "arahkan kursor") sekarang satu
                baris flex yang sama. Ikon dibesarkan dikit (h-10/16px →
                h-11/18px). */}
            <div className="flex items-center gap-3">
              {/* Wrapper Icon */}
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#F8FAFC]">
                <ContentCardTitleIcon size={18} className="text-emerald-600" />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                {/* 🔥 FIX: content.title adalah HTML, jadi harus di-parse
                    (bukan teks JSX polos), dan ukurannya dibesarkan supaya
                    beda jelas dari deskripsi. */}
                <h5
                  className={`text-2xl font-bold text-black break-words ${richTextDisplayClass}`}
                  dangerouslySetInnerHTML={{
                    __html: normalizeEditorHTML(
                      markdownToHTML(content.title ?? ""),
                    ),
                  }}
                />

                {content.description && (
                  <>
                    {/* 🔥 Sama seperti admin (case "content_card" di
                        mapMaterialToCanvasItems): description langsung
                        markdownToHTML tanpa decodeFontStyleToken (beda dari
                        accordion/carousel yang men-decode token dulu). */}
                    <div
                      className={`text-sm text-gray-600 leading-relaxed break-words ${richTextDisplayClass}`}
                      dangerouslySetInnerHTML={{
                        __html: normalizeEditorHTML(
                          markdownToHTML(content.description ?? ""),
                        ),
                      }}
                    />

                    {!isSimpleMode && (
                      <p className="text-sm text-gray-500 mt-1 tracking-wide">
                        <span className="skew-x-[-8deg] inline-block">
                          (Arahkan kursor untuk melihat detail)
                        </span>
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ================= CARD CONTAINER ================= */}
            <div className="relative w-[80%] mx-auto">
              {totalItems > 3 && (
                <>
                  {/* PREVIOUS */}
                  <button
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    className={`
        absolute -left-16 top-1/2 -translate-y-1/2
        w-14 h-14
        flex items-center justify-center
        rounded-full
        bg-white shadow-md
        transition-all duration-300
        ${
          currentIndex === 0
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-emerald-50 hover:scale-110"
        }
      `}
                  >
                    <ChevronLeft
                      size={28}
                      className={`
          ${currentIndex === 0 ? "text-gray-400" : "text-emerald-600"}
        `}
                    />
                  </button>

                  {/* NEXT */}
                  <button
                    onClick={goNext}
                    disabled={currentIndex === maxIndex}
                    className={`
        absolute -right-16 top-1/2 -translate-y-1/2
        w-14 h-14
        flex items-center justify-center
        rounded-full
        bg-white shadow-md
        transition-all duration-300
        ${
          currentIndex === maxIndex
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-emerald-50 hover:scale-110"
        }
      `}
                  >
                    <ChevronRight
                      size={28}
                      className={`
          ${currentIndex === maxIndex ? "text-gray-400" : "text-emerald-600"}
        `}
                    />
                  </button>
                </>
              )}

              <div
                className="overflow-hidden"
                ref={(el) => {
                  sliderRefs.current[cardCarouselKey] = el;
                }}
              >
                <div
                  className={`flex select-none cursor-grab active:cursor-grabbing ${
                    // 🔥 FIX: sebelumnya card SELALU dikasih lebar tetap
                    // `100 / cardsPerSlide` (33.33%, karena cardsPerSlide
                    // di-hardcode 3) — kalau admin cuma bikin 1 atau 2
                    // card, total lebar isi flex row jadi cuma 33%/66%
                    // dari container, dan karena flex default-nya
                    // `justify-start`, sisa card numpuk rapat ke kiri
                    // (persis kejadian di screenshot OLTP/OLAP). Begitu
                    // totalItems <= cardsPerSlide, carousel juga nggak
                    // ada gunanya digeser (maxIndex selalu 0, tombol
                    // panah juga nggak dirender — lihat `totalItems > 3`
                    // di atas), jadi aman ditambah `justify-center` biar
                    // card-nya rata tengah, berapa pun jumlahnya (1/2/3).
                    totalItems <= cardsPerSlide ? "justify-center" : ""
                  } ${
                    isThisCardDragging
                      ? ""
                      : "transition-transform duration-500 ease-in-out"
                  }`}
                  style={{
                    transform: `translateX(-${translatePercentage}%)`,
                    touchAction: "pan-y",
                  }}
                  onPointerDown={handleCardPointerDown}
                  onPointerMove={handleCardPointerMove}
                  onPointerUp={endCardDrag}
                  onPointerCancel={endCardDrag}
                  onPointerLeave={isThisCardDragging ? endCardDrag : undefined}
                >
                  {content.items.map((item, index) => {
                    const isExpanded = expandedIndexes.includes(index);

                    return (
                      <div
                        key={index}
                        className="px-4 flex-shrink-0"
                        style={{ width: `${100 / cardsPerSlide}%` }}
                      >
                        {/* ================= SIMPLE MODE (TRUE) ================= */}
                        {isSimpleMode ? (
                          <div
                            className="
      rounded-2xl
      bg-[#F8FAFC]
      py-8
      px-5
      text-center
      shadow-sm
      hover:shadow-md
      transition-all duration-300
      hover:-translate-y-1
      h-full
      flex flex-col
    "
                          >
                            {/* ICON */}
                            <div className="mb-6 flex justify-center">
                              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                                {(() => {
                                  const RandomIcon =
                                    dataIcons[index % dataIcons.length];
                                  return (
                                    <RandomIcon
                                      size={26}
                                      className="text-emerald-600"
                                      strokeWidth={2}
                                    />
                                  );
                                })()}
                              </div>
                            </div>

                            {/* TITLE */}
                            <h6
                              className={`text-2xl font-semibold text-black mb-4 break-words ${richTextDisplayClass}`}
                              dangerouslySetInnerHTML={{
                                __html: normalizeEditorHTML(
                                  markdownToHTML(item.title ?? ""),
                                ),
                              }}
                            />

                            {/* DESCRIPTION */}
                            <div
                              className={`flex-grow break-words ${richTextDisplayClass}`}
                              dangerouslySetInnerHTML={{
                                __html: normalizeEditorHTML(
                                  markdownToHTML(item.content ?? ""),
                                ),
                              }}
                            />
                          </div>
                        ) : (
                          /* ================= EXPANDABLE MODE (FALSE) ================= */
                          <div
                            className="
    rounded-2xl
    shadow-sm
    hover:shadow-md
    transition-all duration-300
    overflow-hidden
    flex flex-col
    bg-white
  "
                          >
                            {/* TOP WHITE */}
                            <div className="p-8 text-center bg-white">
                              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F8FAFC] flex items-center justify-center">
                                {(() => {
                                  const RandomIcon =
                                    dataIcons[index % dataIcons.length];
                                  return (
                                    <RandomIcon
                                      size={32}
                                      className="text-emerald-600"
                                      strokeWidth={2}
                                    />
                                  );
                                })()}
                              </div>

                              <h6
                                className={`text-2xl font-semibold text-black mb-4 break-words ${richTextDisplayClass}`}
                                dangerouslySetInnerHTML={{
                                  __html: normalizeEditorHTML(
                                    markdownToHTML(item.title ?? ""),
                                  ),
                                }}
                              />

                              <div
                                className={`flex-grow break-words ${richTextDisplayClass}`}
                                dangerouslySetInnerHTML={{
                                  __html: normalizeEditorHTML(
                                    markdownToHTML(item.content ?? ""),
                                  ),
                                }}
                              />
                            </div>

                            {/* BOTTOM GREY */}
                            {item.expandableContent && (
                              <div className="bg-[#F8FAFC] w-full mt-auto">
                                <div
                                  className={`
          overflow-hidden
          transition-all duration-500
          ${
            isExpanded
              ? "max-h-96 opacity-100 py-6 px-8"
              : "max-h-0 opacity-0 px-8"
          }
        `}
                                >
                                  <div className="flex justify-center">
                                    <div
                                      className={`text-center break-words ${richTextDisplayClass}`}
                                      dangerouslySetInnerHTML={{
                                        __html: normalizeEditorHTML(
                                          markdownToHTML(
                                            item.expandableContent ?? "",
                                          ),
                                        ),
                                      }}
                                    />
                                  </div>
                                </div>

                                <button
                                  onClick={() =>
                                    setExpandedCards((prev) => {
                                      const current =
                                        prev[contentKeyOf(content)] ?? [];

                                      return {
                                        ...prev,
                                        [contentKeyOf(content)]: isExpanded
                                          ? current.filter((i) => i !== index)
                                          : [...current, index],
                                      };
                                    })
                                  }
                                  className="
          w-full
          flex items-center justify-center gap-1.5
          py-4
          text-sm
          text-gray-600
          hover:text-black
          transition-all duration-300
        "
                                >
                                  <span className="skew-x-[-8deg] inline-block">
                                    {isExpanded
                                      ? "Lihat lebih sedikit"
                                      : "Lihat lebih banyak"}
                                  </span>

                                  {isExpanded ? (
                                    <ChevronUp size={16} />
                                  ) : (
                                    <ChevronDown size={16} />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ================= NAVIGATION DOTS ================= */}
              {maxIndex > 0 && (
                <div className="flex items-center justify-center gap-2 mt-5">
                  {Array.from({ length: maxIndex + 1 }).map((_, dotIndex) => (
                    <button
                      key={dotIndex}
                      type="button"
                      onClick={() =>
                        setCarouselIndexes((prev) => ({
                          ...prev,
                          [cardCarouselKey]: dotIndex,
                        }))
                      }
                      aria-label={`Ke slide ${dotIndex + 1}`}
                      aria-current={dotIndex === currentIndex}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        dotIndex === currentIndex
                          ? "w-6 bg-emerald-500"
                          : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }

      case "tab_navigation": {
        const activeIndex = activeTabs[contentKeyOf(content)] ?? 0;

        const TabNavigationTitleIcon = getContentIcon(
          content.title,
          content.description,
          ...content.tabs.map(
            (tab) => `${tab.title ?? ""} ${tab.content ?? ""}`,
          ),
        );

        return (
          <div
            key={content.id}
            className={content.description ? "space-y-6" : "space-y-4"}
          >
            {/* ================= TITLE & DESCRIPTION =================
                🔥 Sama kayak accordion/carousel/content_card: icon &
                kolom (title+description) sekarang satu baris flex yang
                sama. Ikon dibesarkan dikit (h-10/16px → h-11/18px). */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#F8FAFC]">
                <TabNavigationTitleIcon
                  size={18}
                  className="text-emerald-600"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                {/* 🔥 FIX: content.title adalah HTML, jadi harus di-parse
                    (bukan teks JSX polos), dan ukurannya dibesarkan supaya
                    beda jelas dari deskripsi. */}
                <h5
                  className={`text-2xl font-bold text-black break-words ${richTextDisplayClass}`}
                  dangerouslySetInnerHTML={{
                    __html: normalizeEditorHTML(
                      markdownToHTML(content.title ?? ""),
                    ),
                  }}
                />

                {content.description && (
                  // 🔥 Sama seperti content_card: description langsung
                  // markdownToHTML tanpa decodeFontStyleToken.
                  <div
                    className={`text-sm text-gray-600 leading-relaxed break-words ${richTextDisplayClass}`}
                    dangerouslySetInnerHTML={{
                      __html: normalizeEditorHTML(
                        markdownToHTML(content.description ?? ""),
                      ),
                    }}
                  />
                )}
              </div>
            </div>

            {/* ================= TAB WRAPPER (CENTER) ================= */}
            <div className="w-[85%] mx-auto">
              {/* ================= TAB HEADER ================= */}
              <div className="flex w-full">
                {content.tabs.map((tab, index) => {
                  const isActive = activeIndex === index;

                  return (
                    <button
                      key={index}
                      onClick={() =>
                        setActiveTabs((prev) => ({
                          ...prev,
                          [contentKeyOf(content)]: index,
                        }))
                      }
                      className={`
            flex-1 py-5 text-base font-semibold tracking-wide truncate
            transition-all duration-300 ease-in-out
            ${
              isActive
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }
            hover:shadow-md
            hover:brightness-105
            ${index === 0 ? "rounded-tl-2xl" : ""}
            ${index === content.tabs.length - 1 ? "rounded-tr-2xl" : ""}
          `}
                      dangerouslySetInnerHTML={{
                        __html:
                          normalizeEditorHTML(
                            markdownToHTML(tab.title ?? ""),
                          ) || `Tab ${index + 1}`,
                      }}
                    />
                  );
                })}
              </div>

              {/* ================= CONTENT AREA ================= */}
              <div
                className={`
      bg-white
      rounded-b-2xl
      p-8
      text-base
      text-black
      leading-relaxed
      shadow-sm
      break-words
      transition-all duration-300 ease-in-out
      hover:shadow-md
      hover:ring-1 hover:ring-emerald-100
      [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1
      ${richTextDisplayClass}
    `}
                dangerouslySetInnerHTML={{
                  __html: normalizeEditorHTML(
                    markdownToHTML(content.tabs[activeIndex]?.content ?? ""),
                  ),
                }}
              />
            </div>
          </div>
        );
      }

      case "summary": {
        let comments: string[] = Array.isArray(content.comments)
          ? [...content.comments]
          : [];
        // Sama seperti admin: token {fstyle:...} (kalau ada) selalu
        // "nempel" di comment PERTAMA, bukan komentar terpisah — jadi
        // dilucuti dulu di sini biar nggak muncul sebagai teks literal.
        if (comments.length > 0 && FSTYLE_TOKEN_REGEX.test(comments[0])) {
          comments = comments.slice(1);
        }
        const summaryHTML = comments
          .map((c) => `<p>${markdownToHTML(c)}</p>`)
          .join("");

        return (
          <div key={content.id} className="w-full">
            <div className="w-[85%] mx-auto bg-[#F8FAFC] rounded-2xl p-10 shadow-sm">
              {/* TITLE */}
              <h4 className={`text-4xl font-bold mb-6 ${richTextDisplayClass}`}>
                <span className={`text-emerald-600 ${richTextDisplayClass}`}>
                  Ringkasan
                </span>
              </h4>

              <div
                className={`text-base text-gray-800 leading-relaxed break-words [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 ${richTextDisplayClass}`}
                dangerouslySetInnerHTML={{
                  __html: normalizeEditorHTML(summaryHTML),
                }}
              />
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  /* ================= RENDER IMAGE / VIDEO ================= */
  const renderImageVideo = (item: AdditionalContent) => {
    if (item.type !== "image_video") return null;

    const data = item.content as ImageVideoContent;
    // Sama seperti admin: `mediaType` sudah eksplisit dari backend
    // ("IMAGE" | "VIDEO"), jadi nggak perlu nebak dari ekstensi/domain URL
    // lagi (itu cara lama yang gampang meleset kalau ada CDN di luar
    // daftar). Ini juga persis logic ImagePreview/VideoPreview di
    // MaterialPreviewModal.tsx.
    const isVideo = data.mediaType === "VIDEO";
    // 🔥 FIX 404: url dari backend bisa relatif ("/uploads/...") atau
    // sudah absolute ("http://host/uploads/..."). resolveMediaUrl()
    // autodetect keduanya — lihat komentar di definisinya di atas.
    const resolvedUrl = resolveMediaUrl(data.url);

    if (isVideo) {
      if (!data.url) {
        return (
          <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 text-sm">
            Video tidak tersedia
          </div>
        );
      }

      // Sama persis dengan VideoPreview admin.
      const isYoutube =
        data.url.includes("youtube.com") || data.url.includes("youtu.be");
      const embedUrl = isYoutube
        ? data.url.includes("youtu.be")
          ? `https://www.youtube.com/embed/${data.url.split("youtu.be/")[1]?.split("?")[0]}`
          : `https://www.youtube.com/embed/${new URL(data.url).searchParams.get("v")}`
        : resolvedUrl;

      return (
        <div className="w-full flex justify-center">
          <div className="w-full max-w-2xl aspect-video rounded-xl overflow-hidden shadow-md">
            {isYoutube ? (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <video
                src={resolvedUrl}
                controls
                className="w-full h-full object-contain bg-black"
              />
            )}
          </div>
        </div>
      );
    }

    // Sama persis dengan ImagePreview admin.
    if (!data.url) {
      return (
        <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 text-sm">
          Gambar tidak tersedia
        </div>
      );
    }

    return (
      <div className="w-full flex justify-center">
        <img
          src={resolvedUrl}
          alt="material"
          style={{
            width: data.widthPercent ? `${data.widthPercent}%` : "100%",
          }}
          className="object-contain rounded-xl shadow-md block"
        />
      </div>
    );
  };

  const [mcAnswers, setMcAnswers] = useState<Record<string, string>>({});
  const [mcSubmitted, setMcSubmitted] = useState<Record<string, boolean>>({});
  // 🔥 BARU: penghitung "percobaan ke berapa" per soal true/false, cuma
  // buat bikin `key` unik di banner hasil (lihat renderAssessmentResultBanner
  // di bawah) — increment tiap kali Submit ditekan. Gunanya: kalau user
  // submit → salah → Coba Lagi → submit lagi → SALAH LAGI (hasil kategori-nya
  // sama persis kayak sebelumnya, "wrong"), React biasanya nggak akan
  // remount elemen bannernya (key dari kategori doang, "wrong", nggak
  // berubah), jadi animasi CSS-nya nggak akan replay walau submit-nya beda
  // kali. Dengan attempt counter ini ikut masuk ke `key`, tiap Submit
  // dijamin bikin React BENERAN bikin elemen DOM baru → animasi selalu
  // main ulang dari awal, sesuai attempt yang mana pun.
  const [mcAttempt, setMcAttempt] = useState<Record<string, number>>({});

  // 🔥 BARU: banner hasil submit (dipakai bareng-bareng sama true/false DAN
  // matching, makanya didefinisikan sekali di sini, dipanggil dari kedua
  // renderX di bawah). `isAllCorrect` nentuin pesan+warna+animasi yang mana
  // yang tampil; `animKey` (biasanya "{soalKey}-{attemptKe}") mastiin
  // elemen ini di-remount tiap kali Submit ditekan, apa pun hasilnya,
  // supaya animasi selalu main dari awal — bukan cuma pas kategori
  // benar/salahnya beda dari attempt sebelumnya.
  const renderAssessmentResultBanner = (
    isAllCorrect: boolean,
    animKey: string,
  ) => (
    <div
      key={animKey}
      className={`assessment-result-banner mt-8 flex flex-col sm:flex-row items-center gap-4 rounded-xl border-2 px-6 py-5 ${
        isAllCorrect
          ? "border-emerald-300 bg-emerald-50"
          : "border-red-300 bg-red-50"
      }`}
    >
      <div
        className={`assessment-result-icon flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
          isAllCorrect
            ? "assessment-result-icon--success bg-emerald-500"
            : "assessment-result-icon--error bg-red-500"
        }`}
      >
        {isAllCorrect ? (
          <PartyPopper size={24} className="text-white" />
        ) : (
          <XCircle size={24} className="text-white" />
        )}
      </div>

      <p
        className={`text-base md:text-lg font-bold text-center sm:text-left ${
          isAllCorrect ? "text-emerald-700" : "text-red-700"
        }`}
      >
        {isAllCorrect
          ? "Selamat, Jawabanmu sudah benar"
          : "Sayang Sekali, Jawabanmu masih salah, silahkan coba lagi"}
      </p>

      {/* 🔥 Keyframe murni pakai <style> polos (bukan `<style jsx>`) biar
          animasinya jalan di mana pun tanpa bergantung ke ada/nggaknya
          babel plugin styled-jsx aktif di project ini — cukup CSS standar
          yang di-inject sebagai child JSX biasa. */}
      <style>{`
        .assessment-result-banner {
          animation: assessmentBannerIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .assessment-result-icon--success {
          animation:
            assessmentIconPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both,
            assessmentRingPulse 1.6s ease-out 0.65s infinite;
        }
        .assessment-result-icon--error {
          animation: assessmentIconShake 0.55s ease-in-out 0.1s both;
        }
        @keyframes assessmentBannerIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes assessmentIconPop {
          0% {
            transform: scale(0) rotate(-15deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.2) rotate(5deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes assessmentIconShake {
          0%,
          100% {
            transform: translateX(0) scale(1);
          }
          20% {
            transform: translateX(-6px) scale(1.05);
          }
          40% {
            transform: translateX(6px) scale(1.05);
          }
          60% {
            transform: translateX(-4px) scale(1.05);
          }
          80% {
            transform: translateX(4px) scale(1.05);
          }
        }
        @keyframes assessmentRingPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45);
          }
          100% {
            box-shadow: 0 0 0 14px rgba(16, 185, 129, 0);
          }
        }
      `}</style>
    </div>
  );

  // 🔥 BARU: tombol "Coba Lagi", dipakai bareng-bareng sama true/false DAN
  // matching juga.
  const renderTryAgainButton = (onReset: () => void) => (
    <div className="flex justify-center mt-6">
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-emerald-600 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-50 active:scale-[0.98] transition"
      >
        <RotateCcw size={18} />
        Coba Lagi
      </button>
    </div>
  );

  const renderMultipleChoice = (item: AdditionalContent) => {
    if (item.type !== "multiple_choice") return null;

    const data = item.content as MultipleChoiceContent;
    // 🔥 Backend belum kirim id sama sekali (baik di item maupun di
    // content-nya) — orderNumber dipakai sebagai pengganti identitas unik
    // per soal selama backend belum ditambah `id`.
    const mcKey = String(item.id ?? item.orderNumber ?? "mc");
    const isSubmitted = mcSubmitted[mcKey] ?? false;

    // 🔥 BARU: semua pernyataan HARUS sudah dijawab DAN benar semua biar
    // dianggap "isAllCorrect" — kalau ada yang belum dijawab (userValue
    // undefined) otomatis kehitung salah/belum lengkap.
    const isAllCorrect = data.options.every((option) => {
      const userValue = mcAnswers[`${mcKey}-${option.orderNumber}`];
      const correctValue = option.isCorrect ? "true" : "false";
      return userValue === correctValue;
    });

    const handleSelect = (optionOrder: number, value: "true" | "false") => {
      if (isSubmitted) return;

      setMcAnswers((prev) => ({
        ...prev,
        [`${mcKey}-${optionOrder}`]: value,
      }));
    };

    const handleSubmit = () => {
      setMcSubmitted((prev) => ({
        ...prev,
        [mcKey]: true,
      }));
      setMcAttempt((prev) => ({
        ...prev,
        [mcKey]: (prev[mcKey] ?? 0) + 1,
      }));
    };

    // 🔥 BARU: reset total balik ke kondisi awal — semua jawaban yang
    // sudah dipilih untuk soal INI dihapus (bukan cuma "unsubmit"), biar
    // "coba lagi" beneran dari nol, bukan cuma buka kunci submit doang
    // dengan jawaban lama masih nempel.
    const handleReset = () => {
      setMcAnswers((prev) => {
        const next = { ...prev };
        data.options.forEach((option) => {
          delete next[`${mcKey}-${option.orderNumber}`];
        });
        return next;
      });
      setMcSubmitted((prev) => ({
        ...prev,
        [mcKey]: false,
      }));
    };

    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-3xl bg-white border-2 border-emerald-600 rounded-xl p-8">
          {/* QUESTION */}
          <h3 className="text-2xl font-bold text-black text-center">
            {data.question}
          </h3>

          {/* DESCRIPTION */}
          {data.description && (
            <p className="text-center text-gray-600 mt-3">{data.description}</p>
          )}

          {/* TABLE */}
          <div className="mt-8">
            {/* HEADER */}
            <div className="grid grid-cols-[60px_1fr_80px_80px] font-semibold text-center border-b pb-3">
              <div>No</div>
              <div className="text-left">Pernyataan</div>
              <div>Benar</div>
              <div>Salah</div>
            </div>

            <div className="divide-y">
              {data.options.map((option, index) => {
                const userValue = mcAnswers[`${mcKey}-${option.orderNumber}`];

                const correctValue = option.isCorrect ? "true" : "false";

                const isWrong =
                  isSubmitted && userValue && userValue !== correctValue;

                const isRight = isSubmitted && userValue === correctValue;

                return (
                  <div
                    key={option.orderNumber ?? index}
                    className={`grid grid-cols-[60px_1fr_80px_80px] items-center py-4 text-center transition
                    ${isWrong ? "bg-red-50" : ""}
                    ${isRight ? "bg-emerald-50" : ""}
                  `}
                  >
                    {/* NOMOR */}
                    <div className="font-medium">{index + 1}</div>

                    {/* PERNYATAAN */}
                    <div
                      className={`text-left pr-4 transition ${
                        isWrong ? "text-red-600 font-medium" : ""
                      }`}
                    >
                      {option.content}
                    </div>

                    {/* TRUE */}
                    <div>
                      <input
                        type="radio"
                        name={`${mcKey}-${option.orderNumber}`}
                        checked={userValue === "true"}
                        onChange={() =>
                          handleSelect(option.orderNumber, "true")
                        }
                        className="w-5 h-5 accent-emerald-600"
                      />
                    </div>

                    {/* FALSE */}
                    <div>
                      <input
                        type="radio"
                        name={`${mcKey}-${option.orderNumber}`}
                        checked={userValue === "false"}
                        onChange={() =>
                          handleSelect(option.orderNumber, "false")
                        }
                        className="w-5 h-5 accent-emerald-600"
                      />
                    </div>

                    {/* FEEDBACK */}
                    {isSubmitted && (
                      <div className="col-span-4 text-sm mt-1 text-left pl-[60px]">
                        {isRight && (
                          <span className="flex items-center gap-2 text-emerald-600 font-medium">
                            <Check size={16} />
                            Jawaban benar
                          </span>
                        )}
                        {isWrong && (
                          <span className="flex items-center gap-2 text-red-600 font-medium">
                            <X size={16} />
                            Jawaban salah
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          {!isSubmitted && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
              >
                Submit Jawaban
              </button>
            </div>
          )}

          {/* 🔥 BARU: banner hasil (animasi) + tombol Coba Lagi — muncul
              begitu sudah di-submit, baik semua jawabannya benar MAUPUN
              masih ada yang salah/belum lengkap. */}
          {isSubmitted &&
            renderAssessmentResultBanner(
              isAllCorrect,
              `${mcKey}-${mcAttempt[mcKey] ?? 0}`,
            )}

          {/* EXPLANATION */}
          {isSubmitted && data.explanation && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 p-6 rounded-lg">
              <h4 className="font-semibold mb-2 text-emerald-700">
                Penjelasan:
              </h4>
              <div
                className={`break-words ${richTextDisplayClass}`}
                dangerouslySetInnerHTML={{
                  __html: normalizeEditorHTML(
                    markdownToHTML(data.explanation ?? ""),
                  ),
                }}
              />
            </div>
          )}

          {isSubmitted && renderTryAgainButton(handleReset)}
        </div>
      </div>
    );
  };

  const [matchingAnswers, setMatchingAnswers] = useState<
    Record<string, Record<number, number>>
  >({});
  // { [matchingId]: { [leftId]: rightId } }

  const [matchingSubmitted, setMatchingSubmitted] = useState<
    Record<string, boolean>
  >({});

  const [recentlyCancelled, setRecentlyCancelled] = useState<
    Record<string, string | null>
  >({});

  // 🔥 BARU: sama persis fungsinya kayak `mcAttempt` di true/false — cuma
  // buat mastiin banner hasil (renderAssessmentResultBanner) remount &
  // animasinya replay tiap kali Submit ditekan, walau kategori hasilnya
  // (benar/salah) sama kayak attempt sebelumnya.
  const [matchingAttempt, setMatchingAttempt] = useState<
    Record<string, number>
  >({});

  // 🔥 BARU: auto-scroll pas drag pilihan jawaban matching ke soal yang
  // posisinya di luar layar (kebawah/keatas). Sebelumnya kalau soalnya
  // banyak (misal 10 pasang), area drop-nya jelas nggak muat 1 layar
  // penuh — kalau mau drag pilihan jawaban paling atas ke soal paling
  // bawah, user harus LEPAS drag-nya, scroll manual duluan pakai
  // mouse/trackpad, baru drag ulang. Ribet & gak intuitive.
  // `isMatchingDraggingRef` nandain lagi ada drag matching yang aktif
  // (di-set true di onDragStart pill jawaban, false lagi di onDragEnd-nya
  // — lihat renderMatching di bawah). Selama true, listener "dragover" di
  // window bakal terus ngecek posisi kursor: kalau udah deket banget ke
  // tepi atas/bawah viewport, container yang bisa di-scroll (ketemu
  // dengan jalan naik dari elemen yang lagi dihover pakai
  // document.elementFromPoint, biar otomatis nemu container yang BENERAN
  // scroll — di project ini itu `<main className="... overflow-y-auto
  // ...">` di SubchapterDetail.tsx, BUKAN window, karena window sendiri
  // nggak scroll di layout ini) di-scroll dikit-dikit terus-menerus ke
  // arah situ, SELAMA drag masih berlangsung — jadi user tinggal tahan
  // drag-nya di deket tepi layar, sisanya otomatis, gak perlu
  // lepas-scroll-drag-ulang lagi.
  const isMatchingDraggingRef = useRef(false);

  useEffect(() => {
    const AUTO_SCROLL_EDGE_PX = 120; // seberapa deket ke tepi layar sebelum mulai auto-scroll
    const AUTO_SCROLL_SPEED_PX = 18; // kecepatan scroll per event "dragover"

    // Cari ancestor terdekat yang BENERAN scrollable (overflow-y auto/
    // scroll DAN kontennya emang lebih panjang dari area yang keliatan).
    // Fallback ke `document.scrollingElement` kalau nggak ketemu, buat
    // jaga-jaga kalau suatu saat layout-nya berubah jadi window yang
    // scroll (bukan `<main>` custom kayak sekarang).
    const getScrollableAncestor = (
      startEl: Element | null,
    ): HTMLElement | null => {
      let node = startEl as HTMLElement | null;
      while (
        node &&
        node !== document.body &&
        node !== document.documentElement
      ) {
        const style = window.getComputedStyle(node);
        const canScrollY =
          (style.overflowY === "auto" || style.overflowY === "scroll") &&
          node.scrollHeight > node.clientHeight;
        if (canScrollY) return node;
        node = node.parentElement;
      }
      return (document.scrollingElement as HTMLElement | null) ?? null;
    };

    const handleWindowDragOver = (e: DragEvent) => {
      if (!isMatchingDraggingRef.current) return;

      const viewportHeight = window.innerHeight;
      let direction = 0;
      if (e.clientY < AUTO_SCROLL_EDGE_PX) {
        direction = -1;
      } else if (e.clientY > viewportHeight - AUTO_SCROLL_EDGE_PX) {
        direction = 1;
      }
      if (direction === 0) return;

      const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
      const scrollEl = getScrollableAncestor(hoveredEl);
      scrollEl?.scrollBy({
        top: direction * AUTO_SCROLL_SPEED_PX,
        behavior: "auto",
      });
    };

    // Jaga-jaga: kalau drag dibatalkan di luar dugaan (drop di luar zona
    // yang valid, dsb) tanpa sempat trigger onDragEnd elemen pill-nya
    // dengan bersih, "dragend" SELALU fire di elemen sumber begitu operasi
    // drag selesai — apa pun hasilnya — dan event ini bubble ke window,
    // jadi paling reliable buat jaring pengaman reset flag-nya.
    const handleWindowDragEnd = () => {
      isMatchingDraggingRef.current = false;
    };

    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("dragend", handleWindowDragEnd);
    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("dragend", handleWindowDragEnd);
    };
  }, []);

  const renderMatching = (item: AdditionalContent) => {
    if (item.type !== "matching") return null;

    const data = item.content as MatchingContent;
    // 🔥 Backend belum kirim id sama sekali — orderNumber dipakai sebagai
    // pengganti identitas unik per soal & per item (kiri/kanan) selama
    // backend belum ditambah `id`.
    const matchingKey = String(item.id ?? item.orderNumber ?? "matching");
    const isSubmitted = matchingSubmitted[matchingKey] ?? false;
    const answers = matchingAnswers[matchingKey] ?? {};

    // Backend kirim satu array items[] campur kiri/kanan, dibedain lewat
    // `side`. Dipecah di sini biar UI-nya (drag kanan → drop kiri) tetap
    // sama seperti sebelumnya.
    const leftItems = data.items.filter((i) => i.side === "LEFT");
    const rightItems = data.items.filter((i) => i.side === "RIGHT");

    // 🔥 KOREKSI (ditemukan dari page.tsx admin, case "matching" di
    // mapMaterialToCanvasItems): `matchWithId` itu TAG PASANGAN BERSAMA —
    // item kiri dan kanan yang berpasangan sama-sama disetel `matchWithId`
    // yang SAMA persis. Ini BUKAN leftItem.matchWithId menunjuk ke
    // orderNumber item kanan (asumsi awal saya sebelumnya salah). Kalau
    // salah satu sisi nggak punya matchWithId, admin fallback ke pasangan
    // berdasar urutan index (`rightRaw[idx]`) — direplikasi persis di sini.
    const rightOrderByMatchId = new Map<string, number>();
    rightItems.forEach((r) => {
      if (r.matchWithId) rightOrderByMatchId.set(r.matchWithId, r.orderNumber);
    });

    const correctRightOrderByLeft = new Map<number, number>();
    leftItems.forEach((l, idx) => {
      const matchedRightOrder = l.matchWithId
        ? rightOrderByMatchId.get(l.matchWithId)
        : undefined;
      const fallbackRightOrder = rightItems[idx]?.orderNumber;
      const resolved = matchedRightOrder ?? fallbackRightOrder;
      if (resolved !== undefined) {
        correctRightOrderByLeft.set(l.orderNumber, resolved);
      }
    });

    // 🔥 Semua orderNumber kanan yang sudah dipakai
    const usedRightOrders = Object.values(answers);

    const handleDrop = (leftOrder: number, rightOrder: number) => {
      if (isSubmitted) return;

      // 🔥 Kalau orderNumber kanan sudah dipakai di tempat lain → tolak
      const alreadyUsed = usedRightOrders.includes(rightOrder);
      if (alreadyUsed && answers[leftOrder] !== rightOrder) return;

      setMatchingAnswers((prev) => ({
        ...prev,
        [matchingKey]: {
          ...prev[matchingKey],
          [leftOrder]: rightOrder,
        },
      }));
    };

    const handleSubmit = () => {
      setMatchingSubmitted((prev) => ({
        ...prev,
        [matchingKey]: true,
      }));
      setMatchingAttempt((prev) => ({
        ...prev,
        [matchingKey]: (prev[matchingKey] ?? 0) + 1,
      }));
    };

    // 🔥 BARU: reset total ke kondisi awal — semua pasangan yang sudah
    // di-drop untuk soal matching INI dihapus, bukan cuma "unsubmit" saja.
    const handleReset = () => {
      setMatchingAnswers((prev) => ({
        ...prev,
        [matchingKey]: {},
      }));
      setMatchingSubmitted((prev) => ({
        ...prev,
        [matchingKey]: false,
      }));
      setRecentlyCancelled((prev) => ({
        ...prev,
        [matchingKey]: null,
      }));
    };

    const isCorrectPair = (leftOrder: number, rightOrder: number) =>
      correctRightOrderByLeft.get(leftOrder) === rightOrder;

    // 🔥 BARU: semua soal (leftItems) harus sudah dijodohkan DAN pasangan
    // yang dipilih benar semua biar dianggap "isAllCorrect" — soal yang
    // belum di-drop sama sekali otomatis kehitung belum lengkap/salah.
    const isAllCorrect = leftItems.every((left) => {
      const rightOrder = answers[left.orderNumber];
      return (
        rightOrder !== undefined && isCorrectPair(left.orderNumber, rightOrder)
      );
    });

    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-4xl bg-white border-2 border-emerald-600 rounded-xl p-8">
          {/* QUESTION */}
          <h3 className="text-2xl font-bold text-black text-center">
            {data.title}
          </h3>

          {data.instruction && (
            <p className="text-center text-gray-600 mt-3">{data.instruction}</p>
          )}

          {/* INSTRUCTION */}
          <p className="text-center text-sm text-gray-500 mt-4 italic">
            (Seret dan lepaskan card ke area kosong yang tersedia)
          </p>

          {/* ============================= */}
          {/* 🔥 PILIHAN JAWABAN DI ATAS */}
          {/* ============================= */}
          {!isSubmitted && (
            <div className="mt-10">
              <h4 className="text-center font-semibold mb-4">
                Pilihan Jawaban
              </h4>

              <div className="flex flex-wrap gap-4 justify-center">
                {rightItems.map((right) => {
                  const isUsed = usedRightOrders.includes(right.orderNumber);

                  return (
                    <div
                      key={right.orderNumber}
                      draggable={!isUsed}
                      onDragStart={(e) => {
                        if (isUsed) return;
                        e.dataTransfer.setData(
                          "text/plain",
                          String(right.orderNumber),
                        );
                        // 🔥 BARU: tandain drag matching lagi aktif, biar
                        // auto-scroll listener (lihat useEffect di atas)
                        // mulai jalan selama drag ini berlangsung.
                        isMatchingDraggingRef.current = true;
                      }}
                      onDragEnd={() => {
                        // Drag berakhir — apa pun hasilnya (berhasil di-drop
                        // atau dibatalkan) — matiin auto-scroll.
                        isMatchingDraggingRef.current = false;
                      }}
                      className={`
                      px-5 py-2 rounded-lg shadow-sm border transition text-sm
                      ${
                        isUsed
                          ? "bg-red-50 border-red-400 text-red-600 cursor-not-allowed opacity-70"
                          : "bg-white border-emerald-500 hover:bg-emerald-50 cursor-grab active:cursor-grabbing"
                      }
                    `}
                    >
                      {right.content}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================= */}
          {/* MATCH AREA CENTERED */}
          {/* ============================= */}
          <div className="mt-14 flex flex-col items-center space-y-8">
            {leftItems.map((left) => {
              const selectedRightOrder = answers[left.orderNumber];
              const selectedRight = rightItems.find(
                (r) => r.orderNumber === selectedRightOrder,
              );

              const isCorrect =
                isSubmitted &&
                selectedRightOrder !== undefined &&
                isCorrectPair(left.orderNumber, selectedRightOrder);

              const isWrong =
                isSubmitted &&
                selectedRightOrder !== undefined &&
                !isCorrectPair(left.orderNumber, selectedRightOrder);

              return (
                <div
                  key={left.orderNumber}
                  className="flex items-center justify-center gap-8 w-full max-w-3xl"
                >
                  {/* LEFT */}
                  <div className="w-1/3 bg-gray-100 px-4 py-3 rounded-lg font-medium text-sm text-center">
                    {left.content}
                  </div>

                  {/* 🔥 ARROW LEBIH BESAR & TEBAL */}
                  <ArrowRight
                    className="text-emerald-700"
                    size={40}
                    strokeWidth={3}
                  />

                  {/* DROP ZONE */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const rightOrder = Number(
                        e.dataTransfer.getData("text/plain"),
                      );
                      handleDrop(left.orderNumber, rightOrder);
                    }}
                    className={`
                    w-1/3 min-h-[52px] flex items-center justify-center
                    border-2 border-dashed rounded-lg px-4 py-3 transition text-center
                    ${isCorrect ? "border-emerald-500 bg-emerald-50" : ""}
                    ${isWrong ? "border-red-500 bg-red-50" : ""}
                    ${!selectedRight ? "border-gray-300 bg-gray-50" : ""}
                  `}
                  >
                    {selectedRight ? (
                      <div
                        title={
                          recentlyCancelled[matchingKey] ===
                          String(left.orderNumber)
                            ? "Cancelled Answer"
                            : "Undrop Answer"
                        }
                        onClick={() => {
                          if (isSubmitted) return;

                          // 🔥 remove answer
                          setMatchingAnswers((prev) => {
                            const newAnswers = { ...prev[matchingKey] };
                            delete newAnswers[left.orderNumber];

                            return {
                              ...prev,
                              [matchingKey]: newAnswers,
                            };
                          });

                          // 🔥 trigger cancelled tooltip
                          setRecentlyCancelled((prev) => ({
                            ...prev,
                            [matchingKey]: String(left.orderNumber),
                          }));

                          // reset tooltip back setelah 1.5 detik
                          setTimeout(() => {
                            setRecentlyCancelled((prev) => ({
                              ...prev,
                              [matchingKey]: null,
                            }));
                          }, 1500);
                        }}
                        className={`
      font-medium text-sm text-red-600 cursor-pointer
      hover:opacity-80 transition
    `}
                      >
                        {selectedRight.content}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        Drop di sini
                      </span>
                    )}
                  </div>

                  {/* RESULT ICON */}
                  {isSubmitted && selectedRightOrder !== undefined && (
                    <div>
                      {isCorrect ? (
                        <Check className="text-emerald-600" />
                      ) : (
                        <X className="text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* SUBMIT */}
          {!isSubmitted && (
            <div className="flex justify-center mt-12">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
              >
                Submit Jawaban
              </button>
            </div>
          )}

          {/* 🔥 BARU: banner hasil (animasi) + tombol Coba Lagi — sama
              persis pola & komponennya kayak di true/false. */}
          {isSubmitted &&
            renderAssessmentResultBanner(
              isAllCorrect,
              `${matchingKey}-${matchingAttempt[matchingKey] ?? 0}`,
            )}

          {/* EXPLANATION */}
          {isSubmitted && data.explanation && (
            <div className="mt-8 bg-emerald-50 border border-emerald-200 p-6 rounded-lg">
              <h4 className="font-semibold mb-2 text-emerald-700">
                Penjelasan:
              </h4>
              <div
                className={`break-words ${richTextDisplayClass}`}
                dangerouslySetInnerHTML={{
                  __html: normalizeEditorHTML(
                    markdownToHTML(data.explanation ?? ""),
                  ),
                }}
              />
            </div>
          )}

          {isSubmitted && renderTryAgainButton(handleReset)}
        </div>
      </div>
    );
  };

  const [codeOutputs, setCodeOutputs] = useState<Record<string, string>>({});
  const [codeRunCount, setCodeRunCount] = useState<Record<string, number>>({});

  const renderInteractiveCode = (item: AdditionalContent) => {
    if (item.type !== "interactive_code") return null;

    const data = item.content as InteractiveCodeContent;
    const codeKey = String(item.id ?? item.orderNumber ?? "code");

    const output = codeOutputs[codeKey];
    const runCount = codeRunCount[codeKey] ?? 0;

    const handleRunCode = () => {
      if (!data.expectedResult) return;
      // setiap run akan overwrite output (bisa berkali-kali)
      setCodeOutputs((prev) => ({
        ...prev,
        [codeKey]: data.expectedResult as string,
      }));

      setCodeRunCount((prev) => ({
        ...prev,
        [codeKey]: runCount + 1,
      }));
    };

    const normalizeCode = (text: string) => {
      return text.replace(/\\n/g, "\n");
    };

    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-3xl">
          {/* ================= KETERANGAN ================= */}
          <p className="ml-1 mb-2 text-base font-medium text-gray-700">
            Berikut adalah contoh Code-nya:
          </p>

          {/* ================= CODE CONTAINER ================= */}
          <div className="bg-[#0F172A] rounded-xl overflow-hidden shadow-xl">
            {/* ================= HEADER ================= */}
            <div className="flex items-center justify-between px-5 py-3 bg-[#1E293B] border-b border-slate-700">
              <span className="text-sm font-medium text-emerald-400 uppercase tracking-wide">
                {data.language}
              </span>

              <button
                onClick={handleRunCode}
                className="px-4 py-1.5 text-sm font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
              >
                Run Code
              </button>
            </div>

            {/* ================= CODE BLOCK ================= */}
            <pre className="p-6 text-sm text-slate-200 font-mono whitespace-pre-wrap overflow-x-auto">
              {normalizeCode(data.initialCode)}
            </pre>

            {/* ================= OUTPUT ================= */}
            {output && (
              <div className="border-t border-slate-700 bg-black px-6 py-4">
                <p className="text-xs text-gray-400 mb-2">Output:</p>
                <pre className="text-emerald-400 text-sm font-mono whitespace-pre-wrap">
                  {normalizeCode(output)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const isInteractiveType = (type: AdditionalContentType) =>
    type === "multiple_choice" || type === "matching";

  return (
    <article className="w-full pb-7">
      {/* Antar Block → Lebih Jauh */}
      <div className="space-y-10">
        {sortedBlocks.map((block) => {
          const sortedContents = [...(block.contents ?? [])]
            .filter((c) => typeof c.orderNumber === "number")
            .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));

          const sortedAdditional =
            block.additionalContents
              ?.filter((a) => typeof a.orderNumber === "number")
              .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)) ??
            [];

          // 🔥 FIX URUTAN (image/video/matching/true-false/coding tampil di
          // posisi yang salah di sisi user, padahal di admin sudah benar):
          //
          // Dulu di sini additionalContents dipisah dari contents lalu
          // ditaruh pakai heuristik posisi: "BEFORE" → selalu di paling
          // awal block, "AFTER" → selalu di paling akhir block, "INLINE" →
          // ditaruh di tengah pakai TEBAKAN index (totalContents / 2).
          // Field `position` itu sendiri di sisi admin (lihat
          // buildBlocksPayload di page.tsx, semua case image/video/coding/
          // matching/true-false) SELALU di-hardcode "AFTER" apa pun urutan
          // aslinya waktu diinput di canvas — jadi field ini nggak pernah
          // benar-benar merepresentasikan posisi asli, dan heuristik di
          // atas jelas gagal merepresentasikan urutan input yang sebenarnya.
          //
          // Sumber kebenaran urutan yang BENAR adalah `orderNumber`: admin
          // pakai SATU counter global yang sama-sama dipakai contents DAN
          // additionalContents waktu disave ("Satu counter global untuk
          // contents DAN additionalContents supaya urutan canvas
          // tersimpan dengan benar" — page.tsx), dan waktu di-restore ke
          // canvas juga digabung+sort ulang pakai orderNumber global itu
          // ("Gabung contents + additionalContents, sort by orderNumber
          // global" — page.tsx). Itu sebabnya admin preview selalu benar
          // urutannya walau sudah disave & direfresh.
          //
          // Fix: tiru persis cara admin — gabung sortedContents +
          // sortedAdditional jadi SATU list, sort ulang bareng-bareng
          // berdasarkan orderNumber global itu, lalu render sekuensial apa
          // adanya (bukan dikelompokkan lagi jadi before/inline/after).
          const mergedItems = [
            ...sortedContents.map((c) => ({
              kind: "content" as const,
              orderNumber: c.orderNumber ?? 0,
              data: c,
            })),
            ...sortedAdditional.map((a) => ({
              kind: "additional" as const,
              orderNumber: a.orderNumber ?? 0,
              data: a,
            })),
          ].sort((a, b) => a.orderNumber - b.orderNumber);

          const renderAdditionalItem = (item: AdditionalContent) =>
            item.type === "image_video"
              ? renderImageVideo(item)
              : item.type === "multiple_choice"
                ? renderMultipleChoice(item)
                : item.type === "matching"
                  ? renderMatching(item)
                  : item.type === "interactive_code"
                    ? (() => {
                        const data = item.content as InteractiveCodeContent;
                        return (
                          <InteractiveCodeRunner
                            language={data.language}
                            initialCode={data.initialCode}
                          />
                        );
                      })()
                    : null;

          return (
            <div key={block.id ?? block.orderNumber}>
              {mergedItems.map((entry, index) => {
                if (entry.kind === "additional") {
                  const item = entry.data;
                  return (
                    <div
                      key={item.id ?? `additional-${item.orderNumber ?? index}`}
                      className={
                        isInteractiveType(item.type) ? "my-10" : "my-5"
                      }
                    >
                      {renderAdditionalItem(item)}
                    </div>
                  );
                }

                const content = entry.data as BlockContent;
                const prevEntry = mergedItems[index - 1];

                let marginTop = "";
                if (index === 0) {
                  marginTop = "";
                } else if (prevEntry?.kind === "content") {
                  const prevContent = prevEntry.data as BlockContent;
                  if (
                    prevContent?.type === "paragraph" &&
                    content.type === "paragraph"
                  ) {
                    marginTop = "mt-3";
                  } else if (prevContent?.type === "heading") {
                    marginTop = "mt-4";
                  } else {
                    marginTop = "mt-7";
                  }
                } else {
                  // Entry sebelumnya additional (image/video/matching/dst)
                  // yang sudah punya margin sendiri (my-5 / my-10) — cukup
                  // jarak wajar di sini, jangan dobel margin gede.
                  marginTop = "mt-5";
                }

                return (
                  <div
                    key={content.id ?? content.orderNumber ?? index}
                    className={marginTop}
                  >
                    {renderContent(content)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </article>
  );
}

/* ================= MAIN EXPORT ================= */

export default function SubchapterContent({
  mode,
  textId,
  onQuizSubmitScore,
  onQuizReset,
  onAssignmentScore,
  onContentCompleted,
  onUnsavedChangesChange,
}: ModeProps) {
  if (mode.type === "quiz")
    return (
      <QuizRenderer
        quiz={mode.data}
        textId={textId}
        onSubmitScore={onQuizSubmitScore}
        onReset={onQuizReset}
        onContentCompleted={onContentCompleted}
        onUnsavedChangesChange={onUnsavedChangesChange}
      />
    );

  if (mode.type === "assignment")
    return (
      <AssignmentRenderer
        a={mode.data}
        textId={textId}
        onAssignmentScore={onAssignmentScore}
        onContentCompleted={onContentCompleted}
        onUnsavedChangesChange={onUnsavedChangesChange}
      />
    );

  return <RenderSubModuleContent subModule={mode.data} />;
}
