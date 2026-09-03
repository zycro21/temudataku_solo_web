export function ArticleCardSkeleton({
  fixedWidth = false,
}: {
  fixedWidth?: boolean;
}) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-gray-100 bg-white shadow-sm ${
        fixedWidth ? "w-[260px] shrink-0 sm:w-[280px]" : "w-full"
      }`}
    >
      <div className="aspect-video w-full rounded-t-2xl bg-gray-200" />
      <div className="space-y-2.5 p-4">
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-3.5 w-full rounded bg-gray-200" />
        <div className="h-3.5 w-2/3 rounded bg-gray-200" />
        <div className="h-2.5 w-full rounded bg-gray-100" />
      </div>
    </div>
  );
}

export function ArticleEmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 py-14 text-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

// 🔥 BARU — versi skeleton HORIZONTAL (thumbnail kiri, konten kanan) dari
// sm: ke atas, buat section ArticlesByCategory & ArticleListResults yang
// pakai CategoryArticleCard (bukan ArticleCard vertikal biasa).
//
// 🔥 BARU — prop `compactMobile`, harus dipasangkan sama prop yang sama
// di CategoryArticleCard supaya bentuk skeleton match kartu aslinya:
// `true` = versi ringkas ArticlesByCategory (thumbnail atas + 2 baris
// teks), default `false` = versi ArticleListResults (thumbnail -> badge
// kategori -> title 2 baris -> author).
export function CategoryArticleCardSkeleton({
  compactMobile = false,
}: {
  compactMobile?: boolean;
}) {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
      {compactMobile ? (
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="aspect-video w-full rounded-xl bg-gray-200" />
          <div className="h-3.5 w-full rounded bg-gray-200" />
          <div className="h-3.5 w-2/3 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-200" />
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="aspect-video w-full rounded-xl bg-gray-200" />
          <div className="h-4 w-16 rounded-full bg-gray-200" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-full rounded bg-gray-200" />
            <div className="h-3.5 w-2/3 rounded bg-gray-200" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full bg-gray-200" />
            <div className="h-2.5 w-20 rounded bg-gray-100" />
          </div>
        </div>
      )}

      {/* Versi normal (sm: ke atas) — TIDAK diubah. */}
      <div className="hidden gap-4 sm:flex">
        <div className="aspect-video w-56 shrink-0 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="h-3.5 w-full rounded bg-gray-200" />
          <div className="h-3.5 w-2/3 rounded bg-gray-200" />
          <div className="h-2.5 w-full rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
