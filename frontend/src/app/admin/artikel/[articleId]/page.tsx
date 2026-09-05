"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  ArrowLeft,
  Pencil,
  Undo2,
  Redo2,
  Heading1,
  UploadCloud,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  PlusCircle,
  AlignLeft,
  Image as ImageIcon,
  Table2,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import ArticleContentElementsSidebar, {
  ARTICLE_ELEMENTS,
  ARTICLE_ELEMENT_DRAG_MIME,
  type ArticleContentElement,
} from "@/components/admin/artikel/ArticleContentElementsSidebar";
import ArtikelCategoryModal from "@/components/admin/artikel/ArtikelCategoryModal";
import ArticleCanvasCard, {
  createDefaultArticleItemData,
  RICH_TEXT_ELEMENT_IDS,
  type ArticleCanvasItem,
  type ArticleCanvasItemData,
} from "@/components/admin/artikel/ArticleCanvasCard";
import ArticleStylePanel, {
  type ArticleStyleState,
} from "@/components/admin/artikel/ArticleStylePanel";
// 🔥 BARU — tampilan "1 halaman penuh" saat tombol Preview diklik, lihat
// handlePreview & blok `if (previewMode)` di bawah.
import ArticlePreview from "@/components/admin/artikel/ArticlePreview";
import type {
  ArticleRichTextEditorRef,
  ArticleSelectionState,
} from "@/components/admin/artikel/ArticleRichTextEditor";
import { FONT_PRESETS } from "@/components/admin/artikel/articleFontStyles";
import {
  buildArticleContentFormData,
  mapBlocksResponseToCanvasItems,
  validateArticleContentBeforeSave,
  htmlToPlainText,
  type ArticleBlockResponse,
} from "@/components/admin/artikel/articleContentMapper";

// ─── Font ──────────────────────────────────────────────────────────────────────
// Plus Jakarta Sans dipilih karena memiliki semua varian (bold, italic, semibold,
// dsb.) yang dibutuhkan editor. Font ini hanya di-scope ke halaman create/edit
// material, tidak mempengaruhi halaman lain di project.
const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// ─── Type dari API ────────────────────────────────────────────────────────────
interface ArticleDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  // 🔥 DIUBAH: category sekarang relasi ke ArticleCategory (bukan string
  // bebas lagi), backend balikin object {id, name} atau null.
  category: { id: string; name: string } | null;
  tags: string[];
  status: string; // "DRAFT" | "PUBLISHED" (defensif kalau ada data lama)
  isRecommended: boolean;
  author: {
    id: string;
    fullName: string;
    profilePicture: string | null;
    roles: string[];
  } | null;
}

// Role bisa lebih dari satu — prioritas tampilan: Admin > CM > CURDEV.
function getAuthorRoleLabel(roles?: string[] | null): string | null {
  if (!roles || roles.length === 0) return null;
  const lower = roles.map((r) => r.toLowerCase());
  if (lower.includes("admin")) return "Admin";
  if (lower.includes("cm")) return "CM";
  if (lower.includes("curdev")) return "CURDEV";
  return null;
}

// 🔥 BARU: mirror persis fungsi slugify() di article.service.ts backend.
// Validator (updateArticleSchema) nge-cek slug pakai regex ketat
// (/^[a-z0-9]+(?:-[a-z0-9]+)*$/) SEBELUM sempat dinormalisasi backend,
// jadi kalau kita kirim mentah (ada spasi/huruf besar/tanda strip
// ganda), request bisa kena 400. Normalisasi yang sama diterapkan di FE
// sebelum submit, biar nggak pernah gagal validasi cuma gara-gara format.
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// 🔥 BARU: state default untuk toolbar Style panel — dipakai saat belum ada
// elemen yang fokus (contentEditable) sama sekali.
const DEFAULT_STYLE_STATE: ArticleStyleState = {
  fontType: "Paragraph",
  fontSize: FONT_PRESETS.Paragraph.fontSize,
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  highlight: false,
  penColor: "#000000",
  align: "left",
  listType: "none",
};

let instanceCounter = 0;
function generateInstanceId(prefix: string) {
  instanceCounter += 1;
  return `${prefix.toLowerCase()}-${Date.now()}-${instanceCounter}`;
}

// 🔥 BARU: hitung urutan-ke berapa suatu item di antara item lain yang
// bertipe sama, dipakai ArticleStylePanel buat kasih label "Paragraph 2"
// dst kalau ada elemen dengan tipe yang sama lebih dari satu.
function buildItemCounters(items: ArticleCanvasItem[]): Record<string, number> {
  const seen: Record<string, number> = {};
  const counters: Record<string, number> = {};
  items.forEach((item) => {
    seen[item.id] = (seen[item.id] ?? 0) + 1;
    counters[item.instanceId] = seen[item.id];
  });
  return counters;
}

// (Catatan: helper strip-HTML lama di sini sudah dipindah & diperbaiki jadi
// `htmlToPlainText` di articleContentMapper.ts — versi lama cuma buang tag
// mentah-mentah tanpa mempertahankan baris baru antar block, versi baru
// mengubah </div>/<br> jadi "\n" dulu sebelum tag lain dibuang.)

export default function ArtikelEditorPage() {
  const router = useRouter();
  const params = useParams<{ articleId: string }>();
  const articleId = params.articleId;

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<ArticleDetail | null>(null);

  // ─── Field yang bisa diedit di halaman ini (Article Settings) ──────────
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  // 🔥 BARU: Sub-title (field API-nya tetap `excerpt`, cuma dilabeli
  // "Sub-title" di UI biar nggak bingung sama admin). Ditampilkan di
  // preview persis di bawah title. Dibatasi maksimal 100 karakter.
  const [excerpt, setExcerpt] = useState("");
  // 🔥 DIUBAH: category (nama, string bebas) -> categoryId (id
  // ArticleCategory yang dipilih dari dropdown).
  const [categoryId, setCategoryId] = useState("");
  // 🔥 BARU — daftar kategori dari GET /api/article/categories, ngisi
  // dropdown Select category (gantiin ARTICLE_CATEGORIES yang statis).
  // 🔥 DIUBAH: ikutan simpan articleCount — dipakai langsung sebagai props
  // `categories` buat ArtikelCategoryModal (biar tombol delete di modal bisa
  // di-disable kalau kategori masih dipakai artikel lain).
  const [categoryOptions, setCategoryOptions] = useState<
    { id: string; name: string; articleCount: number }[]
  >([]);
  // 🔥 BARU — buka/tutup modal "Manage Article Categories" yang dipicu
  // link "Kelola Kategori" di sebelah label Category.
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [titleEditing, setTitleEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  // 🔥 BARU: toggle "1 halaman penuh" preview — bukan navigasi ke route
  // lain, cuma ganti apa yang dirender di halaman yang sama (lihat
  // handlePreview & blok `if (previewMode)` sebelum return JSX utama).
  const [previewMode, setPreviewMode] = useState(false);
  // 🔥 BARU: panel kanan (Style/Structure/Article Settings) bisa di-minimize
  // sama seperti sidebar kiri.
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  // 🔥 BARU: state open/collapsed sidebar kiri (Content Elements) sekarang
  // diangkat ke sini (dulu murni internal di dalam
  // ArticleContentElementsSidebar, jadi page.tsx nggak pernah tahu kapan
  // sidebar kiri terbuka/tertutup). Dibutuhkan supaya area canvas di
  // tengah bisa melebar pas salah satu/kedua sidebar ditutup — lihat
  // `canvasMaxWidthClass` di bawah.
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);

  // 🔥 BARU: lebar maksimal canvas di tengah sekarang menyesuaikan status
  // kedua sidebar, bukan lagi "max-w-2xl" yang tetap terus. Tujuannya biar
  // buka/tutup sidebar beneran kerasa manfaatnya (ruang kerja jadi lebih
  // lega), bukan cuma pindah posisi center doang kayak sebelumnya.
  const bothPanelsOpen = leftPanelOpen && rightPanelOpen;
  const bothPanelsClosed = !leftPanelOpen && !rightPanelOpen;
  const canvasMaxWidthClass = bothPanelsOpen
    ? "max-w-2xl"
    : bothPanelsClosed
      ? "max-w-5xl"
      : "max-w-3xl";

  // ─── Canvas & Style Panel state (logic dulu, belum disambungkan ke API
  // konten artikel yang sebenarnya — nyusul di tahap integrasi berikutnya) ──
  const [canvasItems, setCanvasItems] = useState<ArticleCanvasItem[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null,
  );
  const [dragCanvasId, setDragCanvasId] = useState<string | null>(null);
  const [dragOverCanvasId, setDragOverCanvasId] = useState<string | null>(null);
  // 🔥 BARU: highlight khusus buat drop zone di paling bawah canvas (di
  // bawah kartu terakhir), supaya user dapat feedback visual yang jelas
  // pas nge-drag elemen dari sidebar ke area kosong di bawah daftar kartu.
  const [dragOverCanvasEnd, setDragOverCanvasEnd] = useState(false);
  // 🔥 BARU: highlight khusus buat box "Start building your article" pas
  // canvas masih kosong — biar keliatan jelas kalau box ini beneran drop
  // zone yang aktif, bukan cuma teks placeholder biasa.
  const [dragOverEmptyCanvas, setDragOverEmptyCanvas] = useState(false);
  const [selectionStyle, setSelectionStyle] =
    useState<ArticleStyleState>(DEFAULT_STYLE_STATE);
  // Ref ke instance rich text editor yang sedang aktif/fokus di canvas —
  // dipakai supaya tombol-tombol di ArticleStylePanel (bold/italic/align/dst)
  // tahu execCommand harus dijalankan ke editor yang mana.
  const activeEditorRef = useRef<ArticleRichTextEditorRef | null>(null);
  // 🔥 BARU: ref ke DOM node tiap kartu canvas (keyed by instanceId) —
  // dipakai buat scrollIntoView kartu yang sedang difokus setelah Save
  // (lihat handleSave), supaya nggak "blink" ke atas gara-gara seluruh
  // canvasItems di-replace (instanceId baru semua) pas fetchArticleContent.
  const canvasItemNodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // Instance id yang perlu di-scrollIntoView begitu canvasItems selesai
  // di-render ulang (diisi di handleSave, dibaca & langsung dikosongkan
  // lagi oleh effect di bawah — bukan state, jadi nggak nge-trigger
  // render tambahan).
  const pendingFocusInstanceIdRef = useRef<string | null>(null);

  // Begitu canvasItems berubah (termasuk hasil full-replace dari
  // fetchArticleContent setelah Save), kalau ada instanceId yang lagi
  // "ditunggu" untuk difokuskan, scroll ke kartu itu tanpa animasi
  // lompat ke atas dulu.
  useEffect(() => {
    const targetId = pendingFocusInstanceIdRef.current;
    if (!targetId) return;
    pendingFocusInstanceIdRef.current = null;
    const node = canvasItemNodeRefs.current[targetId];
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [canvasItems]);

  const buildCoverUrl = (coverImage: string | null) =>
    coverImage ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${coverImage}` : null;

  // ── History untuk undo/redo canvasItems ──────────────────────────────────
  // Setiap kali canvasItems berubah, snapshot barunya otomatis ke-append ke
  // history (nggak perlu ubah satu-satu handler add/remove/reorder/edit).
  // skipHistoryPushRef dipakai buat "melewati" 1 kali push berikutnya —
  // dipakai pas undo/redo (biar nggak nge-push balik state yang lagi
  // di-restore) dan pas canvasItems di-replace penuh dari server
  // (initial load / setelah Save di fetchArticleContent), karena itu
  // bukan aksi edit user yang perlu di-undo.
  const [history, setHistory] = useState<ArticleCanvasItem[][]>([[]]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const historyIdxRef = useRef(0);
  const skipHistoryPushRef = useRef(true);

  useEffect(() => {
    if (skipHistoryPushRef.current) {
      skipHistoryPushRef.current = false;
      return;
    }
    setHistory((prev) => {
      const next = [...prev.slice(0, historyIdxRef.current + 1), canvasItems];
      historyIdxRef.current = next.length - 1;
      return next;
    });
    setHistoryIdx(historyIdxRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasItems]);

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    const newIdx = historyIdxRef.current - 1;
    skipHistoryPushRef.current = true;
    historyIdxRef.current = newIdx;
    setHistoryIdx(newIdx);
    setCanvasItems(history[newIdx]);
  }, [history]);

  const redo = useCallback(() => {
    if (historyIdxRef.current >= history.length - 1) return;
    const newIdx = historyIdxRef.current + 1;
    skipHistoryPushRef.current = true;
    historyIdxRef.current = newIdx;
    setHistoryIdx(newIdx);
    setCanvasItems(history[newIdx]);
  }, [history]);

  const canUndo = historyIdx > 0;
  const canRedo = historyIdx < history.length - 1;

  const fetchArticle = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/articles/${articleId}`,
        { withCredentials: true },
      );
      const data: ArticleDetail = res.data.data;
      setArticle(data);
      setTitle(data.title ?? "");
      setSlug(data.slug ?? "");
      setExcerpt(data.excerpt ?? "");
      setCategoryId(data.category?.id ?? "");
      setIsRecommended(data.isRecommended ?? false);
      setCoverFile(null);
      setCoverPreview(buildCoverUrl(data.coverImage));
      setSettingsDirty(false);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || err.message || "Gagal memuat artikel",
      );
      router.push("/admin/artikel");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  // ─── Konten artikel (blocks) — dimuat terpisah dari fetchArticle di atas
  // (endpoint beda: /articlecontent/...), lalu di-mapping ke bentuk
  // ArticleCanvasItem[] yang dipahami ArticleCanvasCard/ArticleStylePanel.
  // Lihat articleContentMapper.ts buat detail konversinya.
  const [contentDirty, setContentDirty] = useState(false);
  // Snapshot JSON dari canvasItems terakhir kali sukses dimuat/disimpan —
  // dibanding-bandingkan tiap canvasItems berubah buat tau ada perubahan
  // yang belum tersimpan atau nggak, tanpa perlu nyentuh satu-satu
  // handler (add/remove/reorder/edit semua otomatis kedeteksi).
  const savedCanvasItemsRef = useRef<string>("[]");

  // 🔥 DIUBAH: sekarang me-return `mapped` (array canvasItems hasil fetch)
  // supaya pemanggil (khususnya handleSave) bisa langsung tahu instanceId
  // BARU tiap item tanpa perlu nunggu re-render buat baca ulang state
  // canvasItems — dipakai buat restore fokus/scroll ke kartu yang tepat
  // setelah full-replace konten pas Save.
  const fetchArticleContent = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/articlecontent/articles/${articleId}/content/blocks`,
        { withCredentials: true },
      );
      const blocks: ArticleBlockResponse[] = res.data.data ?? [];
      const mapped = mapBlocksResponseToCanvasItems(blocks);
      savedCanvasItemsRef.current = JSON.stringify(mapped);
      // 🔥 Reset baseline history di sini — canvasItems yang di-replace
      // dari server (initial load / setelah Save) BUKAN aksi edit user,
      // jadi nggak boleh ikut ke-push sebagai history entry biasa, dan
      // undo/redo lama (sebelum reload ini) sengaja dianggap nggak
      // relevan lagi.
      skipHistoryPushRef.current = true;
      historyIdxRef.current = 0;
      setHistory([mapped]);
      setHistoryIdx(0);
      setCanvasItems(mapped);
      return mapped;
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Gagal memuat konten artikel",
      );
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  useEffect(() => {
    fetchArticleContent();
  }, [fetchArticleContent]);

  // Tiap canvasItems berubah (apa pun sebabnya — tambah/hapus/reorder/edit
  // teks/table/dll), bandingkan ke snapshot terakhir buat nentuin badge
  // "Belum disimpan" & tombol Save harus aktif atau nggak.
  useEffect(() => {
    setContentDirty(
      JSON.stringify(canvasItems) !== savedCanvasItemsRef.current,
    );
  }, [canvasItems]);

  // 🔥 BARU — daftar kategori buat dropdown "Select category", diambil dari
  // GET /api/article/categories (publik, nggak perlu auth). Dibikin
  // reusable (bukan langsung di dalam useEffect) supaya bisa dipanggil lagi
  // dari ArtikelCategoryModal (onChanged) tiap kali user nambah/edit/hapus
  // kategori, biar dropdown-nya langsung ke-refresh tanpa perlu reload.
  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/categories`,
      );
      setCategoryOptions(res.data.data ?? []);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Gagal memuat daftar kategori",
      );
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 🔥 BARU: reset status formatting transient (bold/italic/align/dst) tiap
  // ganti elemen yang dipilih, biar nggak "nyangkut" dari elemen sebelumnya
  // sebelum editor barunya benar-benar fokus dan kirim onSelectionChange.
  useEffect(() => {
    setSelectionStyle(DEFAULT_STYLE_STATE);
  }, [selectedInstanceId]);

  // ─── Tandai "belum disimpan" tiap kali field di atas berubah ───────────
  useEffect(() => {
    if (!article) return;
    const changed =
      title !== (article.title ?? "") ||
      slug !== (article.slug ?? "") ||
      excerpt !== (article.excerpt ?? "") ||
      categoryId !== (article.category?.id ?? "") ||
      isRecommended !== (article.isRecommended ?? false) ||
      coverFile !== null;
    setSettingsDirty(changed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, slug, excerpt, categoryId, isRecommended, coverFile]);

  // 🔥 BARU: validasi ringan sebelum submit (dipakai Save & Publish/Draft
  // toggle). Slug di-normalisasi otomatis (lihat slugify() di atas) jadi
  // nggak pernah gagal format; kategori cuma wajib pas mau PUBLISH.
  const validateBeforeSubmit = (requireCategory: boolean) => {
    if (requireCategory && !categoryId) {
      toast.error("Kategori wajib diisi sebelum publish");
      return false;
    }
    return true;
  };

  const buildFormData = (statusOverride?: "DRAFT" | "PUBLISHED") => {
    const formData = new FormData();
    formData.append("title", title.trim() || "Artikel Baru");

    // Slug dikirim cuma kalau diisi — kosongkan berarti "biarkan slug lama",
    // sesuai perilaku updateArticleSchema (field opsional).
    const normalizedSlug = slug.trim() ? slugify(slug) : "";
    if (normalizedSlug) formData.append("slug", normalizedSlug);

    // 🔥 FIX: sama kayak categoryId — cuma kirim "excerpt" kalau memang
    // diisi. String kosong "" bikin middleware validate di backend
    // nge-convert jadi angka 0 (Number("") === 0, bukan NaN), bikin Zod
    // nolak "expected string, received number". excerpt optional di
    // schema, jadi aman kalau nggak dikirim sama sekali.
    const trimmedExcerpt = excerpt.trim().slice(0, 150);
    if (trimmedExcerpt) formData.append("excerpt", trimmedExcerpt);

    // 🔥 FIX: cuma kirim "categoryId" kalau memang diisi — sama alasannya
    // kayak slug: string kosong "" ke-convert jadi angka 0 oleh middleware
    // validate di backend (Number("") === 0, bukan NaN), bikin Zod nolak
    // dengan "expected string, received number". categoryId optional di
    // schema, jadi cuma di-append kalau ada isinya.
    if (categoryId) formData.append("categoryId", categoryId);
    formData.append("isRecommended", String(isRecommended));
    if (statusOverride) formData.append("status", statusOverride);
    if (coverFile) formData.append("coverImage", coverFile);
    return formData;
  };

  const applyServerResponse = (data: ArticleDetail) => {
    setArticle(data);
    setSlug(data.slug ?? "");
    setExcerpt(data.excerpt ?? "");
    setCoverFile(null);
    setCoverPreview(buildCoverUrl(data.coverImage));
    setSettingsDirty(false);
  };

  // ── Unsaved-changes guard ────────────────────────────────────────────────
  // Nyegat 3 cara user bisa "kabur" dari halaman ini pas masih ada
  // perubahan belum tersimpan (settingsDirty || contentDirty):
  //   1) tombol back DI HALAMAN INI (ArrowLeft di top bar & tombol back di
  //      mode Preview) → lewat attemptLeave() di bawah.
  //   2) tombol back BAWAAN BROWSER → lewat listener "popstate".
  //   3) refresh / close tab / navigasi keluar dari app sepenuhnya →
  //      lewat listener "beforeunload" (browser yang nampilin dialog-nya
  //      sendiri, kita cuma trigger).
  // Ketiganya berujung ke modal konfirmasi yang sama (showLeaveConfirm),
  // "cara beneran keluar"-nya disimpan di pendingLeaveActionRef supaya
  // tiap pemicu bisa punya navigasi tujuan yang beda-beda.
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const pendingLeaveActionRef = useRef<() => void>(() => {});

  const attemptLeave = useCallback(
    (leave: () => void) => {
      if (settingsDirty || contentDirty) {
        pendingLeaveActionRef.current = leave;
        setShowLeaveConfirm(true);
      } else {
        leave();
      }
    },
    [settingsDirty, contentDirty],
  );

  // (3) Refresh / close tab / navigasi penuh keluar app.
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (settingsDirty || contentDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [settingsDirty, contentDirty]);

  // (2) Tombol back BAWAAN BROWSER. Next.js App Router belum punya hook
  // resmi buat nyegat ini (beda sama `beforePopState` di Pages Router
  // lama).
  //
  // 🔥 FIX: pendekatan LAMA cuma REAKTIF — nunggu event "popstate" dulu,
  // baru push balik URL-nya. Masalahnya, App Router kadang udah keburu
  // mulai proses navigasi/transisi ke halaman sebelumnya SEBELUM listener
  // kita ini sempat jalan (urutan listener "popstate" nggak kejamin kita
  // duluan), jadi kelihatannya kayak "langsung kepindah" — sama persis
  // yang dilaporkan.
  //
  // Sekarang jadi PROAKTIF: begitu status berubah jadi "ada perubahan
  // belum disimpan" (dirty), kita LANGSUNG push satu history entry
  // duplikat (URL sama persis) SEBELUM user sempat pencet apa-apa. Jadi
  // begitu tombol back browser ditekan pertama kali, yang "dimakan"
  // duluan adalah entry duplikat itu (URL-nya SAMA, jadi Next.js nggak
  // perlu fetch/transisi apa pun ke halaman lain) — baru setelah itu
  // "popstate" kita tangkap dengan aman, tanpa ada race sama sekali.
  useEffect(() => {
    if (settingsDirty || contentDirty) {
      window.history.pushState(null, "", window.location.href);
    }
  }, [settingsDirty, contentDirty]);

  useEffect(() => {
    const handlePopState = () => {
      if (!(settingsDirty || contentDirty)) return;
      // Jaga-jaga terus: setiap kali back ditekan lagi selama masih
      // dirty, langsung push ulang duplikatnya (efeknya, back cuma akan
      // BENERAN keluar setelah user confirm lewat modal).
      window.history.pushState(null, "", window.location.href);
      // 🔥 FIX: dulu pakai `router.back()` di sini — riskan meleset kalau
      // user sempat mencet back berkali-kali sebelum confirm (jumlah
      // history yang perlu "dilewatin" jadi nggak pasti). Sekarang
      // disamain aja sama tombol back manual di halaman ini: push
      // eksplisit ke rute yang sama (predictable, nggak bergantung sama
      // hitungan depth history sama sekali).
      pendingLeaveActionRef.current = () => router.push("/admin/artikel");
      setShowLeaveConfirm(true);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [settingsDirty, contentDirty, router]);

  const handleDiscardAndLeave = () => {
    setShowLeaveConfirm(false);
    pendingLeaveActionRef.current();
  };

  const handleSaveAndLeave = async () => {
    const ok = await handleSave();
    if (ok) {
      setShowLeaveConfirm(false);
      pendingLeaveActionRef.current();
    }
    // gagal: modal tetap kebuka, toast error dari handleSave sudah muncul
  };

  // 🔥 DIUBAH: tombol Save sekarang nyimpen DUA hal sekaligus kalau
  // dua-duanya berubah — (1) Article Settings (title/thumbnail/dst) lewat
  // PATCH /article/articles/:id seperti sebelumnya, DAN (2) konten canvas
  // (heading/paragraph/table/dst) lewat PUT
  // /articlecontent/articles/:id/content (full-replace) kalau
  // `contentDirty`. Masing-masing cuma ditembak kalau memang ada
  // perubahan di bagiannya — supaya Save yang cuma ganti title nggak
  // ikut nge-replace seluruh konten tanpa perlu, dan sebaliknya.
  // 🔥 DIUBAH: sekarang me-return boolean (true = sukses) — dipakai
  // UnsavedChangesModal buat tau apakah boleh lanjut navigasi keluar
  // setelah "Simpan & Keluar" diklik (kalau gagal, modal tetap kebuka +
  // toast error dari catch block di bawah sudah muncul, jangan lanjut).
  const handleSave = async (): Promise<boolean> => {
    if (!article) return false;
    if (!validateBeforeSubmit(false)) return false;

    // Validasi konten dulu SEBELUM nembak request apa pun ke server —
    // biar user dapat pesan error yang jelas & spesifik (bukan raw 400
    // dari backend) kalau ada teks wajib yang kosong atau target
    // Link/Table of Content yang belum dipilih.
    if (contentDirty) {
      const contentError = validateArticleContentBeforeSave(canvasItems);
      if (contentError) {
        toast.error(contentError);
        return false;
      }
    }

    setSaving(true);
    try {
      if (settingsDirty) {
        const res = await axios.patch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/articles/${article.id}`,
          buildFormData(),
          { withCredentials: true },
        );
        applyServerResponse(res.data.data);
      }

      if (contentDirty) {
        // 🔥 BARU: catat dulu POSISI (index) kartu yang lagi difokus
        // SEBELUM di-replace — instanceId-nya bakal berubah semua abis
        // fetchArticleContent, jadi yang bisa diandalkan buat "nyambungin
        // lagi" fokus ke kartu yang sama cuma posisinya, bukan id-nya.
        const focusedIdxBeforeSave = canvasItems.findIndex(
          (i) => i.instanceId === selectedInstanceId,
        );

        await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/articlecontent/articles/${article.id}/content`,
          buildArticleContentFormData(canvasItems),
          { withCredentials: true },
        );
        // Full-replace di server bikin semua ID content/media berganti —
        // re-fetch & re-hydrate canvas biar instanceId (yang dipakai lagi
        // sebagai `key` di save berikutnya) selalu sinkron sama yang
        // BENERAN tersimpan, dan URL blob: gambar/video baru otomatis
        // ke-ganti jadi URL asli dari server. Ini juga yang me-reset
        // contentDirty jadi false (lewat savedCanvasItemsRef).
        const refreshed = await fetchArticleContent();

        // 🔥 BARU: begitu canvas selesai di-refresh, balikin fokus ke
        // kartu yang sama posisinya kayak sebelum Save (kalau memang ada
        // yang lagi difokus). Kalau nggak ada yang difokus sama sekali,
        // lempar fokus ke kartu PALING BAWAH. Ini yang bikin Save nggak
        // lagi "blink" balik ke atas halaman.
        if (refreshed && refreshed.length > 0) {
          const targetItem =
            focusedIdxBeforeSave >= 0
              ? (refreshed[focusedIdxBeforeSave] ??
                refreshed[refreshed.length - 1])
              : refreshed[refreshed.length - 1];
          setSelectedInstanceId(targetItem.instanceId);
          pendingFocusInstanceIdRef.current = targetItem.instanceId;
        }
      }

      toast.success("Perubahan berhasil disimpan");
      return true;
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || err.message || "Gagal menyimpan artikel",
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  // 🔥 DIUBAH: dulu tombol ini cuma satu arah (DRAFT -> PUBLISHED, disabled
  // kalau sudah published). Sekarang jadi toggle dua arah — klik "Publish"
  // saat DRAFT akan set PUBLISHED (label lalu berubah jadi "Draft"), dan
  // klik "Draft" saat PUBLISHED akan set balik ke DRAFT (label balik jadi
  // "Publish"). Kategori cuma divalidasi wajib pas mau PUBLISH, bukan pas
  // mau balik ke draft.
  const handlePublishToggle = async () => {
    if (!article) return;
    const nextStatus: "DRAFT" | "PUBLISHED" = isPublished
      ? "DRAFT"
      : "PUBLISHED";
    if (!validateBeforeSubmit(nextStatus === "PUBLISHED")) return;

    setPublishing(true);
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/articles/${article.id}`,
        buildFormData(nextStatus),
        { withCredentials: true },
      );
      toast.success(
        nextStatus === "PUBLISHED"
          ? "Artikel berhasil dipublikasikan"
          : "Artikel dikembalikan ke draft",
      );
      applyServerResponse(res.data.data);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Gagal mengubah status artikel",
      );
    } finally {
      setPublishing(false);
    }
  };

  // 🔥 DIUBAH: dulu cuma placeholder toast — sekarang beneran ganti
  // tampilan halaman ini ke mode preview (lihat ArticlePreview.tsx),
  // menampilkan canvasItems yang lagi ada di memory apa adanya (termasuk
  // yang belum di-Save), tanpa nge-fetch ulang apa pun dari server.
  const handlePreview = () => setPreviewMode(true);

  const handleCoverFile = (file: File | null) => {
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const cancelCoverFile = () => {
    setCoverFile(null);
    setCoverPreview(buildCoverUrl(article?.coverImage ?? null));
  };

  // ─── Canvas item handlers ───────────────────────────────────────────────
  // index opsional: dipakai waktu elemen di-drop TEPAT di atas/dekat kartu
  // tertentu di canvas (drag & drop dari sidebar), supaya elemen barunya
  // nyempil di posisi itu — bukan selalu nambah di paling bawah. Kalau
  // index nggak dikasih (klik biasa dari sidebar), elemen baru ditaruh di
  // akhir daftar seperti sebelumnya.
  const handleAddElement = (el: ArticleContentElement, index?: number) => {
    const newItem: ArticleCanvasItem = {
      ...el,
      instanceId: generateInstanceId(el.id),
      data: createDefaultArticleItemData(el.id),
    };
    setCanvasItems((prev) => {
      const next = [...prev];
      const insertAt = index ?? next.length;
      next.splice(insertAt, 0, newItem);
      return next;
    });
    setSelectedInstanceId(newItem.instanceId);
  };

  // 🔥 BARU: baca elemen apa yang sedang di-drag dari sidebar (Content
  // Elements) lewat dataTransfer. Return null kalau drag yang sedang
  // berlangsung BUKAN drag elemen dari sidebar — misalnya drag reorder
  // antar kartu yang sudah ada di canvas (itu pakai state dragCanvasId
  // biasa, bukan dataTransfer), supaya dua mekanisme drag ini nggak
  // saling tabrak.
  const getDraggedSidebarElement = (
    e: React.DragEvent,
  ): ArticleContentElement | null => {
    const id = e.dataTransfer.getData(ARTICLE_ELEMENT_DRAG_MIME);
    if (!id) return null;
    return ARTICLE_ELEMENTS.find((x) => x.id === id) ?? null;
  };

  const handleRemoveItem = (instanceId: string) => {
    setCanvasItems((prev) => prev.filter((i) => i.instanceId !== instanceId));
    setSelectedInstanceId((prev) => (prev === instanceId ? null : prev));
  };

  const cloneItem = (item: ArticleCanvasItem): ArticleCanvasItem => ({
    ...item,
    instanceId: generateInstanceId(item.id),
    data: item.data ? { ...item.data } : undefined,
  });

  const handleDuplicateItem = (instanceId: string) => {
    setCanvasItems((prev) => {
      const idx = prev.findIndex((i) => i.instanceId === instanceId);
      if (idx === -1) return prev;
      const copy = cloneItem(prev[idx]);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  // Dipakai ArticleStylePanel saat duplikasi satu Group beserta isinya —
  // mengembalikan instanceId baru supaya group hasil copy bisa langsung
  // "mengadopsi" item-item barunya.
  const handleDuplicateItems = (instanceIds: string[]): string[] => {
    const newIds: string[] = [];
    setCanvasItems((prev) => {
      const next = [...prev];
      instanceIds.forEach((id) => {
        const idx = next.findIndex((i) => i.instanceId === id);
        if (idx === -1) return;
        const copy = cloneItem(next[idx]);
        newIds.push(copy.instanceId);
        next.splice(idx + 1, 0, copy);
      });
      return next;
    });
    return newIds;
  };

  const handleMoveItem = (instanceId: string, direction: "up" | "down") => {
    setCanvasItems((prev) => {
      const idx = prev.findIndex((i) => i.instanceId === instanceId);
      if (idx === -1) return prev;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next;
    });
  };

  const handleReorderCanvas = (targetInstanceId: string) => {
    if (!dragCanvasId || dragCanvasId === targetInstanceId) {
      setDragCanvasId(null);
      setDragOverCanvasId(null);
      return;
    }
    setCanvasItems((prev) => {
      const fromIdx = prev.findIndex((i) => i.instanceId === dragCanvasId);
      const toIdx = prev.findIndex((i) => i.instanceId === targetInstanceId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    setDragCanvasId(null);
    setDragOverCanvasId(null);
  };

  const handleChangeItemData = (
    instanceId: string,
    data: Partial<ArticleCanvasItemData>,
  ) => {
    setCanvasItems((prev) =>
      prev.map((i) =>
        i.instanceId === instanceId
          ? { ...i, data: { ...i.data, ...data } }
          : i,
      ),
    );
  };

  // ─── Style panel handlers ───────────────────────────────────────────────
  // execCommand (bold/italic/align/list/dst) selalu dijalankan ke editor
  // yang terakhir kali fokus — konsisten dengan pola di editor e-learning.
  const handleStyleChange = (cmd: string, value?: string) => {
    activeEditorRef.current?.execCommand(cmd, value);
  };

  const handleFontTypeChange = (fontType: string) => {
    if (!selectedInstanceId) return;
    const preset = FONT_PRESETS[fontType];
    handleChangeItemData(selectedInstanceId, {
      fontType,
      fontSize: preset?.fontSize,
    });
  };

  const handleFontSizeChange = (fontSize: number) => {
    if (!selectedInstanceId) return;
    handleChangeItemData(selectedInstanceId, { fontSize });
  };

  const handleEditorReady = (ref: ArticleRichTextEditorRef | null) => {
    activeEditorRef.current = ref;
  };

  const handleSelectionChange = (state: ArticleSelectionState) => {
    setSelectionStyle((prev) => ({ ...prev, ...state }));
  };

  if (loading) {
    return (
      <div
        className={`${jakartaSans.className} flex h-screen items-center justify-center bg-gray-50`}
      >
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!article) return null;

  const roleLabel = getAuthorRoleLabel(article.author?.roles);
  const isPublished = article.status === "PUBLISHED";
  // 🔥 BARU: tombol Save & badge "Belum disimpan" sekarang merefleksikan
  // DUA sumber perubahan — Article Settings (title/thumbnail/dst) DAN
  // konten canvas (heading/paragraph/table/dst), bukan cuma yang pertama.
  const dirty = settingsDirty || contentDirty;

  // ─── Derived values buat canvas & style panel ──────────────────────────
  const itemCounters = buildItemCounters(canvasItems);
  const selectedCanvasItem =
    canvasItems.find((i) => i.instanceId === selectedInstanceId) ?? null;
  // 🔥 DIUBAH: dulu cuma HEADING yang bisa jadi target "Article Section"
  // (dipakai LinkBody & TableOfContentBody). Sekarang SEMUA jenis elemen
  // bisa jadi target — kecuali TABLE_OF_CONTENT sendiri, karena TOC cuma
  // metadata navigasi, bukan "section" konten yang bisa dituju. Label-nya
  // juga SENGAJA bukan isi teks yang diketik user lagi, tapi nama elemen +
  // urutan-ke berapa di antara elemen bertipe sama (persis pola yang
  // dipakai `itemCounters` di atas), misal "Paragraph 2", "Image 1" — jadi
  // labelnya tetap stabil & jelas walau isi kontennya kosong/berubah-ubah.
  // (Prop-nya masih dinamai `headings` biar diff ke ArticleCanvasCard.tsx
  // minimal — isinya sekarang bukan cuma Heading lagi.)
  const headings = canvasItems
    .filter((i) => i.id !== "TABLE_OF_CONTENT")
    .map((i) => ({
      instanceId: i.instanceId,
      text: `${i.label} ${itemCounters[i.instanceId]}`,
    }));

  // 🔥 TAMBAHAN: khusus buat dropdown "Section" di Table of Content —
  // beda dari `headings` di atas, ini CUMA elemen HEADING, dan teksnya
  // teks ASLI yang diketik user di heading tsb (bukan label generic "Heading
  // 1"), karena Item Name TOC sekarang di-generate otomatis dari sini.
  // Fallback ke label generic kalau headingnya masih kosong, biar dropdown
  // tetap ada tulisannya (bukan blank).
  const headingOptions = canvasItems
    .filter((i) => i.id === "HEADING")
    .map((i) => ({
      instanceId: i.instanceId,
      text:
        htmlToPlainText(i.data?.html) ||
        `${i.label} ${itemCounters[i.instanceId]}`,
    }));

  const panelStyleState: ArticleStyleState = {
    ...selectionStyle,
    fontType:
      selectedCanvasItem?.data?.fontType ?? DEFAULT_STYLE_STATE.fontType,
    fontSize:
      selectedCanvasItem?.data?.fontSize ?? DEFAULT_STYLE_STATE.fontSize,
  };

  // 🔥 BARU: modal konfirmasi "unsaved changes" — didefinisikan SEKALI di
  // sini (bukan langsung ditulis di dalam masing-masing return) karena
  // dipakai di DUA tempat: mode Preview (early return di bawah) dan mode
  // edit normal (return utama paling bawah). Kalau cuma ditaruh di salah
  // satu, modal ini nggak akan pernah kebuka pas trigger-nya datang dari
  // return yang lain (misalnya browser-back dipencet pas lagi di mode
  // Preview).
  const leaveConfirmModal = showLeaveConfirm && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
        {/* Icon badge — amber, senada sama badge "Belum disimpan" di top
            bar, jadi langsung nyambung secara visual kalau user udah
            lihat badge itu sebelumnya. */}
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
          <AlertTriangle size={20} className="text-amber-600" />
        </div>

        <h3 className="mt-4 text-base font-semibold text-gray-900">
          Perubahan belum disimpan
        </h3>
        <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
          Kamu punya perubahan yang belum disimpan. Simpan dulu sebelum keluar,
          atau buang perubahannya?
        </p>

        {/* Tombol disusun VERTIKAL (bukan sebaris) supaya hierarki
            aksinya jelas: primary paling atas & paling menonjol,
            destructive di tengah, batal paling bawah & paling
            "tenang" — pola umum dialog konfirmasi modern. */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={handleSaveAndLeave}
            disabled={saving}
            className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-500/30 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan & Keluar"}
          </button>
          <button
            onClick={handleDiscardAndLeave}
            disabled={saving}
            className="w-full rounded-xl border border-red-200 bg-red-50/50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Buang Perubahan
          </button>
          <button
            onClick={() => setShowLeaveConfirm(false)}
            disabled={saving}
            className="w-full rounded-xl px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );

  // 🔥 BARU: mode preview gantiin SELURUH tampilan halaman ini (bukan
  // ditumpuk di atasnya) — URL tetap sama, cuma yang dirender yang beda.
  // Sengaja pakai state yang lagi di-edit (title/excerpt/categoryId/
  // isRecommended/coverPreview/canvasItems), BUKAN `article` hasil fetch
  // terakhir, supaya perubahan yang belum di-Save ikut kelihatan di preview.
  if (previewMode) {
    const categoryName =
      categoryOptions.find((c) => c.id === categoryId)?.name ?? null;
    return (
      <>
        <ArticlePreview
          title={title}
          excerpt={excerpt}
          coverImage={coverPreview}
          categoryName={categoryName}
          isRecommended={isRecommended}
          isPublished={isPublished}
          publishing={publishing}
          canvasItems={canvasItems}
          headings={headings}
          heroPatternSeed={articleId}
          onBack={() => attemptLeave(() => router.push("/admin/artikel"))}
          onEdit={() => setPreviewMode(false)}
          onPublishToggle={handlePublishToggle}
        />
        {leaveConfirmModal}
      </>
    );
  }

  return (
    <div
      className={`${jakartaSans.className} flex h-screen flex-col bg-gray-50 overflow-x-hidden`}
    >
      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b bg-white px-5 py-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => attemptLeave(() => router.push("/admin/artikel"))}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 shrink-0"
          >
            <ArrowLeft size={18} />
          </button>

          {titleEditing ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTitleEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setTitleEditing(false)}
              className="text-sm font-medium text-gray-800 border-b border-emerald-400 focus:outline-none px-1 py-0.5 max-w-md"
            />
          ) : (
            <button
              onClick={() => setTitleEditing(true)}
              className="flex items-center gap-2 min-w-0 group"
            >
              <span className="text-sm font-medium text-gray-800 truncate max-w-md">
                {title || "Tanpa judul"}
              </span>
              <Pencil
                size={13}
                className="text-gray-400 group-hover:text-gray-600 shrink-0"
              />
            </button>
          )}

          {/* Undo/redo — history canvasItems di session ini (lihat state
              `history`/`historyIdx` di atas), reset tiap initial load &
              setelah Save. */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo"
              className={`p-1.5 rounded-md ${
                canUndo
                  ? "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo"
              className={`p-1.5 rounded-md ${
                canRedo
                  ? "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <Redo2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
              dirty
                ? "border-amber-300 text-amber-600 bg-amber-50"
                : "border-emerald-300 text-emerald-600 bg-emerald-50"
            }`}
          >
            {dirty ? "Belum disimpan" : "Tersimpan"}
          </span>

          <button
            onClick={handlePreview}
            className="border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="border border-emerald-500 text-emerald-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Menyimpan..." : "Save"}
          </button>
          <button
            onClick={handlePublishToggle}
            disabled={publishing}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {publishing
              ? isPublished
                ? "Mengembalikan ke draft..."
                : "Mempublikasikan..."
              : isPublished
                ? "Draft"
                : "Publish"}
          </button>
        </div>
      </div>

      {/* ── BODY: 3 kolom ───────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT: Content Elements — sidebar terpisah, lihat
            ArticleContentElementsSidebar.tsx. Klik ATAU drag & drop kartu
            elemen ke canvas sama-sama menambahkan elemen baru. */}
        <ArticleContentElementsSidebar
          onAddElement={handleAddElement}
          isOpen={leftPanelOpen}
          onOpenChange={setLeftPanelOpen}
        />

        {/* CENTER: Canvas */}
        <div
          onClick={() => setSelectedInstanceId(null)}
          onDragOver={(e) => {
            // Wajib preventDefault di dragover, kalau nggak browser nolak
            // event drop-nya sama sekali (perilaku default HTML5 DnD).
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            // Drop di area kosong canvas (bukan tepat di atas kartu
            // tertentu) → elemen baru ditambahkan di akhir daftar.
            const draggedEl = getDraggedSidebarElement(e);
            if (draggedEl) handleAddElement(draggedEl);
          }}
          className="flex-1 overflow-y-auto p-8 pb-40"
        >
          {canvasItems.length === 0 ? (
            <div className="h-full flex items-center justify-center px-6">
              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOverEmptyCanvas(true);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={() => setDragOverEmptyCanvas(false)}
                onDrop={() => setDragOverEmptyCanvas(false)}
                className={`relative w-full max-w-sm text-center rounded-2xl border-2 border-dashed px-8 py-14 transition-colors duration-200 ${
                  dragOverEmptyCanvas
                    ? "border-emerald-400 bg-emerald-50/70"
                    : "border-gray-200 bg-white/70 hover:border-gray-300 hover:bg-gray-50/70"
                }`}
              >
                {/* 🔥 BARU: cluster ikon berlapis (bukan cuma 1 ikon polos)
                    biar langsung kebayang jenis-jenis elemen yang bisa
                    ditambahkan — heading di tengah sebagai "anchor", ditemani
                    3 ikon kecil melayang (paragraph/image/table) dengan
                    sedikit rotasi & shadow biar kesannya hidup, bukan datar. */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div
                    className={`absolute inset-0 rounded-3xl flex items-center justify-center transition-colors duration-200 ${
                      dragOverEmptyCanvas
                        ? "bg-gradient-to-br from-emerald-100 to-emerald-200"
                        : "bg-gradient-to-br from-emerald-50 to-emerald-100"
                    }`}
                  >
                    <Heading1
                      size={30}
                      strokeWidth={2.25}
                      className="text-emerald-500"
                    />
                  </div>
                  <div className="absolute -top-2 -right-3 w-9 h-9 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center rotate-6">
                    <ImageIcon size={14} className="text-gray-400" />
                  </div>
                  <div className="absolute -bottom-2 -left-3 w-9 h-9 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center -rotate-6">
                    <AlignLeft size={14} className="text-gray-400" />
                  </div>
                  <div className="absolute -bottom-3 right-0 w-8 h-8 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center rotate-12">
                    <Table2 size={12} className="text-gray-400" />
                  </div>
                  <Sparkles
                    size={14}
                    className="absolute top-0 left-0 text-emerald-300"
                  />
                </div>

                <p className="text-[15px] font-bold text-gray-800 mb-1.5">
                  {dragOverEmptyCanvas
                    ? "Lepaskan di sini untuk menambahkan"
                    : "Start building your article"}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed max-w-[230px] mx-auto">
                  Drag and drop elements from the left sidebar, or click one to
                  add it here.
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`${canvasMaxWidthClass} mx-auto space-y-5 transition-[max-width] duration-200 ease-in-out`}
            >
              {canvasItems.map((item, idx) => (
                <div
                  key={item.instanceId}
                  ref={(node) => {
                    canvasItemNodeRefs.current[item.instanceId] = node;
                  }}
                >
                  <ArticleCanvasCard
                    el={item}
                    order={idx + 1}
                    total={canvasItems.length}
                    typeIndex={itemCounters[item.instanceId]}
                    isSelected={selectedInstanceId === item.instanceId}
                    isDragOver={dragOverCanvasId === item.instanceId}
                    headings={headings}
                    headingOptions={headingOptions}
                    onSelect={() => setSelectedInstanceId(item.instanceId)}
                    onRemove={() => handleRemoveItem(item.instanceId)}
                    onMoveUp={() => handleMoveItem(item.instanceId, "up")}
                    onMoveDown={() => handleMoveItem(item.instanceId, "down")}
                    onDuplicate={() => handleDuplicateItem(item.instanceId)}
                    onDragStart={() => setDragCanvasId(item.instanceId)}
                    onDragOver={() => setDragOverCanvasId(item.instanceId)}
                    onDrop={(e) => {
                      // Dua kemungkinan sumber drag: (1) elemen baru dari
                      // sidebar Content Elements (dibawa lewat dataTransfer
                      // dengan MIME kustom ARTICLE_ELEMENT_DRAG_MIME) → nyempil
                      // TEPAT di posisi kartu ini (index = idx). (2) reorder
                      // kartu yang sudah ada di canvas (dibawa lewat state
                      // dragCanvasId biasa, tanpa dataTransfer) → pakai alur
                      // reorder yang sudah ada sebelumnya.
                      const draggedEl = getDraggedSidebarElement(e);
                      if (draggedEl) {
                        handleAddElement(draggedEl, idx);
                      } else {
                        handleReorderCanvas(item.instanceId);
                      }
                    }}
                    onChangeData={(data) =>
                      handleChangeItemData(item.instanceId, data)
                    }
                    onEditorReady={
                      RICH_TEXT_ELEMENT_IDS.has(item.id)
                        ? handleEditorReady
                        : undefined
                    }
                    onEditorFocus={() => setSelectedInstanceId(item.instanceId)}
                    onSelectionChange={handleSelectionChange}
                  />
                </div>
              ))}

              {/* 🔥 BARU: drop zone di bawah kartu terakhir — dulu canvas
                  langsung "mentok" abis kartu terakhir, bikin drag & drop ke
                  bagian bawah kurang nyaman (nggak ada ruang & nggak ada
                  petunjuk visual). Sekarang selalu ada box putus-putus
                  dengan ikon + keterangan, sekaligus jadi target drop yang
                  jelas untuk menambahkan elemen baru di akhir daftar. */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverCanvasEnd(true);
                }}
                onDragLeave={() => setDragOverCanvasEnd(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverCanvasEnd(false);
                  const draggedEl = getDraggedSidebarElement(e);
                  if (draggedEl) handleAddElement(draggedEl);
                }}
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-10 transition-colors ${
                  dragOverCanvasEnd
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-200 bg-gray-50/60 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    dragOverCanvasEnd
                      ? "bg-emerald-100"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <PlusCircle
                    size={16}
                    className={
                      dragOverCanvasEnd ? "text-emerald-500" : "text-gray-400"
                    }
                  />
                </div>
                <p
                  className={`text-xs font-medium ${
                    dragOverCanvasEnd ? "text-emerald-600" : "text-gray-500"
                  }`}
                >
                  {dragOverCanvasEnd
                    ? "Lepaskan di sini untuk menambahkan"
                    : "Drag and drop elements here"}
                </p>
                <p className="text-[10px] text-gray-400">
                  to add more content to the end of your article
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Style / Structure (placeholder) + Article Settings (aktif) */}
        <div className="relative h-full shrink-0 flex">
          {/* 🔥 BARU: tombol collapse/expand — mengambang setengah nempel di
              garis border kiri panel ini, arah panahnya kebalikan dari
              sidebar kiri karena panel ini "terbuka ke kiri". */}
          <button
            onClick={() => setRightPanelOpen((v) => !v)}
            aria-label={rightPanelOpen ? "Minimize panel" : "Expand panel"}
            className="absolute top-1/2 -left-3 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 hover:border-emerald-300 transition-colors"
          >
            {rightPanelOpen ? (
              <ChevronRight size={12} className="text-gray-500" />
            ) : (
              <ChevronLeft size={12} className="text-gray-500" />
            )}
          </button>

          <div
            // 🔥 DIUBAH: sama kayak sidebar kiri — collapsed dulu "w-0
            // border-l-0" bikin panel ini bener2 ilang & susah dibuka
            // lagi. Sekarang collapsed jadi rail kecil "w-9" (36px) yang
            // tetap kelihatan, border-nya juga selalu ada (nggak
            // di-toggle) biar rail-nya jelas batasnya.
            className={`border-l bg-white overflow-hidden h-full transition-all duration-200 ease-in-out ${
              rightPanelOpen ? "w-80" : "w-9"
            }`}
          >
            {/* 🔥 DIUBAH: konten panel cuma dirender pas rightPanelOpen —
                pas collapsed nggak render div w-80 sama sekali, biar nggak
                ada elemen lebar-tetap yang bisa nyebabin scroll horizontal
                pas transisi. */}
            {rightPanelOpen ? (
              <div className="w-80 h-full overflow-y-auto">
                {/* Style & Structure — terhubung ke canvas di tengah */}
                <ArticleStylePanel
                  items={canvasItems}
                  itemCounters={itemCounters}
                  selectedInstanceId={selectedInstanceId}
                  onSelectItem={setSelectedInstanceId}
                  styleState={panelStyleState}
                  onStyleChange={handleStyleChange}
                  onFontTypeChange={handleFontTypeChange}
                  onFontSizeChange={handleFontSizeChange}
                  onDuplicateItem={handleDuplicateItem}
                  onRemoveItem={handleRemoveItem}
                  onDuplicateItems={handleDuplicateItems}
                />

                {/* Article Settings — terhubung ke endpoint article yang sudah ada */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Article Settings
                  </h3>
                  <p className="text-[11px] text-gray-400 mb-4">
                    Set article details and recommendations
                  </p>

                  <div className="space-y-4">
                    {/* Author — read-only. Backend updateArticle belum menerima
                  authorId, jadi reassign penulis belum didukung; kalau
                  butuh ini, perlu endpoint tambahan buat list user
                  admin/cm/curdev + field authorId di updateArticle. */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Author
                      </label>
                      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                        <span className="text-sm text-gray-700 truncate">
                          {article.author?.fullName ?? "-"}
                        </span>
                        {roleLabel && (
                          <span className="text-[10px] text-gray-400 shrink-0">
                            ({roleLabel})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-gray-600">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setCategoryModalOpen(true)}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          Kelola Kategori
                        </button>
                      </div>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      >
                        <option value="">Select category</option>
                        {categoryOptions.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Slug */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="contoh-slug-artikel"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                      <p className="mt-1 text-[10px] text-gray-400">
                        Dipakai di URL publik artikel. Otomatis dirapikan (huruf
                        kecil, tanda strip) saat disimpan.
                      </p>
                    </div>

                    {/* Sub-title */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-gray-600">
                          Sub-title
                        </label>
                        <span
                          className={`text-[10px] ${
                            excerpt.length >= 150
                              ? "text-red-500"
                              : "text-gray-400"
                          }`}
                        >
                          {excerpt.length}/150
                        </span>
                      </div>
                      <input
                        type="text"
                        value={excerpt}
                        onChange={(e) =>
                          setExcerpt(e.target.value.slice(0, 150))
                        }
                        maxLength={150}
                        placeholder="Ringkasan singkat di bawah judul artikel"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                      <p className="mt-1 text-[10px] text-gray-400">
                        Tampil di bawah judul pada halaman preview & artikel.
                      </p>
                    </div>

                    {/* Thumbnail */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Thumbnail Image
                      </label>
                      <label
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragActive(false);
                          handleCoverFile(e.dataTransfer.files?.[0] ?? null);
                        }}
                        className={`flex flex-col items-center justify-center gap-1.5 border border-dashed rounded-lg py-6 cursor-pointer transition ${
                          dragActive
                            ? "border-emerald-400 bg-emerald-50"
                            : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleCoverFile(e.target.files?.[0] ?? null)
                          }
                        />
                        <UploadCloud size={18} className="text-gray-400" />
                        <p className="text-[11px] text-gray-500 text-center px-3">
                          Upload or drag and drop files here
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Supported format: JPG, PNG, max 2MB
                        </p>
                        {/* 🔥 BARU: rasio yang dipakai buat preview & thumbnail
                      artikel adalah 16:9 (standar thumbnail kebanyakan
                      platform) — dikasih tau di sini biar admin upload
                      gambar dengan komposisi yang pas, nggak kepotong aneh. */}
                        <p className="text-[10px] text-gray-400">
                          Rasio yang direkomendasikan: 16:9 (mis. 1280×720px)
                        </p>
                      </label>

                      {coverPreview && (
                        // 🔥 DIUBAH: dulu box preview cuma h-28 (tinggi tetap,
                        // bukan rasio beneran) — sekarang pakai aspect-video
                        // (rasio 16:9 asli Tailwind) supaya preview-nya benar-benar
                        // mencerminkan crop 16:9 yang bakal dipakai sebagai
                        // thumbnail, bukan cuma persegi panjang acak.
                        <div className="mt-3 relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
                          <Image
                            src={coverPreview}
                            alt="Thumbnail preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          {/* Tombol batal cuma muncul kalau ada file baru yang
                        BELUM disimpan — bukan buat hapus cover lama yang
                        sudah tersimpan (backend belum punya jalur hapus
                        cover tanpa menggantinya dengan file baru). */}
                          {coverFile && (
                            <button
                              onClick={cancelCoverFile}
                              className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-white rounded-full p-1 text-gray-500"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Recommended */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRecommended}
                        onChange={(e) => setIsRecommended(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-400"
                      />
                      <span className="text-sm text-gray-700">
                        Set as Recommended Article
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              // 🔥 BARU: tampilan rail pas collapsed — ikon kecil biar rail-nya
              // nggak keliatan kosong melompong.
              <div className="w-9 h-full flex flex-col items-center pt-4">
                <SlidersHorizontal size={16} className="text-gray-300" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal "Manage Article Categories" — dipicu link "Kelola Kategori"
      di sebelah label Category di atas. */}
      <ArtikelCategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={categoryOptions}
        onChanged={fetchCategories}
      />

      {leaveConfirmModal}
    </div>
  );
}
