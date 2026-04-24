"use client";

import { useState, useRef, useEffect } from "react";
import {
  Trash2,
  Plus,
  Pencil,
  GripVertical,
  ArrowRight,
  Eye,
} from "lucide-react";
import RichTextEditor, {
  type RichTextEditorRef,
} from "@/components/admin/elearning/materials/RichTextEditor";

interface MatchPair {
  id: string;
  question: string;
  answer: string;
}

// ─── Canvas edit mode ─────────────────────────────────────────────────────────
function MatchingCanvas({
  title,
  description,
  pairs,
  onTitleChange,
  onDescriptionChange,
  onPairChange,
  onAddPair,
  onRemovePair,
  onCreate,
  wrapperRef,
  onEditorFocus,
  onSelectionChange,
}: {
  title: string;
  description: string;
  pairs: MatchPair[];
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onPairChange: (
    id: string,
    field: "question" | "answer",
    value: string,
  ) => void;
  onAddPair: () => void;
  onRemovePair: (id: string) => void;
  onCreate: () => void;
  wrapperRef: React.RefObject<HTMLDivElement>;
  onEditorFocus?: (ref: RichTextEditorRef) => void;
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
}) {
  const [activeEditorId, setActiveEditorId] = useState<string | null>(null);
  const descRef = useRef<RichTextEditorRef>(null);
  const questionRefs = useRef<Map<string, RichTextEditorRef>>(new Map());
  const answerRefs = useRef<Map<string, RichTextEditorRef>>(new Map());

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
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Eye size={11} /> Preview
      </button>

      <div className="mb-4 space-y-1">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onFocus={() => setActiveEditorId(null)}
          placeholder="Enter matching title ..."
          className="w-full text-lg font-semibold text-gray-700 outline-none placeholder-gray-300 bg-transparent"
        />
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

      <div className="space-y-0 mb-4 border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
        {pairs.map((pair) => (
          <div key={pair.id} className="flex">
            <div className="flex items-center justify-center px-2 border-r border-gray-200 bg-gray-50 cursor-grab">
              <GripVertical size={14} className="text-gray-300" />
            </div>
            <div className="flex-1 px-3 py-2.5 border-r border-gray-200">
              <p className="text-[11px] font-semibold text-gray-500 mb-1">
                Question / Term
              </p>
              <RichTextEditor
                ref={(ref) => {
                  if (ref) questionRefs.current.set(pair.id, ref);
                  else questionRefs.current.delete(pair.id);
                }}
                value={pair.question}
                onChange={(val) => onPairChange(pair.id, "question", val)}
                placeholder="Enter question or term"
                className="text-sm text-gray-700 min-h-[2em]"
                onFocus={() => {
                  const editorId = `q-${pair.id}`;
                  setActiveEditorId(editorId);
                  const ref = questionRefs.current.get(pair.id);
                  if (ref) onEditorFocus?.(ref);
                }}
                onBlur={() => setActiveEditorId(null)}
                onSelectionChange={
                  activeEditorId === `q-${pair.id}`
                    ? onSelectionChange
                    : undefined
                }
              />
            </div>
            <div className="flex-1 px-3 py-2.5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-semibold text-gray-500">
                  Answer / Match
                </p>
                <button
                  onClick={() => onRemovePair(pair.id)}
                  className="text-gray-300 hover:text-red-400 transition ml-2"
                  title="Remove pair"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <RichTextEditor
                ref={(ref) => {
                  if (ref) answerRefs.current.set(pair.id, ref);
                  else answerRefs.current.delete(pair.id);
                }}
                value={pair.answer}
                onChange={(val) => onPairChange(pair.id, "answer", val)}
                placeholder="Enter matching answer"
                className="text-sm text-gray-700 min-h-[2em]"
                onFocus={() => {
                  const editorId = `a-${pair.id}`;
                  setActiveEditorId(editorId);
                  const ref = answerRefs.current.get(pair.id);
                  if (ref) onEditorFocus?.(ref);
                }}
                onBlur={() => setActiveEditorId(null)}
                onSelectionChange={
                  activeEditorId === `a-${pair.id}`
                    ? onSelectionChange
                    : undefined
                }
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onAddPair}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-emerald-500 text-emerald-600 text-sm font-semibold hover:bg-emerald-50 transition"
        >
          <Plus size={14} />
          Add Pair
        </button>
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition shadow-sm"
        >
          Create Quiz
        </button>
      </div>
    </div>
  );
}

// ─── Canvas preview mode ──────────────────────────────────────────────────────
type Chip = { id: string; value: string };

function MatchingPreview({
  title,
  description,
  pairs,
  onEdit,
}: {
  title: string;
  description: string;
  pairs: MatchPair[];
  onEdit: () => void;
}) {
  const [availableChips, setAvailableChips] = useState<Chip[]>(() =>
    pairs
      .map((p, i) => ({ id: `${p.id}-chip-${i}`, value: p.answer }))
      .sort(() => Math.random() - 0.5),
  );
  const [slots, setSlots] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(pairs.map((p) => [p.id, null])),
  );
  const [dragging, setDragging] = useState<Chip | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<"pool" | string | null>(
    null,
  );
  const [submitted, setSubmitted] = useState(false);

  const startDragChip = (chip: Chip, from: "pool" | string) => {
    setDragging(chip);
    setDraggingFrom(from);
  };

  const dropOnSlot = (qId: string) => {
    if (!dragging) return;
    setSlots((prev) => {
      const next = { ...prev };
      const existing = next[qId];
      if (draggingFrom === "pool") {
        setAvailableChips((chips) => chips.filter((c) => c.id !== dragging.id));
        if (existing) {
          setAvailableChips((chips) => [
            ...chips,
            { id: `${qId}-return-${Date.now()}`, value: existing },
          ]);
        }
      } else if (draggingFrom !== null) {
        next[draggingFrom] = existing;
      }
      next[qId] = dragging.value;
      return next;
    });
    setDragging(null);
    setDraggingFrom(null);
  };

  const dropOnPool = () => {
    if (!dragging || draggingFrom === "pool") return;
    if (draggingFrom !== null) {
      setSlots((prev) => ({ ...prev, [draggingFrom]: null }));
      setAvailableChips((chips) => [
        ...chips,
        { id: `${dragging.id}-return`, value: dragging.value },
      ]);
    }
    setDragging(null);
    setDraggingFrom(null);
  };

  return (
    <div className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white group/preview">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Pencil size={11} /> Edit
      </button>
      <div className="px-6 pt-6 pb-4 text-start">
        <p className="text-xl font-bold text-gray-800">
          {title || "Matching Quiz"}
        </p>
        {description && (
          <div
            className="text-sm text-gray-500 mt-2"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
      </div>
      <div className="px-6 pb-3">
        <div
          className="flex flex-wrap justify-center gap-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.stopPropagation();
            dropOnPool();
          }}
        >
          {availableChips.map((chip) => (
            <div
              key={chip.id}
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                startDragChip(chip, "pool");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-sm font-medium text-gray-700 cursor-grab active:cursor-grabbing hover:bg-gray-100 transition shadow-sm"
            >
              <GripVertical size={16} className="text-gray-400" />
              <span dangerouslySetInnerHTML={{ __html: chip.value }} />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 italic mt-3 text-center">
          (Seret dan lepaskan card di atas ke area kosong yang tersedia)
        </p>
      </div>
      <div className="px-6 pb-5 space-y-3">
        {pairs.map((pair) => {
          const slotValue = slots[pair.id];
          const isCorrect = submitted && slotValue === pair.answer;
          const isWrong =
            submitted && slotValue !== null && slotValue !== pair.answer;
          return (
            <div key={pair.id} className="flex items-center gap-3">
              <div
                className="flex-1 px-4 py-2.5 rounded-md bg-gray-100 text-sm text-gray-700"
                dangerouslySetInnerHTML={{ __html: pair.question || "—" }}
              />
              <ArrowRight size={20} className="text-emerald-500" />
              <div
                className={`flex-1 min-h-[42px] rounded-md border border-dashed flex items-center justify-center transition ${
                  slotValue
                    ? isCorrect
                      ? "border-emerald-400 bg-emerald-50"
                      : isWrong
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 bg-white"
                    : "border-gray-300 bg-white"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.stopPropagation();
                  dropOnSlot(pair.id);
                }}
              >
                {slotValue ? (
                  <div
                    draggable={!submitted}
                    onDragStart={(e) => {
                      if (submitted) return;
                      e.stopPropagation();
                      startDragChip(
                        { id: `${pair.id}-slot`, value: slotValue },
                        pair.id,
                      );
                    }}
                    className="px-3 py-1.5 rounded-md text-sm border bg-gray-100 border-gray-300 cursor-grab"
                    dangerouslySetInnerHTML={{ __html: slotValue }}
                  />
                ) : (
                  <span className="text-xs text-gray-300">Drop di sini</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-6 pb-5 flex justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSubmitted(true);
          }}
          disabled={submitted}
          className="px-8 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition shadow-sm disabled:opacity-60"
        >
          Submit Jawaban
        </button>
      </div>
    </div>
  );
}

// ─── Controller ───────────────────────────────────────────────────────────────
export function MatchingBody({
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
  const [pairs, setPairs] = useState<MatchPair[]>([
    { id: "mp-1", question: "", answer: "" },
    { id: "mp-2", question: "", answer: "" },
  ]);

  const wrapperRef = useRef<HTMLDivElement>(null!);

  // ── Restore from initialData on first mount ───────────────────────────────
  useEffect(() => {
    if (initialData?.pairs && initialData.pairs.length > 0) {
      setTitle(initialData.title ?? "");
      setDescription(initialData.description ?? "");
      setPairs(initialData.pairs);
      setMode("preview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddPair = () =>
    setPairs((prev) => [
      ...prev,
      { id: `mp-${Date.now()}`, question: "", answer: "" },
    ]);

  const handleRemovePair = (id: string) =>
    setPairs((prev) => prev.filter((p) => p.id !== id));

  const handlePairChange = (
    id: string,
    field: "question" | "answer",
    value: string,
  ) =>
    setPairs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );

  // ── Persist to page and switch to preview ─────────────────────────────────
  const handleCreate = () => {
    // MaterialPreviewModal.MatchingPreview reads:
    //   data.title, data.description, data.pairs[].{id, question, answer}
    onChangeData?.({ title, description, pairs });
    setMode("preview");
  };

  if (mode === "canvas") {
    return (
      <MatchingCanvas
        title={title}
        description={description}
        pairs={pairs}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onPairChange={handlePairChange}
        onAddPair={handleAddPair}
        onRemovePair={handleRemovePair}
        onCreate={handleCreate}
        wrapperRef={wrapperRef}
        onEditorFocus={onEditorFocus}
        onSelectionChange={onSelectionChange}
      />
    );
  }

  return (
    <MatchingPreview
      title={title}
      description={description}
      pairs={pairs}
      onEdit={() => setMode("canvas")}
    />
  );
}
