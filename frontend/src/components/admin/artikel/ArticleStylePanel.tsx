"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
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
import type { ArticleCanvasItem } from "./ArticleCanvasCard";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ArticleStyleState {
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

export interface ArticleStylePanelProps {
  items: ArticleCanvasItem[];
  itemCounters: Record<string, number>;
  selectedInstanceId: string | null;
  onSelectItem: (instanceId: string | null) => void;
  styleState: ArticleStyleState;
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

const FONT_TYPES = [
  "Heading 1",
  "Heading 2",
  "Heading 3",
  "Paragraph",
  "Caption",
  "Code",
];

const BULLET_STYLES = [
  { label: "●", value: "disc", title: "Disc" },
  { label: "○", value: "circle", title: "Circle" },
  { label: "■", value: "square", title: "Square" },
] as const;

const NUMBER_STYLES = [
  { label: "1.", value: "decimal", title: "1, 2, 3" },
  { label: "a.", value: "lower-alpha", title: "a, b, c" },
  { label: "A.", value: "upper-alpha", title: "A, B, C" },
] as const;

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
];

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

function TRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden divide-x divide-gray-200">
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function ArticleStylePanel({
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
}: ArticleStylePanelProps) {
  const [showFontTypeDropdown, setShowFontTypeDropdown] = useState(false);
  const [showBulletPicker, setShowBulletPicker] = useState(false);
  const [showNumberPicker, setShowNumberPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showPenColorPicker, setShowPenColorPicker] = useState(false);
  const [bulletStyle, setBulletStyle] = useState("disc");
  const [numberStyle, setNumberStyle] = useState("decimal");

  const highlightPickerRef = useRef<HTMLDivElement>(null);
  const penColorPickerRef = useRef<HTMLDivElement>(null);
  const bulletPickerRef = useRef<HTMLDivElement>(null);
  const numberPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !showHighlightPicker &&
      !showPenColorPicker &&
      !showBulletPicker &&
      !showNumberPicker
    )
      return;
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
  }, [
    showHighlightPicker,
    showPenColorPicker,
    showBulletPicker,
    showNumberPicker,
  ]);

  // ── Structure state — grouping murni di UI, belum disambungkan ke API ────
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

  const getItemName = (item: ArticleCanvasItem) => {
    const count = itemCounters[item.instanceId] ?? 1;
    return count > 1 ? `${item.label} ${count}` : item.label;
  };

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

  const getSafePosition = (rect: DOMRect, popupWidth: number) => {
    const padding = 8;
    let left = rect.left;
    let top = rect.bottom + 4;
    if (left + popupWidth > window.innerWidth - padding)
      left = window.innerWidth - popupWidth - padding;
    if (left < padding) left = padding;
    return { top, left };
  };

  const {
    fontType,
    fontSize,
    bold,
    italic,
    underline,
    strikethrough,
    highlight,
    penColor,
    align,
    listType,
  } = styleState;

  const isPenColorActive =
    !!penColor &&
    penColor !== "#000000" &&
    penColor !== "#000" &&
    penColor !== "rgb(0, 0, 0)";

  // 🔥 DIUBAH: dulu toolbar Style cuma muncul kalau ada elemen rich-text
  // yang dipilih. Sekarang toolbar SELALU tampil persis seperti di
  // e-learning — font type/size & tombol formatting tetap ada walau belum
  // ada elemen yang difokus. Tombol-tombol itu bekerja lewat activeEditorRef
  // (lihat page.tsx onStyleChange), jadi kalau memang belum ada rich text
  // editor yang fokus, klik tombol formatting cuma no-op (aman, nggak
  // error) sampai user klik ke dalam elemen teks di canvas.

  return (
    <>
      {/* ══ STYLE SECTION ═══════════════════════════════════════════════ */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">Style</h3>
        <p className="text-[11px] text-gray-400 mb-3">
          Customize the appearance of selected content
        </p>

        <div className="space-y-3">
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
              <TBtn
                active={bold}
                onClick={() => onStyleChange("bold")}
                title="Bold"
              >
                <Bold size={13} />
              </TBtn>
              <TBtn
                active={underline}
                onClick={() => onStyleChange("underline")}
                title="Underline"
              >
                <Underline size={13} />
              </TBtn>
              <TBtn
                active={italic}
                onClick={() => onStyleChange("italic")}
                title="Italic"
              >
                <Italic size={13} />
              </TBtn>
              <TBtn
                active={strikethrough}
                onClick={() => onStyleChange("strikeThrough")}
                title="Strikethrough"
              >
                <Strikethrough size={13} />
              </TBtn>

              {/* Highlight */}
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
                  <Highlighter size={13} />
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
                            onStyleChange("hiliteColor", color);
                            setShowHighlightPicker(false);
                          }}
                          className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400 transition"
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
                      }}
                      className="w-full text-[10px] text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-300 rounded px-2 py-1 transition"
                    >
                      Remove highlight
                    </button>
                  </div>
                )}
              </div>

              {/* Pen color */}
              <div className="relative flex-1" ref={penColorPickerRef}>
                <button
                  title="Text color"
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
                  <Pencil size={13} />
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
                      Text Color
                    </p>
                    <div className="grid grid-cols-5 gap-1.5 mb-2">
                      {[
                        "#000000",
                        "#ef4444",
                        "#f97316",
                        "#eab308",
                        "#22c55e",
                        "#10b981",
                        "#06b6d4",
                        "#3b82f6",
                        "#8b5cf6",
                        "#ec4899",
                      ].map((c) => (
                        <button
                          key={c}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            onStyleChange("foreColor", c);
                            setShowPenColorPicker(false);
                          }}
                          className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-gray-400 transition"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onStyleChange("foreColor", "#000000");
                        setShowPenColorPicker(false);
                      }}
                      className="w-full text-[10px] text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-2 py-1 transition"
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
                onClick={() => onStyleChange("justifyLeft")}
              >
                <AlignLeft size={13} />
              </TBtn>
              <TBtn
                active={align === "center"}
                onClick={() => onStyleChange("justifyCenter")}
              >
                <AlignCenter size={13} />
              </TBtn>
              <TBtn
                active={align === "right"}
                onClick={() => onStyleChange("justifyRight")}
              >
                <AlignRight size={13} />
              </TBtn>
              <TBtn
                active={align === "justify"}
                onClick={() => onStyleChange("justifyFull")}
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
            <div className="flex items-center border border-gray-200 rounded-lg divide-x divide-gray-200">
              <div className="flex flex-1 divide-x divide-gray-200">
                <TBtn
                  active={listType === "bullet"}
                  onClick={() => {
                    onStyleChange("insertUnorderedList");
                    setTimeout(
                      () => onStyleChange("__setBulletStyle", bulletStyle),
                      0,
                    );
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
                      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] p-2 min-w-[140px]"
                      style={
                        bulletPickerRef.current
                          ? getSafePosition(
                              bulletPickerRef.current.getBoundingClientRect(),
                              140,
                            )
                          : { top: 0, left: 0 }
                      }
                    >
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
                                setTimeout(
                                  () =>
                                    onStyleChange("__setBulletStyle", s.value),
                                  0,
                                );
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

              <div className="flex flex-1 divide-x divide-gray-200">
                <TBtn
                  active={listType === "ordered"}
                  onClick={() => {
                    onStyleChange("insertOrderedList");
                    setTimeout(
                      () => onStyleChange("__setNumberStyle", numberStyle),
                      0,
                    );
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
                      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] p-2 min-w-[160px]"
                      style={
                        numberPickerRef.current
                          ? getSafePosition(
                              numberPickerRef.current.getBoundingClientRect(),
                              160,
                            )
                          : { top: 0, left: 0 }
                      }
                    >
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
                                setTimeout(
                                  () =>
                                    onStyleChange("__setNumberStyle", s.value),
                                  0,
                                );
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
      </div>

      {/* ══ STRUCTURE SECTION ══════════════════════════════════════════ */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">Structure</h3>
        <p className="text-[11px] text-gray-400 mb-3">
          Organize sections and content hierarchy
        </p>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-6 text-center">
            <p className="text-[11px] text-gray-400 px-4">
              Belum ada konten di artikel ini.
            </p>
          </div>
        ) : (
          <div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-0.5">
              {groups.map((group) => {
                const groupItems = group.itemIds
                  .map((id) => items.find((x) => x.instanceId === id))
                  .filter(Boolean) as ArticleCanvasItem[];

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
          </div>
        )}
      </div>
    </>
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
