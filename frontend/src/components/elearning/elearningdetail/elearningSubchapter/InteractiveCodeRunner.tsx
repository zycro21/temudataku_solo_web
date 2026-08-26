// components/elearning/InteractiveCodeRunner.tsx
"use client";

import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";

// Strip HTML → plain text
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

interface InteractiveCodeRunnerProps {
  language: string;
  initialCode: string;
}

const LANG_LABEL: Record<string, string> = {
  PYTHON: "Python",
  SQL: "SQL",
  R: "R",
  CPP: "C++",
  JAVASCRIPT: "JavaScript",
};

export function InteractiveCodeRunner({
  language,
  initialCode,
}: InteractiveCodeRunnerProps) {
  const [output, setOutput] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  // 🔥 BARU: ref untuk output container
  const outputRef = useRef<HTMLDivElement>(null);

  const executeCode = async (lang: string, code: string) => {
    try {
      const res = await fetch("/api/execute-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang.toLowerCase(), code }),
      });
      const json = await res.json();
      if (!res.ok) {
        return `[Failed to run code]\n${json?.error ?? `HTTP ${res.status}`}`;
      }
      return json.output ?? "(no output)";
    } catch (err: any) {
      return `[Failed to run code]\n${err?.message ?? String(err)}`;
    }
  };

  const handleRunCode = async () => {
    if (!initialCode) return;
    setRunning(true);
    setOutput("");
    try {
      const plainCode = htmlToPlainText(initialCode);
      const result = await executeCode(language, plainCode);
      setOutput(result);

      // 🔥 BARU: scroll ke output setelah hasil muncul
      setTimeout(() => {
        if (outputRef.current) {
          outputRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    } catch (err: any) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const normalizeCode = (text: string) => {
    return text.replace(/\\n/g, "\n");
  };

  const codeText = normalizeCode(initialCode);
  const languageLabel = LANG_LABEL[language] ?? language ?? "Code";

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-3xl">
        <p className="ml-1 mb-2 text-base font-medium text-gray-700">
          Berikut Code-nya:
        </p>

        <div className="bg-[#0F172A] rounded-xl overflow-hidden shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-[#1E293B] border-b border-slate-700">
            <span className="text-sm font-medium text-emerald-400 uppercase tracking-wide">
              {languageLabel}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(codeText)}
                className="px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition"
              >
                {copied ? "Copied!" : "Copy"}
              </button>

              <button
                onClick={handleRunCode}
                disabled={running || !initialCode}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {running ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Running...
                  </>
                ) : (
                  "Run Code"
                )}
              </button>
            </div>
          </div>

          {/* Code Block */}
          <pre className="p-6 text-sm text-slate-200 font-mono whitespace-pre-wrap overflow-x-auto">
            {codeText || (
              <span className="text-gray-500 italic">No code entered</span>
            )}
          </pre>

          {/* 🔥 Output - tambahkan ref */}
          <div ref={outputRef}>
            {output && (
              <div className="border-t border-slate-700 bg-black px-6 py-4 relative">
                <button
                  onClick={() => handleCopy(output)}
                  className="absolute top-3 right-4 px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition"
                >
                  Copy Output
                </button>
                <p className="text-xs text-gray-400 mb-2">Output:</p>
                <pre className="text-emerald-400 text-sm font-mono whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
