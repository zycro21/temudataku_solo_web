"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// 🔥 Sesuaikan path import ini dengan struktur folder project kamu
import CategoryArticleCard from "@/components/artikel/ArticleCard";
import { CategoryArticleCardSkeleton } from "@/components/artikel/ArticleCardSkeleton";
import {
  ArticleListItem,
  fetchArticles,
} from "@/components/artikel/articleApi";

const RELATED_LIMIT = 6;
// 🔥 BARU — jumlah maksimal item yang ditampilkan pas mode "expanded"
// (abis pencet "Tampilkan Lebih Banyak" di mobile). Dipakai buat nge-cap
// berapa banyak yang di-fetch juga (category & recommended), supaya ada
// cukup stok buat di-expand tanpa fetch ulang.
const RELATED_EXPANDED_LIMIT = 12;
// Pool artikel yang di-fetch buat fallback random — diambil lebih banyak
// dari limit tampilan (6) supaya ada cukup variasi buat diacak.
const RANDOM_POOL_LIMIT = 50;

type RelatedMode = "category" | "recommended" | "random";

// 🔥 BARU — shuffle Fisher-Yates buat fallback random (duplikat helper,
// bukan bikin util shared baru).
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function RelatedArticles({
  categoryId,
  currentArticleId,
}: {
  categoryId: string;
  currentArticleId: string;
}) {
  const [items, setItems] = useState<ArticleListItem[]>([]);
  const [mode, setMode] = useState<RelatedMode>("category");
  const [loading, setLoading] = useState(true);
  // 🔥 BARU — kontrol tombol "Tampilkan Lebih Banyak / Lebih Sedikit"
  // versi mobile. Direset tiap pindah artikel biar nggak kebawa-bawa
  // dari artikel sebelumnya.
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setExpanded(false);
      try {
        // 1) Coba kategori yang sama dulu.
        const { items: categoryItems } = await fetchArticles({
          categoryId,
          limit: RELATED_EXPANDED_LIMIT + 1,
        });
        const filteredCategory = categoryItems.filter(
          (a) => a.id !== currentArticleId,
        );

        if (filteredCategory.length > 0) {
          if (!cancelled) {
            setItems(filteredCategory.slice(0, RELATED_EXPANDED_LIMIT));
            setMode("category");
          }
          return;
        }

        // 2) Kategori ini nggak punya artikel lain — coba recommended.
        const { items: recommendedItems } = await fetchArticles({
          isRecommended: true,
          limit: RELATED_EXPANDED_LIMIT + 1,
        });
        const filteredRecommended = recommendedItems.filter(
          (a) => a.id !== currentArticleId,
        );

        if (filteredRecommended.length > 0) {
          if (!cancelled) {
            setItems(filteredRecommended.slice(0, RELATED_EXPANDED_LIMIT));
            setMode("recommended");
          }
          return;
        }

        // 3) Recommended juga kosong — fallback random dari pool artikel.
        const { items: poolItems } = await fetchArticles({
          limit: RANDOM_POOL_LIMIT,
        });
        const filteredPool = poolItems.filter((a) => a.id !== currentArticleId);

        if (!cancelled) {
          setItems(shuffleArray(filteredPool).slice(0, RELATED_EXPANDED_LIMIT));
          setMode("random");
        }
      } catch (err) {
        console.error("Gagal memuat artikel terkait:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryId, currentArticleId]);

  if (!loading && items.length === 0) return null;

  // 🔥 BARU — item yang ke-render: default cuma RELATED_LIMIT (6), abis
  // "Tampilkan Lebih Banyak" dipencet baru nampilin sampai stok yang
  // ke-fetch (maks RELATED_EXPANDED_LIMIT). Ini dipakai versi mobile;
  // versi desktop tetap 6 + link "Lihat Lebih Banyak" ke halaman kategori.
  const visibleItems = expanded ? items : items.slice(0, RELATED_LIMIT);
  const hasMoreToExpand = items.length > RELATED_LIMIT;

  return (
    <section className="mt-16">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
        Artikel Terkait
      </h2>
      <p className="mt-1 text-base md:text-lg text-gray-500 text-center">
        Temukan artikel lain yang relevan untuk memperluas wawasan Anda.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4">
        {loading
          ? Array.from({ length: RELATED_LIMIT }).map((_, i) => (
              <CategoryArticleCardSkeleton key={i} />
            ))
          : visibleItems.map((article) => (
              <CategoryArticleCard
                key={article.id}
                article={article}
                showCategoryBadge
              />
            ))}
      </div>

      {/* Desktop — link "Lihat Lebih Banyak" cuma relevan pas hasilnya
          beneran dari kategori yang sama (link-nya ke
          /artikel/kategori/[id]), nggak masuk akal ditampilin pas
          mode-nya recommended/random. Disembunyiin di mobile, diganti
          tombol expand/collapse di bawah. */}
      {!loading && mode === "category" && (
        <div className="mt-6 hidden justify-center md:flex">
          <Link
            href={`/artikel/kategori/${categoryId}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 text-emerald-600 text-sm font-medium px-5 py-2 transition hover:bg-emerald-50"
          >
            Lihat Lebih Banyak
          </Link>
        </div>
      )}

      {/* 🔥 BARU — Mobile — expand/collapse item yang udah ke-fetch di
          tempat, berlaku sama buat ketiga mode (category/recommended/
          random) karena nggak nge-link keluar kayak versi desktop. */}
      {!loading && hasMoreToExpand && (
        <div className="mt-6 flex justify-center md:hidden">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 text-emerald-600 text-sm font-medium px-5 py-2 transition hover:bg-emerald-50"
          >
            {expanded
              ? "Tampilkan Lebih Sedikit ⌃"
              : "Tampilkan Lebih Banyak ⌄"}
          </button>
        </div>
      )}
    </section>
  );
}
