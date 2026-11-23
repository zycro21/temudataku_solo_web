import { PrismaClient, Prisma } from "@prisma/client";
import { toWibIso } from "../utils/dateRange.js";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// KONFIGURASI
// ---------------------------------------------------------------------------

// Tabel yang TIDAK ikut diekspor:
// - dummy data: companies, jobs
// - semua yang berkaitan dengan practice: practices, practice_files,
//   practice_materials, practice_progress, practice_purchases, dst
const EXCLUDED_TABLES = new Set(["companies", "jobs", "practices"]);
const EXCLUDED_TABLE_PREFIXES = ["practice_"];

const isExcludedTable = (table: string) =>
  EXCLUDED_TABLES.has(table) ||
  EXCLUDED_TABLE_PREFIXES.some((p) => table.startsWith(p));

// Kolom kredensial/rahasia yang tidak dikirim karena endpoint ini publik.
// Nama = nama kolom asli di database. Kosongkan objek ini kalau memang
// ingin SEMUA kolom tanpa kecuali.
const EXCLUDED_COLUMNS: Record<string, string[]> = {
  users: ["password_hash", "verification_token", "fcmToken", "googleId"],
  form_responses: ["edit_token"],
  form_answer_files: ["storage_path"],
  withdrawal_methods: ["accountNumber"],
};

// Kolom bertipe DATE (tanpa jam) -> ditampilkan "YYYY-MM-DD", bukan WIB datetime
const DATE_ONLY_COLUMNS = new Set(["form_answers.value_date"]);

// Jumlah tabel yang dibaca bersamaan (supaya pool koneksi Prisma tidak habis)
const CONCURRENCY = 5;

// ---------------------------------------------------------------------------
// DAFTAR TABEL (otomatis dari skema Prisma, jadi tabel baru ikut terbaca)
// ---------------------------------------------------------------------------

type TableMeta = {
  table: string;
  columns: string[];
  orderBy: string | null;
};

const TABLES: TableMeta[] = Prisma.dmmf.datamodel.models
  .map((m) => {
    const table = m.dbName ?? m.name;
    const hidden = new Set(EXCLUDED_COLUMNS[table] ?? []);

    // Nama kolom persis seperti di DB: pakai @map kalau ada, kalau tidak nama field
    const columns = m.fields
      .filter((f) => f.kind !== "object") // lewati relasi
      .map((f) => f.dbName ?? f.name)
      .filter((c) => !hidden.has(c));

    const idField = m.fields.find((f) => f.isId);
    return {
      table,
      columns,
      orderBy: idField ? (idField.dbName ?? idField.name) : null,
    };
  })
  .filter(({ table }) => !isExcludedTable(table))
  .sort((a, b) => a.table.localeCompare(b.table));

// ---------------------------------------------------------------------------
// HELPER
// ---------------------------------------------------------------------------

const quote = (id: string) => `"${id.replace(/"/g, '""')}"`;

const normalize = (table: string, column: string, value: unknown) => {
  if (value instanceof Date) {
    return DATE_ONLY_COLUMNS.has(`${table}.${column}`)
      ? value.toISOString().slice(0, 10)
      : toWibIso(value); // waktu dalam WIB (+07:00), sama seperti endpoint lain
  }
  if (Prisma.Decimal.isDecimal(value))
    return (value as Prisma.Decimal).toNumber();
  if (typeof value === "bigint") return value.toString();
  return value;
};

const readTable = async ({ table, columns, orderBy }: TableMeta) => {
  // Nama tabel & kolom berasal dari skema Prisma (bukan input user)
  const sql =
    `SELECT ${columns.map(quote).join(", ")} FROM ${quote(table)}` +
    (orderBy ? ` ORDER BY ${quote(orderBy)}` : "");

  const raw = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(sql);

  const rows = raw.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        normalize(table, key, value),
      ]),
    ),
  );

  return { table, columns, total: rows.length, rows };
};

// ---------------------------------------------------------------------------
// SERVICE
// ---------------------------------------------------------------------------

/**
 * Semua data database dalam satu response, dikelompokkan per tabel:
 * data.<nama_tabel> = { columns, total, rows }
 */
export const getAllData = async () => {
  const data: Record<
    string,
    { columns: string[]; total: number; rows: Record<string, unknown>[] }
  > = {};
  let totalRows = 0;

  for (let i = 0; i < TABLES.length; i += CONCURRENCY) {
    const results = await Promise.all(
      TABLES.slice(i, i + CONCURRENCY).map(readTable),
    );
    for (const { table, ...rest } of results) {
      data[table] = rest;
      totalRows += rest.total;
    }
  }

  return {
    generatedAt: toWibIso(new Date()),
    totalTables: TABLES.length,
    totalRows,
    data,
  };
};
