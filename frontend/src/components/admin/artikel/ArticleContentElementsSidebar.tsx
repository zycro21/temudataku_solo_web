"use client";

import Image from "next/image";
import {
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Heart,
  Table2,
  Minus,
  Link2,
  List,
  FileText,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

// ─── Tipe elemen konten artikel ─────────────────────────────────────────────
// Id-nya sengaja disamakan persis dengan ArticleContentBlockType di schema
// (HEADING/PARAGRAPH/HIGHLIGHT/TABLE/DIVIDER/LINK/TABLE_OF_CONTENT) plus
// IMAGE/VIDEO (dua varian dari ArticleAdditionalContentType), supaya nanti
// gampang disambungkan ke endpoint konten artikel yang sebenarnya.
export type ArticleElementId =
  | "HEADING"
  | "PARAGRAPH"
  | "IMAGE"
  | "VIDEO"
  | "TABLE"
  | "HIGHLIGHT"
  | "DIVIDER"
  | "LINK"
  | "TABLE_OF_CONTENT";

export interface ArticleContentElement {
  id: ArticleElementId;
  label: string;
  description: string;
}

// 🔥 Heading/Paragraph/Image/Video/Highlight REUSE aset SVG yang sama persis
// dengan sidebar konten e-learning (sesuai arahan — elemen ini konsepnya
// identik, jadi ikonnya nggak perlu dibuat ulang). Table/Divider/Link/
// Table of Content belum ada di aset e-learning, jadi pakai ikon lucide
// dulu (di-styling emerald biar konsisten) sebagai placeholder sampai
// dibuatkan ikon custom kalau memang dibutuhkan nanti.
const ELEMENT_ICON_SRC: Partial<Record<ArticleElementId, string>> = {
  HEADING: "/assets/admin/elearning/materials/heading.svg",
  PARAGRAPH: "/assets/admin/elearning/materials/paragraph.svg",
  IMAGE: "/assets/admin/elearning/materials/image.svg",
  VIDEO: "/assets/admin/elearning/materials/video.svg",
  HIGHLIGHT: "/assets/admin/elearning/materials/highlight.svg",
};

const LUCIDE_ICONS: Partial<
  Record<
    ArticleElementId,
    React.ComponentType<{
      size?: number;
      strokeWidth?: number;
      className?: string;
    }>
  >
> = {
  TABLE: Table2,
  DIVIDER: Minus,
  LINK: Link2,
  TABLE_OF_CONTENT: List,
};

export const ARTICLE_ELEMENTS: ArticleContentElement[] = [
  {
    id: "HEADING",
    label: "Heading",
    description: "Displays a title or heading to structure the article.",
  },
  {
    id: "PARAGRAPH",
    label: "Paragraph",
    description: "Adds body text for explanations or descriptions.",
  },
  {
    id: "IMAGE",
    label: "Image",
    description: "Inserts an image to support visual storytelling.",
  },
  {
    id: "VIDEO",
    label: "Video",
    description: "Embeds a video for richer article content.",
  },
  {
    id: "TABLE",
    label: "Table",
    description: "Present data in rows and columns.",
  },
  {
    id: "HIGHLIGHT",
    label: "Highlight",
    description: "Emphasizes important information or key messages.",
  },
  {
    id: "DIVIDER",
    label: "Divider",
    description: "Separates sections with a horizontal line.",
  },
  {
    id: "LINK",
    label: "Link",
    description: "Links text to an external URL or another section.",
  },
  {
    id: "TABLE_OF_CONTENT",
    label: "Table of Content",
    description: "Adds a jump-to list of sections in the article.",
  },
];

// ─── Preview kecil buat tooltip Image/Video (copy persis dari sidebar e-learning) ─
function ImagePreviewIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-14 h-14"
    >
      <path
        d="M8 52 L24 28 L40 44 L48 34 L56 52 Z"
        fill="white"
        fillOpacity="0.9"
      />
      <circle cx="48" cy="20" r="7" fill="white" fillOpacity="0.9" />
      <rect
        x="4"
        y="8"
        width="56"
        height="48"
        rx="6"
        stroke="white"
        strokeWidth="2.5"
        strokeOpacity="0.5"
        fill="none"
      />
    </svg>
  );
}

function VideoPreviewIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-14 h-14"
    >
      <path d="M22 16 L22 48 L50 32 Z" fill="white" fillOpacity="0.95" />
    </svg>
  );
}

const PARA_LINES = [100, 92, 96, 88, 94, 80, 90, 85, 97, 78, 93, 60];
const HIGHLIGHT_LINES = [100, 88, 94, 82, 96, 78, 90, 60];

function TooltipHeader({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="bg-gray-100 rounded-lg px-3 py-1.5 mb-2.5">
      <p className="text-[11px] font-bold text-gray-900 leading-tight">
        {label}
      </p>
      <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
        {description}
      </p>
    </div>
  );
}

// ─── Isi tooltip per elemen ──────────────────────────────────────────────────
function TooltipContent({ el }: { el: ArticleContentElement }) {
  if (el.id === "HEADING") {
    return (
      <div>
        <TooltipHeader label={el.label} description={el.description} />
        <div className="space-y-1">
          <p className="text-[15px] font-bold text-emerald-500 leading-tight">
            Heading 1
          </p>
          <p className="text-[13px] font-bold text-emerald-500 leading-tight">
            Heading 2
          </p>
          <p className="text-[11px] font-semibold text-emerald-500 leading-tight">
            Heading 3
          </p>
          <p className="text-[10px] font-semibold text-emerald-400 leading-tight">
            Heading 4
          </p>
        </div>
      </div>
    );
  }

  if (el.id === "PARAGRAPH") {
    return (
      <div>
        <TooltipHeader label={el.label} description={el.description} />
        <div className="space-y-1.5">
          {PARA_LINES.map((w, i) => (
            <div
              key={i}
              className="h-[5px] rounded-full bg-gray-200"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (el.id === "IMAGE") {
    return (
      <div>
        <TooltipHeader label={el.label} description={el.description} />
        <div className="w-full h-[120px] rounded-xl bg-emerald-500 flex items-center justify-center">
          <ImagePreviewIcon />
        </div>
      </div>
    );
  }

  if (el.id === "VIDEO") {
    return (
      <div>
        <TooltipHeader label={el.label} description={el.description} />
        <div className="w-full h-[120px] rounded-xl bg-emerald-500 flex items-center justify-center">
          <VideoPreviewIcon />
        </div>
      </div>
    );
  }

  if (el.id === "HIGHLIGHT") {
    return (
      <div>
        <TooltipHeader label={el.label} description={el.description} />
        <div className="relative px-2 py-1">
          <svg
            className="absolute -top-1 left-0"
            width="22"
            height="18"
            viewBox="0 0 22 18"
            fill="none"
          >
            <text x="0" y="16" fontSize="28" fontWeight="bold" fill="#10b981">
              "
            </text>
          </svg>
          <div className="px-5 space-y-1.5 py-1">
            {HIGHLIGHT_LINES.map((w, i) => (
              <div
                key={i}
                className="h-[4px] rounded-full bg-gray-200"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
          <svg
            className="absolute -bottom-2 right-0"
            width="22"
            height="18"
            viewBox="0 0 22 18"
            fill="none"
          >
            <text x="0" y="16" fontSize="28" fontWeight="bold" fill="#10b981">
              "
            </text>
          </svg>
        </div>
      </div>
    );
  }

  // 🔥 BARU: preview Table — elemen pertama dari kelompok "belum ada di
  // e-learning" yang dibuatkan tooltip-nya. Divider/Link/Table of Content
  // masih placeholder di bawah, disusul satu per satu berikutnya.
  if (el.id === "TABLE") {
    return (
      <div>
        <TooltipHeader label={el.label} description={el.description} />
        <div className="w-full h-[120px] rounded-xl bg-white flex items-center justify-center">
          <Table2 size={64} strokeWidth={1.4} className="text-emerald-500" />
        </div>
      </div>
    );
  }

  // 🔥 BARU: preview Table of Content — 3 baris "bullet hijau + garis hijau"
  // merepresentasikan daftar section yang bisa di-jump ke section lain.
  if (el.id === "TABLE_OF_CONTENT") {
    return (
      <div>
        <TooltipHeader label={el.label} description={el.description} />
        <div className="space-y-3 py-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <div className="h-[6px] rounded-full bg-emerald-500 flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 🔥 BARU: preview Divider — kapsul hijau (konten sebelum), garis tipis
  // (divider-nya sendiri), lalu kapsul outline (konten sesudah) — nunjukin
  // fungsi divider sebagai pemisah dua section konten.
  if (el.id === "DIVIDER") {
    return (
      <div>
        <TooltipHeader label={el.label} description={el.description} />
        <div className="space-y-2.5 py-2 px-1">
          <div className="h-6 rounded-full bg-emerald-500 w-full" />
          <div className="h-[2px] rounded-full bg-emerald-300 w-full" />
          <div className="h-6 rounded-full border-2 border-emerald-400 w-full" />
        </div>
      </div>
    );
  }

  // 🔥 BARU: preview Link — ikon halaman/dokumen dengan badge kecil ikon
  // link di pojok kanan bawah, nunjukin "link ke konten/halaman lain".
  if (el.id === "LINK") {
    return (
      <div>
        <TooltipHeader label={el.label} description={el.description} />
        <div className="w-full h-[120px] rounded-xl bg-white flex items-center justify-center">
          <div className="relative w-14 h-14">
            <FileText
              size={56}
              strokeWidth={1.4}
              className="text-emerald-500"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center">
              <Link2 size={11} strokeWidth={2.2} className="text-emerald-500" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback — cadangan kalau ada id baru yang belum dibuatkan preview-nya.
  return (
    <div>
      <TooltipHeader label={el.label} description={el.description} />
      <p className="text-[10px] text-gray-400 italic px-1 py-2 text-center">
        Preview elemen ini menyusul.
      </p>
    </div>
  );
}

// ─── Ikon di kartu sidebar (aset SVG e-learning atau ikon lucide) ───────────
function ElementIcon({ el }: { el: ArticleContentElement }) {
  const src = ELEMENT_ICON_SRC[el.id];
  if (src) {
    return (
      <div className="relative w-7 h-7 shrink-0">
        <Image
          src={src}
          alt={el.label}
          fill
          className="object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    );
  }
  const LucideIcon = LUCIDE_ICONS[el.id];
  if (LucideIcon) {
    return (
      <LucideIcon size={26} strokeWidth={1.6} className="text-emerald-500" />
    );
  }
  return null;
}

// ─── Satu kartu elemen ───────────────────────────────────────────────────────
function ElementCard({
  el,
  isFavorite,
  onToggleFavorite,
  onClick,
  sidebarRef,
}: {
  el: ArticleContentElement;
  isFavorite: boolean;
  onToggleFavorite: (id: ArticleElementId) => void;
  onClick: (el: ArticleContentElement) => void;
  sidebarRef: React.RefObject<HTMLElement | null>;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipTop, setTooltipTop] = useState(0);
  const cardRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastClickRef = useRef<number>(0);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const TOOLTIP_MAX_H = 280;
      const MARGIN = 12;
      const viewportH = window.innerHeight;
      let top = rect.top + rect.height / 2;
      if (top + TOOLTIP_MAX_H / 2 > viewportH - MARGIN)
        top = viewportH - MARGIN - TOOLTIP_MAX_H / 2;
      if (top - TOOLTIP_MAX_H / 2 < MARGIN) top = MARGIN + TOOLTIP_MAX_H / 2;
      setTooltipTop(top);
      setShowTooltip(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowTooltip(false);
  };

  const handleClick = () => {
    const now = Date.now();
    const diff = now - lastClickRef.current;
    if (diff < 300) {
      onToggleFavorite(el.id);
      lastClickRef.current = 0;
    } else {
      lastClickRef.current = now;
      setTimeout(() => {
        if (lastClickRef.current === now) {
          onClick(el);
          lastClickRef.current = 0;
        }
      }, 280);
    }
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(el.id);
  };

  const handleHeartKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.stopPropagation();
      e.preventDefault();
      onToggleFavorite(el.id);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const sidebarRight = sidebarRef.current?.getBoundingClientRect().right ?? 280;

  return (
    <>
      <button
        ref={cardRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 bg-white hover:border-emerald-400 hover:shadow-sm hover:bg-emerald-50/30 active:scale-95 transition-all duration-150 text-center w-full aspect-square"
      >
        <div
          role="button"
          tabIndex={0}
          onClick={handleHeartClick}
          onKeyDown={handleHeartKeyDown}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={`absolute top-2 right-2 p-0.5 rounded transition-all duration-150 cursor-pointer ${
            isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <Heart
            size={12}
            className={
              isFavorite
                ? "text-emerald-400 fill-emerald-400"
                : "text-gray-300 hover:text-emerald-400"
            }
          />
        </div>

        <ElementIcon el={el} />

        <span className="text-[10px] font-semibold text-gray-700 group-hover:text-emerald-700 leading-tight">
          {el.label}
        </span>
      </button>

      {showTooltip && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: sidebarRight + 12,
            top: tooltipTop,
            transform: "translateY(-50%)",
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-[220px]">
            <TooltipContent el={el} />
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -left-[6px] w-3 h-3 bg-white border-l border-b border-gray-100 rotate-45" />
        </div>
      )}
    </>
  );
}

// ─── Sidebar utama ───────────────────────────────────────────────────────────
interface ArticleContentElementsSidebarProps {
  onAddElement: (el: ArticleContentElement) => void;
}

export default function ArticleContentElementsSidebar({
  onAddElement,
}: ArticleContentElementsSidebarProps) {
  const [search, setSearch] = useState("");
  // 🔥 Beda dari sidebar e-learning (default semua tertutup) — di sini
  // "Favorite" & "Basic Content" default TERBUKA, sesuai referensi desain.
  const [favoriteOpen, setFavoriteOpen] = useState(true);
  const [basicOpen, setBasicOpen] = useState(true);
  const [favorites, setFavorites] = useState<Set<ArticleElementId>>(new Set());
  // 🔥 BARU: sidebar bisa di-minimize. Lebar dianimasikan ke 0 (bukan
  // dibuang dari DOM) supaya transisinya halus, dan tombol toggle-nya
  // mengambang setengah nempel di garis border kanan sidebar (persis pola
  // collapse yang umum dipakai di admin panel).
  const [isOpen, setIsOpen] = useState(true);
  const sidebarRef = useRef<HTMLElement>(null);

  const toggleFavorite = useCallback((id: ArticleElementId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const query = search.toLowerCase().trim();
  const favoriteElements = ARTICLE_ELEMENTS.filter((e) =>
    favorites.has(e.id),
  ).filter((e) => !query || e.label.toLowerCase().includes(query));
  const basicElements = ARTICLE_ELEMENTS.filter(
    (e) => !query || e.label.toLowerCase().includes(query),
  );

  return (
    <div className="relative h-full shrink-0 flex">
      <aside
        ref={sidebarRef}
        className={`bg-white border-r border-gray-200 flex flex-col overflow-hidden h-full transition-all duration-200 ease-in-out ${
          isOpen ? "w-64" : "w-0 border-r-0"
        }`}
      >
        {/* Lebar konten dikunci 256px biar nggak ikut menyempit/wrap pas
            kontainer di luar sedang dianimasikan ke 0 — efeknya jadi
            "slide out", bukan konten yang kepenyet dulu baru hilang. */}
        <div className="w-64 h-full flex flex-col">
          <div className="px-4 pt-4 pb-2.5 shrink-0 border-b border-gray-100">
            <h2 className="text-[13px] font-bold text-gray-900">
              Content Elements
            </h2>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
              Drag and drop elements to build your article.
            </p>
            <div className="relative mt-2.5">
              <input
                type="text"
                placeholder="Search elements ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-gray-50 placeholder-gray-400"
              />
              <Search
                size={11}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-6">
            {/* Favorite */}
            <div className="mt-1.5">
              <button
                onClick={() => setFavoriteOpen((v) => !v)}
                className="w-full flex items-start justify-between px-4 py-1.5 hover:bg-gray-50 transition"
              >
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-gray-800">
                      Favorite
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-500">
                      ({favoriteElements.length})
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">
                    Elements you use most, all in one place.
                  </p>
                </div>
                {favoriteOpen ? (
                  <ChevronDown
                    size={12}
                    className="text-gray-400 shrink-0 mt-0.5"
                  />
                ) : (
                  <ChevronRight
                    size={12}
                    className="text-gray-400 shrink-0 mt-0.5"
                  />
                )}
              </button>

              {favoriteOpen && (
                <div className="px-3 pb-1">
                  {favoriteElements.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      {favoriteElements.map((el) => (
                        <ElementCard
                          key={el.id}
                          el={el}
                          isFavorite
                          onToggleFavorite={toggleFavorite}
                          onClick={onAddElement}
                          sidebarRef={sidebarRef}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-400 italic px-1 py-1.5">
                      No favorites yet. Double click or tap ♡ on any element.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Basic Content */}
            <div className="mt-1.5">
              <button
                onClick={() => setBasicOpen((v) => !v)}
                className="w-full flex items-start justify-between px-4 py-1.5 hover:bg-gray-50 transition"
              >
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-gray-800">
                      Basic Content
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-500">
                      ({basicElements.length})
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">
                    Core elements for building learning materials.
                  </p>
                </div>
                {basicOpen ? (
                  <ChevronDown
                    size={12}
                    className="text-gray-400 shrink-0 mt-0.5"
                  />
                ) : (
                  <ChevronRight
                    size={12}
                    className="text-gray-400 shrink-0 mt-0.5"
                  />
                )}
              </button>

              {basicOpen && (
                <div className="px-3 pb-1">
                  {basicElements.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      {basicElements.map((el) => (
                        <ElementCard
                          key={el.id}
                          el={el}
                          isFavorite={favorites.has(el.id)}
                          onToggleFavorite={toggleFavorite}
                          onClick={onAddElement}
                          sidebarRef={sidebarRef}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-400 italic px-1 py-1.5">
                      No results
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* 🔥 BARU: tombol collapse/expand — mengambang setengah nempel di
          garis border sidebar, ikut geser mengikuti animasi lebar sidebar
          karena posisinya "menempel di ujung kanan" wrapper relative ini
          (bukan di dalam <aside> yang overflow-hidden). */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Minimize sidebar" : "Expand sidebar"}
        className="absolute top-1/2 -right-3 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 hover:border-emerald-300 transition-colors"
      >
        {isOpen ? (
          <ChevronLeft size={12} className="text-gray-500" />
        ) : (
          <ChevronRight size={12} className="text-gray-500" />
        )}
      </button>
    </div>
  );
}
