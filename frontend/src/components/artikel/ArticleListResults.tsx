"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileSearch, Loader2 } from "lucide-react";
import CategoryArticleCard from "./ArticleCard";
import {
  CategoryArticleCardSkeleton,
  ArticleEmptyState,
} from "./ArticleCardSkeleton";
import { ArticleCategory, ArticleListItem, fetchArticles } from "./articleApi";

const PAGE_SIZE = 9;

// Limit besar, dipakai SEKALI di awal search cuma buat nyari tau
// kategori apa aja yang PUNYA artikel cocok sama kata kuncinya (buat
// pill filter). Bukan buat nampilin semua artikel sekaligus — listing
// utamanya tetap pakai pagination PAGE_SIZE seperti biasa.
const CATEGORY_SCAN_LIMIT = 200;

export default function ArticleListResults({
  search,
  categoryId,
  categoryName,
}: {
  search: string;
  categoryId: string;
  categoryName: string;
}) {
  const router = useRouter();
  const isSearchMode = Boolean(search);

  const [items, setItems] = useState<ArticleListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // 🔥 BARU — daftar kategori yang MUNCUL di hasil pencarian ini aja.
  // Kalau ada 5 kategori total tapi cuma 3 yang punya artikel cocok kata
  // kuncinya, pill yang ditampilkan cuma "Semua" + 3 kategori itu.
  const [availableCategories, setAvailableCategories] = useState<
    ArticleCategory[]
  >([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");

  // Scan kategori yang match kata kunci — cuma jalan di search mode, dan
  // reset pilihan filter tiap kali kata kuncinya ganti.
  useEffect(() => {
    if (!isSearchMode) {
      setAvailableCategories([]);
      return;
    }
    setActiveCategoryId("");
    let cancelled = false;
    (async () => {
      try {
        const { items: scanned } = await fetchArticles({
          search,
          limit: CATEGORY_SCAN_LIMIT,
        });
        if (cancelled) return;
        const seen = new Map<string, ArticleCategory>();
        scanned.forEach((a) => {
          if (a.category && !seen.has(a.category.id)) {
            seen.set(a.category.id, a.category);
          }
        });
        setAvailableCategories(Array.from(seen.values()));
      } catch (err) {
        console.error("Gagal memuat daftar kategori hasil pencarian:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [search, isSearchMode]);

  // Kalau lagi search, filter kategori dipegang oleh pill (activeCategoryId).
  // Kalau bukan search (misal masuk lewat "Tampilkan Lebih Banyak" di
  // section per-kategori), tetap pakai categoryId dari URL seperti semula.
  const effectiveCategoryId = isSearchMode ? activeCategoryId : categoryId;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);
    (async () => {
      try {
        const { items, meta } = await fetchArticles({
          search: search || undefined,
          categoryId: effectiveCategoryId || undefined,
          page: 1,
          limit: PAGE_SIZE,
        });
        if (!cancelled) {
          setItems(items);
          setTotalPages(meta.totalPages);
          setTotalItems(meta.total);
        }
      } catch (err) {
        console.error("Gagal memuat hasil artikel:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [search, effectiveCategoryId]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const { items: more } = await fetchArticles({
        search: search || undefined,
        categoryId: effectiveCategoryId || undefined,
        page: nextPage,
        limit: PAGE_SIZE,
      });
      setItems((prev) => [...prev, ...more]);
      setPage(nextPage);
    } catch (err) {
      console.error("Gagal memuat artikel berikutnya:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const heading = isSearchMode
    ? "Hasil Pencarian"
    : categoryName
      ? `Artikel Kategori ${categoryName}`
      : "Artikel";

  return (
    <section className="mb-26 mt-0 mx-3 sm:mx-10 px-4 md:px-8 lg:px-12 py-6 md:py-10">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/artikel"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-emerald-600 transition"
        >
          <ArrowLeft size={15} />
          Kembali ke Beranda Artikel
        </Link>

        <h2 className="mt-3 text-lg md:text-2xl font-bold text-gray-900">
          {heading}
        </h2>

        {!loading && (
          <p className="mt-1 text-sm text-gray-500">
            {isSearchMode ? (
              <>
                Menampilkan{" "}
                <span className="font-semibold text-gray-700">
                  {totalItems}
                </span>{" "}
                artikel yang sesuai dengan kata kunci yang Anda cari.
              </>
            ) : items.length > 0 ? (
              "Menampilkan artikel yang sesuai dengan pencarianmu."
            ) : (
              ""
            )}
          </p>
        )}

        {/* 🔥 BARU — pill filter kategori, cuma muncul di search mode dan
            cuma nampilin kategori yang emang punya hasil match. */}
        {isSearchMode && availableCategories.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto whitespace-nowrap pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveCategoryId("")}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                activeCategoryId === ""
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              Semua
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  activeCategoryId === cat.id
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <CategoryArticleCardSkeleton key={i} />
              ))
            : items.map((article) => (
                <CategoryArticleCard
                  key={article.id}
                  article={article}
                  showCategoryBadge={isSearchMode}
                />
              ))}
        </div>

        {!loading &&
          items.length === 0 &&
          (isSearchMode ? (
            <SearchEmptyState onClear={() => router.push("/artikel")} />
          ) : (
            <ArticleEmptyState message="Belum ada artikel di kategori ini." />
          ))}

        {!loading && page < totalPages && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-300 text-emerald-600 text-sm font-medium px-6 py-2.5 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingMore && <Loader2 size={15} className="animate-spin" />}
              {loadingMore ? "Memuat..." : "Muat Lebih Banyak"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// 🔥 BARU — empty state khusus pencarian, sesuai referensi desain: ikon
// dokumen+kaca pembesar, judul tegas, deskripsi, dan tombol buat hapus
// pencarian (balik ke /artikel tanpa query).
function SearchEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50">
        <FileSearch size={34} className="text-emerald-600" strokeWidth={1.75} />
      </div>
      <h3 className="mt-5 text-base font-semibold text-gray-800">
        Artikel Tidak Ditemukan
      </h3>
      <p className="mt-1.5 max-w-xs text-sm text-gray-500">
        Belum menemukan artikel yang sesuai dengan pencarian Anda. Coba gunakan
        kata kunci lain.
      </p>
      <button
        onClick={onClear}
        className="mt-5 rounded-full border border-emerald-300 px-5 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
      >
        Hapus Pencarian
      </button>
    </div>
  );
}
