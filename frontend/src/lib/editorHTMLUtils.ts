/**
 * editorHTMLUtils.ts
 *
 * Utility untuk menangani HTML yang dihasilkan oleh RichTextEditor (contentEditable).
 *
 * MASALAH:
 *   Browser menghasilkan <div> atau <p> saat user tekan Enter di contentEditable.
 *   Blank line (Enter dua kali) menghasilkan <div><br></div> atau <p><br></p>.
 *   Ketika di-render ulang via dangerouslySetInnerHTML tanpa CSS yang tepat,
 *   spacing antar paragraf hilang karena <div> dan <p> tidak punya margin default
 *   di dalam Tailwind (Tailwind me-reset semua margin).
 *
 * SOLUSI:
 *   normalizeEditorHTML() menambahkan inline style margin-bottom ke setiap
 *   <div> dan <p> yang merupakan direct block dari editor, sehingga blank line
 *   tetap terlihat di semua tempat preview tanpa perlu ubah CSS global.
 *
 * PENGGUNAAN:
 *   import { normalizeEditorHTML } from "@/lib/editorHTMLUtils";
 *   <div dangerouslySetInnerHTML={{ __html: normalizeEditorHTML(html) }} />
 */

/**
 * Normalize HTML dari RichTextEditor supaya blank line (Enter ganda)
 * tetap terlihat saat di-render di preview / modal.
 *
 * Yang dilakukan:
 * 1. Setiap <div> dan <p> block diberi margin-bottom: 0.75em (setara leading-relaxed).
 * 2. <div><br></div> dan <p><br></p> (blank line) tetap di-preserve — tidak dihapus.
 * 3. Tidak mengubah inline style yang sudah ada (merge, bukan replace).
 */
export function normalizeEditorHTML(html: string | undefined | null): string {
  if (!html) return "";

  // Pakai DOMParser hanya jika di browser; di SSR kembalikan as-is
  if (typeof window === "undefined") return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<div id="__root">${html}</div>`,
    "text/html",
  );
  const root = doc.getElementById("__root");
  if (!root) return html;

  // Tambah margin-bottom ke semua direct block children
  const blocks = root.querySelectorAll<HTMLElement>(":scope > div, :scope > p");

  blocks.forEach((el) => {
    // Jangan override margin yang sudah di-set
    if (!el.style.marginBottom) {
      el.style.marginBottom = "0.75em";
    }
  });

  return root.innerHTML;
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
  // Blank line preservation: div dan p tanpa margin di Tailwind
  "[&>div]:mb-3",
  "[&>p]:mb-3",
].join(" ");
