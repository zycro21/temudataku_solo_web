"use client";

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";

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

    // ── Deteksi italic: cek apakah cursor/selection ada di dalam span skewX
    const detectItalic = useCallback((): boolean => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return false;

      const range = sel.getRangeAt(0);

      let node: Node | null =
        range.commonAncestorContainer.nodeType === Node.TEXT_NODE
          ? range.commonAncestorContainer.parentNode
          : range.commonAncestorContainer;

      while (node) {
        if (
          node instanceof HTMLElement &&
          node.style?.transform?.includes("skewX")
        ) {
          return true;
        }
        node = node.parentNode;
      }

      return false;
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
            el.focus();

            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;

            const range = sel.getRangeAt(0);
            const isItalic = detectItalic();

            if (range.collapsed) {
              if (isItalic) {
                let node: Node | null = sel.anchorNode;
                while (node && node !== el) {
                  if (
                    node instanceof HTMLElement &&
                    node.style?.transform?.includes("skewX")
                  ) {
                    const newRange = document.createRange();
                    newRange.setStartAfter(node);
                    newRange.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(newRange);
                    el.normalize();
                    break;
                  }
                  node = node.parentNode;
                }
              } else {
                const span = document.createElement("span");
                span.style.display = "inline-block";
                span.style.transform = "skewX(-8deg)";
                span.style.fontStyle = "normal";

                const zwsp = document.createTextNode("\u200B");
                span.appendChild(zwsp);

                range.insertNode(span);

                const newRange = document.createRange();
                newRange.setStart(zwsp, 1);
                newRange.collapse(true);

                sel.removeAllRanges();
                sel.addRange(newRange);
              }

              document.dispatchEvent(new Event("selectionchange"));
              fireSelectionChange();
              onChangeRef.current?.(el.innerHTML || "");
              return;
            }

            const commonAncestor = range.commonAncestorContainer;
            const startNode =
              commonAncestor.nodeType === Node.TEXT_NODE
                ? commonAncestor.parentNode
                : commonAncestor;

            let skewParent: HTMLElement | null = null;
            let check: Node | null = startNode;

            while (check && check !== el) {
              if (
                check instanceof HTMLElement &&
                check.style?.transform?.includes("skewX")
              ) {
                skewParent = check;
                break;
              }
              check = check.parentNode;
            }

            if (skewParent) {
              const parent = skewParent.parentNode;
              if (!parent) return;

              const children: Node[] = [];
              while (skewParent.firstChild) {
                children.push(skewParent.firstChild);
                parent.insertBefore(skewParent.firstChild, skewParent);
              }
              parent.removeChild(skewParent);

              if (children.length > 0) {
                const newRange = document.createRange();
                newRange.setStartBefore(children[0]);
                newRange.setEndAfter(children[children.length - 1]);
                sel.removeAllRanges();
                sel.addRange(newRange);
              }
            } else {
              const span = document.createElement("span");
              span.style.display = "inline-block";
              span.style.transform = "skewX(-8deg)";
              span.style.fontStyle = "normal";

              try {
                range.surroundContents(span);
              } catch {
                const content = range.extractContents();
                span.appendChild(content);
                range.insertNode(span);
              }
            }

            document.dispatchEvent(new Event("selectionchange"));
            fireSelectionChange();
            onChangeRef.current?.(el.innerHTML || "");
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
      [detectItalic, fireSelectionChange],
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
            (ref as any)?.current?.execCommand("italic");
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
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      />
    );
  },
);

RichTextEditor.displayName = "RichTextEditor";
export default RichTextEditor;
