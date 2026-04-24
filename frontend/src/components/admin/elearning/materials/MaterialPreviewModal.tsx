"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Monitor,
} from "lucide-react";
import type { CanvasItem } from "./CanvasCard";

// ─── Props ────────────────────────────────────────────────────────────────────
interface MaterialPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  items: CanvasItem[];
}

// ─── Highlight preview ────────────────────────────────────────────────────────
function HighlightPreview({ html }: { html: string }) {
  return (
    <div className="w-full">
      <div className="w-[85%] mx-auto rounded-md overflow-hidden flex bg-[#F8FAFC]">
        <div className="w-4 bg-[#D1D5DC] shrink-0" />
        <div
          className="px-6 py-5 text-base text-gray-700 leading-relaxed flex-1"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

// ─── Summary preview ──────────────────────────────────────────────────────────
function SummaryPreview({ html }: { html: string }) {
  return (
    <div className="w-full">
      <div className="w-[85%] mx-auto bg-[#F8FAFC] rounded-2xl p-10 shadow-sm">
        <h4 className="text-4xl font-bold mb-6">
          <span className="text-emerald-600">Ringkasan</span>
        </h4>
        <div
          className="text-base text-gray-800 leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

// ─── Heading preview ──────────────────────────────────────────────────────────
function HeadingPreview({ html }: { html: string }) {
  return (
    <div
      className="text-3xl font-bold text-black leading-snug [&_*]:font-bold"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─── Paragraph preview ────────────────────────────────────────────────────────
function ParagraphPreview({ html }: { html: string }) {
  return (
    <div
      className="text-base text-gray-800 leading-relaxed
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
        [&_li]:my-1
        [&_strong]:font-bold
        [&_u]:underline
        [&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:italic"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─── Image preview ────────────────────────────────────────────────────────────
function ImagePreview({ src }: { src?: string }) {
  if (!src) {
    return (
      <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 text-sm">
        No image uploaded
      </div>
    );
  }
  return (
    <div className="w-full flex justify-center">
      <img
        src={src}
        alt="material"
        className="w-full max-w-xl max-h-[400px] object-contain rounded-xl shadow-md"
      />
    </div>
  );
}

// ─── Video preview ────────────────────────────────────────────────────────────
function VideoPreview({ src }: { src?: string }) {
  if (!src) {
    return (
      <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 text-sm">
        No video uploaded
      </div>
    );
  }

  const isYoutube = src.includes("youtube.com") || src.includes("youtu.be");
  const embedUrl = isYoutube
    ? src.includes("youtu.be")
      ? `https://www.youtube.com/embed/${src.split("youtu.be/")[1]?.split("?")[0]}`
      : `https://www.youtube.com/embed/${new URL(src).searchParams.get("v")}`
    : src;

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-2xl aspect-video rounded-xl overflow-hidden shadow-md">
        {isYoutube ? (
          <iframe src={embedUrl} className="w-full h-full" allowFullScreen />
        ) : (
          <video
            src={src}
            controls
            className="w-full h-full object-contain bg-black"
          />
        )}
      </div>
    </div>
  );
}

// ─── Accordion preview ────────────────────────────────────────────────────────
function AccordionPreview({ data }: { data: any }) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);
  const panels = data?.panels ?? [];

  // Support both field naming conventions:
  // AccordionBody saves: { titleHTML, contentHTML }
  // Legacy/manual: { title, content }
  const getPanelTitle = (panel: any) => panel.titleHTML ?? panel.title ?? "";
  const getPanelContent = (panel: any) =>
    panel.contentHTML ?? panel.content ?? "";

  if (panels.length === 0) {
    return (
      <div className="w-full text-center text-gray-400 text-sm py-6">
        No accordion panels added
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full mx-auto">
      {/* Title & description if present */}
      {data?.titleHTML && (
        <div
          className="text-lg font-semibold text-gray-700 mb-1"
          dangerouslySetInnerHTML={{ __html: data.titleHTML }}
        />
      )}
      {data?.descriptionHTML && (
        <div
          className="text-sm text-gray-500 mb-3 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: data.descriptionHTML }}
        />
      )}
      {panels.map((panel: any, index: number) => {
        const isOpen = openIndexes.includes(index);
        const titleContent = getPanelTitle(panel);
        const bodyContent = getPanelContent(panel);
        return (
          <div key={panel.id ?? index} className="rounded-xl overflow-hidden">
            <button
              onClick={() =>
                setOpenIndexes((prev) =>
                  isOpen ? prev.filter((i) => i !== index) : [...prev, index],
                )
              }
              className="w-full flex justify-between items-center px-5 py-4 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
            >
              {titleContent ? (
                <div
                  className="font-bold text-lg text-black"
                  dangerouslySetInnerHTML={{ __html: titleContent }}
                />
              ) : (
                <span className="font-bold text-lg text-gray-400 italic">
                  Untitled Panel
                </span>
              )}
              <div className="p-2 rounded-full border border-emerald-500">
                <ChevronDown
                  size={18}
                  className={`text-emerald-500 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
                />
              </div>
            </button>
            {isOpen && (
              <div
                className="px-5 py-5 text-base text-black leading-relaxed bg-gray-50
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1"
                dangerouslySetInnerHTML={{ __html: bodyContent }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab Navigation preview ───────────────────────────────────────────────────
function TabNavigationPreview({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = data?.tabs ?? [];

  if (tabs.length === 0) {
    return (
      <div className="w-full text-center text-gray-400 text-sm py-6">
        No tabs added
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Title & description */}
      {data?.title && (
        <div
          className="text-lg font-semibold text-gray-700 mb-1"
          dangerouslySetInnerHTML={{ __html: data.title }}
        />
      )}
      {data?.description && (
        <div
          className="text-sm text-gray-500 mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: data.description }}
        />
      )}

      {/* Tab headers — each tab gets equal proportional share of full width */}
      <div className="flex w-full">
        {tabs.map((tab: any, index: number) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            style={{ width: `${100 / tabs.length}%` }}
            className={`py-4 text-sm font-semibold tracking-wide transition-all duration-300 truncate
              ${
                activeTab === index
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }
              ${index === 0 ? "rounded-tl-2xl" : ""}
              ${index === tabs.length - 1 ? "rounded-tr-2xl" : ""}
            `}
          >
            {tab.title || tab.label || `Tab ${index + 1}`}
          </button>
        ))}
      </div>
      <div
        className="bg-white rounded-b-2xl p-8 text-base text-black leading-relaxed shadow-sm
          [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1"
        dangerouslySetInnerHTML={{ __html: tabs[activeTab]?.content || "" }}
      />
    </div>
  );
}

// ─── Content Card preview ─────────────────────────────────────────────────────
function ContentCardPreview({ data }: { data: any }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const cards = data?.cards ?? [];
  const disableExpandable = data?.disableExpandable ?? false;

  if (cards.length === 0) {
    return (
      <div className="w-full text-center text-gray-400 text-sm py-6">
        No cards added
      </div>
    );
  }

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Number of columns: match actual card count (max 3), always centered
  const cols = Math.min(cards.length, 3);

  return (
    <div className="w-full">
      {/* Title & description */}
      {data?.title && (
        <div
          className="text-lg font-semibold text-gray-700 mb-1"
          dangerouslySetInnerHTML={{ __html: data.title }}
        />
      )}
      {data?.description && (
        <div
          className="text-sm text-gray-500 mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: data.description }}
        />
      )}

      {/* Cards — always centered regardless of count */}
      <div
        className="grid gap-4 justify-center mx-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 280px))`,
        }}
      >
        {cards.map((card: any) => {
          const isExpanded = expandedIds.has(card.id);

          if (disableExpandable) {
            return (
              <div
                key={card.id}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#F8FAFC] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <h6 className="text-base font-semibold text-black mb-2">
                  <span
                    dangerouslySetInnerHTML={{ __html: card.title || `Card` }}
                  />
                </h6>
                <div
                  className="text-sm text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: card.content || "" }}
                />
              </div>
            );
          }

          // Expandable mode
          return (
            <div
              key={card.id}
              className="flex flex-col rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
            >
              <div className="flex flex-col items-center text-center p-6 bg-white flex-1">
                <h6 className="text-base font-semibold text-black mb-2">
                  <span
                    dangerouslySetInnerHTML={{ __html: card.title || `Card` }}
                  />
                </h6>
                <div
                  className="text-sm text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: card.content || "" }}
                />
              </div>

              {card.expandedContent && (
                <div className="bg-[#F8FAFC]">
                  <div
                    className={`overflow-hidden transition-all duration-500 ${
                      isExpanded
                        ? "max-h-96 opacity-100 py-4 px-6"
                        : "max-h-0 opacity-0 px-6"
                    }`}
                  >
                    <div
                      className="text-sm text-gray-600 leading-relaxed text-center"
                      dangerouslySetInnerHTML={{ __html: card.expandedContent }}
                    />
                  </div>
                  <button
                    onClick={() => toggle(card.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-3 text-sm text-gray-600 hover:text-black border-t border-gray-200 transition"
                  >
                    <span>
                      {isExpanded
                        ? "Lihat lebih sedikit"
                        : "Lihat lebih banyak"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Carousel preview ─────────────────────────────────────────────────────────
function CarouselPreview({ data }: { data: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = data?.items ?? [];
  const cardsPerSlide = data?.cardsPerSlide ?? 2;
  const maxIndex = Math.max(items.length - cardsPerSlide, 0);

  if (items.length === 0) {
    return (
      <div className="w-full text-center text-gray-400 text-sm py-6">
        No carousel items added
      </div>
    );
  }

  const translatePct = (100 / cardsPerSlide) * currentIndex;

  return (
    <div className="w-full">
      {/* Title & description */}
      {data?.title && (
        <div
          className="text-lg font-semibold text-gray-700 mb-1"
          dangerouslySetInnerHTML={{ __html: data.title }}
        />
      )}
      {data?.description && (
        <div
          className="text-sm text-gray-500 mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: data.description }}
        />
      )}

      <div className="relative">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          disabled={currentIndex === 0}
          className={`absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white border border-emerald-500 text-emerald-600 rounded-lg shadow-md transition text-xl font-bold z-10 ${currentIndex === 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-emerald-50"}`}
        >
          ‹
        </button>
        <button
          onClick={() => setCurrentIndex((i) => Math.min(i + 1, maxIndex))}
          disabled={currentIndex === maxIndex}
          className={`absolute -right-12 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white border border-emerald-500 text-emerald-600 rounded-lg shadow-md transition text-xl font-bold z-10 ${currentIndex === maxIndex ? "opacity-40 cursor-not-allowed" : "hover:bg-emerald-50"}`}
        >
          ›
        </button>
        <div className="overflow-hidden mx-2">
          <div
            className="flex items-stretch transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${translatePct}%)` }}
          >
            {items.map((item: any, index: number) => (
              <div
                key={index}
                className="px-2 flex-shrink-0 flex"
                style={{ width: `${100 / cardsPerSlide}%` }}
              >
                <div className="group flex flex-col h-full w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-emerald-300">
                  <div className="py-4 px-4 text-center bg-[#F8FAFC]">
                    <h6
                      className="text-base font-bold text-emerald-600"
                      dangerouslySetInnerHTML={{
                        __html: item.title || `Item ${index + 1}`,
                      }}
                    />
                  </div>
                  <div
                    className="p-4 text-center border-t border-gray-200 bg-white text-sm text-gray-700 leading-relaxed flex-1"
                    dangerouslySetInnerHTML={{ __html: item.content || "" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── True False preview ───────────────────────────────────────────────────────
function TrueFalsePreview({ data }: { data: any }) {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [submitted, setSubmitted] = useState(false);

  // Support new structure: data.questions[].{id, statement, answer}
  const questions: any[] = data?.questions ?? [];
  const title: string = data?.title || "";
  const description: string = data?.description || "";

  if (questions.length === 0) {
    return (
      <div className="w-full text-center text-gray-400 text-sm py-6">
        No true/false question added
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <div
          className="text-lg font-semibold text-gray-700 mb-1"
          dangerouslySetInnerHTML={{ __html: title }}
        />
      )}
      {description && (
        <div
          className="text-sm text-gray-500 mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
      <div className="bg-white border-2 border-emerald-600 rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="w-10 py-3 px-4 text-left text-sm font-semibold text-gray-600">
                No
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                Pernyataan
              </th>
              <th className="w-24 py-3 px-4 text-center text-sm font-semibold text-gray-600">
                Benar
              </th>
              <th className="w-24 py-3 px-4 text-center text-sm font-semibold text-gray-600">
                Salah
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {questions.map((q: any, index: number) => {
              const userAns = answers[q.id] ?? null;
              const isCorrect = q.answer === "true";
              const isWrong =
                submitted && userAns !== null && userAns !== isCorrect;
              const isRight =
                submitted && userAns !== null && userAns === isCorrect;
              return (
                <tr
                  key={q.id ?? index}
                  className={`transition ${isWrong ? "bg-red-50" : ""} ${isRight ? "bg-emerald-50" : ""}`}
                >
                  <td className="py-4 px-4 text-sm text-gray-500 align-middle">
                    {index + 1}
                  </td>
                  <td
                    className={`py-4 px-4 text-sm align-middle leading-snug ${isWrong ? "text-red-600 font-medium" : "text-gray-700"}`}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: q.statement || `Pernyataan ${index + 1}`,
                      }}
                    />
                  </td>
                  <td className="py-4 px-4 align-middle text-center">
                    <input
                      type="radio"
                      name={`tf-${q.id ?? index}`}
                      checked={userAns === true}
                      onChange={() =>
                        !submitted &&
                        setAnswers((p) => ({ ...p, [q.id]: true }))
                      }
                      className="w-4 h-4 accent-emerald-600"
                    />
                  </td>
                  <td className="py-4 px-4 align-middle text-center">
                    <input
                      type="radio"
                      name={`tf-${q.id ?? index}`}
                      checked={userAns === false}
                      onChange={() =>
                        !submitted &&
                        setAnswers((p) => ({ ...p, [q.id]: false }))
                      }
                      className="w-4 h-4 accent-emerald-600"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!submitted && (
          <div className="flex justify-center py-6 border-t border-gray-100">
            <button
              onClick={() => setSubmitted(true)}
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
            >
              Submit Jawaban
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Matching preview ─────────────────────────────────────────────────────────
function MatchingPreview({ data }: { data: any }) {
  // Support new structure: data.pairs[].{id, question, answer}
  const pairs: any[] = data?.pairs ?? [];
  const title: string = data?.title || "";
  const description: string = data?.description || "";

  // Shuffle answers for the draggable chips
  const [availableChips, setAvailableChips] = useState<
    { id: string; value: string }[]
  >(() =>
    pairs
      .map((p: any, i: number) => ({
        id: `chip-${p.id ?? i}`,
        value: p.answer,
      }))
      .sort(() => Math.random() - 0.5),
  );
  const [slots, setSlots] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(pairs.map((p: any) => [p.id, null])),
  );
  const [dragging, setDragging] = useState<{
    id: string;
    value: string;
  } | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<"pool" | string | null>(
    null,
  );
  const [submitted, setSubmitted] = useState(false);

  if (pairs.length === 0) {
    return (
      <div className="w-full text-center text-gray-400 text-sm py-6">
        No matching question added
      </div>
    );
  }

  const dropOnSlot = (pairId: string) => {
    if (!dragging) return;
    setSlots((prev) => {
      const next = { ...prev };
      const existing = next[pairId];
      if (draggingFrom === "pool") {
        setAvailableChips((chips) => chips.filter((c) => c.id !== dragging.id));
        if (existing) {
          setAvailableChips((chips) => [
            ...chips,
            { id: `${pairId}-ret-${Date.now()}`, value: existing },
          ]);
        }
      } else if (draggingFrom !== null) {
        next[draggingFrom] = existing;
      }
      next[pairId] = dragging.value;
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
        { id: `${dragging.id}-ret`, value: dragging.value },
      ]);
    }
    setDragging(null);
    setDraggingFrom(null);
  };

  return (
    <div className="w-full">
      {title && (
        <div
          className="text-lg font-semibold text-gray-700 mb-1"
          dangerouslySetInnerHTML={{ __html: title }}
        />
      )}
      {description && (
        <div
          className="text-sm text-gray-500 mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}

      <div className="bg-white border-2 border-emerald-600 rounded-xl overflow-hidden p-6">
        {/* Answer chips pool */}
        {!submitted && (
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-600 text-center mb-3">
              Pilihan Jawaban
            </p>
            <div
              className="flex flex-wrap justify-center gap-3 min-h-[40px]"
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
                    setDragging(chip);
                    setDraggingFrom("pool");
                  }}
                  className="px-4 py-2 rounded-lg border border-emerald-500 bg-white text-sm text-gray-700 cursor-grab hover:bg-emerald-50 transition shadow-sm"
                  dangerouslySetInnerHTML={{ __html: chip.value }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 italic mt-3 text-center">
              (Seret dan lepaskan card ke area kosong yang tersedia)
            </p>
          </div>
        )}

        {/* Matching rows */}
        <div className="space-y-3">
          {pairs.map((pair: any) => {
            const slotValue = slots[pair.id];
            const isCorrect = submitted && slotValue === pair.answer;
            const isWrong =
              submitted && slotValue !== null && slotValue !== pair.answer;
            return (
              <div key={pair.id} className="flex items-center gap-4">
                <div
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-100 text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: pair.question || "—" }}
                />
                <span className="text-emerald-600 font-bold text-xl shrink-0">
                  →
                </span>
                <div
                  className={`flex-1 min-h-[44px] rounded-lg border-2 border-dashed flex items-center justify-center px-3 transition ${
                    slotValue
                      ? isCorrect
                        ? "border-emerald-400 bg-emerald-50"
                        : isWrong
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300 bg-white"
                      : "border-gray-300 bg-gray-50"
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
                        setDragging({
                          id: `${pair.id}-slot`,
                          value: slotValue,
                        });
                        setDraggingFrom(pair.id);
                      }}
                      className="px-3 py-1.5 rounded-md text-sm border bg-white border-gray-300 cursor-grab"
                      dangerouslySetInnerHTML={{ __html: slotValue }}
                    />
                  ) : (
                    <span className="text-xs text-gray-400">Drop di sini</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!submitted && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setSubmitted(true)}
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
            >
              Submit Jawaban
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Coding preview ───────────────────────────────────────────────────────────
function CodingPreview({ data }: { data: any }) {
  const [output, setOutput] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  // New structure: data.title, data.description, data.question (code), data.language, data.expectedOutput
  const title: string = data?.title || "";
  const description: string = data?.description || "";
  const code: string = data?.question || data?.code || "";
  const language: string = data?.language
    ? data.language.charAt(0).toUpperCase() + data.language.slice(1)
    : "Code";
  const expectedOutput: string =
    data?.expectedOutput || data?.expectedResult || "";

  const handleCopy = async (text: string, type: "code" | "output") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "code") {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 1500);
      } else {
        setCopiedOutput(true);
        setTimeout(() => setCopiedOutput(false), 1500);
      }
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  if (!code) {
    return (
      <div className="w-full text-center text-gray-400 text-sm py-6">
        No code added
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Title & description — start aligned */}
      {title && (
        <div className="text-lg font-semibold text-gray-700 mb-1">{title}</div>
      )}
      {description && (
        <div
          className="text-sm text-gray-500 mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}

      {/* Code block — centered */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl bg-[#0F172A] rounded-xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-3 bg-[#1E293B] border-b border-slate-700">
            <span className="text-sm font-medium text-emerald-400 uppercase tracking-wide">
              {language}
            </span>

            <div className="flex items-center gap-2">
              {/* Copy Code */}
              <button
                onClick={() => handleCopy(code, "code")}
                className="px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition"
              >
                {copiedCode ? "Copied!" : "Copy"}
              </button>

              {/* Run */}
              <button
                onClick={() => setOutput(expectedOutput)}
                className="px-4 py-1.5 text-sm font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
              >
                Run Code
              </button>
            </div>
          </div>
          <pre className="p-6 text-sm text-slate-200 font-mono whitespace-pre-wrap overflow-x-auto">
            {code}
          </pre>
          {output && (
            <div className="border-t border-slate-700 bg-black px-6 py-4 relative">
              {/* Copy Output */}
              <button
                onClick={() => handleCopy(output, "output")}
                className="absolute top-3 right-4 px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition"
              >
                {copiedOutput ? "Copied!" : "Copy"}
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
  );
}

// ─── Render single item as preview ────────────────────────────────────────────
function PreviewItem({ item }: { item: CanvasItem }) {
  switch (item.id) {
    case "heading":
      return <HeadingPreview html={item.data?.value || ""} />;
    case "paragraph":
      return <ParagraphPreview html={item.data?.value || ""} />;
    case "highlight":
      return <HighlightPreview html={item.data?.value || ""} />;
    case "summary":
      return <SummaryPreview html={item.data?.value || ""} />;
    case "image":
      return <ImagePreview src={item.data?.src} />;
    case "video":
      return <VideoPreview src={item.data?.src} />;
    case "accordion":
      return <AccordionPreview data={item.data} />;
    case "tab-navigation":
      return <TabNavigationPreview data={item.data} />;
    case "content-card":
      return <ContentCardPreview data={item.data} />;
    case "carousel":
      return <CarouselPreview data={item.data} />;
    case "true-false":
      return <TrueFalsePreview data={item.data} />;
    case "matching":
      return <MatchingPreview data={item.data} />;
    case "coding":
      return <CodingPreview data={item.data} />;
    default:
      return null;
  }
}

// ─── Scroll to top button — improvement: tombol kembali ke atas ──────────────
// Berguna saat konten panjang agar mentor bisa cepat kembali ke awal.
function ScrollToTopButton({
  scrollRef,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setVisible(el.scrollTop > 300);
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, [scrollRef]);

  if (!visible) return null;

  return (
    <button
      onClick={() =>
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
      }
      className="fixed bottom-20 right-8 z-[10001] w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-all hover:scale-110"
      title="Kembali ke atas"
    >
      ↑
    </button>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function MaterialPreviewModal({
  open,
  onClose,
  title,
  items,
}: MaterialPreviewModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape ONLY — tidak close saat klik backdrop
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Reset scroll ke atas setiap kali modal dibuka
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center">
      {/* ── Backdrop — onClick DIHAPUS agar tidak close saat klik di luar ── */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* ── Modal shell ──────────────────────────────────────────────────── */}
      {/* 
        FIX 1: Backdrop tidak menutup modal — onClick di backdrop dihapus.
        FIX 2: overflow-y-auto ada di div scrollable area (bukan modal shell),
               sehingga modal tetap di posisi tapi konten di dalamnya bisa scroll.
        Modal pakai h-[calc(100vh-48px)] dengan my-6 agar ada ruang visual di atas bawah.
      */}
      <div
        className="relative z-10 flex flex-col w-full max-w-4xl mx-4 my-6 bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ height: "calc(100vh - 48px)" }}
      >
        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            {/* Browser dot indicators */}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <Monitor size={13} className="text-emerald-500" />
              Preview — Tampilan Mentee
            </div>
            {/* Improvement: badge jumlah elemen */}
            {items.length > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold border border-emerald-100">
                {items.length} elemen
              </span>
            )}
          </div>

          {/* Improvement: keyboard hint + close button */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-[10px] text-gray-300 font-mono border border-gray-200 rounded px-1.5 py-0.5">
              ESC
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              title="Tutup preview (Esc)"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ── Scrollable content area ───────────────────────────────────────
            overflow-y-auto di sini — bukan di modal shell — supaya modal
            tetap berukuran fixed tapi konten bisa di-scroll bebas.
        ──────────────────────────────────────────────────────────────────── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto px-8 py-10">
            {/* Improvement: header materi dengan chip status */}
            <div className="mb-10 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold border border-emerald-100">
                  Materi
                </span>
              </div>
              <h1 className="text-3xl font-bold text-black leading-tight">
                {title || "Untitled Material"}
              </h1>
            </div>

            {/* Empty state */}
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-gray-400"
                  >
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">
                  Belum ada konten yang ditambahkan
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  Tambahkan elemen dari sidebar untuk mulai membangun materi
                </p>
              </div>
            )}

            {/* Items */}
            <article className="space-y-10">
              {items.map((item) => (
                <div key={item.instanceId}>
                  <PreviewItem item={item} />
                </div>
              ))}
            </article>

            {/* Improvement: footer materi — memberikan kesan halaman lengkap */}
            {items.length > 0 && (
              <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-center gap-3 text-gray-300">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-[11px] font-medium tracking-widest uppercase">
                  Akhir Materi
                </span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between px-8 py-3 border-t border-gray-100 bg-gray-50/80">
          <span className="text-xs text-gray-400">
            Ini adalah tampilan yang akan dilihat mentee
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition"
          >
            Kembali ke Editor
          </button>
        </div>
      </div>

      {/* Scroll to top — floating button, muncul setelah scroll 300px */}
      <ScrollToTopButton scrollRef={scrollRef} />
    </div>
  );
}
