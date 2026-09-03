// ═══════════════════════════════════════════════════════════════════════════
// articleContentMapper.ts
// ─────────────────────────────────────────────────────────────────────────
// Jembatan antara representasi canvas di FE (`ArticleCanvasItem[]`, dipakai
// ArticleCanvasCard/ArticleStylePanel) dan bentuk payload/response yang
// dipahami backend (`PUT /articles/:id/content` & `GET
// /articles/:id/content/blocks`).
//
// ─── Strategi block ─────────────────────────────────────────────────────
// Backend memodelkan 1 ArticleBlock bisa berisi BANYAK `contents` +
// `additionalContents` sekaligus (buat kasus kayak "gambar nempel di
// tengah 1 paragraf panjang"). Tapi builder UI kita saat ini nggak punya
// konsep "nempelin" antar elemen kayak gitu — tiap elemen di canvas
// (Heading/Paragraph/Image/dst) berdiri sendiri sebagai 1 baris di
// daftar. Jadi kita pakai mapping paling sederhana & robust: SATU canvas
// item = SATU ArticleBlock (orderNumber = posisinya di canvas + 1), isi
// `contents: [ITU]` untuk elemen teks/table/link/divider/TOC, atau
// `additionalContents: [ITU]` (position: "INLINE") untuk Image/Video.
// Urutan tetap persis sama karena orderNumber block-nya berurutan.
//
// ─── Strategi `key` (Link & Table of Content target) ───────────────────
// Endpoint ini FULL-REPLACE — semua block dibuat ulang dari nol tiap kali
// Save, jadi ID asli di DB belum ada saat payload disusun. Makanya tiap
// content/media diberi `key` = `instanceId` milik canvas item itu sendiri
// (unik, stabil selama sesi edit). Link/TOC lalu nunjuk pakai
// `targetKey: <instanceId heading/section yang dituju>`.
// Setelah hydrate dari server (lihat mapBlocksResponseToCanvasItems di
// bawah), `instanceId` diisi ulang pakai ID content block/media ASLI dari
// DB — jadi tetap valid dipakai sebagai `key` lagi di save berikutnya,
// tanpa perlu tabel mapping terpisah.
//
// ─── Rich text ↔ markdown-token string ──────────────────────────────────
// Kolom `text` di Heading/Paragraph/Highlight di backend itu String/Text
// POLOS (bukan HTML) — sama persis kondisinya kayak di e-learning. Supaya
// Bold/Italic/dst dari toolbar Style tetap kesimpan (bukan cuma kepakai
// buat tampilan doang), kita pakai skema yang SAMA PERSIS dengan yang
// sudah dipakai & terbukti jalan di elearning: titipkan formatting
// sebagai token kecil di dalam string itu sendiri, contoh:
//   {fstyle:heading1:24}Isi *bold* dan ~italic~ di sini
// Lihat articleMarkdown.ts (salinan mandiri dari codec elearning, dengan
// alasan kenapa disalin bukan di-import ada di komentar file itu) buat
// implementasi encode/decode-nya.
// ═══════════════════════════════════════════════════════════════════════

import {
  ARTICLE_ELEMENTS,
  type ArticleContentElement,
  type ArticleElementId,
} from "./ArticleContentElementsSidebar";
import {
  type ArticleCanvasItem,
  type ArticleTocItem,
} from "./ArticleCanvasCard";
import {
  encodeFontStyleToken,
  decodeFontStyleToken,
  markdownToHTML,
  htmlToMarkdown,
  truncateHTMLByVisibleLength,
} from "./articleMarkdown";
import { normalizeEditorHTML } from "@/lib/editorHTMLUtils";

// ─── Text <-> HTML helpers ──────────────────────────────────────────────

// Ambil teks polos dari HTML rich text — dipakai buat keperluan yang
// BUKAN penyimpanan (label heading di panel Style/TOC-target dropdown,
// dan cek "apakah field ini kosong" di validateArticleContentBeforeSave).
// Beda dari versi paling awal yang cuma strip tag mentah-mentah (bikin
// "saya\nadalah" jadi "sayaadalah" nempel tanpa spasi) — di sini batas
// block (</div>, </p>, <br>) diganti "\n" dulu SEBELUM sisa tag dibuang.
// CATATAN: fungsi ini TIDAK dipakai lagi buat nyimpen `text` ke backend —
// untuk itu pakai encodeFontStyleToken + htmlToMarkdown (lihat di bawah),
// supaya formatting Bold/Italic/dst ikut kesimpan, bukan dibuang.
export function htmlToPlainText(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function elementTemplate(id: ArticleElementId): ArticleContentElement {
  return (
    ARTICLE_ELEMENTS.find((e) => e.id === id) ?? {
      id,
      label: id,
      description: "",
    }
  );
}

function resolveMediaUrl(url?: string | null): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("blob:")) return url;
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`;
}

// Heading di canvas cuma punya 3 preset (Heading 1/2/3, lewat dropdown
// Font Type) sementara backend nerima level 1-6 di field `level`. Field
// itu dipakai buat semantik struktur heading-nya sendiri (bukan buat
// styling — styling dibaca dari token {fstyle:...} di dalam `text`, lihat
// mapBlocksResponseToCanvasItems), jadi nggak perlu fungsi kebalikannya.
function fontTypeToHeadingLevel(fontType?: string): 1 | 2 | 3 | 4 | 5 | 6 {
  if (fontType === "Heading 1") return 1;
  if (fontType === "Heading 2") return 2;
  return 3;
}

// ─── Bentuk response GET /articles/:id/content/blocks ──────────────────
// (subset field yang kita butuh — longgar sengaja, backend boleh
// ngembaliin field lain yang nggak dipakai di sini)

export interface ArticleContentBlockResponse {
  id: string;
  type:
    | "HEADING"
    | "PARAGRAPH"
    | "HIGHLIGHT"
    | "TABLE"
    | "DIVIDER"
    | "LINK"
    | "TABLE_OF_CONTENT";
  orderNumber: number | null;
  headingContent?: { level: number; text: string } | null;
  paragraphContent?: { text: string } | null;
  highlightContent?: { text: string } | null;
  dividerContent?: { style: "SOLID" | "DASHED" } | null;
  linkContent?: {
    linkText: string;
    linkType: "EXTERNAL_URL" | "ARTICLE_SECTION";
    externalUrl: string | null;
    targetContentBlockId: string | null;
    targetAdditionalContentId: string | null;
  } | null;
  tableContent?: {
    columns: { id: string; header: string; orderNumber: number }[];
    rows: {
      id: string;
      orderNumber: number;
      cells: { id: string; columnId: string; value: string | null }[];
    }[];
  } | null;
  tableOfContentContent?: {
    items: {
      id: string;
      label: string;
      orderNumber: number;
      targetContentBlockId: string | null;
      targetAdditionalContentId: string | null;
    }[];
  } | null;
}

export interface ArticleAdditionalContentResponse {
  id: string;
  type: "IMAGE_VIDEO";
  position: "BEFORE" | "AFTER" | "INLINE";
  orderNumber: number | null;
  imageVideo?: {
    url: string;
    mediaType: "IMAGE" | "VIDEO";
    widthPercent: number | null;
  } | null;
}

export interface ArticleBlockResponse {
  id: string;
  orderNumber: number | null;
  contentBlocks: ArticleContentBlockResponse[];
  additionalContents: ArticleAdditionalContentResponse[];
}

// ═══════════════════════════════════════════════════════════════════════
// ── mapBlocksResponseToCanvasItems ──────────────────────────────────────
// GET response -> ArticleCanvasItem[] (buat hydrate canvas pas halaman
// edit dibuka / setelah Save berhasil).
// ═══════════════════════════════════════════════════════════════════════
export function mapBlocksResponseToCanvasItems(
  blocks: ArticleBlockResponse[],
): ArticleCanvasItem[] {
  const items: ArticleCanvasItem[] = [];
  const sortedBlocks = [...blocks].sort(
    (a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0),
  );

  for (const block of sortedBlocks) {
    for (const content of block.contentBlocks ?? []) {
      const base = { instanceId: content.id };

      switch (content.type) {
        case "HEADING": {
          // fontType/fontSize prioritaskan dari token {fstyle:...} di
          // dalam text (lebih presisi — bisa nyimpen fontSize custom hasil
          // override manual), field `level` (1-6, wajib di skema) dipakai
          // buat semantik struktur heading-nya sendiri, bukan buat style.
          const { fontType, fontSize, rest } = decodeFontStyleToken(
            content.headingContent?.text ?? "",
          );
          items.push({
            ...elementTemplate("HEADING"),
            ...base,
            data: { fontType, fontSize, html: markdownToHTML(rest) },
          });
          break;
        }
        case "PARAGRAPH": {
          const { fontType, fontSize, rest } = decodeFontStyleToken(
            content.paragraphContent?.text ?? "",
          );
          items.push({
            ...elementTemplate("PARAGRAPH"),
            ...base,
            data: { fontType, fontSize, html: markdownToHTML(rest) },
          });
          break;
        }
        case "HIGHLIGHT": {
          const { fontType, fontSize, rest } = decodeFontStyleToken(
            content.highlightContent?.text ?? "",
          );
          items.push({
            ...elementTemplate("HIGHLIGHT"),
            ...base,
            data: { fontType, fontSize, html: markdownToHTML(rest) },
          });
          break;
        }
        case "DIVIDER": {
          items.push({
            ...elementTemplate("DIVIDER"),
            ...base,
            data: {
              dividerStyle:
                content.dividerContent?.style === "DASHED" ? "dashed" : "solid",
            },
          });
          break;
        }
        case "TABLE": {
          const table = content.tableContent;
          if (!table) break;
          const cols = [...table.columns].sort(
            (a, b) => a.orderNumber - b.orderNumber,
          );
          const rowsSorted = [...table.rows].sort(
            (a, b) => a.orderNumber - b.orderNumber,
          );
          // Sel tabel TIDAK dititipin token {fstyle:...} (satu tabel belum
          // ada konsep font-type per-sel di UI), tapi tetap lewat
          // markdownToHTML biar Bold/Italic/dst di dalam sel tetap kebawa.
          const headerRow = cols.map((c) => markdownToHTML(c.header));
          const dataRows = rowsSorted.map((row) => {
            const byCol = new Map(row.cells.map((c) => [c.columnId, c.value]));
            return cols.map((c) => markdownToHTML(byCol.get(c.id) ?? ""));
          });
          items.push({
            ...elementTemplate("TABLE"),
            ...base,
            data: { rows: [headerRow, ...dataRows] },
          });
          break;
        }
        case "LINK": {
          const link = content.linkContent;
          if (!link) break;
          items.push({
            ...elementTemplate("LINK"),
            ...base,
            data: {
              linkText: link.linkText,
              linkType:
                link.linkType === "EXTERNAL_URL" ? "external" : "section",
              linkUrl: link.externalUrl ?? "",
              linkSectionId: link.targetContentBlockId ?? "",
            },
          });
          break;
        }
        case "TABLE_OF_CONTENT": {
          const toc = content.tableOfContentContent;
          if (!toc) break;
          const tocItems: ArticleTocItem[] = [...toc.items]
            .sort((a, b) => a.orderNumber - b.orderNumber)
            .map((it) => ({
              id: it.id,
              name: it.label,
              sectionId: it.targetContentBlockId ?? "",
            }));
          items.push({
            ...elementTemplate("TABLE_OF_CONTENT"),
            ...base,
            data: { tocItems },
          });
          break;
        }
      }
    }

    for (const additional of block.additionalContents ?? []) {
      const media = additional.imageVideo;
      if (!media) continue;
      if (media.mediaType === "IMAGE") {
        items.push({
          ...elementTemplate("IMAGE"),
          instanceId: additional.id,
          data: {
            src: resolveMediaUrl(media.url),
            width: media.widthPercent ?? 100,
          },
        });
      } else {
        items.push({
          ...elementTemplate("VIDEO"),
          instanceId: additional.id,
          data: { videoUrl: resolveMediaUrl(media.url) },
        });
      }
    }
  }

  return items;
}

// ═══════════════════════════════════════════════════════════════════════
// ── validateArticleContentBeforeSave ────────────────────────────────────
// Validasi ringan di FE sebelum request ditembak, mirror constraint Zod
// backend yang paling gampang dilanggar tanpa sadar lewat UI (field
// wajib kosong / target Link-Section belum dipilih) — biar user dapet
// pesan error yang jelas, bukan raw 400 dari server.
// ═══════════════════════════════════════════════════════════════════════
export function validateArticleContentBeforeSave(
  canvasItems: ArticleCanvasItem[],
): string | null {
  // 🔥 FIX: dulu di sini cuma nampung instanceId elemen HEADING, padahal
  // Link ("Article Section") dan Table of Content sekarang boleh nunjuk
  // ke elemen APA AJA (Paragraph/Image/Video/dst — lihat headings di
  // page.tsx & SectionSelect di ArticleCanvasCard.tsx yang sudah
  // dibebaskan dari batasan itu). Validator ini ketinggalan, jadi masih
  // nolak target selain Heading dan muncul error palsu ("belum memilih
  // section/heading tujuan yang valid") padahal user SUDAH milih target
  // yang valid (cuma bukan Heading). Satu-satunya elemen yang memang
  // TIDAK boleh jadi target adalah TABLE_OF_CONTENT itu sendiri (bukan
  // "section" konten, cuma daftar navigasi).
  const validSectionInstanceIds = new Set(
    canvasItems
      .filter((i) => i.id !== "TABLE_OF_CONTENT")
      .map((i) => i.instanceId),
  );

  for (let idx = 0; idx < canvasItems.length; idx++) {
    const item = canvasItems[idx];
    const pos = idx + 1;

    if (item.id === "HEADING" || item.id === "PARAGRAPH") {
      if (!htmlToPlainText(item.data?.html).trim()) {
        return `${item.id === "HEADING" ? "Heading" : "Paragraph"} ke-${pos} masih kosong — isi teksnya dulu sebelum disimpan.`;
      }
    }

    if (item.id === "LINK") {
      const d = item.data;
      if (!d?.linkText?.trim()) {
        return `Link ke-${pos} belum diisi teksnya.`;
      }
      if (d.linkType === "external") {
        if (!d.linkUrl?.trim()) {
          return `Link ke-${pos} ("${d.linkText}") belum diisi URL tujuannya.`;
        }
      } else {
        if (!d.linkSectionId || !validSectionInstanceIds.has(d.linkSectionId)) {
          return `Link ke-${pos} ("${d.linkText}") belum memilih section/heading tujuan yang valid.`;
        }
      }
    }

    if (item.id === "TABLE_OF_CONTENT") {
      const tocItems = item.data?.tocItems ?? [];
      if (tocItems.length === 0) {
        return `Table of Content ke-${pos} minimal harus punya 1 item.`;
      }
      for (const tocItem of tocItems) {
        if (!tocItem.name.trim()) {
          return `Ada item di Table of Content ke-${pos} yang namanya masih kosong.`;
        }
        if (
          !tocItem.sectionId ||
          !validSectionInstanceIds.has(tocItem.sectionId)
        ) {
          return `Item "${tocItem.name}" di Table of Content ke-${pos} belum memilih section/heading tujuan yang valid.`;
        }
      }
    }
  }

  // Satu artikel maksimal 1 Table of Content (constraint unik di DB).
  const tocCount = canvasItems.filter(
    (i) => i.id === "TABLE_OF_CONTENT",
  ).length;
  if (tocCount > 1) {
    return "Satu artikel cuma boleh punya 1 Table of Content — hapus salah satunya dulu.";
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════
// ── buildArticleContentFormData ─────────────────────────────────────────
// ArticleCanvasItem[] -> FormData siap kirim ke
// PUT /articles/:id/content (multipart/form-data: field `blocks` = JSON
// string, field `mediaFiles` = file binary sesuai urutan kemunculan
// image/video yang isNewUpload=true di dalam `blocks`).
//
// Panggil validateArticleContentBeforeSave() dulu sebelum ini kalau mau
// nampilin pesan error yang ramah — fungsi ini sendiri nggak validasi
// ulang (biar single source of truth ada di satu tempat).
// ═══════════════════════════════════════════════════════════════════════
export function buildArticleContentFormData(
  canvasItems: ArticleCanvasItem[],
): FormData {
  const blocks: Record<string, unknown>[] = [];
  const mediaFiles: File[] = [];

  canvasItems.forEach((item, idx) => {
    const orderNumber = idx + 1;
    const key = item.instanceId;
    const d = item.data;

    switch (item.id) {
      case "HEADING": {
        blocks.push({
          orderNumber,
          contents: [
            {
              type: "heading",
              key,
              level: fontTypeToHeadingLevel(d?.fontType),
              text:
                encodeFontStyleToken(d?.fontType, d?.fontSize) +
                htmlToMarkdown(normalizeEditorHTML(d?.html ?? "")),
              orderNumber: 1,
            },
          ],
        });
        break;
      }
      case "PARAGRAPH": {
        blocks.push({
          orderNumber,
          contents: [
            {
              type: "paragraph",
              key,
              text:
                encodeFontStyleToken(d?.fontType, d?.fontSize) +
                htmlToMarkdown(normalizeEditorHTML(d?.html ?? "")),
              orderNumber: 1,
            },
          ],
        });
        break;
      }
      case "HIGHLIGHT": {
        const fstyleToken = encodeFontStyleToken(d?.fontType, d?.fontSize);
        // Total text (token + isi) tetap harus <= 1250 karakter (limit
        // backend, highlightContentSchema). Truncate berbasis TEKS YANG
        // KELIATAN dulu di level HTML (truncateHTMLByVisibleLength — jaga
        // formatting/alignment/list tetap valid & closed), BARU
        // diserialize ke markdown — bukan slice string markdown hasil
        // akhir yang bisa motong di tengah token & ninggalin closing tag
        // ilang. Sama persis pola yang dipakai elearning.
        const maxContentLength = Math.max(0, 1250 - fstyleToken.length);
        let serialized = "";
        let textBudget = maxContentLength;
        for (let attempt = 0; attempt < 6 && textBudget >= 0; attempt++) {
          const truncatedHTML = truncateHTMLByVisibleLength(
            normalizeEditorHTML(d?.html ?? ""),
            textBudget,
          );
          serialized = htmlToMarkdown(truncatedHTML);
          if (serialized.length <= maxContentLength) break;
          const overshoot = serialized.length - maxContentLength;
          textBudget = Math.max(0, textBudget - overshoot);
        }
        blocks.push({
          orderNumber,
          contents: [
            {
              type: "highlight",
              key,
              text: fstyleToken + serialized,
              orderNumber: 1,
            },
          ],
        });
        break;
      }
      case "DIVIDER": {
        blocks.push({
          orderNumber,
          contents: [
            {
              type: "divider",
              key,
              style: d?.dividerStyle === "dashed" ? "DASHED" : "SOLID",
              orderNumber: 1,
            },
          ],
        });
        break;
      }
      case "TABLE": {
        const rows = d?.rows ?? [];
        const headerRow = rows[0] ?? [];
        const bodyRows = rows.slice(1);
        blocks.push({
          orderNumber,
          contents: [
            {
              type: "table",
              key,
              orderNumber: 1,
              // Sel tabel TIDAK dititipin token {fstyle:...} (belum ada
              // konsep font-type per-sel/per-tabel di UI), tapi tetap
              // lewat htmlToMarkdown biar Bold/Italic/dst di dalam sel
              // ikut kesimpan, bukan dibuang kayak sebelumnya.
              columns: headerRow.map((cell, i) => {
                const md = htmlToMarkdown(normalizeEditorHTML(cell));
                return { header: md.trim() || `Column ${i + 1}` };
              }),
              rows: bodyRows.map((row) => ({
                cells: row.map((cell) =>
                  htmlToMarkdown(normalizeEditorHTML(cell)),
                ),
              })),
            },
          ],
        });
        break;
      }
      case "LINK": {
        const isExternal = d?.linkType === "external";
        blocks.push({
          orderNumber,
          contents: [
            {
              type: "link",
              key,
              orderNumber: 1,
              linkText: d?.linkText ?? "",
              linkType: isExternal ? "external_url" : "article_section",
              ...(isExternal
                ? { externalUrl: d?.linkUrl }
                : { targetKey: d?.linkSectionId }),
            },
          ],
        });
        break;
      }
      case "TABLE_OF_CONTENT": {
        const tocItems = d?.tocItems ?? [];
        blocks.push({
          orderNumber,
          contents: [
            {
              type: "table_of_content",
              key,
              orderNumber: 1,
              items: tocItems.map((it, i) => ({
                label: it.name,
                orderNumber: i + 1,
                targetKey: it.sectionId,
              })),
            },
          ],
        });
        break;
      }
      case "IMAGE": {
        const isNewUpload = !!d?._file;
        if (isNewUpload && d?._file) mediaFiles.push(d._file);
        blocks.push({
          orderNumber,
          additionalContents: [
            {
              type: "image_video",
              key,
              position: "INLINE",
              isNewUpload,
              content: {
                mediaType: "IMAGE",
                widthPercent: d?.width ?? 100,
                ...(isNewUpload ? {} : { url: d?.src }),
              },
            },
          ],
        });
        break;
      }
      case "VIDEO": {
        const isNewUpload = !!d?._file;
        if (isNewUpload && d?._file) mediaFiles.push(d._file);
        blocks.push({
          orderNumber,
          additionalContents: [
            {
              type: "image_video",
              key,
              position: "INLINE",
              isNewUpload,
              content: {
                mediaType: "VIDEO",
                ...(isNewUpload ? {} : { url: d?.videoUrl }),
              },
            },
          ],
        });
        break;
      }
      default:
        break;
    }
  });

  const formData = new FormData();
  formData.append("blocks", JSON.stringify(blocks));
  mediaFiles.forEach((file) => formData.append("mediaFiles", file));
  return formData;
}
