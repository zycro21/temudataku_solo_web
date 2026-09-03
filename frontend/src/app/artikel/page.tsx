import { Suspense } from "react";
import Artikel from "@/components/artikel/Artikel";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// 🔥 Sama kayak halaman /practice: dipaksa dynamic karena section
// "Rekomendasi" & "Pengelompokan per Kategori" di bawah fetch data
// artikel publik langsung dari API tiap kali halaman ini diakses (bukan
// konten statis yang aman di-cache/prerender saat build).
export const dynamic = "force-dynamic";

// 🔥 Halaman ini PUBLIK — bisa diakses siapa pun tanpa login, sama
// seperti endpoint-endpoint yang dipanggil di dalamnya (GET /articles,
// GET /categories, dst — semuanya nggak lewat middleware `authenticate`
// di articles.route.ts).
export default function ArtikelPage() {
  return (
    <div>
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>

      {/* 🔥 "Artikel" adalah orchestrator component (nyusun Hero,
          Pencarian, Rekomendasi, Pengelompokan per Kategori, dan
          NeedHelp di dalamnya) — persis pola "Elearning.tsx" di contoh
          yang kamu kasih. Komponen ini & semua section di dalamnya
          bakal dibuat di langkah berikutnya. */}
      <Suspense fallback={<div>Loading...</div>}>
        <Artikel />
      </Suspense>

      <Footer />
    </div>
  );
}