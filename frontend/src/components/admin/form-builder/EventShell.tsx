"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  Info,
  MapPin,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { formatDateRange } from "./shared";

// Kerangka halaman form EVENT. Dipakai di halaman publik (FormFillPage) dan
// di Preview admin (embedded). Form NON-EVENT tidak memakai ini.

// ─── Tipe (sesuai `eventInfo` dari API publik) ──────────────────────────────
export interface EventTimelinePublic {
  id: string;
  title: string;
  description?: string | null;
  date?: string | null; // YYYY-MM-DD
  time?: string | null;
}
export interface EventFaqPublic {
  id: string;
  question: string;
  answer: string;
}
export interface EventInfoPublic {
  title: string | null;
  description: string | null;
  startAt: string | null;
  endAt: string | null;
  mode: "ONLINE" | "OFFLINE" | "HYBRID" | null;
  location: string | null;
  organizer: string | null;
  categoryLabel: string | null;
  timeline: EventTimelinePublic[];
  faqs: EventFaqPublic[];
}

interface Props {
  themeColor: string;
  backgroundColor: string;
  fontFamily: string;
  /** Judul cadangan (judul form) kalau info.title kosong */
  fallbackTitle: string;
  bannerSrc: string | null;
  info: EventInfoPublic | null;
  /** Navbar situs (opsional, tidak dipakai di preview) */
  navbar?: ReactNode;
  /** Footer situs (opsional, tidak dipakai di preview) */
  footer?: ReactNode;
  /** true = tanpa tinggi layar penuh, untuk ditanam di Preview admin */
  embedded?: boolean;
  /** Bungkus isi tab Form dengan kartu putih. Matikan kalau isinya sudah berupa kartu */
  formCard?: boolean;
  /** Berubah → otomatis pindah ke tab Form (mis. saat layar berganti jadi "selesai") */
  focusFormKey: string;
  /** Isi tab Form Pendaftaran */
  children: ReactNode;
}

type TabKey = "deskripsi" | "timeline" | "form" | "faq";

// ─── Helper tampilan ────────────────────────────────────────────────────────
function modeLabel(info: EventInfoPublic | null): string {
  if (!info?.mode) return "";
  return { ONLINE: "Online", OFFLINE: "Offline", HYBRID: "Hybrid" }[info.mode];
}

// "YYYY-MM-DD" ditampilkan apa adanya (tanpa geser zona waktu)
function formatPlainDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return ymd;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Latar bercorak (tile 800x800, diulang) + cahaya lembut di atas halaman.
// Warna mengikuti warna tema form; opacity rendah supaya form tetap jadi fokus.
function backgroundPattern(color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">` +
    `<defs><pattern id="d" width="22" height="22" patternUnits="userSpaceOnUse">` +
    `<circle cx="11" cy="11" r="1.8" fill="${color}" fill-opacity="0.28"/></pattern></defs>` +
    // lingkaran lembut
    `<g fill="${color}">` +
    `<circle cx="120" cy="150" r="90" fill-opacity="0.09"/>` +
    `<circle cx="660" cy="120" r="60" fill-opacity="0.08"/>` +
    `<circle cx="400" cy="430" r="110" fill-opacity="0.07"/>` +
    `<circle cx="700" cy="620" r="80" fill-opacity="0.10"/>` +
    `<circle cx="140" cy="660" r="50" fill-opacity="0.09"/>` +
    `</g>` +
    // cincin dan kotak berputar
    `<g fill="none" stroke="${color}" stroke-opacity="0.20" stroke-width="2.5">` +
    `<circle cx="300" cy="90" r="38"/>` +
    `<circle cx="590" cy="380" r="54"/>` +
    `<circle cx="70" cy="420" r="28"/>` +
    `<rect x="470" y="560" width="70" height="70" rx="14" transform="rotate(18 505 595)"/>` +
    `<rect x="250" y="300" width="46" height="46" rx="10" transform="rotate(-14 273 323)"/>` +
    `</g>` +
    // kelompok titik
    `<rect x="520" y="200" width="132" height="132" fill="url(#d)"/>` +
    `<rect x="190" y="520" width="132" height="110" fill="url(#d)"/>` +
    // tanda plus
    `<g stroke="${color}" stroke-opacity="0.30" stroke-width="3" stroke-linecap="round">` +
    `<path d="M400 230v22M389 241h22"/>` +
    `<path d="M90 280v22M79 291h22"/>` +
    `<path d="M720 470v22M709 481h22"/>` +
    `<path d="M330 720v22M319 731h22"/>` +
    `</g>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
      {children}
    </div>
  );
}

function Chip({ Icon, text }: { Icon: LucideIcon; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-gray-600 sm:text-base">
      <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
      {text}
    </span>
  );
}

function InfoRow({
  Icon,
  label,
  value,
  accent,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="break-words text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}

// ─── Komponen utama ─────────────────────────────────────────────────────────
export default function EventShell({
  themeColor,
  backgroundColor,
  fontFamily,
  fallbackTitle,
  bannerSrc,
  info,
  navbar,
  footer,
  embedded = false,
  formCard = true,
  focusFormKey,
  children,
}: Props) {
  const title = info?.title?.trim() || fallbackTitle;
  const description = info?.description?.trim() || "";
  const timeline = info?.timeline ?? [];
  const faqs = info?.faqs ?? [];

  const tabs = useMemo(() => {
    const list: { key: TabKey; label: string }[] = [];
    if (description) list.push({ key: "deskripsi", label: "Deskripsi" });
    if (timeline.length > 0) list.push({ key: "timeline", label: "Timeline" });
    list.push({ key: "form", label: "Form Pendaftaran" });
    if (faqs.length > 0) list.push({ key: "faq", label: "FAQ" });
    return list;
  }, [description, timeline.length, faqs.length]);

  const [tab, setTab] = useState<TabKey>("form");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    setTab("form");
  }, [focusFormKey]);

  // Kalau tab aktif hilang (mis. isinya dikosongkan di builder), kembali ke Form
  const activeTab: TabKey = tabs.some((t) => t.key === tab) ? tab : "form";

  const dateText = info?.startAt
    ? formatDateRange(info.startAt, info.endAt)
    : "";
  const mode = modeLabel(info);
  const place = info?.location || mode;

  const infoRows: { Icon: LucideIcon; label: string; value: string }[] = [
    { Icon: CalendarDays, label: "Tanggal", value: dateText },
    { Icon: MapPin, label: "Lokasi", value: place },
    { Icon: Building2, label: "Penyelenggara", value: info?.organizer ?? "" },
    { Icon: Tag, label: "Kategori", value: info?.categoryLabel ?? "" },
  ].filter((r) => r.value);

  return (
    <div
      className={embedded ? "" : "flex min-h-screen flex-col"}
      style={{
        backgroundColor,
        backgroundImage: `radial-gradient(60rem 28rem at 50% -6rem, ${themeColor}26, transparent 70%), ${backgroundPattern(themeColor)}`,
        backgroundSize: "auto, 800px 800px",
        backgroundRepeat: "no-repeat, repeat",
        backgroundPosition: "top center, 0 0",
      }}
    >
      {/* Navbar situs memakai font bawaannya sendiri */}
      {navbar}

      <main
        className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-3 pb-12 pt-4 sm:px-4 sm:pb-24 sm:pt-6"
        style={{ fontFamily }}
      >
        {/* Hero: judul + banner */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <div
            className={`grid items-center gap-4 p-4 sm:gap-6 sm:p-8 ${
              bannerSrc
                ? "md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-8"
                : ""
            }`}
          >
            <div className="flex min-w-0 flex-col justify-center">
              <h1 className="break-words text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
                {title}
              </h1>
              {(dateText || mode) && (
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                  {dateText && <Chip Icon={CalendarDays} text={dateText} />}
                  {mode && <Chip Icon={MapPin} text={mode} />}
                </div>
              )}
            </div>
            {bannerSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bannerSrc}
                alt=""
                className="aspect-video w-full rounded-xl object-cover"
              />
            )}
          </div>

          {/* Tab */}
          <div
            role="tablist"
            aria-label="Bagian halaman event"
            className="flex gap-5 overflow-x-auto overflow-y-hidden border-t border-gray-100 px-4 sm:gap-6 sm:px-8"
          >
            {tabs.map((t) => {
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.key)}
                  className={`shrink-0 whitespace-nowrap border-b-2 py-3 text-sm transition-colors ${
                    active
                      ? "font-semibold"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                  style={
                    active
                      ? { borderColor: themeColor, color: themeColor }
                      : undefined
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          {/* Isi tab */}
          <div className="min-w-0">
            {activeTab === "deskripsi" && (
              <Card>
                <h2 className="mb-3 text-base font-semibold text-gray-900">
                  Deskripsi
                </h2>
                <p className="whitespace-pre-line break-words text-sm leading-relaxed text-gray-700">
                  {description}
                </p>
              </Card>
            )}

            {activeTab === "timeline" && (
              <Card>
                <h2 className="mb-4 text-base font-semibold text-gray-900">
                  Timeline
                </h2>
                <ol>
                  {timeline.map((t, i) => (
                    <li
                      key={t.id}
                      className="relative flex gap-4 pb-6 last:pb-0"
                    >
                      {i < timeline.length - 1 && (
                        <span
                          aria-hidden
                          className="absolute left-[0.4375rem] top-4 h-full w-px bg-gray-200"
                        />
                      )}
                      <span
                        aria-hidden
                        className="relative mt-1 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-white"
                        style={{ backgroundColor: themeColor }}
                      />
                      <div className="min-w-0">
                        {(t.date || t.time) && (
                          <p className="text-xs text-gray-500">
                            {[t.date ? formatPlainDate(t.date) : "", t.time]
                              .filter(Boolean)
                              .join("  •  ")}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-gray-900">
                          {t.title}
                        </p>
                        {t.description && (
                          <p className="mt-1 whitespace-pre-line break-words text-sm text-gray-600">
                            {t.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>
            )}

            {activeTab === "form" &&
              (formCard ? <Card>{children}</Card> : children)}

            {activeTab === "faq" && (
              <Card>
                <h2 className="mb-3 text-base font-semibold text-gray-900">
                  FAQ
                </h2>
                <div className="divide-y divide-gray-100">
                  {faqs.map((f) => {
                    const open = openFaq === f.id;
                    return (
                      <div key={f.id}>
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => setOpenFaq(open ? null : f.id)}
                          className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-gray-900"
                        >
                          <span className="min-w-0 break-words">
                            {f.question}
                          </span>
                          <span
                            aria-hidden
                            className={`shrink-0 text-gray-400 transition-transform ${
                              open ? "rotate-45" : ""
                            }`}
                          >
                            +
                          </span>
                        </button>
                        {open && (
                          <p className="whitespace-pre-line break-words pb-4 text-sm text-gray-600">
                            {f.answer}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          {/* Panel Informasi Event */}
          <aside className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
            <h2 className="text-sm font-semibold text-gray-900">
              Informasi Event
            </h2>
            {infoRows.length > 0 ? (
              <div className="space-y-4">
                {infoRows.map((r) => (
                  <InfoRow key={r.label} {...r} accent={themeColor} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                Informasi event belum diisi.
              </p>
            )}
            <p className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Formulir ini khusus untuk event.
            </p>
          </aside>
        </div>
      </main>

      {footer}
    </div>
  );
}
