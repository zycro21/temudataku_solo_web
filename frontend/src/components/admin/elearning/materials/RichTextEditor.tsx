"use client";

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import type { CSSProperties } from "react";

export interface RichTextEditorRef {
  execCommand: (cmd: string, value?: string) => void;
  setFontSize: (px: number) => void;
  focus: () => void;
  getHTML: () => string;
}

interface RichTextEditorProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
  onFocus?: () => void;
  onBlur?: () => void;
  onMount?: (ref: RichTextEditorRef) => void;
  onUnmount?: () => void;
  onSelectionChange?: (state: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    highlight: boolean;
    penColor: string;
    align: "left" | "center" | "right" | "justify";
    listType: "none" | "bullet" | "ordered";
  }) => void;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  (
    {
      value,
      onChange,
      placeholder,
      className,
      style,
      onFocus,
      onBlur,
      onMount,
      onUnmount,
      onSelectionChange,
    },
    ref,
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isMountedRef = useRef(false);

    const onSelectionChangeRef = useRef(onSelectionChange);
    const onChangeRef = useRef(onChange);
    const onMountRef = useRef(onMount);
    const onUnmountRef = useRef(onUnmount);

    useEffect(() => {
      onSelectionChangeRef.current = onSelectionChange;
    }, [onSelectionChange]);
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);
    useEffect(() => {
      onMountRef.current = onMount;
    }, [onMount]);
    useEffect(() => {
      onUnmountRef.current = onUnmount;
    }, [onUnmount]);

    // ── Deteksi italic: pakai browser native queryCommandState
    // Ini bekerja dengan benar karena font (Plus Jakarta Sans) sudah punya
    // italic variant yang sesungguhnya — tidak perlu skewX workaround lagi.
    const detectItalic = useCallback((): boolean => {
      return document.queryCommandState("italic");
    }, []);

    // ── Helper: konversi rgb(...) → #rrggbb ───────────────────────────────
    const rgbToHex = useCallback((color: string): string => {
      if (!color) return "#000000";
      if (color.startsWith("#")) {
        return color.toLowerCase().length === 7
          ? color.toLowerCase()
          : "#000000";
      }
      const m = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
      if (m) {
        return (
          "#" +
          [m[1], m[2], m[3]]
            .map((v) => parseInt(v).toString(16).padStart(2, "0"))
            .join("")
        );
      }
      return "#000000";
    }, []);

    // ── fireSelectionChange ───────────────────────────────────────────────
    const fireSelectionChange = useCallback(() => {
      const cb = onSelectionChangeRef.current;
      if (!cb) return;
      cb({
        bold: document.queryCommandState("bold"),
        italic: detectItalic(),
        underline: document.queryCommandState("underline"),
        strikethrough: document.queryCommandState("strikeThrough"),
        highlight: (() => {
          const color = document.queryCommandValue("hiliteColor");
          if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)")
            return false;
          const hex = rgbToHex(color);
          if (hex === "#ffffff") return false;
          return true;
        })(),
        penColor: (() => {
          const color = document.queryCommandValue("foreColor");
          return rgbToHex(color);
        })(),
        align: (() => {
          if (document.queryCommandState("justifyCenter")) return "center";
          if (document.queryCommandState("justifyRight")) return "right";
          if (document.queryCommandState("justifyFull")) return "justify";
          return "left";
        })(),
        listType: (() => {
          if (document.queryCommandState("insertUnorderedList"))
            return "bullet";
          if (document.queryCommandState("insertOrderedList")) return "ordered";
          return "none";
        })(),
      });
    }, [detectItalic, rgbToHex]);

    // ── Toggle italic — dipakai oleh toolbar (execCommand("italic")) MAUPUN
    // shortcut Ctrl/Cmd+I langsung, supaya logikanya satu sumber kebenaran.
    const toggleItalic = useCallback(() => {
      const el = editorRef.current;
      if (!el) return;
      el.focus();
      document.execCommand("italic", false, undefined);
      document.dispatchEvent(new Event("selectionchange"));
      fireSelectionChange();
      onChangeRef.current?.(el.innerHTML || "");
    }, [fireSelectionChange]);

    // ── Toggle strikethrough — dipakai oleh toolbar (execCommand("strikeThrough"))
    // MAUPUN shortcut Ctrl/Cmd+Shift+X langsung.
    const toggleStrikethrough = useCallback(() => {
      const el = editorRef.current;
      if (!el) return;
      el.focus();
      document.execCommand("strikeThrough", false, undefined);
      document.dispatchEvent(new Event("selectionchange"));
      fireSelectionChange();
      onChangeRef.current?.(el.innerHTML || "");
    }, [fireSelectionChange]);

    // ── Build the imperative API object ──────────────────────────────────
    const buildAPI = useCallback(
      (): RichTextEditorRef => ({
        execCommand(cmd: string, val?: string) {
          const el = editorRef.current;
          if (!el) return;

          if (cmd === "__setBulletStyle" && val) {
            el.focus();
            requestAnimationFrame(() => {
              const sel = window.getSelection();
              if (!sel || sel.rangeCount === 0) return;
              let node: Node | null = sel.anchorNode;
              while (node && node !== el) {
                if (node instanceof HTMLElement && node.tagName === "UL") {
                  node.style.listStyleType = val;
                  break;
                }
                node = node.parentNode;
              }
              onChangeRef.current?.(el.innerHTML || "");
            });
            return;
          }

          if (cmd === "__setNumberStyle" && val) {
            el.focus();
            requestAnimationFrame(() => {
              const sel = window.getSelection();
              if (!sel || sel.rangeCount === 0) return;
              let node: Node | null = sel.anchorNode;
              while (node && node !== el) {
                if (node instanceof HTMLElement && node.tagName === "OL") {
                  node.style.listStyleType = val;
                  break;
                }
                node = node.parentNode;
              }
              onChangeRef.current?.(el.innerHTML || "");
            });
            return;
          }

          if (cmd === "italic") {
            toggleItalic();
            return;
          }

          if (cmd === "strikeThrough") {
            toggleStrikethrough();
            return;
          }

          el.focus();

          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0) {
            const newRange = document.createRange();
            newRange.selectNodeContents(el);
            newRange.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(newRange);
          }

          document.execCommand(cmd, false, val ?? undefined);
          document.dispatchEvent(new Event("selectionchange"));
          fireSelectionChange();
          onChangeRef.current?.(el.innerHTML || "");
        },

        setFontSize(px: number) {
          const el = editorRef.current;
          if (!el) return;
          el.focus();
          document.execCommand("fontSize", false, "7");
          const spans = el.querySelectorAll(
            'font[size="7"]',
          ) as NodeListOf<HTMLElement>;
          spans.forEach((s) => {
            s.removeAttribute("size");
            s.style.fontSize = `${px}px`;
          });
          document.dispatchEvent(new Event("selectionchange"));
          fireSelectionChange();
          onChangeRef.current?.(el.innerHTML || "");
        },

        focus() {
          editorRef.current?.focus();
        },

        getHTML() {
          return editorRef.current?.innerHTML ?? "";
        },
      }),
      [fireSelectionChange, toggleItalic, toggleStrikethrough],
    );

    // ── Init: inject value on mount, reset on unmount ─────────────────────
    useEffect(() => {
      if (editorRef.current && value !== undefined && !isMountedRef.current) {
        editorRef.current.innerHTML = value;
        isMountedRef.current = true;
      }

      // Notify parent that this editor instance is ready
      // We need a stable ref object to pass upward
      const api = buildAPI();

      // Expose via onMount so parent can re-register even after preview→canvas cycle
      onMountRef.current?.(api);

      return () => {
        // Reset so next mount can re-inject value
        isMountedRef.current = false;
        onUnmountRef.current?.();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Expose imperative API ─────────────────────────────────────────────
    useImperativeHandle(ref, () => buildAPI(), [buildAPI]);

    useEffect(() => {
      const handler = () => fireSelectionChange();
      document.addEventListener("selectionchange", handler);
      return () => document.removeEventListener("selectionchange", handler);
    }, [fireSelectionChange]);

    return (
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          onChangeRef.current?.(editorRef.current?.innerHTML || "");
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyUp={fireSelectionChange}
        onMouseUp={fireSelectionChange}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
            e.preventDefault();
            toggleItalic();
            return;
          }
          if (
            (e.ctrlKey || e.metaKey) &&
            e.shiftKey &&
            e.key.toLowerCase() === "x"
          ) {
            e.preventDefault();
            toggleStrikethrough();
            return;
          }
          const isInUnordered = document.queryCommandState(
            "insertUnorderedList",
          );
          const isInOrdered = document.queryCommandState("insertOrderedList");
          const isInList = isInUnordered || isInOrdered;

          if (e.key === "Enter" && e.shiftKey && isInList) {
            e.preventDefault();
            document.execCommand(
              isInUnordered ? "insertUnorderedList" : "insertOrderedList",
            );
            document.execCommand("insertParagraph");
            fireSelectionChange();
            onChangeRef.current?.(editorRef.current?.innerHTML || "");
            return;
          }

          if (e.key === "Enter" && !e.shiftKey && isInList) {
            const sel = window.getSelection();
            const anchorNode = sel?.anchorNode;
            const text =
              anchorNode?.nodeType === Node.TEXT_NODE
                ? anchorNode.textContent
                : (anchorNode as HTMLElement)?.innerText;

            if (!text || text.trim() === "") {
              e.preventDefault();
              document.execCommand(
                isInUnordered ? "insertUnorderedList" : "insertOrderedList",
              );
              fireSelectionChange();
              onChangeRef.current?.(editorRef.current?.innerHTML || "");
            }
            return;
          }
        }}
        data-placeholder={placeholder}
        className={`outline-none min-h-[2em] leading-relaxed ${className ?? ""}
  [&:empty]:before:content-[attr(data-placeholder)]
  [&:empty]:before:text-gray-300
  [&:empty]:before:pointer-events-none
  [&_ul]:pl-6 [&_ul]:my-1
  [&_ol]:pl-6 [&_ol]:my-1
  [&_li]:my-0.5
  [&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300`}
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", ...style }}
      />
    );
  },
);

RichTextEditor.displayName = "RichTextEditor";
export default RichTextEditor;
