// Daftar kategori artikel — SATU SUMBER dipakai bareng oleh ArtikelHeader
// (modal "Buat Artikel Baru") & ArtikelTable (modal "Edit Data"), supaya
// keduanya selalu sinkron dan tidak ada variasi penulisan kategori yang
// beda-beda (mis. "Tips", "tips", "Tips & Trik" ditulis 3 cara berbeda).
//
// Mau tambah / ubah / hapus kategori? Cukup edit array di bawah ini saja
// — otomatis kepakai di kedua modal.
export const ARTICLE_CATEGORIES = [
  "Berita & Pengumuman",
  "Event & Webinar",
  "Tips & Trik",
  "Tutorial",
  "Karir & Pengembangan Diri",
  "Pendidikan & Pembelajaran",
  "Teknologi",
  "Bisnis & Kewirausahaan",
  "Keuangan",
  "Kesehatan & Wellness",
  "Motivasi & Inspirasi",
  "Lainnya",
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];