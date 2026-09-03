"use client";

import Link from "next/link";
import { Heart, MessageCircle, CalendarDays } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ArticleListItem,
  categoryBadgeColor,
  formatArticleDate,
  formatCompactCount,
} from "./articleApi";

// 🔥 Card KHUSUS buat section "Pengelompokan per Kategori" — layout
// HORIZONTAL (thumbnail di kiri, konten di kanan) dari sm: ke atas.
// SENGAJA dipisah dari ArticleCard.tsx (vertikal, dipakai di hasil
// pencarian) & RecommendedArticleCard.tsx (vertikal, dipakai di carousel
// Rekomendasi) biar ketiganya bisa diubah-ubah lagi nanti tanpa saling
// ganggu.
//
// 🔥 BARU — prop `showCategoryBadge`. Dipakai di halaman "Hasil
// Pencarian" (ArticleListResults) yang nampilin artikel dari BERBAGAI
// kategori sekaligus, jadi tiap card butuh label kategorinya sendiri di
// pojok kanan atas. Default-nya `false` biar section ArticlesByCategory
// (yang emang udah dikelompokkan per kategori) tetap nggak nampilin
// badge ini — di sana bakal redundan.
//
// 🔥 BARU — prop `compactMobile`. Cuma ngubah tampilan MOBILE (di bawah
// sm:), dipakai khusus di ArticlesByCategory: kartu jadi vertikal
// ringkas (thumbnail atas, judul TANPA batas baris, author di bawahnya
// — tanpa badge/excerpt/statistik), biar muat 2 kartu per baris di HP.
// Default-nya `false`, dipakai ArticleListResults, supaya tampilan
// mobile hasil pencarian TETAP SAMA seperti sebelumnya (nggak ikut
// berubah).
export default function CategoryArticleCard({
  article,
  showCategoryBadge = false,
  compactMobile = false,
}: {
  article: ArticleListItem;
  showCategoryBadge?: boolean;
  compactMobile?: boolean;
}) {
  const authorInitial = article.author?.fullName?.charAt(0) ?? "?";
  const dateLabel = formatArticleDate(article.publishedAt ?? article.createdAt);
  const categoryColor = article.category
    ? categoryBadgeColor(article.category.id)
    : null;

  return (
    <Link
      href={`/artikel/${article.slug}`}
      className="group block rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {compactMobile ? (
        // 🔥 BARU — versi MOBILE ringkas: thumbnail 16:9 di atas, judul
        // penuh tanpa clamp, author di bawahnya. Cuma tampil di bawah sm:.
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
            {article.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.coverImage}
                alt={article.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-800">
                <span className="px-1.5 text-center text-[9px] font-medium text-gray-400">
                  {article.title}
                </span>
              </div>
            )}
          </div>

          <h3 className="text-sm font-semibold leading-snug text-gray-900">
            {article.title}
          </h3>

          <div className="flex min-w-0 items-center gap-1.5">
            <Avatar className="h-5 w-5 shrink-0">
              <AvatarImage
                src={article.author?.profilePicture ?? undefined}
                alt={article.author?.fullName ?? "Author"}
              />
              <AvatarFallback className="bg-emerald-100 text-[9px] font-medium text-emerald-700">
                {authorInitial}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-xs font-medium text-gray-600">
              {article.author?.fullName ?? "TemuDataku"}
            </span>
          </div>
        </div>
      ) : (
        // Versi MOBILE (dipakai ArticleListResults) — urutan: thumbnail
        // (16:9) -> badge kategori -> title (tanpa line-clamp) -> author.
        // Excerpt & statistik sengaja nggak ditampilkan di mobile.
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-gray-100">
            {article.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.coverImage}
                alt={article.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-800">
                <span className="px-1.5 text-center text-[9px] font-medium text-gray-400">
                  {article.title}
                </span>
              </div>
            )}
          </div>

          {showCategoryBadge && article.category && categoryColor && (
            <span
              className="w-fit shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={categoryColor}
            >
              {article.category.name}
            </span>
          )}

          <h3 className="text-sm font-semibold leading-snug text-gray-900">
            {article.title}
          </h3>

          <div className="flex min-w-0 items-center gap-1.5">
            <Avatar className="h-5 w-5 shrink-0">
              <AvatarImage
                src={article.author?.profilePicture ?? undefined}
                alt={article.author?.fullName ?? "Author"}
              />
              <AvatarFallback className="bg-emerald-100 text-[9px] font-medium text-emerald-700">
                {authorInitial}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-xs font-medium text-gray-600">
              {article.author?.fullName ?? "TemuDataku"}
            </span>
          </div>
        </div>
      )}

      {/* Versi normal (sm: ke atas) — TIDAK diubah sama sekali, dipakai
          baik oleh ArticlesByCategory maupun ArticleListResults. */}
      <div className="hidden gap-4 sm:flex">
        <div className="aspect-video w-56 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {article.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-800">
              <span className="px-1.5 text-center text-[9px] font-medium text-gray-400">
                {article.title}
              </span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 items-center justify-between gap-1.5">
            <div className="flex min-w-0 items-center gap-1.5">
              <Avatar className="h-5 w-5 shrink-0">
                <AvatarImage
                  src={article.author?.profilePicture ?? undefined}
                  alt={article.author?.fullName ?? "Author"}
                />
                <AvatarFallback className="bg-emerald-100 text-[9px] font-medium text-emerald-700">
                  {authorInitial}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-xs font-medium text-gray-600">
                {article.author?.fullName ?? "TemuDataku"}
              </span>
            </div>

            {showCategoryBadge && article.category && categoryColor && (
              <span
                className="shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={categoryColor}
              >
                {article.category.name}
              </span>
            )}
          </div>

          <h3
            title={article.title}
            className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 sm:text-base"
          >
            {article.title}
          </h3>

          {article.excerpt && (
            <p
              title={article.excerpt}
              className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500"
            >
              {article.excerpt}
            </p>
          )}

          <div className="mt-auto flex items-center gap-3 pt-2 text-[11px] text-gray-400">
            {typeof article.likeCount === "number" && (
              <span className="flex items-center gap-1 font-medium text-emerald-600">
                <Heart size={12} className="fill-emerald-600" />
                {formatCompactCount(article.likeCount)}
              </span>
            )}
            {typeof article.commentCount === "number" && (
              <span className="flex items-center gap-1 font-medium text-emerald-600">
                <MessageCircle size={12} className="fill-emerald-600" />
                {formatCompactCount(article.commentCount)}
              </span>
            )}
            {dateLabel && (
              <span className="ml-auto flex items-center gap-1 whitespace-nowrap">
                <CalendarDays size={12} />
                {dateLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
