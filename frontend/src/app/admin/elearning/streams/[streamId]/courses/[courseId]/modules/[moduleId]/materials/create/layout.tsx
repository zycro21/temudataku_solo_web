// app/admin/elearning/streams/[streamId]/courses/[courseId]/modules/[moduleId]/materials/create/layout.tsx
//
// Layout ini KOSONG — tidak me-render <html> atau <body> sendiri.
// Sidebar dan navbar sudah dikecualikan di AdminLayout (layout.tsx /admin)
// dengan pengecekan isFullscreenRoute(pathname).
// File ini tetap diperlukan agar Next.js tahu folder ini punya layout sendiri,
// tapi kerjanya hanya meneruskan children tanpa tambahan apapun.

export default function CreateMaterialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}