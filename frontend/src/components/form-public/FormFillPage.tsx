"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  AlertCircle,
  CalendarClock,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Lock,
  LogIn,
  PencilLine,
  SearchX,
  Users,
} from "lucide-react";
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_THEME_COLOR,
  fontStack,
} from "@/components/admin/form-builder/formTheme";
import {
  getApiErrorMessage,
  resolveImageUrl,
} from "@/components/admin/form-builder/shared";
import { useAuth } from "@/context/AuthContext";
// Modal login & daftar yang sama dengan di Navbar.
// Sesuaikan path import kalau LoginModal/RegisterModal ada di folder lain.
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";
// Sesuaikan path kalau Navbar/Footer ada di folder lain.
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventShell, {
  type EventInfoPublic,
} from "@/components/admin/form-builder/EventShell";
import NonEventShell, { ShellCard } from "./NonEventShell";
import QuestionField, {
  isAnswerable,
  isFileValue,
  type ExistingFile,
  type FieldValue,
  type NavAction,
  type PublicItem,
  type ValidationRule,
} from "./QuestionField";

// ─── Konfigurasi ────────────────────────────────────────────────────────────

const PUBLIC_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/formpublic`;
const HEX = /^#[0-9a-fA-F]{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Tipe data ──────────────────────────────────────────────────────────────

interface PublicSection {
  id: string;
  title: string | null;
  description: string | null;
  nextAction: NavAction;
  nextSectionId: string | null;
  items: PublicItem[];
}

interface PublicForm {
  id: string;
  slug: string;
  type: "EVENT" | "NON_EVENT";
  title: string;
  description: string | null;
  event: { id: string; name: string | null } | null;
  eventInfo?: EventInfoPublic | null;
  theme: {
    headerImage: string | null;
    themeColor: string | null;
    backgroundColor: string | null;
    fontPreset: string | null;
  };
  settings: {
    responderAccess: "ANYONE_WITH_LINK" | "LOGIN_REQUIRED";
    collectEmail: boolean;
    allowEditResponse: boolean;
    allowResponderDraft: boolean;
    shuffleQuestionOrder: boolean;
    confirmationMessage: string | null;
  };
  sections: PublicSection[];
}

interface Availability {
  isOpen: boolean;
  reason?: string;
  message?: string;
}

interface UserState {
  hasSubmitted: boolean;
  submittedResponseId: string | null;
  canEditResponse: boolean;
  isBlocked: boolean;
  draftResponseId: string | null;
}

// Jawaban milik responder (GET response sendiri / draft)
interface OwnAnswer {
  itemId: string;
  text: string | null;
  number: number | null;
  date: string | null;
  optionIds: string[];
  grid: { rowId: string; optionIds: string[] }[];
  files: ExistingFile[];
}
interface OwnResponse {
  id: string;
  respondentEmail: string | null;
  answers: OwnAnswer[];
}

interface PayloadAnswer {
  itemId: string;
  text?: string;
  number?: number;
  date?: string;
  optionIds?: string[];
  grid?: { rowId: string; optionIds: string[] }[];
  keepFileIds?: string[];
}

interface SubmitResult {
  responseId: string;
  submittedAt: string | null;
  editToken: string | null;
  confirmationMessage: string | null;
}

type Values = Record<string, FieldValue | undefined>;
type Errors = Record<string, string>;

type Screen =
  | { kind: "loading" }
  | { kind: "notFound" }
  | { kind: "login"; title?: string }
  | { kind: "closed"; reason?: string; message: string }
  | { kind: "blocked"; responseId: string | null; canEdit: boolean }
  | { kind: "error"; message: string }
  | { kind: "form" }
  | { kind: "done"; result: SubmitResult; wasEdit: boolean };

// ─── Helper ─────────────────────────────────────────────────────────────────

// Acak stabil selama halaman terbuka (urutan tidak loncat saat re-render)
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function newKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
  return `${date}, ${time} WIB`;
}

const isGridType = (t: PublicItem["type"]) =>
  t === "MULTIPLE_CHOICE_GRID" || t === "CHECKBOX_GRID";

// Sama seperti aturan validasi di backend (pesan error disamakan)
function applyRule(
  rule: ValidationRule | null,
  ctx: { text?: string; count?: number },
): string | null {
  if (!rule) return null;
  const msg = (fallback: string) => rule.message || fallback;
  const min = Number(rule.min);
  const max = Number(rule.max);
  const val = Number(rule.value);

  switch (rule.kind) {
    case "number": {
      const raw = (ctx.text ?? "").trim().replace(",", ".");
      const n = Number(raw);
      if (raw === "" || !Number.isFinite(n)) return msg("Harus berupa angka");
      switch (rule.op) {
        case "between":
          return n >= min && n <= max
            ? null
            : msg(`Angka harus antara ${min} dan ${max}`);
        case "notBetween":
          return n < min || n > max
            ? null
            : msg(`Angka tidak boleh antara ${min} dan ${max}`);
        case "gt":
          return n > val ? null : msg(`Angka harus lebih besar dari ${val}`);
        case "gte":
          return n >= val ? null : msg(`Angka harus minimal ${val}`);
        case "lt":
          return n < val ? null : msg(`Angka harus lebih kecil dari ${val}`);
        case "lte":
          return n <= val ? null : msg(`Angka harus maksimal ${val}`);
        case "eq":
          return n === val ? null : msg(`Angka harus sama dengan ${val}`);
        case "neq":
          return n !== val ? null : msg(`Angka tidak boleh ${val}`);
        case "integer":
          return Number.isInteger(n)
            ? null
            : msg("Harus berupa bilangan bulat");
      }
      return null;
    }
    case "text": {
      const text = ctx.text ?? "";
      const lower = text.toLowerCase();
      const needle = String(rule.value ?? "").toLowerCase();
      switch (rule.op) {
        case "contains":
          return lower.includes(needle)
            ? null
            : msg(`Harus mengandung "${rule.value}"`);
        case "notContains":
          return !lower.includes(needle)
            ? null
            : msg(`Tidak boleh mengandung "${rule.value}"`);
        case "email":
          return EMAIL_RE.test(text) ? null : msg("Format email tidak valid");
        case "url":
          try {
            const u = new URL(text);
            return u.protocol === "http:" || u.protocol === "https:"
              ? null
              : msg("URL harus diawali http:// atau https://");
          } catch {
            return msg("Format URL tidak valid");
          }
      }
      return null;
    }
    case "length": {
      const len = (ctx.text ?? "").length;
      if (rule.op === "min" && len < val) return msg(`Minimal ${val} karakter`);
      if (rule.op === "max" && len > val)
        return msg(`Maksimal ${val} karakter`);
      return null;
    }
    case "regex": {
      let re: RegExp;
      try {
        re = new RegExp(String(rule.value));
      } catch {
        return null; // regex rusak: jangan blokir responder
      }
      const ok = re.test(ctx.text ?? "");
      if (rule.op === "notMatches")
        return ok ? msg("Format jawaban tidak sesuai") : null;
      return ok ? null : msg("Format jawaban tidak sesuai");
    }
    case "selectCount": {
      const count = ctx.count ?? 0;
      if (rule.op === "atLeast" && count < val)
        return msg(`Pilih minimal ${val}`);
      if (rule.op === "atMost" && count > val)
        return msg(`Pilih maksimal ${val}`);
      if (rule.op === "exactly" && count !== val)
        return msg(`Pilih tepat ${val}`);
      return null;
    }
  }
  return null;
}

function isEmptyValue(v: FieldValue | undefined): boolean {
  if (v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  if (typeof v === "number") return false;
  if (Array.isArray(v)) return v.length === 0;
  if (isFileValue(v)) return v.files.length === 0 && v.keep.length === 0;
  return Object.values(v).every((arr) => arr.length === 0);
}

// Cek satu pertanyaan; null = valid
function validateItem(
  item: PublicItem,
  v: FieldValue | undefined,
): string | null {
  if (!isAnswerable(item.type)) return null;
  const empty = isEmptyValue(v);
  if (empty) return item.isRequired ? "Pertanyaan ini wajib diisi" : null;

  const cfg = (item.config ?? {}) as Record<string, unknown>;

  switch (item.type) {
    case "SHORT_ANSWER":
    case "PARAGRAPH": {
      const text = String(v).trim();
      const limit = item.type === "SHORT_ANSWER" ? 1000 : 10000;
      if (text.length > limit) return `Maksimal ${limit} karakter`;
      return applyRule(item.validation, { text });
    }
    case "TIME_DURATION": {
      const text = String(v).trim();
      const m = /^(\d{1,3}):([0-5]\d)(?::([0-5]\d))?$/.exec(text);
      if (!m) return "Format harus HH:mm atau HH:mm:ss";
      if ((cfg.mode ?? "time") === "time" && Number(m[1]) > 23) {
        return "Jam harus antara 00 dan 23";
      }
      return null;
    }
    case "CHECKBOXES":
      return applyRule(item.validation, {
        count: Array.isArray(v) ? v.length : 0,
      });
    case "MULTIPLE_CHOICE_GRID":
    case "CHECKBOX_GRID": {
      const g = (v ?? {}) as Record<string, string[]>;
      if (cfg.requireEachRow) {
        const rows = item.options.filter((o) => o.kind === "GRID_ROW");
        if (rows.some((r) => !(g[r.id]?.length > 0))) {
          return "Setiap baris wajib diisi";
        }
      }
      if (item.type === "MULTIPLE_CHOICE_GRID" && cfg.oneResponsePerColumn) {
        const used = Object.values(g).flat();
        if (new Set(used).size !== used.length) {
          return "Setiap kolom hanya boleh dipilih satu kali";
        }
      }
      return null;
    }
    case "FILE_UPLOAD": {
      if (!isFileValue(v)) return null;
      const maxFiles = Number(cfg.maxFiles ?? 1);
      const maxMb = Number(cfg.maxSizeMb ?? 10);
      if (v.files.length + v.keep.length > maxFiles) {
        return `Maksimal ${maxFiles} file`;
      }
      if (v.files.some((f) => f.size > maxMb * 1024 * 1024)) {
        return `Ukuran file maksimal ${maxMb} MB`;
      }
      return null;
    }
  }
  return null;
}

// Ubah nilai satu pertanyaan ke format payload backend
function buildAnswer(
  item: PublicItem,
  v: FieldValue | undefined,
): { answer: PayloadAnswer; files: File[] } | null {
  if (!isAnswerable(item.type) || isEmptyValue(v)) return null;
  const answer: PayloadAnswer = { itemId: item.id };

  switch (item.type) {
    case "SHORT_ANSWER":
    case "PARAGRAPH":
    case "TIME_DURATION":
      answer.text = String(v).trim();
      return { answer, files: [] };
    case "DATE":
      answer.date = String(v);
      return { answer, files: [] };
    case "LINEAR_SCALE":
    case "RATING":
      answer.number = Number(v);
      return { answer, files: [] };
    case "MULTIPLE_CHOICE":
    case "DROPDOWN":
      answer.optionIds = [String(v)];
      return { answer, files: [] };
    case "CHECKBOXES":
      answer.optionIds = Array.isArray(v) ? (v as string[]) : [];
      return { answer, files: [] };
    case "MULTIPLE_CHOICE_GRID":
    case "CHECKBOX_GRID": {
      const g = (v ?? {}) as Record<string, string[]>;
      answer.grid = Object.entries(g)
        .filter(([, ids]) => ids.length > 0)
        .map(([rowId, optionIds]) => ({ rowId, optionIds }));
      return { answer, files: [] };
    }
    case "FILE_UPLOAD": {
      if (!isFileValue(v)) return null;
      answer.keepFileIds = v.keep.map((f) => f.id);
      return { answer, files: v.files };
    }
  }
  return null;
}

// Isi jawaban dari data server (edit response / draft)
function ownAnswersToValues(form: PublicForm, answers: OwnAnswer[]): Values {
  const itemById = new Map<string, PublicItem>();
  for (const s of form.sections)
    for (const it of s.items) itemById.set(it.id, it);

  const out: Values = {};
  for (const a of answers) {
    const item = itemById.get(a.itemId);
    if (!item) continue;
    switch (item.type) {
      case "SHORT_ANSWER":
      case "PARAGRAPH":
      case "TIME_DURATION":
        if (a.text) out[item.id] = a.text;
        break;
      case "DATE":
        if (a.date) out[item.id] = a.date;
        break;
      case "LINEAR_SCALE":
      case "RATING":
        if (a.number != null) out[item.id] = a.number;
        break;
      case "MULTIPLE_CHOICE":
      case "DROPDOWN":
        if (a.optionIds[0]) out[item.id] = a.optionIds[0];
        break;
      case "CHECKBOXES":
        if (a.optionIds.length) out[item.id] = a.optionIds;
        break;
      case "MULTIPLE_CHOICE_GRID":
      case "CHECKBOX_GRID": {
        const g: Record<string, string[]> = {};
        for (const row of a.grid)
          if (row.optionIds.length) g[row.rowId] = row.optionIds;
        if (Object.keys(g).length) out[item.id] = g;
        break;
      }
      case "FILE_UPLOAD":
        if (a.files.length) out[item.id] = { files: [], keep: a.files };
        break;
    }
  }
  return out;
}

// ─── Komponen kecil ─────────────────────────────────────────────────────────

function Notice({
  icon,
  title,
  message,
  themeColor,
  children,
}: {
  icon: ReactNode;
  title: string;
  message?: string;
  themeColor: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: `${themeColor}18`, color: themeColor }}
      >
        {icon}
      </div>
      <h1 className="mt-4 text-lg font-bold text-gray-900">{title}</h1>
      {message && (
        <p className="mt-2 max-w-sm whitespace-pre-line text-sm text-gray-500">
          {message}
        </p>
      )}
      {children && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Halaman utama ──────────────────────────────────────────────────────────

export default function FormFillPage() {
  const params = useParams();
  const search = useSearchParams();
  const slug = String(params?.slug ?? "");
  const qResponseId = search.get("responseId");
  const qEditToken = search.get("editToken");

  const [screen, setScreen] = useState<Screen>({ kind: "loading" });
  const [form, setForm] = useState<PublicForm | null>(null);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  // Login / daftar lewat modal (tidak ada Navbar di halaman form)
  const { currentUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Errors>({});
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [editing, setEditing] = useState<{
    responseId: string;
    token: string | null;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [draftStatus, setDraftStatus] = useState<{
    state: "idle" | "saving" | "saved" | "error";
    at?: string;
  }>({ state: "idle" });
  const [copied, setCopied] = useState(false);

  const idemKey = useRef(newKey());
  const autoOpenedLogin = useRef(false);
  const reloadedAfterLogin = useRef(false);
  const dirty = useRef(false);
  const seed = useRef(Math.floor(Math.random() * 2 ** 31));

  // ── Tema ──
  const themeColor =
    form?.theme.themeColor && HEX.test(form.theme.themeColor)
      ? form.theme.themeColor
      : DEFAULT_THEME_COLOR;
  const backgroundColor =
    form?.theme.backgroundColor && HEX.test(form.theme.backgroundColor)
      ? form.theme.backgroundColor
      : DEFAULT_BACKGROUND_COLOR;
  const fontFamily = fontStack(form?.theme.fontPreset);
  const headerSrc = resolveImageUrl(form?.theme.headerImage);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // ── Isi form dari jawaban lama (edit / draft) ──
  const applyOwnResponse = (f: PublicForm, r: OwnResponse) => {
    setValues(ownAnswersToValues(f, r.answers));
    setEmail(r.respondentEmail ?? "");
    setErrors({});
    setEmailError(null);
    setResetKey((k) => k + 1);
    dirty.current = false;
  };

  const fetchOwnResponse = async (
    f: PublicForm,
    responseId: string,
    token: string | null,
    signal?: AbortSignal,
  ) => {
    const res = await axios.get(
      `${PUBLIC_API}/forms/${slug}/responses/${responseId}`,
      {
        params: token ? { editToken: token } : undefined,
        withCredentials: true,
        signal,
      },
    );
    applyOwnResponse(f, res.data?.data ?? res.data);
  };

  useEffect(() => setMounted(true), []);

  // Form wajib login: langsung munculkan modal login (sekali per kunjungan)
  useEffect(() => {
    if (screen.kind === "login" && !currentUser && !autoOpenedLogin.current) {
      autoOpenedLogin.current = true;
      setLoginOpen(true);
    }
  }, [screen.kind, currentUser]);

  // Setelah login lewat modal, muat ulang form supaya server mengenali akunnya.
  // Tidak dilakukan kalau responder sedang mengetik jawaban (jawaban tidak hilang).
  useEffect(() => {
    if (!currentUser) {
      reloadedAfterLogin.current = false;
      return;
    }
    if (userState || reloadedAfterLogin.current) return;
    const canReload =
      screen.kind === "login" || (screen.kind === "form" && !dirty.current);
    if (!canReload) return;
    reloadedAfterLogin.current = true;
    setLoginOpen(false);
    setRegisterOpen(false);
    setReloadTick((n) => n + 1);
  }, [currentUser, userState, screen.kind]);

  // ── Muat form ──
  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      setScreen({ kind: "loading" });
      try {
        const res = await axios.get(`${PUBLIC_API}/forms/${slug}`, {
          withCredentials: true,
          signal,
        });
        const d = res.data?.data ?? res.data;
        const f: PublicForm = d.form;
        const av: Availability = d.availability;
        const us: UserState | null = d.userState ?? null;
        setForm(f);
        setUserState(us);
        setPath(f.sections[0] ? [f.sections[0].id] : []);
        setValues({});
        setErrors({});
        setEmail("");
        setEmailError(null);
        setEditing(null);
        setResetKey((k) => k + 1);
        dirty.current = false;

        // Mode edit (dari link email atau tombol "Edit jawaban")
        if (qResponseId) {
          if (!f.settings.allowEditResponse) {
            setScreen({
              kind: "error",
              message: "Form ini tidak mengizinkan edit jawaban.",
            });
            return;
          }
          // Limit responden tidak berlaku untuk edit
          if (!av.isOpen && av.reason !== "LIMIT_REACHED") {
            setScreen({
              kind: "closed",
              reason: av.reason,
              message: av.message ?? "Form ini sedang tidak menerima respons.",
            });
            return;
          }
          try {
            await fetchOwnResponse(f, qResponseId, qEditToken, signal);
          } catch (err) {
            if (axios.isCancel(err)) return;
            setScreen({
              kind: "error",
              message: getApiErrorMessage(
                err,
                "Link edit tidak valid atau sudah tidak berlaku",
              ),
            });
            return;
          }
          setEditing({ responseId: qResponseId, token: qEditToken });
          setScreen({ kind: "form" });
          return;
        }

        if (us?.isBlocked) {
          setScreen({
            kind: "blocked",
            responseId: us.submittedResponseId,
            canEdit: false,
          });
          return;
        }

        if (!av.isOpen) {
          setScreen({
            kind: "closed",
            reason: av.reason,
            message: av.message ?? "Form ini sedang tidak menerima respons.",
          });
          return;
        }

        // Lanjutkan draft autosave (hanya responder yang login)
        if (us && f.settings.allowResponderDraft && us.draftResponseId) {
          try {
            const dr = await axios.get(`${PUBLIC_API}/forms/${slug}/draft`, {
              withCredentials: true,
              signal,
            });
            const draft: OwnResponse | null = dr.data?.data ?? dr.data;
            if (draft && draft.answers) {
              applyOwnResponse(f, draft);
              toast.success("Draft sebelumnya dipulihkan");
            }
          } catch (err) {
            if (axios.isCancel(err)) return;
            /* draft gagal dimuat: lanjut dengan form kosong */
          }
        }

        setScreen({ kind: "form" });
      } catch (err) {
        if (axios.isCancel(err)) return;
        const status = axios.isAxiosError(err)
          ? err.response?.status
          : undefined;
        const data = axios.isAxiosError(err)
          ? (err.response?.data as
              | { code?: string; details?: { title?: string } }
              | undefined)
          : undefined;
        if (status === 404) setScreen({ kind: "notFound" });
        else if (status === 401 && data?.code === "LOGIN_REQUIRED") {
          setScreen({ kind: "login", title: data.details?.title });
        } else {
          setScreen({
            kind: "error",
            message: getApiErrorMessage(err, "Gagal memuat form"),
          });
        }
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, qResponseId, qEditToken, reloadTick]);

  // ── Susunan tampilan (acak urutan pertanyaan / pilihan jika diatur) ──
  const displaySections = useMemo(() => {
    if (!form) return new Map<string, PublicSection>();
    const rand = mulberry32(seed.current);
    const out = new Map<string, PublicSection>();
    for (const s of form.sections) {
      let items = s.items.map((it) => {
        if (!it.shuffleOptions) return it;
        if (
          it.type === "MULTIPLE_CHOICE" ||
          it.type === "CHECKBOXES" ||
          it.type === "DROPDOWN"
        ) {
          return { ...it, options: shuffled(it.options, rand) };
        }
        if (isGridType(it.type)) {
          const rows = it.options.filter((o) => o.kind === "GRID_ROW");
          const rest = it.options.filter((o) => o.kind !== "GRID_ROW");
          return { ...it, options: [...shuffled(rows, rand), ...rest] };
        }
        return it;
      });
      if (form.settings.shuffleQuestionOrder) {
        // Hanya pertanyaan yang diacak; judul/gambar/video tetap di tempatnya
        const slots = items
          .map((it, i) => (isAnswerable(it.type) ? i : -1))
          .filter((i) => i >= 0);
        const mixed = shuffled(
          slots.map((i) => items[i]),
          rand,
        );
        items = [...items];
        slots.forEach((slot, k) => {
          items[slot] = mixed[k];
        });
      }
      out.set(s.id, { ...s, items });
    }
    return out;
  }, [form]);

  const sectionById = useMemo(
    () => new Map((form?.sections ?? []).map((s) => [s.id, s])),
    [form],
  );
  const currentId = path[path.length - 1];
  const current = currentId ? sectionById.get(currentId) : undefined;
  const display = currentId ? displaySections.get(currentId) : undefined;

  // ── Alur section: jawaban bercabang lebih dulu, lalu navigasi section ──
  const nextTarget = (section: PublicSection): string => {
    if (!form) return "SUBMIT";
    for (const it of section.items) {
      if (it.type !== "MULTIPLE_CHOICE" && it.type !== "DROPDOWN") continue;
      const picked = values[it.id];
      if (typeof picked !== "string" || !picked) continue;
      const opt = it.options.find((o) => o.id === picked);
      if (opt && opt.branchAction !== "NEXT") {
        if (opt.branchAction === "SUBMIT") return "SUBMIT";
        return opt.branchSectionId && sectionById.has(opt.branchSectionId)
          ? opt.branchSectionId
          : "SUBMIT";
      }
    }
    if (section.nextAction === "SUBMIT") return "SUBMIT";
    if (section.nextAction === "GO_TO_SECTION") {
      return section.nextSectionId && sectionById.has(section.nextSectionId)
        ? section.nextSectionId
        : "SUBMIT";
    }
    const idx = form.sections.findIndex((s) => s.id === section.id);
    return form.sections[idx + 1]?.id ?? "SUBMIT";
  };

  const isLast = current ? nextTarget(current) === "SUBMIT" : true;
  const isFirst = path.length <= 1;

  // ── Ubah nilai ──
  const setValue = (itemId: string, v: FieldValue | undefined) => {
    dirty.current = true;
    setValues((prev) => ({ ...prev, [itemId]: v }));
    setErrors((prev) => {
      if (!prev[itemId]) return prev;
      const { [itemId]: _drop, ...rest } = prev;
      return rest;
    });
  };

  const scrollToFirstError = (found: Errors, emailErr: string | null) => {
    requestAnimationFrame(() => {
      const target = emailErr
        ? document.getElementById("field-email")
        : document.getElementById(`q-${Object.keys(found)[0]}`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  // ── Validasi satu section (+ email di section pertama) ──
  const validateSection = (section: PublicSection): boolean => {
    const found: Errors = {};
    for (const it of section.items) {
      const msg = validateItem(it, values[it.id]);
      if (msg) found[it.id] = msg;
    }
    let emailErr: string | null = null;
    if (form?.settings.collectEmail && path[0] === section.id) {
      const trimmed = email.trim();
      if (!trimmed) {
        // Responder login boleh kosong: backend memakai email akunnya
        if (!userState) emailErr = "Email wajib diisi";
      } else if (!EMAIL_RE.test(trimmed)) {
        emailErr = "Format email tidak valid";
      }
    }
    setErrors(found);
    setEmailError(emailErr);
    if (Object.keys(found).length > 0 || emailErr) {
      scrollToFirstError(found, emailErr);
      return false;
    }
    return true;
  };

  // ── Kirim ──
  const submit = async () => {
    if (!form || submitting) return;
    setSubmitting(true);
    try {
      const visited = new Set(path);
      const answers: PayloadAnswer[] = [];
      const files: { itemId: string; file: File }[] = [];
      for (const s of form.sections) {
        if (!visited.has(s.id)) continue;
        for (const it of s.items) {
          const built = buildAnswer(it, values[it.id]);
          if (!built) continue;
          answers.push(built.answer);
          built.files.forEach((file) => files.push({ itemId: it.id, file }));
        }
      }

      const body: Record<string, unknown> = {
        answers,
        ...(email.trim() ? { email: email.trim().toLowerCase() } : {}),
        ...(editing ? {} : { idempotencyKey: idemKey.current }),
      };

      let data: Record<string, unknown> | FormData = body;
      if (files.length > 0) {
        const fd = new FormData();
        fd.append("payload", JSON.stringify(body));
        files.forEach(({ itemId, file }) => fd.append(`file:${itemId}`, file));
        data = fd;
      }

      const res = await axios.request({
        url: editing
          ? `${PUBLIC_API}/forms/${slug}/responses/${editing.responseId}`
          : `${PUBLIC_API}/forms/${slug}/responses`,
        method: editing ? "put" : "post",
        params: editing?.token ? { editToken: editing.token } : undefined,
        data,
        withCredentials: true,
      });

      const d = (res.data?.data ?? res.data) as Record<string, unknown>;
      dirty.current = false;
      setScreen({
        kind: "done",
        wasEdit: !!editing,
        result: {
          responseId: String(d.responseId ?? d.id ?? editing?.responseId ?? ""),
          submittedAt: (d.submittedAt as string | null) ?? null,
          editToken: (d.editToken as string | null) ?? editing?.token ?? null,
          confirmationMessage: (d.confirmationMessage as string | null) ?? null,
        },
      });
      scrollTop();
    } catch (err) {
      handleSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitError = (err: unknown) => {
    if (!axios.isAxiosError(err) || !err.response) {
      toast.error("Koneksi bermasalah. Coba kirim lagi.");
      return;
    }
    const { status, data } = err.response as {
      status: number;
      data?: {
        message?: string;
        code?: string;
        details?: unknown;
      };
    };
    const code = data?.code;

    if (status === 400 && code === "VALIDATION_FAILED") {
      const list = Array.isArray(data?.details)
        ? (data.details as {
            itemId?: string;
            field?: string;
            message: string;
          }[])
        : [];
      const found: Errors = {};
      let emailErr: string | null = null;
      for (const e of list) {
        if (e.itemId) found[e.itemId] = e.message;
        else if (e.field === "email") emailErr = e.message;
      }
      setErrors(found);
      setEmailError(emailErr);

      // Kalau ada error di section sebelumnya, kembali ke section itu
      if (form) {
        const first = Object.keys(found)[0];
        const sec = form.sections.find((s) =>
          s.items.some((i) => i.id === first),
        );
        const at = sec ? path.indexOf(sec.id) : -1;
        if (at >= 0 && at < path.length - 1) setPath((p) => p.slice(0, at + 1));
      }
      if (Object.keys(found).length || emailErr) {
        scrollToFirstError(found, emailErr);
        toast.error("Ada jawaban yang belum valid. Periksa lagi isian kamu.");
      } else {
        toast.error(data?.message ?? "Jawaban belum valid");
      }
      return;
    }

    if (status === 409 && code === "ALREADY_SUBMITTED") {
      const det = (data?.details ?? {}) as {
        responseId?: string;
        canEdit?: boolean;
      };
      setScreen({
        kind: "blocked",
        responseId: det.responseId ?? null,
        canEdit: !!det.canEdit,
      });
      return;
    }

    if (
      (status === 403 || status === 409) &&
      (code === "MANUALLY_CLOSED" ||
        code === "NOT_YET_OPEN" ||
        code === "PERIOD_ENDED" ||
        code === "LIMIT_REACHED")
    ) {
      setScreen({
        kind: "closed",
        reason: code,
        message: data?.message ?? "Form ini sedang tidak menerima respons.",
      });
      return;
    }

    if (status === 401) {
      setScreen({ kind: "login" });
      return;
    }

    toast.error(getApiErrorMessage(err, "Gagal mengirim jawaban"));
  };

  // ── Navigasi section ──
  const goNext = () => {
    if (!current || submitting) return;
    if (!validateSection(current)) return;
    const target = nextTarget(current);
    if (target === "SUBMIT") {
      submit();
      return;
    }
    if (path.includes(target)) {
      toast.error("Alur section form ini tidak valid. Hubungi pembuat form.");
      return;
    }
    setPath((p) => [...p, target]);
    scrollTop();
  };

  const goBack = () => {
    setErrors({});
    setEmailError(null);
    setPath((p) => (p.length > 1 ? p.slice(0, -1) : p));
    scrollTop();
  };

  // ── Mulai edit jawaban yang sudah dikirim ──
  const startEdit = async (responseId: string, token: string | null) => {
    if (!form) return;
    setScreen({ kind: "loading" });
    try {
      await fetchOwnResponse(form, responseId, token);
      setEditing({ responseId, token });
      setPath(form.sections[0] ? [form.sections[0].id] : []);
      setScreen({ kind: "form" });
      scrollTop();
    } catch (err) {
      setScreen({
        kind: "error",
        message: getApiErrorMessage(err, "Gagal memuat jawaban kamu"),
      });
    }
  };

  const resetForNewResponse = () => {
    if (!form) return;
    setValues({});
    setErrors({});
    setEmail("");
    setEmailError(null);
    setEditing(null);
    setPath(form.sections[0] ? [form.sections[0].id] : []);
    setResetKey((k) => k + 1);
    setDraftStatus({ state: "idle" });
    idemKey.current = newKey();
    dirty.current = false;
    setScreen({ kind: "form" });
    scrollTop();
  };

  // ── Draft autosave (hanya responder login + form mengaktifkan draft) ──
  const canDraft =
    !!userState && !!form?.settings.allowResponderDraft && !editing;

  useEffect(() => {
    if (
      !canDraft ||
      submitting ||
      screen.kind !== "form" ||
      !dirty.current ||
      !form
    )
      return;
    const timer = setTimeout(async () => {
      setDraftStatus({ state: "saving" });
      try {
        const answers: PayloadAnswer[] = [];
        for (const s of form.sections) {
          for (const it of s.items) {
            if (it.type === "FILE_UPLOAD") continue; // file tidak ikut draft
            const built = buildAnswer(it, values[it.id]);
            if (built) answers.push(built.answer);
          }
        }
        await axios.put(
          `${PUBLIC_API}/forms/${slug}/draft`,
          {
            answers,
            ...(EMAIL_RE.test(email.trim())
              ? { email: email.trim().toLowerCase() }
              : {}),
          },
          { withCredentials: true },
        );
        dirty.current = false;
        setDraftStatus({
          state: "saved",
          at: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jakarta",
          }),
        });
      } catch {
        setDraftStatus({ state: "error" });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [values, email, canDraft, submitting, screen.kind, form, slug]);

  // Peringatan sebelum menutup halaman kalau ada isian yang belum dikirim
  useEffect(() => {
    if (screen.kind !== "form") return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty.current || canDraft) return;
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [screen.kind, canDraft]);

  const copyEditLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const primaryBtn =
    "inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto sm:py-2.5";
  const outlineBtn =
    "inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:w-auto sm:py-2.5";

  const renderBody = () => {
    switch (screen.kind) {
      case "loading":
        return (
          <div className="flex flex-col items-center gap-3 py-12 text-sm text-gray-500">
            <Loader2
              className="h-6 w-6 animate-spin"
              style={{ color: themeColor }}
            />
            Memuat form...
          </div>
        );

      case "notFound":
        return (
          <Notice
            themeColor={themeColor}
            icon={<SearchX className="h-7 w-7" />}
            title="Form tidak ditemukan"
            message="Link form ini salah, belum dipublikasikan, atau sudah tidak tersedia. Periksa kembali link yang kamu terima."
          />
        );

      case "login":
        return (
          <Notice
            themeColor={themeColor}
            icon={<LogIn className="h-7 w-7" />}
            title="Login diperlukan"
            message={`${screen.title ? `Form "${screen.title}" ` : "Form ini "}hanya bisa diisi oleh pengguna yang sudah login.`}
          >
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className={primaryBtn}
              style={{ backgroundColor: themeColor }}
            >
              <LogIn className="h-4 w-4" />
              Masuk untuk mengisi
            </button>
            <button
              type="button"
              onClick={() => setRegisterOpen(true)}
              className={outlineBtn}
            >
              Daftar akun
            </button>
          </Notice>
        );

      case "closed": {
        const titles: Record<string, string> = {
          NOT_YET_OPEN: "Form belum dibuka",
          PERIOD_ENDED: "Periode pengisian berakhir",
          LIMIT_REACHED: "Kuota responden terpenuhi",
          MANUALLY_CLOSED: "Form sedang ditutup",
        };
        const icon =
          screen.reason === "NOT_YET_OPEN" ||
          screen.reason === "PERIOD_ENDED" ? (
            <CalendarClock className="h-7 w-7" />
          ) : screen.reason === "LIMIT_REACHED" ? (
            <Users className="h-7 w-7" />
          ) : (
            <Lock className="h-7 w-7" />
          );
        return (
          <Notice
            themeColor={themeColor}
            icon={icon}
            title={titles[screen.reason ?? ""] ?? "Form tidak menerima respons"}
            message={screen.message}
          />
        );
      }

      case "blocked":
        return (
          <Notice
            themeColor={themeColor}
            icon={<CheckCircle2 className="h-7 w-7" />}
            title="Kamu sudah mengisi form ini"
            message={
              screen.canEdit
                ? "Jawaban kamu sudah kami terima. Kamu masih bisa mengubahnya."
                : "Form ini hanya bisa diisi satu kali per akun."
            }
          >
            {screen.canEdit && screen.responseId && (
              <button
                type="button"
                onClick={() => startEdit(screen.responseId!, null)}
                className={primaryBtn}
                style={{ backgroundColor: themeColor }}
              >
                <PencilLine className="h-4 w-4" />
                Edit jawaban
              </button>
            )}
          </Notice>
        );

      case "error":
        return (
          <Notice
            themeColor={themeColor}
            icon={<AlertCircle className="h-7 w-7" />}
            title="Terjadi kendala"
            message={screen.message}
          >
            <button
              type="button"
              onClick={() => setReloadTick((n) => n + 1)}
              className={outlineBtn}
            >
              Coba lagi
            </button>
          </Notice>
        );

      case "done": {
        const f = form!;
        const r = screen.result;
        const message =
          r.confirmationMessage?.trim() ||
          f.settings.confirmationMessage?.trim() ||
          "Terima kasih, jawaban kamu sudah kami terima.";
        const canEdit = f.settings.allowEditResponse && !!r.responseId;
        const editLink =
          canEdit && r.editToken
            ? `${window.location.origin}/form/${slug}?responseId=${encodeURIComponent(r.responseId)}&editToken=${encodeURIComponent(r.editToken)}`
            : null;
        return (
          <Notice
            themeColor={themeColor}
            icon={<CheckCircle2 className="h-8 w-8" />}
            title={screen.wasEdit ? "Jawaban diperbarui" : "Jawaban terkirim"}
            message={message}
          >
            {r.submittedAt && (
              <p className="w-full text-xs text-gray-400">
                {formatDateTime(r.submittedAt)}
              </p>
            )}
            {editLink && (
              <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-gray-50 p-3 text-left">
                <p className="text-xs font-medium text-gray-700">
                  Simpan link ini untuk mengubah jawabanmu nanti
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    readOnly
                    value={editLink}
                    aria-label="Link edit jawaban"
                    onFocus={(e) => e.currentTarget.select()}
                    className="min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => copyEditLink(editLink)}
                    aria-label="Salin link edit"
                    className="shrink-0 rounded-md border border-gray-200 bg-white p-1.5 text-gray-600 hover:bg-gray-50"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
            {canEdit && (
              <button
                type="button"
                onClick={() => startEdit(r.responseId, r.editToken)}
                className={outlineBtn}
              >
                <PencilLine className="h-4 w-4" />
                Edit jawaban
              </button>
            )}
            {!screen.wasEdit && (
              <button
                type="button"
                onClick={resetForNewResponse}
                className={outlineBtn}
              >
                Kirim jawaban lain
              </button>
            )}
          </Notice>
        );
      }

      case "form": {
        if (!form || !current || !display) {
          return (
            <p className="py-8 text-center text-sm text-gray-500">
              Form ini belum memiliki pertanyaan.
            </p>
          );
        }
        const multiSection = form.sections.length > 1;
        const sectionHasHeader =
          !!current.title?.trim() || !!current.description?.trim();
        const hasRequired = form.sections.some((s) =>
          s.items.some((i) => i.isRequired && isAnswerable(i.type)),
        );
        const showEmail = form.settings.collectEmail && path[0] === current.id;
        const canResumeEdit =
          !editing &&
          userState?.canEditResponse &&
          userState.submittedResponseId;

        return (
          <div key={resetKey}>
            {/* Judul form */}
            <div className="mb-5 text-center sm:mb-6">
              <h1
                className="break-words text-xl font-bold leading-tight sm:text-2xl"
                style={{ color: themeColor }}
              >
                {form.title}
              </h1>
              {isFirst && form.description && (
                <p className="mt-2 whitespace-pre-line text-sm text-gray-500">
                  {form.description}
                </p>
              )}
            </div>

            {editing && (
              <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                <PencilLine className="mt-0.5 h-4 w-4 shrink-0" />
                Kamu sedang mengubah jawaban yang sudah dikirim.
              </div>
            )}

            {canResumeEdit && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-600">
                <span>Kamu sudah pernah mengisi form ini.</span>
                <button
                  type="button"
                  onClick={() =>
                    startEdit(userState!.submittedResponseId!, null)
                  }
                  className="font-semibold underline"
                  style={{ color: themeColor }}
                >
                  Edit jawaban sebelumnya
                </button>
              </div>
            )}

            {/* Judul section */}
            {(multiSection || sectionHasHeader) && (
              <div
                className="mb-5 rounded-lg px-4 py-3"
                style={{ backgroundColor: `${themeColor}12` }}
              >
                {multiSection && (
                  <p
                    className="text-[11px] font-semibold uppercase tracking-wide"
                    style={{ color: themeColor }}
                  >
                    Bagian {path.length}
                  </p>
                )}
                {current.title?.trim() && (
                  <h2 className="text-base font-bold text-gray-900">
                    {current.title}
                  </h2>
                )}
                {current.description?.trim() && (
                  <p className="mt-0.5 whitespace-pre-line text-sm text-gray-600">
                    {current.description}
                  </p>
                )}
              </div>
            )}

            {hasRequired && isFirst && (
              <p className="mb-4 text-xs text-gray-400">
                <span className="text-red-500">*</span> Wajib diisi
              </p>
            )}

            <div className="space-y-6">
              {showEmail && (
                <div id="field-email" className="space-y-2.5">
                  <label
                    htmlFor="respondent-email"
                    className="block text-sm font-semibold text-gray-900"
                  >
                    Email
                    {!userState && <span className="ml-1 text-red-500">*</span>}
                  </label>
                  <input
                    id="respondent-email"
                    type="email"
                    value={email}
                    autoComplete="email"
                    disabled={submitting}
                    onChange={(e) => {
                      dirty.current = true;
                      setEmail(e.target.value);
                      setEmailError(null);
                    }}
                    placeholder="Masukkan email Anda"
                    className={`w-full rounded-lg border bg-white px-3 py-2.5 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 sm:text-sm ${
                      emailError ? "border-red-400" : "border-gray-300"
                    }`}
                    style={{ "--tw-ring-color": themeColor } as CSSProperties}
                  />
                  {userState && (
                    <p className="text-xs text-gray-400">
                      Kosongkan untuk memakai email akunmu.
                    </p>
                  )}
                  {emailError && (
                    <p role="alert" className="text-xs text-red-600">
                      {emailError}
                    </p>
                  )}
                </div>
              )}

              {display.items.map((it) => (
                <QuestionField
                  key={it.id}
                  item={it}
                  value={values[it.id]}
                  error={errors[it.id]}
                  accent={themeColor}
                  disabled={submitting}
                  draftNote={canDraft}
                  onChange={(v) => setValue(it.id, v)}
                />
              ))}
            </div>

            {/* Tombol */}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
              {!isFirst && (
                <button
                  type="button"
                  onClick={goBack}
                  disabled={submitting}
                  className={outlineBtn}
                >
                  Kembali
                </button>
              )}
              <button
                type="button"
                onClick={goNext}
                disabled={submitting}
                className={`${primaryBtn} flex-1`}
                style={{ backgroundColor: themeColor }}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLast
                  ? submitting
                    ? "Mengirim..."
                    : editing
                      ? "Simpan Perubahan"
                      : "Kirim Jawaban"
                  : "Lanjut"}
              </button>
            </div>

            {canDraft && draftStatus.state !== "idle" && (
              <p className="mt-3 text-center text-xs text-gray-400">
                {draftStatus.state === "saving" && "Menyimpan draft..."}
                {draftStatus.state === "saved" &&
                  `Draft tersimpan otomatis pukul ${draftStatus.at}`}
                {draftStatus.state === "error" && "Draft belum tersimpan"}
              </p>
            )}
          </div>
        );
      }
    }
  };

  // Tombol Masuk / Daftar kecil di pojok kanan atas (tidak mengganggu form)
  const authCorner = !mounted ? null : currentUser ? (
    <span className="inline-flex max-w-[10rem] items-center sm:max-w-[14rem] gap-2 rounded-full bg-white/80 py-1 pl-1 pr-3 text-xs font-medium text-gray-600 shadow-sm ring-1 ring-black/5 backdrop-blur">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0CA678] text-[11px] font-semibold uppercase text-white">
        {(currentUser.fullName ?? "?").trim().charAt(0) || "?"}
      </span>
      <span className="truncate">{currentUser.fullName}</span>
    </span>
  ) : (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setLoginOpen(true)}
        className="rounded-md border border-[#0CA678] bg-white/80 px-3 py-2 text-xs sm:py-1.5 font-medium text-[#0CA678] backdrop-blur transition hover:bg-[#0CA678] hover:text-white"
      >
        Masuk
      </button>
      <button
        type="button"
        onClick={() => setRegisterOpen(true)}
        className="rounded-md bg-[#0CA678] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#08916C] sm:py-1.5"
      >
        Daftar
      </button>
    </div>
  );

  // Form EVENT: layout dengan menu atas, tab (Deskripsi/Timeline/Form/FAQ) dan
  // panel Informasi Event. Form NON-EVENT tetap memakai kerangka kartu tunggal.
  const isEventForm = form?.type === "EVENT";

  return (
    <>
      {isEventForm && form ? (
        <EventShell
          themeColor={themeColor}
          backgroundColor={backgroundColor}
          fontFamily={fontFamily}
          fallbackTitle={form.event?.name || form.title}
          bannerSrc={headerSrc}
          info={form.eventInfo ?? null}
          navbar={<Navbar />}
          footer={<Footer />}
          focusFormKey={screen.kind}
        >
          {renderBody()}
        </EventShell>
      ) : (
        <NonEventShell
          themeColor={themeColor}
          backgroundColor={backgroundColor}
          fontFamily={fontFamily}
          topRight={authCorner}
        >
          <ShellCard
            themeColor={themeColor}
            headerSrc={
              screen.kind === "form" || screen.kind === "done"
                ? headerSrc
                : null
            }
          >
            {renderBody()}
          </ShellCard>
        </NonEventShell>
      )}

      <LoginModal
        isOpen={loginOpen}
        setIsOpen={setLoginOpen}
        openRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />
      <RegisterModal
        isOpen={registerOpen}
        setIsOpen={setRegisterOpen}
        openLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />
    </>
  );
}
