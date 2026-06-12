"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  AlignLeft,
  Video,
  MessageSquare,
  List,
  Code2,
  HelpCircle,
  CheckSquare,
  LayoutList,
  Table,
  Heading,
  Upload,
  Image as ImageIcon,
  Pencil,
} from "lucide-react";
import type { ContentElement } from "@/components/admin/elearning/materials/ContentElementSidebar";
import { AccordionBody } from "./AccordionBody";
import { TabNavigationBody } from "./TabNavigationBody";
import { ContentCardBody } from "./ContentCardBody";
import { CarouselBody } from "./CarouselBody";
import { TrueFalseBody } from "./TrueFalseBody";
import { MatchingBody } from "./MatchingBody";
import { CodingBody } from "./CodingBody";
import { QuizBody } from "./QuizBody";
import { ProjectBody } from "./ProjectBody";
import RichTextEditor, { type RichTextEditorRef } from "./RichTextEditor";

// ─── Types ────────────────────────────────────────────────────────────────────
export type CanvasItem = ContentElement & {
  instanceId: string;
  data?: any;
};

// ─── IDs that get no horizontal padding in card body ─────────────────────────
const NO_SIDE_PADDING_IDS = new Set([
  "accordion",
  "tab-navigation",
  "content-card",
  "carousel",
  "true-false",
  "matching",
  "coding",
  "quiz",
  "project",
]);

const SELF_MANAGED_RICH_IDS = new Set([
  "accordion",
  "tab-navigation",
  "content-card",
  "carousel",
  "true-false",
  "matching",
  "coding",
  "quiz",
  "project",
]);

const CARD_LEVEL_RICH_IDS = new Set([
  "heading",
  "paragraph",
  "highlight",
  "summary",
]);

// ─── Icon map ─────────────────────────────────────────────────────────────────
const CANVAS_ICONS: Record<string, React.ReactNode> = {
  heading: <Heading size={13} />,
  paragraph: <AlignLeft size={13} />,
  image: <ImageIcon size={13} />,
  video: <Video size={13} />,
  accordion: <ChevronDown size={13} />,
  carousel: <LayoutList size={13} />,
  "content-card": <LayoutList size={13} />,
  "tab-navigation": <Table size={13} />,
  highlight: <MessageSquare size={13} />,
  summary: <List size={13} />,
  "true-false": <HelpCircle size={13} />,
  matching: <CheckSquare size={13} />,
  coding: <Code2 size={13} />,
  quiz: <HelpCircle size={13} />,
  project: <Upload size={13} />,
};

// ─── HeadingBody ──────────────────────────────────────────────────────────────
function HeadingBody({
  value,
  onChange,
  onEditorReady,
  onFocus,
  onSelectionChange,
}: {
  value?: string;
  onChange?: (val: string) => void;
  onEditorReady?: (ref: RichTextEditorRef | null) => void;
  onFocus?: () => void;
  onSelectionChange?: any;
}) {
  const [focused, setFocused] = useState(false);
  const [mode, setMode] = useState<"canvas" | "preview">("canvas");

  if (mode === "preview") {
    return (
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl px-3 py-2.5 bg-white group/preview">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMode("canvas");
          }}
          className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 text-[11px]"
        >
          <Pencil size={11} /> Edit
        </button>
        <div
          className="text-2xl font-bold text-gray-800"
          dangerouslySetInnerHTML={{ __html: value || "<em>—</em>" }}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed px-3 py-2.5 ${
        focused ? "border-emerald-400" : "border-gray-200"
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMode("preview");
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 text-[11px]"
      >
        <Eye size={11} /> Preview
      </button>

      <RichTextEditor
        value={value || ""}
        onChange={onChange}
        placeholder="Type your heading here ..."
        className="text-2xl font-bold text-gray-800"
        onMount={(ref) => {
          onEditorReady?.(ref);
          // Auto-focus & notify parent when editor mounts (including re-mount after preview)
          setTimeout(() => {
            ref.focus();
            onFocus?.();
          }, 0);
        }}
        onUnmount={() => {
          onEditorReady?.(null);
        }}
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => setFocused(false)}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
}

// ─── ParagraphBody ────────────────────────────────────────────────────────────
function ParagraphBody({
  value,
  onChange,
  onEditorReady,
  onFocus,
  onSelectionChange,
  isEditMode,
}: {
  value?: string;
  onChange?: (val: string) => void;
  onEditorReady?: (ref: RichTextEditorRef | null) => void;
  onFocus?: () => void;
  onSelectionChange?: any;
  isEditMode?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [mode, setMode] = useState<"canvas" | "preview">("canvas");

  if (mode === "preview") {
    return (
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl px-3 py-2.5 bg-white group/preview">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMode("canvas");
          }}
          className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 text-[11px]"
        >
          <Pencil size={11} /> Edit
        </button>
        <div
          className="text-sm text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: value || "<em>—</em>" }}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed px-3 py-2.5 ${
        focused ? "border-emerald-400" : "border-gray-200"
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMode("preview");
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 text-[11px]"
      >
        <Eye size={11} /> Preview
      </button>

      <RichTextEditor
        value={value || ""}
        onChange={onChange}
        placeholder="Enter paragraph text ..."
        className="text-sm text-gray-700 min-h-[3em]"
        onMount={(ref) => {
          onEditorReady?.(ref);
          setTimeout(() => {
            ref.focus();
            onFocus?.();
          }, 0);
        }}
        onUnmount={() => {
          onEditorReady?.(null);
        }}
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => setFocused(false)}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
}

function normalizeMediaUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("drive.google.com")) {
      const match = url.match(/\/d\/(.*?)\//);
      const fileId = match?.[1];
      if (fileId) {
        return {
          image: `https://drive.google.com/uc?export=view&id=${fileId}`,
          video: `https://drive.google.com/file/d/${fileId}/preview`,
        };
      }
    }
    return { image: url, video: url };
  } catch {
    return { image: url, video: url };
  }
}

// ─── ImageBody ───────────────────────────────────────────────────────────────
function ImageBody({
  value,
  onChangeData,
}: {
  value?: string | null;
  onChangeData?: (data: any) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(value ?? null);
  const [inputUrl, setInputUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const setAndSave = (url: string | null) => {
    setImageUrl(url);
    onChangeData?.({ src: url ?? undefined });
  };

  const handleClickArea = () => {
    if (!imageUrl) fileInputRef.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed!");
      return;
    }
    const blobUrl = URL.createObjectURL(file);
    setImageUrl(blobUrl);
    onChangeData?.({ src: blobUrl, _file: file });
  };
  const handleAddUrl = () => {
    if (!inputUrl) return;
    setAndSave(normalizeMediaUrl(inputUrl).image);
  };

  return (
    <div
      className={`rounded-lg transition-all ${imageUrl ? "border-2 border-emerald-400 p-2" : `border-2 border-dashed px-6 py-8 cursor-pointer ${focused ? "border-emerald-400" : "border-gray-200"}`}`}
      tabIndex={0}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onClick={handleClickArea}
    >
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        onClick={(e) => e.stopPropagation()}
      />
      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt="preview"
            className="w-full max-h-[300px] object-contain rounded-md"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAndSave(null);
              setInputUrl("");
            }}
            className="absolute top-2 right-2 p-2 rounded-md bg-white shadow hover:bg-red-50 transition"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 text-gray-300">
            <Upload size={48} />
          </div>
          <p className="text-lg text-gray-700 font-medium">
            Upload an image, add a URL, or drag and drop here
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Supported formats: JPG, PNG, SVG
          </p>
          <div
            className="flex items-center gap-3 mt-6 w-full max-w-[460px]"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Add image URL"
              className="flex-1 text-base px-4 py-3 rounded-md border border-gray-200 outline-none focus:border-emerald-400 transition"
            />
            <button
              onClick={handleAddUrl}
              className="px-5 py-3 text-sm font-semibold rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition"
            >
              Add Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── VideoBody ───────────────────────────────────────────────────────────────
function VideoBody({
  value,
  onChangeData,
}: {
  value?: string | null;
  onChangeData?: (data: any) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(value ?? null);
  const [inputUrl, setInputUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const setAndSave = (url: string | null) => {
    setVideoUrl(url);
    onChangeData?.({ src: url ?? undefined });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      alert("Only video files are allowed!");
      return;
    }
    const blobUrl = URL.createObjectURL(file);
    setVideoUrl(blobUrl);
    onChangeData?.({ src: blobUrl, _file: file });
  };
  const handleAddUrl = () => {
    if (!inputUrl) return;
    setAndSave(normalizeMediaUrl(inputUrl).video);
  };
  const convertToEmbedUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("youtube.com"))
        return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
      if (parsed.hostname.includes("youtu.be"))
        return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
      return url;
    } catch {
      return url;
    }
  };

  return (
    <div
      className={`rounded-lg transition-all ${videoUrl ? "border-2 border-emerald-400 p-2" : `border-2 border-dashed px-6 py-10 cursor-pointer ${focused ? "border-emerald-400" : "border-gray-200"}`}`}
      tabIndex={0}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onClick={() => {
        if (!videoUrl) fileInputRef.current?.click();
      }}
    >
      <input
        type="file"
        accept="video/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        onClick={(e) => e.stopPropagation()}
      />
      {videoUrl ? (
        <div className="relative">
          {videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? (
            <iframe
              src={convertToEmbedUrl(videoUrl)}
              className="w-full h-[320px] rounded-md"
              allowFullScreen
            />
          ) : (
            <video
              src={videoUrl}
              controls
              className="w-full max-h-[320px] rounded-md"
            />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAndSave(null);
              setInputUrl("");
            }}
            className="absolute top-2 right-2 p-2 rounded-md bg-white shadow hover:bg-red-50 transition"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 text-gray-300">
            <Upload size={42} />
          </div>
          <p className="text-base text-gray-600 font-medium">
            Upload a video, add a URL, or drag and drop here
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Supports MP4 or video links (YouTube)
          </p>
          <div
            className="flex items-center gap-3 mt-5 w-full max-w-[420px]"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Add Video URL"
              className="flex-1 text-sm px-4 py-2.5 rounded-md border border-gray-200 outline-none focus:border-emerald-400 transition"
            />
            <button
              onClick={handleAddUrl}
              className="px-4 py-2.5 text-sm font-semibold rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition"
            >
              Add Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HighlightBody ────────────────────────────────────────────────────────────
function HighlightBody({
  value,
  onChange,
  onEditorReady,
  onFocus,
  onSelectionChange,
}: {
  value?: string;
  onChange?: (val: string) => void;
  onEditorReady?: (ref: RichTextEditorRef | null) => void;
  onFocus?: () => void;
  onSelectionChange?: any;
}) {
  const [mode, setMode] = useState<"canvas" | "preview">("canvas");
  const [focused, setFocused] = useState(false);

  if (mode === "preview") {
    return (
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 bg-gray-100 group/preview">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMode("canvas");
          }}
          title="Edit highlight"
          className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
        >
          <Pencil size={11} /> Edit
        </button>
        <div
          className="text-sm text-gray-600 leading-relaxed italic min-h-[1em]"
          dangerouslySetInnerHTML={{ __html: value || "<em>—</em>" }}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-xl border-2 border-dashed transition-colors px-4 py-3 ${
        focused ? "border-emerald-400" : "border-gray-300"
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMode("preview");
        }}
        title="Preview highlight"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Eye size={11} /> Preview
      </button>

      <RichTextEditor
        value={value || ""}
        onChange={onChange}
        placeholder="Add important note here ..."
        className="text-sm text-gray-700 min-h-[3em]"
        onMount={(ref) => {
          onEditorReady?.(ref);
          setTimeout(() => {
            ref.focus();
            onFocus?.();
          }, 0);
        }}
        onUnmount={() => {
          onEditorReady?.(null);
        }}
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => setFocused(false)}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
}

// ─── FallbackBody ─────────────────────────────────────────────────────────────
function FallbackBody({ description }: { description: string }) {
  return <p className="text-sm text-gray-400 italic">{description}</p>;
}

// ─── SummaryBody ──────────────────────────────────────────────────────────────
function SummaryBody({
  value,
  onChange,
  onEditorReady,
  onFocus,
  onSelectionChange,
}: {
  value?: string;
  onChange?: (val: string) => void;
  onEditorReady?: (ref: RichTextEditorRef | null) => void;
  onFocus?: () => void;
  onSelectionChange?: any;
}) {
  const [mode, setMode] = useState<"canvas" | "preview">("canvas");
  const [focused, setFocused] = useState(false);

  if (mode === "preview") {
    return (
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl px-5 py-4 bg-white group/preview">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMode("canvas");
          }}
          title="Edit summary"
          className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
        >
          <Pencil size={11} /> Edit
        </button>
        <p className="text-xl font-bold text-emerald-500 mb-2">Ringkasan</p>
        <div
          className="text-sm text-gray-700 leading-relaxed min-h-[1em]"
          dangerouslySetInnerHTML={{ __html: value || "<em>—</em>" }}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-xl border-2 border-dashed transition-colors px-4 py-3 ${
        focused ? "border-emerald-400" : "border-gray-300"
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMode("preview");
        }}
        title="Preview summary"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Eye size={11} /> Preview
      </button>

      <p className="text-xl font-bold text-emerald-500 mb-2 select-none">
        Ringkasan
      </p>

      <RichTextEditor
        value={value || ""}
        onChange={onChange}
        placeholder="Tulis ringkasan di sini ..."
        className="text-sm text-gray-700 min-h-[4em]"
        onMount={(ref) => {
          onEditorReady?.(ref);
          setTimeout(() => {
            ref.focus();
            onFocus?.();
          }, 0);
        }}
        onUnmount={() => {
          onEditorReady?.(null);
        }}
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => setFocused(false)}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
}

// ─── CardBody dispatcher ──────────────────────────────────────────────────────
function CardBody({
  el,
  onEditorReady,
  onEditorFocus,
  onSelfManagedEditorFocus,
  onSelectionChange,
  onChangeData,
}: {
  el: CanvasItem;
  onEditorReady?: (ref: RichTextEditorRef | null) => void;
  onEditorFocus?: () => void;
  onSelfManagedEditorFocus?: (ref: RichTextEditorRef) => void;
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
  onChangeData?: (data: any) => void;
}) {
  switch (el.id) {
    case "heading":
      return (
        <HeadingBody
          value={el.data?.value}
          onChange={(val) => onChangeData?.({ ...el.data, value: val })}
          onEditorReady={onEditorReady}
          onFocus={onEditorFocus}
          onSelectionChange={onSelectionChange}
        />
      );
    case "paragraph":
      return (
        <ParagraphBody
          value={el.data?.value}
          onChange={(val) => onChangeData?.({ ...el.data, value: val })}
          onEditorReady={onEditorReady}
          onFocus={onEditorFocus}
          onSelectionChange={onSelectionChange}
        />
      );
    case "image":
      return <ImageBody value={el.data?.src} onChangeData={onChangeData} />;
    case "video":
      return <VideoBody value={el.data?.src} onChangeData={onChangeData} />;
    case "accordion":
      return (
        <AccordionBody
          initialData={el.data}
          onChangeData={onChangeData}
          onEditorFocus={onSelfManagedEditorFocus}
          onSelectionChange={onSelectionChange}
        />
      );
    case "tab-navigation":
      return (
        <TabNavigationBody
          initialData={el.data}
          onChangeData={onChangeData}
          onEditorFocus={onSelfManagedEditorFocus}
          onSelectionChange={onSelectionChange}
        />
      );
    case "content-card":
      return (
        <ContentCardBody
          initialData={el.data}
          onChangeData={onChangeData}
          onEditorFocus={onSelfManagedEditorFocus}
          onSelectionChange={onSelectionChange}
        />
      );
    case "carousel":
      return (
        <CarouselBody
          initialData={el.data}
          onChangeData={onChangeData}
          onEditorFocus={onSelfManagedEditorFocus}
          onSelectionChange={onSelectionChange}
        />
      );
    case "highlight":
      return (
        <HighlightBody
          value={el.data?.value}
          onChange={(val) => onChangeData?.({ ...el.data, value: val })}
          onEditorReady={onEditorReady}
          onFocus={onEditorFocus}
          onSelectionChange={onSelectionChange}
        />
      );
    case "summary":
      return (
        <SummaryBody
          value={el.data?.value}
          onChange={(val) => onChangeData?.({ ...el.data, value: val })}
          onEditorReady={onEditorReady}
          onFocus={onEditorFocus}
          onSelectionChange={onSelectionChange}
        />
      );
    case "coding":
      return (
        <CodingBody
          initialData={el.data}
          onChangeData={onChangeData}
          onEditorFocus={onSelfManagedEditorFocus}
          onSelectionChange={onSelectionChange}
        />
      );
    case "true-false":
      return (
        <TrueFalseBody
          initialData={el.data}
          onChangeData={onChangeData}
          onEditorFocus={onSelfManagedEditorFocus}
          onSelectionChange={onSelectionChange}
        />
      );
    case "matching":
      return (
        <MatchingBody
          initialData={el.data}
          onChangeData={onChangeData}
          onEditorFocus={onSelfManagedEditorFocus}
          onSelectionChange={onSelectionChange}
        />
      );
    case "quiz":
      return <QuizBody initialData={el.data} onChangeData={onChangeData} />;
    case "project":
      return <ProjectBody initialData={el.data} onChangeData={onChangeData} />;
    default:
      return <FallbackBody description={el.description} />;
  }
}

// ─── Toolbar icon button ──────────────────────────────────────────────────────
function ToolbarBtn({
  children,
  onClick,
  danger = false,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-1 rounded transition-colors ${danger ? "text-gray-400 hover:text-red-500 hover:bg-red-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
    >
      {children}
    </button>
  );
}

// ─── Main CanvasCard ──────────────────────────────────────────────────────────
export default function CanvasCard({
  el,
  order,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
  isSelected,
  onEditorReady,
  onEditorFocus,
  onSelectionChange,
  onChangeData,
}: {
  el: CanvasItem;
  order: number;
  total: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: (item: CanvasItem) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragOver: boolean;
  isSelected?: boolean;
  onEditorReady?: (ref: RichTextEditorRef | null) => void;
  onEditorFocus?: () => void;
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
  onChangeData?: (instanceId: string, data: any) => void;
}) {
  const [isHidden, setIsHidden] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const noPadding = NO_SIDE_PADDING_IDS.has(el.id);
  const isSelfManaged = SELF_MANAGED_RICH_IDS.has(el.id);

  // For self-managed components (accordion etc.), forward focused sub-field ref up
  const handleSelfManagedEditorFocus = useCallback(
    (ref: RichTextEditorRef) => {
      onEditorReady?.(ref);
      onEditorFocus?.();
    },
    [onEditorReady, onEditorFocus],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e);
      }}
      onDrop={(e) => {
        e.stopPropagation();
        onDrop(e);
      }}
      className={`group relative bg-white rounded-xl transition-all duration-150 border border-transparent outline-none ${
        isDragOver ? "shadow-md scale-[1.01]" : ""
      } ${isHidden ? "opacity-40" : ""}`}
    >
      {/* ── Order badge ─────────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] font-semibold text-gray-400 tabular-nums shadow-sm select-none">
          {order} / {total}
        </span>
      </div>

      {/* ── Card header bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-300">
        <div className="flex items-center gap-2">
          <div
            draggable={!isLocked}
            onDragStart={(e) => {
              if (isLocked) return;
              e.stopPropagation();
              onDragStart(e);
            }}
            className="opacity-0 group-hover:opacity-40 cursor-grab active:cursor-grabbing transition shrink-0"
          >
            <GripVertical size={14} className="text-gray-400" />
          </div>
          <span className="text-gray-500 flex items-center mb-0.5">
            {CANVAS_ICONS[el.id] ?? CANVAS_ICONS["paragraph"]}
          </span>
          <span className="text-[13px] font-semibold text-gray-800 tracking-wide">
            {el.label}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <ToolbarBtn title="Move up" onClick={onMoveUp}>
            <ChevronUp size={14} />
          </ToolbarBtn>
          <ToolbarBtn title="Move down" onClick={onMoveDown}>
            <ChevronDown size={14} />
          </ToolbarBtn>
          <ToolbarBtn title="Duplicate" onClick={() => onDuplicate(el)}>
            <Copy size={13} />
          </ToolbarBtn>
          <ToolbarBtn title="Delete" danger onClick={onRemove}>
            <Trash2 size={13} />
          </ToolbarBtn>
          <ToolbarBtn
            title={isHidden ? "Show" : "Hide"}
            onClick={() => setIsHidden((prev) => !prev)}
          >
            {isHidden ? <EyeOff size={13} /> : <Eye size={13} />}
          </ToolbarBtn>
          <ToolbarBtn
            title={isLocked ? "Unlock" : "Lock"}
            onClick={() => setIsLocked((prev) => !prev)}
          >
            {isLocked ? <Unlock size={13} /> : <Lock size={13} />}
          </ToolbarBtn>
        </div>
      </div>

      {/* ── Card body ───────────────────────────────────────────────────────── */}
      <div
        className={noPadding ? "py-2" : "px-4 py-3"}
        style={{
          pointerEvents: isLocked ? "none" : "auto",
          userSelect: isLocked ? "none" : "auto",
          opacity: isLocked ? 0.7 : 1,
        }}
      >
        <CardBody
          el={el}
          onEditorReady={!isSelfManaged ? onEditorReady : undefined}
          onEditorFocus={!isSelfManaged ? onEditorFocus : undefined}
          onSelfManagedEditorFocus={
            isSelfManaged ? handleSelfManagedEditorFocus : undefined
          }
          onSelectionChange={onSelectionChange}
          onChangeData={(data) => onChangeData?.(el.instanceId, data)}
        />
      </div>
    </div>
  );
}
