"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  isBranching,
  isAnswerable,
  type EditorItem,
  type EditorSection,
  type FormSettings,
  type ValidationRule,
} from "./editorModel";
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_THEME_COLOR,
  fontStack,
  mediaSrc,
} from "./formTheme";
import { resolveImageUrl } from "./shared";
import EventShell, { type EventInfoPublic } from "./EventShell";

interface Props {
  open: boolean;
  onClose: () => void;
  settings: FormSettings;
  sections: EditorSection[];
  /** EVENT = tampilkan layout event (tab + Informasi Event). Default NON_EVENT */
  type?: "EVENT" | "NON_EVENT";
}

// Jawaban lokal (hanya di memori; preview TIDAK mengirim apa pun ke server)
type Answer = string | number | string[] | Record<string, string[]>;
type Answers = Record<string, Answer | undefined>;

const HEX = /^#[0-9a-fA-F]{6}$/;
const fieldClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 sm:text-sm";

function isEmpty(v: Answer | undefined): boolean {
  if (v === undefined || v === "") return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v).length === 0;
  return false;
}

// Aturan validasi sama seperti yang diatur di builder
function ruleError(rule: ValidationRule, v: Answer): string | null {
  const fail = (fallback: string) => rule.message || fallback;
  const text = typeof v === "string" ? v : String(v);
  const n = Number(text);
  switch (rule.kind) {
    case "number": {
      if (Number.isNaN(n)) return fail("Masukkan angka yang valid");
      const val = Number(rule.value);
      const ok: Record<string, boolean> = {
        between: n >= Number(rule.min) && n <= Number(rule.max),
        notBetween: n < Number(rule.min) || n > Number(rule.max),
        gt: n > val,
        gte: n >= val,
        lt: n < val,
        lte: n <= val,
        eq: n === val,
        neq: n !== val,
        integer: Number.isInteger(n),
      };
      return ok[rule.op] ? null : fail("Angka tidak memenuhi aturan");
    }
    case "text": {
      const needle = String(rule.value ?? "").toLowerCase();
      const lower = text.toLowerCase();
      const ok: Record<string, boolean> = {
        contains: lower.includes(needle),
        notContains: !lower.includes(needle),
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text),
        url: /^https?:\/\/\S+$/i.test(text),
      };
      return ok[rule.op] ? null : fail("Teks tidak memenuhi aturan");
    }
    case "length": {
      const len = text.length;
      const lim = Number(rule.value);
      const ok = rule.op === "min" ? len >= lim : len <= lim;
      return ok ? null : fail("Panjang teks tidak memenuhi aturan");
    }
    case "regex": {
      try {
        const m = new RegExp(String(rule.value)).test(text);
        return (rule.op === "notMatches" ? !m : m)
          ? null
          : fail("Format jawaban tidak sesuai");
      } catch {
        return null;
      }
    }
    case "selectCount": {
      const c = Array.isArray(v) ? v.length : 0;
      const lim = Number(rule.value);
      const ok: Record<string, boolean> = {
        atLeast: c >= lim,
        atMost: c <= lim,
        exactly: c === lim,
      };
      return ok[rule.op] ? null : fail("Jumlah pilihan tidak sesuai");
    }
  }
}

// datetime-local ("2027-03-12T09:00") → ISO, atau null kalau kosong/tidak valid
function localToIso(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export default function FormPreview({
  open,
  onClose,
  settings,
  sections,
  type = "NON_EVENT",
}: Props) {
  const [path, setPath] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const theme = HEX.test(settings.themeColor)
    ? settings.themeColor
    : DEFAULT_THEME_COLOR;
  const bg = HEX.test(settings.backgroundColor)
    ? settings.backgroundColor
    : DEFAULT_BACKGROUND_COLOR;
  const headerSrc = resolveImageUrl(settings.headerImage);

  // Mulai ulang setiap preview dibuka
  useEffect(() => {
    if (!open) return;
    setPath(sections[0] ? [sections[0].uid] : []);
    setAnswers({});
    setErrors({});
    setDone(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const current = useMemo(
    () => sections.find((s) => s.uid === path[path.length - 1]) ?? sections[0],
    [sections, path],
  );

  if (!open || !current) return null;

  const set = (uid: string, v: Answer | undefined) => {
    setAnswers((a) => ({ ...a, [uid]: v }));
    setErrors((e) => {
      if (!e[uid]) return e;
      const { [uid]: _drop, ...rest } = e;
      return rest;
    });
  };

  const check = (section: EditorSection) => {
    const found: Record<string, string> = {};
    for (const it of section.items) {
      if (!isAnswerable(it.type)) continue;
      const v = answers[it.uid];
      const isGridType =
        it.type === "MULTIPLE_CHOICE_GRID" || it.type === "CHECKBOX_GRID";
      if (isGridType && it.config?.requireEachRow) {
        const rows = it.options.filter((o) => o.kind === "GRID_ROW");
        const g = (v ?? {}) as Record<string, string[]>;
        if (rows.some((r) => !(g[r.uid]?.length > 0))) {
          found[it.uid] = "Isi setiap baris";
          continue;
        }
      }
      if (isEmpty(v)) {
        if (it.isRequired) found[it.uid] = "Pertanyaan ini wajib diisi";
        continue;
      }
      if (it.validation && v !== undefined) {
        const msg = ruleError(it.validation, v);
        if (msg) found[it.uid] = msg;
      }
    }
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  // Tujuan setelah section ini: branching jawaban dulu, baru navigasi section
  const nextTarget = (section: EditorSection): string => {
    for (const it of section.items) {
      if (!isBranching(it.type)) continue;
      const picked = answers[it.uid];
      const opt = it.options.find((o) => o.uid === picked);
      if (opt && opt.branchAction === "SUBMIT") return "SUBMIT";
      if (opt && opt.branchAction === "GO_TO_SECTION" && opt.branchSectionRef) {
        return opt.branchSectionRef;
      }
    }
    if (section.nextAction === "SUBMIT") return "SUBMIT";
    if (section.nextAction === "GO_TO_SECTION") {
      return section.nextSectionRef ?? "SUBMIT";
    }
    const idx = sections.findIndex((s) => s.uid === section.uid);
    return sections[idx + 1]?.uid ?? "SUBMIT";
  };

  const goNext = () => {
    if (!check(current)) return;
    const target = nextTarget(current);
    // Pengaman kalau alur membentuk loop
    if (
      target === "SUBMIT" ||
      !sections.some((s) => s.uid === target) ||
      path.length > sections.length * 2
    ) {
      setDone(true);
      return;
    }
    setPath((p) => [...p, target]);
  };

  const goBack = () => setPath((p) => (p.length > 1 ? p.slice(0, -1) : p));
  const isLast = nextTarget(current) === "SUBMIT";

  const renderInput = (it: EditorItem) => {
    const v = answers[it.uid];
    const accent = { accentColor: theme };
    const ring = { "--tw-ring-color": theme } as React.CSSProperties;
    const choices = it.options.filter((o) => o.kind === "CHOICE");
    const cfg = (it.config ?? {}) as Record<string, unknown>;

    switch (it.type) {
      case "SHORT_ANSWER":
        return (
          <input
            type="text"
            value={typeof v === "string" ? v : ""}
            onChange={(e) => set(it.uid, e.target.value)}
            placeholder="Jawaban Anda"
            className={fieldClass}
            style={ring}
          />
        );
      case "PARAGRAPH":
        return (
          <textarea
            rows={3}
            value={typeof v === "string" ? v : ""}
            onChange={(e) => set(it.uid, e.target.value)}
            placeholder="Jawaban Anda"
            className={`${fieldClass} resize-none`}
            style={ring}
          />
        );
      case "MULTIPLE_CHOICE":
        return (
          <div className="space-y-2">
            {choices.map((o) => (
              <label
                key={o.uid}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="radio"
                  name={it.uid}
                  checked={v === o.uid}
                  onChange={() => set(it.uid, o.uid)}
                  style={accent}
                  className="h-4 w-4"
                />
                {o.label}
              </label>
            ))}
          </div>
        );
      case "CHECKBOXES": {
        const arr = Array.isArray(v) ? v : [];
        return (
          <div className="space-y-2">
            {choices.map((o) => (
              <label
                key={o.uid}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={arr.includes(o.uid)}
                  onChange={(e) =>
                    set(
                      it.uid,
                      e.target.checked
                        ? [...arr, o.uid]
                        : arr.filter((x) => x !== o.uid),
                    )
                  }
                  style={accent}
                  className="h-4 w-4"
                />
                {o.label}
              </label>
            ))}
          </div>
        );
      }
      case "DROPDOWN":
        return (
          <select
            value={typeof v === "string" ? v : ""}
            onChange={(e) => set(it.uid, e.target.value || undefined)}
            className={`${fieldClass} sm:w-72`}
            style={ring}
          >
            <option value="">Pilih</option>
            {choices.map((o) => (
              <option key={o.uid} value={o.uid}>
                {o.label}
              </option>
            ))}
          </select>
        );
      case "FILE_UPLOAD":
        return (
          <div className="space-y-1">
            <input
              type="file"
              multiple={Number(cfg.maxFiles ?? 1) > 1}
              onChange={(e) =>
                set(
                  it.uid,
                  Array.from(e.target.files ?? [])
                    .map((f) => f.name)
                    .join(", ") || undefined,
                )
              }
              className="block w-full text-sm text-gray-600"
            />
            <p className="text-xs text-gray-400">
              Maks. {String(cfg.maxFiles ?? 1)} file,{" "}
              {String(cfg.maxSizeMb ?? 10)} MB per file (preview: file tidak
              diunggah)
            </p>
          </div>
        );
      case "LINEAR_SCALE": {
        const min = Number(cfg.min ?? 1);
        const max = Number(cfg.max ?? 5);
        return (
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {typeof cfg.minLabel === "string" && <span>{cfg.minLabel}</span>}
            {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(
              (n) => (
                <label key={n} className="flex flex-col items-center gap-1">
                  <span>{n}</span>
                  <input
                    type="radio"
                    name={it.uid}
                    checked={v === n}
                    onChange={() => set(it.uid, n)}
                    style={accent}
                    className="h-4 w-4"
                  />
                </label>
              ),
            )}
            {typeof cfg.maxLabel === "string" && <span>{cfg.maxLabel}</span>}
          </div>
        );
      }
      case "RATING": {
        const max = Number(cfg.max ?? 5);
        return (
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} bintang`}
                onClick={() => set(it.uid, n)}
                className="text-2xl leading-none"
                style={{
                  color:
                    typeof v === "number" && n <= v ? "#f59e0b" : "#d1d5db",
                }}
              >
                ★
              </button>
            ))}
          </div>
        );
      }
      case "MULTIPLE_CHOICE_GRID":
      case "CHECKBOX_GRID": {
        const rows = it.options.filter((o) => o.kind === "GRID_ROW");
        const cols = it.options.filter((o) => o.kind === "GRID_COLUMN");
        const g = (
          typeof v === "object" && !Array.isArray(v) && v ? v : {}
        ) as Record<string, string[]>;
        const single = it.type === "MULTIPLE_CHOICE_GRID";
        const onePerCol = single && cfg.oneResponsePerColumn === true;
        const toggleCell = (rowUid: string, colUid: string) => {
          const cur = g[rowUid] ?? [];
          let next: Record<string, string[]>;
          if (single) {
            next = { ...g };
            if (onePerCol) {
              for (const r of Object.keys(next)) {
                if (r !== rowUid)
                  next[r] = (next[r] ?? []).filter((c) => c !== colUid);
              }
            }
            next[rowUid] = [colUid];
          } else {
            next = {
              ...g,
              [rowUid]: cur.includes(colUid)
                ? cur.filter((c) => c !== colUid)
                : [...cur, colUid],
            };
          }
          set(it.uid, next);
        };
        return (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[26rem] text-sm text-gray-700 sm:min-w-0">
              <thead>
                <tr>
                  <th />
                  {cols.map((c) => (
                    <th
                      key={c.uid}
                      className="px-2 py-1 text-center text-xs font-medium text-gray-500"
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.uid} className="border-t border-gray-100">
                    <td className="py-2 pr-3">{r.label}</td>
                    {cols.map((c) => (
                      <td key={c.uid} className="px-2 py-2 text-center">
                        <input
                          type={single ? "radio" : "checkbox"}
                          name={`${it.uid}-${r.uid}`}
                          checked={(g[r.uid] ?? []).includes(c.uid)}
                          onChange={() => toggleCell(r.uid, c.uid)}
                          style={accent}
                          className="h-4 w-4"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      case "DATE":
        return (
          <input
            type="date"
            value={typeof v === "string" ? v : ""}
            onChange={(e) => set(it.uid, e.target.value)}
            className={`${fieldClass} sm:w-56`}
            style={ring}
          />
        );
      case "TIME_DURATION":
        return cfg.mode === "duration" ? (
          <input
            type="text"
            value={typeof v === "string" ? v : ""}
            onChange={(e) => set(it.uid, e.target.value)}
            placeholder="HH:mm:ss"
            className={`${fieldClass} sm:w-40`}
            style={ring}
          />
        ) : (
          <input
            type="time"
            value={typeof v === "string" ? v : ""}
            onChange={(e) => set(it.uid, e.target.value)}
            className={`${fieldClass} sm:w-40`}
            style={ring}
          />
        );
      default:
        return null;
    }
  };

  const isEvent = type === "EVENT";

  // Info event diambil dari state editor (belum disimpan pun langsung terlihat)
  const eventInfo: EventInfoPublic | null = isEvent
    ? {
        title: settings.eventTitle.trim() || null,
        description: settings.eventDescription.trim() || null,
        startAt: localToIso(settings.eventStartAt),
        endAt: localToIso(settings.eventEndAt),
        mode: settings.eventMode || null,
        location: settings.eventLocation.trim() || null,
        organizer: settings.eventOrganizer.trim() || null,
        categoryLabel: settings.eventCategoryLabel.trim() || null,
        timeline: settings.eventTimeline
          .filter((t) => t.title.trim())
          .map((t) => ({
            id: t.uid,
            title: t.title.trim(),
            description: t.description.trim() || null,
            date: t.date || null,
            time: t.time.trim() || null,
          })),
        faqs: settings.eventFaqs
          .filter((f) => f.question.trim() && f.answer.trim())
          .map((f) => ({
            id: f.uid,
            question: f.question.trim(),
            answer: f.answer.trim(),
          })),
      }
    : null;

  const formBody = (
    <div
      className={
        isEvent ? "space-y-4" : "mx-auto max-w-2xl space-y-4 px-4 py-6"
      }
    >
      <div
        className="overflow-hidden rounded-xl bg-white shadow-sm"
        style={{ borderTop: `6px solid ${theme}` }}
      >
        {headerSrc && !isEvent && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={headerSrc} alt="" className="h-40 w-full object-cover" />
        )}
        <div className="space-y-1 p-5">
          <h1 className="text-xl font-bold text-gray-900">
            {settings.title || "Judul form"}
          </h1>
          {settings.description && (
            <p className="whitespace-pre-line text-sm text-gray-600">
              {settings.description}
            </p>
          )}
        </div>
      </div>

      {done ? (
        <div className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
          <p className="whitespace-pre-line text-sm text-gray-700">
            {settings.confirmationMessage.trim() ||
              "Jawaban Anda telah direkam."}
          </p>
          <p className="text-xs text-gray-400">
            (Ini hanya preview, tidak ada jawaban yang dikirim.)
          </p>
          <button
            type="button"
            onClick={() => {
              setPath([sections[0].uid]);
              setAnswers({});
              setErrors({});
              setDone(false);
            }}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: theme }}
          >
            Isi ulang
          </button>
        </div>
      ) : (
        <>
          {(current.title.trim() || current.description.trim()) && (
            <div className="rounded-xl bg-white p-5 shadow-sm">
              {current.title.trim() && (
                <h2 className="text-base font-bold text-gray-900">
                  {current.title}
                </h2>
              )}
              {current.description.trim() && (
                <p className="mt-1 text-sm text-gray-600">
                  {current.description}
                </p>
              )}
            </div>
          )}

          {current.items.map((it) => (
            <div
              key={it.uid}
              className="space-y-3 rounded-xl bg-white p-5 shadow-sm"
            >
              {it.type === "TITLE_DESCRIPTION" && (
                <div>
                  {it.title && (
                    <h3 className="text-base font-semibold text-gray-900">
                      {it.title}
                    </h3>
                  )}
                  {it.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {it.description}
                    </p>
                  )}
                </div>
              )}
              {it.type === "IMAGE" && Boolean(it.config?.url) && (
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaSrc(String(it.config?.url))}
                    alt={String(it.config?.caption ?? "")}
                    style={{
                      width: `${Number(it.config?.widthPercent ?? 100)}%`,
                    }}
                    className="rounded-md"
                  />
                  {Boolean(it.config?.caption) && (
                    <figcaption className="mt-1 text-xs text-gray-500">
                      {String(it.config?.caption)}
                    </figcaption>
                  )}
                </figure>
              )}
              {it.type === "VIDEO" && Boolean(it.config?.url) && (
                <figure>
                  {String(it.config?.url).startsWith("/uploads/") ? (
                    <video
                      src={mediaSrc(String(it.config?.url))}
                      controls
                      className="w-full rounded-md"
                    />
                  ) : (
                    <a
                      href={String(it.config?.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-sm underline"
                      style={{ color: theme }}
                    >
                      {String(it.config?.url)}
                    </a>
                  )}
                  {Boolean(it.config?.caption) && (
                    <figcaption className="mt-1 text-xs text-gray-500">
                      {String(it.config?.caption)}
                    </figcaption>
                  )}
                </figure>
              )}

              {isAnswerable(it.type) && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {it.title || "(pertanyaan tanpa judul)"}
                      {it.isRequired && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                    </p>
                    {it.description && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {it.description}
                      </p>
                    )}
                  </div>
                  {renderInput(it)}
                  {errors[it.uid] && (
                    <p className="text-xs text-red-600">{errors[it.uid]}</p>
                  )}
                </>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={path.length <= 1}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={goNext}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: theme }}
            >
              {isLast ? "Kirim (preview)" : "Lanjut"}
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto"
      style={{
        backgroundColor: bg,
        fontFamily: fontStack(settings.fontPreset),
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Preview form"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-gray-900 px-3 py-2 text-xs text-white sm:px-4 sm:text-sm">
        <span>
          Mode preview. Jawaban tidak disimpan sebagai response production.
        </span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium hover:bg-white/10"
        >
          <X className="h-4 w-4" />
          Tutup preview
        </button>
      </div>

      {isEvent ? (
        <EventShell
          themeColor={theme}
          backgroundColor={bg}
          fontFamily={fontStack(settings.fontPreset)}
          fallbackTitle={settings.title || "Judul form"}
          bannerSrc={headerSrc}
          info={eventInfo}
          embedded
          formCard={false}
          focusFormKey={done ? "done" : current.uid}
        >
          {formBody}
        </EventShell>
      ) : (
        formBody
      )}
    </div>
  );
}
