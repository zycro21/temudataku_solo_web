"use client";

import { useState, useRef, useEffect } from "react";
import {
  Trash2,
  Plus,
  Pencil,
  GripVertical,
  ChevronDown,
  ChevronUp,  
  LayoutList,
  Eye,
} from "lucide-react";
import RichTextEditor, {
  type RichTextEditorRef,
} from "@/components/admin/elearning/materials/RichTextEditor";

interface ContentCardItem {
  id: string;
  title: string;
  content: string;
  expandedContent: string;
}

// ─── Canvas mode ──────────────────────────────────────────────────────────────
function ContentCardCanvas({
  title,
  description,
  cards,
  disableExpandable,
  onTitleChange,
  onDescriptionChange,
  onToggleExpandable,
  onCardChange,
  onAddCard,
  onRemoveCard,
  onMoveCard,
  onCreate,
  wrapperRef,
  onEditorFocus,
  onSelectionChange,
}: {
  title: string;
  description: string;
  cards: ContentCardItem[];
  disableExpandable: boolean;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onToggleExpandable: () => void;
  onCardChange: (
    id: string,
    field: "title" | "content" | "expandedContent",
    value: string,
  ) => void;
  onAddCard: () => void;
  onRemoveCard: (id: string) => void;
  onMoveCard: (id: string, dir: "up" | "down") => void;
  onCreate: () => void;
  wrapperRef: React.RefObject<HTMLDivElement>;
  onEditorFocus?: (ref: RichTextEditorRef) => void;
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
}) {
  const [activeEditorId, setActiveEditorId] = useState<string | null>(null);

  const descRef = useRef<RichTextEditorRef>(null);
  const cardTitleRefs = useRef<Map<string, RichTextEditorRef>>(new Map());
  const cardContentRefs = useRef<Map<string, RichTextEditorRef>>(new Map());
  const cardExpandedRefs = useRef<Map<string, RichTextEditorRef>>(new Map());

  return (
    <div
      ref={wrapperRef}
      className="relative group border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCreate();
        }}
        title="Preview content card"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Eye size={11} /> Preview
      </button>

      {/* Title */}
      <div className="mb-3 space-y-1">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onFocus={() => setActiveEditorId(null)}
          placeholder="Enter card title ..."
          className="w-full text-lg font-semibold text-gray-700 outline-none placeholder-gray-300 bg-transparent"
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
            className="text-sm text-gray-400 min-h-[1.5em]"
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

      {/* Disable expandable toggle */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-gray-500">
          Disable expandable content
        </span>
        <button
          onClick={onToggleExpandable}
          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
            disableExpandable ? "bg-emerald-500" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
              disableExpandable ? "translate-x-4.5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Card rows */}
      <div className="space-y-3 mb-4">
        {cards.map((card, idx) => (
          <div
            key={card.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="flex">
              <div className="flex flex-col items-center justify-start gap-1 px-2 py-3 border-r border-gray-200 bg-gray-50">
                <button
                  onClick={() => onRemoveCard(card.id)}
                  className="text-gray-300 hover:text-red-400 transition"
                  title="Remove card"
                >
                  <Trash2 size={13} />
                </button>
                <button
                  onClick={() => onMoveCard(card.id, "up")}
                  disabled={idx === 0}
                  className="text-gray-300 hover:text-gray-500 transition disabled:opacity-20"
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  onClick={() => onMoveCard(card.id, "down")}
                  disabled={idx === cards.length - 1}
                  className="text-gray-300 hover:text-gray-500 transition disabled:opacity-20"
                >
                  <ChevronDown size={13} />
                </button>
                <GripVertical size={13} className="text-gray-200 mt-1" />
              </div>

              <div className="flex flex-1 min-w-0">
                {/* Card Title */}
                <div className="w-[38%] px-3 py-2 border-r border-gray-200">
                  <p className="text-[11px] font-semibold text-gray-500 mb-1">
                    Card Title
                  </p>
                  <RichTextEditor
                    ref={(ref) => {
                      if (ref) cardTitleRefs.current.set(card.id, ref);
                      else cardTitleRefs.current.delete(card.id);
                    }}
                    value={card.title}
                    onChange={(val) => onCardChange(card.id, "title", val)}
                    placeholder="Card title"
                    className="text-sm text-gray-700 min-h-[1.5em]"
                    onFocus={() => {
                      const editorId = `card-title-${card.id}`;
                      setActiveEditorId(editorId);
                      const ref = cardTitleRefs.current.get(card.id);
                      if (ref) onEditorFocus?.(ref);
                    }}
                    onBlur={() => setActiveEditorId(null)}
                    onSelectionChange={
                      activeEditorId === `card-title-${card.id}`
                        ? onSelectionChange
                        : undefined
                    }
                  />
                </div>

                {/* Card Content + Expanded */}
                <div className="flex-1 px-3 py-2 space-y-2">
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 mb-1">
                      Card Content
                    </p>
                    <RichTextEditor
                      ref={(ref) => {
                        if (ref) cardContentRefs.current.set(card.id, ref);
                        else cardContentRefs.current.delete(card.id);
                      }}
                      value={card.content}
                      onChange={(val) => onCardChange(card.id, "content", val)}
                      placeholder="Add content for this card"
                      className="text-sm text-gray-700 min-h-[3em]"
                      onFocus={() => {
                        const editorId = `card-content-${card.id}`;
                        setActiveEditorId(editorId);
                        const ref = cardContentRefs.current.get(card.id);
                        if (ref) onEditorFocus?.(ref);
                      }}
                      onBlur={() => setActiveEditorId(null)}
                      onSelectionChange={
                        activeEditorId === `card-content-${card.id}`
                          ? onSelectionChange
                          : undefined
                      }
                    />
                  </div>
                  {!disableExpandable && (
                    <div className="border-t border-gray-100 pt-2">
                      <p className="text-[11px] font-semibold text-gray-500 mb-1">
                        Expanded Content
                      </p>
                      <RichTextEditor
                        ref={(ref) => {
                          if (ref) cardExpandedRefs.current.set(card.id, ref);
                          else cardExpandedRefs.current.delete(card.id);
                        }}
                        value={card.expandedContent}
                        onChange={(val) =>
                          onCardChange(card.id, "expandedContent", val)
                        }
                        placeholder="Add additional details here"
                        className="text-sm text-gray-700 min-h-[3em]"
                        onFocus={() => {
                          const editorId = `card-expanded-${card.id}`;
                          setActiveEditorId(editorId);
                          const ref = cardExpandedRefs.current.get(card.id);
                          if (ref) onEditorFocus?.(ref);
                        }}
                        onBlur={() => setActiveEditorId(null)}
                        onSelectionChange={
                          activeEditorId === `card-expanded-${card.id}`
                            ? onSelectionChange
                            : undefined
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-400">
          You can add up to 3 cards only.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddCard}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-emerald-500 text-emerald-600 text-sm font-semibold hover:bg-emerald-50 transition"
          >
            <Plus size={14} />
            Add Card
          </button>
          <button
            onClick={onCreate}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition shadow-sm"
          >
            Create Cards
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Preview mode ─────────────────────────────────────────────────────────────
function ContentCardPreview({
  title,
  description,
  cards,
  disableExpandable,
  onEdit,
}: {
  title: string;
  description: string;
  cards: ContentCardItem[];
  disableExpandable: boolean;
  onEdit: () => void;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white group/preview">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title="Edit content card"
        className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Pencil size={11} /> Edit
      </button>

      <div className="flex items-start gap-2 mb-1">
        <span className="text-emerald-500 mt-0.5">
          <LayoutList size={15} />
        </span>
        <div>
          <div
            className="text-sm font-bold text-gray-800"
            dangerouslySetInnerHTML={{ __html: title || "Content Card" }}
          />
          {description && (
            <div
              className="text-sm text-gray-500 leading-relaxed mt-0.5"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
          {!disableExpandable && (
            <p className="text-xs text-gray-400 italic mt-0.5">
              (Arahkan kursor untuk melihat detail)
            </p>
          )}
        </div>
      </div>

      <div
        className="mt-3 grid gap-3 justify-center mx-auto"
        style={{
          gridTemplateColumns: `repeat(${Math.min(cards.length, 3)}, minmax(0, 1fr))`,
        }}
      >
        {cards.map((card) => {
          const isExpanded = expandedIds.has(card.id);

          if (disableExpandable) {
            return (
              <div
                key={card.id}
                className="flex flex-col items-center text-center p-3 rounded-lg border border-gray-100 bg-gray-50"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                  <LayoutList size={16} className="text-emerald-500" />
                </div>
                <div
                  className="text-xs font-semibold text-gray-700 leading-snug mb-1"
                  dangerouslySetInnerHTML={{
                    __html: card.title || "Card Title",
                  }}
                />
                <div
                  className="text-[11px] text-gray-500 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: card.content || "—" }}
                />
              </div>
            );
          }

          return (
            <div
              key={card.id}
              className="flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden"
            >
              <div className="flex flex-col items-center text-center p-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                  <LayoutList size={14} className="text-emerald-500" />
                </div>
                <div
                  className="text-xs font-semibold text-gray-700 leading-snug mb-1"
                  dangerouslySetInnerHTML={{
                    __html: card.title || "Card Title",
                  }}
                />
                <div
                  className="text-[11px] text-gray-500 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: card.content || "—" }}
                />
              </div>

              {isExpanded && card.expandedContent && (
                <div className="px-3 pb-3 border-t border-gray-100">
                  <div
                    className="text-[11px] text-gray-500 leading-relaxed pt-2"
                    dangerouslySetInnerHTML={{ __html: card.expandedContent }}
                  />
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(card.id);
                }}
                className="mt-auto flex items-center justify-center gap-1 py-1.5 border-t border-gray-100 text-[11px] text-emerald-600 hover:bg-emerald-50 transition"
              >
                {isExpanded ? (
                  <>
                    Lihat lebih sedikit <ChevronUp size={11} />
                  </>
                ) : (
                  <>
                    Lihat lebih banyak <ChevronDown size={11} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Controller ───────────────────────────────────────────────────────────────
export function ContentCardBody({
  initialData,
  onChangeData,
  onEditorFocus,
  onSelectionChange,
}: {
  initialData?: any;
  onChangeData?: (data: any) => void;
  onEditorFocus?: (ref: RichTextEditorRef) => void;
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
}) {
  const [mode, setMode] = useState<"canvas" | "preview">("canvas");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [disableExpandable, setDisableExpandable] = useState(false);
  const [cards, setCards] = useState<ContentCardItem[]>([
    { id: "cc-1", title: "", content: "", expandedContent: "" },
    { id: "cc-2", title: "", content: "", expandedContent: "" },
  ]);

  const wrapperRef = useRef<HTMLDivElement>(null!);

  // ── Restore from initialData on first mount ───────────────────────────────
  useEffect(() => {
    if (initialData?.cards && initialData.cards.length > 0) {
      setTitle(initialData.title ?? "");
      setDescription(initialData.description ?? "");
      setDisableExpandable(initialData.disableExpandable ?? false);
      setCards(initialData.cards);
      setMode("preview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddCard = () => {
    if (cards.length >= 3) {
      alert("Maksimal hanya 3 card yang dapat ditambahkan.");
      return;
    }
    setCards((prev) => [
      ...prev,
      { id: `cc-${Date.now()}`, title: "", content: "", expandedContent: "" },
    ]);
  };

  const handleRemoveCard = (id: string) =>
    setCards((prev) => prev.filter((c) => c.id !== id));

  const handleCardChange = (
    id: string,
    field: "title" | "content" | "expandedContent",
    value: string,
  ) =>
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );

  const handleMoveCard = (id: string, dir: "up" | "down") => {
    setCards((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  };

  // ── Persist to page and switch to preview ─────────────────────────────────
  const handleCreate = () => {
    // Structure matches what ContentCardPreview in MaterialPreviewModal expects:
    // data.cards = [{ id, title, content }]
    const data = {
      title,
      description,
      disableExpandable,
      cards,
    };
    onChangeData?.(data);
    setMode("preview");
  };

  if (mode === "canvas") {
    return (
      <ContentCardCanvas
        title={title}
        description={description}
        cards={cards}
        disableExpandable={disableExpandable}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onToggleExpandable={() => setDisableExpandable((v) => !v)}
        onCardChange={handleCardChange}
        onAddCard={handleAddCard}
        onRemoveCard={handleRemoveCard}
        onMoveCard={handleMoveCard}
        onCreate={handleCreate}
        wrapperRef={wrapperRef}
        onEditorFocus={onEditorFocus}
        onSelectionChange={onSelectionChange}
      />
    );
  }

  return (
    <ContentCardPreview
      title={title}
      description={description}
      cards={cards}
      disableExpandable={disableExpandable}
      onEdit={() => setMode("canvas")}
    />
  );
}
