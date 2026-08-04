/**
 * elearningMarkdown.ts
 *
 * SALINAN MANDIRI (bukan import) dari logic decode markdown/font-token yang
 * dipakai admin materials editor (lihat `markdownToHTML` / `decodeFontStyleToken`
 * / `FONT_PRESETS` di page.tsx & fontStyles.ts sisi admin).
 *
 * KENAPA DIDUPLIKASI, BUKAN DI-IMPORT LANGSUNG:
 * Field `text`/`comments[i]` yang dikirim balik oleh API bukan HTML mentah —
 * itu notasi token custom hasil `htmlToMarkdown()` di admin (mis.
 * `{fstyle:heading1:24}{align:center}teks *bold* ~italic~{/align}`), karena
 * skema backend cuma punya kolom `text: string` polos (lihat
 * headingContentSchema/paragraphContentSchema/highlightContentSchema —
 * tidak ada kolom fontType/fontSize/HTML terpisah).
 *
 * Sisi user (halaman publik e-learning) butuh fungsi decode yang SAMA PERSIS
 * supaya notasi token itu ke-parse benar sebelum ditampilkan — kalau tidak,
 * token mentah kayak "{align:justify}" bakal muncul apa adanya sebagai teks
 * literal di layar. Tapi supaya file admin/curdev sama sekali tidak perlu
 * disentuh atau jadi dependency publik, logic-nya disalin ke sini secara
 * independen (bukan `import ... from ".../page"` ke file editor admin).
 *
 * CATATAN PERAWATAN: kalau format token di admin (page.tsx) berubah di masa
 * depan, file ini HARUS disinkronkan manual juga — search kode ini di sini
 * setiap kali ada perubahan pada markdownToHTML/decodeFontStyleToken di sisi
 * admin.
 */

// ─── Font-type presets ──────────────────────────────────────────────────────
// Sama persis dengan FONT_PRESETS di fontStyles.ts admin — dipakai cuma buat
// resolve fontSize default per fontType saat decode token, BUKAN untuk
// mengubah tampilan (preview admin sendiri juga tidak menerapkan fontType/
// fontSize hasil decode ini ke style — lihat PreviewItem() di
// MaterialPreviewModal.tsx: heading/paragraph/highlight/summary cuma dikirim
// `html`, tanpa fontType/fontSize sama sekali). Jadi di sini nilai
// fontType/fontSize hasil decode cuma dipakai buat "melucuti" token dari teks
// — bukan buat styling.
const FONT_PRESETS: Record<string, { fontSize: number }> = {
  "Heading 1": { fontSize: 32 },
  "Heading 2": { fontSize: 24 },
  "Heading 3": { fontSize: 20 },
  Paragraph: { fontSize: 16 },
  Caption: { fontSize: 12 },
  Code: { fontSize: 14 },
};

const FONT_TYPE_KEYS_REVERSE: Record<string, string> = {
  heading1: "Heading 1",
  heading2: "Heading 2",
  heading3: "Heading 3",
  paragraph: "Paragraph",
  caption: "Caption",
  code: "Code",
};

const DEFAULT_FONT_TYPE = "Paragraph";

// ─── Font style token ────────────────────────────────────────────────────────
// Token kecil yang admin "titipkan" di awal string `text`/`comments[0]`,
// contoh: `{fstyle:heading1:24}Isi teks ...`
export const FSTYLE_TOKEN_REGEX = /^\{fstyle:([a-z0-9]+):(\d+)\}/;

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

// ─── Markdown → HTML ──────────────────────────────────────────────────────────
// Salinan persis dari markdownToHTML() admin (page.tsx). Urutan replace
// SENGAJA dipertahankan sama seperti aslinya — jangan diacak urutannya.
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
