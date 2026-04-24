"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Pencil,
  Eye,
  Save,
  Globe,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { materialsContentBySubModule } from "@/data/elearningData";
import ContentElementsSidebar, {
  ALL_ELEMENTS,
  ContentElement,
} from "@/components/admin/elearning/materials/ContentElementSidebar";
import CanvasCard, {
  type CanvasItem,
} from "@/components/admin/elearning/materials/CanvasCard";
import StylePanel, {
  type StyleState,
} from "@/components/admin/elearning/materials/StylePanel";
import { type RichTextEditorRef } from "@/components/admin/elearning/materials/RichTextEditor";
import PublishConfirmModal from "@/components/admin/elearning/materials/PublishConfirmModal";
import PublishSuccessModal from "@/components/admin/elearning/materials/PublishSuccessModal";
import MaterialPreviewModal from "@/components/admin/elearning/materials/MaterialPreviewModal";
import axios from "axios";
import { toast } from "sonner";

// ─── ID generator ─────────────────────────────────────────────────────────────
let _idCounter = 0;
function genId(baseId: string): string {
  _idCounter += 1;
  return `${baseId}-${_idCounter}`;
}

const DEFAULT_STYLE: StyleState = {
  fontType: "Paragraph",
  fontSize: 16,
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  highlight: false,
  penColor: "#000000",
  align: "left",
  listType: "none",
};

// ─── Markdown ↔ HTML converter ────────────────────────────────────────────────
// Dipakai saat restore data ke RichTextEditor

export function markdownToHTML(md: string): string {
  if (!md) return "";

  // Jika sudah HTML (mengandung tag), kembalikan langsung
  if (/<[a-z][\s\S]*>/i.test(md)) return md;

  let html = md;

  // Font size: {fs:16}text{/fs} → <span style="font-size:16px">text</span>
  html = html.replace(
    /\{fs:(\d+)\}([\s\S]*?)\{\/fs\}/g,
    (_, size, text) => `<span style="font-size:${size}px">${text}</span>`,
  );

  // Pen color: {color:#rrggbb}text{/color}
  html = html.replace(
    /\{color:(#[0-9a-fA-F]{6})\}([\s\S]*?)\{\/color\}/g,
    (_, color, text) => `<span style="color:${color}">${text}</span>`,
  );

  // Highlight: {hl:#rrggbb}text{/hl}
  html = html.replace(
    /\{hl:(#[0-9a-fA-F]{6})\}([\s\S]*?)\{\/hl\}/g,
    (_, color, text) =>
      `<span style="background-color:${color}">${text}</span>`,
  );

  // Bold: *text*
  html = html.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");

  // Italic: ~text~
  html = html.replace(
    /~([^~]+)~/g,
    '<span style="display:inline-block;transform:skewX(-8deg)">$1</span>',
  );

  // Underline: _text_
  html = html.replace(/_([^_]+)_/g, "<u>$1</u>");

  // Strikethrough: ~~text~~  (cek dulu sebelum ~italic~)
  // Note: sudah dihandle di atas, tapi strikethrough pakai --text--
  html = html.replace(/--([^-]+)--/g, "<s>$1</s>");

  // Alignment (untuk seluruh block): {align:center}
  // Ini diterapkan ke paragraf
  html = html.replace(
    /\{align:(left|center|right|justify)\}([\s\S]*?)\{\/align\}/g,
    (_, align, text) => {
      const alignMap: Record<string, string> = {
        left: "left",
        center: "center",
        right: "right",
        justify: "justify",
      };
      return `<div style="text-align:${alignMap[align]}">${text}</div>`;
    },
  );

  // Unordered list: {ul:disc}item1|item2{/ul}
  html = html.replace(
    /\{ul:([^}]+)\}([\s\S]*?)\{\/ul\}/g,
    (_, style, content) => {
      const items = content
        .split("|")
        .map((item: string) => `<li>${item.trim()}</li>`)
        .join("");
      return `<ul style="list-style-type:${style};padding-left:24px">${items}</ul>`;
    },
  );

  // Ordered list: {ol:decimal}item1|item2{/ol}
  html = html.replace(
    /\{ol:([^}]+)\}([\s\S]*?)\{\/ol\}/g,
    (_, style, content) => {
      const items = content
        .split("|")
        .map((item: string) => `<li>${item.trim()}</li>`)
        .join("");
      return `<ol style="list-style-type:${style};padding-left:24px">${items}</ol>`;
    },
  );

  // Newline → <br>
  html = html.replace(/\n/g, "<br>");

  return html;
}

export function htmlToMarkdown(html: string): string {
  if (!html) return "";

  // Jika tidak ada tag HTML, kembalikan langsung
  if (!/<[a-z][\s\S]*>/i.test(html)) return html;

  let md = html;

  // Font size
  md = md.replace(
    /<span[^>]*style="[^"]*font-size:\s*(\d+)px[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    (_, size, text) => `{fs:${size}}${htmlToMarkdown(text)}{/fs}`,
  );

  // Pen color
  md = md.replace(
    /<span[^>]*style="[^"]*color:\s*(#[0-9a-fA-F]{6})[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    (_, color, text) => `{color:${color}}${htmlToMarkdown(text)}{/color}`,
  );

  // Highlight
  md = md.replace(
    /<span[^>]*style="[^"]*background-color:\s*(#[0-9a-fA-F]{6})[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    (_, color, text) => `{hl:${color}}${htmlToMarkdown(text)}{/hl}`,
  );

  // Italic (skewX span)
  md = md.replace(
    /<span[^>]*style="[^"]*skewX[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    (_, text) => `~${text}~`,
  );

  // Bold
  md = md.replace(/<strong>([\s\S]*?)<\/strong>/gi, "*$1*");
  md = md.replace(/<b>([\s\S]*?)<\/b>/gi, "*$1*");

  // Underline
  md = md.replace(/<u>([\s\S]*?)<\/u>/gi, "_$1_");

  // Strikethrough
  md = md.replace(/<s>([\s\S]*?)<\/s>/gi, "--$1--");
  md = md.replace(/<strike>([\s\S]*?)<\/strike>/gi, "--$1--");
  md = md.replace(/<del>([\s\S]*?)<\/del>/gi, "--$1--");

  // Alignment div
  md = md.replace(
    /<div[^>]*style="[^"]*text-align:\s*(left|center|right|justify)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    (_, align, text) => `{align:${align}}${htmlToMarkdown(text)}{/align}`,
  );

  // Unordered list
  md = md.replace(
    /<ul[^>]*style="[^"]*list-style-type:\s*([^;}"]+)[^"]*"[^>]*>([\s\S]*?)<\/ul>/gi,
    (_, style, content) => {
      const items = [...content.matchAll(/<li>([\s\S]*?)<\/li>/gi)]
        .map((m) => m[1])
        .join("|");
      return `{ul:${style.trim()}}${items}{/ul}`;
    },
  );

  // Ordered list
  md = md.replace(
    /<ol[^>]*style="[^"]*list-style-type:\s*([^;}"]+)[^"]*"[^>]*>([\s\S]*?)<\/ol>/gi,
    (_, style, content) => {
      const items = [...content.matchAll(/<li>([\s\S]*?)<\/li>/gi)]
        .map((m) => m[1])
        .join("|");
      return `{ol:${style.trim()}}${items}{/ol}`;
    },
  );

  // br → newline
  md = md.replace(/<br\s*\/?>/gi, "\n");

  // Strip remaining tags
  md = md.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  md = md
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");

  return md;
}

function mapMaterialToCanvasItems(material: any): CanvasItem[] {
  // Normalize type dari data (underscore) ke canvas id (kebab + nama element)
  const TYPE_MAP: Record<string, string> = {
    heading: "heading",
    paragraph: "paragraph",
    highlight: "highlight",
    summary: "summary",
    accordion: "accordion",
    carousel: "carousel",
    content_card: "content-card",
    tab_navigation: "tab-navigation",
    image: "image",
    video: "video",
    coding: "coding",
    "true-false": "true-false",
    matching: "matching",
  };

  return material.blocks.flatMap((block: any) =>
    block.contents.map((content: any) => {
      const canvasId = TYPE_MAP[content.type] ?? content.type;

      // Normalize data sesuai format yang dipakai tiap Body component
      let data: any = undefined;

      switch (content.type) {
        case "heading":
        case "paragraph":
        case "highlight":
          // HeadingBody, ParagraphBody, HighlightBody pakai data.value
          data = { value: markdownToHTML(content.text ?? "") };
          break;

        case "summary":
          // SummaryBody pakai data.value (string HTML atau plain text)
          data = {
            value: Array.isArray(content.comments)
              ? content.comments
                  .map((c: string) => `<p>${markdownToHTML(c)}</p>`)
                  .join("")
              : markdownToHTML(content.text ?? ""),
          };
          break;

        case "accordion":
          // AccordionBody restore cek initialData?.panels (format internal setelah Create)
          // bukan initialData?.items — jadi kita harus output format "panels"
          data = {
            titleHTML: content.title ?? "",
            descriptionHTML: markdownToHTML(content.description ?? ""),
            panels: (content.items ?? []).map((item: any, i: number) => ({
              id: item.id ?? `acc-item-${i}`,
              titleHTML: markdownToHTML(item.title ?? ""),
              contentHTML: markdownToHTML(item.content ?? ""),
            })),
          };
          break;

        case "carousel":
          // CarouselBody pakai initialData: { title, description, cardsPerSlide, items: [{id, label, content, title}] }
          data = {
            title: content.title ?? "",
            description: markdownToHTML(content.description ?? ""),
            cardsPerSlide: content.cardsPerSlide ?? 3,
            items: (content.items ?? []).map((item: any, i: number) => ({
              id: item.id ?? `crs-item-${i}`,
              label: markdownToHTML(item.title ?? ""),
              title: markdownToHTML(item.title ?? ""),
              content: markdownToHTML(item.content ?? ""),
            })),
          };
          break;

        case "content_card":
          // ContentCardBody restore cek initialData?.cards dengan field:
          // { id, title, content, expandedContent } — bukan expandableContent
          // dan cek disableExpandable bukan disableExpandableContent
          data = {
            title: content.title ?? "",
            description: markdownToHTML(content.description ?? ""),
            disableExpandable: content.disableExpandableContent ?? false,
            cards: (content.items ?? []).map((item: any, i: number) => ({
              id: item.id ?? `card-item-${i}`,
              title: markdownToHTML(item.title ?? ""),
              content: markdownToHTML(item.content ?? ""),
              expandedContent: markdownToHTML(item.expandableContent ?? ""),
            })),
          };
          break;

        case "tab_navigation":
          // TabNavigationBody pakai initialData: { title, description, tabs: [{id, title, content}] }
          data = {
            title: content.title ?? "",
            description: markdownToHTML(content.description ?? ""),
            tabs: (content.tabs ?? []).map((tab: any, i: number) => ({
              id: tab.id ?? `tab-item-${i}`,
              title: markdownToHTML(tab.title ?? ""),
              content: markdownToHTML(tab.content ?? ""),
            })),
          };
          break;

        case "image":
          data = { src: content.url ?? content.src ?? null };
          break;

        case "video":
          data = { src: content.url ?? content.src ?? null };
          break;

        case "matching":
          data = {
            question: markdownToHTML(
              content.question ?? content.content?.question ?? "",
            ),
            description: markdownToHTML(
              content.description ?? content.content?.description ?? "",
            ),
            leftItems: (
              content.leftItems ??
              content.content?.leftItems ??
              []
            ).map((item: any, i: number) => ({
              id: item.id ?? `left-${i}`,
              text: markdownToHTML(item.text ?? ""),
            })),
            rightItems: (
              content.rightItems ??
              content.content?.rightItems ??
              []
            ).map((item: any, i: number) => ({
              id: item.id ?? `right-${i}`,
              text: markdownToHTML(item.text ?? ""),
            })),
            correctPairs: (
              content.correctPairs ??
              content.content?.correctPairs ??
              []
            ).map((pair: any) => ({
              leftId: pair.leftId ?? "",
              rightId: pair.rightId ?? "",
            })),
            explanation: markdownToHTML(
              content.explanation ?? content.content?.explanation ?? "",
            ),
          };
          break;

        case "true-false":
          // TrueFalseBody pakai questions[].{id, statement, answer}
          // Data dari MultipleChoiceContent: options = [{id, text}], correctAnswers = [id]
          data = {
            question: markdownToHTML(
              content.question ?? content.content?.question ?? "",
            ),
            description: markdownToHTML(
              content.description ?? content.content?.description ?? "",
            ),
            // Kalau sudah dalam format TrueFalseBody internal (questions[]), restore langsung
            // Kalau dari MultipleChoiceContent (options[]), konversi ke format TrueFalseBody
            questions: (() => {
              // Format internal TrueFalseBody: questions[].{id, statement, answer}
              if (content.questions ?? content.content?.questions) {
                return (content.questions ?? content.content?.questions).map(
                  (q: any) => ({
                    id: q.id ?? `tf-${Math.random()}`,
                    statement: markdownToHTML(q.statement ?? ""),
                    answer: q.answer ?? null,
                  }),
                );
              }
              // Format dari MultipleChoiceContent: options[].{id, text}, correctAnswers[]
              const options = content.options ??
                content.content?.options ?? [
                  { id: "true", text: "True" },
                  { id: "false", text: "False" },
                ];
              const correctAnswers =
                content.correctAnswers ?? content.content?.correctAnswers ?? [];
              return options.map((opt: any, i: number) => ({
                id: opt.id ?? `tf-${i}`,
                statement: markdownToHTML(opt.text ?? ""),
                // Jika option id ada di correctAnswers → answer "true", sisanya "false"
                answer: correctAnswers.includes(opt.id) ? "true" : "false",
              }));
            })(),
            explanation: markdownToHTML(
              content.explanation ?? content.content?.explanation ?? "",
            ),
          };
          break;

        case "coding":
          data = {
            // title & description dari data coding jika ada
            title: markdownToHTML(
              content.title ?? content.content?.title ?? "",
            ),
            description: markdownToHTML(
              content.description ?? content.content?.description ?? "",
            ),
            // language, initialCode, expectedResult dari InteractiveCodeContent
            language: content.language ?? content.content?.language ?? "python",
            // initialCode → dipakai sebagai "question" (code syntax) di CodingBody
            question: content.initialCode ?? content.content?.initialCode ?? "",
            expectedOutput:
              content.expectedResult ?? content.content?.expectedResult ?? "",
          };
          break;

        default:
          data = content;
          break;
      }

      return {
        id: canvasId,
        instanceId: crypto.randomUUID(),
        // Label untuk ditampilkan di card header — ambil dari ALL_ELEMENTS
        label: ALL_ELEMENTS.find((el) => el.id === canvasId)?.label ?? canvasId,
        description:
          ALL_ELEMENTS.find((el) => el.id === canvasId)?.description ?? "",
        data,
      };
    }),
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CreateMaterialPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const subBabId = params?.moduleId as string;
  const mode = searchParams.get("mode");
  const materialId = searchParams.get("materialId");

  const [title, setTitle] = useState("Untitled material");
  const [editingTitle, setEditingTitle] = useState(false);
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // ── Selected element (for Style panel) ───────────────────────────────────
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null,
  );

  const editorRefs = useRef<Map<string, RichTextEditorRef>>(new Map());
  const activeEditorRef = useRef<RichTextEditorRef | null>(null);
  const activeInstanceIdRef = useRef<string | null>(null);

  // ── Style state (reflects selection in active editor) ─────────────────────
  const [styleState, setStyleState] = useState<StyleState>(DEFAULT_STYLE);

  // ── Item counters for unique naming (e.g. "Paragraph 2") ─────────────────
  const [itemCounters, setItemCounters] = useState<Record<string, number>>({});

  const computeCounters = useCallback((list: CanvasItem[]) => {
    const typeCount: Record<string, number> = {};
    const counters: Record<string, number> = {};
    for (const item of list) {
      typeCount[item.id] = (typeCount[item.id] ?? 0) + 1;
      counters[item.instanceId] = typeCount[item.id];
    }
    setItemCounters(counters);
  }, []);

  useEffect(() => {
    computeCounters(items);
  }, [items, computeCounters]);

  useEffect(() => {
    if (mode === "edit" && materialId) {
      const data = materialsContentBySubModule[Number(materialId)];
      if (!data) return;

      const mappedItems = mapMaterialToCanvasItems(data);

      setTitle(data.title);
      setItems(mappedItems);

      // 🔥 reset history biar aman
      setHistory([mappedItems]);
      setHistoryIdx(0);
    }
  }, [mode, materialId]);

  // ── Fetch material data from API saat mode edit ───────────────────────────
  useEffect(() => {
    if (mode === "edit" && materialId) {
      const fetchMaterial = async () => {
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningText/texts/${materialId}`,
            { withCredentials: true },
          );

          const data = res.data.data;

          setTextId(data.id);
          setTitle(data.title || "Untitled material");
          setStatus(data.status);
        } catch (err: any) {
          toast.error(
            err?.response?.data?.message ||
              err?.message ||
              "Gagal mengambil data material",
          );
        }
      };

      fetchMaterial();
    }
  }, [mode, materialId]);

  // ── History for undo/redo ─────────────────────────────────────────────────
  const [history, setHistory] = useState<CanvasItem[][]>([[]]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);

  // ── Preview modal state ───────────────────────────────────────────────────
  const [openPreview, setOpenPreview] = useState(false);

  const [textId, setTextId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(
    "DRAFT",
  );

  const pushHistory = useCallback(
    (next: CanvasItem[]) => {
      setHistory((prev) => [...prev.slice(0, historyIdx + 1), next]);
      setHistoryIdx((i) => i + 1);
    },
    [historyIdx],
  );

  const undo = () => {
    if (historyIdx <= 0) return;
    const newIdx = historyIdx - 1;
    setHistoryIdx(newIdx);
    setItems(history[newIdx]);
  };

  const redo = () => {
    if (historyIdx >= history.length - 1) return;
    const newIdx = historyIdx + 1;
    setHistoryIdx(newIdx);
    setItems(history[newIdx]);
  };

  const makeItem = (el: ContentElement): CanvasItem => ({
    ...el,
    instanceId: genId(el.id),
  });

  const addElement = useCallback(
    (el: ContentElement) => {
      setItems((prev) => {
        const next = [...prev, makeItem(el)];
        pushHistory(next);
        return next;
      });
    },
    [pushHistory],
  );

  // ── Style commands — dispatched to the active editor ──────────────────────
  const handleStyleChange = useCallback((cmd: string, value?: string) => {
    const editor = activeEditorRef.current;
    if (!editor) return;
    editor.execCommand(cmd, value);
  }, []);

  const handleFontTypeChange = useCallback((fontType: string) => {
    const editor = activeEditorRef.current;
    if (!editor) return;
    const formatMap: Record<string, string> = {
      "Heading 1": "h1",
      "Heading 2": "h2",
      "Heading 3": "h3",
      Paragraph: "p",
      Caption: "p",
      Code: "pre",
    };
    editor.execCommand("formatBlock", formatMap[fontType] ?? "p");
    setStyleState((prev) => ({ ...prev, fontType }));
  }, []);

  const handleFontSizeChange = useCallback((fontSize: number) => {
    const editor = activeEditorRef.current;
    if (!editor) return;
    editor.setFontSize(fontSize);
    setStyleState((prev) => ({ ...prev, fontSize }));
  }, []);

  // ── Register / unregister editor refs ────────────────────────────────────
  const registerEditor = useCallback(
    (instanceId: string, ref: RichTextEditorRef | null) => {
      if (ref) {
        editorRefs.current.set(instanceId, ref);
        activeEditorRef.current = ref;
        activeInstanceIdRef.current = instanceId;
        setSelectedInstanceId(instanceId);
      } else {
        editorRefs.current.delete(instanceId);
        if (activeInstanceIdRef.current === instanceId) {
          activeEditorRef.current = null;
          activeInstanceIdRef.current = null;
        }
      }
    },
    [],
  );

  // ── Canvas drop ───────────────────────────────────────────────────────────
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverId(null);
    const canvasId = e.dataTransfer.getData("canvasInstanceId");
    const elementId = e.dataTransfer.getData("elementId");
    if (canvasId) return;
    if (!elementId) return;
    const el = ALL_ELEMENTS.find((x) => x.id === elementId);
    if (el) addElement(el);
  };

  const handleCardDragStart = (e: React.DragEvent, instanceId: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("canvasInstanceId", instanceId);
    e.dataTransfer.setData("elementId", "");
  };

  const handleCardDragOver = (e: React.DragEvent, instanceId: string) => {
    e.preventDefault();
    setDragOverId(instanceId);
  };

  const handleCardDrop = (e: React.DragEvent, targetInstanceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(null);
    const canvasId = e.dataTransfer.getData("canvasInstanceId");
    const elementId = e.dataTransfer.getData("elementId");

    if (canvasId) {
      setItems((prev) => {
        const from = prev.findIndex((x) => x.instanceId === canvasId);
        const to = prev.findIndex((x) => x.instanceId === targetInstanceId);
        if (from === -1 || to === -1 || from === to) return prev;
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        pushHistory(next);
        return next;
      });
    } else if (elementId) {
      const el = ALL_ELEMENTS.find((x) => x.id === elementId);
      if (!el) return;
      setItems((prev) => {
        const idx = prev.findIndex((x) => x.instanceId === targetInstanceId);
        const next = [...prev];
        next.splice(idx, 0, makeItem(el));
        pushHistory(next);
        return next;
      });
    }
  };

  const handleRemove = (instanceId: string) => {
    if (selectedInstanceId === instanceId) setSelectedInstanceId(null);
    setItems((prev) => {
      const next = prev.filter((e) => e.instanceId !== instanceId);
      pushHistory(next);
      return next;
    });
  };

  const handleMoveUp = (instanceId: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.instanceId === instanceId);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      pushHistory(next);
      return next;
    });
  };

  const handleMoveDown = (instanceId: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.instanceId === instanceId);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      pushHistory(next);
      return next;
    });
  };

  const handleDuplicate = (instanceId: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.instanceId === instanceId);
      if (idx === -1) return prev;

      const item = prev[idx];
      const newItem: CanvasItem = {
        ...item,
        instanceId: crypto.randomUUID(),
        data: item.data ? JSON.parse(JSON.stringify(item.data)) : undefined,
      };

      const next = [...prev];
      next.splice(idx + 1, 0, newItem);
      pushHistory(next);
      return next;
    });
  };

  const handleDuplicateMany = useCallback(
    (instanceIds: string[]): string[] => {
      const newIds: string[] = [];
      setItems((prev) => {
        const next = [...prev];
        const lastIdx = Math.max(
          ...instanceIds.map((id) =>
            next.findIndex((x) => x.instanceId === id),
          ),
        );
        if (lastIdx === -1) return prev;

        const newItems: CanvasItem[] = instanceIds
          .map((id) => {
            const item = next.find((x) => x.instanceId === id);
            if (!item) return null;
            const newItem: CanvasItem = {
              ...item,
              instanceId: crypto.randomUUID(),
              data: item.data
                ? JSON.parse(JSON.stringify(item.data))
                : undefined,
            };
            newIds.push(newItem.instanceId);
            return newItem;
          })
          .filter(Boolean) as CanvasItem[];

        next.splice(lastIdx + 1, 0, ...newItems);
        pushHistory(next);
        return next;
      });
      return newIds;
    },
    [pushHistory],
  );

  const updateItem = useCallback((instanceId: string, data: any) => {
    setItems((prev) => {
      const idx = prev.findIndex((item) => item.instanceId === instanceId);
      if (idx === -1) return prev;
      if (prev[idx].data === data) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], data };
      return next;
    });
  }, []);

  const canUndo = historyIdx > 0;
  const canRedo = historyIdx < history.length - 1;

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      // 🔥 FIRST SAVE (CREATE)
      if (!textId) {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningText/subbabs/${subBabId}/texts`,
          {
            title,
            status: "ARCHIVED",
            blocks: [],
          },
          {
            withCredentials: true,
          },
        );

        const data = res.data;

        setTextId(data.data.id);
        setStatus(data.data.status);

        toast.success("Material berhasil disimpan");
        console.log("✅ First save success:", data);

        // 🔥 redirect ke mode edit
        router.push(
          `/admin/elearning/streams/${params.streamId}/courses/${params.courseId}/modules/${params.moduleId}/materials/create?mode=edit&materialId=${data.data.id}`,
        );
      } else {
        // 🔥 nanti update
        console.log("Update mode (belum dibuat)");
      }
    } catch (err: any) {
      console.error("❌ Save error:", err);

      // 🔥 DETAIL ERROR (axios)
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong";

      const details =
        err?.response?.data?.details || err?.response?.data?.errors;

      toast.error("Failed to save material", {
        description: Array.isArray(details)
          ? details.map((d: any) => d.message || JSON.stringify(d)).join(", ")
          : message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!textId) return;

    try {
      const newStatus = status === "PUBLISHED" ? "ARCHIVED" : "PUBLISHED";

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningText/texts/${textId}`,
        { status: newStatus },
        { withCredentials: true },
      );

      setStatus(res.data.data.status);

      toast.success(
        newStatus === "PUBLISHED"
          ? "Material berhasil dipublish"
          : "Material berhasil di-archive",
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Gagal update status",
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition"
          >
            <ArrowLeft size={18} />
          </button>
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
              autoFocus
              className="text-[17px] font-semibold text-gray-800 border-b-2 border-emerald-400 outline-none bg-transparent min-w-[200px]"
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-semibold text-gray-800">
                {title}
              </span>
              <button
                onClick={() => setEditingTitle(true)}
                className="p-1.5 rounded hover:bg-emerald-50 text-emerald-500 hover:text-emerald-600 transition"
              >
                <Pencil size={17} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo"
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo"
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition disabled:opacity-30 disabled:cursor-not-allowed mr-1"
          >
            <RotateCw size={16} />
          </button>
          <span className="text-xs text-gray-400 font-medium mr-1 hidden sm:inline">
            Saved
          </span>

          {/* ── Preview button — wired to MaterialPreviewModal ──────────────── */}
          <button
            onClick={() => setOpenPreview(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-emerald-400 text-emerald-600 text-sm font-medium hover:bg-emerald-50 transition"
          >
            <Eye size={15} className="text-emerald-500" /> Preview
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-emerald-400 text-emerald-600 text-sm font-medium hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={15} className="text-emerald-500" />{" "}
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => {
              if (!textId) return;
              setOpenConfirm(true);
            }}
            disabled={!textId}
            title={!textId ? "Anda harus save terlebih dahulu" : ""}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              !textId
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
          >
            <Globe size={15} />
            {status === "PUBLISHED" ? "Archive" : "Publish"}
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <ContentElementsSidebar onAddElement={addElement} />

        {/* Center Canvas */}
        <main
          className="flex-1 overflow-y-auto bg-white"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0px, black 48px, black calc(100% - 48px), transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0px, black 48px, black calc(100% - 48px), transparent 100%)",
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setDragOverId(null)}
          onDrop={handleCanvasDrop}
          onClick={() => setSelectedInstanceId(null)}
        >
          <div className="px-6 py-6 h-full">
            {items.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-full min-h-[400px] text-center rounded-2xl border-2 border-dashed border-gray-200 transition-colors"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.add(
                    "border-emerald-400",
                    "bg-emerald-50/30",
                  );
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove(
                    "border-emerald-400",
                    "bg-emerald-50/30",
                  );
                }}
                onDrop={(e) => {
                  e.stopPropagation();
                  e.currentTarget.classList.remove(
                    "border-emerald-400",
                    "bg-emerald-50/30",
                  );
                  const elementId = e.dataTransfer.getData("elementId");
                  if (!elementId) return;
                  const el = ALL_ELEMENTS.find((x) => x.id === elementId);
                  if (el) addElement(el);
                }}
              >
                <div className="mb-6 select-none">
                  <Image
                    src="/assets/admin/elearning/materials/cuate.svg"
                    alt="Start building your material"
                    width={200}
                    height={160}
                    className="object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <h3 className="text-[17px] font-semibold text-gray-800 mb-2">
                  Start building your material
                </h3>
                <p className="text-[13px] text-gray-400 max-w-[300px] leading-relaxed">
                  Drag elements from the left sidebar and drop them here, or
                  click an element to add it.
                </p>
              </div>
            ) : (
              <div className="space-y-6 md:space-y-8 pb-10">
                {items.map((el, idx) => (
                  <div
                    key={el.instanceId}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedInstanceId(el.instanceId);

                      const ref = editorRefs.current.get(el.instanceId);
                      if (ref) {
                        activeEditorRef.current = ref;
                        activeInstanceIdRef.current = el.instanceId;
                      }
                    }}
                    className="transition-all duration-150 rounded-xl"
                  >
                    <CanvasCard
                      el={el}
                      order={idx + 1}
                      total={items.length}
                      onRemove={() => handleRemove(el.instanceId)}
                      onMoveUp={() => handleMoveUp(el.instanceId)}
                      onMoveDown={() => handleMoveDown(el.instanceId)}
                      onDuplicate={() => handleDuplicate(el.instanceId)}
                      onDragStart={(e) => handleCardDragStart(e, el.instanceId)}
                      onDragOver={(e) => handleCardDragOver(e, el.instanceId)}
                      onDrop={(e) => handleCardDrop(e, el.instanceId)}
                      isDragOver={dragOverId === el.instanceId}
                      isSelected={selectedInstanceId === el.instanceId}
                      onEditorReady={(ref) =>
                        registerEditor(el.instanceId, ref)
                      }
                      onEditorFocus={() => {
                        setSelectedInstanceId(el.instanceId);
                        const ref = editorRefs.current.get(el.instanceId);
                        if (ref) {
                          activeEditorRef.current = ref;
                          activeInstanceIdRef.current = el.instanceId;
                        }
                      }}
                      onSelectionChange={(state) => {
                        setStyleState((prev) => {
                          const isSame =
                            prev.bold === state.bold &&
                            prev.italic === state.italic &&
                            prev.underline === state.underline &&
                            prev.strikethrough === state.strikethrough &&
                            prev.align === state.align &&
                            prev.listType === state.listType &&
                            // prev.fontType === state.fontType &&
                            // prev.fontSize === state.fontSize &&
                            prev.highlight === state.highlight &&
                            prev.penColor === state.penColor;

                          if (isSame) return prev; // 🔥 penting: stop re-render loop

                          return { ...prev, ...state };
                        });
                      }}
                      onChangeData={(instanceId, data) =>
                        updateItem(instanceId, data)
                      }
                    />
                  </div>
                ))}

                {/* Bottom drop zone */}
                <div
                  className="h-14 mb-6 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-[12px] text-gray-300 transition-colors"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.add(
                      "border-emerald-400",
                      "bg-emerald-50/40",
                      "text-emerald-400",
                    );
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove(
                      "border-emerald-400",
                      "bg-emerald-50/40",
                      "text-emerald-400",
                    );
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove(
                      "border-emerald-400",
                      "bg-emerald-50/40",
                      "text-emerald-400",
                    );
                    setDragOverId(null);
                    const elementId = e.dataTransfer.getData("elementId");
                    const canvasId = e.dataTransfer.getData("canvasInstanceId");
                    if (canvasId) {
                      setItems((prev) => {
                        const from = prev.findIndex(
                          (x) => x.instanceId === canvasId,
                        );
                        if (from === -1 || from === prev.length - 1)
                          return prev;
                        const next = [...prev];
                        const [moved] = next.splice(from, 1);
                        next.push(moved);
                        pushHistory(next);
                        return next;
                      });
                    } else if (elementId) {
                      const el = ALL_ELEMENTS.find((x) => x.id === elementId);
                      if (el) addElement(el);
                    }
                  }}
                >
                  Drop here to add at the bottom
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right: Style Panel */}
        <StylePanel
          items={items}
          itemCounters={itemCounters}
          selectedInstanceId={selectedInstanceId}
          onSelectItem={(id) => {
            setSelectedInstanceId(id);
            if (id) {
              const ref = editorRefs.current.get(id);
              if (ref) {
                activeEditorRef.current = ref;
                activeInstanceIdRef.current = id;
                ref.focus();
              }
            }
          }}
          styleState={styleState}
          onStyleChange={handleStyleChange}
          onFontTypeChange={handleFontTypeChange}
          onFontSizeChange={handleFontSizeChange}
          onDuplicateItem={(id) => handleDuplicate(id)}
          onRemoveItem={(id) => handleRemove(id)}
          onDuplicateItems={(ids) => handleDuplicateMany(ids)}
        />
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <MaterialPreviewModal
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        title={title}
        items={items}
      />

      <PublishConfirmModal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={() => {
          setOpenConfirm(false);
          handleTogglePublish();
        }}
      />

      <PublishSuccessModal
        open={openSuccess}
        onClose={() => setOpenSuccess(false)}
      />
    </div>
  );
}
