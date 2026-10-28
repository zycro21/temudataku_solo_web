import axios from "axios";
import { useEffect, useState } from "react";

// ─── API ──────────────────────────────────────────────────────────────────────
export const FORM_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/form`;
export const PAGE_SIZE = 10;

// ─── Tipe data (sesuai response GET /api/form/forms) ─────────────────────────
export type FormType = "EVENT" | "NON_EVENT";
export type FormStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type StatusFilter = "" | FormStatus;
export type SortOrder = "desc" | "asc";

export interface FormListItem {
  id: string;
  type: FormType;
  title: string;
  status: FormStatus;
  slug: string;
  eventId: string | null;
  eventNameSnapshot: string | null;
  showOnEventPage: boolean;
  categoryId?: string | null;
  category?: { id: string; name: string } | null;
  responseCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Jenis form, dari GET /api/form/categories
export interface FormCategory {
  id: string;
  type: FormType;
  name: string;
  description: string | null;
  formCount: number;
  createdAt: string;
  updatedAt: string;
}

// Item dari GET /api/form/events/eligible. Backend menjamin id, name, date, mode;
// field lain opsional (dibaca defensif di UI kalau modul Event nanti menyediakannya).
export interface EligibleEvent {
  id: string;
  name: string;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  mode?: string | null;
  location?: string | null;
  thumbnail?: string | null;
  imageUrl?: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Label ───────────────────────────────────────────────────────────────────
export const TYPE_LABEL: Record<FormType, string> = {
  EVENT: "Form Event",
  NON_EVENT: "Form Non-Event",
};

export const STATUS_LABEL: Record<FormStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Diarsipkan",
};

// ─── Rute halaman lanjutan ────────────────────────────────────────────────────
// Halaman builder & response belum dibuat. Kalau path-nya nanti beda, cukup
// ubah di dua fungsi ini.
export const formCreateHref = "/admin/form-builder/create";
export const formListHref = "/admin/form-builder";
// Halaman "Buat Form" (setup form baru: event, judul, dst). Belum dibuat.
export const formNewHref = "/admin/form-builder/new";
export const formEditHref = (id: string) => `/admin/form-builder/${id}`;
export const formResponsesHref = (id: string) =>
  `/admin/form-builder/${id}/responses`;

// ─── Format tanggal (WIB) ────────────────────────────────────────────────────
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

// ─── Pesan error API ─────────────────────────────────────────────────────────
// Membaca message dari backend dan, kalau ada, daftar detail per field
// (error validasi Zod: path + message; atau details dari publish/submit).
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!axios.isAxiosError(err)) return fallback;

  const data = err.response?.data as
    | { message?: string; errors?: unknown; details?: unknown }
    | undefined;
  const base = data?.message || fallback;
  const list = data?.errors ?? data?.details;

  if (!Array.isArray(list) || list.length === 0) return base;

  const lines = list.slice(0, 3).map((e: unknown) => {
    if (typeof e === "string") return e;
    const o = e as {
      path?: string | (string | number)[];
      field?: string;
      itemId?: string;
      message?: string;
    };
    const where = Array.isArray(o.path)
      ? o.path.join(".")
      : (o.path ?? o.field ?? o.itemId ?? "");
    return where ? `${where}: ${o.message ?? ""}` : (o.message ?? "");
  });
  const more = list.length > 3 ? `, +${list.length - 3} lainnya` : "";
  return `${base} (${lines.filter(Boolean).join("; ")}${more})`;
}

// ─── Hook debounce ───────────────────────────────────────────────────────────
export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Helper tampilan Event ───────────────────────────────────────────────────
// Rentang tanggal, mis. "12 - 14 Maret 2027" atau "20 - 25 Januari 2026".
export function formatDateRange(
  startIso: string,
  endIso?: string | null,
): string {
  const opt = { timeZone: "Asia/Jakarta" } as const;
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return startIso;
  const full = (d: Date) =>
    d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      ...opt,
    });
  if (!endIso) return full(start);
  const end = new Date(endIso);
  if (Number.isNaN(end.getTime())) return full(start);
  const day = (d: Date) =>
    d.toLocaleDateString("id-ID", { day: "numeric", ...opt });
  const monthYear = (d: Date) =>
    d.toLocaleDateString("id-ID", { month: "long", year: "numeric", ...opt });
  if (monthYear(start) === monthYear(end)) {
    return day(start) === day(end)
      ? full(start)
      : `${day(start)} - ${day(end)} ${monthYear(end)}`;
  }
  return `${full(start)} - ${full(end)}`;
}

export function eventDateLabel(ev: EligibleEvent): string {
  const start = ev.startDate ?? ev.date;
  if (!start) return "";
  // date dari backend bisa ISO atau teks bebas; kalau bukan tanggal valid tampilkan apa adanya
  if (Number.isNaN(new Date(start).getTime())) return start;
  return formatDateRange(start, ev.endDate);
}

export function eventModeLabel(ev: EligibleEvent): string {
  const m = (ev.mode ?? "").toLowerCase();
  if (m === "online") return "Online";
  if (m === "offline") return ev.location || "Offline";
  return ev.mode || "";
}

// Path gambar relatif (folder /images di backend) dijadikan URL penuh.
export function resolveImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${path.replace(/^\/+/, "")}`;
}
