"use client";

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
} from "react";
import type { CSSProperties } from "react";
import katex from "katex";
import { toast } from "sonner";
import "katex/dist/katex.min.css";
import InlineEquationDialog from "./InlineEquationDialog";

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
  maxLength?: number; // ⬅️ baru
  onMaxLengthReached?: () => void;
  onPaste?: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  /** true = tombol "Sisipkan persamaan" tidak berlaku (mis. editor kode). */
  disableMath?: boolean;
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

// ─── Persamaan inline (atom non-editable di dalam contentEditable) ──────────
// Bentuk di DOM: <span data-latex="..." contenteditable="false">…KaTeX…</span>
// Disimpan sebagai token {math}LaTeX{/math} (lihat htmlToMarkdown di page.tsx).
const MATH_TOKEN_OVERHEAD = "{math}{/math}".length;

function escapeMathAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderMathInner(latex: string): string {
  try {
    return katex.renderToString(latex, {
      displayMode: false,
      throwOnError: false,
      strict: "ignore",
      trust: false,
      errorColor: "#dc2626",
    });
  } catch {
    return escapeMathAttr(latex);
  }
}

function renderMathAtom(latex: string): string {
  return `<span class="eq-inline" data-latex="${escapeMathAttr(latex)}" contenteditable="false">${renderMathInner(latex)}</span>`;
}

// execCommand("insertHTML") kadang menyederhanakan markup; pastikan setiap
// atom tetap non-editable dan isi KaTeX-nya utuh.
function hydrateMathAtoms(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-latex]").forEach((atom) => {
    atom.setAttribute("contenteditable", "false");
    if (!atom.querySelector(".katex, .katex-error")) {
      atom.innerHTML = renderMathInner(atom.getAttribute("data-latex") ?? "");
    }
  });
}

// Panjang teks untuk batas maxLength. Tanpa persamaan = sama persis dengan
// perhitungan lama (innerText). Dengan persamaan, tiap atom dihitung sebesar
// token tersimpannya (render KaTeX memuat teks ganda, jadi innerText menipu).
function getVisibleLength(el: HTMLElement): number {
  if (!el.querySelector("[data-latex]")) {
    return (el.innerText || "").replace(/\n$/, "").length;
  }
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("[data-latex]").forEach((atom) => {
    const n =
      (atom.getAttribute("data-latex") ?? "").length + MATH_TOKEN_OVERHEAD;
    atom.replaceWith(document.createTextNode("x".repeat(n)));
  });
  clone.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
  return (clone.textContent || "").replace(/\u200B/g, "").replace(/\n$/, "")
    .length;
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
      maxLength,
      onMaxLengthReached,
      onPaste,
      disableMath,
      onSelectionChange,
    },
    ref,
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isMountedRef = useRef(false);

    // ── Persamaan inline: state dialog + referensi posisi sisip / atom yang diedit
    const [mathDialog, setMathDialog] = useState<{
      mode: "insert" | "edit";
      latex: string;
    } | null>(null);
    const savedRangeRef = useRef<Range | null>(null);
    const disableMathRef = useRef(disableMath);
    useEffect(() => {
      disableMathRef.current = disableMath;
    }, [disableMath]);
    const editingAtomRef = useRef<HTMLElement | null>(null);

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

    const maxLengthRef = useRef(maxLength); // ⬅️ baru
    useEffect(() => {
      // ⬅️ baru
      maxLengthRef.current = maxLength; // ⬅️ baru
    }, [maxLength]); // ⬅️ baru

    const onMaxLengthReachedRef = useRef(onMaxLengthReached); // ⬅️ baru
    useEffect(() => {
      // ⬅️ baru
      onMaxLengthReachedRef.current = onMaxLengthReached; // ⬅️ baru
    }, [onMaxLengthReached]);

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

    // ── Cegah input nambah karakter kalau udah kena maxLength ─────────────────
    // Pakai onBeforeInput (bukan onKeyDown) karena ini juga nyegat paste,
    // IME, dan drag-drop teks — bukan cuma keyboard biasa.
    const handleBeforeInput = useCallback(
      (e: React.FormEvent<HTMLDivElement>) => {
        const max = maxLengthRef.current;
        const el = editorRef.current;
        if (!max || !el) return;

        const nativeEvent = e.nativeEvent as InputEvent;
        const inputType = nativeEvent.inputType || "";

        if (inputType.startsWith("delete")) return;

        const currentLength = getVisibleLength(el);
        const sel = window.getSelection();
        const selectedLength =
          sel && !sel.isCollapsed ? sel.toString().length : 0;

        let addedLength = (nativeEvent.data ?? "").length;
        if (
          !nativeEvent.data &&
          (inputType === "insertParagraph" || inputType === "insertLineBreak")
        ) {
          addedLength = 1;
        }

        const projected = currentLength - selectedLength + addedLength;
        if (projected > max) {
          e.preventDefault();
          onMaxLengthReachedRef.current?.();
        }
      },
      [],
    );

    // ── Build the imperative API object ──────────────────────────────────
    const buildAPI = useCallback(
      (): RichTextEditorRef => ({
        execCommand(cmd: string, val?: string) {
          const el = editorRef.current;
          if (!el) return;

          if (cmd === "__insertMath") {
            if (disableMathRef.current) {
              toast.info("Persamaan tidak bisa disisipkan di editor ini");
              return;
            }
            // Simpan posisi kursor sekarang; dialog akan mencuri fokus.
            const sel = window.getSelection();
            savedRangeRef.current =
              sel && sel.rangeCount > 0 && el.contains(sel.anchorNode)
                ? sel.getRangeAt(0).cloneRange()
                : null;
            editingAtomRef.current = null;
            setMathDialog({ mode: "insert", latex: "" });
            return;
          }

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

          // ── Indent/Outdent kustom ──────────────────────────────────────
          // Native document.execCommand("indent") SELALU membungkus lagi
          // dengan <blockquote> baru di dalam blockquote yang sudah ada
          // kalau ditekan berkali-kali di selection yang sama — jadinya
          // nested blockquote (3x indent = 3 lapis bersarang). Format
          // penyimpanan di backend cuma bisa merepresentasikan SATU lapis
          // margin, dan nested tag semacam ini juga nggak bisa dihitung
          // benar lewat regex biasa (regex nggak bisa ngitung kedalaman
          // nesting arbitrary). Makanya di sini kita cegat: kalau selection
          // udah ada di dalam sebuah blockquote, tinggal NAIKKAN/TURUNKAN
          // margin-left elemen blockquote yang SAMA — bukan bikin
          // <blockquote> baru — supaya cuma ada satu lapis, berapa pun kali
          // ditekan.
          if (cmd === "indent" || cmd === "outdent") {
            el.focus();
            requestAnimationFrame(() => {
              const sel = window.getSelection();
              if (!sel || sel.rangeCount === 0) return;

              let node: Node | null = sel.anchorNode;
              let bq: HTMLElement | null = null;
              while (node && node !== el) {
                if (
                  node instanceof HTMLElement &&
                  node.tagName === "BLOCKQUOTE"
                ) {
                  bq = node;
                  break;
                }
                node = node.parentNode;
              }

              const STEP = 40;

              if (bq) {
                const current = parseInt(bq.style.marginLeft || "", 10) || STEP;
                const next = cmd === "indent" ? current + STEP : current - STEP;

                if (next <= 0) {
                  // Outdent sampai 0 → lepas blockquote-nya, kembalikan isinya
                  const parent = bq.parentNode;
                  while (bq.firstChild) {
                    parent?.insertBefore(bq.firstChild, bq);
                  }
                  parent?.removeChild(bq);
                } else {
                  bq.setAttribute(
                    "style",
                    `margin:0 0 0 ${next}px;border:none;padding:0`,
                  );
                }
              } else if (cmd === "indent") {
                // Belum ada blockquote sama sekali → baru bikin satu lapis
                // lewat native execCommand, lalu paksa style-nya konsisten
                // (border:none;padding:0) biar nggak kena CSS class default.
                document.execCommand("indent", false, undefined);

                const newSel = window.getSelection();
                let n: Node | null = newSel?.anchorNode ?? null;
                while (n && n !== el) {
                  if (n instanceof HTMLElement && n.tagName === "BLOCKQUOTE") {
                    n.setAttribute(
                      "style",
                      `margin:0 0 0 ${STEP}px;border:none;padding:0`,
                    );
                    break;
                  }
                  n = n.parentNode;
                }
              }
              // outdent tanpa blockquote sama sekali → tidak ada apa-apa
              // yang perlu dilakukan (sudah di level paling luar).

              document.dispatchEvent(new Event("selectionchange"));
              fireSelectionChange();
              onChangeRef.current?.(el.innerHTML || "");
            });
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

          // 🔥 Cleanup: execCommand("justify*") kadang nyisain <div> kosong total
          // (tanpa <br>, tanpa teks) sebagai artifact internal Chrome pas
          // mem-block-ifikasi selection yang tadinya teks polos + "\n". Div yang
          // BENERAN kosong (childNodes.length === 0) nggak pernah punya arti,
          // beda sama <div><br></div> yang memang representasi blank-line valid.
          if (cmd.startsWith("justify")) {
            el.querySelectorAll("div").forEach((div) => {
              if (div.childNodes.length === 0) div.remove();
            });
          }

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

    // ── Persamaan inline: konfirmasi / batal dari dialog ──────────────────
    const closeMathDialog = () => {
      setMathDialog(null);
      editingAtomRef.current = null;
      savedRangeRef.current = null;
      requestAnimationFrame(() => editorRef.current?.focus());
    };

    const handleMathConfirm = (latex: string) => {
      const el = editorRef.current;
      if (!el) {
        closeMathDialog();
        return;
      }

      // Mode edit: ganti isi atom yang sama.
      const atom = editingAtomRef.current;
      if (atom && el.contains(atom)) {
        atom.setAttribute("data-latex", latex);
        atom.innerHTML = renderMathInner(latex);
        closeMathDialog();
        onChangeRef.current?.(el.innerHTML || "");
        return;
      }

      // Mode sisip: cek batas karakter dulu (mis. highlight 1250).
      const max = maxLengthRef.current;
      if (
        max &&
        getVisibleLength(el) + latex.length + MATH_TOKEN_OVERHEAD > max
      ) {
        onMaxLengthReachedRef.current?.();
        closeMathDialog();
        return;
      }

      el.focus();
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        const saved = savedRangeRef.current;
        if (saved && el.contains(saved.commonAncestorContainer)) {
          sel.addRange(saved);
        } else {
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          sel.addRange(range);
        }
      }
      // insertHTML (bukan range.insertNode) supaya Ctrl+Z tetap bekerja.
      // \u200B = tempat kursor mendarat setelah atom; dibuang saat disimpan.
      document.execCommand(
        "insertHTML",
        false,
        renderMathAtom(latex) + "\u200B",
      );
      hydrateMathAtoms(el);

      closeMathDialog();
      document.dispatchEvent(new Event("selectionchange"));
      fireSelectionChange();
      onChangeRef.current?.(el.innerHTML || "");
    };

    return (
      <>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onBeforeInput={handleBeforeInput}
          onPaste={onPaste}
          onInput={() => {
            onChangeRef.current?.(editorRef.current?.innerHTML || "");
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyUp={fireSelectionChange}
          onMouseUp={fireSelectionChange}
          onClick={(e) => {
            // Klik persamaan inline → buka dialog untuk mengubahnya.
            const atom = (e.target as HTMLElement).closest?.(
              "[data-latex]",
            ) as HTMLElement | null;
            if (!atom || !editorRef.current?.contains(atom)) return;
            e.preventDefault();
            editingAtomRef.current = atom;
            savedRangeRef.current = null;
            setMathDialog({
              mode: "edit",
              latex: atom.getAttribute("data-latex") ?? "",
            });
          }}
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
            // ── Tab = indent (kayak di Word) ────────────────────────────────
            // Sebelumnya Tab nggak di-handle sama sekali → browser default-nya
            // pindahin focus ke elemen berikutnya (bukan nyisipin spasi).
            // Fix: cegat Tab di sini, insert beberapa karakter NON-BREAKING
            // SPACE (U+00A0, bukan spasi biasa " ") langsung ke posisi kursor.
            // Sengaja pakai nbsp (bukan spasi biasa) karena nbsp itu TIDAK
            // PERNAH di-collapse browser apa pun kondisi white-space
            // container-nya (beda sama spasi biasa yang collapse kalau
            // container preview nggak punya white-space:pre-wrap) — jadi
            // hasil Tab ini dijamin tetep keliatan menjorok baik pas ngedit
            // MAUPUN di preview, tanpa gantung ke fix spasi-berturut di
            // normalizeEditorHTML().
            if (e.key === "Tab" && !e.shiftKey) {
              e.preventDefault();
              document.execCommand(
                "insertText",
                false,
                "\u00A0\u00A0\u00A0\u00A0",
              );
              fireSelectionChange();
              onChangeRef.current?.(editorRef.current?.innerHTML || "");
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
  [&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300
  [&_[data-latex]]:cursor-pointer [&_[data-latex]]:select-none [&_[data-latex]]:rounded [&_[data-latex]]:hover:bg-emerald-50`}
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", ...style }}
        />
        {mathDialog && (
          <InlineEquationDialog
            mode={mathDialog.mode}
            initialLatex={mathDialog.latex}
            onConfirm={handleMathConfirm}
            onCancel={closeMathDialog}
          />
        )}
      </>
    );
  },
);

RichTextEditor.displayName = "RichTextEditor";
export default RichTextEditor;
