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

// 🔥 Card KHUSUS buat section "Pilihan Bacaan Untuk Anda" (Recommended) —
// SENGAJA dipisah dari ArticleCard.tsx (yang tetap dipakai di per-Kategori
// & hasil pencarian) karena strukturnya emang beda dari sononya (lebih
// besar, badge kategori berwarna, avatar lebih gede) — biar nanti kalau
// salah satu mau diubah lagi nggak saling ganggu satu sama lain.
export default function RecommendedArticleCard({
  article,
}: {
  article: ArticleListItem;
}) {
  const authorInitial = article.author?.fullName?.charAt(0) ?? "?";
  const dateLabel = formatArticleDate(article.publishedAt ?? article.createdAt);

  return (
    <Link
      href={`/artikel/${article.slug}`}
      className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* 🔥 BARU — versi MOBILE: card horizontal ringkas (thumbnail 16:9
          di kiri, di kanannya cuma badge kategori + judul + author dari
          atas ke bawah). Cuma tampil di bawah sm:; dari sm: ke atas
          disembunyikan & versi lengkap di bawah yang dipakai. */}
      <div className="flex gap-3 p-3 sm:hidden">
        <div className="aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {article.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-800">
              <span className="px-1.5 text-center text-[9px] font-medium text-gray-400">
                {article.title}
              </span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          {article.category && (
            <span
              className="w-fit shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={categoryBadgeColor(article.category.id)}
            >
              {article.category.name}
            </span>
          )}
          <h3 className="text-sm font-bold leading-snug text-gray-900">
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
      </div>

      {/* Versi normal (sm: ke atas) — TIDAK diubah sama sekali. */}
      <div className="hidden h-full flex-col sm:flex">
        {/* Cover — SELALU di atas, konten di bawahnya */}
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          {article.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-800">
              <span className="px-4 text-center text-sm font-medium text-gray-400">
                {article.title}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          {/* Author + kategori */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage
                  src={article.author?.profilePicture ?? undefined}
                  alt={article.author?.fullName ?? "Author"}
                />
                <AvatarFallback className="bg-emerald-100 text-xs font-medium text-emerald-700">
                  {authorInitial}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-sm font-medium text-gray-700">
                {article.author?.fullName ?? "TemuDataku"}
              </span>
            </div>

            {article.category && (
              <span
                className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
                style={categoryBadgeColor(article.category.id)}
              >
                {article.category.name}
              </span>
            )}
          </div>

          {/* Judul & excerpt */}
          <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug text-gray-900">
            {article.title}
          </h3>
          {article.excerpt && (
            <p
              title={article.excerpt}
              className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500"
            >
              {article.excerpt}
            </p>
          )}

          {/* Statistik (like + komentar) & tanggal */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400">
            <div className="flex items-center gap-3">
              {typeof article.likeCount === "number" && (
                <span className="flex items-center gap-1 font-medium text-emerald-600">
                  <Heart size={14} className="fill-emerald-600" />
                  {formatCompactCount(article.likeCount)}
                </span>
              )}
              {typeof article.commentCount === "number" && (
                <span className="flex items-center gap-1 font-medium text-emerald-600">
                  <MessageCircle size={14} className="fill-emerald-600" />
                  {formatCompactCount(article.commentCount)}
                </span>
              )}
            </div>
            {dateLabel && (
              <span className="flex items-center gap-1">
                <CalendarDays size={13} />
                {dateLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
