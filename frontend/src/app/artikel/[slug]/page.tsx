import { Suspense } from "react";
import type { Metadata } from "next";
// 🔥 Sesuaikan path import di bawah ini dengan struktur folder project kamu
import ArticleDetail from "@/components/artikel/ArticleDetail";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchArticleBySlug } from "@/components/artikel/articleApi";

// 🔥 Ganti dengan domain production kamu, atau set env NEXT_PUBLIC_SITE_URL
// di .env — dipakai buat bikin absolute URL untuk og:url & og:image supaya
// crawler WhatsApp/LinkedIn bisa akses gambarnya.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type ArtikelDetailPageProps = {
  params: Promise<{ slug: string }>;
};

// 🔥 BARU — generateMetadata jalan di server, jadi crawler WA/LinkedIn
// (yang nggak eksekusi JS) bisa langsung baca og:title, og:description,
// dan og:image dari HTML tanpa perlu nunggu client-side fetch di
// ArticleDetail.tsx.
export async function generateMetadata({
  params,
}: ArtikelDetailPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const article = await fetchArticleBySlug(slug);
    const title = article.title;
    const description =
      article.excerpt ?? "Baca artikel seputar Data & AI di TemuDataku.";
    const url = `${SITE_URL}/artikel/${slug}`;
    const images = article.coverImage
      ? [{ url: article.coverImage }]
      : undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: "TemuDataku",
        type: "article",
        images,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: article.coverImage ? [article.coverImage] : undefined,
      },
    };
  } catch (err) {
    console.error("Gagal generate metadata artikel:", err);
    return {
      title: "Artikel - TemuDataku",
      description: "Baca artikel seputar Teknologi dan Data di TemuDataku.",
    };
  }
}

// 🔥 Halaman publik — detail artikel, bisa diakses siapa pun tanpa login
// (GET /articles/slug/:slug nggak di-guard authenticate).
export default function ArtikelDetailRoute() {
  return (
    <div>
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <ArticleDetail />
      </Suspense>

      <Footer />
    </div>
  );
}
