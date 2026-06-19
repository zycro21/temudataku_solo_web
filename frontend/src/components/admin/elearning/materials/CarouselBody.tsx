"use client";

import { useState, useRef, useEffect } from "react";
import {
  Trash2,
  Plus,
  Pencil,
  GripVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import RichTextEditor, {
  type RichTextEditorRef,
} from "@/components/admin/elearning/materials/RichTextEditor";
import { getFontStyle } from "@/components/admin/elearning/materials/fontStyles";

interface CarouselItem {
  id: string;
  label: string;
  content: string;
}

type CardsPerSlide = 2 | 3 | 4;

// ─── Canvas mode ──────────────────────────────────────────────────────────────
function CarouselCanvas({
  title,
  description,
  items,
  cardsPerSlide,
  fontType,
  fontSize,
  onTitleChange,
  onDescriptionChange,
  onCardsPerSlideChange,
  onItemLabelChange,
  onItemContentChange,
  onAddItem,
  onRemoveItem,
  onCreate,
  wrapperRef,
  onEditorFocus,
  onSelectionChange,
}: {
  title: string;
  description: string;
  items: CarouselItem[];
  cardsPerSlide: CardsPerSlide;
  fontType?: string;
  fontSize?: number;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onCardsPerSlideChange: (v: CardsPerSlide) => void;
  onItemLabelChange: (id: string, value: string) => void;
  onItemContentChange: (id: string, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onCreate: () => void;
  wrapperRef: React.RefObject<HTMLDivElement>;
  onEditorFocus?: (ref: RichTextEditorRef) => void;
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
}) {
  const [activeEditorId, setActiveEditorId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textStyle = getFontStyle(fontType, fontSize);

  const descRef = useRef<RichTextEditorRef>(null);
  const itemLabelRefs = useRef<Map<string, RichTextEditorRef>>(new Map());
  const itemContentRefs = useRef<Map<string, RichTextEditorRef>>(new Map());

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  return (
    <div
      ref={wrapperRef}
      className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white group"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCreate();
        }}
        title="Preview carousel"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Eye size={11} /> Preview
      </button>
      {/* Title */}
      <div className="mb-4 space-y-1">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onFocus={() => setActiveEditorId(null)}
          placeholder="Enter carousel title ..."
          className="w-full font-semibold text-gray-700 outline-none placeholder-gray-300 bg-transparent"
          style={textStyle}
        />

        {/* Description */}
        <div className="border-b border-dashed border-gray-200 pb-2">
          <p className="text-[10px] font-semibold text-gray-400 mb-0.5">
            Description
          </p>
          <RichTextEditor
            ref={descRef}
            value={description}
            onChange={onDescriptionChange}
            placeholder="Add a description ..."
            className="text-gray-400 min-h-[1.5em]"
            style={textStyle}
            onFocus={() => {
              setActiveEditorId("desc");
              if (descRef.current) onEditorFocus?.(descRef.current);
            }}
            onBlur={() => setActiveEditorId(null)}
            onSelectionChange={
              activeEditorId === "desc" ? onSelectionChange : undefined
            }
          />
        </div>
      </div>

      {/* Cards per slide selector */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-gray-500 shrink-0">Cards per slide</span>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-300 transition min-w-[90px] justify-between"
          >
            <span>{cardsPerSlide} Card</span>
            <ChevronDown size={13} className="text-gray-400" />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-20 min-w-[90px] overflow-hidden">
              {([2, 3, 4] as CardsPerSlide[]).map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    onCardsPerSlideChange(n);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition ${
                    cardsPerSlide === n
                      ? "bg-emerald-50 text-emerald-600 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {n} Card
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Item rows */}
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="flex">
              <div className="flex items-center justify-center px-2 py-3 border-r border-gray-200 bg-gray-50 cursor-grab">
                <GripVertical size={14} className="text-gray-300" />
              </div>

              {/* Item Label */}
              <div className="w-[38%] px-3 py-2 border-r border-gray-200">
                <p className="text-[11px] font-semibold text-gray-500 mb-1">
                  Item Label
                </p>
                <RichTextEditor
                  ref={(ref) => {
                    if (ref) itemLabelRefs.current.set(item.id, ref);
                    else itemLabelRefs.current.delete(item.id);
                  }}
                  value={item.label}
                  onChange={(val) => onItemLabelChange(item.id, val)}
                  placeholder="Item label"
                  className="text-sm text-gray-700 min-h-[1.5em]"
                  onFocus={() => {
                    const editorId = `item-label-${item.id}`;
                    setActiveEditorId(editorId);
                    const ref = itemLabelRefs.current.get(item.id);
                    if (ref) onEditorFocus?.(ref);
                  }}
                  onBlur={() => setActiveEditorId(null)}
                  onSelectionChange={
                    activeEditorId === `item-label-${item.id}`
                      ? onSelectionChange
                      : undefined
                  }
                />
              </div>

              {/* Item Content */}
              <div className="flex-1 px-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-semibold text-gray-500">
                    Item Content
                  </p>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-gray-300 hover:text-red-400 transition"
                    title="Remove item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <RichTextEditor
                  ref={(ref) => {
                    if (ref) itemContentRefs.current.set(item.id, ref);
                    else itemContentRefs.current.delete(item.id);
                  }}
                  value={item.content}
                  onChange={(val) => onItemContentChange(item.id, val)}
                  placeholder="Add content for this item"
                  className="text-sm text-gray-700 min-h-[4em]"
                  onFocus={() => {
                    const editorId = `item-content-${item.id}`;
                    setActiveEditorId(editorId);
                    const ref = itemContentRefs.current.get(item.id);
                    if (ref) onEditorFocus?.(ref);
                  }}
                  onBlur={() => setActiveEditorId(null)}
                  onSelectionChange={
                    activeEditorId === `item-content-${item.id}`
                      ? onSelectionChange
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onAddItem}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-emerald-500 text-emerald-600 text-sm font-semibold hover:bg-emerald-50 transition"
        >
          <Plus size={14} />
          Add Item
        </button>
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition shadow-sm"
        >
          Create Carousel
        </button>
      </div>
    </div>
  );
}

// ─── Preview mode ─────────────────────────────────────────────────────────────
function CarouselPreview({
  title,
  description,
  items,
  cardsPerSlide,
  fontType,
  fontSize,
  onEdit,
}: {
  title: string;
  description: string;
  items: CarouselItem[];
  cardsPerSlide: CardsPerSlide;
  fontType?: string;
  fontSize?: number;
  onEdit: () => void;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(items.length / cardsPerSlide));
  const visibleItems = items.slice(
    page * cardsPerSlide,
    page * cardsPerSlide + cardsPerSlide,
  );
  const textStyle = getFontStyle(fontType, fontSize);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPage((p) => Math.max(0, p - 1));
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPage((p) => Math.min(totalPages - 1, p + 1));
  };

  return (
    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white group/preview">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title="Edit carousel"
        className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Pencil size={11} /> Edit
      </button>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-emerald-500">
          <Pencil size={15} />
        </span>
        <span className="font-bold text-gray-800" style={textStyle}>
          {title || "Carousel"}
        </span>
      </div>

      {description && (
        <div
          className="text-gray-700 leading-relaxed mb-3"
          style={textStyle}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={prev}
          disabled={page === 0}
          className="shrink-0 w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-emerald-400 hover:text-emerald-500 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} className="text-gray-500" />
        </button>

        <div
          className="flex-1 grid gap-3"
          style={{ gridTemplateColumns: `repeat(${cardsPerSlide}, 1fr)` }}
        >
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-200 bg-white overflow-hidden flex flex-col"
            >
              <div className="h-1.5 bg-emerald-500 w-full" />
              <div className="p-3 flex flex-col items-center text-center flex-1">
                <div
                  className="text-xs font-bold text-emerald-600 mb-2 leading-snug"
                  dangerouslySetInnerHTML={{
                    __html: item.label || "Item Label",
                  }}
                />
                <div
                  className="text-[11px] text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.content || "—" }}
                />
              </div>
            </div>
          ))}
          {visibleItems.length < cardsPerSlide &&
            Array.from({ length: cardsPerSlide - visibleItems.length }).map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="rounded-lg border border-dashed border-gray-200 bg-gray-50"
                />
              ),
            )}
        </div>

        <button
          onClick={next}
          disabled={page >= totalPages - 1}
          className="shrink-0 w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-emerald-400 hover:text-emerald-500 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} className="text-gray-500" />
        </button>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setPage(i);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === page ? "bg-emerald-500" : "bg-gray-300"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Controller ───────────────────────────────────────────────────────────────
export function CarouselBody({
  initialData,
  fontType,
  fontSize,
  onChangeData,
  onEditorFocus,
  onSelectionChange,
}: {
  initialData?: any;
  fontType?: string;
  fontSize?: number;
  onChangeData?: (data: any) => void;
  onEditorFocus?: (ref: RichTextEditorRef) => void;
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
}) {
  const [mode, setMode] = useState<"canvas" | "preview">("canvas");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cardsPerSlide, setCardsPerSlide] = useState<CardsPerSlide>(3);
  const [items, setItems] = useState<CarouselItem[]>([
    { id: "crs-1", label: "", content: "" },
    { id: "crs-2", label: "", content: "" },
  ]);

  const wrapperRef = useRef<HTMLDivElement>(null!);

  // ── Restore from initialData on first mount ───────────────────────────────
  useEffect(() => {
    if (initialData?.items && initialData.items.length > 0) {
      setTitle(initialData.title ?? "");
      setDescription(initialData.description ?? "");
      setCardsPerSlide(initialData.cardsPerSlide ?? 3);
      setItems(initialData.items);
      setMode("preview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddItem = () =>
    setItems((prev) => [
      ...prev,
      { id: `crs-${Date.now()}`, label: "", content: "" },
    ]);

  const handleRemoveItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const handleItemLabelChange = (id: string, value: string) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, label: value } : i)),
    );

  const handleItemContentChange = (id: string, value: string) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, content: value } : i)),
    );

  // ── Persist to page and switch to preview ─────────────────────────────────
  const handleCreate = () => {
    // Structure matches what CarouselPreview in MaterialPreviewModal expects:
    // data.items = [{ id, label (as title), content }]
    // data.cardsPerSlide
    const data = {
      title,
      description,
      cardsPerSlide,
      // MaterialPreviewModal reads item.title for label display
      items: items.map((item) => ({
        ...item,
        title: item.label, // alias for MaterialPreviewModal compatibility
      })),
    };
    onChangeData?.(data);
    setMode("preview");
  };

  if (mode === "canvas") {
    return (
      <CarouselCanvas
        title={title}
        description={description}
        items={items}
        cardsPerSlide={cardsPerSlide}
        fontType={fontType}
        fontSize={fontSize}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onCardsPerSlideChange={setCardsPerSlide}
        onItemLabelChange={handleItemLabelChange}
        onItemContentChange={handleItemContentChange}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onCreate={handleCreate}
        wrapperRef={wrapperRef}
        onEditorFocus={onEditorFocus}
        onSelectionChange={onSelectionChange}
      />
    );
  }

  return (
    <CarouselPreview
      title={title}
      description={description}
      items={items}
      cardsPerSlide={cardsPerSlide}
      fontType={fontType}
      fontSize={fontSize}
      onEdit={() => setMode("canvas")}
    />
  );
}
