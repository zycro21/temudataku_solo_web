"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ArtikelSearchSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Kalau lagi buka halaman ini dari hasil pencarian sebelumnya (misal
  // habis nge-refresh), input-nya langsung keisi query yang lagi aktif.
  const [query, setQuery] = useState(searchParams.get("search") ?? "");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/artikel?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section id="cari-artikel" className="px-3 md:px-5 lg:px-6 py-8 md:py-12">
      {/* 🔥 DIUBAH: max-w-5xl → max-w-6xl (lebih lebar), bg-emerald-50 →
          bg-emerald-100 (lebih pekat, lebih dekat ke referensi — emerald-50
          sebelumnya kelihatan terlalu pucat/nyaris putih), dan padding +
          semua ukuran teks/elemen di dalamnya dinaikkan satu tingkat biar
          section ini kerasa lebih "besar" secara keseluruhan, bukan cuma
          lebih lebar doang. */}
      <div className="max-w-6xl mx-auto rounded-3xl bg-emerald-100 px-6 py-12 md:px-14 md:py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Cari Artikel yang Anda Butuhkan
        </h2>
        <p className="mt-3 text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          Temukan artikel yang relevan dengan mudah lewat pencarian berdasarkan
          judul atau kata kunci.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col sm:flex-row items-stretch gap-3 max-w-2xl mx-auto"
        >
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari artikel yang ingin Anda baca..."
              className="w-full h-14 rounded-xl border border-gray-200 bg-white pl-12 pr-4 text-base text-gray-700 placeholder:text-transparent sm:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />

            {/* 🔥 BARU — placeholder BERJALAN khusus mobile. Placeholder
                asli disembunyikan (placeholder:text-transparent) di bawah
                sm: karena teksnya kepanjangan buat lebar input di HP &
                kepotong; diganti teks yang jalan (marquee) ini. Cuma
                muncul kalau input masih kosong, dan otomatis hilang dari
                sm: ke atas (placeholder normal dipakai lagi seperti
                semula, TIDAK diubah). */}
            {query.length === 0 && (
              <div className="pointer-events-none absolute inset-y-0 left-12 right-4 flex items-center overflow-hidden sm:hidden">
                <span className="artikel-search-marquee whitespace-nowrap text-base text-gray-400">
                  Cari artikel yang ingin Anda baca...
                </span>
              </div>
            )}
          </div>
          <Button
            type="submit"
            className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-medium px-8 hover:cursor-pointer"
          >
            Cari Artikel
          </Button>
        </form>
      </div>

      {/* 🔥 BARU — keyframes buat placeholder berjalan di mobile (lihat
          `.artikel-search-marquee` di atas). */}
      <style>{`
        .artikel-search-marquee {
          display: inline-block;
          animation: artikel-search-marquee 9s linear infinite;
        }
        @keyframes artikel-search-marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-120%);
          }
        }
      `}</style>
    </section>
  );
}
