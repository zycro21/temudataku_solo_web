import crypto from "crypto";

// Prefix per entitas modul Form. Ubah format ID cukup di file ini.
const PREFIX = {
  form: "frm",
  section: "fsc",
  item: "fit",
  option: "fop",
  response: "frs",
  answer: "fan",
  selection: "fas",
  file: "faf",
} as const;

export type FormIdKind = keyof typeof PREFIX;

// ID dibuat di aplikasi dari CSPRNG (128 bit), tanpa baca-lalu-tulis ke DB
// (tidak ada counter / MAX+1), jadi dua request bersamaan tidak bisa
// menghasilkan ID yang sama. PRIMARY KEY di database tetap jadi pengaman
// terakhir: kalau (nyaris mustahil) bentrok, insert gagal dengan P2002,
// bukan menimpa/menggandakan data.
export function newFormId(kind: FormIdKind): string {
  return `${PREFIX[kind]}_${crypto.randomBytes(16).toString("base64url")}`; // 26 karakter
}