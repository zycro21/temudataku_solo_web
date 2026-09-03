"use client";

import { useState, useRef, useEffect } from "react";
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Pencil,
  UploadCloud,
  X,
  Plus,
  Heading,
  AlignLeft,
  Image as ImageIcon,
  Video as VideoIcon,
  MessageSquare,
  Table2,
  Minus,
  Link2,
  List,
} from "lucide-react";
import {
  normalizeEditorHTML,
  richTextDisplayClass,
} from "@/lib/editorHTMLUtils";
import ArticleRichTextEditor, {
  type ArticleRichTextEditorRef,
  type ArticleSelectionState,
} from "./ArticleRichTextEditor";
import { getFontStyle } from "./articleFontStyles";
import type {
  ArticleContentElement,
  ArticleElementId,
} from "./ArticleContentElementsSidebar";

// ─── Types ────────────────────────────────────────────────────────────────────
// 🔥 BARU: satu item pada Table of Content — nama custom yang diketik
// user, opsional ditautkan ke salah satu instance Heading yang ada di
// canvas (sectionId = instanceId heading tsb).
export interface ArticleTocItem {
  id: string;
  name: string;
  sectionId?: string;
}

export interface ArticleCanvasItemData {
  // Heading / Paragraph / Highlight
  fontType?: string;
  fontSize?: number;
  html?: string;
  // Image
  src?: string;
  _file?: File;
  width?: number; // percent
  // Video
  videoUrl?: string;
  // Table
  rows?: string[][];
  // Link
  linkText?: string;
  // 🔥 BARU: Link sekarang bisa menuju URL eksternal ATAU section/heading
  // di dalam artikel yang sama (mirror pola "Article Section" di desain).
  linkType?: "external" | "section";
  linkUrl?: string;
  linkSectionId?: string;
  // Divider
  dividerStyle?: "solid" | "dashed";
  // 🔥 BARU: Table of Content sekarang berupa daftar item yang diinput
  // manual (nama + section rujukan), bukan lagi auto-generate dari semua
  // Heading yang ada.
  tocItems?: ArticleTocItem[];
}

export type ArticleCanvasItem = ArticleContentElement & {
  instanceId: string;
  data?: ArticleCanvasItemData;
};

// 🔥 BARU: id unik buat tiap item Table of Content (dipakai sebagai key
// React & referensi saat update/hapus item tertentu).
let tocItemCounter = 0;
function generateTocItemId() {
  tocItemCounter += 1;
  return `toc-item-${Date.now()}-${tocItemCounter}`;
}

// ─── Default data tiap elemen baru ditambahkan dari sidebar ──────────────────
export function createDefaultArticleItemData(
  id: ArticleElementId,
): ArticleCanvasItemData {
  switch (id) {
    case "HEADING":
      return { fontType: "Heading 1", fontSize: 32, html: "" };
    case "PARAGRAPH":
      return { fontType: "Paragraph", fontSize: 16, html: "" };
    case "HIGHLIGHT":
      return { fontType: "Paragraph", fontSize: 16, html: "" };
    case "IMAGE":
      return { width: 100 };
    case "VIDEO":
      return { videoUrl: "" };
    case "TABLE":
      return {
        rows: [
          ["", ""],
          ["", ""],
        ],
      };
    case "LINK":
      return {
        linkText: "",
        linkType: "external",
        linkUrl: "",
        linkSectionId: "",
      };
    case "DIVIDER":
      return { dividerStyle: "solid" };
    case "TABLE_OF_CONTENT":
      return {
        tocItems: [{ id: generateTocItemId(), name: "", sectionId: "" }],
      };
    default:
      return {};
  }
}

// Elemen yang mendukung rich text formatting (dipakai Style Panel untuk tahu
// kapan toolbar formatting harus ditampilkan aktif vs disabled).
// 🔥 DIUBAH: "TABLE" ditambahin ke sini — sel-selnya sekarang pakai
// ArticleRichTextEditor juga (lihat TableCellInput), jadi butuh
// onEditorReady dari page.tsx supaya toolbar Style bisa nge-target sel
// tabel yang lagi fokus.
export const RICH_TEXT_ELEMENT_IDS = new Set<ArticleElementId>([
  "HEADING",
  "PARAGRAPH",
  "HIGHLIGHT",
  "TABLE",
]);

const CANVAS_ICONS: Record<ArticleElementId, React.ReactNode> = {
  HEADING: <Heading size={13} />,
  PARAGRAPH: <AlignLeft size={13} />,
  IMAGE: <ImageIcon size={13} />,
  VIDEO: <VideoIcon size={13} />,
  HIGHLIGHT: <MessageSquare size={13} />,
  TABLE: <Table2 size={13} />,
  DIVIDER: <Minus size={13} />,
  LINK: <Link2 size={13} />,
  TABLE_OF_CONTENT: <List size={13} />,
};

// Elemen yang body-nya nggak butuh padding horizontal kartu (full-bleed).
const NO_SIDE_PADDING_IDS = new Set<ArticleElementId>(["DIVIDER"]);

// ═══════════════════════════════════════════════════════════════════════════
// ── HeadingBody / ParagraphBody / HighlightBody (rich text) ────────────────
// ═══════════════════════════════════════════════════════════════════════════
interface RichBodyProps {
  value?: string;
  fontType?: string;
  fontSize?: number;
  placeholder: string;
  onChange?: (val: string) => void;
  onEditorReady?: (ref: ArticleRichTextEditorRef | null) => void;
  onFocus?: () => void;
  onSelectionChange?: (state: ArticleSelectionState) => void;
  textClassName: string;
}

function RichBody({
  value,
  fontType,
  fontSize,
  placeholder,
  onChange,
  onEditorReady,
  onFocus,
  onSelectionChange,
  textClassName,
}: RichBodyProps) {
  const [focused, setFocused] = useState(false);
  const [mode, setMode] = useState<"canvas" | "preview">("canvas");
  const textStyle = getFontStyle(fontType, fontSize);
  // 🔥 BARU: simpan API instance sendiri supaya bisa didaftar ulang jadi
  // "active editor" tiap kali difokus — bukan cuma sekali pas mount. Kalau
  // cuma di-set pas mount, klik pindah-pindah antar elemen yang sudah ada
  // nggak bakal ngarahin tombol Style (Bold/Italic/dst) ke elemen yang
  // baru difokus.
  const apiRef = useRef<ArticleRichTextEditorRef | null>(null);

  if (mode === "preview") {
    return (
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl px-3 py-2.5 bg-white group/preview">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMode("canvas");
          }}
          className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 text-[11px]"
        >
          <Pencil size={11} /> Edit
        </button>
        <div
          className={`${textClassName} ${richTextDisplayClass}`}
          style={textStyle}
          dangerouslySetInnerHTML={{
            __html: normalizeEditorHTML(value) || "<em>—</em>",
          }}
        />
      </div>
    );
  }

  return (
    <div
      // 🔥 BARU: `cursor-text` di container-nya — biar area padding di
      // sekitar teks (bagian yang keliatannya "kosong") juga langsung
      // nunjukin cursor I-beam pas di-hover, bukan cursor panah biasa,
      // jadi jelas kalau area itu bisa langsung diklik buat ngetik.
      className={`relative rounded-lg border-2 border-dashed px-3 py-2.5 cursor-text ${
        focused ? "border-emerald-400" : "border-gray-200"
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMode("preview");
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 text-[11px]"
      >
        <Eye size={11} /> Preview
      </button>

      <ArticleRichTextEditor
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className={textClassName}
        style={textStyle}
        onMount={(ref) => {
          apiRef.current = ref;
          onEditorReady?.(ref);
          // 🔥 DIUBAH: auto-focus pas editor baru mount, mirror perilaku
          // e-learning — elemen yang baru ditambahkan dari sidebar langsung
          // siap diketik tanpa perlu klik dulu.
          setTimeout(() => {
            ref.focus();
            onFocus?.();
          }, 0);
        }}
        onUnmount={() => {
          apiRef.current = null;
          onEditorReady?.(null);
        }}
        onFocus={() => {
          setFocused(true);
          // 🔥 BARU: daftar ulang sebagai active editor tiap kali fokus.
          if (apiRef.current) onEditorReady?.(apiRef.current);
          onFocus?.();
        }}
        onBlur={() => setFocused(false)}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
}

// 🔥 DIUBAH: HighlightBody sekarang berdiri sendiri (bukan lagi cuma
// pembungkus RichBody + tanda kutip dekoratif) — dibuat identik dengan
// desain HighlightBody di e-learning: box dashed border-gray-300, mode
// preview pakai background abu-abu (bg-gray-100), dan tombol Edit/Preview
// dengan style yang sama persis (shadow-sm, hover emerald).
function HighlightBody({
  value,
  fontType,
  fontSize,
  placeholder,
  onChange,
  onEditorReady,
  onFocus,
  onSelectionChange,
}: Omit<RichBodyProps, "textClassName">) {
  const [focused, setFocused] = useState(false);
  const [mode, setMode] = useState<"canvas" | "preview">("canvas");
  const textStyle = getFontStyle(fontType, fontSize);
  const apiRef = useRef<ArticleRichTextEditorRef | null>(null);

  if (mode === "preview") {
    return (
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 bg-gray-100 group/preview">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMode("canvas");
          }}
          title="Edit highlight"
          className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
        >
          <Pencil size={11} /> Edit
        </button>
        <div
          className={`text-gray-600 leading-relaxed min-h-[1em] ${richTextDisplayClass}`}
          style={textStyle}
          dangerouslySetInnerHTML={{
            __html: normalizeEditorHTML(value) || "<em>—</em>",
          }}
        />
      </div>
    );
  }

  return (
    <div
      // 🔥 BARU: sama kayak RichBody — `cursor-text` biar area padding
      // di sekitar teks highlight juga langsung nunjukin cursor I-beam.
      className={`relative rounded-xl border-2 border-dashed transition-colors px-4 py-3 cursor-text ${
        focused ? "border-emerald-400" : "border-gray-300"
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMode("preview");
        }}
        title="Preview highlight"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Eye size={11} /> Preview
      </button>

      <ArticleRichTextEditor
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder || "Add important note here ..."}
        className="text-gray-700 leading-relaxed min-h-[3em]"
        style={textStyle}
        onMount={(ref) => {
          apiRef.current = ref;
          onEditorReady?.(ref);
          setTimeout(() => {
            ref.focus();
            onFocus?.();
          }, 0);
        }}
        onUnmount={() => {
          apiRef.current = null;
          onEditorReady?.(null);
        }}
        onFocus={() => {
          setFocused(true);
          if (apiRef.current) onEditorReady?.(apiRef.current);
          onFocus?.();
        }}
        onBlur={() => setFocused(false)}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ── ImageBody ────────────────────────────────────────────────────────────────
// 🔥 DIUBAH: redesain total biar mirip ImageBody di e-learning — dropzone
// gede dengan headline + tombol "Choose File", dan pas gambar udah ada,
// bingkai emerald + resize handle drag (geser buat resize) + tombol
// preset ukuran 25/50/75/100%. Drag & drop file asli (dari OS) tetap
// dipertahankan karena itu sudah berfungsi baik di versi artikel.
// ═══════════════════════════════════════════════════════════════════════════
function ImageBody({
  data,
  onChangeData,
}: {
  data?: ArticleCanvasItemData;
  onChangeData: (data: Partial<ArticleCanvasItemData>) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [width, setWidth] = useState<number>(data?.width ?? 100);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(100);

  // Sinkron ulang kalau width berubah dari luar (mis. undo/redo).
  useEffect(() => {
    if (data?.width !== undefined) setWidth(data.width);
  }, [data?.width]);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const blobUrl = URL.createObjectURL(file);
    onChangeData({ src: blobUrl, _file: file, width });
  };

  const commitWidth = (w: number) => {
    setWidth(w);
    onChangeData({ width: w });
  };

  // ── Resize drag logic (copy pola e-learning) ─────────────────────────────
  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = width;

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const containerW = containerRef.current.getBoundingClientRect().width;
      const delta = ev.clientX - dragStartX.current;
      const newWidthPx = (dragStartWidth.current / 100) * containerW + delta;
      const newWidthPct = Math.min(
        100,
        Math.max(10, Math.round((newWidthPx / containerW) * 100)),
      );
      setWidth(newWidthPct);
    };

    const onMouseUp = (ev: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      isDragging.current = false;
      const containerW = containerRef.current.getBoundingClientRect().width;
      const delta = ev.clientX - dragStartX.current;
      const newWidthPx = (dragStartWidth.current / 100) * containerW + delta;
      const newWidthPct = Math.min(
        100,
        Math.max(10, Math.round((newWidthPx / containerW) * 100)),
      );
      setWidth(newWidthPct);
      onChangeData({ width: newWidthPct });
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  if (!data?.src) {
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center text-center gap-1 border-2 border-dashed rounded-xl px-6 py-10 cursor-pointer transition ${
          dragActive
            ? "border-emerald-400 bg-emerald-50"
            : "border-gray-200 bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          onClick={(e) => e.stopPropagation()}
        />
        <UploadCloud size={30} className="text-gray-300 mb-1" />
        <p className="text-[13px] font-medium text-gray-700">
          Upload an image or drag and drop here
        </p>
        <p className="text-[11px] text-gray-400">
          JPG, PNG, GIF, WEBP — max 2MB
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="mt-3 px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-[11px] font-semibold hover:bg-emerald-600 transition"
        >
          Choose File
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <div className="relative mx-auto" style={{ width: `${width}%` }}>
        <div className="relative rounded-lg overflow-hidden border-2 border-emerald-400 bg-gray-50">
          <img
            src={data.src}
            alt=""
            className="w-full h-auto block"
            draggable={false}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChangeData({ src: undefined, _file: undefined });
            }}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-white shadow hover:bg-red-50 transition"
            title="Remove image"
          >
            <Trash2 size={13} className="text-red-500" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center flex-wrap gap-1.5 mt-2.5">
        <span className="text-[10px] text-gray-400 select-none">{width}%</span>
        {/* Drag handle */}
        <div
          onMouseDown={onResizeMouseDown}
          className="flex items-center gap-0.5 cursor-ew-resize px-2 py-1 rounded border border-gray-200 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50 transition select-none"
          title="Drag to resize"
        >
          <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
          <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
          <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
          <span className="text-[10px] text-gray-400 ml-1.5 select-none">
            resize
          </span>
        </div>
        {/* Quick size buttons */}
        {[25, 50, 75, 100].map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              commitWidth(pct);
            }}
            className={`text-[10px] font-medium px-2 py-0.5 rounded border transition ${
              width === pct
                ? "border-emerald-400 bg-emerald-50 text-emerald-600 font-semibold"
                : "border-gray-200 text-gray-400 hover:border-emerald-300"
            }`}
          >
            {pct}%
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ── VideoBody ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

// 🔥 DIUBAH: redesain total biar mirip VideoBody di e-learning — dropzone
// gede dengan opsi upload file (bukan cuma paste URL kayak sebelumnya) +
// tombol "Choose File", plus input URL & tombol "Add" di bawahnya. Logic
// convert ke embed URL (YouTube/Vimeo) punya artikel yang sudah lebih
// lengkap dari e-learning (elearning cuma dukung YouTube) tetap dipakai.
function VideoBody({
  data,
  onChangeData,
}: {
  data?: ArticleCanvasItemData;
  onChangeData: (data: Partial<ArticleCanvasItemData>) => void;
}) {
  const [urlDraft, setUrlDraft] = useState(data?.videoUrl ?? "");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const embedUrl = data?.videoUrl ? toEmbedUrl(data.videoUrl) : null;

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) return;
    const blobUrl = URL.createObjectURL(file);
    // 🔥 FIX: sebelumnya cuma videoUrl (blob) yang disimpan, _file-nya
    // nggak pernah disimpan ke mana pun — jadi nggak ada cara ngambil
    // balik File aslinya buat di-upload ke backend pas Save (beda sama
    // ImageBody yang sudah simpan _file). Sekarang disamain polanya.
    onChangeData({ videoUrl: blobUrl, _file: file });
  };

  const handleAddUrl = () => {
    if (!urlDraft.trim()) return;
    onChangeData({ videoUrl: urlDraft.trim() });
  };

  if (!data?.videoUrl) {
    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center text-center gap-1 border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-xl px-6 py-10 cursor-pointer transition"
      >
        <input
          type="file"
          accept="video/*"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          onClick={(e) => e.stopPropagation()}
        />
        <UploadCloud size={30} className="text-gray-300 mb-1" />
        <p className="text-[13px] font-medium text-gray-700">
          Upload a video or drag and drop here
        </p>
        <p className="text-[11px] text-gray-400">
          MP4 file, or paste a YouTube / Vimeo link below
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="mt-3 px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-[11px] font-semibold hover:bg-emerald-600 transition"
        >
          Choose File
        </button>

        <div
          className="flex items-center gap-2 mt-4 w-full max-w-[340px]"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddUrl();
            }}
            placeholder="Paste YouTube, Vimeo, or video URL ..."
            className="flex-1 text-[11px] px-3 py-2 rounded-lg border border-gray-200 bg-white outline-none focus:ring-1 focus:ring-emerald-400 transition"
          />
          <button
            onClick={handleAddUrl}
            className="px-3 py-2 text-[11px] font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition shrink-0"
          >
            Add
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {embedUrl ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-emerald-400 bg-black">
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <video
          src={data.videoUrl}
          controls
          className="w-full rounded-lg border-2 border-emerald-400 bg-black"
        />
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onChangeData({ videoUrl: "", _file: undefined });
          setUrlDraft("");
        }}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-white shadow hover:bg-red-50 transition"
        title="Remove video"
      >
        <Trash2 size={13} className="text-red-500" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ── ModeToggleButton ─────────────────────────────────────────────────────────
// 🔥 BARU: tombol Edit/Preview yang dipakai bersama oleh Table, Link,
// Divider, dan Table of Content — polanya sama persis dengan yang dipakai
// Heading/Paragraph/Highlight (RichBody), cuma di-share biar nggak
// duplikat JSX di 4 tempat. hoverGroup menentukan tombol ini nempel ke
// hover area yang mana: "group" = ikut hover kartu (dipakai pas mode
// edit, karena wrapper edit sendiri nggak punya scope hover baru),
// "group/preview" = ikut hover box preview itu sendiri.
// ═══════════════════════════════════════════════════════════════════════════
function ModeToggleButton({
  mode,
  onToggle,
  hoverGroup,
}: {
  mode: "canvas" | "preview";
  onToggle: () => void;
  hoverGroup: "group" | "group/preview";
}) {
  const hoverClass =
    hoverGroup === "group/preview"
      ? "group-hover/preview:opacity-100"
      : "group-hover:opacity-100";
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      title={mode === "canvas" ? "Preview" : "Edit"}
      className={`absolute top-2 right-2 opacity-0 ${hoverClass} transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10`}
    >
      {mode === "canvas" ? (
        <>
          <Eye size={11} /> Preview
        </>
      ) : (
        <>
          <Pencil size={11} /> Edit
        </>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ── TableCellInput ───────────────────────────────────────────────────────────
// 🔥 DIUBAH: dulu tiap sel tabel cuma <textarea> polos — nggak bisa terima
// formatting apa pun (bold/italic/dst), dan mode preview-nya nampilin teks
// MENTAH (bukan HTML), jadi newline dari Shift+Enter ilang begitu masuk
// preview (HTML nge-collapse whitespace kecuali di-render lewat
// dangerouslySetInnerHTML + white-space:pre-wrap). Sekarang tiap sel pakai
// ArticleRichTextEditor yang SAMA PERSIS dengan yang dipakai
// Paragraph/Heading, jadi:
// 1) Shift+Enter nyisipin line break DI DALAM sel — identik Paragraph.
// 2) Toolbar Style (Bold/Italic/Underline/dst) bisa diterapkan ke teks di
//    sel yang lagi fokus, sama seperti elemen rich-text lain.
// 3) Mode preview nge-render HTML yang SAMA PERSIS dengan yang diketik di
//    mode edit (dangerouslySetInnerHTML + normalizeEditorHTML) — nggak ada
//    lagi beda tampilan antara edit & preview.
// ═══════════════════════════════════════════════════════════════════════════
function TableCellInput({
  value,
  placeholder,
  rowIndex,
  colIndex,
  textStyle,
  onChange,
  onRegisterApi,
  onUnregisterApi,
  onEditorReady,
  onFocusCell,
  onSelectionChange,
  onEnterNext,
}: {
  value: string;
  placeholder?: string;
  rowIndex: number;
  colIndex: number;
  textStyle: React.CSSProperties;
  onChange: (val: string) => void;
  onRegisterApi: (api: ArticleRichTextEditorRef) => void;
  onUnregisterApi: () => void;
  onEditorReady?: (ref: ArticleRichTextEditorRef | null) => void;
  onFocusCell?: () => void;
  onSelectionChange?: (state: ArticleSelectionState) => void;
  onEnterNext: () => void;
}) {
  const apiRef = useRef<ArticleRichTextEditorRef | null>(null);

  return (
    <div
      // 🔥 BARU: `cursor-text` — sebelumnya area padding di sekitar teks
      // (yang keliatannya kosong) masih nunjukin cursor panah biasa,
      // bikin nggak jelas apa area itu bisa diketik atau enggak. Sekarang
      // seluruh area sel (termasuk paddingnya) langsung nunjukin cursor
      // teks (I-beam) begitu di-hover, konsisten sama Heading/Paragraph/
      // Highlight.
      className="cursor-text"
      // 🔥 BARU: dicegat di sini (fase capture, sebelum event nyampe ke
      // ArticleRichTextEditor) supaya Enter TANPA Shift bisa dialihkan
      // jadi "pindah ke sel baris berikutnya" (kayak Excel/Sheets),
      // bukannya bikin block baru di dalam sel. Shift+Enter sama sekali
      // nggak disentuh di sini → tetap lolos ke behavior default editor
      // (nyisipin line break di dalam sel, persis Paragraph).
      onKeyDownCapture={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          onEnterNext();
        }
      }}
    >
      <ArticleRichTextEditor
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        style={textStyle}
        className="text-gray-700 text-xs px-2 py-1.5 min-h-0 cursor-text"
        onMount={(ref) => {
          apiRef.current = ref;
          onRegisterApi(ref);
        }}
        onUnmount={() => {
          apiRef.current = null;
          onUnregisterApi();
        }}
        onFocus={() => {
          // 🔥 BARU: daftar ulang sel ini sebagai "active editor" SETIAP
          // kali difokus (bukan cuma sekali pas mount). Tanpa ini,
          // tombol Bold/Italic/dst di Style panel selalu ngarah ke sel
          // yang pertama/terakhir kali dirender — bukan ke sel yang lagi
          // diketik user — makanya style nggak nempel pas dicoba di
          // tabel.
          if (apiRef.current) onEditorReady?.(apiRef.current);
          onFocusCell?.();
        }}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ── TableBody ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
function TableBody({
  data,
  onChangeData,
  onEditorReady,
  onEditorFocus,
  onSelectionChange,
}: {
  data?: ArticleCanvasItemData;
  onChangeData: (data: Partial<ArticleCanvasItemData>) => void;
  onEditorReady?: (ref: ArticleRichTextEditorRef | null) => void;
  onEditorFocus?: () => void;
  onSelectionChange?: (state: ArticleSelectionState) => void;
}) {
  const [mode, setMode] = useState<"canvas" | "preview">("canvas");
  const rows = data?.rows ?? [
    ["", ""],
    ["", ""],
  ];
  const cols = rows[0]?.length ?? 2;
  // 🔥 BARU: batas minimal tabel 1 baris x 1 kolom — tombol kurang
  // row/column otomatis disabled begitu nyentuh batas ini.
  const canRemoveRow = rows.length > 1;
  const canRemoveColumn = cols > 1;
  // 🔥 BARU: fontType/fontSize sekarang berlaku untuk SATU tabel penuh
  // (semua sel sekaligus), diatur lewat dropdown Font Type & Font Size di
  // Style panel — persis pola yang sama dengan Paragraph/Heading, cuma di
  // sini efeknya dipakai bareng ke semua sel. Kalau belum pernah di-set,
  // getFontStyle otomatis fallback ke preset "Paragraph" (16px, normal —
  // BUKAN bold), jadi baris pertama nggak lagi auto-bold kayak sebelumnya.
  const textStyle = getFontStyle(data?.fontType, data?.fontSize);

  // Registry instance editor per-sel (bukan DOM query) — dipakai buat (1)
  // mindahin fokus ke sel baris berikutnya pas Enter ditekan, dan (2)
  // tau instance ArticleRichTextEditor mana yang harus dijadiin "active
  // editor" pas toolbar Style diklik.
  const cellApisRef = useRef<Record<string, ArticleRichTextEditorRef>>({});
  const cellKey = (r: number, c: number) => `${r}-${c}`;

  const updateCell = (r: number, c: number, val: string) => {
    const next = rows.map((row) => [...row]);
    next[r][c] = val;
    onChangeData({ rows: next });
  };

  const addRow = () => onChangeData({ rows: [...rows, Array(cols).fill("")] });
  const removeRow = (r: number) => {
    if (!canRemoveRow) return;
    onChangeData({ rows: rows.filter((_, i) => i !== r) });
  };
  const addColumn = () =>
    onChangeData({ rows: rows.map((row) => [...row, ""]) });
  const removeColumn = (c: number) => {
    if (!canRemoveColumn) return;
    onChangeData({ rows: rows.map((row) => row.filter((_, i) => i !== c)) });
  };

  // 🔥 DIUBAH: mode preview sekarang render HTML sel lewat
  // dangerouslySetInnerHTML + normalizeEditorHTML (SAMA seperti
  // Paragraph/Heading) — bukan lagi teks mentah — supaya hasilnya PERSIS
  // sama dengan yang diketik di mode edit (line break dari Shift+Enter,
  // bold/italic, dst semua ikut kebawa). Baris pertama juga nggak lagi
  // dipaksa bold/background abu-abu otomatis — tampilannya sekarang murni
  // dari formatting yang diterapkan user sendiri, persis kayak Paragraph.
  if (mode === "preview") {
    return (
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 bg-white group/preview overflow-x-auto">
        <ModeToggleButton
          mode={mode}
          onToggle={() => setMode("canvas")}
          hoverGroup="group/preview"
        />
        {/* 🔥 FIX: dulu <table> nggak punya `table-layout: fixed`, jadi
            lebar tiap kolom ditentuin browser otomatis berdasarkan isi
            (table-layout: auto default) — akibatnya BARU ketik sedikit di
            satu sel, kolom itu langsung "narik" lebar dari kolom
            sebelahnya (kolom sebelah jadi kepepet sempit). Sekarang pakai
            `tableLayout: "fixed"` + <colgroup> yang bagi lebar SAMA RATA
            per kolom sejak awal — lebar kolom jadi tetap/stabil nggak
            peduli seberapa banyak yang diketik di sel mana pun. */}
        <table
          className="w-full border-collapse text-sm"
          style={{ tableLayout: "fixed" }}
        >
          <colgroup>
            {Array.from({ length: cols }).map((_, c) => (
              <col key={c} style={{ width: `${100 / cols}%` }} />
            ))}
          </colgroup>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className="border border-gray-200 px-3 py-2 align-top text-gray-700"
                  >
                    <div
                      className={`${richTextDisplayClass} break-words`}
                      style={textStyle}
                      dangerouslySetInnerHTML={{
                        __html:
                          normalizeEditorHTML(cell) ||
                          (r === 0
                            ? `<span class="text-gray-300">Column ${c + 1}</span>`
                            : ""),
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="relative">
      <ModeToggleButton
        mode={mode}
        onToggle={() => setMode("preview")}
        hoverGroup="group"
      />
      <div className="overflow-x-auto">
        {/* 🔥 FIX: sama kayak versi preview di atas — tambahin
            `tableLayout: "fixed"` + <colgroup> biar lebar kolom data
            sama-rata & TETAP (nggak auto-resize ngikutin isi ketikan),
            plus 1 kolom tambahan lebar tetap (24px) buat tombol "×" hapus
            baris di ujung kanan, biar itu juga nggak ikut kehitung ke
            pembagian lebar kolom data. */}
        <table
          className="border-collapse w-full"
          style={{ tableLayout: "fixed" }}
        >
          <colgroup>
            {Array.from({ length: cols }).map((_, c) => (
              <col key={c} style={{ width: `${100 / cols}%` }} />
            ))}
            <col style={{ width: 24 }} />
          </colgroup>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className="group/row">
                {row.map((cell, c) => (
                  <td key={c} className="border border-gray-200 p-0 align-top">
                    <TableCellInput
                      value={cell}
                      placeholder={r === 0 ? `Column ${c + 1}` : ""}
                      rowIndex={r}
                      colIndex={c}
                      textStyle={textStyle}
                      onChange={(val) => updateCell(r, c, val)}
                      onRegisterApi={(api) => {
                        cellApisRef.current[cellKey(r, c)] = api;
                      }}
                      onUnregisterApi={() => {
                        delete cellApisRef.current[cellKey(r, c)];
                      }}
                      onEditorReady={onEditorReady}
                      onFocusCell={onEditorFocus}
                      onSelectionChange={onSelectionChange}
                      onEnterNext={() => {
                        cellApisRef.current[cellKey(r + 1, c)]?.focus();
                      }}
                    />
                  </td>
                ))}
                {/* 🔥 DIUBAH: dulu ikon "×" opacity-0 (baru kelihatan pas
                    hover row) bikin fitur hapus-baris ini nggak
                    kediscover user sama sekali. Sekarang selalu kelihatan
                    samar (opacity-50) & jelas nyala pas hover, plus
                    otomatis disabled + abu-abu pas cuma tersisa 1 baris. */}
                <td className="pl-1.5 w-6 align-top pt-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRow(r);
                    }}
                    disabled={!canRemoveRow}
                    title={canRemoveRow ? "Remove row" : "Minimal 1 baris"}
                    className={`transition ${
                      canRemoveRow
                        ? "text-gray-300 opacity-50 group-hover/row:opacity-100 hover:text-red-400"
                        : "text-gray-200 cursor-not-allowed"
                    }`}
                  >
                    <X size={12} />
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="pt-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeColumn(c);
                    }}
                    disabled={!canRemoveColumn}
                    title={
                      canRemoveColumn ? "Remove column" : "Minimal 1 kolom"
                    }
                    className={`w-full flex items-center justify-center transition ${
                      canRemoveColumn
                        ? "text-gray-300 opacity-50 hover:opacity-100 hover:text-red-400"
                        : "text-gray-200 cursor-not-allowed"
                    }`}
                  >
                    <X size={11} />
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* 🔥 BARU: tombol +/- Row & +/- Column yang jelas & selalu
            kelihatan (bukan cuma ikon "×" samar di pojok) — tombol kurang
            otomatis disabled begitu tabel nyentuh batas minimal 1x1,
            supaya jelas kelihatan kalau nggak bisa dikurangi lagi. */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center rounded-lg border border-dashed border-emerald-300 overflow-hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addRow();
              }}
              title="Add row"
              className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 px-2.5 py-1 hover:bg-emerald-50 transition"
            >
              <Plus size={11} /> Row
            </button>
            <span className="w-px self-stretch bg-emerald-200" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeRow(rows.length - 1);
              }}
              disabled={!canRemoveRow}
              title={canRemoveRow ? "Remove last row" : "Minimal 1 baris"}
              className={`flex items-center px-2 py-1 transition ${
                canRemoveRow
                  ? "text-emerald-600 hover:bg-emerald-50"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <Minus size={11} />
            </button>
          </div>
          <div className="flex items-center rounded-lg border border-dashed border-emerald-300 overflow-hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addColumn();
              }}
              title="Add column"
              className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 px-2.5 py-1 hover:bg-emerald-50 transition"
            >
              <Plus size={11} /> Column
            </button>
            <span className="w-px self-stretch bg-emerald-200" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeColumn(cols - 1);
              }}
              disabled={!canRemoveColumn}
              title={canRemoveColumn ? "Remove last column" : "Minimal 1 kolom"}
              className={`flex items-center px-2 py-1 transition ${
                canRemoveColumn
                  ? "text-emerald-600 hover:bg-emerald-50"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <Minus size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ── LinkBody ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
// 🔥 DIUBAH: LinkBody dirombak total mengikuti desain di gambar referensi
// — "Link Text" (dengan counter 0/150), lalu "Link to" (External URL /
// Article Section) yang menentukan kolom kanannya: input URL kalau
// External URL, atau dropdown Section (merujuk ke Heading di canvas)
// kalau Article Section.
// ═══════════════════════════════════════════════════════════════════════════
// ── SectionSelect ────────────────────────────────────────────────────────────
// 🔥 BARU: dropdown kustom pengganti <select> native buat "Select section"
// di LinkBody & TableOfContentBody. <select> native nggak bisa dibatasi
// tinggi popup-nya lewat CSS — browser yang nentuin sendiri, dan pas
// opsinya banyak (Paragraph 1, 2, 3, ... dst) popup-nya jadi kepanjangan
// dan nabrak elemen lain di halaman. Versi kustom ini render list-nya
// sendiri di dalam div ber-`max-h` + `overflow-y-auto`, jadi ketinggiannya
// selalu kekontrol & otomatis scroll kalau opsinya banyak, nggak peduli
// browser/OS-nya apa.
// ═══════════════════════════════════════════════════════════════════════════
function SectionSelect({
  value,
  options,
  onChange,
  placeholder = "Select section",
}: {
  value: string;
  options: { instanceId: string; text: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Tutup dropdown kalau user klik di luar area komponen ini.
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selected = options.find((o) => o.instanceId === value);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="w-full flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white text-left"
      >
        <span
          className={`truncate ${selected ? "text-gray-800" : "text-gray-400"}`}
        >
          {selected?.text ?? placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute z-20 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg py-1"
        >
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 ${
              !value ? "text-emerald-600 font-medium" : "text-gray-400"
            }`}
          >
            {placeholder}
          </button>
          {options.map((o) => (
            <button
              key={o.instanceId}
              type="button"
              onClick={() => {
                onChange(o.instanceId);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs truncate hover:bg-emerald-50 ${
                value === o.instanceId
                  ? "text-emerald-600 font-medium bg-emerald-50"
                  : "text-gray-700"
              }`}
            >
              {o.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LinkBody({
  data,
  headings,
  onChangeData,
}: {
  data?: ArticleCanvasItemData;
  headings: { instanceId: string; text: string }[];
  onChangeData: (data: Partial<ArticleCanvasItemData>) => void;
}) {
  const [mode, setMode] = useState<"canvas" | "preview">("canvas");
  const linkText = data?.linkText ?? "";
  const linkType = data?.linkType ?? "external";
  const linkUrl = data?.linkUrl ?? "";
  const linkSectionId = data?.linkSectionId ?? "";

  const targetSection = headings.find((h) => h.instanceId === linkSectionId);
  const displayLabel =
    linkText || (linkType === "section" ? targetSection?.text : linkUrl) || "";

  if (mode === "preview") {
    return (
      <div className="relative flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl px-4 py-5 bg-white group/preview">
        <ModeToggleButton
          mode={mode}
          onToggle={() => setMode("canvas")}
          hoverGroup="group/preview"
        />
        {displayLabel ? (
          linkType === "section" ? (
            <a
              href={linkSectionId ? `#${linkSectionId}` : undefined}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:underline"
            >
              <List size={13} />
              {displayLabel}
            </a>
          ) : (
            <a
              href={linkUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:underline"
            >
              <Link2 size={13} />
              {displayLabel}
            </a>
          )
        ) : (
          <span className="text-[12px] text-gray-400">Link belum diisi</span>
        )}
      </div>
    );
  }

  return (
    <div className="relative rounded-lg border-2 border-dashed border-gray-200 px-4 py-3 space-y-3">
      <ModeToggleButton
        mode={mode}
        onToggle={() => setMode("preview")}
        hoverGroup="group"
      />

      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">
          Link Text
        </label>
        <input
          type="text"
          maxLength={150}
          value={linkText}
          onChange={(e) => onChangeData({ linkText: e.target.value })}
          placeholder="Enter a link text"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
        />
        <p className="text-[10px] text-gray-400 mt-1">{linkText.length}/150</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">
            Link to
          </label>
          <select
            value={linkType}
            onChange={(e) =>
              onChangeData({
                linkType: e.target.value as "external" | "section",
              })
            }
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
          >
            <option value="external">External URL</option>
            <option value="section">Article Section</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">
            {linkType === "external" ? "URL" : "Section"}
          </label>
          {linkType === "external" ? (
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => onChangeData({ linkUrl: e.target.value })}
              placeholder="Enter URL"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          ) : (
            <SectionSelect
              value={linkSectionId}
              options={headings}
              onChange={(v) => onChangeData({ linkSectionId: v })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ── DividerBody ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
function DividerBody({
  data,
  onChangeData,
}: {
  data?: ArticleCanvasItemData;
  onChangeData: (data: Partial<ArticleCanvasItemData>) => void;
}) {
  const [mode, setMode] = useState<"canvas" | "preview">("canvas");
  const style = data?.dividerStyle ?? "solid";
  const styles: Array<"solid" | "dashed"> = ["solid", "dashed"];

  // 🔥 BARU: mode preview — cuma tampilkan garisnya polos, tanpa
  // tombol pilihan style, persis kayak yang bakal muncul di artikel.
  if (mode === "preview") {
    return (
      <div className="relative px-4 py-4 group/preview">
        <ModeToggleButton
          mode={mode}
          onToggle={() => setMode("canvas")}
          hoverGroup="group/preview"
        />
        <hr
          style={{ borderTopStyle: style, borderTopWidth: 2 }}
          className="border-black"
        />
      </div>
    );
  }

  return (
    <div className="relative px-4 py-2">
      <ModeToggleButton
        mode={mode}
        onToggle={() => setMode("preview")}
        hoverGroup="group"
      />
      <hr
        style={{ borderTopStyle: style, borderTopWidth: 2 }}
        className="border-gray-300 mb-3"
      />
      <div className="flex items-center justify-center gap-1.5">
        {styles.map((s) => (
          <button
            key={s}
            onClick={(e) => {
              e.stopPropagation();
              onChangeData({ dividerStyle: s });
            }}
            className={`text-[10px] font-medium px-2.5 py-1 rounded-full border capitalize transition ${
              style === s
                ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ── TableOfContentBody ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
// 🔥 DIUBAH: TableOfContentBody dirombak total mengikuti desain di gambar
// referensi — daftar item yang diinput manual (nama custom + section
// rujukan ke salah satu Heading di canvas), bisa ditambah/dihapus, bukan
// lagi auto-generate dari semua Heading yang ada.
function TableOfContentBody({
  data,
  headings,
  onChangeData,
}: {
  data?: ArticleCanvasItemData;
  headings: { instanceId: string; text: string }[];
  onChangeData: (data: Partial<ArticleCanvasItemData>) => void;
}) {
  const [mode, setMode] = useState<"canvas" | "preview">("canvas");
  const items: ArticleTocItem[] =
    data?.tocItems && data.tocItems.length > 0
      ? data.tocItems
      : [{ id: generateTocItemId(), name: "", sectionId: "" }];

  const updateItem = (id: string, patch: Partial<ArticleTocItem>) => {
    onChangeData({
      tocItems: items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    });
  };

  const addItem = () => {
    onChangeData({
      tocItems: [
        ...items,
        { id: generateTocItemId(), name: "", sectionId: "" },
      ],
    });
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    onChangeData({ tocItems: items.filter((it) => it.id !== id) });
  };

  // Label yang ditampilkan di preview: pakai nama custom kalau diisi,
  // kalau kosong fallback ke judul Heading yang dirujuk.
  const resolveLabel = (item: ArticleTocItem, idx: number) => {
    if (item.name.trim()) return item.name;
    const section = headings.find((h) => h.instanceId === item.sectionId);
    return section?.text || `Item ${idx + 1}`;
  };

  if (mode === "preview") {
    return (
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl px-4 py-3.5 bg-white group/preview">
        <ModeToggleButton
          mode={mode}
          onToggle={() => setMode("canvas")}
          hoverGroup="group/preview"
        />
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2.5">
          On this page
        </p>
        <div className="space-y-2">
          {items.map((item, i) => (
            <a
              key={item.id}
              href={item.sectionId ? `#${item.sectionId}` : undefined}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-sm text-emerald-600 hover:underline"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              {resolveLabel(item, i)}
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg border-2 border-dashed border-gray-200 px-4 py-3.5">
      <ModeToggleButton
        mode={mode}
        onToggle={() => setMode("preview")}
        hoverGroup="group"
      />

      <div className="space-y-4">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={
              i > 0 ? "pt-4 border-t border-dashed border-gray-200" : ""
            }
          >
            <div className="grid grid-cols-2 gap-3 items-start">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Item Name {i + 1}
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={item.name}
                  onChange={(e) =>
                    updateItem(item.id, { name: e.target.value })
                  }
                  placeholder={`Enter a item name ${i + 1}`}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  {item.name.length}/50
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Section
                  </label>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    disabled={items.length <= 1}
                    title="Remove item"
                    className="text-gray-300 hover:text-red-400 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <SectionSelect
                  value={item.sectionId ?? ""}
                  options={headings}
                  onChange={(v) => updateItem(item.id, { sectionId: v })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            addItem();
          }}
          className="flex items-center gap-2 text-xs font-semibold text-emerald-600 border border-emerald-300 rounded-full pl-1.5 pr-4 py-1.5 hover:bg-emerald-50 transition"
        >
          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Plus size={12} />
          </span>
          Add Item
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ── CardBody dispatcher ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
function CardBody({
  el,
  headings,
  onEditorReady,
  onEditorFocus,
  onSelectionChange,
  onChangeData,
}: {
  el: ArticleCanvasItem;
  headings: { instanceId: string; text: string }[];
  onEditorReady?: (ref: ArticleRichTextEditorRef | null) => void;
  onEditorFocus?: () => void;
  onSelectionChange?: (state: ArticleSelectionState) => void;
  onChangeData: (data: Partial<ArticleCanvasItemData>) => void;
}) {
  const data = el.data;

  switch (el.id) {
    case "HEADING":
      return (
        <RichBody
          value={data?.html}
          fontType={data?.fontType}
          fontSize={data?.fontSize}
          placeholder="Enter heading text ..."
          textClassName="text-gray-900 font-bold"
          onChange={(html) => onChangeData({ html })}
          onEditorReady={onEditorReady}
          onFocus={onEditorFocus}
          onSelectionChange={onSelectionChange}
        />
      );
    case "PARAGRAPH":
      return (
        <RichBody
          value={data?.html}
          fontType={data?.fontType}
          fontSize={data?.fontSize}
          placeholder="Enter paragraph text ..."
          textClassName="text-gray-700 leading-relaxed min-h-[3em]"
          onChange={(html) => onChangeData({ html })}
          onEditorReady={onEditorReady}
          onFocus={onEditorFocus}
          onSelectionChange={onSelectionChange}
        />
      );
    case "HIGHLIGHT":
      return (
        <HighlightBody
          value={data?.html}
          fontType={data?.fontType}
          fontSize={data?.fontSize}
          placeholder="Add important note here ..."
          onChange={(html) => onChangeData({ html })}
          onEditorReady={onEditorReady}
          onFocus={onEditorFocus}
          onSelectionChange={onSelectionChange}
        />
      );
    case "IMAGE":
      return <ImageBody data={data} onChangeData={onChangeData} />;
    case "VIDEO":
      return <VideoBody data={data} onChangeData={onChangeData} />;
    case "TABLE":
      return (
        <TableBody
          data={data}
          onChangeData={onChangeData}
          onEditorReady={onEditorReady}
          onEditorFocus={onEditorFocus}
          onSelectionChange={onSelectionChange}
        />
      );
    case "LINK":
      return (
        <LinkBody data={data} headings={headings} onChangeData={onChangeData} />
      );
    case "DIVIDER":
      return <DividerBody data={data} onChangeData={onChangeData} />;
    case "TABLE_OF_CONTENT":
      return (
        <TableOfContentBody
          data={data}
          headings={headings}
          onChangeData={onChangeData}
        />
      );
    default:
      return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ── Toolbar button ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
function ToolbarBtn({
  children,
  onClick,
  danger = false,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`p-1 rounded transition-colors ${
        danger
          ? "text-gray-400 hover:text-red-500 hover:bg-red-50"
          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ── Main ArticleCanvasCard ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
export interface ArticleCanvasCardProps {
  el: ArticleCanvasItem;
  order: number;
  total: number;
  // 🔥 BARU: urutan-ke berapa kartu ini di antara kartu lain yang bertipe
  // sama (dihitung page.tsx lewat `buildItemCounters`), dipakai buat kasih
  // label "Image 1", "Paragraph 2", dst di header kartu — supaya user tau
  // persis elemen apa & nomor berapa yang lagi diedit. Tidak dipakai untuk
  // TABLE_OF_CONTENT karena elemen itu cuma boleh ada 1.
  typeIndex: number;
  isSelected: boolean;
  isDragOver: boolean;
  // 🔥 DIUBAH: dulu isinya cuma elemen HEADING, sekarang SEMUA elemen di
  // canvas KECUALI TABLE_OF_CONTENT — dipakai LinkBody (Link ke "Article
  // Section") & TableOfContentBody sebagai daftar target yang bisa dituju.
  // `text` isinya label generate ("Paragraph 2", "Image 1", dst), BUKAN isi
  // teks yang diketik user (lihat komentar di page.tsx tempat ini dibuat).
  headings: { instanceId: string; text: string }[];
  onSelect: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onChangeData: (data: Partial<ArticleCanvasItemData>) => void;
  onEditorReady?: (ref: ArticleRichTextEditorRef | null) => void;
  onEditorFocus?: () => void;
  onSelectionChange?: (state: ArticleSelectionState) => void;
}

export default function ArticleCanvasCard({
  el,
  order,
  total,
  typeIndex,
  isSelected,
  isDragOver,
  headings,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDragStart,
  onDragOver,
  onDrop,
  onChangeData,
  onEditorReady,
  onEditorFocus,
  onSelectionChange,
}: ArticleCanvasCardProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const noPadding = NO_SIDE_PADDING_IDS.has(el.id);

  return (
    <div
      onClick={(e) => {
        // 🔥 FIX: tanpa stopPropagation, klik di kartu ini bubbling ke
        // wrapper canvas di page.tsx yang punya onClick={() =>
        // setSelectedInstanceId(null)} — akibatnya elemen langsung
        // ke-deselect lagi di event yang sama persis setelah dipilih,
        // sehingga Style panel selalu balik ke placeholder "Pilih salah
        // satu elemen ...". Ini akar masalah kenapa Style tidak pernah
        // muncul walau elemen sudah diklik.
        e.stopPropagation();
        onSelect();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e);
      }}
      onDrop={(e) => {
        e.stopPropagation();
        onDrop(e);
      }}
      className={`group relative bg-white rounded-xl transition-all duration-150 border outline-none cursor-default ${
        isSelected
          ? "border-emerald-400 ring-1 ring-emerald-200"
          : "border-gray-200"
      } ${isDragOver ? "shadow-md scale-[1.01]" : ""} ${
        isHidden ? "opacity-40" : ""
      }`}
    >
      {/* ── Order badge ────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] font-semibold text-gray-400 tabular-nums shadow-sm select-none">
          {order} / {total}
        </span>
      </div>

      {/* ── Card header bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <div
            draggable={!isLocked}
            onDragStart={(e) => {
              if (isLocked) return;
              e.stopPropagation();
              onDragStart(e);
            }}
            className="opacity-0 group-hover:opacity-40 cursor-grab active:cursor-grabbing transition shrink-0"
          >
            <GripVertical size={14} className="text-gray-400" />
          </div>
          <span className="text-gray-500 flex items-center shrink-0">
            {CANVAS_ICONS[el.id]}
          </span>
          <span className="text-[13px] font-semibold text-gray-800 tracking-wide truncate">
            {/* 🔥 BARU: nomor urut per-tipe di belakang label (mis. "Image
                1", "Paragraph 2") — dilewatin buat semua elemen KECUALI
                Table of Content, karena itu cuma boleh ada 1. */}
            {el.id === "TABLE_OF_CONTENT"
              ? el.label
              : `${el.label} ${typeIndex}`}
          </span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <ToolbarBtn title="Move up" onClick={onMoveUp}>
            <ChevronUp size={14} />
          </ToolbarBtn>
          <ToolbarBtn title="Move down" onClick={onMoveDown}>
            <ChevronDown size={14} />
          </ToolbarBtn>
          <ToolbarBtn title="Duplicate" onClick={onDuplicate}>
            <Copy size={13} />
          </ToolbarBtn>
          <ToolbarBtn title="Delete" danger onClick={onRemove}>
            <Trash2 size={13} />
          </ToolbarBtn>
          <ToolbarBtn
            title={isHidden ? "Show" : "Hide"}
            onClick={() => setIsHidden((v) => !v)}
          >
            {isHidden ? <EyeOff size={13} /> : <Eye size={13} />}
          </ToolbarBtn>
          <ToolbarBtn
            title={isLocked ? "Unlock" : "Lock"}
            onClick={() => setIsLocked((v) => !v)}
          >
            {isLocked ? <Unlock size={13} /> : <Lock size={13} />}
          </ToolbarBtn>
        </div>
      </div>

      {/* ── Card body ──────────────────────────────────────────────────── */}
      <div
        className={noPadding ? "py-2" : "px-4 py-3"}
        style={{
          pointerEvents: isLocked ? "none" : "auto",
          userSelect: isLocked ? "none" : "auto",
          opacity: isLocked ? 0.7 : 1,
        }}
      >
        <CardBody
          el={el}
          headings={headings}
          onEditorReady={onEditorReady}
          onEditorFocus={onEditorFocus}
          onSelectionChange={onSelectionChange}
          onChangeData={onChangeData}
        />
      </div>
    </div>
  );
}
