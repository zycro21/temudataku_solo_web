/**
 * articleMarkdown.ts
 *
 * SALINAN MANDIRI (bukan import) dari logic markdown-token codec yang
 * dipakai admin materials editor e-learning (lihat `markdownToHTML` /
 * `htmlToMarkdown` / `encodeFontStyleToken` / `decodeFontStyleToken` /
 * `truncateHTMLByVisibleLength` di page.tsx elearning, dan pola
 * `elearningMarkdown.ts` untuk sisi publik-nya).
 *
 * KENAPA DIDUPLIKASI, BUKAN DI-IMPORT LANGSUNG:
 * Sama persis alasannya dengan elearningMarkdown.ts — kolom `text` di
 * skema Article (headingContentSchema/paragraphContentSchema/
 * highlightContentSchema) juga cuma `String`/`Text` polos, nggak ada
 * kolom fontType/fontSize/HTML terpisah. Daripada Bold/Italic/dst hilang
 * begitu disimpan (versi sebelumnya cuma strip semua tag ke plain text),
 * kita titipkan style-nya sebagai token kecil di dalam string yang sama —
 * PERSIS pola yang sudah dipakai & terbukti jalan di elearning.
 *
 * Article adalah fitur yang skema/tabelnya terpisah total dari elearning,
 * jadi file ini SENGAJA jadi salinan independen (bukan
 * `import ... from ".../elearning/materials/page"`), biar fitur Article
 * nggak pernah punya dependency ke route admin elearning. Kalau format
 * token di elearning berubah di masa depan, file ini TIDAK otomatis
 * ikut berubah (dan sebaliknya) — itu memang tujuannya, dua fitur ini
 * independen satu sama lain meskipun kebetulan sekarang pakai konvensi
 * token yang sama persis.
 *
 * PENGGUNAAN (lihat articleContentMapper.ts):
 *   // Simpan (canvas -> payload backend):
 *   encodeFontStyleToken(fontType, fontSize) +
 *     htmlToMarkdown(normalizeEditorHTML(html))
 *
 *   // Muat (response backend -> canvas):
 *   const { fontType, fontSize, rest } = decodeFontStyleToken(text);
 *   const html = markdownToHTML(rest);
 */
import {
  FONT_PRESETS,
  FONT_TYPE_KEYS,
  FONT_TYPE_KEYS_REVERSE,
  DEFAULT_FONT_TYPE,
} from "./articleFontStyles";

// ─── Markdown → HTML ────────────────────────────────────────────────────
// Salinan persis dari markdownToHTML() elearning. Urutan replace SENGAJA
// dipertahankan sama seperti aslinya — jangan diacak urutannya.
export function markdownToHTML(md: string): string {
  if (!md) return "";

  // Jika sudah HTML (mengandung tag), kembalikan langsung
  if (/<[a-z][\s\S]*>/i.test(md)) return md;

  let html = md;

  // Font size: {fs:16}text{/fs} → <span style="font-size:16px">text</span>
  html = html.replace(
    /\{fs:(\d+)\}([\s\S]*?)\{\/fs\}/g,
    (_, size, text) => `<span style="font-size:${size}px">${text}</span>`,
  );

  // Pen color: {color:#rrggbb}text{/color}
  html = html.replace(
    /\{color:(#[0-9a-fA-F]{6})\}([\s\S]*?)\{\/color\}/g,
    (_, color, text) => `<span style="color:${color}">${text}</span>`,
  );

  // Highlight: {hl:#rrggbb}text{/hl}
  html = html.replace(
    /\{hl:(#[0-9a-fA-F]{6})\}([\s\S]*?)\{\/hl\}/g,
    (_, color, text) =>
      `<span style="background-color:${color}">${text}</span>`,
  );

  // Bold: *text*
  html = html.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");

  // Italic: ~text~
  html = html.replace(/~([^~]+)~/g, "<em>$1</em>");

  // Underline: _text_
  html = html.replace(/_([^_]+)_/g, "<u>$1</u>");

  // Strikethrough: --text--
  html = html.replace(/--([^-]+)--/g, "<s>$1</s>");

  // Alignment (untuk seluruh block): {align:center}
  html = html.replace(
    /\{align:(left|center|right|justify)\}([\s\S]*?)\{\/align\}/g,
    (_, align, text) => {
      const alignMap: Record<string, string> = {
        left: "left",
        center: "center",
        right: "right",
        justify: "justify",
      };
      return `<div style="text-align:${alignMap[align]}">${text}</div>`;
    },
  );

  // Blockquote (indent di teks biasa): {quote:40}text{/quote} — margin +
  // border:none;padding:0 disetel eksplisit persis seperti hasil browser
  // native execCommand("indent"), biar nggak kena style default blockquote
  // (garis abu-abu kiri) yang nggak ada pas aslinya.
  html = html.replace(
    /\{quote:(\d+)\}([\s\S]*?)\{\/quote\}/g,
    (_, marginPx, text) =>
      `<blockquote style="margin:0 0 0 ${marginPx}px;border:none;padding:0">${text}</blockquote>`,
  );

  // Unordered list: {ul:disc}item1|item2{/ul}
  html = html.replace(
    /\{ul:([^}]+)\}([\s\S]*?)\{\/ul\}/g,
    (_, style, content) => {
      const items = content
        .split("|")
        .map((item: string) => `<li>${item.trim()}</li>`)
        .join("");
      return `<ul style="list-style-type:${style};padding-left:24px">${items}</ul>`;
    },
  );

  // Ordered list: {ol:decimal}item1|item2{/ol}
  html = html.replace(
    /\{ol:([^}]+)\}([\s\S]*?)\{\/ol\}/g,
    (_, style, content) => {
      const items = content
        .split("|")
        .map((item: string) => `<li>${item.trim()}</li>`)
        .join("");
      return `<ol style="list-style-type:${style};padding-left:24px">${items}</ol>`;
    },
  );

  // Newline → <br>
  html = html.replace(/\n/g, "<br>");

  return html;
}

// ─── HTML → Markdown ────────────────────────────────────────────────────
// Salinan persis dari htmlToMarkdown() elearning.
export function htmlToMarkdown(html: string): string {
  if (!html) return "";

  // Jika tidak ada tag HTML, kembalikan langsung
  if (!/<[a-z][\s\S]*>/i.test(html)) return html;

  let md = html;

  // Font size
  md = md.replace(
    /<span[^>]*style="[^"]*font-size:\s*(\d+)px[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    (_, size, text) => `{fs:${size}}${htmlToMarkdown(text)}{/fs}`,
  );

  // Pen color
  md = md.replace(
    /<span[^>]*style="[^"]*color:\s*(#[0-9a-fA-F]{6})[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    (_, color, text) => `{color:${color}}${htmlToMarkdown(text)}{/color}`,
  );

  // Highlight
  md = md.replace(
    /<span[^>]*style="[^"]*background-color:\s*(#[0-9a-fA-F]{6})[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    (_, color, text) => `{hl:${color}}${htmlToMarkdown(text)}{/hl}`,
  );

  // Italic — <em> dan <i>, plus span skewX lama (backward compat)
  md = md.replace(
    /<em>([\s\S]*?)<\/em>/gi,
    (_, text) => `~${htmlToMarkdown(text)}~`,
  );
  md = md.replace(
    /<i>([\s\S]*?)<\/i>/gi,
    (_, text) => `~${htmlToMarkdown(text)}~`,
  );
  md = md.replace(
    /<span[^>]*style="[^"]*skewX[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    (_, text) => `~${text}~`,
  );

  // Bold
  md = md.replace(/<strong>([\s\S]*?)<\/strong>/gi, "*$1*");
  md = md.replace(/<b>([\s\S]*?)<\/b>/gi, "*$1*");

  // Underline
  md = md.replace(/<u>([\s\S]*?)<\/u>/gi, "_$1_");

  // Strikethrough
  md = md.replace(/<s>([\s\S]*?)<\/s>/gi, "--$1--");
  md = md.replace(/<strike>([\s\S]*?)<\/strike>/gi, "--$1--");
  md = md.replace(/<del>([\s\S]*?)<\/del>/gi, "--$1--");

  // Alignment div
  md = md.replace(
    /<div[^>]*style="[^"]*text-align:\s*(left|center|right|justify)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    (_, align, text) => `{align:${align}}${htmlToMarkdown(text)}{/align}`,
  );

  // Blockquote (hasil Indent di teks biasa) — margin-left-nya disimpan
  // supaya bisa direkonstruksi persis kayak aslinya pas di-decode nanti.
  md = md.replace(
    /<blockquote[^>]*style="[^"]*margin(?:-left)?:\s*(?:0\s+0\s+0\s+)?(\d+)px[^"]*"[^>]*>([\s\S]*?)<\/blockquote>/gi,
    (_, marginPx, text) => `{quote:${marginPx}}${htmlToMarkdown(text)}{/quote}`,
  );
  // Fallback: blockquote tanpa style margin ke-deteksi — default 40px.
  md = md.replace(
    /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,
    (_, text) => `{quote:40}${htmlToMarkdown(text)}{/quote}`,
  );

  // Unordered list — style attribute opsional, default "disc".
  md = md.replace(
    /<ul[^>]*(?:style="[^"]*list-style-type:\s*([^;}"]+)[^"]*")?[^>]*>([\s\S]*?)<\/ul>/gi,
    (_, style, content) => {
      const items = [...content.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((m) => m[1])
        .join("|");
      return `{ul:${(style ?? "disc").trim()}}${items}{/ul}`;
    },
  );

  // Ordered list — style attribute opsional, default "decimal".
  md = md.replace(
    /<ol[^>]*(?:style="[^"]*list-style-type:\s*([^;}"]+)[^"]*")?[^>]*>([\s\S]*?)<\/ol>/gi,
    (_, style, content) => {
      const items = [...content.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((m) => m[1])
        .join("|");
      return `{ol:${(style ?? "decimal").trim()}}${items}{/ol}`;
    },
  );

  // <div>/<p> polos hasil Enter di contentEditable jadi separator baris
  // ("\n"), bukan cuma <br>. Urutan penting:
  // 1. Blank-line block dulu: <div><br></div>/<p><br></p> → SATU "\n".
  md = md.replace(/<(div|p)[^>]*>\s*<br\s*\/?>\s*<\/\1>/gi, "\n");
  // 2. Sisa <div>/<p> generik (baris teks biasa hasil Enter 1x).
  md = md.replace(/<(?:div|p)[^>]*>/gi, "\n");
  md = md.replace(/<\/(?:div|p)>/gi, "");

  // br → newline
  md = md.replace(/<br\s*\/?>/gi, "\n");

  // Strip remaining tags
  md = md.replace(/<[^>]+>/g, "");

  const trimmed = md.replace(/^\n+/, "").replace(/\n+$/, "");
  md = trimmed.length > 0 ? trimmed : md;

  // Decode HTML entities
  md = md
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");

  return md;
}

// ─── Truncate HTML aman berbasis panjang teks yang KELIATAN ────────────
// Dipakai khusus buat HIGHLIGHT, yang field `text`-nya dibatasi 1250
// karakter oleh backend (highlightContentSchema). Truncate di level
// HTML/DOM (bukan string markdown hasil akhir) berdasar panjang teks yang
// KELIATAN (textContent) — supaya nggak pernah motong di tengah token
// markdown dan ninggalin closing tag yang ilang.
export function truncateHTMLByVisibleLength(
  html: string | undefined | null,
  maxLen: number,
): string {
  if (!html || maxLen <= 0) return "";
  if (typeof window === "undefined") return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<div id="__root">${html}</div>`,
    "text/html",
  );
  const root = doc.getElementById("__root");
  if (!root) return html;

  let remaining = maxLen;

  const walk = (node: Node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (remaining <= 0) {
        node.removeChild(child);
        continue;
      }
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent ?? "";
        if (text.length > remaining) {
          child.textContent = text.slice(0, remaining);
          remaining = 0;
        } else {
          remaining -= text.length;
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    }
  };

  walk(root);
  return root.innerHTML;
}

// ─── Font style (fontType + fontSize) token ─────────────────────────────
// Dititipkan sebagai token kecil di awal string `text` yang dikirim ke
// backend, contoh: `{fstyle:heading1:24}Isi teks ...`. Saat data dimuat
// ulang, token ini di-parse lalu dibuang sebelum dikonversi ke HTML.
const FSTYLE_TOKEN_REGEX = /^\{fstyle:([a-z0-9]+):(\d+)\}/;

export function encodeFontStyleToken(
  fontType?: string,
  fontSize?: number,
): string {
  const type = fontType ?? DEFAULT_FONT_TYPE;
  const preset = FONT_PRESETS[type] ?? FONT_PRESETS[DEFAULT_FONT_TYPE];
  const size = fontSize ?? preset.fontSize;
  const key = FONT_TYPE_KEYS[type] ?? FONT_TYPE_KEYS[DEFAULT_FONT_TYPE];
  return `{fstyle:${key}:${size}}`;
}

export function decodeFontStyleToken(text: string): {
  fontType: string;
  fontSize: number;
  rest: string;
} {
  const source = text ?? "";
  const match = source.match(FSTYLE_TOKEN_REGEX);
  if (!match) {
    return {
      fontType: DEFAULT_FONT_TYPE,
      fontSize: FONT_PRESETS[DEFAULT_FONT_TYPE].fontSize,
      rest: source,
    };
  }
  const [, key, sizeStr] = match;
  const fontType = FONT_TYPE_KEYS_REVERSE[key] ?? DEFAULT_FONT_TYPE;
  const preset = FONT_PRESETS[fontType] ?? FONT_PRESETS[DEFAULT_FONT_TYPE];
  const fontSize = Number(sizeStr) || preset.fontSize;
  return { fontType, fontSize, rest: source.slice(match[0].length) };
}
