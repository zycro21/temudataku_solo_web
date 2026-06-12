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

  const blockItems: CanvasItem[] = (material.blocks ?? []).flatMap(
    (block: any) => {
      // ── restore contents ──────────────────────────────────────────────────
      const contentItems = (block.contents ?? []).map((content: any) => {
        const canvasId = TYPE_MAP[content.type] ?? content.type;
        let data: any = undefined;

        switch (content.type) {
          case "heading":
          case "paragraph":
          case "highlight":
            data = { value: markdownToHTML(content.text ?? "") };
            break;

          case "summary":
            data = {
              value: Array.isArray(content.comments)
                ? content.comments
                    .map((c: string) => `<p>${markdownToHTML(c)}</p>`)
                    .join("")
                : markdownToHTML(content.text ?? ""),
            };
            break;

          case "accordion":
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
            data = {
              question: markdownToHTML(
                content.question ?? content.content?.question ?? "",
              ),
              description: markdownToHTML(
                content.description ?? content.content?.description ?? "",
              ),
              questions: (() => {
                if (content.questions ?? content.content?.questions) {
                  return (content.questions ?? content.content?.questions).map(
                    (q: any) => ({
                      id: q.id ?? `tf-${Math.random()}`,
                      statement: markdownToHTML(q.statement ?? ""),
                      answer: q.answer ?? null,
                    }),
                  );
                }
                const options = content.options ??
                  content.content?.options ?? [
                    { id: "true", text: "True" },
                    { id: "false", text: "False" },
                  ];
                const correctAnswers =
                  content.correctAnswers ??
                  content.content?.correctAnswers ??
                  [];
                return options.map((opt: any, i: number) => ({
                  id: opt.id ?? `tf-${i}`,
                  statement: markdownToHTML(opt.text ?? ""),
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
              title: markdownToHTML(
                content.title ?? content.content?.title ?? "",
              ),
              description: markdownToHTML(
                content.description ?? content.content?.description ?? "",
              ),
              language:
                content.language ?? content.content?.language ?? "python",
              question:
                content.initialCode ?? content.content?.initialCode ?? "",
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
          label:
            ALL_ELEMENTS.find((el) => el.id === canvasId)?.label ?? canvasId,
          description:
            ALL_ELEMENTS.find((el) => el.id === canvasId)?.description ?? "",
          data,
        };
      });

      // ── restore additionalContents dari DB ───────────────────────────────
      const additionalItems: CanvasItem[] = (block.additionalContents ?? [])
        .map((ac: any) => {
          let item: CanvasItem | null = null;

          if (ac.type === "image_video") {
            const mediaType = ac.content?.mediaType ?? "IMAGE";
            const canvasId = mediaType === "VIDEO" ? "video" : "image";
            const rawUrl: string | null = ac.content?.url ?? null;
            const resolvedUrl =
              rawUrl && rawUrl.startsWith("/")
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${rawUrl}`
                : rawUrl;
            item = {
              id: canvasId,
              instanceId: crypto.randomUUID(),
              label: mediaType === "VIDEO" ? "Video" : "Image",
              description:
                ALL_ELEMENTS.find((el) => el.id === canvasId)?.description ??
                "",
              data: { src: resolvedUrl },
            } as CanvasItem;
          } else if (ac.type === "matching") {
            const c = ac.content ?? {};
            // items dari DB: { content, side, orderNumber, matchWithId }
            const leftItems = (c.items ?? [])
              .filter((i: any) => i.side === "LEFT")
              .map((i: any, idx: number) => ({
                id: i.id ?? `left-${idx}`,
                text: markdownToHTML(i.content ?? ""),
              }));
            const rightItems = (c.items ?? [])
              .filter((i: any) => i.side === "RIGHT")
              .map((i: any, idx: number) => ({
                id: i.id ?? `right-${idx}`,
                text: markdownToHTML(i.content ?? ""),
              }));
            // matchWithId di LEFT item = id RIGHT item (temp string dari DB)
            const leftRaw = (c.items ?? []).filter(
              (i: any) => i.side === "LEFT",
            );
            const rightRaw = (c.items ?? []).filter(
              (i: any) => i.side === "RIGHT",
            );
            const correctPairs = leftRaw
              .filter((l: any) => l.matchWithId)
              .map((l: any, idx: number) => ({
                leftId: leftItems[idx]?.id ?? `left-${idx}`,
                rightId: l.matchWithId,
              }));
            item = {
              id: "matching",
              instanceId: crypto.randomUUID(),
              label: "Matching",
              description:
                ALL_ELEMENTS.find((el) => el.id === "matching")?.description ??
                "",
              data: {
                question: markdownToHTML(c.title ?? ""),
                description: markdownToHTML(c.instruction ?? ""),
                leftItems,
                rightItems,
                correctPairs,
                explanation: markdownToHTML(c.explanation ?? ""),
              },
            } as CanvasItem;
          } else if (ac.type === "interactive_code") {
            const c = ac.content ?? {};
            item = {
              id: "coding",
              instanceId: crypto.randomUUID(),
              label: "Coding",
              description:
                ALL_ELEMENTS.find((el) => el.id === "coding")?.description ??
                "",
              data: {
                title: markdownToHTML(c.title ?? ""),
                description: markdownToHTML(c.description ?? ""),
                language: (c.language ?? "PYTHON").toLowerCase(),
                question: c.initialCode ?? "",
                expectedOutput: c.expectedResult ?? "",
              },
            } as CanvasItem;
          } else if (ac.type === "multiple_choice") {
            const c = ac.content ?? {};
            item = {
              id: "true-false",
              instanceId: crypto.randomUUID(),
              label: "True / False",
              description:
                ALL_ELEMENTS.find((el) => el.id === "true-false")
                  ?.description ?? "",
              data: {
                question: markdownToHTML(c.question ?? ""),
                description: markdownToHTML(c.description ?? ""),
                explanation: markdownToHTML(c.explanation ?? ""),
                questions: (c.options ?? []).map((opt: any, i: number) => ({
                  id: opt.id ?? `tf-${i}`,
                  statement: markdownToHTML(opt.content ?? ""),
                  answer: opt.isCorrect ? "true" : "false",
                })),
              },
            } as CanvasItem;
          }

          if (!item) return null;
          // Bawa orderNumber dari DB supaya bisa di-sort bersama contentItems
          return { ...item, _orderNumber: ac.orderNumber ?? 9999 };
        })
        .filter(Boolean) as (CanvasItem & { _orderNumber: number })[];

      // ── Gabung contents + additionalContents, sort by orderNumber global ──
      const contentItemsWithOrder = contentItems.map(
        (ci: CanvasItem, idx: number) => ({
          ...ci,
          _orderNumber: (block.contents ?? [])[idx]?.orderNumber ?? idx + 1,
        }),
      );

      const merged = [...contentItemsWithOrder, ...additionalItems].sort(
        (a, b) => (a as any)._orderNumber - (b as any)._orderNumber,
      );

      // Bersihkan field internal sebelum dikembalikan
      return merged.map(({ _orderNumber, ...rest }: any) => rest);
    },
  );

  // ── Restore quiz dari subBab.quiz ─────────────────────────────────────────
  const quizItems: CanvasItem[] = [];
  const backendQuiz = material.subBab?.quiz;
  if (backendQuiz) {
    quizItems.push({
      id: "quiz",
      instanceId: crypto.randomUUID(),
      label: "Quiz",
      description: "Enables learners to practice coding directly.",
      iconSrc: "/assets/admin/elearning/materials/quiz.svg", // ← tambah ini
      category: "assesment", // ← tambah ini
      data: {
        title: backendQuiz.title ?? "",
        description: backendQuiz.description ?? "",
        questions: (backendQuiz.questions ?? []).map((q: any) => {
          const options = (q.options ?? []).map(
            (optText: string, i: number) => ({
              id: `opt-${q.id}-${i}`,
              text: optText,
              value: (q.correctAnswers ?? []).includes(optText)
                ? "true"
                : "false",
            }),
          );
          return {
            id: q.id ?? `q-${Math.random()}`,
            questionText: q.questionText ?? "",
            questionType:
              options.filter((o: any) => o.value === "true").length > 1
                ? "multiple"
                : "single",
            options,
          };
        }),
      },
    });
  }

  // ── Restore assignment dari subBab.assignment ─────────────────────────────
  const assignmentItems: CanvasItem[] = [];
  const backendAssignment = material.subBab?.assignment;
  if (backendAssignment) {
    const descPart = backendAssignment.description ?? "";
    const instrPart = (backendAssignment.instructions ?? [])
      .map((instr: any, idx: number) => `${idx + 1}. ${instr.instruction}`)
      .join("\n");
    const question = [descPart, instrPart].filter(Boolean).join("\n");

    assignmentItems.push({
      id: "project",
      instanceId: crypto.randomUUID(),
      label: "Project",
      description: "Enables learners to practice coding directly.",
      iconSrc: "/assets/admin/elearning/materials/project.svg", // ← tambah ini
      category: "assesment", // ← tambah ini
      data: {
        question,
        attachments: (backendAssignment.supportingFiles ?? []).map((f: any) => {
          const rawUrl: string = f.url ?? "";
          const resolvedUrl =
            rawUrl && rawUrl.startsWith("/")
              ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${rawUrl}`
              : rawUrl;
          return {
            id: f.id ?? `att-${Math.random()}`,
            name: f.name ?? "file",
            url: resolvedUrl,
            format: (f.format ?? "FILE").replace(".", "").toUpperCase(),
          };
        }),
        deadlineDate: "",
        deadlineTime: "",
      },
    });
  }

  return [...blockItems, ...quizItems, ...assignmentItems];
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

          // Restore canvas items dari data backend (blocks + quiz + assignment)
          const mappedItems = mapMaterialToCanvasItems(data);
          if (mappedItems.length > 0) {
            setItems(mappedItems);
            setHistory([mappedItems]);
            setHistoryIdx(0);
          }
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

  // ── Mapper: CanvasItem[] → BlockInput[] (format yang diterima backend) ────
  const buildBlocksPayload = (canvasItems: CanvasItem[]) => {
    const contents: any[] = [];
    const additionalContents: any[] = [];
    const mediaFilesToUpload: File[] = [];
    // Satu counter global untuk contents DAN additionalContents
    // supaya urutan canvas (heading→paragraph→image→accordion) tersimpan dengan benar
    let globalOrder = 1;

    for (const item of canvasItems) {
      const d = item.data ?? {};

      switch (item.id) {
        case "heading":
          contents.push({
            type: "heading",
            level: 1,
            text: htmlToMarkdown(d.value ?? ""),
            orderNumber: globalOrder++,
          });
          break;

        case "paragraph":
          contents.push({
            type: "paragraph",
            text: htmlToMarkdown(d.value ?? ""),
            orderNumber: globalOrder++,
          });
          break;

        case "highlight":
          contents.push({
            type: "highlight",
            text: htmlToMarkdown(d.value ?? "").slice(0, 120),
            orderNumber: globalOrder++,
          });
          break;

        case "summary":
          contents.push({
            type: "summary",
            orderNumber: globalOrder++,
            comments: htmlToMarkdown(d.value ?? "")
              .split("\n")
              .map((s: string) => s.trim())
              .filter(Boolean),
          });
          break;

        case "accordion":
          contents.push({
            type: "accordion",
            title: d.titleHTML ?? "",
            description: htmlToMarkdown(d.descriptionHTML ?? ""),
            orderNumber: globalOrder++,
            items: (d.panels ?? []).map((p: any, i: number) => ({
              title: htmlToMarkdown(p.titleHTML ?? ""),
              content: htmlToMarkdown(p.contentHTML ?? ""),
              orderNumber: i + 1,
            })),
          });
          break;

        case "carousel":
          contents.push({
            type: "carousel",
            title: d.title ?? "",
            description: htmlToMarkdown(d.description ?? ""),
            cardsPerSlide: d.cardsPerSlide ?? 3,
            orderNumber: globalOrder++,
            items: (d.items ?? []).map((it: any, i: number) => ({
              title: htmlToMarkdown(it.title ?? it.label ?? ""),
              image: it.image ?? undefined,
              content: htmlToMarkdown(it.content ?? ""),
              orderNumber: i + 1,
            })),
          });
          break;

        case "content-card":
          contents.push({
            type: "content_card",
            title: d.title ?? "",
            description: htmlToMarkdown(d.description ?? ""),
            disableExpandableContent: d.disableExpandable ?? false,
            orderNumber: globalOrder++,
            items: (d.cards ?? []).map((c: any, i: number) => ({
              title: htmlToMarkdown(c.title ?? ""),
              content: htmlToMarkdown(c.content ?? ""),
              expandableContent: c.expandedContent
                ? htmlToMarkdown(c.expandedContent)
                : undefined,
              orderNumber: i + 1,
            })),
          });
          break;

        case "tab-navigation":
          contents.push({
            type: "tab_navigation",
            title: d.title ?? "",
            description: htmlToMarkdown(d.description ?? ""),
            orderNumber: globalOrder++,
            tabs: (d.tabs ?? []).map((t: any, i: number) => ({
              title: htmlToMarkdown(t.title ?? ""),
              content: htmlToMarkdown(t.content ?? ""),
              orderNumber: i + 1,
            })),
          });
          break;

        case "image": {
          const src = d.src ?? "";
          const isBlob = src.startsWith("blob:");
          const file: File | null = d._file ?? null;
          if (isBlob && file) {
            mediaFilesToUpload.push(file);
            additionalContents.push({
              type: "image_video",
              position: "AFTER",
              orderNumber: globalOrder++,
              isNewUpload: true,
              content: { mediaType: "IMAGE" },
            });
          } else if (src && !isBlob) {
            additionalContents.push({
              type: "image_video",
              position: "AFTER",
              orderNumber: globalOrder++,
              isNewUpload: false,
              content: { url: src, mediaType: "IMAGE" },
            });
          }
          break;
        }

        case "video": {
          const src = d.src ?? "";
          const isBlob = src.startsWith("blob:");
          const file: File | null = d._file ?? null;
          if (isBlob && file) {
            mediaFilesToUpload.push(file);
            additionalContents.push({
              type: "image_video",
              position: "AFTER",
              orderNumber: globalOrder++,
              isNewUpload: true,
              content: { mediaType: "VIDEO" },
            });
          } else if (src && !isBlob) {
            additionalContents.push({
              type: "image_video",
              position: "AFTER",
              orderNumber: globalOrder++,
              isNewUpload: false,
              content: { url: src, mediaType: "VIDEO" },
            });
          }
          break;
        }

        case "coding":
          additionalContents.push({
            type: "interactive_code",
            position: "AFTER",
            orderNumber: globalOrder++,
            content: {
              title: htmlToMarkdown(d.title ?? ""),
              description: htmlToMarkdown(d.description ?? ""),
              language: (d.language ?? "python").toUpperCase() as
                | "PYTHON"
                | "JAVASCRIPT"
                | "CPP"
                | "SQL"
                | "R",
              initialCode: d.question ?? "",
              isEditable: true,
              expectedResult: d.expectedOutput ?? "",
            },
          });
          break;

        case "matching":
          additionalContents.push({
            type: "matching",
            position: "AFTER",
            orderNumber: globalOrder++,
            content: {
              title: htmlToMarkdown(d.question ?? ""),
              instruction: htmlToMarkdown(d.description ?? ""),
              explanation: htmlToMarkdown(d.explanation ?? ""),
              items: [
                ...(d.leftItems ?? []).map((it: any, i: number) => ({
                  content: htmlToMarkdown(it.text ?? ""),
                  side: "LEFT" as const,
                  orderNumber: i + 1,
                  matchWithId:
                    (d.correctPairs ?? []).find((p: any) => p.leftId === it.id)
                      ?.rightId ?? undefined,
                })),
                ...(d.rightItems ?? []).map((it: any, i: number) => ({
                  content: htmlToMarkdown(it.text ?? ""),
                  side: "RIGHT" as const,
                  orderNumber: i + 1,
                  matchWithId: it.id,
                })),
              ],
            },
          });
          break;

        case "true-false":
          additionalContents.push({
            type: "multiple_choice",
            position: "AFTER",
            orderNumber: globalOrder++,
            content: {
              question: htmlToMarkdown(d.question ?? ""),
              description: htmlToMarkdown(d.description ?? ""),
              allowMultiple: false,
              explanation: htmlToMarkdown(d.explanation ?? ""),
              options: (d.questions ?? []).map((q: any, i: number) => ({
                content: htmlToMarkdown(q.statement ?? ""),
                isCorrect: q.answer === "true",
                orderNumber: i + 1,
              })),
            },
          });
          break;

        default:
          break;
      }
    }

    // Semua canvas items dimasukkan ke 1 block dengan orderNumber 1
    return {
      blocks: [
        {
          orderNumber: 1,
          contents,
          additionalContents,
        },
      ],
      mediaFilesToUpload,
    };
  };

  // ── Mapper: quiz CanvasItem → QuizInput ──────────────────────────────────
  const buildQuizPayload = (quizItem: CanvasItem) => {
    const d = quizItem.data ?? {};
    const questions: any[] = d.questions ?? [];

    return {
      title: d.title || "Quiz",
      description: d.description || undefined,
      timeLimitMinutes: undefined,
      questions: questions.map((q: any, idx: number) => {
        const options: string[] = (q.options ?? []).map(
          (o: any) => o.text ?? "",
        );
        const correctAnswers: string[] = (q.options ?? [])
          .filter((o: any) => o.value === "true")
          .map((o: any) => o.text ?? "");
        return {
          questionText: q.questionText ?? "",
          options,
          correctAnswers,
          explanation: undefined,
          orderNumber: idx + 1,
        };
      }),
    };
  };

  // ── Mapper: project CanvasItem → AssignmentInput + File[] ────────────────
  // Returns { assignment: AssignmentInput, supportingFilesToUpload: File[] }
  const buildAssignmentPayload = (projectItem: CanvasItem) => {
    const d = projectItem.data ?? {};
    const attachments: any[] = d.attachments ?? [];

    // Parse instruksi dari field question (baris bernomor jadi instructions)
    const rawLines: string[] = (d.question ?? "")
      .split("\n")
      .map((l: string) => l.trim())
      .filter(Boolean);

    const isInstructionLine = (line: string) => /^(\d+\.|[-•*])/.test(line);
    const descLines = rawLines.filter((l) => !isInstructionLine(l));
    const instrLines = rawLines.filter((l) => isInstructionLine(l));
    const cleanInstruction = (line: string) =>
      line.replace(/^(\d+\.|[-•*])\s*/, "").trim();

    // Description = semua non-instruction lines
    const description = descLines.join(" ") || undefined;

    // Instructions = numbered lines
    const instructions = instrLines.map((line, idx) => ({
      instruction: cleanInstruction(line),
      orderNumber: idx + 1,
    }));

    // Supporting files — deteksi blob URL → isNewUpload: true, kirim File binary
    const supportingFilesToUpload: File[] = [];
    const supportingFiles = attachments.map((att: any) => {
      const isBlob = att.url?.startsWith("blob:");
      if (isBlob && att._file) {
        supportingFilesToUpload.push(att._file);
        return {
          name: att.name ?? "file",
          type: "DATASET" as const,
          isNewUpload: true,
          format: att.format ?? undefined,
          sizeKB: undefined,
          pageCount: undefined,
        };
      } else {
        return {
          name: att.name ?? "file",
          type: "DATASET" as const,
          isNewUpload: false,
          url: att.url ?? "",
          format: att.format ?? undefined,
          sizeKB: undefined,
          pageCount: undefined,
        };
      }
    });

    const assignment = {
      title: d.title || "Project",
      description,
      dueDays: undefined as number | undefined,
      instructions,
      supportingFiles,
    };

    return { assignment, supportingFilesToUpload };
  };

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
        // 🔥 UPDATE — kirim blocks + quiz/assignment ke backend
        const nonAssesmentItems = items.filter(
          (item) => item.id !== "quiz" && item.id !== "project",
        );
        const { blocks, mediaFilesToUpload } =
          buildBlocksPayload(nonAssesmentItems);

        // Cari quiz dan project item (max 1 masing-masing)
        const quizItem = items.find((item) => item.id === "quiz");
        const projectItem = items.find((item) => item.id === "project");

        // Gunakan FormData agar bisa kirim file
        const formData = new FormData();
        formData.append("title", title);
        formData.append("status", status);
        formData.append("blocks", JSON.stringify(blocks));

        // Append media files (image/video upload baru)
        for (const file of mediaFilesToUpload) {
          formData.append("mediaFiles", file);
        }

        if (quizItem) {
          const quiz = buildQuizPayload(quizItem);
          formData.append("quiz", JSON.stringify(quiz));
        }

        if (projectItem) {
          const { assignment, supportingFilesToUpload } =
            buildAssignmentPayload(projectItem);
          formData.append("assignment", JSON.stringify(assignment));
          for (const file of supportingFilesToUpload) {
            formData.append("supportingFiles", file);
          }
        }

        const res = await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningText/texts/${textId}`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        const data = res.data;
        setStatus(data.data.status ?? status);

        toast.success("Material berhasil disimpan");
        console.log("✅ Update success:", data);
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
