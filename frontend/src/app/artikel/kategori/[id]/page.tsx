import { Suspense } from "react";
// 🔥 Sesuaikan path import di bawah ini dengan struktur folder project kamu
import ArticleCategoryDetail from "@/components/artikel/ArticleCategoryDetail";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// 🔥 Halaman ini PUBLIK — bisa diakses siapa pun tanpa login, sama kayak
// endpoint yang dipanggil di dalamnya (GET /articles, GET /categories/:id).
export default function ArticleCategoryPage() {
  return (
    <div>
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <ArticleCategoryDetail />
      </Suspense>

      <Footer />
    </div>
  );
}