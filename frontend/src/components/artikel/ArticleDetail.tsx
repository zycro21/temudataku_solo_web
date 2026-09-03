"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus_Jakarta_Sans } from "next/font/google";
import { toast } from "sonner";
import {
  ChevronRight,
  Heart,
  MessageCircle,
  Linkedin,
  Copy,
} from "lucide-react";
import {
  ArticleDetail as ArticleDetailType,
  fetchArticleBySlug,
  formatArticleDate,
  formatCompactCount,
  getArticleLikeStatus,
  toggleArticleLike,
} from "@/components/artikel/articleApi";
import ArticleContentRenderer from "@/components/artikel/ArticleContentRenderer";
import ArticleComments from "@/components/artikel/ArticleComments";
import RelatedArticles from "@/components/artikel/RelatedArticles";
import NeedHelp from "../mentoring/NeedHelp";
import { useAuth } from "@/context/AuthContext";

// 🔥 BARU — instance font sendiri, PERSIS konfigurasinya dengan yang
// dipakai ArticlePreview.tsx admin, biar tipografi halaman publik ini
// konsisten dengan preview-nya.
const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

function isValidImageSrc(src?: string | null): src is string {
  return (
    !!src &&
    (src.startsWith("/") ||
      src.startsWith("http://") ||
      src.startsWith("https://"))
  );
}

const openWhatsApp = () => {
  window.open("https://wa.me/6285156750480", "_blank", "noopener,noreferrer");
};

// Lucide tidak menyediakan logo brand WhatsApp (Send hanya ikon panah biasa),
// jadi logo WhatsApp asli digambar manual di sini pakai currentColor supaya
// warnanya ikut className (emerald).
function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.19 0 4.25.85 5.8 2.41a8.2 8.2 0 0 1 2.41 5.83c0 4.53-3.69 8.22-8.22 8.22a8.2 8.2 0 0 1-4.16-1.13l-.3-.18-3.12.82.83-3.04-.19-.31a8.18 8.18 0 0 1-1.25-4.38c0-4.53 3.69-8.24 8.2-8.24Zm-4.6 4.62c-.15 0-.4.06-.61.29-.21.24-.8.78-.8 1.9 0 1.12.82 2.2.93 2.35.11.15 1.6 2.54 3.94 3.46 1.94.77 2.34.62 2.76.58.42-.04 1.36-.55 1.55-1.09.19-.53.19-.99.13-1.09-.06-.09-.21-.15-.44-.26-.23-.12-1.36-.67-1.57-.75-.21-.08-.36-.12-.51.12-.15.24-.59.75-.72.9-.13.15-.27.17-.5.06-.23-.12-.98-.36-1.87-1.15-.69-.61-1.16-1.37-1.29-1.6-.13-.24-.01-.36.1-.48.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.51-1.25-.71-1.7-.19-.44-.38-.38-.51-.39-.13-.01-.28-.01-.43-.01Z" />
    </svg>
  );
}

function ShareButtons({
  title,
  url,
  compact = false,
}: {
  title: string;
  url: string;
  // 🔥 BARU — versi lebih kecil buat dipasangkan sejajar dengan baris
  // kategori • tanggal di mobile (label & ikon tombolnya dikecilkan
  // supaya nggak wrap/nabrak di layar sempit). Desktop & EngagementBar
  // tetap pakai ukuran normal (default false).
  compact?: boolean;
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link artikel disalin");
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const iconBtnClass = compact ? "h-8 w-8" : "h-8 w-8";
  const iconSizeMain = compact ? 15 : 16;
  const iconSizeSmall = compact ? 13 : 14;

  const icons = (
    <>
      <a
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Bagikan lewat WhatsApp"
        className={`flex ${iconBtnClass} items-center justify-center rounded-full border border-emerald-500 bg-white text-emerald-500 transition hover:bg-emerald-50`}
      >
        <WhatsAppIcon size={iconSizeMain} />
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Bagikan lewat LinkedIn"
        className={`flex ${iconBtnClass} items-center justify-center rounded-full border border-emerald-500 bg-white text-emerald-500 transition hover:bg-emerald-50`}
      >
        <Linkedin size={iconSizeSmall} />
      </a>
      <button
        onClick={handleCopy}
        aria-label="Salin link"
        className={`flex ${iconBtnClass} items-center justify-center rounded-full border border-emerald-500 bg-white text-emerald-500 transition hover:bg-emerald-50`}
      >
        <Copy size={iconSizeSmall} />
      </button>
    </>
  );

  // 🔥 BARU — versi compact (mobile): label kecil di ATAS, tombol-tombol
  // ikon (ukuran normal, lebih besar dari sebelumnya) di baris BAWAHNYA,
  // rata kanan — sesuai contoh desain yang dikirim.
  if (compact) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <span className="text-[11px] font-medium text-gray-600">
          Bagikan Artikel:
        </span>
        <div className="flex items-center gap-2">{icons}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600">
        Bagikan Artikel:
      </span>
      {icons}
    </div>
  );
}

function EngagementBar({
  liked,
  totalLikes,
  totalComments,
  onToggleLike,
  shareTitle,
  shareUrl,
}: {
  liked: boolean;
  totalLikes: number;
  totalComments: number;
  onToggleLike: () => void;
  shareTitle: string;
  shareUrl: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleLike}
          className={`flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50 ${
            liked ? "bg-emerald-50" : ""
          }`}
        >
          <Heart size={14} className={liked ? "fill-emerald-600" : ""} />
          {formatCompactCount(totalLikes)}
        </button>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-medium text-emerald-600">
          <MessageCircle size={14} />
          {formatCompactCount(totalComments)}
        </span>
      </div>

      {/* Desktop — label & tombol share sejajar horizontal (nggak berubah) */}
      <div className="hidden md:block">
        <ShareButtons title={shareTitle} url={shareUrl} />
      </div>
      {/* 🔥 BARU — Mobile — pakai versi compact (label kecil di atas,
          tombol lebih besar di bawah), sejajar satu baris dengan
          like/comment di kiri. */}
      <div className="md:hidden">
        <ShareButtons title={shareTitle} url={shareUrl} compact />
      </div>
    </div>
  );
}

export default function ArticleDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { currentUser } = useAuth();

  const [article, setArticle] = useState<ArticleDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [liked, setLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchArticleBySlug(slug);
        if (!cancelled) {
          setArticle(result);
          setTotalLikes(result.likeCount);
        }
      } catch (err) {
        console.error("Gagal memuat artikel:", err);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!article || !currentUser) return;
    let cancelled = false;
    (async () => {
      try {
        const status = await getArticleLikeStatus(article.id);
        if (!cancelled) {
          setLiked(status.liked);
          setTotalLikes(status.totalLikes);
        }
      } catch (err) {
        console.error("Gagal memuat status like:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [article, currentUser]);

  const handleToggleLike = async () => {
    if (!article) return;
    if (!currentUser) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }
    try {
      const result = await toggleArticleLike(article.id);
      setLiked(result.liked);
      setTotalLikes(result.totalLikes);
    } catch (err) {
      console.error("Gagal like artikel:", err);
      toast.error("Gagal memproses like");
    }
  };

  if (loading) {
    return (
      <main className={`${jakartaSans.className} px-4 md:px-6 lg:px-8 py-10`}>
        <div className="max-w-5xl mx-auto animate-pulse space-y-4">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-8 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
          <div className="aspect-video w-full bg-gray-200 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (notFound || !article) {
    return (
      <main
        className={`${jakartaSans.className} px-4 md:px-6 lg:px-8 py-20 text-center`}
      >
        <p className="text-lg font-semibold text-gray-900">
          Artikel tidak ditemukan
        </p>
        <Link
          href="/artikel"
          className="mt-2 inline-block text-sm text-emerald-600 hover:underline"
        >
          Kembali ke Artikel
        </Link>
      </main>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const dateLabel = formatArticleDate(article.publishedAt ?? article.createdAt);
  const roleLabel = article.author?.roles?.join(" & ") ?? "";

  return (
    <main className={jakartaSans.className}>
      <article className="px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* 🔥 BARU — versi MOBILE (di bawah md): breadcrumb, share icon,
              badge kategori+tanggal, title, excerpt, author, lalu
              like/comment ditumpuk di bawah author (bukan sejajar kayak
              desktop), baru cover image. Dipisah total dari versi
              desktop di bawah biar urutan/layoutnya bisa diatur bebas
              tanpa resiko ganggu tampilan desktop. */}
          <div className="md:hidden">
            <nav className="text-sm leading-6 text-gray-500 pb-4 border-b border-gray-200">
              <Link href="/artikel" className="hover:text-emerald-600">
                Artikel
              </Link>
              {article.category && (
                <>
                  <ChevronRight
                    size={13}
                    className="mx-1 inline-block align-[-2px] shrink-0"
                  />
                  <Link
                    href={`/artikel/kategori/${article.category.id}`}
                    className="hover:text-emerald-600"
                  >
                    {article.category.name}
                  </Link>
                </>
              )}
              <ChevronRight
                size={13}
                className="mx-1 inline-block align-[-2px] shrink-0"
              />
              <span className="text-gray-900 font-bold">{article.title}</span>
            </nav>

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                {article.category && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                    {article.category.name}
                  </span>
                )}
                {article.category && dateLabel ? <span>•</span> : null}
                {dateLabel && <span>{dateLabel}</span>}
              </div>
              <ShareButtons title={article.title} url={shareUrl} compact />
            </div>

            <h1 className="mt-5 text-xl font-bold text-gray-900 leading-snug">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mt-2 text-sm text-gray-700">{article.excerpt}</p>
            )}

            <div className="mt-4 flex items-center gap-3">
              <div className="h-10 w-10 shrink-0">
                {isValidImageSrc(article.author?.profilePicture) ? (
                  <img
                    src={article.author.profilePicture}
                    alt={article.author?.fullName ?? "Author"}
                    className="h-10 w-10 rounded-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = "none";
                      // Tampilkan fallback
                      const parent = img.parentElement;
                      if (parent) {
                        const fallback = document.createElement("div");
                        fallback.className =
                          "h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-medium";
                        fallback.textContent =
                          article.author?.fullName?.charAt(0) ?? "?";
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-medium">
                    {article.author?.fullName?.charAt(0) ?? "?"}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {article.author?.fullName ?? "TemuDataku"}
                </p>
                {roleLabel && (
                  <p className="text-xs text-gray-400">{roleLabel}</p>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={handleToggleLike}
                className={`flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50 ${
                  liked ? "bg-emerald-50" : ""
                }`}
              >
                <Heart size={14} className={liked ? "fill-emerald-600" : ""} />
                {formatCompactCount(totalLikes)}
              </button>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-medium text-emerald-600">
                <MessageCircle size={14} />
                {formatCompactCount(article.commentCount)}
              </span>
            </div>

            {article.coverImage && (
              <div className="mt-11 aspect-video w-full overflow-hidden rounded-2xl bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Versi normal/desktop — TIDAK diubah sama sekali. */}
          <div className="hidden md:block">
            <nav className="flex items-center flex-wrap gap-1.5 text-base text-gray-500 pb-4 border-b border-gray-200">
              <Link href="/artikel" className="hover:text-emerald-600">
                Artikel
              </Link>
              {article.category && (
                <>
                  <ChevronRight size={14} />
                  <Link
                    href={`/artikel/kategori/${article.category.id}`}
                    className="hover:text-emerald-600"
                  >
                    {article.category.name}
                  </Link>
                </>
              )}
              <ChevronRight size={14} />
              <span className="text-gray-900 font-medium line-clamp-1">
                {article.title}
              </span>
            </nav>

            <div className="mt-8 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {article.category && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    {article.category.name}
                  </span>
                )}
                {article.category && dateLabel ? <span>•</span> : null}
                {dateLabel && <span>{dateLabel}</span>}
              </div>
              <ShareButtons title={article.title} url={shareUrl} />
            </div>

            <h1 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mt-2 text-base text-gray-700">{article.excerpt}</p>
            )}

            {/* Author section */}
            <div className="mt-5 flex items-center justify-between gap-3 flex-wrap border-t border-b border-gray-100 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0">
                  {isValidImageSrc(article.author?.profilePicture) ? (
                    <img
                      src={article.author.profilePicture}
                      alt={article.author?.fullName ?? "Author"}
                      className="h-10 w-10 rounded-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = "none";
                        // Tampilkan fallback
                        const parent = img.parentElement;
                        if (parent) {
                          const fallback = document.createElement("div");
                          fallback.className =
                            "h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-medium";
                          fallback.textContent =
                            article.author?.fullName?.charAt(0) ?? "?";
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-medium">
                      {article.author?.fullName?.charAt(0) ?? "?"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {article.author?.fullName ?? "TemuDataku"}
                  </p>
                  {roleLabel && (
                    <p className="text-xs text-gray-400">{roleLabel}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50 ${
                    liked ? "bg-emerald-50" : ""
                  }`}
                >
                  <Heart
                    size={14}
                    className={liked ? "fill-emerald-600" : ""}
                  />
                  {formatCompactCount(totalLikes)}
                </button>
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-medium text-emerald-600">
                  <MessageCircle size={14} />
                  {formatCompactCount(article.commentCount)}
                </span>
              </div>
            </div>

            {/* Cover Image - lebih kecil & jarak lebih jauh dari author */}
            {article.coverImage && (
              <div className="mt-8 max-w-5xl mx-auto aspect-video w-full overflow-hidden rounded-2xl bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Konten artikel - jarak lebih jauh dari thumbnail (desktop),
              tapi di mobile dipersempit karena kejauhan sama cover image
              di atasnya / table of content di dalamnya. */}
          <div className="mt-4 md:mt-20">
            <ArticleContentRenderer blocks={article.blocks} />
          </div>

          <div className="relative mt-18 overflow-hidden rounded-2xl bg-gray-100 px-6 py-4 md:px-10 md:py-6">
            <div className="flex flex-col items-center gap-0 md:flex-row md:gap-10">
              <div className="flex-1 text-left">
                <h3 className="text-3xl font-bold text-gray-900 leading-snug">
                  Ingin mendapatkan insight Data & AI lebih dalam?
                </h3>
                <p className="mt-3 text-base text-gray-500 max-w-lg">
                  Konsultasikan tujuan karier, jenjang karier, atau pertanyaan
                  seputar perjalanan yang cocok sesuai kebutuhan Anda.
                </p>
                <button
                  onClick={openWhatsApp}
                  className="mt-4 inline-block rounded-xl border border-emerald-500 bg-white px-6 py-2.5 text-base font-medium text-emerald-600 transition hover:bg-emerald-50"
                >
                  Konsultasi Gratis
                </button>
              </div>

              {/* 🔥 BARU — gambar CTA disembunyikan di mobile, cuma
                  tampil di desktop (md ke atas). */}
              <div className="hidden shrink-0 md:block">
                <Image
                  src="/assets/ggggg.svg"
                  alt="Ilustrasi konsultasi Data & AI"
                  width={800}
                  height={160}
                  className="h-auto w-52 md:w-80"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <EngagementBar
              liked={liked}
              totalLikes={totalLikes}
              totalComments={article.commentCount}
              onToggleLike={handleToggleLike}
              shareTitle={article.title}
              shareUrl={shareUrl}
            />
          </div>

          <div className="mt-8 md:mt-20 mb-30">
            <ArticleComments
              articleId={article.id}
              currentUserId={currentUser?.id}
            />
          </div>

          {article.category && (
            <div className="mb-20">
              <RelatedArticles
                categoryId={article.category.id}
                currentArticleId={article.id}
              />
            </div>
          )}
        </div>
      </article>

      {/* <NeedHelp /> */}
    </main>
  );
}
