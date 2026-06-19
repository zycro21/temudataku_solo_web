"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Eye,
  Pencil,
  Upload,
  X,
  FileText,
  Calendar,
  Clock,
} from "lucide-react";
import RichTextEditor, { type RichTextEditorRef } from "./RichTextEditor";
import {
  normalizeEditorHTML,
  richTextDisplayClass,
} from "@/lib/editorHTMLUtils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AttachedFile {
  id: string;
  name: string;
  url: string;
  format: string; // PDF, DOC, JPG, PNG, SVG, etc.
  _file?: File; // File object untuk upload baru (tidak diserialisasi)
}

interface ProjectData {
  question: string;
  attachments: AttachedFile[];
  deadlineDate: string; // DD/MM/YYYY
  deadlineTime: string; // HH:MM
}

// ─── Supported formats ────────────────────────────────────────────────────────
const SUPPORTED_FORMATS = ["PDF", "DOC", "JPG", "PNG", "SVG"];

function getFormatFromUrl(url: string): string {
  try {
    const ext = url.split(".").pop()?.split("?")[0]?.toUpperCase() ?? "";
    return SUPPORTED_FORMATS.includes(ext) ? ext : "FILE";
  } catch {
    return "FILE";
  }
}

function getFormatFromName(name: string): string {
  const ext = name.split(".").pop()?.toUpperCase() ?? "";
  return SUPPORTED_FORMATS.includes(ext) ? ext : "FILE";
}

// ─── File format badge ────────────────────────────────────────────────────────
function FormatBadge({ format }: { format: string }) {
  const colorMap: Record<string, string> = {
    PDF: "bg-red-100 text-red-600",
    DOC: "bg-blue-100 text-blue-600",
    JPG: "bg-yellow-100 text-yellow-700",
    PNG: "bg-purple-100 text-purple-600",
    SVG: "bg-emerald-100 text-emerald-600",
    FILE: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
        colorMap[format] ?? colorMap["FILE"]
      }`}
    >
      {format}
    </span>
  );
}

// ─── Canvas (edit) mode ───────────────────────────────────────────────────────
function ProjectCanvas({
  data,
  onChange,
  onCreate,
  onEditorFocus,
  onSelectionChange,
}: {
  data: ProjectData;
  onChange: (d: ProjectData) => void;
  onCreate: () => void;
  onEditorFocus?: (ref: RichTextEditorRef) => void;
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
}) {
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [questionFocused, setQuestionFocused] = useState(false);

  const addFileFromUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    // Try to infer a readable name from the URL
    const rawName = trimmed.split("/").pop()?.split("?")[0] ?? "file";
    const name = decodeURIComponent(rawName) || "file";
    const format = getFormatFromUrl(trimmed);
    onChange({
      ...data,
      attachments: [
        ...data.attachments,
        { id: `att-${Date.now()}`, name, url: trimmed, format },
      ],
    });
    setUrlInput("");
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newAtts: AttachedFile[] = Array.from(files).map((f) => ({
      id: `att-${Date.now()}-${Math.random()}`,
      name: f.name,
      url: URL.createObjectURL(f),
      format: getFormatFromName(f.name),
      _file: f,
    }));
    onChange({ ...data, attachments: [...data.attachments, ...newAtts] });
  };

  const removeAttachment = (id: string) =>
    onChange({
      ...data,
      attachments: data.attachments.filter((a) => a.id !== id),
    });

  return (
    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white group">
      {/* Preview shortcut */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCreate();
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Eye size={11} /> Preview
      </button>

      {/* ── Question ────────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <p className="text-[12px] font-bold text-gray-700 mb-1.5">Question</p>
        <div
          className={`rounded-lg border px-3 py-2.5 transition ${
            questionFocused
              ? "border-emerald-400 ring-1 ring-emerald-400"
              : "border-gray-200"
          }`}
        >
          <RichTextEditor
            value={data.question}
            onChange={(val) => onChange({ ...data, question: val })}
            placeholder="Enter a project question or instruction"
            className="text-[12px] text-gray-700 min-h-[4em]"
            onMount={(ref) => onEditorFocus?.(ref)}
            onUnmount={() => {}}
            onFocus={() => setQuestionFocused(true)}
            onBlur={() => setQuestionFocused(false)}
            onSelectionChange={onSelectionChange}
          />
        </div>
      </div>

      {/* ── Attachment ──────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <p className="text-[12px] font-bold text-gray-700 mb-1.5">Attachment</p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
            handleFileSelect(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-xl py-6 px-4 flex flex-col items-center justify-center cursor-pointer transition ${
            isDragOver
              ? "border-emerald-400 bg-emerald-50/30"
              : "border-gray-200 bg-gray-50/40 hover:border-emerald-300 hover:bg-emerald-50/20"
          }`}
        >
          <Upload
            size={28}
            className={`mb-2 ${isDragOver ? "text-emerald-500" : "text-gray-400"}`}
          />
          <p className="text-[12px] text-gray-500 text-center leading-snug">
            Upload an file, add a URL, or drag and drop here
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            Supported formats: {SUPPORTED_FORMATS.join(", ")}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.svg"
            onChange={(e) => handleFileSelect(e.target.files)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* URL input row */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addFileFromUrl();
              }
            }}
            placeholder="Add file URL"
            className="flex-1 text-[11px] text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
          <button
            type="button"
            onClick={addFileFromUrl}
            className="px-3 py-2 rounded-lg border border-emerald-500 text-emerald-600 text-[11px] font-semibold hover:bg-emerald-50 transition shrink-0"
          >
            Add File
          </button>
        </div>

        {/* Attached files list */}
        {data.attachments.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {data.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                <FileText size={13} className="text-gray-400 shrink-0" />
                <span className="text-[11px] text-gray-700 flex-1 truncate">
                  {att.name}
                </span>
                <FormatBadge format={att.format} />
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="text-gray-300 hover:text-red-400 transition shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Deadline ────────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <p className="text-[12px] font-bold text-gray-700 mb-1.5">Deadline</p>
        <div className="flex items-center gap-2">
          {/* Date */}
          <div className="relative flex-1">
            <input
              type="text"
              value={data.deadlineDate}
              onChange={(e) =>
                onChange({ ...data, deadlineDate: e.target.value })
              }
              placeholder="DD / MM / YYYY"
              className="w-full text-[11px] text-gray-500 placeholder-gray-300 border border-gray-200 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <Calendar
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          {/* Time */}
          <div className="relative flex-1">
            <input
              type="text"
              value={data.deadlineTime}
              onChange={(e) =>
                onChange({ ...data, deadlineTime: e.target.value })
              }
              placeholder="HH : MM"
              className="w-full text-[11px] text-gray-500 placeholder-gray-300 border border-gray-200 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <Clock
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* ── Create button ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition shadow-sm"
        >
          Create Project
        </button>
      </div>
    </div>
  );
}

// ─── Preview mode — 2 kolom: kiri deskripsi+instruksi, kanan upload+catatan ───
function ProjectPreview({
  data,
  onEdit,
}: {
  data: ProjectData;
  onEdit: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submittedFiles, setSubmittedFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setSubmittedFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const removeFile = (idx: number) =>
    setSubmittedFiles((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="relative border-2 border-dashed border-gray-300 rounded-xl bg-white group/preview overflow-hidden">
      {/* Edit button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Pencil size={11} /> Edit
      </button>

      {/* ── Main 2-column body ── */}
      <div className="flex gap-0 divide-x divide-gray-100">
        {/* ── LEFT: Deskripsi & Instruksi ── */}
        <div className="flex-1 min-w-0 px-5 py-5">
          <div className="mb-4">
            <p className="text-[12px] font-bold text-gray-700 mb-1.5">
              Deskripsi Proyek
            </p>
            {data.question ? (
              <div
                className={`text-[12px] text-gray-600 leading-relaxed [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:my-0.5 ${richTextDisplayClass}`}
                dangerouslySetInnerHTML={{
                  __html: normalizeEditorHTML(data.question),
                }}
              />
            ) : (
              <p className="text-[12px] text-gray-400 italic">
                Belum ada deskripsi.
              </p>
            )}
          </div>

          {/* Dokumen perlu diunduh */}
          {data.attachments.length > 0 && (
            <div>
              <p className="text-[12px] font-bold text-gray-700 mb-2">
                Dokumen yang Perlu Diunduh
              </p>
              <div className="space-y-2">
                {data.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/20 transition group/dl"
                  >
                    {/* File icon with color by format */}
                    <div
                      className={`w-9 h-10 rounded flex items-center justify-center shrink-0 ${
                        att.format === "PDF"
                          ? "bg-red-100"
                          : att.format === "DOC"
                            ? "bg-blue-100"
                            : att.format === "XLS" || att.format === "CSV"
                              ? "bg-green-100"
                              : "bg-gray-100"
                      }`}
                    >
                      <FileText
                        size={16}
                        className={
                          att.format === "PDF"
                            ? "text-red-500"
                            : att.format === "DOC"
                              ? "text-blue-500"
                              : "text-gray-400"
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-gray-700 truncate">
                        {att.name}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {att.format}
                      </p>
                    </div>
                    {/* Download icon */}
                    <div className="shrink-0 w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center group-hover/dl:border-emerald-400 group-hover/dl:bg-emerald-50 transition">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                        className="text-gray-400 group-hover/dl:text-emerald-500 transition"
                      >
                        <path
                          d="M6.5 2v7M3.5 6l3 3 3-3M2 11h9"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Upload + Catatan ── */}
        <div className="w-[200px] shrink-0 px-4 py-5 flex flex-col gap-3">
          {!submitted ? (
            <>
              {/* Upload area */}
              <div>
                <p className="text-[12px] font-bold text-gray-700 mb-1.5">
                  Unggah File
                </p>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragOver(false);
                    addFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl py-5 flex flex-col items-center justify-center cursor-pointer transition ${
                    isDragOver
                      ? "border-emerald-400 bg-emerald-50/30"
                      : "border-gray-200 bg-gray-50/30 hover:border-emerald-300 hover:bg-emerald-50/20"
                  }`}
                >
                  <Upload
                    size={22}
                    className={`mb-1.5 ${isDragOver ? "text-emerald-500" : "text-gray-400"}`}
                  />
                  <p className="text-[10px] text-gray-500 text-center leading-snug px-2">
                    Unggah file PDF, XLS, DOC
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.svg"
                    onChange={(e) => addFiles(e.target.files)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Uploaded files list */}
                {submittedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {submittedFiles.map((f, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-2 py-1.5 bg-emerald-50 rounded border border-emerald-200"
                      >
                        <FileText
                          size={10}
                          className="text-emerald-500 shrink-0"
                        />
                        <span className="text-[10px] text-emerald-700 flex-1 truncate">
                          {f.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-emerald-400 hover:text-red-400 transition shrink-0"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Catatan tambahan */}
              <div>
                <p className="text-[12px] font-bold text-gray-700 mb-1.5">
                  Catatan Tambahan (opsional)
                </p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tambahkan catatan untuk instruktur..."
                  rows={3}
                  className="w-full text-[11px] text-gray-700 placeholder-gray-300 border border-gray-200 rounded-lg px-2.5 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Submit button */}
              <button
                type="button"
                onClick={() => {
                  if (submittedFiles.length === 0) return;
                  setSubmitted(true);
                }}
                disabled={submittedFiles.length === 0}
                className="w-full py-2 rounded-lg bg-emerald-500 text-white text-[12px] font-semibold hover:bg-emerald-600 transition disabled:opacity-40"
              >
                Kumpulkan Proyek →
              </button>
            </>
          ) : (
            /* Success state */
            <div className="flex flex-col items-center justify-center text-center py-6 gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-emerald-500"
                >
                  <path
                    d="M5 12.5 L9.5 17 L19 8"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-800">
                  Terkumpul!
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                  Mentor akan mereview karyamu.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setSubmittedFiles([]);
                  setNote("");
                }}
                className="text-[11px] font-semibold text-emerald-600 hover:underline"
              >
                Kumpulkan ulang
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Controller ───────────────────────────────────────────────────────────────
export function ProjectBody({
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
  const [data, setData] = useState<ProjectData>({
    question: "",
    attachments: [],
    deadlineDate: "",
    deadlineTime: "",
  });

  useEffect(() => {
    if (initialData?.question || initialData?.attachments?.length > 0) {
      setData({
        question: initialData.question ?? "",
        attachments: initialData.attachments ?? [],
        deadlineDate: initialData.deadlineDate ?? "",
        deadlineTime: initialData.deadlineTime ?? "",
      });
      setMode("preview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (d: ProjectData) => {
    // Hanya update internal state — jangan emit ke parent sampai user eksplisit klik Create
    setData(d);
  };

  const handleCreate = () => {
    onChangeData?.(data);
    setMode("preview");
  };

  if (mode === "canvas") {
    return (
      <ProjectCanvas
        data={data}
        onChange={handleChange}
        onCreate={handleCreate}
        onEditorFocus={onEditorFocus}
        onSelectionChange={onSelectionChange}
      />
    );
  }

  return <ProjectPreview data={data} onEdit={() => setMode("canvas")} />;
}
