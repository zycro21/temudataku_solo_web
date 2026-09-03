"use client";

import { useSearchParams } from "next/navigation";
import ArtikelHeroSection from "./ArtikelHeroSection";
import ArtikelSearchSection from "./ArtikelSearchSection";
import RecommendedArticles from "./RecommendedArticles";
import ArticlesByCategory from "./ArticlesByCategory";
import ArticleListResults from "./ArticleListResults";
import NeedHelp from "../mentoring/NeedHelp";

export default function Artikel() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search")?.trim() ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const categoryName = searchParams.get("categoryName") ?? "";

  // Begitu ada query "search" ATAU "categoryId" di URL (dari submit
  // pencarian, atau klik "Lihat Lebih Banyak" di section kategori),
  // section "Pilihan Bacaan" & "per Kategori" diganti sepenuhnya jadi
  // satu grid hasil (ArticleListResults) — biar nggak nampilin dua
  // tampilan homepage & hasil pencarian sekaligus yang bikin bingung.
  const isFiltering = Boolean(search || categoryId);

  return (
    <main>
      <ArtikelHeroSection />
      <ArtikelSearchSection />

      {isFiltering ? (
        <ArticleListResults
          search={search}
          categoryId={categoryId}
          categoryName={categoryName}
        />
      ) : (
        <>
          <RecommendedArticles />
          <ArticlesByCategory />
        </>
      )}

      <NeedHelp />
    </main>
  );
}
