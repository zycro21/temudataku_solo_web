"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Trash2,
  Plus,
  Pencil,
  AlignLeft,
  ChevronUp,
  ChevronDown,
  Eye,
} from "lucide-react";
import RichTextEditor, { type RichTextEditorRef } from "./RichTextEditor";
import { getFontStyle } from "./fontStyles";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AccordionItem {
  id: string;
  titleHTML: string;
  contentHTML: string;
}

export interface AccordionBodyProps {
  initialData?: any;
  fontType?: string;
  fontSize?: number;
  onChangeData?: (data: any) => void;
  onEditorFocus?: (ref: RichTextEditorRef) => void;
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Accordion Preview ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AccordionPreview({
  titleHTML,
  descriptionHTML,
  items,
  fontType,
  fontSize,
  onEdit,
}: {
  titleHTML: string;
  descriptionHTML: string;
  items: AccordionItem[];
  fontType?: string;
  fontSize?: number;
  onEdit: () => void;
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(items.slice(0, 2).map((i) => i.id)),
  );
  const textStyle = getFontStyle(fontType, fontSize);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isEmpty = (html: string) =>
    !html || html === "<br>" || html.trim() === "";

  return (
    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white group/preview">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title="Edit accordion"
        className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Pencil size={11} />
        Edit
      </button>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-emerald-500">
          <AlignLeft size={15} />
        </span>
        {isEmpty(titleHTML) ? (
          <span className="text-sm font-bold text-gray-400 italic">
            Accordion
          </span>
        ) : (
          <div
            className="font-bold text-gray-700"
            style={textStyle}
            dangerouslySetInnerHTML={{ __html: titleHTML }}
          />
        )}
      </div>

      {!isEmpty(descriptionHTML) && (
        <div
          className="text-gray-500 mb-3 leading-relaxed"
          style={textStyle}
          dangerouslySetInnerHTML={{ __html: descriptionHTML }}
        />
      )}

      <div className="space-y-2">
        {items.map((item) => {
          const isOpen = openIds.has(item.id);
          return (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(item.id);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition"
              >
                {isEmpty(item.titleHTML) ? (
                  <span className="text-sm font-semibold text-gray-400 italic text-left">
                    Item Title
                  </span>
                ) : (
                  <div
                    className="font-semibold text-gray-700 text-left"
                    style={textStyle}
                    dangerouslySetInnerHTML={{ __html: item.titleHTML }}
                  />
                )}
                {isOpen ? (
                  <ChevronUp size={16} className="text-emerald-500 shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-100">
                  {isEmpty(item.contentHTML) ? (
                    <p className="text-sm text-gray-400 italic">—</p>
                  ) : (
                    <div
                      className="text-gray-600 leading-relaxed"
                      style={textStyle}
                      dangerouslySetInnerHTML={{ __html: item.contentHTML }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Accordion Canvas ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AccordionCanvas({
  titleHTML,
  descriptionHTML,
  items,
  fontType,
  fontSize,
  onTitleChange,
  onDescriptionChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onCreate,
  wrapperRef,
  onEditorFocus,
  onSelectionChange,
}: {
  titleHTML: string;
  descriptionHTML: string;
  items: AccordionItem[];
  fontType?: string;
  fontSize?: number;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onItemChange: (
    id: string,
    field: "titleHTML" | "contentHTML",
    value: string,
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onCreate: () => void;
  wrapperRef: React.RefObject<HTMLDivElement>;
  onEditorFocus?: (ref: RichTextEditorRef) => void;
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
}) {
  const [activeEditorId, setActiveEditorId] = useState<string | null>(null);
  const textStyle = getFontStyle(fontType, fontSize);

  const titleRef = useRef<RichTextEditorRef>(null);
  const descRef = useRef<RichTextEditorRef>(null);
  const itemTitleRefs = useRef<Map<string, RichTextEditorRef>>(new Map());
  const itemContentRefs = useRef<Map<string, RichTextEditorRef>>(new Map());

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
        title="Preview accordion"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Eye size={11} />
        Preview
      </button>

      {/* Title */}
      <div className="mb-1">
        <RichTextEditor
          ref={titleRef}
          value={titleHTML}
          onChange={onTitleChange}
          placeholder="Enter accordion title ..."
          className="font-semibold text-gray-700 w-full"
          style={textStyle}
          onFocus={() => {
            setActiveEditorId("title");
            if (titleRef.current) onEditorFocus?.(titleRef.current);
          }}
          onBlur={() => setActiveEditorId(null)}
          onSelectionChange={
            activeEditorId === "title" ? onSelectionChange : undefined
          }
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <RichTextEditor
          ref={descRef}
          value={descriptionHTML}
          onChange={onDescriptionChange}
          placeholder="Add a description ..."
          className="text-gray-400 w-full"
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

      {/* Items */}
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="grid grid-cols-2">
              {/* Left: Item Title */}
              <div className="px-3 py-2 border-r border-gray-200">
                <p className="text-[11px] font-semibold text-gray-500 mb-1">
                  Item Title
                </p>
                <RichTextEditor
                  ref={(ref) => {
                    if (ref) itemTitleRefs.current.set(item.id, ref);
                    else itemTitleRefs.current.delete(item.id);
                  }}
                  value={item.titleHTML}
                  onChange={(val) => onItemChange(item.id, "titleHTML", val)}
                  placeholder="Accordion item title"
                  className="text-gray-700 w-full"
                  style={textStyle}
                  onFocus={() => {
                    const editorId = `${item.id}-title`;
                    setActiveEditorId(editorId);
                    const ref = itemTitleRefs.current.get(item.id);
                    if (ref) onEditorFocus?.(ref);
                  }}
                  onBlur={() => setActiveEditorId(null)}
                  onSelectionChange={
                    activeEditorId === `${item.id}-title`
                      ? onSelectionChange
                      : undefined
                  }
                />
              </div>

              {/* Right: Item Content */}
              <div className="px-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-semibold text-gray-500">
                    Item Content
                  </p>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-gray-300 hover:text-red-400 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <RichTextEditor
                  ref={(ref) => {
                    if (ref) itemContentRefs.current.set(item.id, ref);
                    else itemContentRefs.current.delete(item.id);
                  }}
                  value={item.contentHTML}
                  onChange={(val) => onItemChange(item.id, "contentHTML", val)}
                  placeholder="Add content for this section"
                  className="text-gray-700 w-full min-h-[5em]"
                  style={textStyle}
                  onFocus={() => {
                    const editorId = `${item.id}-content`;
                    setActiveEditorId(editorId);
                    const ref = itemContentRefs.current.get(item.id);
                    if (ref) onEditorFocus?.(ref);
                  }}
                  onBlur={() => setActiveEditorId(null)}
                  onSelectionChange={
                    activeEditorId === `${item.id}-content`
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
          Create Accordion
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── AccordionBody (stateful controller) ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export function AccordionBody({
  initialData,
  fontType,
  fontSize,
  onChangeData,
  onEditorFocus,
  onSelectionChange,
}: AccordionBodyProps) {
  const [mode, setMode] = useState<"canvas" | "preview">("canvas");

  // ── Semua konten disimpan di state (bukan di DOM refs) ────────────────────
  const [titleHTML, setTitleHTML] = useState("");
  const [descriptionHTML, setDescriptionHTML] = useState("");
  const [items, setItems] = useState<AccordionItem[]>([
    { id: "acc-1", titleHTML: "", contentHTML: "" },
    { id: "acc-2", titleHTML: "", contentHTML: "" },
  ]);

  const wrapperRef = useRef<HTMLDivElement>(null!);

  // ── Restore from initialData on first mount ───────────────────────────────
  useEffect(() => {
    if (initialData?.panels && initialData.panels.length > 0) {
      const panels = initialData.panels as AccordionItem[];
      setTitleHTML(initialData.titleHTML ?? "");
      setDescriptionHTML(initialData.descriptionHTML ?? "");
      setItems(panels);
      setMode("preview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleItemChange = (
    id: string,
    field: "titleHTML" | "contentHTML",
    value: string,
  ) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    );

  const handleAddItem = () =>
    setItems((prev) => [
      ...prev,
      { id: `acc-${Date.now()}`, titleHTML: "", contentHTML: "" },
    ]);

  const handleRemoveItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  // ── Switch ke preview dan persist data ke atas ────────────────────────────
  const handleCreate = () => {
    onChangeData?.({
      titleHTML,
      descriptionHTML,
      panels: items,
    });
    setMode("preview");
  };

  if (mode === "canvas") {
    return (
      <AccordionCanvas
        titleHTML={titleHTML}
        descriptionHTML={descriptionHTML}
        items={items}
        fontType={fontType}
        fontSize={fontSize}
        onTitleChange={setTitleHTML}
        onDescriptionChange={setDescriptionHTML}
        onItemChange={handleItemChange}
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
    <AccordionPreview
      titleHTML={titleHTML}
      descriptionHTML={descriptionHTML}
      items={items}
      fontType={fontType}
      fontSize={fontSize}
      onEdit={() => setMode("canvas")}
    />
  );
}
