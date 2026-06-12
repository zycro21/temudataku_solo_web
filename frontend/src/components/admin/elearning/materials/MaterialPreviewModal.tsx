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

// ─── Quiz preview — semua soal sekaligus, navigation pills, explanation ──────
function QuizModalPreview({ data }: { data: any }) {
  const questions: any[] = data?.questions ?? [];
  const title: string = data?.title || "";
  const description: string = data?.description || "";

  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const total = questions.length;

  if (total === 0) {
    return (
      <div className="w-full text-center text-gray-400 text-sm py-6">
        No quiz questions added
      </div>
    );
  }

  const selectAnswer = (qId: string, optId: string, type: string) => {
    if (submitted) return;
    setAnswers((prev) => {
      if (type === "single") return { ...prev, [qId]: [optId] };
      const cur = prev[qId] ?? [];
      return {
        ...prev,
        [qId]: cur.includes(optId)
          ? cur.filter((id: string) => id !== optId)
          : [...cur, optId],
      };
    });
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q: any) => {
      const correctOpts = (q.options ?? [])
        .filter((o: any) => o.value === "true")
        .map((o: any) => o.id);
      const userAns = answers[q.id] ?? [];
      const isOk =
        correctOpts.length > 0 &&
        correctOpts.length === userAns.length &&
        correctOpts.every((id: string) => userAns.includes(id));
      if (isOk) correct++;
    });
    setScore(Math.round((correct / total) * 100));
    setSubmitted(true);
  };

  const getStatus = (q: any, optId: string) => {
    if (!submitted) return "idle";
    const isCorrect =
      (q.options ?? []).find((o: any) => o.id === optId)?.value === "true";
    const userSelected = (answers[q.id] ?? []).includes(optId);
    if (isCorrect && userSelected) return "correct";
    if (!isCorrect && userSelected) return "wrong";
    if (isCorrect && !userSelected) return "missed";
    return "idle";
  };

  const isQuestionCorrect = (q: any) => {
    if (!submitted) return null;
    const correctOpts = (q.options ?? [])
      .filter((o: any) => o.value === "true")
      .map((o: any) => o.id);
    const userAns = answers[q.id] ?? [];
    return (
      correctOpts.length > 0 &&
      correctOpts.length === userAns.length &&
      correctOpts.every((id: string) => userAns.includes(id))
    );
  };

  return (
    <div className="w-full">
      {title && (
        <p className="text-lg font-semibold text-gray-700 mb-1">{title}</p>
      )}
      {description && (
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
          {description}
        </p>
      )}

      <div className="bg-white border-2 border-emerald-600 rounded-xl overflow-hidden">
        {/* ── Navigation pills ── */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <p className="text-sm text-gray-500 mb-3">
            Semua pertanyaan dijawab dengan benar
          </p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q: any, idx: number) => {
              const correct = isQuestionCorrect(q);
              const answered = (answers[q.id] ?? []).length > 0;
              const pillClass =
                correct === true
                  ? "bg-emerald-500 text-white"
                  : correct === false
                    ? "bg-red-400 text-white"
                    : answered
                      ? "bg-emerald-200 text-emerald-800"
                      : "bg-emerald-500 text-white";
              return (
                <button
                  key={q.id ?? idx}
                  type="button"
                  onClick={() =>
                    questionRefs.current[idx]?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition hover:opacity-80 ${pillClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── All questions ── */}
        <div className="divide-y divide-gray-100">
          {questions.map((q: any, qIdx: number) => {
            const correct = isQuestionCorrect(q);
            return (
              <div
                key={q.id ?? qIdx}
                ref={(el) => {
                  questionRefs.current[qIdx] = el;
                }}
                className="px-6 py-6"
              >
                <p className="text-base font-bold text-gray-800 mb-0.5">
                  Pertanyaan {qIdx + 1}
                </p>
                <p className="text-base text-gray-700 mb-1 leading-snug">
                  {q.questionText || `Question ${qIdx + 1}`}
                </p>
                {q.questionType === "multiple" && (
                  <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                    Pilih pernyataan yang BENAR.
                  </p>
                )}

                <div className="space-y-2.5 mt-3">
                  {(q.options ?? []).map((opt: any, oi: number) => {
                    const status = getStatus(q, opt.id);
                    const isSelected = (answers[q.id] ?? []).includes(opt.id);

                    const rowClass =
                      status === "correct"
                        ? "border-emerald-400 bg-emerald-50"
                        : status === "wrong"
                          ? "border-gray-200 bg-white"
                          : status === "missed"
                            ? "border-emerald-300 bg-emerald-50/30"
                            : isSelected
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/20";

                    const checkBg =
                      status === "correct" || isSelected
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-gray-300 bg-white";

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          selectAnswer(q.id, opt.id, q.questionType)
                        }
                        disabled={submitted}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition text-left ${rowClass}`}
                      >
                        <div
                          className={`shrink-0 w-5 h-5 border-2 flex items-center justify-center transition ${
                            q.questionType === "multiple"
                              ? "rounded"
                              : "rounded-full"
                          } ${checkBg}`}
                        >
                          {(isSelected || status === "correct") && (
                            <svg
                              width="11"
                              height="9"
                              viewBox="0 0 11 9"
                              fill="none"
                            >
                              <path
                                d="M1 4.5 L4 7.5 L10 1"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm flex-1 text-gray-700 leading-snug">
                          {opt.text || `Option ${oi + 1}`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation box */}
                {submitted && (
                  <div
                    className={`mt-4 flex items-start gap-3 px-4 py-3 rounded-xl ${
                      correct
                        ? "bg-emerald-50 border border-emerald-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div
                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                        correct ? "bg-emerald-500" : "bg-red-400"
                      }`}
                    >
                      {correct ? (
                        <svg
                          width="12"
                          height="10"
                          viewBox="0 0 12 10"
                          fill="none"
                        >
                          <path
                            d="M1 5 L4.5 8.5 L11 1"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <path
                            d="M2 2 L8 8 M8 2 L2 8"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-bold ${
                          correct ? "text-emerald-700" : "text-red-600"
                        }`}
                      >
                        {correct ? "Benar!" : "Belum tepat."}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                        {correct
                          ? "Tujuan utama data science adalah mengolah data agar menghasilkan insight yang berguna."
                          : `Jawaban yang benar: ${
                              (q.options ?? [])
                                .filter((o: any) => o.value === "true")
                                .map((o: any) => o.text)
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

        {/* ── Footer: score + submit ── */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-100">
          {submitted && score !== null && (
            <div
              className={`mb-4 px-5 py-4 rounded-xl text-center ${
                score >= 70
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <p
                className={`text-3xl font-bold ${score >= 70 ? "text-emerald-600" : "text-red-500"}`}
              >
                {score}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {score >= 70 ? "Bagus! Kamu lulus quiz ini." : "Coba lagi ya!"}
              </p>
            </div>
          )}
          {!submitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-3 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
            >
              Submit Jawaban
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
                setScore(null);
              }}
              className="w-full py-3 rounded-lg border border-emerald-500 text-emerald-600 text-sm font-semibold hover:bg-emerald-50 transition"
            >
              Coba Lagi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Project preview — 2 kolom: kiri deskripsi+instruksi+dokumen, kanan upload ─
function ProjectModalPreview({ data }: { data: any }) {
  const question: string = data?.question || "";
  const attachments: any[] = data?.attachments ?? [];

  const [submitted, setSubmitted] = useState(false);
  const [submittedFiles, setSubmittedFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setSubmittedFiles((prev) => [...prev, ...Array.from(files)]);
  };

  // Pisahkan question menjadi paragraf deskripsi dan instruksi bernomor
  const lines = question
    .split("\n")
    .map((l: string) => l.trim())
    .filter(Boolean);
  const isInstructionLine = (line: string) => /^(\d+\.|[-•*])/.test(line);
  const descLines = lines.filter((l: string) => !isInstructionLine(l));
  const instrLines = lines.filter((l: string) => isInstructionLine(l));
  const cleanInstruction = (line: string) =>
    line.replace(/^(\d+\.|[-•*])\s*/, "").trim();

  const formatColorMap: Record<string, string> = {
    PDF: "bg-red-100 text-red-600",
    DOC: "bg-blue-100 text-blue-600",
    XLS: "bg-green-100 text-green-700",
    JPG: "bg-yellow-100 text-yellow-700",
    PNG: "bg-purple-100 text-purple-600",
    SVG: "bg-emerald-100 text-emerald-600",
    FILE: "bg-gray-100 text-gray-500",
  };

  if (!question && attachments.length === 0) {
    return (
      <div className="w-full text-center text-gray-400 text-sm py-6">
        No project instructions added
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white border-2 border-emerald-600 rounded-xl overflow-hidden">
        <div className="flex divide-x divide-gray-100">
          {/* ── LEFT col: deskripsi, instruksi, dokumen ── */}
          <div className="flex-1 min-w-0 px-7 py-6">
            {/* Description */}
            {descLines.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-bold text-gray-700 mb-2">
                  Deskripsi Proyek
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {descLines.join(" ")}
                </p>
              </div>
            )}

            {/* Instructions */}
            {instrLines.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-bold text-gray-700 mb-2">
                  Instruksi Pengerjaan:
                </p>
                <ol className="space-y-2">
                  {instrLines.map((line: string, i: number) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="text-sm font-semibold text-gray-500 shrink-0 tabular-nums">
                        {i + 1}.
                      </span>
                      <span className="text-sm text-gray-600 leading-relaxed">
                        {cleanInstruction(line)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* If no structured content at all, show raw */}
            {descLines.length === 0 && instrLines.length === 0 && question && (
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                {question}
              </p>
            )}

            {/* Documents */}
            {attachments.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">
                  Dokumen yang Perlu Diunduh
                </p>
                <div className="space-y-2">
                  {attachments.map((att: any) => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/20 transition group/dl"
                    >
                      <div
                        className={`w-10 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                          att.format === "PDF"
                            ? "bg-red-100"
                            : att.format === "DOC"
                              ? "bg-blue-100"
                              : att.format === "XLS" || att.format === "CSV"
                                ? "bg-green-100"
                                : "bg-gray-100"
                        }`}
                      >
                        <svg
                          width="18"
                          height="20"
                          viewBox="0 0 18 20"
                          fill="none"
                          className={
                            att.format === "PDF"
                              ? "text-red-500"
                              : att.format === "DOC"
                                ? "text-blue-500"
                                : att.format === "XLS" || att.format === "CSV"
                                  ? "text-green-600"
                                  : "text-gray-400"
                          }
                        >
                          <path
                            d="M3 2h9l4 4v12a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            fill="none"
                          />
                          <path
                            d="M12 2v5h4"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            fill="none"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate">
                          {att.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {att.format}
                        </p>
                      </div>
                      {/* Download circle button */}
                      <div className="shrink-0 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover/dl:border-emerald-400 group-hover/dl:bg-emerald-50 transition">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          className="text-gray-400 group-hover/dl:text-emerald-500 transition"
                        >
                          <path
                            d="M7 2v8M4 7l3 3 3-3M2 12h10"
                            stroke="currentColor"
                            strokeWidth="1.6"
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

          {/* ── RIGHT col: upload + catatan ── */}
          <div className="w-[240px] shrink-0 px-5 py-6 flex flex-col gap-4">
            {!submitted ? (
              <>
                {/* Upload */}
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">
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
                    className={`w-full border-2 border-dashed rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer transition ${
                      isDragOver
                        ? "border-emerald-400 bg-emerald-50/30"
                        : "border-gray-200 bg-gray-50/20 hover:border-emerald-300 hover:bg-emerald-50/20"
                    }`}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                      className={`mb-1.5 ${isDragOver ? "text-emerald-500" : "text-gray-400"}`}
                    >
                      <path
                        d="M16 22V10M10 16l6-6 6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <rect
                        x="4"
                        y="4"
                        width="24"
                        height="24"
                        rx="5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeOpacity="0.3"
                      />
                    </svg>
                    <p className="text-xs text-gray-500 text-center leading-snug px-2">
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

                  {submittedFiles.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {submittedFiles.map((f, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-2.5 py-2 bg-emerald-50 rounded-lg border border-emerald-200"
                        >
                          <svg
                            width="12"
                            height="14"
                            viewBox="0 0 12 14"
                            fill="none"
                            className="text-emerald-500 shrink-0"
                          >
                            <path
                              d="M2 1h6l3 3v8a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1z"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              fill="none"
                            />
                          </svg>
                          <span className="text-xs text-emerald-700 flex-1 truncate">
                            {f.name}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setSubmittedFiles((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }
                            className="text-emerald-400 hover:text-red-400 transition"
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 10 10"
                              fill="none"
                            >
                              <path
                                d="M2 2l6 6M8 2l-6 6"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Catatan */}
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">
                    Catatan Tambahan (opsional)
                  </p>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Tambahkan catatan untuk instruktur..."
                    rows={3}
                    className="w-full text-sm text-gray-700 placeholder-gray-300 border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>

                {/* Submit */}
                <button
                  type="button"
                  onClick={() => {
                    if (submittedFiles.length === 0) return;
                    setSubmitted(true);
                  }}
                  disabled={submittedFiles.length === 0}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-40"
                >
                  Kumpulkan Proyek →
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-8 gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    className="text-emerald-500"
                  >
                    <path
                      d="M6 14.5 L11 20 L22 9"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Terkumpul!</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
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
                  className="text-xs font-semibold text-emerald-600 hover:underline"
                >
                  Kumpulkan ulang
                </button>
              </div>
            )}
          </div>
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
    case "quiz":
      return <QuizModalPreview data={item.data} />;
    case "project":
      return <ProjectModalPreview data={item.data} />;
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
