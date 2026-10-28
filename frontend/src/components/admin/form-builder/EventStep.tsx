"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { CalendarDays, Search } from "lucide-react";
import {
  EligibleEvent,
  FORM_API,
  Pagination,
  eventDateLabel,
  eventModeLabel,
  getApiErrorMessage,
  resolveImageUrl,
  useDebouncedValue,
} from "./shared";

interface Props {
  selectedId: string;
  onSelect: (ev: EligibleEvent) => void;
}

const EVENT_LIMIT = 10;

function Thumb({ ev }: { ev: EligibleEvent }) {
  const [failed, setFailed] = useState(false);
  const src = resolveImageUrl(ev.thumbnail ?? ev.imageUrl);
  if (!src || failed) {
    return (
      <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-500">
        <CalendarDays className="h-5 w-5" />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="h-12 w-16 shrink-0 rounded-md object-cover"
    />
  );
}

export default function EventStep({ selectedId, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const [events, setEvents] = useState<EligibleEvent[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  // Pencarian berubah → mulai dari halaman 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    axios
      .get(`${FORM_API}/events/eligible`, {
        params: {
          search: debouncedSearch || undefined,
          page,
          limit: EVENT_LIMIT,
        },
        withCredentials: true,
        signal: controller.signal,
      })
      .then((res) => {
        const data = res.data?.data ?? res.data;
        const items: EligibleEvent[] = data?.items ?? [];
        // halaman > 1 = "muat lebih banyak", tambahkan ke daftar
        setEvents((prev) => (page === 1 ? items : [...prev, ...items]));
        setPagination(data?.pagination ?? null);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        if (page === 1) setEvents([]);
        setPagination(null);
        setError(getApiErrorMessage(err, "Gagal memuat daftar Event"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedSearch, page, reloadTick]);

  const hasMore = !!pagination && pagination.page < pagination.totalPages;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama event..."
          aria-label="Cari nama event"
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div role="radiogroup" aria-label="Event" className="space-y-2">
        {loading &&
          events.length === 0 &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-[4.5rem] animate-pulse rounded-xl border border-gray-100 bg-gray-50"
            />
          ))}

        {error && (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => setReloadTick((n) => n + 1)}
              className="mt-3 rounded-lg border border-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
            >
              Coba lagi
            </button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
            {debouncedSearch
              ? "Tidak ada event yang cocok dengan pencarian."
              : "Belum ada event non-kelas yang bisa dikaitkan dengan form."}
          </div>
        )}

        {events.map((ev) => {
          const active = ev.id === selectedId;
          const meta = [eventDateLabel(ev), eventModeLabel(ev)].filter(Boolean);
          return (
            <button
              key={ev.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(ev)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                active
                  ? "border-emerald-500 bg-emerald-50/40"
                  : "border-gray-200 bg-white hover:border-emerald-300"
              }`}
            >
              <Thumb ev={ev} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-gray-900">
                  {ev.name}
                </span>
                {meta.length > 0 && (
                  <span className="mt-0.5 block text-xs text-gray-500">
                    {meta.join("  •  ")}
                  </span>
                )}
              </span>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  active ? "border-emerald-500" : "border-gray-300"
                }`}
              >
                {active && (
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                )}
              </span>
            </button>
          );
        })}

        {!error && hasMore && (
          <button
            type="button"
            disabled={loading}
            onClick={() => setPage((p) => p + 1)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Memuat..." : "Muat lebih banyak"}
          </button>
        )}
      </div>
    </div>
  );
}
