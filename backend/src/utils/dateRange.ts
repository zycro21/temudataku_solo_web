// Util rentang tanggal untuk filter from/to.
//
// - Tanggal saja ("2026-11-09") dianggap hari kalender WIB (Asia/Jakarta, +07:00):
//     from → 2026-11-09 00:00:00.000 WIB
//     to   → 2026-11-09 23:59:59.999 WIB
// - String ISO lengkap ("2026-11-09T10:00:00Z" / "...+07:00") dipakai apa adanya.

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const WIB_OFFSET = "+07:00";

export const isValidDateInput = (v: string) =>
  !Number.isNaN(parseRangeStart(v).getTime());

export const parseRangeStart = (v: string): Date =>
  new Date(DATE_ONLY.test(v) ? `${v}T00:00:00.000${WIB_OFFSET}` : v);

export const parseRangeEnd = (v: string): Date =>
  new Date(DATE_ONLY.test(v) ? `${v}T23:59:59.999${WIB_OFFSET}` : v);

export const buildDateRange = (
  from?: string,
  to?: string,
): { gte?: Date; lte?: Date } | undefined => {
  if (!from && !to) return undefined;
  return {
    ...(from ? { gte: parseRangeStart(from) } : {}),
    ...(to ? { lte: parseRangeEnd(to) } : {}),
  };
};

// ---------------------------------------------------------------------------
// Tampilan WIB
//
// Waktu di database tetap disimpan sebagai instant yang benar. Yang dibuat
// WIB adalah representasi di ID dan di respons API. Indonesia (WIB) tidak
// punya DST, jadi offset tetap +07:00.
// ---------------------------------------------------------------------------
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

const toWibShifted = (d: Date) => new Date(d.getTime() + WIB_OFFSET_MS);

/** 2026-11-10T07:30:05.123Z → "2026-11-10T14:30:05.123+07:00" */
export const toWibIso = (d: Date): string =>
  toWibShifted(d).toISOString().replace("Z", WIB_OFFSET);

/** 2026-11-10T07:30:05Z → "20261110-143005" (jam dinding WIB) */
export const formatWibCompact = (d: Date): string => {
  const iso = toWibShifted(d).toISOString(); // 2026-11-10T14:30:05.123Z
  return `${iso.slice(0, 10).replace(/-/g, "")}-${iso
    .slice(11, 19)
    .replace(/:/g, "")}`;
};
