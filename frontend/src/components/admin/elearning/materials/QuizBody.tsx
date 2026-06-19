"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, Plus, ChevronDown, Eye, Pencil } from "lucide-react";
import RichTextEditor, { type RichTextEditorRef } from "./RichTextEditor";
import {
  normalizeEditorHTML,
  richTextDisplayClass,
} from "@/lib/editorHTMLUtils";

// ─── Types ────────────────────────────────────────────────────────────────────
type QuestionType = "single" | "multiple";

interface QuizOption {
  id: string;
  text: string;
  value: string; // "true" = correct, "false" = wrong
}

interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  options: QuizOption[];
}

interface QuizData {
  title: string;
  description: string;
  questions: QuizQuestion[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeOption(idx: number): QuizOption {
  return { id: `opt-${Date.now()}-${idx}`, text: "", value: "" };
}

function makeQuestion(idx: number): QuizQuestion {
  return {
    id: `q-${Date.now()}-${idx}`,
    questionText: "",
    questionType: "single",
    options: [makeOption(0), makeOption(1), makeOption(2), makeOption(3)],
  };
}

// ─── Question Type Dropdown ───────────────────────────────────────────────────
function QuestionTypeDropdown({
  value,
  onChange,
}: {
  value: QuestionType;
  onChange: (v: QuestionType) => void;
}) {
  const [open, setOpen] = useState(false);

  const OPTIONS: { value: QuestionType; label: string; desc: string }[] = [
    {
      value: "single",
      label: "Single Choice",
      desc: "Users can select only one option",
    },
    {
      value: "multiple",
      label: "Multiple Choice",
      desc: "Users can select more than one option",
    },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg text-[12px] text-gray-500 bg-white hover:border-emerald-400 transition"
      >
        <span>
          {OPTIONS.find((o) => o.value === value)?.label ??
            "Select question type"}
        </span>
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full px-3 py-2.5 text-left hover:bg-emerald-50 transition ${
                value === opt.value ? "bg-emerald-50" : ""
              }`}
            >
              <p className="text-[12px] font-semibold text-gray-700">
                {opt.label}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Value Dropdown (correct = true / wrong = false) ─────────────────────────
function ValueDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const OPTIONS = [
    { value: "true", label: "True" },
    { value: "false", label: "False" },
  ];

  return (
    <div className="relative w-[120px] shrink-0">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-2.5 py-2 border border-gray-200 rounded-lg text-[11px] text-gray-500 bg-white hover:border-emerald-400 transition"
      >
        <span>
          {value
            ? (OPTIONS.find((o) => o.value === value)?.label ?? "Select value")
            : "Select value"}
        </span>
        <ChevronDown
          size={11}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full px-2.5 py-2 text-left text-[11px] hover:bg-emerald-50 transition ${
                value === opt.value
                  ? "bg-emerald-50 text-emerald-600 font-semibold"
                  : "text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Single Question Editor ───────────────────────────────────────────────────
function QuestionEditor({
  question,
  index,
  onChange,
  onRemove,
  canRemove,
  onEditorFocus,
  onSelectionChange,
}: {
  question: QuizQuestion;
  index: number;
  onChange: (q: QuizQuestion) => void;
  onRemove: () => void;
  canRemove: boolean;
  onEditorFocus?: (ref: RichTextEditorRef) => void;
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
}) {
  const [focused, setFocused] = useState(false);

  const updateField = <K extends keyof QuizQuestion>(
    key: K,
    val: QuizQuestion[K],
  ) => {
    // Kalau ganti questionType dari multiple → single, cek apakah ada >1 opsi true
    // Kalau iya, reset semua opsi ke false supaya user pilih ulang dengan benar
    if (key === "questionType" && val === "single") {
      const trueCount = question.options.filter(
        (o) => o.value === "true",
      ).length;
      if (trueCount > 1) {
        return onChange({
          ...question,
          [key]: val,
          options: question.options.map((o) => ({ ...o, value: "" })),
        });
      }
    }
    onChange({ ...question, [key]: val });
  };

  const updateOptionText = (optId: string, text: string) =>
    onChange({
      ...question,
      options: question.options.map((o) =>
        o.id === optId ? { ...o, text } : o,
      ),
    });

  const updateOptionValue = (optId: string, value: string) =>
    onChange({
      ...question,
      options: question.options.map((o) => {
        if (o.id === optId) return { ...o, value };
        // Single choice: kalau opsi ini di-set true, paksa semua opsi lain jadi false
        if (question.questionType === "single" && value === "true") {
          return { ...o, value: "false" };
        }
        return o;
      }),
    });

  const addOption = () =>
    onChange({
      ...question,
      options: [...question.options, makeOption(question.options.length)],
    });

  const removeOption = (optId: string) => {
    if (question.options.length <= 2) return;
    onChange({
      ...question,
      options: question.options.filter((o) => o.id !== optId),
    });
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
      {/* Question header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <span className="text-[12px] font-bold text-gray-700">
          Question {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-300 hover:text-red-400 transition"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Question text */}
        <div>
          <p className="text-[12px] font-bold text-gray-700 mb-1.5">
            Question Text
          </p>
          <div
            className={`rounded-lg border px-3 py-2.5 transition ${
              focused
                ? "border-emerald-400 ring-1 ring-emerald-400"
                : "border-gray-200"
            }`}
          >
            <RichTextEditor
              value={question.questionText}
              onChange={(val) => updateField("questionText", val)}
              placeholder="Enter a question..."
              className="text-[12px] text-gray-700 min-h-[3em]"
              onMount={(ref) => onEditorFocus?.(ref)}
              onUnmount={() => {}}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onSelectionChange={onSelectionChange}
            />
          </div>
        </div>

        {/* Question Type */}
        <div>
          <p className="text-[12px] font-bold text-gray-700 mb-1.5">
            Question Type
          </p>
          <QuestionTypeDropdown
            value={question.questionType}
            onChange={(v) => updateField("questionType", v)}
          />
        </div>

        {/* Options */}
        <div>
          {question.options.map((opt, oi) => (
            <div key={opt.id} className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[12px] font-bold text-gray-700 flex-1">
                  Option {oi + 1}
                </p>
                <p className="text-[12px] font-bold text-gray-700 w-[120px]">
                  Value
                </p>
                {question.options.length > 2 && <div className="w-4" />}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={opt.text}
                  onChange={(e) => updateOptionText(opt.id, e.target.value)}
                  placeholder={`Enter an option ${oi + 1} statement`}
                  maxLength={100}
                  className="flex-1 text-[11px] text-gray-700 placeholder-gray-300 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <ValueDropdown
                  value={opt.value}
                  onChange={(v) => updateOptionValue(opt.id, v)}
                />
                {question.options.length > 2 ? (
                  <button
                    type="button"
                    onClick={() => removeOption(opt.id)}
                    className="text-gray-300 hover:text-red-400 transition shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                ) : (
                  <div className="w-4 shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {opt.text.length}/100
              </p>
            </div>
          ))}

          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 text-[11px] text-emerald-500 hover:text-emerald-600 transition mt-1"
          >
            <Plus size={11} /> Add option
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Canvas (edit) mode ───────────────────────────────────────────────────────
function QuizCanvas({
  data,
  onChange,
  onCreateQuiz,
  onEditorFocus,
  onSelectionChange,
}: {
  data: QuizData;
  onChange: (d: QuizData) => void;
  onCreateQuiz: () => void;
  onEditorFocus?: (ref: RichTextEditorRef) => void;
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
}) {
  const addQuestion = () =>
    onChange({
      ...data,
      questions: [...data.questions, makeQuestion(data.questions.length)],
    });

  const removeQuestion = (id: string) =>
    onChange({
      ...data,
      questions: data.questions.filter((q) => q.id !== id),
    });

  const updateQuestion = (updated: QuizQuestion) =>
    onChange({
      ...data,
      questions: data.questions.map((q) => (q.id === updated.id ? updated : q)),
    });

  return (
    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white group">
      {/* Preview shortcut button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCreateQuiz();
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Eye size={11} /> Preview
      </button>

      {/* Quiz title & description */}
      <div className="mb-4 border-b border-dashed border-gray-200 pb-3">
        <input
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Enter quiz title ..."
          className="w-full text-base font-semibold text-gray-700 outline-none placeholder-gray-300 bg-transparent mb-1"
        />
        <textarea
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Enter quiz description (optional) ..."
          rows={2}
          className="w-full text-[12px] text-gray-400 placeholder-gray-300 bg-transparent outline-none resize-none"
        />
      </div>

      {/* Questions */}
      {data.questions.map((q, idx) => (
        <QuestionEditor
          key={q.id}
          question={q}
          index={idx}
          onChange={updateQuestion}
          onRemove={() => removeQuestion(q.id)}
          canRemove={data.questions.length > 1}
          onEditorFocus={onEditorFocus}
          onSelectionChange={onSelectionChange}
        />
      ))}

      {/* Footer buttons */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-emerald-500 text-emerald-600 text-sm font-semibold hover:bg-emerald-50 transition"
        >
          <Plus size={14} /> Add Question
        </button>
        <button
          type="button"
          onClick={onCreateQuiz}
          className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition shadow-sm"
        >
          Create Quiz
        </button>
      </div>
    </div>
  );
}

// ─── Preview mode — semua soal tampil sekaligus, navigation pills di atas ──────
function QuizPreview({ data, onEdit }: { data: QuizData; onEdit: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  // ref untuk scroll ke soal tertentu via pill
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const questions = data.questions;
  const total = questions.length;

  if (total === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-400 text-sm">
        No questions added yet.
      </div>
    );
  }

  const selectAnswer = (qId: string, optId: string, type: QuestionType) => {
    if (submitted) return;
    setAnswers((prev) => {
      if (type === "single") return { ...prev, [qId]: [optId] };
      const cur = prev[qId] ?? [];
      return {
        ...prev,
        [qId]: cur.includes(optId)
          ? cur.filter((id) => id !== optId)
          : [...cur, optId],
      };
    });
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q) => {
      const correctOpts = q.options
        .filter((o) => o.value === "true")
        .map((o) => o.id);
      const userAns = answers[q.id] ?? [];
      const isOk =
        correctOpts.length > 0 &&
        correctOpts.length === userAns.length &&
        correctOpts.every((id) => userAns.includes(id));
      if (isOk) correct++;
    });
    setScore(Math.round((correct / total) * 100));
    setSubmitted(true);
  };

  const getOptionStatus = (q: QuizQuestion, optId: string) => {
    if (!submitted) return "idle";
    const isCorrect = q.options.find((o) => o.id === optId)?.value === "true";
    const userSelected = (answers[q.id] ?? []).includes(optId);
    if (isCorrect && userSelected) return "correct";
    if (!isCorrect && userSelected) return "wrong";
    if (isCorrect && !userSelected) return "missed";
    return "idle";
  };

  // apakah soal sudah dijawab benar setelah submit
  const isQuestionCorrect = (q: QuizQuestion) => {
    if (!submitted) return null;
    const correctOpts = q.options
      .filter((o) => o.value === "true")
      .map((o) => o.id);
    const userAns = answers[q.id] ?? [];
    return (
      correctOpts.length > 0 &&
      correctOpts.length === userAns.length &&
      correctOpts.every((id) => userAns.includes(id))
    );
  };

  const scrollToQuestion = (idx: number) => {
    questionRefs.current[idx]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="relative border-2 border-dashed border-gray-300 rounded-xl bg-white group/preview">
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

      {/* ── Header: title + navigation pills ── */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        {/* Question counter pill row */}
        <p className="text-[11px] text-gray-400 mb-2">
          Semua pertanyaan dijawab dengan benar
        </p>
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q, idx) => {
            const correct = isQuestionCorrect(q);
            const answered = (answers[q.id] ?? []).length > 0;
            const pillClass =
              correct === true
                ? "bg-emerald-500 text-white"
                : correct === false
                  ? "bg-red-400 text-white"
                  : answered
                    ? "bg-emerald-200 text-emerald-800"
                    : "bg-emerald-500 text-white"; // default active green like design

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => scrollToQuestion(idx)}
                className={`w-8 h-8 rounded-lg text-[12px] font-bold transition hover:opacity-80 ${pillClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── All questions ── */}
      <div className="divide-y divide-gray-100">
        {questions.map((q, qIdx) => {
          const correct = isQuestionCorrect(q);
          return (
            <div
              key={q.id}
              ref={(el) => {
                questionRefs.current[qIdx] = el;
              }}
              className="px-5 py-5"
            >
              {/* Question label & text */}
              <p className="text-[13px] font-bold text-gray-800 mb-0.5">
                Pertanyaan {qIdx + 1}
              </p>
              <div
                className={`text-[13px] text-gray-700 mb-1 leading-snug ${richTextDisplayClass}`}
                dangerouslySetInnerHTML={{
                  __html:
                    normalizeEditorHTML(q.questionText) ||
                    `Question ${qIdx + 1}`,
                }}
              />
              {q.questionType === "multiple" && (
                <p className="text-[10px] font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                  Pilih pernyataan yang BENAR.
                </p>
              )}

              {/* Options */}
              <div className="space-y-2 mt-3">
                {q.options.map((opt, oi) => {
                  const status = getOptionStatus(q, opt.id);
                  const isSelected = (answers[q.id] ?? []).includes(opt.id);

                  const rowClass =
                    status === "correct"
                      ? "border-emerald-400 bg-emerald-50"
                      : status === "wrong"
                        ? "border-red-300 bg-white"
                        : status === "missed"
                          ? "border-emerald-300 bg-emerald-50/30"
                          : isSelected
                            ? "border-emerald-400 bg-emerald-50"
                            : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/20";

                  const textClass =
                    status === "correct"
                      ? "text-gray-800"
                      : status === "wrong"
                        ? "text-gray-700"
                        : "text-gray-700";

                  // Checkbox/radio indicator
                  const checkBg =
                    status === "correct"
                      ? "bg-emerald-500 border-emerald-500"
                      : status === "wrong"
                        ? "border-gray-300 bg-white"
                        : isSelected
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-gray-300 bg-white";

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => selectAnswer(q.id, opt.id, q.questionType)}
                      disabled={submitted}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border transition text-left ${rowClass}`}
                    >
                      {/* checkbox/radio */}
                      <div
                        className={`shrink-0 w-4 h-4 border-2 flex items-center justify-center transition ${
                          q.questionType === "multiple"
                            ? "rounded"
                            : "rounded-full"
                        } ${checkBg}`}
                      >
                        {(isSelected || status === "correct") && (
                          <svg
                            width="10"
                            height="8"
                            viewBox="0 0 10 8"
                            fill="none"
                          >
                            <path
                              d="M1 4 L3.5 6.5 L9 1"
                              stroke="white"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>

                      <span
                        className={`text-[12px] flex-1 leading-snug ${textClass}`}
                      >
                        {opt.text || `Option ${oi + 1}`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation box — muncul setelah submit */}
              {submitted && (
                <div
                  className={`mt-3 flex items-start gap-2.5 px-3 py-2.5 rounded-lg ${
                    correct
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div
                    className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                      correct ? "bg-emerald-500" : "bg-red-400"
                    }`}
                  >
                    {correct ? (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4 L3.5 6.5 L9 1"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path
                          d="M1.5 1.5 L6.5 6.5 M6.5 1.5 L1.5 6.5"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-[12px] font-bold leading-tight ${
                        correct ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {correct ? "Benar!" : "Belum tepat."}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                      {correct
                        ? `Jawaban yang benar adalah: ${
                            q.options
                              .filter((o) => o.value === "true")
                              .map((o) => o.text)
                              .join(", ") || "—"
                          }`
                        : `Jawaban yang benar adalah: ${
                            q.options
                              .filter((o) => o.value === "true")
                              .map((o) => o.text)
                              .join(", ") || "—"
                          }`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer: score + submit / retry ── */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-100">
        {submitted && score !== null && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-center ${
              score >= 70
                ? "bg-emerald-50 border border-emerald-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`text-xl font-bold ${score >= 70 ? "text-emerald-600" : "text-red-500"}`}
            >
              Skor: {score}%
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {score >= 70 ? "Bagus! Kamu lulus quiz ini." : "Coba lagi ya!"}
            </p>
          </div>
        )}

        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-2.5 rounded-lg bg-emerald-500 text-white text-[13px] font-semibold hover:bg-emerald-600 transition"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
              setScore(null);
            }}
            className="w-full py-2.5 rounded-lg border border-emerald-400 text-emerald-600 text-[13px] font-semibold hover:bg-emerald-50 transition"
          >
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Controller ───────────────────────────────────────────────────────────────
export function QuizBody({
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
  const [data, setData] = useState<QuizData>({
    title: "",
    description: "",
    questions: [makeQuestion(0)],
  });

  useEffect(() => {
    if (initialData?.questions && initialData.questions.length > 0) {
      setData({
        title: initialData.title ?? "",
        description: initialData.description ?? "",
        questions: initialData.questions,
      });
      setMode("preview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (d: QuizData) => {
    // Hanya update internal state — jangan emit ke parent sampai user eksplisit klik Create
    setData(d);
  };

  const handleCreate = () => {
    onChangeData?.(data);
    setMode("preview");
  };

  if (mode === "canvas") {
    return (
      <QuizCanvas
        data={data}
        onChange={handleChange}
        onCreateQuiz={handleCreate}
        onEditorFocus={onEditorFocus}
        onSelectionChange={onSelectionChange}
      />
    );
  }

  return <QuizPreview data={data} onEdit={() => setMode("canvas")} />;
}
