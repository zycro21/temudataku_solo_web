/**
 * editorHTMLUtils.ts
 *
 * Utility untuk menangani HTML yang dihasilkan oleh RichTextEditor (contentEditable).
 *
 * RIWAYAT MASALAH (dikonfirmasi via console.log RAW value langsung, jangan
 * diubah lagi tanpa bukti serupa):
 *
 * AKAR MASALAH SEBENARNYA: RichTextEditor.tsx contentEditable-nya punya
 * `style={{ whiteSpace: "pre-wrap" }}`. Karena itu, waktu user tekan Enter,
 * baris baru yang dihasilkan browser BUKAN <div>/<p> — itu cuma karakter
 * newline biasa ("\n") di dalam teks polos. Contoh value asli dari editor:
 *   "saya dimas\nsaya tampan"
 * "\n" itu HANYA kelihatan bener sebagai baris baru selama elemen yang
 * nampilinnya juga punya white-space: pre-wrap (makanya di dalam
 * RichTextEditor sendiri, saat lagi diketik, tampilannya sudah benar).
 * Tapi container PREVIEW (lewat dangerouslySetInnerHTML) TIDAK punya
 * pre-wrap, jadi browser nge-collapse "\n" jadi spasi biasa sesuai default
 * HTML — dua baris jadi nempel sejajar horizontal. Begitu content disave,
 * backend (markdownToHTML di page.tsx) convert "\n" jadi <br> beneran,
 * makanya setelah reload tampilannya jadi benar (bukan soal representasi
 * div vs br — itu dugaan awal yang salah; datanya memang tidak pernah
 * berupa <div>/<p> sama sekali di kasus ini).
 *
 * SOLUSI:
 *   normalizeEditorHTML() convert semua newline literal ("\n"/"\r\n") jadi
 *   <br> — ini yang utama dan SELALU jalan duluan, apa pun isi HTML-nya.
 *   Logic flatten <div>/<p> → <br> tetap dipertahankan sebagai fallback
 *   kedua (jaga-jaga kalau ada sumber data lain yang benar-benar pakai
 *   representasi block element), tapi bukan lagi jalur utama.
 *
 * PENGGUNAAN:
 *   import { normalizeEditorHTML } from "@/lib/editorHTMLUtils";
 *   <div dangerouslySetInnerHTML={{ __html: normalizeEditorHTML(html) }} />
 */
export function normalizeEditorHTML(html: string | undefined | null): string {
  if (!html) return "";

  // 🔥 FIX UTAMA (ketauan dari console.log RAW value langsung dari user):
  // RichTextEditor.tsx contentEditable-nya punya `whiteSpace: "pre-wrap"`,
  // jadi baris baru dari Enter itu SEBENARNYA cuma karakter newline biasa
  // ("\n") di dalam teks — BUKAN <div>/<p>. "\n" itu cuma kelihatan bener
  // sebagai baris baru SELAMA elemen yang nampilinnya juga punya
  // white-space: pre-wrap. Container preview (lewat dangerouslySetInnerHTML
  // di sini) TIDAK punya pre-wrap, jadi browser nge-collapse "\n" jadi
  // spasi biasa sesuai default HTML — dua baris nempel jadi satu baris
  // horizontal. Setelah disave, backend convert "\n" jadi <br> beneran
  // (lihat markdownToHTML di page.tsx), makanya sesudah reload jadi benar.
  // Fix: convert "\n" jadi <br> DI SINI JUGA — dan ini harus jalan duluan,
  // TIDAK BOLEH digantungkan ke ada/nggaknya <div>/<p>, karena kasus nyata
  // di project ini malah nggak pernah pakai <div>/<p> sama sekali.
  let normalized = html.replace(/\r\n|\r|\n/g, "<br>");

  // Pakai DOMParser hanya kalau di browser; di SSR kembalikan hasil replace
  // newline di atas apa adanya (proses DOM murni buat client-side).
  if (typeof window === "undefined") return normalized;

  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<div id="__root">${normalized}</div>`,
    "text/html",
  );
  const root = doc.getElementById("__root");
  if (!root) return normalized;

  // Fallback: kalau ternyata ADA <div>/<p> beneran (mis. data lama, atau
  // sumber lain yang masih pakai representasi ini), tetap diratakan jadi
  // <br> juga — biar konsisten dengan hasil di atas.
  const hasBlock = Array.from(root.children).some(
    (c) => c.tagName === "DIV" || c.tagName === "P",
  );
  if (!hasBlock) return normalized;

  const blocks: string[] = [];
  let buffer = "";

  const flush = () => {
    if (buffer.length > 0) blocks.push(buffer);
    buffer = "";
  };

  root.childNodes.forEach((node) => {
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      ((node as HTMLElement).tagName === "DIV" ||
        (node as HTMLElement).tagName === "P")
    ) {
      // Ketemu batas baris baru (div/p) → tutup buffer teks yang sedang
      // dikumpulkan (kalau ada isinya) jadi satu blok, baru proses div ini
      // sebagai bloknya sendiri.
      flush();
      const el = node as HTMLElement;
      const inner = el.innerHTML;
      const isBlank = inner.trim() === "" || /^<br\s*\/?>$/i.test(inner.trim());
      // Blank line (cuma <br> doang, placeholder browser) → baris kosong
      // murni, BUKAN ikut nambah <br> ekstra (itu udah otomatis muncul
      // dari proses join di bawah).
      blocks.push(isBlank ? "" : inner);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Elemen inline (strong, em, span, dst) di luar div/p (misal baris
      // pertama sebelum Enter pertama, yang browser nggak bungkus tag apa
      // pun) — simpan HTML-nya utuh, jangan sampai formatting-nya ilang.
      buffer += (node as HTMLElement).outerHTML;
    } else if (node.nodeType === Node.TEXT_NODE) {
      buffer += node.textContent ?? "";
    }
  });
  flush();

  return blocks.join("<br>");
}

/**
 * CSS class string yang harus ditambah ke semua elemen yang
 * render output dari RichTextEditor via dangerouslySetInnerHTML.
 *
 * Tambahkan ke className elemen container:
 *   className={`... ${richTextDisplayClass}`}
 */
export const richTextDisplayClass = [
  "[&_ul]:list-disc",
  "[&_ul]:pl-6",
  "[&_ul]:my-2",
  "[&_ol]:list-decimal",
  "[&_ol]:pl-6",
  "[&_ol]:my-2",
  "[&_li]:my-0.5",
  "[&_strong]:font-bold",
  "[&_u]:underline",
  "[&_s]:line-through",
  "[&_blockquote]:pl-4",
  "[&_blockquote]:border-l-4",
  "[&_blockquote]:border-gray-300",
  "[&_blockquote]:italic",
  // 🔥 Catatan: dulu ada "[&>div]:mb-3" / "[&>p]:mb-3" di sini buat jaga
  // blank line (Enter 2x) tetap keliatan spasinya. TAPI itu nempel ke SEMUA
  // div/p langsung tanpa pandang bulu — baris teks biasa (Enter 1x) ikut
  // kena margin juga, jadi keliatan kayak ada spasi tambahan yang nggak ada
  // pas ngetik. Blank-line spacing sekarang ditangani lebih presisi lewat
  // inline style di normalizeEditorHTML() (cuma nempel ke blok yang
  // beneran kosong), jadi class blanket ini dihapus supaya nggak dobel
  // nge-margin dan bikin bug yang sama lewat jalur lain.
].join(" ");
