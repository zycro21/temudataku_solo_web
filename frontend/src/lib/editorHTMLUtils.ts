/**
 * editorHTMLUtils.ts
 *
 * Utility untuk menangani HTML yang dihasilkan oleh RichTextEditor (contentEditable).
 *
 * RIWAYAT MASALAH (sudah diperbaiki, ditinggal sebagai catatan):
 *   Browser menghasilkan <div> atau <p> saat user tekan Enter di contentEditable.
 *   Blank line (Enter dua kali) menghasilkan <div><br></div> atau <p><br></p>.
 *   Dulu normalizeEditorHTML() menambahkan inline style margin-bottom: 0.75em
 *   ke setiap blank line supaya "kelihatan" di preview.
 *
 *   TERNYATA itu nggak perlu dan malah jadi BUG BARU: container preview
 *   (MaterialPreviewModal, CanvasCard mode preview) semuanya sudah pakai
 *   class `leading-relaxed` yang SAMA dengan editor (RichTextEditor). Jadi
 *   blank line itu SUDAH otomatis punya tinggi 1 baris dari line-height,
 *   identik dengan yang terlihat di canvas saat mengetik — tanpa perlu
 *   margin tambahan apa pun.
 *
 *   Begitu margin-bottom 0.75em ditambahkan DI ATAS line-height yang sudah
 *   ada itu, jaraknya numpuk: line-height (≈1 baris, sama seperti di
 *   editor) + margin 0.75em ekstra → totalnya jadi keliatan kayak 2 baris
 *   kosong padahal user cuma Enter 2x sekali. Makanya preview keliatan
 *   lebih renggang dibanding canvas edit.
 *
 * SOLUSI SEKARANG:
 *   normalizeEditorHTML() dibiarkan sebagai no-op (return HTML apa adanya).
 *   Fungsi ini tetap dipertahankan (pemanggilannya di semua komponen tidak
 *   perlu dihapus) supaya kalau suatu saat butuh normalisasi HTML lain
 *   (misal sanitasi), tinggal isi lagi di sini — TAPI jangan tambahkan
 *   margin manual ke blank line lagi, karena leading-relaxed di container
 *   preview sudah cukup dan sudah konsisten dengan editor.
 *
 * PENGGUNAAN:
 *   import { normalizeEditorHTML } from "@/lib/editorHTMLUtils";
 *   <div dangerouslySetInnerHTML={{ __html: normalizeEditorHTML(html) }} />
 */

/**
 * Saat ini fungsi ini sengaja dibuat no-op (return HTML apa adanya).
 * Blank line (Enter ganda) sudah otomatis kelihatan benar hanya dari
 * line-height container (`leading-relaxed`), yang sudah sama antara
 * canvas edit dan semua tempat preview. Jangan tambahkan margin-bottom
 * manual lagi ke sini — itu sumber bug jarak dobel yang pernah terjadi.
 */
export function normalizeEditorHTML(html: string | undefined | null): string {
  if (!html) return "";
  return html;
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
