import type { GroupKey, KeyFlag } from "./types";

// Class Tailwind ditulis lengkap (bukan dirakit dari string) supaya tidak ter-purge.
export const GROUP_STYLES: Record<
  GroupKey,
  { label: string; header: string; soft: string; dot: string }
> = {
  pelanggan: {
    label: "Pelanggan",
    header: "bg-emerald-500",
    soft: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  katalog: {
    label: "Katalog",
    header: "bg-sky-500",
    soft: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
  },
  transaksi: {
    label: "Transaksi",
    header: "bg-violet-500",
    soft: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
  },
  logistik: {
    label: "Pembayaran & pengiriman",
    header: "bg-amber-500",
    soft: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  ulasan: {
    label: "Ulasan",
    header: "bg-rose-500",
    soft: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
};

export const KEY_STYLES: Record<KeyFlag, string> = {
  PK: "bg-amber-100 text-amber-800",
  FK: "bg-sky-100 text-sky-800",
  UQ: "bg-violet-100 text-violet-800",
};
