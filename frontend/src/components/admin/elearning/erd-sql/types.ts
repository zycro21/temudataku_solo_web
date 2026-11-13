export type GroupKey =
  | "pelanggan"
  | "katalog"
  | "transaksi"
  | "logistik"
  | "ulasan";
export type KeyFlag = "PK" | "FK" | "UQ";

export interface ColumnStat {
  /** Sebaran nilai (untuk kolom dengan sedikit nilai unik): [nilai, jumlah baris] */
  dist?: [string, number][];
  /** Nilai minimum dan maksimum (tanggal / angka) */
  range?: [string | number, string | number];
  /** Jumlah baris bernilai NULL */
  nulls?: number;
}

export interface ColumnDef {
  name: string;
  type: string;
  keys: KeyFlag[];
  nullable: boolean;
  /** Tabel dan kolom yang dirujuk (khusus FK) */
  ref: [string, string] | null;
  desc: string;
  stat?: ColumnStat;
}

export interface TableDef {
  name: string;
  group: GroupKey;
  /** Posisi di kanvas (grid 3 kolom) */
  col: 1 | 2 | 3;
  row: 1 | 2 | 3;
  summary: string;
  role: string;
  rows: number;
  columns: ColumnDef[];
  notes: string[];
  queries: { title: string; sql: string }[];
}

export interface RelationDef {
  id: string;
  parent: string;
  child: string;
  parentCols: string[];
  childCols: string[];
  /** Label di ujung garis */
  parentLabel: string;
  childLabel: string;
  desc: string;
  /** Contoh JOIN */
  joinSql: string;
}
