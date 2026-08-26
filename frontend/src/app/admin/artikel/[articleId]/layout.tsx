// app/admin/artikel/[articleId]/layout.tsx
//
// Layout ini KOSONG — tidak me-render <html> atau <body> sendiri.
// Sidebar & navbar admin dikecualikan di AdminLayout (layout.tsx /admin)
// lewat pengecekan isFullscreenRoute(pathname) — halaman editor artikel
// butuh tampilan full-screen tanpa sidebar/navbar, sama seperti halaman
// create material e-learning.
//
// 🔥 PENTING: file AdminLayout kamu nggak ikut dikirim, jadi belum aku
// ubah langsung. Tambahkan pattern route ini ("/admin/artikel/" diikuti
// segment lain) ke fungsi isFullscreenRoute() di AdminLayout kamu, kalau
// belum otomatis ke-cover oleh pattern yang sudah ada — supaya sidebar/
// navbar admin nggak ikut nongol di halaman editor ini.
export default function ArtikelEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
