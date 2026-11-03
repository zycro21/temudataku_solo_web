"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Award,
  BarChart3,
  Briefcase,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Database,
  FileUp,
  Mail,
  MessageSquareText,
  Presentation,
  Search,
  Trophy,
  UserPlus,
  Users,
  Vote,
  type LucideIcon,
} from "lucide-react";
import {
  FORM_API,
  FormCategory,
  FormType,
  formCategoryHref,
  getApiErrorMessage,
  useDebouncedValue,
} from "./shared";

interface Props {
  type: FormType;
  /** Naikkan nilainya dari luar (mis. setelah buat jenis) untuk memuat ulang. */
  refreshKey: number;
}

// Ikon + warna dipilih dari kata kunci di nama jenis, jadi tiap jenis terlihat
// berbeda. Urutan penting: yang cocok pertama dipakai. Kalau tidak ada yang
// cocok, pakai ikon default.
interface IconStyle {
  Icon: LucideIcon;
  box: string; // kelas bg + warna ikon
}

const ICON_RULES: { keywords: string[]; style: IconStyle }[] = [
  {
    keywords: ["hackathon", "lomba", "kompetisi", "competition", "kontes"],
    style: { Icon: Trophy, box: "bg-amber-100 text-amber-600" },
  },
  {
    keywords: ["daftar", "registrasi", "register", "pendaftaran"],
    style: { Icon: UserPlus, box: "bg-blue-100 text-blue-600" },
  },
  {
    keywords: ["presensi", "absen", "kehadiran", "attendance"],
    style: { Icon: CalendarCheck, box: "bg-teal-100 text-teal-600" },
  },
  {
    keywords: ["survei", "survey", "kuesioner", "angket"],
    style: { Icon: BarChart3, box: "bg-violet-100 text-violet-600" },
  },
  {
    keywords: ["feedback", "masukan", "umpan", "evaluasi", "review", "saran"],
    style: { Icon: MessageSquareText, box: "bg-rose-100 text-rose-600" },
  },
  {
    keywords: ["seminar", "webinar", "workshop", "pelatihan", "training"],
    style: { Icon: Presentation, box: "bg-indigo-100 text-indigo-600" },
  },
  {
    keywords: ["rekrut", "recruit", "lowongan", "karir", "karier", "career"],
    style: { Icon: Briefcase, box: "bg-orange-100 text-orange-600" },
  },
  {
    keywords: ["submission", "submit", "kumpul", "tugas", "proyek", "project"],
    style: { Icon: FileUp, box: "bg-sky-100 text-sky-600" },
  },
  {
    keywords: ["data", "pendataan"],
    style: { Icon: Database, box: "bg-cyan-100 text-cyan-600" },
  },
  {
    keywords: ["kontak", "contact", "hubungi"],
    style: { Icon: Mail, box: "bg-pink-100 text-pink-600" },
  },
  {
    keywords: ["voting", "vote", "polling", "poll", "pemilihan"],
    style: { Icon: Vote, box: "bg-fuchsia-100 text-fuchsia-600" },
  },
  {
    keywords: ["sertifikat", "certificate", "penghargaan"],
    style: { Icon: Award, box: "bg-yellow-100 text-yellow-600" },
  },
  {
    keywords: ["komunitas", "community", "anggota", "member"],
    style: { Icon: Users, box: "bg-lime-100 text-lime-600" },
  },
  {
    keywords: ["pembayaran", "payment", "bayar", "tiket", "ticket"],
    style: { Icon: CreditCard, box: "bg-emerald-100 text-emerald-600" },
  },
];

const DEFAULT_ICON_STYLE: IconStyle = {
  Icon: ClipboardList,
  box: "bg-gray-100 text-gray-600",
};

function getIconStyle(name: string): IconStyle {
  const n = name.toLowerCase();
  const hit = ICON_RULES.find((r) => r.keywords.some((k) => n.includes(k)));
  return hit?.style ?? DEFAULT_ICON_STYLE;
}

export default function CategoryStep({ type, refreshKey }: Props) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const [items, setItems] = useState<FormCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    axios
      .get(`${FORM_API}/categories`, {
        params: { type, search: debouncedSearch || undefined },
        withCredentials: true,
        signal: controller.signal,
      })
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setItems(data?.items ?? []);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setItems([]);
        setError(getApiErrorMessage(err, "Gagal memuat jenis form"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [type, debouncedSearch, refreshKey, reloadTick]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari jenis form..."
          aria-label="Cari jenis form"
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div className="space-y-2">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[4.5rem] animate-pulse rounded-xl border border-gray-100 bg-gray-50"
            />
          ))}

        {!loading && error && (
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

        {!loading && !error && items.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
            {debouncedSearch
              ? "Tidak ada jenis yang cocok dengan pencarian."
              : 'Belum ada jenis form. Klik "Buat Jenis" untuk membuat yang pertama.'}
          </div>
        )}

        {!loading &&
          !error &&
          items.map((c) => {
            const { Icon, box } = getIconStyle(c.name);
            return (
              <Link
                key={c.id}
                href={`${formCategoryHref(c.id)}?type=${c.type}`}
                className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${box}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-gray-900">
                    {c.name}
                  </span>
                  {c.description && (
                    <span className="mt-0.5 block truncate text-xs text-gray-500">
                      {c.description}
                    </span>
                  )}
                </span>
                <span className="shrink-0 rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  {c.formCount.toLocaleString("id-ID")} form
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-500" />
              </Link>
            );
          })}
      </div>
    </div>
  );
}
