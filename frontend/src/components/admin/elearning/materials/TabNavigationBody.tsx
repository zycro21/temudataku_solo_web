"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, Plus, Pencil, Table, Eye } from "lucide-react";
import RichTextEditor, {
  type RichTextEditorRef,
} from "@/components/admin/elearning/materials/RichTextEditor";
import { getFontStyle, DEFAULT_FONT_TYPE, FONT_PRESETS } from "./fontStyles";

interface TabItem {
  id: string;
  label: string;
  content: string;
}

// ─── Canvas edit mode ───────────────────────────────────────────────────────
function TabNavigationCanvas({
  title,
  description,
  tabs,
  onTitleChange,
  onDescriptionChange,
  onTabLabelChange,
  onTabContentChange,
  onAddTab,
  onRemoveTab,
  onCreate,
  wrapperRef,
  onEditorFocus,
  onSelectionChange,
}: {
  title: string;
  description: string;
  tabs: TabItem[];
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onTabLabelChange: (id: string, value: string) => void;
  onTabContentChange: (id: string, value: string) => void;
  onAddTab: () => void;
  onRemoveTab: (id: string) => void;
  onCreate: () => void;
  wrapperRef: React.RefObject<HTMLDivElement>;
  onEditorFocus?: (ref: RichTextEditorRef) => void;
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
}) {
  const descRef = useRef<RichTextEditorRef>(null);
  const tabContentRefs = useRef<Map<string, RichTextEditorRef>>(new Map());
  const [activeEditorId, setActiveEditorId] = useState<string | null>(null);

  return (
    <div
      ref={wrapperRef}
      onClick={(e) => e.stopPropagation()}
      className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white group"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCreate();
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Eye size={11} /> Preview
      </button>

      <div className="mb-4 space-y-1">
        <input
          value={title}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onTitleChange(e.target.value)}
          onFocus={() => setActiveEditorId(null)}
          placeholder="Enter tabs title ..."
          className="w-full text-lg font-semibold text-gray-700 outline-none placeholder-gray-300 bg-transparent"
        />

        <div className="border-b border-dashed border-gray-200 pb-2">
          <p className="text-[10px] font-semibold text-gray-400 mb-0.5">
            Description
          </p>
          <RichTextEditor
            ref={descRef}
            value={description}
            onChange={onDescriptionChange}
            placeholder="Add a description ..."
            className="text-sm text-gray-500 min-h-[1.5em]"
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
      </div>

      <div className="space-y-3 mb-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="grid grid-cols-2">
              <div className="px-3 py-2 border-r border-gray-200">
                <p className="text-[11px] font-semibold text-gray-500 mb-1">
                  Tab Label
                </p>
                <input
                  value={tab.label}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onTabLabelChange(tab.id, e.target.value)}
                  onFocus={() => setActiveEditorId(null)}
                  maxLength={30}
                  placeholder="Tab name"
                  className="w-full text-sm text-gray-700 outline-none placeholder-gray-300 bg-transparent"
                />
                <p className="text-[10px] text-gray-300 mt-1.5">
                  {tab.label.length}/30
                </p>
              </div>

              <div className="px-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-semibold text-gray-500">
                    Tab Content
                  </p>
                  <button
                    onClick={() => onRemoveTab(tab.id)}
                    className="text-gray-300 hover:text-red-400 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <RichTextEditor
                  ref={(ref) => {
                    if (ref) tabContentRefs.current.set(tab.id, ref);
                    else tabContentRefs.current.delete(tab.id);
                  }}
                  value={tab.content}
                  onChange={(val) => onTabContentChange(tab.id, val)}
                  placeholder="Add content for this tab button"
                  className="text-sm text-gray-700 min-h-[4em]"
                  onFocus={() => {
                    setActiveEditorId(tab.id);
                    const ref = tabContentRefs.current.get(tab.id);
                    if (ref) onEditorFocus?.(ref);
                  }}
                  onBlur={() => setActiveEditorId(null)}
                  onSelectionChange={
                    activeEditorId === tab.id ? onSelectionChange : undefined
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onAddTab}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-emerald-500 text-emerald-600 text-sm font-semibold hover:bg-emerald-50 transition"
        >
          <Plus size={14} />
          Add Tab
        </button>
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition shadow-sm"
        >
          Create Tabs
        </button>
      </div>
    </div>
  );
}

// ─── Preview mode — proportional equal-width tabs ──────────────────────────
function TabNavigationPreview({
  title,
  description,
  tabs,
  fontType,
  fontSize,
  onEdit,
}: {
  title: string;
  description: string;
  tabs: TabItem[];
  fontType?: string;
  fontSize?: number;
  onEdit: () => void;
}) {
  const [activeId, setActiveId] = useState<string>(tabs[0]?.id ?? "");
  const activeTab = tabs.find((t) => t.id === activeId);

  // Apply font styling to content area only (tabs buttons unaffected)
  const contentStyle = getFontStyle(fontType, fontSize);

  return (
    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white group/preview">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title="Edit tab navigation"
        className="absolute top-2 right-2 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm text-[11px] text-gray-500 hover:text-emerald-600 hover:border-emerald-300 z-10"
      >
        <Pencil size={11} /> Edit
      </button>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-emerald-500">
          <Table size={15} />
        </span>
        <span className="text-sm font-bold text-gray-700">
          {title || "Tab Navigation"}
        </span>
      </div>

      {description && (
        <div
          className="text-sm text-gray-500 mb-3 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}

      {/* ⚠️ Hover info: font styling tidak diterapkan pada tab label */}
      <div className="absolute bottom-2 left-2 opacity-0 group-hover/preview:opacity-100 transition-opacity">
        <span className="text-[9px] text-gray-300 bg-white px-1.5 py-0.5 rounded shadow-sm">
          ℹ️ Font styling hanya untuk konten tab (tab label tidak terpengaruh)
        </span>
      </div>

      {/* Proportional tabs — each tab gets equal share of full width */}
      <div className="flex w-full">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveId(tab.id);
              }}
              style={{ width: `${100 / tabs.length}%` }}
              className={`py-2.5 text-sm font-semibold transition rounded-t-lg -mb-px truncate ${
                isActive
                  ? "bg-emerald-500 text-white border border-b-white border-emerald-500"
                  : "text-gray-500 hover:text-gray-700 border border-transparent"
              }`}
            >
              {tab.label || "Tab"}
            </button>
          );
        })}
      </div>

      <div className="border border-t-0 border-gray-200 rounded-b-lg px-4 py-4">
        <div
          className="text-sm text-gray-600 leading-relaxed"
          style={contentStyle}
          dangerouslySetInnerHTML={{ __html: activeTab?.content || "—" }}
        />
      </div>
    </div>
  );
}

// ─── Controller ───────────────────────────────────────────────────────────────
export function TabNavigationBody({
  initialData,
  fontType: propFontType,
  fontSize: propFontSize,
  onChangeData,
  onEditorFocus,
  onSelectionChange,
}: {
  initialData?: any;
  fontType?: string;
  fontSize?: number;
  onChangeData?: (data: any) => void;
  onEditorFocus?: (ref: RichTextEditorRef) => void;
  onSelectionChange?: Parameters<typeof RichTextEditor>[0]["onSelectionChange"];
}) {
  const [mode, setMode] = useState<"canvas" | "preview">("canvas");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: "tab-1", label: "", content: "" },
    { id: "tab-2", label: "", content: "" },
  ]);
  const [fontType, setFontType] = useState<string>(DEFAULT_FONT_TYPE);
  const [fontSize, setFontSize] = useState<number>(
    FONT_PRESETS[DEFAULT_FONT_TYPE].fontSize,
  );

  const wrapperRef = useRef<HTMLDivElement>(null!);

  // ── Restore from initialData on first mount ───────────────────────────────
  useEffect(() => {
    if (initialData?.tabs && initialData.tabs.length > 0) {
      setTitle(initialData.title ?? "");
      setDescription(initialData.description ?? "");
      setTabs(
        initialData.tabs.map((t: any) => ({
          id: t.id,
          label: t.label ?? t.title ?? "",
          content: t.content ?? "",
        })),
      );
      // Priority: props > initialData.fontType > default
      setFontType(propFontType ?? initialData.fontType ?? DEFAULT_FONT_TYPE);
      setFontSize(
        propFontSize ??
          initialData.fontSize ??
          FONT_PRESETS[DEFAULT_FONT_TYPE].fontSize,
      );
      setMode("preview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, propFontType, propFontSize]);

  const handleAddTab = () =>
    setTabs((prev) => [
      ...prev,
      { id: `tab-${Date.now()}`, label: "", content: "" },
    ]);

  const handleRemoveTab = (id: string) =>
    setTabs((prev) => prev.filter((t) => t.id !== id));

  const handleTabLabelChange = (id: string, value: string) =>
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, label: value } : t)),
    );

  const handleTabContentChange = (id: string, value: string) =>
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, content: value } : t)),
    );

  // ── Persist to page and switch to preview ─────────────────────────────────
  const handleCreate = () => {
    onChangeData?.({
      title,
      description,
      tabs: tabs.map((t) => ({
        ...t,
        title: t.label,
      })),
      fontType,
      fontSize,
    });
    setMode("preview");
  };

  if (mode === "canvas") {
    return (
      <TabNavigationCanvas
        title={title}
        description={description}
        tabs={tabs}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onTabLabelChange={handleTabLabelChange}
        onTabContentChange={handleTabContentChange}
        onAddTab={handleAddTab}
        onRemoveTab={handleRemoveTab}
        onCreate={handleCreate}
        wrapperRef={wrapperRef}
        onEditorFocus={onEditorFocus}
        onSelectionChange={onSelectionChange}
      />
    );
  }

  return (
    <TabNavigationPreview
      title={title}
      description={description}
      tabs={tabs}
      fontType={fontType}
      fontSize={fontSize}
      onEdit={() => setMode("canvas")}
    />
  );
}
