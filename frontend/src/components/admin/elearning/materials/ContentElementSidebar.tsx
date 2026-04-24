"use client";

import Image from "next/image";
import { Search, ChevronDown, ChevronRight, Heart } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

export interface ContentElement {
  id: string;
  iconSrc: string;
  label: string;
  description: string;
  category: "basic" | "structuring" | "interactive";
  favorite?: boolean;
}

interface Category {
  key: "favorite" | "basic" | "structuring" | "interactive";
  label: string;
  description: string;
}

export const ALL_ELEMENTS: ContentElement[] = [
  {
    id: "heading",
    iconSrc: "/assets/admin/elearning/materials/heading.svg",
    label: "Heading",
    description: "Displays a title or heading to structure the material.",
    category: "basic",
    favorite: false,
  },
  {
    id: "paragraph",
    iconSrc: "/assets/admin/elearning/materials/paragraph.svg",
    label: "Paragraph",
    description: "Adds body text for explanations or descriptions.",
    category: "basic",
    favorite: false,
  },
  {
    id: "image",
    iconSrc: "/assets/admin/elearning/materials/image.svg",
    label: "Image",
    description: "Inserts an image to support visual learning.",
    category: "basic",
    favorite: false,
  },
  {
    id: "video",
    iconSrc: "/assets/admin/elearning/materials/video.svg",
    label: "Video",
    description: "Embeds a video for richer learning content.",
    category: "basic",
    favorite: false,
  },
  {
    id: "accordion",
    iconSrc: "/assets/admin/elearning/materials/accordion.svg",
    label: "Accordion",
    description: "Organizes content into collapsible sections.",
    category: "structuring",
    favorite: false,
  },
  {
    id: "carousel",
    iconSrc: "/assets/admin/elearning/materials/carousel.svg",
    label: "Carousel",
    description: "Displays related content that can be swiped.",
    category: "structuring",
    favorite: false,
  },
  {
    id: "content-card",
    iconSrc: "/assets/admin/elearning/materials/content-card.svg",
    label: "Content Card",
    description: "Groups related information in a compact.",
    category: "structuring",
    favorite: false,
  },
  {
    id: "tab-navigation",
    iconSrc: "/assets/admin/elearning/materials/tab-navigation.svg",
    label: "Tab Navigation",
    description: "Separates content into tabs for easy comparison.",
    category: "structuring",
    favorite: false,
  },
  {
    id: "highlight",
    iconSrc: "/assets/admin/elearning/materials/highlight.svg",
    label: "Highlight",
    description: "Emphasizes important information or key messages.",
    category: "structuring",
    favorite: false,
  },
  {
    id: "summary",
    iconSrc: "/assets/admin/elearning/materials/summary.svg",
    label: "Summary",
    description: "Presents key takeaways or a recap of the material.",
    category: "structuring",
    favorite: false,
  },
  {
    id: "true-false",
    iconSrc: "/assets/admin/elearning/materials/true-or-false.svg",
    label: "True or False",
    description: "Allows learners to answer statements as true or false.",
    category: "interactive",
    favorite: false,
  },
  {
    id: "matching",
    iconSrc: "/assets/admin/elearning/materials/matching.svg",
    label: "Matching",
    description: "Match questions with the correct answers.",
    category: "interactive",
    favorite: false,
  },
  {
    id: "coding",
    iconSrc: "/assets/admin/elearning/materials/coding.svg",
    label: "Coding",
    description: "Enables learners to practice coding directly.",
    category: "interactive",
    favorite: false,
  },
];

const CATEGORIES: Category[] = [
  {
    key: "favorite",
    label: "Favorite",
    description: "Elements you use most, all in one place",
  },
  {
    key: "basic",
    label: "Basic Content",
    description: "Core elements for building learning materials",
  },
  {
    key: "structuring",
    label: "Content Structuring",
    description: "Components to organize and structure content",
  },
  {
    key: "interactive",
    label: "Interactive Components",
    description: "Interactive elements to engage learners",
  },
];

const PARA_LINES = [100, 92, 96, 88, 94, 80, 90, 85, 97, 78, 93, 60];
const HIGHLIGHT_LINES = [100, 88, 94, 82, 96, 78, 90, 60];

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

function TooltipHeader({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="bg-gray-100 rounded-lg px-3 py-2 mb-3">
      <p className="text-[13px] font-bold text-gray-900 leading-tight">
        {label}
      </p>
      <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
        {description}
      </p>
    </div>
  );
}

function TooltipContent({ id }: { id: string }) {
  if (id === "heading") {
    return (
      <div>
        <TooltipHeader
          label="Heading"
          description="Displays a title or heading to structure the material."
        />
        <div className="space-y-1">
          <p className="text-[18px] font-bold    text-emerald-500 leading-tight">
            Heading 1
          </p>
          <p className="text-[15px] font-bold    text-emerald-500 leading-tight">
            Heading 2
          </p>
          <p className="text-[13px] font-semibold text-emerald-500 leading-tight">
            Heading 3
          </p>
          <p className="text-[12px] font-semibold text-emerald-400 leading-tight">
            Heading 4
          </p>
        </div>
      </div>
    );
  }
  if (id === "paragraph") {
    return (
      <div>
        <TooltipHeader
          label="Paragraph"
          description="Adds body text for explanations or descriptions."
        />
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
  if (id === "image") {
    return (
      <div>
        <TooltipHeader
          label="Image"
          description="Inserts an image to support visual learning."
        />
        <div className="w-full h-[120px] rounded-xl bg-emerald-500 flex items-center justify-center">
          <ImagePreviewIcon />
        </div>
      </div>
    );
  }
  if (id === "video") {
    return (
      <div>
        <TooltipHeader
          label="Video"
          description="Embeds a video for richer learning content."
        />
        <div className="w-full h-[120px] rounded-xl bg-emerald-500 flex items-center justify-center">
          <VideoPreviewIcon />
        </div>
      </div>
    );
  }
  if (id === "accordion") {
    return (
      <div>
        <TooltipHeader
          label="Accordion"
          description="Organizes content into collapsible sections."
        />
        <div className="space-y-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden border border-emerald-200"
            >
              <div className="bg-emerald-500 px-3 py-2 flex items-center justify-between">
                <div className="h-[5px] rounded-full bg-white/70 w-2/3" />
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="shrink-0 ml-2"
                >
                  <path
                    d="M3 4.5 L6 7.5 L9 4.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {i === 0 && (
                <div className="bg-white px-3 py-2 space-y-1.5">
                  <div className="h-[4px] rounded-full bg-gray-200 w-full" />
                  <div className="h-[4px] rounded-full bg-gray-200 w-4/5" />
                  <div className="h-[4px] rounded-full bg-gray-200 w-11/12" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (id === "carousel") {
    return (
      <div>
        <TooltipHeader
          label="Carousel"
          description="Displays related content that can be swiped."
        />
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path
                d="M5 1.5 L2.5 4 L5 6.5"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex gap-1.5 flex-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex-1 rounded-lg overflow-hidden border border-emerald-200"
              >
                <div className="bg-emerald-500 h-[32px]" />
                <div className="bg-white px-1.5 py-2 space-y-1">
                  <div className="h-[3px] rounded-full bg-gray-200 w-full" />
                  <div className="h-[3px] rounded-full bg-gray-200 w-3/4" />
                  <div className="h-[3px] rounded-full bg-gray-200 w-5/6" />
                </div>
              </div>
            ))}
          </div>
          <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path
                d="M3 1.5 L5.5 4 L3 6.5"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }
  if (id === "content-card") {
    return (
      <div>
        <TooltipHeader
          label="Content Card"
          description="Groups related information in a compact."
        />
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex-1 rounded-lg overflow-hidden border-2 border-emerald-400"
            >
              <div className="bg-emerald-500 h-[28px]" />
              <div className="bg-white px-1.5 py-2 space-y-1">
                <div className="h-[3px] rounded-full bg-gray-200 w-full" />
                <div className="h-[3px] rounded-full bg-gray-200 w-4/5" />
                <div className="h-[3px] rounded-full bg-gray-200 w-11/12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (id === "tab-navigation") {
    return (
      <div>
        <TooltipHeader
          label="Tab Navigation"
          description="Separates content into tabs for easy comparison."
        />
        <div className="rounded-lg overflow-hidden border-2 border-emerald-400">
          <div className="bg-emerald-500 px-2 py-1.5 flex gap-1.5">
            <div className="bg-white rounded-t-sm px-2 py-1">
              <div className="h-[4px] w-8 rounded-full bg-emerald-500" />
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="px-2 py-1">
                <div className="h-[4px] w-6 rounded-full bg-white/50" />
              </div>
            ))}
          </div>
          <div className="bg-white px-3 py-2.5 space-y-1.5">
            {[100, 92, 80, 96, 75, 88, 100, 65].map((w, i) => (
              <div
                key={i}
                className="h-[4px] rounded-full bg-gray-200"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (id === "highlight") {
    return (
      <div>
        <TooltipHeader
          label="Highlight"
          description="Emphasizes important information or key messages."
        />
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
  if (id === "summary") {
    return (
      <div>
        <TooltipHeader
          label="Summary"
          description="Presents key takeaways or a recap of the material."
        />
        <div className="space-y-3">
          {[82, 68, 74].map((w, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="shrink-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M4 9.5 L7.5 13 L14 6"
                    stroke="#10b981"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div
                className="h-[5px] rounded-full bg-gray-200 flex-1"
                style={{ maxWidth: `${w}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (id === "true-false") {
    return (
      <div>
        <TooltipHeader
          label="True or False"
          description="Allows learners to answer statements as true or false."
        />
        <div className="flex gap-3">
          <div className="flex-1 space-y-2.5">
            <p className="text-[10px] font-semibold text-gray-500 mb-1">True</p>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full border-2 border-emerald-500 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="h-[4px] rounded-full bg-gray-200 flex-1" />
              </div>
            ))}
          </div>
          <div className="flex-1 space-y-2.5">
            <p className="text-[10px] font-semibold text-gray-500 mb-1">
              False
            </p>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                <div className="h-[4px] rounded-full bg-gray-200 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (id === "matching") {
    return (
      <div>
        <TooltipHeader
          label="Matching"
          description="Match questions with the correct answers."
        />
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1 h-7 rounded border border-gray-300 bg-white" />
              <svg
                width="14"
                height="10"
                viewBox="0 0 14 10"
                fill="none"
                className="shrink-0"
              >
                <path
                  d="M0 5 H11 M8 2 L11 5 L8 8"
                  stroke="#6B7280"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex-1 h-7 rounded bg-emerald-500" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (id === "coding") {
    return (
      <div>
        <TooltipHeader
          label="Coding"
          description="Enables learners to practice coding directly."
        />
        <div className="rounded-xl border-2 border-emerald-400 overflow-hidden">
          <div className="bg-white px-3 py-2 flex items-center gap-1.5 border-b border-emerald-100">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-200" />
          </div>
          <div className="bg-white h-[80px] flex items-center justify-center">
            <svg width="44" height="36" viewBox="0 0 44 36" fill="none">
              <path
                d="M14 8 L4 18 L14 28"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M26 6 L18 30"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M30 8 L40 18 L30 28"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <TooltipHeader label={id} description="Hover preview coming soon." />
    </div>
  );
}

// ─── Single element card ──────────────────────────────────────────────────────
function ElementCard({
  el,
  isFavorite,
  onToggleFavorite,
  onClick,
  sidebarRef,
}: {
  el: ContentElement;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClick: (el: ContentElement) => void;
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

  const handleDragStart = (e: React.DragEvent) => {
    setShowTooltip(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    e.dataTransfer.setData("elementId", el.id);
    e.dataTransfer.effectAllowed = "copy";
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

  // ── Heart: stop propagation tanpa nested button ────────────────────────────
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
        draggable
        onDragStart={handleDragStart}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-400 hover:shadow-sm hover:bg-emerald-50/30 active:scale-95 transition-all duration-150 text-center w-full aspect-square cursor-grab active:cursor-grabbing"
      >
        {/*
          ── FIX: <button> dalam <button> tidak valid di HTML.
          Ganti dengan <div role="button"> agar tidak ada hydration error.
        */}
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

        <div className="relative w-9 h-9 shrink-0">
          <Image
            src={el.iconSrc}
            alt={el.label}
            fill
            className="object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <span className="text-[11px] font-semibold text-gray-700 group-hover:text-emerald-700 leading-tight">
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
            <TooltipContent id={el.id} />
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -left-[6px] w-3 h-3 bg-white border-l border-b border-gray-100 rotate-45" />
        </div>
      )}
    </>
  );
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────
interface ContentElementsSidebarProps {
  onAddElement: (el: ContentElement) => void;
}

export default function ContentElementsSidebar({
  onAddElement,
}: ContentElementsSidebarProps) {
  const [search, setSearch] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<string>>(
  new Set(), // default semua tertutup
);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const sidebarRef = useRef<HTMLElement>(null);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleCategory = (key: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const getElements = (catKey: Category["key"]) => {
    const base =
      catKey === "favorite"
        ? ALL_ELEMENTS.filter((e) => favorites.has(e.id))
        : ALL_ELEMENTS.filter((e) => e.category === catKey);
    const q = search.toLowerCase().trim();
    return q ? base.filter((e) => e.label.toLowerCase().includes(q)) : base;
  };

  return (
    <aside
      ref={sidebarRef}
      className="w-[280px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden h-full"
    >
      <div className="px-5 pt-5 pb-3 shrink-0">
        <h2 className="text-[15px] font-bold text-gray-900">
          Content Elements
        </h2>
        <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
          Drag and drop elements to build your material.
        </p>
        <div className="relative mt-3">
          <input
            type="text"
            placeholder="Search elements ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-gray-50 placeholder-gray-400"
          />
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {CATEGORIES.map((cat) => {
          const elements = getElements(cat.key);
          const isOpen = openCategories.has(cat.key);

          return (
            <div key={cat.key} className="mt-2">
              <button
                onClick={() => toggleCategory(cat.key)}
                className="w-full flex items-start justify-between px-5 py-2 hover:bg-gray-50 transition"
              >
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-[12px] font-bold text-gray-800">
                      {cat.label}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-500">
                      ({elements.length})
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                    {cat.description}
                  </p>
                </div>
                {isOpen ? (
                  <ChevronDown
                    size={14}
                    className="text-gray-400 shrink-0 mt-1"
                  />
                ) : (
                  <ChevronRight
                    size={14}
                    className="text-gray-400 shrink-0 mt-1"
                  />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-1">
                  {elements.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {elements.map((el) => (
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
                    <p className="text-[11px] text-gray-400 italic px-1 py-2">
                      {cat.key === "favorite"
                        ? "No favorites yet. Double click or tap ♡ on any element."
                        : "No results"}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
