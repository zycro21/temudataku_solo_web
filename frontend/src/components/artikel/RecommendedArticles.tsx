"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import RecommendedArticleCard from "./RecommendedArticleCard";
import {
  ArticleCardSkeleton,
  CategoryArticleCardSkeleton,
} from "./ArticleCardSkeleton";
import { ArticleListItem, fetchArticles } from "./articleApi";
import ArticleEmptyState from "./ArticleEmptyState";

// 🔥 BARU — jumlah artikel yang ditampilkan default di versi mobile
// (sebelum user klik "Lihat Lebih Banyak").
const MOBILE_DEFAULT_VISIBLE = 4;

// 🔥 DIUBAH — dulu ini "berapa artikel per halaman" (geser = ganti 3
// sekaligus). Sekarang geser cuma 1 KARTU tiap step, jadi angka ini
// dipakai buat 2 hal aja: (1) berapa banyak kartu yang KELIATAN
// bersamaan di layar (desktop), dan (2) berapa banyak clone yang perlu
// ditempel di depan/belakang buat bikin loop infinite-nya mulus.
const MAX_VISIBLE = 3;
// 🔥 BARU — seberapa jauh (dalam % lebar 1 kartu) user harus nge-drag
// sebelum dianggap "geser 1 kartu", bukan cuma klik/geser dikit doang.
const DRAG_THRESHOLD_RATIO = 0.3;

export default function RecommendedArticles() {
  const [items, setItems] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 DIUBAH — carousel infinite yang geser 1 kartu per step (bukan 1
  // halaman/3 kartu lagi), tapi tetep nampilin 3 kartu sekaligus di
  // layar (lebar tiap kartu diatur via Tailwind: w-full di HP, 1/2 di
  // tablet, 1/3 di desktop — lihat className slide di bawah).
  // `activeIndex` jalan di atas `extendedItems` (item asli + clone
  // MAX_VISIBLE item terakhir ditempel di depan & MAX_VISIBLE item
  // pertama ditempel di belakang), BUKAN langsung di atas `items` —
  // supaya pas mentok di ujung bisa "nyambung" balik ke awal/akhir tanpa
  // keliatan lompatannya (lihat handleTransitionEnd di bawah).
  const [activeIndex, setActiveIndex] = useState(MAX_VISIBLE);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [withTransition, setWithTransition] = useState(true);
  // 🔥 BARU — lebar 1 kartu (px, TERMASUK padding kiri-kanannya) diukur
  // langsung dari DOM (bukan dihitung manual pakai %), supaya tetep akurat
  // di semua breakpoint (1/2/3 kartu keliatan) tanpa perlu niru breakpoint
  // Tailwind di JS.
  const [stepWidth, setStepWidth] = useState(0);
  // 🔥 BARU — di mobile carousel diganti list turun ke bawah; state ini
  // nentuin apakah lagi nampilin semua artikel atau cuma
  // MOBILE_DEFAULT_VISIBLE item pertama.
  const [showAllMobile, setShowAllMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragInfoRef = useRef({ startX: 0, moved: false, dragging: false });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 🔥 Diambil lebih dari 3 (limit 12) — sisanya disimpan buat
        // di-page lewat drag/tombol panah, bukan sekaligus ditampilkan.
        const { items } = await fetchArticles({
          isRecommended: true,
          limit: 12,
        });
        if (!cancelled) setItems(items);
      } catch (err) {
        console.error("Gagal memuat artikel rekomendasi:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalItems = items.length;
  // Tombol geser & drag cuma aktif kalau rekomendasinya beneran lebih
  // banyak dari yang keliatan sekaligus di desktop (>3 artikel rekomendasi).
  const canSlide = !loading && totalItems > MAX_VISIBLE;
  const cloneCount = Math.min(MAX_VISIBLE, totalItems);

  // Clone MAX_VISIBLE item terakhir di depan & MAX_VISIBLE item pertama
  // di belakang, biar pas digeser lewat ujung nggak "nabrak" tembok —
  // abis transisi ke clone-nya, langsung diam-diam dipindah ke item asli
  // yang sama posisinya (tanpa animasi, jadi user nggak ngeliat
  // lompatannya) => efeknya jadi infinite loop yang mulus.
  const extendedItems = canSlide
    ? [
        ...items.slice(totalItems - cloneCount),
        ...items,
        ...items.slice(0, cloneCount),
      ]
    : items;

  // Reset posisi carousel tiap kali data artikel rekomendasi berubah,
  // biar nggak "nyangkut" di index yang udah nggak valid.
  useEffect(() => {
    setActiveIndex(MAX_VISIBLE);
    setWithTransition(false);
    setShowAllMobile(false);
    const id = requestAnimationFrame(() => setWithTransition(true));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Ukur ulang lebar 1 kartu tiap kali ukuran viewport carousel berubah
  // (misal resize window pindah breakpoint dari 3 kartu -> 1 kartu di HP).
  useEffect(() => {
    if (!canSlide) return;
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const track = trackRef.current;
      if (!track || extendedItems.length === 0) return;
      setStepWidth(track.scrollWidth / extendedItems.length);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSlide, extendedItems.length]);

  // Nggak ada rekomendasi sama sekali & udah selesai loading -> section ini
  // disembunyiin total daripada nampilin box kosong yang aneh di homepage.
  // Taruh SETELAH semua Hooks (bukan sebelumnya) supaya urutan pemanggilan
  // Hooks tetap konsisten di setiap render — return dini sebelum semua
  // Hooks selesai dideklarasikan itu melanggar Rules of Hooks.
  if (!loading && items.length === 0) {
    return (
      <section
        id="rekomendasi-artikel"
        className="px-4 md:px-8 lg:px-10 py-8 md:py-12"
      >
        <div className="max-w-6xl mx-auto">
          <ArticleEmptyState />
        </div>
      </section>
    );
  }

  const realIndex = canSlide
    ? (((activeIndex - cloneCount) % totalItems) + totalItems) % totalItems
    : 0;

  const goTo = (index: number) => {
    setWithTransition(true);
    setActiveIndex(index);
  };
  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  const handleTransitionEnd = () => {
    if (!canSlide) return;
    if (activeIndex === cloneCount - 1) {
      // Nyampe di clone slot terakhir (abis digeser mundur dari item
      // pertama) -> diam-diam lompat ke item terakhir asli (posisinya
      // sama persis secara visual).
      setWithTransition(false);
      setActiveIndex(cloneCount + totalItems - 1);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setWithTransition(true)),
      );
    } else if (activeIndex === cloneCount + totalItems) {
      // Nyampe di clone slot pertama (abis digeser maju dari item
      // terakhir) -> diam-diam lompat ke item pertama asli.
      setWithTransition(false);
      setActiveIndex(cloneCount);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setWithTransition(true)),
      );
    }
  };

  // ── Drag pakai cursor mouse (+ jari di HP) lewat Pointer Events ──
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canSlide) return;
    dragInfoRef.current = { startX: e.clientX, moved: false, dragging: true };
    setIsDragging(true);
    setWithTransition(false);
    containerRef.current?.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragInfoRef.current.dragging) return;
    const delta = e.clientX - dragInfoRef.current.startX;
    if (Math.abs(delta) > 5) dragInfoRef.current.moved = true;
    setDragOffset(delta);
  };

  const endDrag = () => {
    if (!dragInfoRef.current.dragging) return;
    dragInfoRef.current.dragging = false;

    const threshold = stepWidth * DRAG_THRESHOLD_RATIO;

    setIsDragging(false);
    setWithTransition(true);

    if (dragOffset <= -threshold) {
      setActiveIndex((i) => i + 1);
    } else if (dragOffset >= threshold) {
      setActiveIndex((i) => i - 1);
    }
    setDragOffset(0);
  };

  // Klik kartu yang "kebawa" gara-gara abis nge-drag jangan sampe ikut
  // nge-trigger navigasi (Link) ke halaman artikel.
  const handleClickCapture = (e: React.MouseEvent) => {
    if (dragInfoRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragInfoRef.current.moved = false;
    }
  };

  const baseOffsetPx = activeIndex * stepWidth;

  // 🔥 BARU — data buat versi list mobile (default 4, expand ke semua).
  const mobileVisibleItems = showAllMobile
    ? items
    : items.slice(0, MOBILE_DEFAULT_VISIBLE);
  const canExpandMobile = totalItems > MOBILE_DEFAULT_VISIBLE;

  return (
    // 🔥 DIUBAH: dikasih padding kanan-kiri (px-4 md:px-8 lg:px-10) +
    // di-center (max-w-6xl mx-auto) — sebelumnya section ini mepet penuh
    // ke tepi layar.
    <section
      id="rekomendasi-artikel"
      className="px-4 md:px-8 lg:px-10 py-8 md:py-12"
    >
      <div className="max-w-6xl mx-auto">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Rekomendasi Artikel Untuk Anda
          </h2>
          <p className="mt-1.5 text-sm md:text-base text-gray-500 max-w-4xl">
            Temukan berbagai artikel pilihan TemuDataku untuk menambah insight,
            informasi, dan perspektif baru Anda.
          </p>
        </div>

        <div className="relative mt-7 hidden sm:block">
          {canSlide && (
            <button
              onClick={goPrev}
              aria-label="Sebelumnya"
              className="absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-emerald-400 hover:text-emerald-600 md:-left-5 md:flex"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {Array.from({ length: MAX_VISIBLE }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          ) : canSlide ? (
            // 🔥 BARU — viewport carousel: overflow-hidden + bisa di-drag
            // pakai cursor (mousedown/move/up lewat Pointer Events), geser
            // 1 kartu per step tapi tetep nampilin 3 kartu sekaligus.
            <div
              ref={containerRef}
              className={`overflow-hidden select-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              style={{ touchAction: "pan-y" }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              onPointerCancel={endDrag}
              onDragStart={(e) => e.preventDefault()}
              onClickCapture={handleClickCapture}
            >
              <div
                ref={trackRef}
                className="flex"
                style={{
                  transform: `translateX(${dragOffset - baseOffsetPx}px)`,
                  transition: withTransition
                    ? "transform 300ms ease-out"
                    : "none",
                  // Sembunyiin dulu sepersekian detik sebelum stepWidth
                  // keukur, biar nggak keliatan numpuk di kiri pas awal
                  // render sebelum posisinya "pas".
                  opacity: stepWidth > 0 ? 1 : 0,
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {extendedItems.map((article, i) => (
                  <div
                    key={`${article.id}-${i}`}
                    className="w-full shrink-0 px-2.5 sm:w-1/2 md:px-3 lg:w-1/3"
                  >
                    <RecommendedArticleCard article={article} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {items.map((article) => (
                <RecommendedArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {canSlide && (
            <button
              onClick={goNext}
              aria-label="Berikutnya"
              className="absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-emerald-400 hover:text-emerald-600 md:-right-5 md:flex"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Indikator titik — satu titik per artikel, cuma muncul kalau
            ada lebih banyak artikel daripada yang keliatan sekaligus.
            Bagian dari carousel desktop/tablet, jadi disembunyikan di
            mobile juga. */}
        {canSlide && (
          <div className="mt-6 hidden flex-wrap items-center justify-center gap-1.5 sm:flex">
            {Array.from({ length: totalItems }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i + cloneCount)}
                aria-label={`Artikel ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === realIndex ? "w-5 bg-emerald-500" : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* 🔥 BARU — versi MOBILE: bukan carousel, tapi list turun ke
            bawah. Default cuma nampilin MOBILE_DEFAULT_VISIBLE (4)
            artikel, sisanya baru muncul kalau tombol "Lihat Lebih
            Banyak" ditekan (dan bisa ditutup lagi lewat "Lihat Lebih
            Sedikit"). Cuma tampil di bawah sm:. */}
        <div className="mt-7 flex flex-col gap-3 sm:hidden">
          {loading
            ? Array.from({ length: MOBILE_DEFAULT_VISIBLE }).map((_, i) => (
                <CategoryArticleCardSkeleton key={i} />
              ))
            : mobileVisibleItems.map((article) => (
                <RecommendedArticleCard key={article.id} article={article} />
              ))}
        </div>

        {!loading && canExpandMobile && (
          <div className="mt-4 flex justify-center sm:hidden">
            <button
              onClick={() => setShowAllMobile((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 text-emerald-600 text-sm font-medium px-5 py-2 transition hover:bg-emerald-50"
            >
              {showAllMobile ? (
                <>
                  <ChevronUp size={15} />
                  Lihat Lebih Sedikit
                </>
              ) : (
                <>
                  <ChevronDown size={15} />
                  Lihat Lebih Banyak
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
