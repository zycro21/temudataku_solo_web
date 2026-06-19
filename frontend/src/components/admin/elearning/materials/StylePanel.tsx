"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Pencil,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Lock,
  Unlock,
  Copy,
  Trash2,
  MoreHorizontal,
  GripVertical,
} from "lucide-react";
import type { CanvasItem } from "./CanvasCard";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface StyleState {
  fontType: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  highlight: boolean;
  penColor: string;
  align: "left" | "center" | "right" | "justify";
  listType: "none" | "bullet" | "ordered";
}

export interface StylePanelProps {
  items: CanvasItem[];
  itemCounters: Record<string, number>;
  selectedInstanceId: string | null;
  onSelectItem: (instanceId: string | null) => void;
  styleState: StyleState;
  onStyleChange: (cmd: string, value?: string) => void;
  onFontTypeChange: (v: string) => void;
  onFontSizeChange: (v: number) => void;
  onDuplicateItem?: (instanceId: string) => void;
  onRemoveItem?: (instanceId: string) => void;
  onDuplicateItems?: (instanceIds: string[]) => string[];
}

interface Group {
  id: string;
  name: string;
  itemIds: string[];
  collapsed: boolean;
  locked: boolean;
}

// ─── Font options ─────────────────────────────────────────────────────────────
const FONT_TYPES = [
  "Heading 1",
  "Heading 2",
  "Heading 3",
  "Paragraph",
  "Caption",
  "Code",
];

// ─── List style options ───────────────────────────────────────────────────────
const BULLET_STYLES = [
  { label: "●", value: "disc", title: "Disc" },
  { label: "○", value: "circle", title: "Circle" },
  { label: "■", value: "square", title: "Square" },
  { label: "➤", value: "disclosure-open", title: "Arrow" },
  { label: "✓", value: "disclosure-closed", title: "Check" },
] as const;

const NUMBER_STYLES = [
  { label: "1.", value: "decimal", title: "1, 2, 3" },
  { label: "a.", value: "lower-alpha", title: "a, b, c" },
  { label: "A.", value: "upper-alpha", title: "A, B, C" },
  { label: "i.", value: "lower-roman", title: "i, ii, iii" },
  { label: "I.", value: "upper-roman", title: "I, II, III" },
] as const;

// ─── Toolbar Button ───────────────────────────────────────────────────────────
function TBtn({
  children,
  active = false,
  onClick,
  title,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className={`flex-1 h-7 flex items-center justify-center rounded transition-colors text-sm ${
        active
          ? "bg-emerald-100 text-emerald-600"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Toolbar Row (kotak border) ───────────────────────────────────────────────
function TRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden divide-x divide-gray-200">
      {children}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
      >
        <span className="text-[12px] font-bold text-gray-700 tracking-wide uppercase">
          {title}
        </span>
        {open ? (
          <ChevronUp size={13} className="text-gray-400" />
        ) : (
          <ChevronDown size={13} className="text-gray-400" />
        )}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function StylePanel({
  items,
  itemCounters,
  selectedInstanceId,
  onSelectItem,
  styleState,
  onStyleChange,
  onFontTypeChange,
  onFontSizeChange,
  onDuplicateItem,
  onRemoveItem,
  onDuplicateItems,
}: StylePanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showFontTypeDropdown, setShowFontTypeDropdown] = useState(false);
  const [localStyle, setLocalStyle] = useState(styleState);
  const [showBulletPicker, setShowBulletPicker] = useState(false);
  const [showNumberPicker, setShowNumberPicker] = useState(false);
  const [bulletStyle, setBulletStyle] = useState<string>("disc");
  const [numberStyle, setNumberStyle] = useState<string>("decimal");

  // ── Color state ───────────────────────────────────────────────────────────
  const [highlightColor, setHighlightColor] = useState<string>("#fef08a");
  const [penColor, setPenColor] = useState<string>("#000000");
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showPenColorPicker, setShowPenColorPicker] = useState(false);
  const highlightPickerRef = useRef<HTMLDivElement>(null);
  const penColorPickerRef = useRef<HTMLDivElement>(null);

  const HIGHLIGHT_COLORS = [
    "#fef08a",
    "#fde68a",
    "#fed7aa",
    "#fca5a5",
    "#f9a8d4",
    "#e9d5ff",
    "#bfdbfe",
    "#99f6e4",
    "#bbf7d0",
    "#d9f99d",
    "#ffffff",
    "#e5e7eb",
    "#fef3c7",
    "#dbeafe",
    "#ffe4e6",
  ];

  // Close color pickers on outside click
  useEffect(() => {
    if (!showHighlightPicker && !showPenColorPicker) return;
    const handler = (e: MouseEvent) => {
      if (
        highlightPickerRef.current &&
        !highlightPickerRef.current.contains(e.target as Node)
      )
        setShowHighlightPicker(false);
      if (
        penColorPickerRef.current &&
        !penColorPickerRef.current.contains(e.target as Node)
      )
        setShowPenColorPicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showHighlightPicker, showPenColorPicker]);

  const bulletPickerRef = useRef<HTMLDivElement>(null);
  const numberPickerRef = useRef<HTMLDivElement>(null);

  // Close pickers on outside click
  useEffect(() => {
    if (!showBulletPicker && !showNumberPicker) return;
    const handler = (e: MouseEvent) => {
      if (
        bulletPickerRef.current &&
        !bulletPickerRef.current.contains(e.target as Node)
      )
        setShowBulletPicker(false);
      if (
        numberPickerRef.current &&
        !numberPickerRef.current.contains(e.target as Node)
      )
        setShowNumberPicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showBulletPicker, showNumberPicker]);

  // ── Structure state — default 1 group ────────────────────────────────────
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "g1",
      name: "Group Section 1",
      itemIds: [],
      collapsed: false,
      locked: false,
    },
  ]);
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [lockedItems, setLockedItems] = useState<Set<string>>(new Set());

  const groupedIds = new Set(groups.flatMap((g) => g.itemIds));

  const getItemName = (item: CanvasItem) => {
    const count = itemCounters[item.instanceId] ?? 1;
    return count > 1 ? `${item.label} ${count}` : item.label;
  };

  // ── Drag helpers ──────────────────────────────────────────────────────────
  const handleItemDragStart = (instanceId: string) => setDragItemId(instanceId);

  const handleDropOnGroup = (gId: string) => {
    if (!dragItemId) return;
    setGroups((prev) =>
      prev.map((g) => {
        const filtered = g.itemIds.filter((id) => id !== dragItemId);
        return g.id === gId
          ? { ...g, itemIds: [...filtered, dragItemId!] }
          : { ...g, itemIds: filtered };
      }),
    );
    setDragItemId(null);
  };

  const handleDropOnUngrouped = () => {
    if (!dragItemId) return;
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        itemIds: g.itemIds.filter((id) => id !== dragItemId),
      })),
    );
    setDragItemId(null);
  };

  const toggleGroupCollapse = (gId: string) =>
    setGroups((prev) =>
      prev.map((g) => (g.id === gId ? { ...g, collapsed: !g.collapsed } : g)),
    );

  const toggleGroupLock = (gId: string) =>
    setGroups((prev) =>
      prev.map((g) => (g.id === gId ? { ...g, locked: !g.locked } : g)),
    );

  const addGroup = () => {
    const n = groups.length + 1;
    setGroups((prev) => [
      ...prev,
      {
        id: `g${Date.now()}`,
        name: `Group Section ${n}`,
        itemIds: [],
        collapsed: false,
        locked: false,
      },
    ]);
  };

  const removeGroup = (gId: string) =>
    setGroups((prev) => prev.filter((g) => g.id !== gId));

  const handleDuplicateGroup = (gId: string) => {
    const group = groups.find((g) => g.id === gId);
    if (!group || !onDuplicateItems) return;

    const newIds = onDuplicateItems(group.itemIds);

    const newGroup: Group = {
      id: `g${Date.now()}`,
      name: `${group.name} (Copy)`,
      itemIds: newIds,
      collapsed: false,
      locked: false,
    };

    setGroups((prev) => {
      const idx = prev.findIndex((g) => g.id === gId);
      const next = [...prev];
      next.splice(idx + 1, 0, newGroup);
      return next;
    });
  };

  const toggleItemLock = (instanceId: string) => {
    setLockedItems((prev) => {
      const next = new Set(prev);
      next.has(instanceId) ? next.delete(instanceId) : next.add(instanceId);
      return next;
    });
  };

  // ── Sync localStyle dari styleState (dari DOM) ────────────────────────────
  useEffect(() => {
    setLocalStyle(styleState);
  }, [styleState]);

  // ── Sync penColor display dari DOM-driven styleState ─────────────────────
  useEffect(() => {
    if (styleState.penColor) {
      setPenColor(styleState.penColor);
    }
  }, [styleState.penColor]);

  // ── Collapsed strip ───────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <div className="w-8 shrink-0 border-l border-gray-200 bg-white flex flex-col items-center py-4">
        <button
          onClick={() => setCollapsed(false)}
          title="Open style panel"
          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
        >
          <ChevronLeft size={16} />
        </button>
      </div>
    );
  }

  const {
    fontType,
    fontSize,
    bold,
    italic,
    underline,
    strikethrough,
    highlight,
    penColor: activePenColor,
    align,
    listType,
  } = localStyle;

  // ── Pen color aktif jika bukan hitam (#000000) ────────────────────────────
  const isPenColorActive =
    !!activePenColor &&
    activePenColor !== "#000000" &&
    activePenColor !== "#000" &&
    activePenColor !== "rgb(0, 0, 0)";

  const getSafePosition = (rect: DOMRect, popupWidth: number) => {
    const padding = 8;
    let left = rect.left;
    let top = rect.bottom + 4;
    if (left + popupWidth > window.innerWidth - padding) {
      left = window.innerWidth - popupWidth - padding;
    }
    if (left < padding) {
      left = padding;
    }
    return { top, left };
  };

  return (
    <aside className="w-[220px] shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden h-full">
      {/* ── Panel header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <span className="text-[13px] font-bold text-gray-700">Style</span>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ══ STYLE SECTION ═══════════════════════════════════════════════ */}
        <Section title="Style">
          <p className="text-[10px] text-gray-400 -mt-1 mb-1 leading-snug">
            Customize the appearance of selected content.
          </p>

          {/* Font Type */}
          <div>
            <p className="text-[10px] font-semibold text-gray-500 mb-1">
              Font-Type
            </p>
            <div className="relative">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setShowFontTypeDropdown((v) => !v);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 hover:border-gray-300 transition"
              >
                <span>{fontType}</span>
                <ChevronDown size={12} className="text-gray-400" />
              </button>
              {showFontTypeDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md z-30 overflow-hidden">
                  {FONT_TYPES.map((ft) => (
                    <button
                      key={ft}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onFontTypeChange(ft);
                        setShowFontTypeDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition ${
                        fontType === ft
                          ? "bg-emerald-50 text-emerald-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {ft}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <p className="text-[10px] font-semibold text-gray-500 mb-1">
              Font-Size
            </p>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden divide-x divide-gray-200">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  onFontSizeChange(Math.max(8, fontSize - 2));
                }}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition font-bold text-base shrink-0"
              >
                −
              </button>
              <span className="flex-1 text-center text-sm font-semibold text-gray-700 tabular-nums py-1">
                {fontSize}
              </span>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  onFontSizeChange(Math.min(72, fontSize + 2));
                }}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition font-bold text-base shrink-0"
              >
                +
              </button>
            </div>
          </div>

          {/* Formatting row */}
          <div>
            <p className="text-[10px] font-semibold text-gray-500 mb-1">
              Formatting
            </p>
            <TRow>
              {/* Bold */}
              <TBtn
                active={bold}
                onClick={() => {
                  onStyleChange("bold");
                  setLocalStyle((p) => ({ ...p, bold: !p.bold }));
                }}
                title="Bold"
              >
                <Bold size={13} />
              </TBtn>

              {/* Underline */}
              <TBtn
                active={underline}
                onClick={() => {
                  onStyleChange("underline");
                  setLocalStyle((p) => ({ ...p, underline: !p.underline }));
                }}
                title="Underline"
              >
                <Underline size={13} />
              </TBtn>

              {/* Italic */}
              <TBtn
                active={italic}
                onClick={() => {
                  onStyleChange("italic");
                  setLocalStyle((p) => ({ ...p, italic: !p.italic }));
                }}
                title="Italic"
              >
                <span
                  style={{
                    display: "inline-block",
                    transform: "skewX(-12deg)",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  I
                </span>
              </TBtn>

              {/* Strikethrough */}
              <TBtn
                active={strikethrough}
                onClick={() => {
                  onStyleChange("strikeThrough");
                  setLocalStyle((p) => ({
                    ...p,
                    strikethrough: !p.strikethrough,
                  }));
                }}
                title="Strikethrough"
              >
                <Strikethrough size={13} />
              </TBtn>

              {/* Highlight — dengan color picker */}
              <div className="relative flex-1" ref={highlightPickerRef}>
                <button
                  title="Highlight color"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowHighlightPicker((v) => !v);
                    setShowPenColorPicker(false);
                  }}
                  className={`w-full h-7 flex items-center justify-center rounded transition-colors ${
                    highlight
                      ? "bg-emerald-100 text-emerald-600"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <Highlighter size={11} />
                    <div
                      className="w-4 h-1 rounded-sm"
                      style={{ backgroundColor: highlightColor }}
                    />
                  </div>
                </button>
                {showHighlightPicker && (
                  <div
                    className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] p-2 w-[148px]"
                    style={
                      highlightPickerRef.current
                        ? getSafePosition(
                            highlightPickerRef.current.getBoundingClientRect(),
                            148,
                          )
                        : { top: 0, left: 0 }
                    }
                  >
                    <p className="text-[10px] font-semibold text-gray-400 mb-1.5 px-0.5">
                      Highlight Color
                    </p>
                    <div className="grid grid-cols-5 gap-1 mb-2">
                      {HIGHLIGHT_COLORS.map((color) => (
                        <button
                          key={color}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setHighlightColor(color);
                            onStyleChange("hiliteColor", color);
                            setLocalStyle((p) => ({ ...p, highlight: true }));
                            setShowHighlightPicker(false);
                          }}
                          className={`w-6 h-6 rounded border-2 transition ${
                            highlightColor === color
                              ? "border-emerald-500 scale-110"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onStyleChange("hiliteColor", "transparent");
                        setShowHighlightPicker(false);
                        // Paksa swatch & status tombol balik ke default.
                        // Dipanggil dua kali (langsung + setelah satu tick)
                        // supaya tidak ke-overwrite oleh sinkronisasi
                        // styleState yang membaca document.queryCommandValue,
                        // yang kadang melaporkan nilai tidak akurat persis
                        // setelah hiliteColor di-reset ke transparent.
                        setHighlightColor("#fef08a");
                        setLocalStyle((p) => ({ ...p, highlight: false }));
                        setTimeout(() => {
                          setHighlightColor("#fef08a");
                          setLocalStyle((p) => ({ ...p, highlight: false }));
                        }, 0);
                      }}
                      className="w-full text-[10px] text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-300 rounded px-2 py-1 transition"
                    >
                      Remove highlight
                    </button>
                  </div>
                )}
              </div>

              {/* Pen color — dengan color picker custom */}
              <div className="relative flex-1" ref={penColorPickerRef}>
                <button
                  title="Pen color"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowPenColorPicker((v) => !v);
                    setShowHighlightPicker(false);
                  }}
                  className={`w-full h-7 flex items-center justify-center rounded transition-colors ${
                    isPenColorActive
                      ? "bg-emerald-100 text-emerald-600"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <Pencil size={11} />
                    <div
                      className="w-4 h-1 rounded-sm"
                      style={{ backgroundColor: penColor }}
                    />
                  </div>
                </button>
                {showPenColorPicker && (
                  <div
                    className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] p-3 w-[200px]"
                    style={
                      penColorPickerRef.current
                        ? getSafePosition(
                            penColorPickerRef.current.getBoundingClientRect(),
                            200,
                          )
                        : { top: 0, left: 0 }
                    }
                  >
                    <p className="text-[10px] font-semibold text-gray-400 mb-2">
                      Pen Color
                    </p>
                    <div className="mb-2">
                      {/* ── Gradient color area ── */}
                      <div
                        className="w-full h-[120px] rounded cursor-crosshair mb-1.5"
                        style={{
                          background: `
                            linear-gradient(to bottom, transparent, black),
                            linear-gradient(to right, white, hsl(${parseInt(penColor.slice(1), 16) > 0 ? Math.round((parseInt(penColor.slice(1, 3), 16) / 255) * 120 + (parseInt(penColor.slice(3, 5), 16) / 255) * 60) : 0}deg, 100%, 50%))
                          `,
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = (e.clientX - rect.left) / rect.width;
                          const y = (e.clientY - rect.top) / rect.height;
                          const h = Math.round(x * 360);
                          const s = Math.round(x * 100);
                          const l = Math.round((1 - y) * 50);
                          const hslToHex = (
                            h: number,
                            s: number,
                            l: number,
                          ) => {
                            s /= 100;
                            l /= 100;
                            const a = s * Math.min(l, 1 - l);
                            const f = (n: number) => {
                              const k = (n + h / 30) % 12;
                              return (
                                l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
                              );
                            };
                            return (
                              "#" +
                              [f(0), f(8), f(4)]
                                .map((x) =>
                                  Math.round(x * 255)
                                    .toString(16)
                                    .padStart(2, "0"),
                                )
                                .join("")
                            );
                          };
                          const hex = hslToHex(h, s, l);
                          setPenColor(hex);
                          onStyleChange("foreColor", hex);
                          setShowPenColorPicker(false);
                        }}
                      />
                      {/* ── Hue bar ── */}
                      <div
                        className="w-full h-3 rounded cursor-pointer"
                        style={{
                          background:
                            "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = (e.clientX - rect.left) / rect.width;
                          const h = Math.round(x * 360);
                          const hex = `hsl(${h}, 100%, 50%)`;
                          const canvas = document.createElement("canvas");
                          canvas.width = canvas.height = 1;
                          const ctx = canvas.getContext("2d")!;
                          ctx.fillStyle = hex;
                          ctx.fillRect(0, 0, 1, 1);
                          const d = ctx.getImageData(0, 0, 1, 1).data;
                          const hexColor =
                            "#" +
                            [d[0], d[1], d[2]]
                              .map((v) => v.toString(16).padStart(2, "0"))
                              .join("");
                          setPenColor(hexColor);
                          onStyleChange("foreColor", hexColor);
                          setShowPenColorPicker(false);
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-6 h-6 rounded border border-gray-200 shrink-0"
                        style={{ backgroundColor: penColor }}
                      />
                      <span className="text-[10px] text-gray-400">Hex</span>
                      <input
                        type="text"
                        value={penColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPenColor(val);
                          if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                            onStyleChange("foreColor", val);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            /^#[0-9a-fA-F]{6}$/.test(penColor)
                          ) {
                            onStyleChange("foreColor", penColor);
                            setShowPenColorPicker(false);
                          }
                        }}
                        className="flex-1 text-xs border border-gray-200 rounded px-1.5 py-1 outline-none focus:border-emerald-400 font-mono"
                        maxLength={7}
                        placeholder="#000000"
                      />
                    </div>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onStyleChange("foreColor", "#000000");
                        setShowPenColorPicker(false);
                        // Paksa swatch & status tombol balik ke default
                        // (lihat catatan di tombol "Remove highlight" di atas).
                        setPenColor("#000000");
                        setLocalStyle((p) => ({ ...p, penColor: "#000000" }));
                        setTimeout(() => {
                          setPenColor("#000000");
                          setLocalStyle((p) => ({ ...p, penColor: "#000000" }));
                        }, 0);
                      }}
                      className="mt-1.5 w-full text-[10px] text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-2 py-1 transition"
                    >
                      Reset to black
                    </button>
                  </div>
                )}
              </div>
            </TRow>
          </div>

          {/* Alignment row */}
          <div>
            <p className="text-[10px] font-semibold text-gray-500 mb-1">
              Alignment
            </p>
            <TRow>
              <TBtn
                active={align === "left"}
                onClick={() => {
                  onStyleChange("justifyLeft");
                  setLocalStyle((p) => ({ ...p, align: "left" }));
                }}
              >
                <AlignLeft size={13} />
              </TBtn>
              <TBtn
                active={align === "center"}
                onClick={() => {
                  onStyleChange("justifyCenter");
                  setLocalStyle((p) => ({ ...p, align: "center" }));
                }}
              >
                <AlignCenter size={13} />
              </TBtn>
              <TBtn
                active={align === "right"}
                onClick={() => {
                  onStyleChange("justifyRight");
                  setLocalStyle((p) => ({ ...p, align: "right" }));
                }}
              >
                <AlignRight size={13} />
              </TBtn>
              <TBtn
                active={align === "justify"}
                onClick={() => {
                  onStyleChange("justifyFull");
                  setLocalStyle((p) => ({ ...p, align: "justify" }));
                }}
              >
                <AlignJustify size={13} />
              </TBtn>
            </TRow>
          </div>

          {/* List & Indent row */}
          <div>
            <p className="text-[10px] font-semibold text-gray-500 mb-1">
              List & Indent
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center border border-gray-200 rounded-lg divide-x divide-gray-200">
                {/* Unordered list button + dropdown arrow */}
                <div className="flex flex-1 divide-x divide-gray-200">
                  <TBtn
                    active={listType === "bullet"}
                    onClick={() => {
                      const isActive = listType === "bullet";
                      onStyleChange("insertUnorderedList");
                      setTimeout(() => {
                        onStyleChange("__setBulletStyle", bulletStyle);
                      }, 0);
                      setLocalStyle((p) => ({
                        ...p,
                        listType: isActive ? "none" : "bullet",
                      }));
                    }}
                    title="Unordered list"
                  >
                    <List size={13} />
                  </TBtn>
                  <div className="relative" ref={bulletPickerRef}>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setShowBulletPicker((v) => !v);
                        setShowNumberPicker(false);
                      }}
                      className="h-7 px-0.5 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                      title="Choose bullet style"
                    >
                      <ChevronDown size={10} />
                    </button>
                    {showBulletPicker && (
                      <div
                        className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] p-2 min-w-[160px]"
                        style={
                          bulletPickerRef.current
                            ? getSafePosition(
                                bulletPickerRef.current.getBoundingClientRect(),
                                160,
                              )
                            : { top: 0, left: 0 }
                        }
                      >
                        <p className="text-[10px] font-semibold text-gray-400 mb-1.5 px-1">
                          Bullet Style
                        </p>
                        <div className="grid grid-cols-3 gap-1">
                          {BULLET_STYLES.map((s) => (
                            <button
                              key={s.value}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setBulletStyle(s.value);
                                setShowBulletPicker(false);
                                if (listType === "bullet") {
                                  onStyleChange("__setBulletStyle", s.value);
                                } else {
                                  onStyleChange("insertUnorderedList");
                                  setTimeout(() => {
                                    onStyleChange("__setBulletStyle", s.value);
                                  }, 0);
                                  setLocalStyle((p) => ({
                                    ...p,
                                    listType: "bullet",
                                  }));
                                }
                              }}
                              className={`flex items-center justify-center h-8 rounded text-sm border transition ${
                                bulletStyle === s.value
                                  ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                                  : "border-gray-200 hover:border-gray-300 text-gray-600"
                              }`}
                              title={s.title}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ordered list button + dropdown arrow */}
                <div className="flex flex-1 divide-x divide-gray-200">
                  <TBtn
                    active={listType === "ordered"}
                    onClick={() => {
                      const isActive = listType === "ordered";
                      onStyleChange("insertOrderedList");
                      setTimeout(() => {
                        onStyleChange("__setNumberStyle", numberStyle);
                      }, 0);
                      setLocalStyle((p) => ({
                        ...p,
                        listType: isActive ? "none" : "ordered",
                      }));
                    }}
                    title="Ordered list"
                  >
                    <ListOrdered size={13} />
                  </TBtn>
                  <div className="relative" ref={numberPickerRef}>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setShowNumberPicker((v) => !v);
                        setShowBulletPicker(false);
                      }}
                      className="h-7 px-0.5 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                      title="Choose number style"
                    >
                      <ChevronDown size={10} />
                    </button>
                    {showNumberPicker && (
                      <div
                        className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] p-2 min-w-[180px]"
                        style={
                          numberPickerRef.current
                            ? getSafePosition(
                                numberPickerRef.current.getBoundingClientRect(),
                                180,
                              )
                            : { top: 0, left: 0 }
                        }
                      >
                        <p className="text-[10px] font-semibold text-gray-400 mb-1.5 px-1">
                          Number Style
                        </p>
                        <div className="space-y-0.5">
                          {NUMBER_STYLES.map((s) => (
                            <button
                              key={s.value}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setNumberStyle(s.value);
                                setShowNumberPicker(false);
                                if (listType === "ordered") {
                                  onStyleChange("__setNumberStyle", s.value);
                                } else {
                                  onStyleChange("insertOrderedList");
                                  setTimeout(() => {
                                    onStyleChange("__setNumberStyle", s.value);
                                  }, 0);
                                  setLocalStyle((p) => ({
                                    ...p,
                                    listType: "ordered",
                                  }));
                                }
                              }}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition ${
                                numberStyle === s.value
                                  ? "bg-emerald-50 text-emerald-600 font-semibold"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <span className="w-6 text-center font-mono">
                                {s.label}
                              </span>
                              <span>{s.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <TBtn onClick={() => onStyleChange("indent")} title="Indent">
                  <Indent size={13} />
                </TBtn>
                <TBtn onClick={() => onStyleChange("outdent")} title="Outdent">
                  <Outdent size={13} />
                </TBtn>
              </div>
            </div>
          </div>
        </Section>

        {/* ══ STRUCTURE SECTION ══════════════════════════════════════════ */}
        {items.length > 0 && (
          <Section title="Structure" defaultOpen>
            <p className="text-[10px] text-gray-400 -mt-1 mb-2 leading-snug">
              Drag items into groups to organize hierarchy.
            </p>

            <div className="space-y-2">
              {groups.map((group) => {
                const groupItems = group.itemIds
                  .map((id) => items.find((x) => x.instanceId === id))
                  .filter(Boolean) as CanvasItem[];

                return (
                  <div
                    key={group.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDropOnGroup(group.id);
                    }}
                    className="rounded-lg border border-gray-200 bg-gray-50/50 overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5 px-2 py-1.5 group/grp">
                      <button
                        onClick={() => toggleGroupCollapse(group.id)}
                        className="shrink-0 text-gray-400 hover:text-gray-600 transition"
                      >
                        {group.collapsed ? (
                          <ChevronRight size={11} />
                        ) : (
                          <ChevronDown size={11} />
                        )}
                      </button>
                      <span className="flex-1 text-[11px] font-semibold text-gray-600 truncate">
                        {group.name}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover/grp:opacity-100 transition-opacity">
                        <button
                          title={group.locked ? "Unlock group" : "Lock group"}
                          onClick={() => toggleGroupLock(group.id)}
                          className="p-0.5 rounded hover:bg-gray-100 transition"
                        >
                          {group.locked ? (
                            <Unlock size={9} className="text-emerald-500" />
                          ) : (
                            <Lock size={9} className="text-gray-400" />
                          )}
                        </button>
                        <button
                          title="Duplicate group"
                          onClick={() => handleDuplicateGroup(group.id)}
                          className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                        >
                          <Copy size={9} />
                        </button>
                        <button
                          title="Remove group"
                          onClick={() => removeGroup(group.id)}
                          className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-400 transition"
                        >
                          <Trash2 size={9} />
                        </button>
                      </div>
                    </div>

                    {!group.collapsed && (
                      <div className="px-2 pb-2 space-y-1 min-h-[24px]">
                        {groupItems.length === 0 ? (
                          <p className="text-[10px] text-gray-300 italic text-center py-1">
                            Drop items here
                          </p>
                        ) : (
                          groupItems.map((item) => (
                            <StructureItem
                              key={item.instanceId}
                              label={getItemName(item)}
                              instanceId={item.instanceId}
                              selected={selectedInstanceId === item.instanceId}
                              locked={lockedItems.has(item.instanceId)}
                              onSelect={() => onSelectItem(item.instanceId)}
                              onDragStart={() =>
                                handleItemDragStart(item.instanceId)
                              }
                              onLock={() => toggleItemLock(item.instanceId)}
                              onDuplicate={() =>
                                onDuplicateItem?.(item.instanceId)
                              }
                              onDelete={() => onRemoveItem?.(item.instanceId)}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropOnUngrouped();
                }}
                className="space-y-1 min-h-[8px]"
              >
                {items
                  .filter((item) => !groupedIds.has(item.instanceId))
                  .map((item) => (
                    <StructureItem
                      key={item.instanceId}
                      label={getItemName(item)}
                      instanceId={item.instanceId}
                      selected={selectedInstanceId === item.instanceId}
                      locked={lockedItems.has(item.instanceId)}
                      onSelect={() => onSelectItem(item.instanceId)}
                      onDragStart={() => handleItemDragStart(item.instanceId)}
                      onLock={() => toggleItemLock(item.instanceId)}
                      onDuplicate={() => onDuplicateItem?.(item.instanceId)}
                      onDelete={() => onRemoveItem?.(item.instanceId)}
                    />
                  ))}
              </div>
            </div>

            <button
              onClick={addGroup}
              className="mt-2 w-full text-[11px] font-semibold text-emerald-600 border border-dashed border-emerald-300 rounded-lg py-1.5 hover:bg-emerald-50 transition"
            >
              + Add Group
            </button>
          </Section>
        )}
      </div>
    </aside>
  );
}

// ─── Structure item row ───────────────────────────────────────────────────────
function StructureItem({
  label,
  instanceId,
  selected,
  locked,
  onSelect,
  onDragStart,
  onLock,
  onDuplicate,
  onDelete,
}: {
  label: string;
  instanceId: string;
  selected: boolean;
  locked: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onLock: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  return (
    <div
      draggable={!locked}
      onDragStart={onDragStart}
      onClick={onSelect}
      className={`flex items-center gap-1.5 py-1 px-1.5 rounded cursor-pointer transition group/si ${
        selected
          ? "bg-emerald-50 border border-emerald-200"
          : "hover:bg-gray-100 border border-transparent"
      } ${locked ? "opacity-60" : ""}`}
    >
      <GripVertical
        size={10}
        className={`shrink-0 ${locked ? "cursor-not-allowed text-gray-200" : "cursor-grab text-gray-300"}`}
      />
      <div
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${selected ? "bg-emerald-500" : "bg-emerald-300"}`}
      />
      <span
        className={`flex-1 text-[11px] truncate ${selected ? "text-emerald-700 font-semibold" : "text-gray-600"}`}
      >
        {label}
      </span>

      <div className="flex items-center gap-0.5 opacity-0 group-hover/si:opacity-100 transition-opacity relative">
        <button
          title={locked ? "Unlock" : "Lock"}
          onClick={(e) => {
            e.stopPropagation();
            onLock();
          }}
          className="p-0.5 rounded hover:bg-gray-200 transition"
        >
          {locked ? (
            <Unlock size={9} className="text-emerald-500" />
          ) : (
            <Lock size={9} className="text-gray-400" />
          )}
        </button>

        <button
          title="Duplicate"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition"
        >
          <Copy size={9} />
        </button>

        <div ref={menuRef} className="relative">
          <button
            title="More"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((v) => !v);
            }}
            className="p-0.5 rounded hover:bg-gray-200 text-gray-400 transition"
          >
            <MoreHorizontal size={9} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-50 overflow-hidden min-w-[100px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-red-500 hover:bg-red-50 transition"
              >
                <Trash2 size={10} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
