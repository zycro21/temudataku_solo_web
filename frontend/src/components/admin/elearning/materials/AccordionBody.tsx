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

// ─── Types ────────────────────────────────────────────────────────────────────
interface AccordionItem {
  id: string;
}

export interface AccordionBodyProps {
  /** Initial saved data (from item.data) */
  initialData?: any;
  /** Called whenever accordion data changes so page.tsx can persist it */
  onChangeData?: (data: any) => void;
  /** Called whenever the user focuses a field inside this accordion */
  onEditorFocus?: (ref: RichTextEditorRef) => void;
  /** Called when selection/format state changes inside the active field */
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Accordion Preview (inside dashed border) ────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AccordionPreview({
  titleHTML,
  descriptionHTML,
  itemsData: items,
  onEdit,
}: {
  titleHTML: string;
  descriptionHTML: string;
  itemsData: { id: string; titleHTML: string; contentHTML: string }[];
  onEdit: () => void;
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(items.slice(0, 2).map((i) => i.id)),
  );

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
      {/* Edit button */}
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

      {/* Header */}
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
            className="text-sm font-bold text-gray-700"
            dangerouslySetInnerHTML={{ __html: titleHTML }}
          />
        )}
      </div>

      {/* Description */}
      {!isEmpty(descriptionHTML) && (
        <div
          className="text-sm text-gray-500 mb-3 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: descriptionHTML }}
        />
      )}

      {/* Accordion items */}
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
                    className="text-sm font-semibold text-gray-700 text-left"
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
                      className="text-sm text-gray-600 leading-relaxed"
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
// ─── AccordionCanvasWithRefs ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AccordionCanvasWithRefs({
  items,
  onAddItem,
  onRemoveItem,
  onCreate,
  wrapperRef,
  onEditorFocus,
  onSelectionChange,
  editorRefsMap,
}: {
  items: AccordionItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onCreate: () => void;
  wrapperRef: React.RefObject<HTMLDivElement>;
  onEditorFocus?: (ref: RichTextEditorRef) => void;
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
  editorRefsMap: Map<string, RichTextEditorRef>;
}) {
  const setRef = useCallback(
    (key: string) => (ref: RichTextEditorRef | null) => {
      if (ref) editorRefsMap.set(key, ref);
      else editorRefsMap.delete(key);
    },
    [editorRefsMap],
  );

  const handleFocus = useCallback(
    (key: string) => () => {
      const ref = editorRefsMap.get(key);
      if (ref) onEditorFocus?.(ref);
    },
    [editorRefsMap, onEditorFocus],
  );

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
          ref={setRef("title")}
          placeholder="Enter accordion title ..."
          className="text-lg font-semibold text-gray-700 w-full"
          onFocus={handleFocus("title")}
          onSelectionChange={onSelectionChange}
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <RichTextEditor
          ref={setRef("description")}
          placeholder="Add a description ..."
          className="text-sm text-gray-400 w-full"
          onFocus={handleFocus("description")}
          onSelectionChange={onSelectionChange}
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
                  ref={setRef(`${item.id}-title`)}
                  placeholder="Accordion item title"
                  className="text-sm text-gray-700 w-full"
                  onFocus={handleFocus(`${item.id}-title`)}
                  onSelectionChange={onSelectionChange}
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
                  ref={setRef(`${item.id}-content`)}
                  placeholder="Add content for this section"
                  className="text-sm text-gray-700 w-full min-h-[5em]"
                  onFocus={handleFocus(`${item.id}-content`)}
                  onSelectionChange={onSelectionChange}
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
  onChangeData,
  onEditorFocus,
  onSelectionChange,
}: AccordionBodyProps) {
  const [mode, setMode] = useState<"canvas" | "preview">("canvas");
  const [items, setItems] = useState<AccordionItem[]>([
    { id: "acc-1" },
    { id: "acc-2" },
  ]);

  const [snapshot, setSnapshot] = useState<{
    titleHTML: string;
    descriptionHTML: string;
    itemsData: { id: string; titleHTML: string; contentHTML: string }[];
  } | null>(null);

  const canvasEditorRefs = useRef<Map<string, RichTextEditorRef>>(new Map());
  const wrapperRef = useRef<HTMLDivElement>(null!);

  // ── Restore from initialData on first mount ───────────────────────────────
  // If page already has saved data (e.g. after duplicate), restore snapshot
  useEffect(() => {
    if (initialData?.panels && initialData.panels.length > 0) {
      const panels = initialData.panels as {
        id: string;
        titleHTML: string;
        contentHTML: string;
      }[];
      setItems(panels.map((p) => ({ id: p.id })));
      setSnapshot({
        titleHTML: initialData.titleHTML ?? "",
        descriptionHTML: initialData.descriptionHTML ?? "",
        itemsData: panels,
      });
      setMode("preview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Capture snapshot & persist to page ───────────────────────────────────
  const handleCreate = () => {
    const titleHTML = canvasEditorRefs.current.get("title")?.getHTML() ?? "";
    const descriptionHTML =
      canvasEditorRefs.current.get("description")?.getHTML() ?? "";
    const itemsData = items.map((item) => ({
      id: item.id,
      titleHTML:
        canvasEditorRefs.current.get(`${item.id}-title`)?.getHTML() ?? "",
      contentHTML:
        canvasEditorRefs.current.get(`${item.id}-content`)?.getHTML() ?? "",
    }));

    const newSnapshot = { titleHTML, descriptionHTML, itemsData };
    setSnapshot(newSnapshot);
    setMode("preview");

    // ── KEY FIX: persist data upward so MaterialPreviewModal can read it ──
    // Structure matches what AccordionPreview in MaterialPreviewModal expects:
    // data.panels = [{ id, titleHTML, contentHTML }]
    onChangeData?.({
      titleHTML,
      descriptionHTML,
      panels: itemsData,
    });
  };

  const handleEditorFocus = useCallback(
    (ref: RichTextEditorRef) => {
      onEditorFocus?.(ref);
    },
    [onEditorFocus],
  );

  const handleAddItem = () =>
    setItems((prev) => [...prev, { id: `acc-${Date.now()}` }]);

  const handleRemoveItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  if (mode === "canvas") {
    return (
      <AccordionCanvasWithRefs
        items={items}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onCreate={handleCreate}
        wrapperRef={wrapperRef}
        onEditorFocus={handleEditorFocus}
        onSelectionChange={onSelectionChange}
        editorRefsMap={canvasEditorRefs.current}
      />
    );
  }

  if (!snapshot) return null;

  return (
    <AccordionPreview
      titleHTML={snapshot.titleHTML}
      descriptionHTML={snapshot.descriptionHTML}
      itemsData={snapshot.itemsData}
      onEdit={() => setMode("canvas")}
    />
  );
}
