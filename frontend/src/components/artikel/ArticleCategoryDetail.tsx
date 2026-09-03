"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
// 🔥 Sesuaikan path import di bawah ini dengan struktur folder project kamu
import CategoryArticleCard from "@/components/artikel/ArticleCard";
import { CategoryArticleCardSkeleton } from "@/components/artikel/ArticleCardSkeleton";
import {
  ArticleCategory,
  ArticleListItem,
  fetchArticles,
  fetchCategoryById,
} from "@/components/artikel/articleApi";
import NeedHelp from "../mentoring/NeedHelp";

// 🔥 DIUBAH: 10 -> 24 per halaman
const PAGE_SIZE = 24;

export default function ArticleCategoryDetail() {
  const params = useParams<{ id: string }>();
  const categoryId = params.id;

  const [category, setCategory] = useState<ArticleCategory | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const [items, setItems] = useState<ArticleListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Ambil detail kategori buat breadcrumb & header
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchCategoryById(categoryId);
        if (!cancelled) setCategory(result);
      } catch (err) {
        console.error("Gagal memuat detail kategori:", err);
      } finally {
        if (!cancelled) setCategoryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  // Ambil artikel kategori ini, di-paginate PAGE_SIZE per halaman.
  // Reset ke halaman 1 tiap kali kata kunci pencarian berubah.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { items, meta } = await fetchArticles({
          categoryId,
          search: search || undefined,
          page,
          limit: PAGE_SIZE,
        });
        if (!cancelled) {
          setItems(items);
          setTotal(meta.total);
        }
      } catch (err) {
        console.error("Gagal memuat artikel kategori:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryId, search, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const categoryName = category?.name ?? (categoryLoading ? "" : "Kategori");
  const categoryDescription =
    category?.description ||
    (categoryName
      ? `Yuk, jelajahi kumpulan artikel menarik dengan tema ${categoryName} berikut ini`
      : "");

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <main>
      <section className="px-4 md:px-8 lg:px-10 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/artikel" className="hover:text-emerald-600">
              Artikel
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">
              {categoryLoading ? "Memuat..." : categoryName}
            </span>
          </nav>

          {/* Header + search */}
          <div className="mt-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {categoryLoading ? "Memuat..." : categoryName}
            </h1>
            {!categoryLoading && (
              <p className="mt-1.5 text-sm md:text-base text-gray-500 max-w-2xl">
                {categoryDescription}
              </p>
            )}

            <form
              onSubmit={handleSearchSubmit}
              className="mt-5 flex w-full max-w-xl items-center gap-2"
            >
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full rounded-full border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-emerald-400"
                />
                {/* 🔥 BARU — placeholder custom yang bergeser (marquee),
                    dipakai gantiin atribut `placeholder` bawaan supaya
                    teks placeholder yang kepanjangan tetap keliatan
                    penuh, terutama di layar sempit. Cuma muncul kalau
                    input kosong & lagi nggak difokus. */}
                {!searchInput && !isSearchFocused && (
                  <div className="pointer-events-none absolute inset-y-0 left-10 right-4 overflow-hidden">
                    <span className="search-placeholder-marquee absolute inset-y-0 flex items-center whitespace-nowrap text-sm text-gray-400">
                      Cari artikel yang Anda cari...
                    </span>
                  </div>
                )}
                <style>{`
                  @keyframes search-placeholder-marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                  }
                  .search-placeholder-marquee {
                    animation: search-placeholder-marquee 7s linear infinite;
                  }
                `}</style>
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600"
              >
                Cari Artikel
              </button>
            </form>
          </div>

          {/* List artikel — struktur sama kayak ArticlesByCategory.tsx */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-1 sm:gap-4 md:grid-cols-2">
            {loading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <CategoryArticleCardSkeleton key={i} />
                ))
              : items.map((article) => (
                  <CategoryArticleCard key={article.id} article={article} />
                ))}
          </div>

          {!loading && items.length === 0 && (
            <p className="mt-10 text-center text-sm text-gray-500">
              {search
                ? `Tidak ada artikel yang cocok dengan "${search}"`
                : "Belum ada artikel di kategori ini"}
            </p>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Sebelumnya"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-emerald-400 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNumber = i + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition ${
                      pageNumber === page
                        ? "bg-emerald-500 text-white"
                        : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Berikutnya"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-emerald-400 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      <NeedHelp />
    </main>
  );
}
