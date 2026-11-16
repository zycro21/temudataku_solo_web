"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { MathfieldElement } from "mathlive";
import { splitEquationLines } from "./equationUtils";

export interface MathFieldHandle {
  /** Sisipkan LaTeX di posisi kursor pada baris yang sedang aktif. */
  insert: (latex: string) => void;
  focus: () => void;
}

interface Props {
  /** Teks persamaan; baris dipisahkan "\n" (sama dengan mode LaTeX). */
  value: string;
  onChange: (latex: string) => void;
  /** Dipanggil kalau MathLive gagal dimuat → parent bisa pindah ke mode LaTeX. */
  onLoadError?: (error: unknown) => void;
  ariaLabel?: string;
}

type Direction = "forward" | "backward" | "upward" | "downward";
type CaretPosition = "start" | "end";
interface Line {
  id: string;
  value: string;
}

let lineCounter = 0;
const newLineId = () =>
  `line-${Date.now().toString(36)}-${(lineCounter++).toString(36)}`;
const makeLines = (value: string): Line[] =>
  splitEquationLines(value).map((v) => ({ id: newLineId(), value: v }));
const joinLines = (lines: Line[]) => lines.map((l) => l.value).join("\n");

// Sembunyikan tombol keyboard virtual & menu bawaan MathLive — palet simbol
// kita sendiri yang dipakai, supaya tampilan editor tetap bersih.
const HIDE_TOGGLES_STYLE_ID = "mathlive-hide-builtin-toggles";
function ensureHideTogglesStyle() {
  if (document.getElementById(HIDE_TOGGLES_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = HIDE_TOGGLES_STYLE_ID;
  style.textContent =
    "math-field::part(virtual-keyboard-toggle), math-field::part(menu-toggle) { display: none; }";
  document.head.appendChild(style);
}

// MathLive menyentuh `window`, jadi dimuat dinamis (aman untuk SSR) dan hanya
// sekali untuk semua baris.
let mathliveModule: Promise<typeof import("mathlive")> | null = null;
function loadMathlive() {
  if (!mathliveModule) {
    mathliveModule = import("mathlive")
      .then((m) => {
        // Font MathLive = font KaTeX (nama family sama). KaTeX CSS sudah
        // di-import oleh MathView, jadi tidak perlu menyalin folder font.
        m.MathfieldElement.fontsDirectory = null;
        m.MathfieldElement.soundsDirectory = null;
        ensureHideTogglesStyle();
        return m;
      })
      .catch((error) => {
        mathliveModule = null;
        throw error;
      });
  }
  return mathliveModule;
}

// ─── Satu baris editor ────────────────────────────────────────────────────────
interface MathLineProps {
  line: Line;
  ariaLabel: string;
  onField: (id: string, field: MathfieldElement | null) => void;
  onValue: (id: string, value: string) => void;
  onFocus: (id: string) => void;
  onEnter: (id: string) => void;
  /** true = ditangani (baris kosong dihapus). */
  onBackspaceEmpty: (id: string) => boolean;
  /** true = fokus dipindah ke baris lain. */
  onMoveOut: (id: string, direction: Direction) => boolean;
  onLoadError?: (error: unknown) => void;
}

function MathLine(props: MathLineProps) {
  const { line } = props;
  const hostRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<MathfieldElement | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const initialValue = useRef(line.value);

  useEffect(() => {
    let disposed = false;
    const id = line.id;

    loadMathlive()
      .then(({ MathfieldElement }) => {
        if (disposed || !hostRef.current) return;

        const field = new MathfieldElement();
        // Palet simbol kita sendiri yang dipakai, bukan keyboard virtual bawaan.
        field.mathVirtualKeyboardPolicy = "manual";
        field.value = initialValue.current;
        field.setAttribute("aria-label", propsRef.current.ariaLabel);
        Object.assign(field.style, {
          display: "block",
          width: "100%",
          fontSize: "1.5rem",
          padding: "0.5rem 0.75rem",
          border: "1px solid #d1d5db",
          borderRadius: "0.5rem",
          background: "#ffffff",
        });

        field.addEventListener("input", () =>
          propsRef.current.onValue(id, field.value),
        );
        field.addEventListener("focusin", () => propsRef.current.onFocus(id));
        // Capture di elemen host: jalan sebelum MathLive memproses tombolnya.
        field.addEventListener(
          "keydown",
          (e) => {
            if (e.isComposing) return;
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              propsRef.current.onEnter(id);
            } else if (
              e.key === "Backspace" &&
              field.value === "" &&
              propsRef.current.onBackspaceEmpty(id)
            ) {
              e.preventDefault();
              e.stopPropagation();
            }
          },
          true,
        );
        // Panah / Tab mentok di ujung baris → pindah ke baris sebelum/sesudahnya.
        field.addEventListener("move-out", (e) => {
          if (propsRef.current.onMoveOut(id, e.detail.direction)) {
            e.preventDefault();
          }
        });

        hostRef.current.appendChild(field);
        fieldRef.current = field;
        propsRef.current.onField(id, field);
      })
      .catch((error) => propsRef.current.onLoadError?.(error));

    return () => {
      disposed = true;
      if (fieldRef.current) {
        propsRef.current.onField(id, null);
        fieldRef.current.remove();
        fieldRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line.id]);

  // Sinkron dari luar (mis. user edit di mode LaTeX lalu kembali ke Visual).
  useEffect(() => {
    const field = fieldRef.current;
    if (field && field.value !== line.value) field.value = line.value;
  }, [line.value]);

  useEffect(() => {
    fieldRef.current?.setAttribute("aria-label", props.ariaLabel);
  }, [props.ariaLabel]);

  return <div ref={hostRef} />;
}

// ─── Editor persamaan visual (WYSIWYG) ala Equation di Word ──────────────────
// Setiap baris adalah satu MathLive field. Enter = baris baru di bawahnya,
// Backspace di baris kosong = hapus baris, panah atas/bawah = pindah baris.
const MathFieldInput = forwardRef<MathFieldHandle, Props>(
  function MathFieldInput(
    { value, onChange, onLoadError, ariaLabel = "Equation editor" },
    ref,
  ) {
    const [lines, setLines] = useState<Line[]>(() => makeLines(value));
    const linesRef = useRef(lines);
    linesRef.current = lines;
    const fields = useRef(new Map<string, MathfieldElement>());
    const activeId = useRef(lines[0].id);
    const pendingFocus = useRef<{ id: string; position: CaretPosition } | null>(
      null,
    );
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const commit = useCallback((next: Line[]) => {
      linesRef.current = next;
      setLines(next);
      onChangeRef.current(joinLines(next));
    }, []);

    const focusLine = useCallback((id: string, position: CaretPosition) => {
      const field = fields.current.get(id);
      if (!field) {
        pendingFocus.current = { id, position }; // baris baru belum selesai dibuat
        return;
      }
      field.focus();
      field.executeCommand(
        position === "start" ? "moveToMathfieldStart" : "moveToMathfieldEnd",
      );
    }, []);

    const handleField = useCallback(
      (id: string, field: MathfieldElement | null) => {
        if (!field) {
          fields.current.delete(id);
          return;
        }
        fields.current.set(id, field);
        const pending = pendingFocus.current;
        if (pending?.id === id) {
          pendingFocus.current = null;
          focusLine(id, pending.position);
        }
      },
      [focusLine],
    );

    const handleValue = useCallback(
      (id: string, next: string) =>
        commit(
          linesRef.current.map((l) =>
            l.id === id ? { ...l, value: next } : l,
          ),
        ),
      [commit],
    );

    const handleFocus = useCallback((id: string) => {
      activeId.current = id;
    }, []);

    const handleEnter = useCallback(
      (id: string) => {
        const current = linesRef.current;
        const index = current.findIndex((l) => l.id === id);
        if (index === -1) return;
        const created: Line = { id: newLineId(), value: "" };
        pendingFocus.current = { id: created.id, position: "start" };
        commit([
          ...current.slice(0, index + 1),
          created,
          ...current.slice(index + 1),
        ]);
      },
      [commit],
    );

    const handleBackspaceEmpty = useCallback(
      (id: string) => {
        const current = linesRef.current;
        if (current.length <= 1) return false;
        const index = current.findIndex((l) => l.id === id);
        if (index === -1) return false;
        const target = current[index - 1] ?? current[index + 1];
        // Fokus dipindah SETELAH React selesai membuang baris ini (efek di
        // bawah); kalau langsung, fokus ikut hilang saat elemennya dilepas.
        pendingFocus.current = {
          id: target.id,
          position: index > 0 ? "end" : "start",
        };
        commit(current.filter((l) => l.id !== id));
        return true;
      },
      [commit],
    );

    const handleMoveOut = useCallback(
      (id: string, direction: Direction) => {
        const current = linesRef.current;
        const index = current.findIndex((l) => l.id === id);
        if (index === -1) return false;
        const forward = direction === "forward" || direction === "downward";
        const target = current[forward ? index + 1 : index - 1];
        if (!target) return false;
        focusLine(target.id, forward ? "start" : "end");
        return true;
      },
      [focusLine],
    );

    // Jalankan pindah-fokus yang tertunda begitu daftar baris sudah ter-render.
    useEffect(() => {
      const pending = pendingFocus.current;
      if (pending && fields.current.has(pending.id)) {
        pendingFocus.current = null;
        focusLine(pending.id, pending.position);
      }
    }, [lines, focusLine]);

    // Nilai berubah dari luar (mis. edit di mode LaTeX) → bangun ulang baris.
    useEffect(() => {
      if (value === joinLines(linesRef.current)) return;
      const next = makeLines(value);
      linesRef.current = next;
      activeId.current = next[0].id;
      setLines(next);
    }, [value]);

    useImperativeHandle(
      ref,
      () => ({
        insert(latex: string) {
          const all = linesRef.current;
          const id = fields.current.has(activeId.current)
            ? activeId.current
            : all[all.length - 1]?.id;
          const field = id ? fields.current.get(id) : undefined;
          if (!id || !field) return;
          field.insert(latex, {
            format: "latex",
            focus: true,
            selectionMode: "placeholder",
          });
          handleValue(id, field.value);
        },
        focus() {
          const all = linesRef.current;
          const id = fields.current.has(activeId.current)
            ? activeId.current
            : all[0].id;
          focusLine(id, "end");
        },
      }),
      [focusLine, handleValue],
    );

    return (
      <div className="space-y-2">
        {lines.map((line, i) => (
          <MathLine
            key={line.id}
            line={line}
            ariaLabel={
              lines.length > 1 ? `${ariaLabel}, line ${i + 1}` : ariaLabel
            }
            onField={handleField}
            onValue={handleValue}
            onFocus={handleFocus}
            onEnter={handleEnter}
            onBackspaceEmpty={handleBackspaceEmpty}
            onMoveOut={handleMoveOut}
            onLoadError={onLoadError}
          />
        ))}
      </div>
    );
  },
);

export default MathFieldInput;
