"use client";

import { useState, useRef, useEffect } from "react";
import {
  Trash2,
  Plus,
  Pencil,
  GripVertical,
  ChevronDown,
  Eye,
} from "lucide-react";
import RichTextEditor, {
  type RichTextEditorRef,
} from "@/components/admin/elearning/materials/RichTextEditor";

interface TrueFalseQuestion {
  id: string;
  statement: string;
  answer: "true" | "false" | null;
}

// ─── Answer Dropdown ──────────────────────────────────────────────────────────
function AnswerDropdown({
  value,
  onChange,
}: {
  value: "true" | "false" | null;
  onChange: (v: "true" | "false" | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const label =
    value === "true" ? "True" : value === "false" ? "False" : "Select answer";

  return (
    <div className="relative z-50" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-500 hover:border-gray-300 transition min-w-[140px]"
      >
        <span className={value ? "text-gray-700" : "text-gray-400"}>
          {label}
        </span>
        <ChevronDown size={13} className="text-gray-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-50 min-w-full overflow-hidden">
          {(["true", "false"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition capitalize ${
                value === opt
                  ? "bg-emerald-50 text-emerald-600 font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {opt === "true" ? "True" : "False"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Canvas edit mode ─────────────────────────────────────────────────────────
function TrueFalseCanvas({
  title,
  description,
  questions,
  onTitleChange,
  onDescriptionChange,
  onQuestionChange,
  onAnswerChange,
  onAddQuestion,
  onRemoveQuestion,
  onCreate,
  wrapperRef,
  onEditorFocus,
  onSelectionChange,
}: {
  title: string;
  description: string;
  questions: TrueFalseQuestion[];
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onQuestionChange: (id: string, v: string) => void;
  onAnswerChange: (id: string, v: "true" | "false" | null) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (id: string) => void;
  onCreate: () => void;
  wrapperRef: React.RefObject<HTMLDivElement>;
  onEditorFocus?: (ref: RichTextEditorRef) => void;
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
}) {
  const [activeEditorId, setActiveEditorId] = useState<string | null>(null);
  const descRef = useRef<RichTextEditorRef>(null);
  const questionRefs = useRef<Map<string, RichTextEditorRef>>(new Map());

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
          placeholder="Enter true or false title ..."
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

      <div className="space-y-3 mb-4">
        {questions.map((q) => (
          <div
            key={q.id}
            className="border border-gray-200 rounded-lg overflow-visible"
          >
            <div className="flex">
              <div className="flex items-center justify-center px-2 py-3 border-r border-gray-200 bg-gray-50 cursor-grab">
                <GripVertical size={14} className="text-gray-300" />
              </div>
              <div className="flex flex-1 min-w-0">
                <div className="flex-1 px-3 py-2 border-r border-gray-200">
                  <p className="text-[11px] font-semibold text-gray-500 mb-1">
                    Question
                  </p>
                  <RichTextEditor
                    ref={(ref) => {
                      if (ref) questionRefs.current.set(q.id, ref);
                      else questionRefs.current.delete(q.id);
                    }}
                    value={q.statement}
                    onChange={(val) => onQuestionChange(q.id, val)}
                    placeholder="Enter a true or false statement"
                    className="text-sm text-gray-700 min-h-[4em]"
                    onFocus={() => {
                      const editorId = `question-${q.id}`;
                      setActiveEditorId(editorId);
                      const ref = questionRefs.current.get(q.id);
                      if (ref) onEditorFocus?.(ref);
                    }}
                    onBlur={() => setActiveEditorId(null)}
                    onSelectionChange={
                      activeEditorId === `question-${q.id}`
                        ? onSelectionChange
                        : undefined
                    }
                  />
                </div>
                <div className="px-3 py-2 min-w-[160px]">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] font-semibold text-gray-500">
                      Correct Answer
                    </p>
                    <button
                      onClick={() => onRemoveQuestion(q.id)}
                      className="text-gray-300 hover:text-red-400 transition ml-2"
                      title="Remove question"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <AnswerDropdown
                    value={q.answer}
                    onChange={(v) => onAnswerChange(q.id, v)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onAddQuestion}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-emerald-500 text-emerald-600 text-sm font-semibold hover:bg-emerald-50 transition"
        >
          <Plus size={14} />
          Add Question
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
function TrueFalsePreview({
  title,
  description,
  questions,
  onEdit,
}: {
  title: string;
  description: string;
  questions: TrueFalseQuestion[];
  onEdit: () => void;
}) {
  const [answers, setAnswers] = useState<
    Record<string, "true" | "false" | null>
  >({});
  const [submitted, setSubmitted] = useState(false);

  const pick = (id: string, val: "true" | "false") => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [id]: prev[id] === val ? null : val }));
  };

  return (
    <div className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white group/preview">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title="Edit quiz"
        className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Pencil size={11} /> Edit
      </button>

      <div className="px-6 pt-5 pb-4">
        <p className="text-sm font-semibold text-gray-800">
          {title || "True or False Quiz"}
        </p>
        <div
          className="text-xs text-gray-500 mt-1 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html:
              description ||
              "Pilih pernyataan yang benar (True) dan salah (False).",
          }}
        />
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-t border-b border-gray-200">
            <th className="w-10 py-2.5 px-4 text-left text-xs font-semibold text-gray-500">
              No
            </th>
            <th className="py-2.5 px-4 text-left text-xs font-semibold text-gray-500">
              Pernyataan
            </th>
            <th className="w-20 py-2.5 px-4 text-center text-xs font-semibold text-gray-500">
              Benar
            </th>
            <th className="w-20 py-2.5 px-4 text-center text-xs font-semibold text-gray-500">
              Salah
            </th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, idx) => {
            const studentAns = answers[q.id] ?? null;
            return (
              <tr
                key={q.id}
                className="border-b border-gray-100 last:border-b-0"
              >
                <td className="py-3 px-4 text-sm text-gray-500 align-middle">
                  {idx + 1}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 align-middle leading-snug">
                  <div
                    dangerouslySetInnerHTML={{ __html: q.statement || "—" }}
                  />
                </td>
                <td className="py-3 px-4 align-middle text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      pick(q.id, "true");
                    }}
                    className={`relative w-5 h-5 rounded-full border-2 mx-auto transition ${studentAns === "true" ? "border-emerald-500 bg-emerald-500" : "border-gray-300 hover:border-emerald-400"}`}
                  >
                    {studentAns === "true" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                </td>
                <td className="py-3 px-4 align-middle text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      pick(q.id, "false");
                    }}
                    className={`relative w-5 h-5 rounded-full border-2 mx-auto transition ${studentAns === "false" ? "border-emerald-500 bg-emerald-500" : "border-gray-300 hover:border-emerald-400"}`}
                  >
                    {studentAns === "false" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="px-6 py-4 flex justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSubmitted(true);
          }}
          className="px-8 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition shadow-sm"
        >
          Submit Jawaban
        </button>
      </div>
    </div>
  );
}

// ─── Controller ───────────────────────────────────────────────────────────────
export function TrueFalseBody({
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
  const [questions, setQuestions] = useState<TrueFalseQuestion[]>([
    { id: "tf-1", statement: "", answer: null },
  ]);

  const wrapperRef = useRef<HTMLDivElement>(null!);

  // ── Restore from initialData on first mount ───────────────────────────────
  useEffect(() => {
    if (initialData?.questions && initialData.questions.length > 0) {
      setTitle(initialData.title ?? "");
      setDescription(initialData.description ?? "");
      setQuestions(initialData.questions);
      setMode("preview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddQuestion = () =>
    setQuestions((prev) => [
      ...prev,
      { id: `tf-${Date.now()}`, statement: "", answer: null },
    ]);

  const handleRemoveQuestion = (id: string) =>
    setQuestions((prev) => prev.filter((q) => q.id !== id));

  const handleQuestionChange = (id: string, v: string) =>
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, statement: v } : q)),
    );

  const handleAnswerChange = (id: string, v: "true" | "false" | null) =>
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, answer: v } : q)),
    );

  // ── Persist to page and switch to preview ─────────────────────────────────
  const handleCreate = () => {
    // MaterialPreviewModal.TrueFalsePreview reads:
    //   data.title, data.description, data.questions[].{id, statement, answer}
    onChangeData?.({ title, description, questions });
    setMode("preview");
  };

  if (mode === "canvas") {
    return (
      <TrueFalseCanvas
        title={title}
        description={description}
        questions={questions}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onQuestionChange={handleQuestionChange}
        onAnswerChange={handleAnswerChange}
        onAddQuestion={handleAddQuestion}
        onRemoveQuestion={handleRemoveQuestion}
        onCreate={handleCreate}
        wrapperRef={wrapperRef}
        onEditorFocus={onEditorFocus}
        onSelectionChange={onSelectionChange}
      />
    );
  }

  return (
    <TrueFalsePreview
      title={title}
      description={description}
      questions={questions}
      onEdit={() => setMode("canvas")}
    />
  );
}
