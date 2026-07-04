"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, ChevronDown, Eye, Copy, Play, Loader2 } from "lucide-react";
import RichTextEditor, {
  type RichTextEditorRef,
} from "@/components/admin/elearning/materials/RichTextEditor";

// ─── Language config ──────────────────────────────────────────────────────────
// JavaScript dihapus sesuai permintaan. Tersisa 4 bahasa.
type CodingLanguage = "python" | "sql" | "r" | "c++";

const LANGUAGE_LABELS: Record<CodingLanguage, string> = {
  python: "Python",
  sql: "SQL",
  r: "R",
  "c++": "C++",
};

// Eksekusi kode via Next.js API Route → JDoodle
async function executeCode(
  lang: CodingLanguage,
  code: string,
): Promise<string> {
  try {
    const res = await fetch("/api/execute-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: lang, code }),
    });
    const json = await res.json();
    if (!res.ok) {
      return `[Failed to run code]\n${json?.error ?? `HTTP ${res.status}`}`;
    }
    return json.output ?? "(no output)";
  } catch (err: any) {
    return `[Failed to run code]\n${err?.message ?? String(err)}`;
  }
}

// Strip HTML dari RichTextEditor → plain text untuk eksekusi dan tampilan
function htmlToPlainText(html: string): string {
  if (!html) return "";
  let text = html
    .replace(/<div>/gi, "\n")
    .replace(/<\/div>/gi, "")
    .replace(/<p>/gi, "\n")
    .replace(/<\/p>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<[^>]+>/g, "");
  text = text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

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

// ─── Canvas edit mode ─────────────────────────────────────────────────────────
// expectedOutput dihapus — output dijalankan otomatis saat preview.
function CodingCanvas({
  title,
  description,
  language,
  question,
  onTitleChange,
  onDescriptionChange,
  onLanguageChange,
  onQuestionChange,
  onCreate,
  wrapperRef,
  onEditorFocus,
  onSelectionChange,
}: {
  title: string;
  description: string;
  language: CodingLanguage | null;
  question: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onLanguageChange: (v: CodingLanguage) => void;
  onQuestionChange: (v: string) => void;
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

      {/* Title */}
      <div className="mb-1">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onFocus={() => setActiveEditorId(null)}
          placeholder="Enter coding title ..."
          className="w-full text-lg font-semibold text-gray-700 outline-none placeholder-gray-300 bg-transparent"
        />
      </div>

      {/* Description */}
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

      {/* Language selector */}
      <div className="mb-4">
        <p className="text-[12px] font-semibold text-gray-600 mb-1.5">
          Language
        </p>
        <LanguageDropdown value={language} onChange={onLanguageChange} />
      </div>

      {/* Code input */}
      <div className="mb-4">
        <p className="text-[12px] font-semibold text-gray-600 mb-1.5">Code</p>
        <div className="border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-emerald-400 transition">
          <RichTextEditor
            ref={questionRef}
            value={question}
            onChange={onQuestionChange}
            placeholder="Enter code here ..."
            className="text-sm text-gray-700 min-h-[5em] font-mono"
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
        <p className="text-[10px] text-gray-400 mt-1">
          Output akan dihasilkan otomatis saat Run Code ditekan.
        </p>
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
// Run Code memanggil Piston API secara nyata.
function CodingPreviewCard({
  title,
  description,
  language,
  question,
  onEdit,
}: {
  title: string;
  description: string;
  language: CodingLanguage | null;
  question: string;
  onEdit: () => void;
}) {
  const [output, setOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRunCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!language || !question) return;
    setRunning(true);
    setOutput(null);
    const result = await executeCode(language, htmlToPlainText(question));
    setOutput(result);
    setRunning(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
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
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e2433]">
          <span className="text-[11px] font-bold text-emerald-400 tracking-widest uppercase">
            {language ? LANGUAGE_LABELS[language] : "CODE"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(htmlToPlainText(question));
              }}
              className="text-gray-400 hover:text-white transition text-xs px-2 py-1 rounded"
            >
              {copied ? "Copied!" : <Copy size={12} />}
            </button>
            <button
              onClick={handleRunCode}
              disabled={running || !language}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition disabled:opacity-60"
            >
              {running ? (
                <>
                  <Loader2 size={11} className="animate-spin" /> Running...
                </>
              ) : (
                <>
                  <Play size={11} /> Run Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code area */}
        <div className="bg-[#252d3d] px-4 py-3">
          <pre className="text-sm font-mono text-gray-200 whitespace-pre-wrap leading-relaxed">
            {htmlToPlainText(question) || (
              <span className="text-gray-500 italic">No code entered</span>
            )}
          </pre>
        </div>

        {/* Output area */}
        {output !== null && (
          <div className="bg-[#1a2030] border-t border-[#2d3548] px-4 py-3 relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(output);
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

  const wrapperRef = useRef<HTMLDivElement>(null!);

  // Restore dari initialData saat mount
  useEffect(() => {
    if (initialData?.question) {
      setTitle(initialData.title ?? "");
      setDescription(initialData.description ?? "");
      // Validasi bahasa — javascript tidak lagi valid
      const savedLang = initialData.language as CodingLanguage | null;
      const validLangs: CodingLanguage[] = ["python", "sql", "r", "c++"];
      setLanguage(
        savedLang && validLangs.includes(savedLang) ? savedLang : null,
      );
      setQuestion(initialData.question);
      setMode("preview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = () => {
    // expectedOutput dihapus — tidak disimpan, output digenerate saat run
    onChangeData?.({ title, description, language, question });
    setMode("preview");
  };

  if (mode === "canvas") {
    return (
      <CodingCanvas
        title={title}
        description={description}
        language={language}
        question={question}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onLanguageChange={setLanguage}
        onQuestionChange={setQuestion}
        onCreate={handleCreate}
        wrapperRef={wrapperRef}
        onEditorFocus={onEditorFocus}
        onSelectionChange={onSelectionChange}
      />
    );
  }

  return (
    <CodingPreviewCard
      title={title}
      description={description}
      language={language}
      question={question}
      onEdit={() => setMode("canvas")}
    />
  );
}
