"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, ChevronDown, Play, Eye, Copy } from "lucide-react";
import RichTextEditor, {
  type RichTextEditorRef,
} from "@/components/admin/elearning/materials/RichTextEditor";

type CodingLanguage = "javascript" | "python" | "sql" | "r" | "c++";

const LANGUAGE_LABELS: Record<CodingLanguage, string> = {
  javascript: "JavaScript",
  python: "Python",
  sql: "SQL",
  r: "R",
  "c++": "C++",
};

// ─── Language Dropdown ────────────────────────────────────────────────────────
function LanguageDropdown({
  value,
  onChange,
}: {
  value: CodingLanguage | null;
  onChange: (v: CodingLanguage) => void;
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm hover:border-gray-300 transition min-w-[180px]"
      >
        <span className={value ? "text-gray-700" : "text-gray-400"}>
          {value ? LANGUAGE_LABELS[value] : "Select a language"}
        </span>
        <ChevronDown size={14} className="text-gray-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-20 min-w-full overflow-hidden">
          {(Object.keys(LANGUAGE_LABELS) as CodingLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                onChange(lang);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition ${
                value === lang
                  ? "bg-emerald-50 text-emerald-600 font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Canvas edit mode (unchanged) ────────────────────────────────────────────
function CodingCanvas({
  title,
  description,
  language,
  question,
  expectedOutput,
  onTitleChange,
  onDescriptionChange,
  onLanguageChange,
  onQuestionChange,
  onExpectedOutputChange,
  onCreate,
  wrapperRef,
  onEditorFocus,
  onSelectionChange,
}: {
  title: string;
  description: string;
  language: CodingLanguage | null;
  question: string;
  expectedOutput: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onLanguageChange: (v: CodingLanguage) => void;
  onQuestionChange: (v: string) => void;
  onExpectedOutputChange: (v: string) => void;
  onCreate: () => void;
  wrapperRef: React.RefObject<HTMLDivElement>;
  onEditorFocus?: (ref: RichTextEditorRef) => void;
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
}) {
  const [activeEditorId, setActiveEditorId] = useState<string | null>(null);
  const descRef = useRef<RichTextEditorRef>(null);
  const questionRef = useRef<RichTextEditorRef>(null);

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

      <div className="mb-1">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onFocus={() => setActiveEditorId(null)}
          placeholder="Enter coding title ..."
          className="w-full text-lg font-semibold text-gray-700 outline-none placeholder-gray-300 bg-transparent"
        />
      </div>

      <div className="mb-5">
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

      <div className="mb-4">
        <p className="text-[12px] font-semibold text-gray-600 mb-1.5">
          Language
        </p>
        <LanguageDropdown value={language} onChange={onLanguageChange} />
      </div>

      <div className="mb-4">
        <p className="text-[12px] font-semibold text-gray-600 mb-1.5">
          Code Syntax
        </p>
        <div className="border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-emerald-400 transition">
          <RichTextEditor
            ref={questionRef}
            value={question}
            onChange={onQuestionChange}
            placeholder="Enter coding problem or instructions"
            className="text-sm text-gray-700 min-h-[5em]"
            onFocus={() => {
              setActiveEditorId("question");
              if (questionRef.current) onEditorFocus?.(questionRef.current);
            }}
            onBlur={() => setActiveEditorId(null)}
            onSelectionChange={
              activeEditorId === "question" ? onSelectionChange : undefined
            }
          />
        </div>
      </div>

      <div className="mb-2">
        <p className="text-[12px] font-semibold text-gray-600 mb-1.5">
          Expected Output
        </p>
        <textarea
          value={expectedOutput}
          onChange={(e) => onExpectedOutputChange(e.target.value)}
          onFocus={() => setActiveEditorId(null)}
          placeholder="Enter expected output here ..."
          rows={3}
          className="w-full text-sm font-mono text-gray-700 border border-gray-200 rounded-lg px-3 py-2.5 outline-none resize-none placeholder-gray-300 leading-relaxed focus:border-emerald-400 transition bg-gray-50"
        />
      </div>

      <div className="flex items-center justify-center">
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition shadow-sm"
        >
          Create Coding
        </button>
      </div>
    </div>
  );
}

// ─── Canvas preview mode ──────────────────────────────────────────────────────
function CodingPreview({
  title,
  description,
  language,
  question,
  expectedOutput,
  onEdit,
}: {
  title: string;
  description: string;
  language: CodingLanguage | null;
  question: string;
  expectedOutput: string;
  onEdit: () => void;
}) {
  const [output, setOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const handleRunCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRunning(true);
    setTimeout(() => {
      setOutput(
        expectedOutput ||
          "// Output akan muncul di sini setelah kode dijalankan.",
      );
      setRunning(false);
    }, 600);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white group/preview">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title="Edit coding"
        className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Pencil size={11} /> Edit
      </button>

      {(title || description) && (
        <div className="px-4 pt-4 pb-3">
          {title && (
            <p className="text-sm font-semibold text-gray-700 mb-0.5">
              {title}
            </p>
          )}
          {description && (
            <div
              className="text-sm text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
      )}

      <div className="mx-4 mb-3 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e2433]">
          <span className="text-[11px] font-bold text-emerald-400 tracking-widest uppercase">
            {language ? LANGUAGE_LABELS[language] : "CODE"}
          </span>
          <button
            onClick={handleRunCode}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition disabled:opacity-60"
          >
            <Play size={11} />
            {running ? "Running..." : "Run Code"}
          </button>
        </div>

        <div className="bg-[#252d3d] px-4 py-3 relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(question);
            }}
            className="absolute top-2 right-2 text-gray-400 hover:text-white transition"
            title="Copy code"
          >
            <Copy size={14} />
          </button>
          <textarea
            value={question}
            readOnly
            onClick={(e) => e.stopPropagation()}
            rows={5}
            spellCheck={false}
            className="w-full bg-transparent text-sm font-mono text-gray-200 outline-none resize-none leading-relaxed caret-transparent"
          />
        </div>

        {output !== null && (
          <div className="bg-[#1a2030] border-t border-[#2d3548] px-4 py-3 relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(output || "");
              }}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition"
              title="Copy output"
            >
              <Copy size={14} />
            </button>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Output
            </p>
            <pre className="text-sm font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Controller ───────────────────────────────────────────────────────────────
export function CodingBody({
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
  const [language, setLanguage] = useState<CodingLanguage | null>(null);
  const [question, setQuestion] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");

  const wrapperRef = useRef<HTMLDivElement>(null!);

  // ── Restore from initialData on first mount ───────────────────────────────
  useEffect(() => {
    if (initialData?.question) {
      setTitle(initialData.title ?? "");
      setDescription(initialData.description ?? "");
      setLanguage(initialData.language ?? null);
      setQuestion(initialData.question);
      setExpectedOutput(initialData.expectedOutput ?? "");
      setMode("preview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist to page and switch to preview ─────────────────────────────────
  const handleCreate = () => {
    // MaterialPreviewModal.CodingPreview reads:
    //   data.title, data.description, data.language, data.question, data.expectedOutput
    onChangeData?.({ title, description, language, question, expectedOutput });
    setMode("preview");
  };

  if (mode === "canvas") {
    return (
      <CodingCanvas
        title={title}
        description={description}
        language={language}
        question={question}
        expectedOutput={expectedOutput}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onLanguageChange={setLanguage}
        onQuestionChange={setQuestion}
        onExpectedOutputChange={setExpectedOutput}
        onCreate={handleCreate}
        wrapperRef={wrapperRef}
        onEditorFocus={onEditorFocus}
        onSelectionChange={onSelectionChange}
      />
    );
  }

  return (
    <CodingPreview
      title={title}
      description={description}
      language={language}
      question={question}
      expectedOutput={expectedOutput}
      onEdit={() => setMode("canvas")}
    />
  );
}
