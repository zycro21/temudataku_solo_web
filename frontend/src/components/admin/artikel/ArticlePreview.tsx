"use client";

// ═══════════════════════════════════════════════════════════════════════════
// ArticlePreview.tsx
// ─────────────────────────────────────────────────────────────────────────
// Preview "1 halaman penuh" dari artikel yang sedang dibuat di canvas —
// dipakai page.tsx (halaman editor artikel) begitu tombol "Preview"
// diklik. SENGAJA cuma menggantikan isi halaman (bukan navigasi ke route
// lain), jadi URL-nya tetap sama persis kayak halaman editor.
//
// Data yang ditampilkan SELALU diambil dari state yang sedang di-edit di
// memory (canvasItems/title/dst yang dioper dari page.tsx), BUKAN
// hasil fetch ulang dari server — jadi perubahan yang belum di-Save pun
// ikut kelihatan di sini, sesuai permintaan.
//
// Rendering tiap jenis block (Heading/Paragraph/Highlight/Image/Video/
// Table/Link/Divider) SENGAJA dibikin baru di sini (bukan reuse body
// component dari ArticleCanvasCard.tsx) karena body-body di sana semua
// dibikin untuk MODE EDIT (ada border putus-putus, tombol Edit/Preview,
// dst) — di sini kita cuma butuh tampilan akhir yang bersih, murni
// read-only, mengikuti look halaman artikel yang sebenarnya nanti.
// Sumber data (field `data.*` tiap item) & styling (getFontStyle,
// richTextDisplayClass) tetap SAMA PERSIS dengan yang dipakai canvas,
// supaya preview ini benar-benar WYSIWYG.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useId, useRef, useState } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ArrowLeft, Pencil, List, Link2, Check } from "lucide-react";
import {
  normalizeEditorHTML,
  richTextDisplayClass,
} from "@/lib/editorHTMLUtils";
import { getFontStyle } from "./articleFontStyles";
import type { ArticleCanvasItem, ArticleTocItem } from "./ArticleCanvasCard";

// Salinan instance font sendiri (bukan reuse dari page.tsx) — sama alasan
// & konfigurasinya persis dengan yang di page.tsx, dipakai supaya
// tipografi preview ini konsisten dengan halaman editornya, tanpa bikin
// komponen ini punya dependency ke page.tsx.
const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Salinan mandiri dari toEmbedUrl() di ArticleCanvasCard.tsx — fungsi itu
// nggak di-export dari sananya (murni helper internal buat VideoBody), dan
// kita nggak mau bikin Article Preview jadi punya dependency ke situ cuma
// buat 1 fungsi kecil.
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

// ── Corak background hero (random, 20 kemungkinan) ──────────────────────
// 5 motif dasar × 4 kombinasi ukuran-tile/rotasi = 20 kemungkinan corak
// berbeda. Dipilih pakai hash dari `seed` (id/judul artikel) supaya
// STABIL — artikel yang sama selalu dapat corak yang sama tiap dibuka,
// bukan berubah-ubah acak tiap render.
type HeroMotif = "dots" | "rings" | "plus" | "diagonal" | "hex";
const HERO_MOTIFS: HeroMotif[] = ["dots", "rings", "plus", "diagonal", "hex"];
const HERO_PATTERN_CONFIGS: { tile: number; rotate: number }[] = [
  { tile: 26, rotate: 0 },
  { tile: 34, rotate: 14 },
  { tile: 30, rotate: -18 },
  { tile: 42, rotate: 28 },
];
// Posisi & ukuran blob aksen besar — ikut divariasikan per-variant biar
// makin kerasa beda satu corak ke corak lain, bukan cuma tile pattern-nya.
const HERO_BLOB_VARIANTS: { position: string; size: number }[] = [
  { position: "-right-12 -top-16", size: 256 },
  { position: "-left-14 -bottom-16", size: 224 },
  { position: "-right-10 -bottom-20", size: 288 },
  { position: "-left-10 -top-20", size: 240 },
];

function hashStringToInt(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickHeroPatternVariant(seed: string): number {
  return hashStringToInt(seed || "article") % 20;
}

function HeroMotifShape({ motif, size }: { motif: HeroMotif; size: number }) {
  const c = size / 2;
  switch (motif) {
    case "dots":
      return <circle cx={c} cy={c} r={size * 0.09} fill="white" />;
    case "rings":
      return (
        <circle
          cx={c}
          cy={c}
          r={size * 0.28}
          fill="none"
          stroke="white"
          strokeWidth={size * 0.07}
        />
      );
    case "plus": {
      const t = size * 0.12;
      return (
        <g fill="white">
          <rect
            x={c - t / 2}
            y={size * 0.16}
            width={t}
            height={size * 0.68}
            rx={t / 2}
          />
          <rect
            x={size * 0.16}
            y={c - t / 2}
            width={size * 0.68}
            height={t}
            rx={t / 2}
          />
        </g>
      );
    }
    case "diagonal":
      return (
        <line
          x1={0}
          y1={size}
          x2={size}
          y2={0}
          stroke="white"
          strokeWidth={size * 0.09}
          strokeLinecap="round"
        />
      );
    case "hex": {
      const r = size * 0.32;
      const points = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        return `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`;
      }).join(" ");
      return (
        <polygon
          points={points}
          fill="none"
          stroke="white"
          strokeWidth={size * 0.06}
        />
      );
    }
  }
}

// Corak tile yang di-tile penuh 1 area hero + 1 blob aksen besar di salah
// satu pojok — kombinasi dua-duanya yang bikin hero-nya nggak polos lagi.
function HeroPattern({ seed }: { seed: string }) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const variant = pickHeroPatternVariant(seed);
  const motif = HERO_MOTIFS[variant % HERO_MOTIFS.length];
  const config = HERO_PATTERN_CONFIGS[Math.floor(variant / HERO_MOTIFS.length)];
  const blob = HERO_BLOB_VARIANTS[variant % HERO_BLOB_VARIANTS.length];
  const patternId = `hero-pattern-${rawId}`;

  return (
    <>
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={patternId}
            patternUnits="userSpaceOnUse"
            width={config.tile}
            height={config.tile}
            patternTransform={`rotate(${config.rotate})`}
          >
            <HeroMotifShape motif={motif} size={config.tile} />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${patternId})`}
          opacity={0.16}
        />
      </svg>
      <div
        className={`pointer-events-none absolute ${blob.position} rounded-[40%] bg-white/10`}
        style={{ width: `${blob.size}px`, height: `${blob.size}px` }}
      />
    </>
  );
}

// 🔥 FIX (bug baru: heading/custom font-size jadi keliatan sama semua):
// Sebelumnya di sini ada class `article-preview-rich` + <style> block yang
// maksa `font-size: inherit !important` — niatnya buat "melawan" dugaan
// richTextDisplayClass ikut nyetel font-size di elemen anak. Setelah
// dicek ulang ke source aslinya (@/lib/editorHTMLUtils.ts), ternyata
// dugaan itu SALAH: richTextDisplayClass nggak pernah nyentuh font-size
// sama sekali (cuma urus list/blockquote/strong/dst). Selector
// `.article-preview-rich` di CSS itu ikut kena ke ELEMEN PEMBUNGKUSNYA
// SENDIRI (bukan cuma anak-anaknya), dan karena pakai `!important`, itu
// JUSTRU nge-timpa inline style dari getFontStyle() di elemen yang sama
// (CSS !important di stylesheet SELALU menang lawan inline style biasa,
// walau attribute style itu ditulis lebih "spesifik"). Makanya Heading 1
// (32px) ikut "diinherit-paksa" balik ke ukuran parent-nya, sama kayak
// Paragraph — itu penyebab bug "semua ukuran font sama" yang baru
// dilaporkan. Fix-nya: hapus mekanisme ini total, biar inline style dari
// getFontStyle() yang berlaku normal tanpa dilawan CSS apa pun.

interface ArticlePreviewProps {
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  categoryName: string | null;
  isRecommended: boolean;
  isPublished: boolean;
  publishing: boolean;
  canvasItems: ArticleCanvasItem[];
  headings: { instanceId: string; text: string }[];
  // 🔥 BARU — seed buat milih salah satu dari 20 kemungkinan corak
  // background hero (lihat HeroPattern) secara stabil per-artikel (pakai
  // articleId dari page.tsx). Opsional: kalau nggak dikasih, fallback ke
  // `title`.
  heroPatternSeed?: string;
  onBack: () => void;
  onEdit: () => void;
  onPublishToggle: () => void;
}

// ── Satu block konten (kanan) ───────────────────────────────────────────
function PreviewBlock({
  item,
  headings,
}: {
  item: ArticleCanvasItem;
  headings: { instanceId: string; text: string }[];
}) {
  const data = item.data;

  switch (item.id) {
    case "HEADING":
      return (
        <div
          id={item.instanceId}
          className={`${richTextDisplayClass} text-gray-900 font-bold scroll-mt-6`}
          style={getFontStyle(data?.fontType, data?.fontSize)}
          dangerouslySetInnerHTML={{
            __html: normalizeEditorHTML(data?.html) || "",
          }}
        />
      );

    case "PARAGRAPH":
      return (
        <div
          id={item.instanceId}
          className={`${richTextDisplayClass} text-gray-700 leading-relaxed scroll-mt-6`}
          style={getFontStyle(data?.fontType, data?.fontSize)}
          dangerouslySetInnerHTML={{
            __html: normalizeEditorHTML(data?.html) || "",
          }}
        />
      );

    // 🔥 FIX: desain sebelumnya (full bg hijau + teks putih) SALAH — yang
    // benar: card putih/terang, teks gelap italic, dan yang HIJAU cuma
    // aksen bar tebal di kiri yang bentuknya pill (rounded penuh di kedua
    // ujungnya), bukan nge-fill seluruh box. Lihat referensi gambar dari
    // user.
    // 🔥 FIX #2: sebelumnya pakai `absolute left-3 top-3 bottom-3` buat
    // bar hijaunya — di preview beneran itu malah kerender nempel PENUH
    // dari atas sampai bawah card (nggak ke-inset sama sekali), jadi
    // kelihatan kayak block hijau biasa, bukan pill yang "mengambang".
    // Diganti ke layout flex (bar hijau jadi elemen flex sendiri dengan
    // margin atas-bawah, bukan absolute+inset) — jauh lebih robust karena
    // tingginya otomatis ngikutin flex item lain, dan marginnya nggak
    // gampang "ketiban" style lain kayak absolute inset tadi.
    case "HIGHLIGHT":
      return (
        <div
          id={item.instanceId}
          className="scroll-mt-6 flex bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden"
        >
          <div className="w-6 bg-emerald-500 shrink-0" />
          <div className="flex-1 py-4 pr-5 pl-5 md:py-5 md:pr-6 md:pl-6">
            <div
              className={`${richTextDisplayClass} text-gray-700 italic leading-relaxed`}
              style={getFontStyle(data?.fontType, data?.fontSize)}
              dangerouslySetInnerHTML={{
                __html: normalizeEditorHTML(data?.html) || "",
              }}
            />
          </div>
        </div>
      );

    case "IMAGE": {
      if (!data?.src) return null;
      return (
        <div id={item.instanceId} className="scroll-mt-6 mx-auto">
          <div
            className="mx-auto rounded-2xl overflow-hidden"
            style={{ width: `${data.width ?? 100}%` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.src} alt="" className="w-full h-auto block" />
          </div>
        </div>
      );
    }

    case "VIDEO": {
      if (!data?.videoUrl) return null;
      const embedUrl = toEmbedUrl(data.videoUrl);
      // 🔥 FIX #1: sebelumnya videonya w-full (100% lebar kolom konten),
      // kelihatan kegedean dibanding block lain. Dikecilin dikit (92%,
      // di-center pakai mx-auto) — SAMA PERSIS pola-nya kayak box
      // thumbnail cover di atas (w-[94%] mx-auto). `aspect-video` tetap
      // dipertahankan apa adanya jadi rasio 16:9-nya nggak berubah sama
      // sekali, cuma BOX-nya yang jadi lebih sempit dikit.
      return (
        <div id={item.instanceId} className="scroll-mt-6">
          {embedUrl ? (
            <div className="relative w-[92%] mx-auto aspect-video rounded-2xl overflow-hidden bg-black">
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
              className="w-[92%] mx-auto block aspect-video rounded-2xl bg-black"
            />
          )}
        </div>
      );
    }

    case "TABLE": {
      const rows = data?.rows ?? [];
      const cols = rows[0]?.length ?? 0;
      return (
        <div id={item.instanceId} className="scroll-mt-6 overflow-x-auto">
          {/* 🔥 FIX: sebelumnya tabel di preview ini nggak punya
              `table-layout: fixed` + <colgroup>, jadi lebar kolomnya
              dihitung ulang otomatis sama browser berdasarkan isi teks
              (beda dari yang di canvas, yang udah dibikin fixed & sama
              rata) — makanya hasil preview keliatan beda sama canvas.
              Sekarang disamain persis: `tableLayout: "fixed"` +
              <colgroup> lebar sama rata per kolom.
              Border sel juga dipertegas: dari `border-gray-200` (agak
              nyaris nggak keliatan/transparan) ke `border-gray-400`
              biar garis antar baris & kolom jelas kebaca. */}
          <table
            className="w-full border-collapse text-sm"
            style={{ tableLayout: "fixed" }}
          >
            {cols > 0 && (
              <colgroup>
                {Array.from({ length: cols }).map((_, c) => (
                  <col key={c} style={{ width: `${100 / cols}%` }} />
                ))}
              </colgroup>
            )}
            <tbody>
              {rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className="border border-gray-400 px-3 py-2 align-top text-gray-700"
                    >
                      <div
                        className={`${richTextDisplayClass} break-words`}
                        style={getFontStyle(data?.fontType, data?.fontSize)}
                        dangerouslySetInnerHTML={{
                          __html: normalizeEditorHTML(cell) || "",
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

    case "LINK": {
      const linkText = data?.linkText ?? "";
      const linkType = data?.linkType ?? "external";
      const linkUrl = data?.linkUrl ?? "";
      const linkSectionId = data?.linkSectionId ?? "";
      const targetSection = headings.find(
        (h) => h.instanceId === linkSectionId,
      );
      const displayLabel =
        linkText ||
        (linkType === "section" ? targetSection?.text : linkUrl) ||
        "";
      if (!displayLabel) return null;

      if (linkType === "section") {
        return (
          <div id={item.instanceId} className="scroll-mt-6 flex justify-center">
            <a
              href={linkSectionId ? `#${linkSectionId}` : undefined}
              onClick={(e) => {
                if (!linkSectionId) return;
                e.preventDefault();
                document
                  .getElementById(linkSectionId)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex items-center gap-2 text-xl font-medium text-emerald-600 hover:underline"
            >
              <List size={18} />
              {displayLabel}
            </a>
          </div>
        );
      }
      return (
        <div id={item.instanceId} className="scroll-mt-6 flex justify-center">
          <a
            href={linkUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xl font-medium text-emerald-600 hover:underline"
          >
            <Link2 size={18} />
            {displayLabel}
          </a>
        </div>
      );
    }

    case "DIVIDER":
      return (
        <hr
          id={item.instanceId}
          style={{
            borderTopStyle: data?.dividerStyle ?? "solid",
            borderTopWidth: 1,
          }}
          className="scroll-mt-6 border-gray-300"
        />
      );

    // Table of Content nggak dirender di sini — isinya dipakai buat daftar
    // di kolom kiri (lihat TocSidebar), bukan tampil lagi di alur konten
    // kanan.
    case "TABLE_OF_CONTENT":
      return null;

    default:
      return null;
  }
}

// ── Kolom kiri: Table of Contents ───────────────────────────────────────
function TocSidebar({
  tocItem,
  headings,
  activeId,
}: {
  tocItem: ArticleCanvasItem | undefined;
  headings: { instanceId: string; text: string }[];
  activeId: string | null;
}) {
  const items: ArticleTocItem[] = tocItem?.data?.tocItems ?? [];

  const resolveLabel = (item: ArticleTocItem, idx: number) => {
    if (item.name?.trim()) return item.name;
    const section = headings.find((h) => h.instanceId === item.sectionId);
    return section?.text || `Item ${idx + 1}`;
  };

  return (
    <div className="sticky top-6 self-start">
      <p className="text-base font-bold text-gray-800 mb-4">
        Table of Contents
      </p>

      {items.length === 0 ? (
        <p className="text-xs text-gray-400 italic leading-relaxed">
          Table of Content belum diinput di canvas
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => {
            const isActive = !!item.sectionId && item.sectionId === activeId;
            return (
              <button
                key={item.id}
                type="button"
                disabled={!item.sectionId}
                onClick={() => {
                  if (!item.sectionId) return;
                  document
                    .getElementById(item.sectionId)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`flex items-start gap-2.5 text-left text-base w-full transition ${
                  isActive
                    ? "text-emerald-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                } ${!item.sectionId ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {/* 🔥 DIUBAH: SEMUA item sekarang dapat badge centang
                    (bukan cuma yang aktif) — aktif = hijau, nggak aktif =
                    abu-abu. Ukuran badge-nya (w-5 h-5 = 20px) sengaja
                    dibikin sedikit lebih besar dari ukuran font di
                    sampingnya (text-base = 16px). */}
                <span
                  className={`flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 ${
                    isActive ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                >
                  <Check size={13} strokeWidth={3} className="text-white" />
                </span>
                {/* dulu `truncate` (jadi "...") — sekarang dibiarkan wrap
                    ke bawah kalau judulnya kepanjangan, nggak dipotong. */}
                <span className="break-words">{resolveLabel(item, i)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────
export default function ArticlePreview({
  title,
  excerpt,
  coverImage,
  categoryName,
  isRecommended,
  isPublished,
  publishing,
  canvasItems,
  headings,
  heroPatternSeed,
  onBack,
  onEdit,
  onPublishToggle,
}: ArticlePreviewProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const tocItem = canvasItems.find((i) => i.id === "TABLE_OF_CONTENT");
  const tocSectionIds = (tocItem?.data?.tocItems ?? [])
    .map((t) => t.sectionId)
    .filter((id): id is string => !!id);
  const tocSectionIdsKey = tocSectionIds.join(",");

  // Scroll-spy ringan: TOC item yang sectionId-nya lagi paling atas
  // kelihatan di viewport ditandai aktif (dot jadi checkmark hijau) —
  // rootMargin -70% di bawah bikin section baru dianggap "aktif" begitu
  // dia lewatin ~30% teratas area scroll, bukan nunggu sampai bener-bener
  // penuh di layar.
  useEffect(() => {
    if (tocSectionIds.length === 0) return;
    const root = scrollContainerRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        visible.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
        );
        setActiveSectionId(visible[0].target.id);
      },
      { root, rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    tocSectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tocSectionIdsKey, canvasItems]);

  // Default-kan item pertama sebagai aktif sebelum user sempat scroll.
  useEffect(() => {
    setActiveSectionId((prev) => prev ?? tocSectionIds[0] ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tocSectionIdsKey]);

  const metaParts: string[] = [];
  if (categoryName) metaParts.push(categoryName);
  if (isRecommended) metaParts.push("Recommended Article");
  const metaLine = metaParts.join(" • ");

  const contentItems = canvasItems.filter((i) => i.id !== "TABLE_OF_CONTENT");

  return (
    <div
      className={`${jakartaSans.className} flex h-screen flex-col bg-gray-50 overflow-x-hidden`}
    >
      {/* ── TOP BAR ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b bg-white px-5 py-3 shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={onPublishToggle}
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

      {/* ── BODY ────────────────────────────────────────────────────── */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {/* 🔥 BARU: pb-8 → pb-24 — kasih napas lebih di bawah pas discroll
            sampai konten paling akhir, jadi block terakhir nggak nempel
            langsung ke tepi viewport. */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 pb-24">
          {/* Hero — sengaja nggak ada pt di container di atas, jadi box
              hijau ini langsung nempel ke border bawah top bar, nggak ada
              margin/gap di atasnya. */}
          <div className="relative overflow-hidden rounded-2xl bg-emerald-500 px-5 py-7 md:px-7 md:py-9">
            <HeroPattern seed={heroPatternSeed || title} />
            <div className="relative">
              {metaLine && (
                <p className="text-base md:text-lg font-semibold text-white/90 mb-1.5">
                  {metaLine}
                </p>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-snug">
                {title || "Tanpa judul"}
              </h1>
              {excerpt && (
                <p className="text-base md:text-lg text-white/85 mt-1 max-w-5xl">
                  {excerpt}
                </p>
              )}
            </div>
          </div>

          {/* Thumbnail — lebar sengaja dibikin sedikit lebih sempit
              (w-[94%], di-center pakai mx-auto) daripada hero di atasnya,
              biar nggak "nempel rata" persis selebar hero. Ini cuma
              ngecilin BOX-nya, bukan crop/rasio gambar aslinya — gambar di
              dalamnya tetap object-cover dengan aspect-video yang sama. */}
          <div className="mt-10">
            {coverImage ? (
              <div className="w-[94%] mx-auto aspect-video rounded-2xl overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-[94%] mx-auto aspect-video rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                <p className="text-xs text-gray-400">Belum ada thumbnail</p>
              </div>
            )}
          </div>

          {/* Konten: TOC (kiri, sempit) + isi artikel (kanan, lebar) */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
            <TocSidebar
              tocItem={tocItem}
              headings={headings}
              activeId={activeSectionId}
            />

            <div className="min-w-0">
              {contentItems.length === 0 ? (
                <p className="text-sm text-gray-400 italic">
                  Belum ada konten di canvas.
                </p>
              ) : (
                contentItems.map((item, idx) => {
                  // 🔥 BARU: jarak antar-block nggak seragam lagi. Khusus
                  // Paragraph yang PERSIS habis Heading, jaraknya dibikin
                  // lebih rapat (mt-2) — kombinasi umum "judul lalu
                  // langsung isinya" nggak perlu jarak selebar antar-block
                  // lain. Selain itu tetap mt-6 seperti biasa, block
                  // pertama nggak dikasih margin sama sekali.
                  const prevItem = contentItems[idx - 1];
                  const isTightGap =
                    !!prevItem &&
                    prevItem.id === "HEADING" &&
                    item.id === "PARAGRAPH";
                  const gapClass =
                    idx === 0 ? "" : isTightGap ? "mt-4" : "mt-6";
                  return (
                    <div key={item.instanceId} className={gapClass}>
                      <PreviewBlock item={item} headings={headings} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 🔥 BARU: penanda akhir artikel — biar pas discroll, orang yang
              lagi ngecek preview tau kontennya udah abis (bukan masih
              loading/kepotong). Cuma tampil kalau ada isinya. */}
          {contentItems.length > 0 && (
            <div className="mt-10 flex items-center justify-center gap-3 text-xs font-medium tracking-widest text-gray-300">
              <span className="h-px flex-1 max-w-16 bg-gray-200" />
              END
              <span className="h-px flex-1 max-w-16 bg-gray-200" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
