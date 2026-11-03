"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CalendarX,
  Lock,
  MapPin,
  RefreshCw,
  Search,
  Tag,
  X,
} from "lucide-react";
import {
  formatDateRange,
  resolveImageUrl,
} from "@/components/admin/form-builder/shared";

// Daftar Form Event yang tampil di menu "Event" navbar.
// Klik kartu → halaman form event (/form/{slug}).

const API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/formpublic/events`;

const BRAND = "#0CA678"; // hijau TemuDataku
const DEEP = "#087F5B"; // hijau tua untuk gradasi

type EventMode = "ONLINE" | "OFFLINE" | "HYBRID";

interface EventListItem {
  slug: string;
  title: string;
  formTitle: string;
  summary: string | null;
  headerImage: string | null;
  themeColor: string | null;
  categoryLabel: string | null;
  mode: EventMode | null;
  location: string | null;
  organizer: string | null;
  startAt: string | null;
  endAt: string | null;
  hasEnded: boolean;
  requiresLogin: boolean;
  availability: { isOpen: boolean; reason?: string; message?: string };
}

const MODE_LABEL: Record<EventMode, string> = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  HYBRID: "Hybrid",
};

// ─── Label status di pojok gambar ───────────────────────────────────────────
function statusBadge(ev: EventListItem): { text: string; className: string } {
  if (ev.hasEnded) {
    return { text: "Event selesai", className: "bg-gray-900/75 text-white" };
  }
  if (ev.availability.isOpen) {
    return { text: "Pendaftaran dibuka", className: "bg-[#0CA678] text-white" };
  }
  switch (ev.availability.reason) {
    case "NOT_YET_OPEN":
      return {
        text: "Segera dibuka",
        className: "bg-amber-400 text-amber-950",
      };
    case "LIMIT_REACHED":
      return { text: "Kuota penuh", className: "bg-rose-500 text-white" };
    default:
      return {
        text: "Pendaftaran ditutup",
        className: "bg-gray-900/75 text-white",
      };
  }
}

function placeText(ev: EventListItem): string {
  const mode = ev.mode ? MODE_LABEL[ev.mode] : "";
  const loc = ev.location?.trim() ?? "";
  if (!loc) return mode;
  if (!mode || loc.toLowerCase() === mode.toLowerCase()) return loc;
  return `${mode} · ${loc}`;
}

// ─── Kartu event ────────────────────────────────────────────────────────────
function EventCard({ ev }: { ev: EventListItem }) {
  const img = resolveImageUrl(ev.headerImage);
  const badge = statusBadge(ev);
  const place = placeText(ev);

  return (
    <Link
      href={`/form/${ev.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0CA678]"
    >
      {/* Gambar */}
      <div className="relative aspect-video overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            loading="lazy"
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
              ev.hasEnded ? "grayscale-[35%]" : ""
            }`}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              backgroundImage: `linear-gradient(135deg, ${BRAND} 0%, ${DEEP} 100%)`,
            }}
          >
            <CalendarDays className="h-12 w-12 text-white/70" />
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm ${badge.className}`}
        >
          {badge.text}
        </span>
        {ev.categoryLabel && (
          <span className="absolute right-3 top-3 max-w-[45%] truncate rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm">
            {ev.categoryLabel}
          </span>
        )}
      </div>

      {/* Isi */}
      <div className="flex flex-1 flex-col p-5">
        <h2 className="line-clamp-2 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#0CA678]">
          {ev.title}
        </h2>
        {ev.summary && (
          <div className="group/desc relative mt-2">
            <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">
              {ev.summary}
            </p>
            <div
              role="tooltip"
              className="pointer-events-none invisible absolute inset-x-0 bottom-full z-20 mb-2 rounded-lg bg-gray-900 px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-lg transition duration-150 group-hover/desc:visible group-hover/desc:opacity-100"
            >
              {ev.summary}
              <span className="absolute left-5 top-full h-2 w-2 -translate-y-1 rotate-45 bg-gray-900" />
            </div>
          </div>
        )}

        <ul className="mt-4 space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2.5">
            <CalendarDays
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: BRAND }}
            />
            <span className={ev.startAt ? "" : "text-gray-400"}>
              {ev.startAt
                ? formatDateRange(ev.startAt, ev.endAt)
                : "Tanggal akan diumumkan"}
            </span>
          </li>
          {place && (
            <li className="flex items-start gap-2.5">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: BRAND }}
              />
              <span className="min-w-0 break-words">{place}</span>
            </li>
          )}
          {ev.organizer && (
            <li className="flex items-start gap-2.5">
              <Building2
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: BRAND }}
              />
              <span className="min-w-0 break-words">{ev.organizer}</span>
            </li>
          )}
        </ul>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
            {ev.requiresLogin ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                <Lock className="h-3.5 w-3.5" />
                Perlu login
              </span>
            ) : (
              <span />
            )}
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0CA678] transition-all group-hover:gap-2.5">
              {ev.hasEnded ? "Lihat detail" : "Lihat & daftar"}
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="aspect-video bg-gray-200" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-4/5 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-2/3 rounded bg-gray-100" />
        <div className="space-y-2 pt-2">
          <div className="h-4 w-1/2 rounded bg-gray-100" />
          <div className="h-4 w-2/5 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

function StateBox({
  icon,
  title,
  desc,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-black/5">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: `${BRAND}1A`, color: BRAND }}
      >
        {icon}
      </span>
      <h2 className="mt-5 text-lg font-bold text-gray-900">{title}</h2>
      <p className="mt-1.5 text-sm text-gray-500">{desc}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ─── Halaman ────────────────────────────────────────────────────────────────
export default function EventListPage() {
  const [items, setItems] = useState<EventListItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus("loading");
      try {
        const res = await axios.get(API);
        if (cancelled) return;
        setItems(res.data?.data ?? []);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        console.error("Gagal memuat daftar event:", err);
        toast.error("Gagal memuat daftar event");
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (!q) return true;
      return [it.title, it.summary, it.organizer, it.categoryLabel]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q));
    });
  }, [items, search]);

  const filtering = search.trim() !== "";

  return (
    <main className="flex-1 bg-[#F3FBF7]">
      <style>{`
        @keyframes placeholder-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .placeholder-marquee {
          animation: placeholder-marquee 9s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .placeholder-marquee { animation: none; }
        }
      `}</style>

      {/* Hero */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          backgroundImage: `linear-gradient(120deg, ${DEEP} 0%, ${BRAND} 55%, #38D9A9 120%)`,
        }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute right-[8%] top-10 h-28 w-28 rounded-full border-2 border-white/20" />
          <div className="absolute -bottom-24 right-[22%] h-72 w-72 rounded-full bg-[#96F2D7]/30 blur-3xl" />
          <div
            className="absolute right-6 top-1/2 hidden h-40 w-40 -translate-y-1/2 opacity-60 md:block"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.45) 1.6px, transparent 1.6px)",
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:pb-28 lg:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-sm sm:text-sm">
            <CalendarDays className="h-4 w-4" />
            Event TemuDataku
          </span>
          <h1 className="mt-5 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Ikuti Event Data, Tambah Skill dan Relasi
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            Hackathon, workshop, dan acara komunitas dari TemuDataku. Pilih
            event yang kamu minati, lalu daftar lewat form yang ada.
          </p>
        </div>
      </section>

      {/* Pencarian */}
      <div className="relative z-10 mx-auto -mt-9 w-full max-w-6xl px-4 sm:-mt-10 sm:px-6">
        <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5 sm:p-5">
          <div>
            <label className="relative block w-full">
              <span className="sr-only">Cari event</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama event atau penyelenggara..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-10 text-sm text-gray-800 placeholder:text-transparent focus:border-[#0CA678] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0CA678]/20 sm:placeholder:text-gray-400"
              />
              {/* Placeholder berjalan (khusus mobile) */}
              {!search && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-10 right-10 top-1/2 -translate-y-1/2 overflow-hidden whitespace-nowrap text-sm text-gray-400 sm:hidden"
                >
                  <span className="placeholder-marquee inline-flex">
                    <span className="pr-10">
                      Cari nama event atau penyelenggara...
                    </span>
                    <span className="pr-10">
                      Cari nama event atau penyelenggara...
                    </span>
                  </span>
                </span>
              )}
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Hapus pencarian"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* Daftar */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
        {status === "ready" && items.length > 0 && (
          <p className="mb-5 text-sm text-gray-500" aria-live="polite">
            {filtering
              ? `Menampilkan ${filtered.length} dari ${items.length} event`
              : `${items.length} event tersedia`}
          </p>
        )}

        {status === "loading" && (
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {status === "error" && (
          <StateBox
            icon={<RefreshCw className="h-7 w-7" />}
            title="Daftar event gagal dimuat"
            desc="Periksa koneksi internetmu lalu coba lagi."
            action={
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="rounded-xl bg-[#0CA678] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#08916C]"
              >
                Coba lagi
              </button>
            }
          />
        )}

        {status === "ready" && items.length === 0 && (
          <StateBox
            icon={<CalendarX className="h-7 w-7" />}
            title="Belum ada event"
            desc="Event baru akan segera hadir. Pantau terus halaman ini ya!"
          />
        )}

        {status === "ready" && items.length > 0 && filtered.length === 0 && (
          <StateBox
            icon={<Tag className="h-7 w-7" />}
            title="Event tidak ditemukan"
            desc="Coba kata kunci lain."
            action={
              <button
                type="button"
                onClick={() => setSearch("")}
                className="rounded-xl border border-[#0CA678] px-5 py-2.5 text-sm font-semibold text-[#0CA678] transition-colors hover:bg-[#0CA678]/10"
              >
                Reset pencarian
              </button>
            }
          />
        )}

        {status === "ready" && filtered.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {filtered.map((ev) => (
              <EventCard key={ev.slug} ev={ev} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
