"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import CategoryArticleCard from "./ArticleCard";
import { CategoryArticleCardSkeleton } from "./ArticleCardSkeleton";
import {
  ArticleCategory,
  ArticleListItem,
  fetchArticleCategories,
  fetchArticles,
} from "./articleApi";

const DEFAULT_LIMIT = 6;

function CategorySection({ category }: { category: ArticleCategory }) {
  const [items, setItems] = useState<ArticleListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { items, meta } = await fetchArticles({
          categoryId: category.id,
          limit: DEFAULT_LIMIT,
        });
        if (!cancelled) {
          setItems(items);
          setTotal(meta.total);
        }
      } catch (err) {
        console.error(`Gagal memuat artikel kategori "${category.name}":`, err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category.id, category.name]);

  // Kategori yang belum punya artikel published sama sekali -> section-nya
  // disembunyiin, daripada nampilin heading kategori tapi isinya kosong.
  if (!loading && items.length === 0) return null;

  return (
    <div className="mb-12 last:mb-0">
      <h2 className="text-lg md:text-2xl font-bold text-gray-900">
        {category.name}
      </h2>
      <p className="mt-1 text-sm text-gray-500 max-w-2xl">
        {category.description ||
          `Temukan berbagai artikel pilihan seputar ${category.name}`}
      </p>

      {/* 🔥 DIUBAH: dulu grid 3 kolom (card vertikal, ArticleCard) —
          sekarang 2 KOLOM di SEMUA ukuran layar termasuk mobile (dulu
          mobile 1 kolom), pakai CategoryArticleCard versi ringkas
          (`compactMobile`) khusus di HP. */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4">
        {loading
          ? Array.from({ length: DEFAULT_LIMIT }).map((_, i) => (
              <CategoryArticleCardSkeleton key={i} compactMobile />
            ))
          : items.map((article) => (
              <CategoryArticleCard
                key={article.id}
                article={article}
                compactMobile
              />
            ))}
      </div>

      {/* 🔥 DIUBAH: dulu expand in-place (fetch semua artikel kategori ini
          & render di section ini) — sekarang pindah ke page khusus
          kategori (/artikel/kategori/[id]), sesuai desain baru. Cuma
          muncul kalau total artikel kategori ini lebih dari 6. */}
      {!loading && total > DEFAULT_LIMIT && (
        <div className="mt-6 flex justify-center">
          <Link
            href={`/artikel/kategori/${category.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 text-emerald-600 text-sm font-medium px-5 py-2 transition hover:bg-emerald-50"
          >
            <ChevronDown size={15} />
            Tampilkan Lebih Banyak
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ArticlesByCategory() {
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const categories = await fetchArticleCategories();
        if (!cancelled) setCategories(categories);
      } catch (err) {
        console.error("Gagal memuat kategori artikel:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="px-4 md:px-8 lg:px-10 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="h-6 w-56 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CategoryArticleCardSkeleton key={i} compactMobile />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="px-4 md:px-8 lg:px-10 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {categories.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
