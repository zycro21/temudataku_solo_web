import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { newFormId } from "./form_id.js";
import {
  formAnswerFilesPath,
  formAnswerFileTypeGroups,
} from "../middlewares/uploadImage.js";
import type {
  PublicAnswerInput,
  SubmitResponseInput,
} from "../validations/form_public.validation.js";

const prisma = new PrismaClient();

// ─── Error & tipe umum ──────────────────────────────────────────────────────

export class FormError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(
    status: number,
    message: string,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Responder: bisa anonim (undefined) atau user yang login
export type PublicUser =
  | { userId: string; roles: string[]; email?: string; fullName?: string }
  | undefined;

type FieldError = { itemId?: string; field?: string; message: string };

type NormalizedAnswer = {
  itemId: string;
  item: any;
  valueText: string | null;
  valueNumber: number | null;
  valueDate: Date | null;
  selections: {
    optionId: string;
    optionLabel: string;
    rowOptionId: string | null;
    rowLabel: string | null;
  }[];
  newFiles: Express.Multer.File[];
  keepFileIds: string[];
};

const ANSWERABLE_TYPES = [
  "SHORT_ANSWER",
  "PARAGRAPH",
  "MULTIPLE_CHOICE",
  "CHECKBOXES",
  "DROPDOWN",
  "FILE_UPLOAD",
  "LINEAR_SCALE",
  "RATING",
  "MULTIPLE_CHOICE_GRID",
  "CHECKBOX_GRID",
  "DATE",
  "TIME_DURATION",
];
const GRID_TYPES = ["MULTIPLE_CHOICE_GRID", "CHECKBOX_GRID"];
const BRANCHING_TYPES = ["MULTIPLE_CHOICE", "DROPDOWN"];

const structureInclude = {
  sections: {
    where: { deletedAt: null },
    orderBy: { orderNumber: "asc" as const },
    include: {
      items: {
        where: { deletedAt: null },
        orderBy: { orderNumber: "asc" as const },
        include: {
          options: {
            where: { deletedAt: null },
            orderBy: { orderNumber: "asc" as const },
          },
        },
      },
    },
  },
};

// ─── Helper file ────────────────────────────────────────────────────────────

function safeUnlink(absPath: string) {
  try {
    if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
  } catch {
    /* best-effort */
  }
}

function deleteUploadedFiles(files: Express.Multer.File[]) {
  for (const f of files) if (f.path) safeUnlink(f.path);
}

function deleteStoredAnswerFiles(storagePaths: string[]) {
  for (const p of storagePaths) {
    safeUnlink(path.join(formAnswerFilesPath, path.basename(p)));
  }
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

// ─── Status penerimaan response (BEDA dari status Publish) ──────────────────

function computeAvailability(
  form: any,
  now: Date,
  opts: { ignoreLimit?: boolean } = {},
): { isOpen: boolean; reason?: string; message?: string } {
  const closed = (reason: string, fallback: string) => ({
    isOpen: false,
    reason,
    message: form.closedMessage || fallback,
  });

  if (!form.acceptingResponses) {
    return closed("MANUALLY_CLOSED", "Form ini sedang tidak menerima respons.");
  }
  if (form.periodEnabled) {
    if (form.openAt && now < form.openAt) {
      return closed("NOT_YET_OPEN", "Form ini belum dibuka.");
    }
    if (form.closeAt && now > form.closeAt) {
      return closed(
        "PERIOD_ENDED",
        "Periode pengisian form ini sudah berakhir.",
      );
    }
  }
  if (
    !opts.ignoreLimit &&
    form.responseLimitEnabled &&
    form.responseLimit != null &&
    form.submittedResponseCount >= form.responseLimit
  ) {
    return closed("LIMIT_REACHED", "Batas jumlah responden sudah tercapai.");
  }
  return { isOpen: true };
}

// Struktur form untuk renderer responden (tanpa data internal)
function serializeForRenderer(form: any) {
  return {
    id: form.id,
    slug: form.slug,
    type: form.type,
    title: form.title,
    description: form.description,
    event:
      form.type === "EVENT" && form.eventId
        ? { id: form.eventId, name: form.eventNameSnapshot }
        : null,
    theme: {
      headerImage: form.headerImage,
      themeColor: form.themeColor,
      backgroundColor: form.backgroundColor,
      fontPreset: form.fontPreset,
    },
    settings: {
      responderAccess: form.responderAccess,
      collectEmail: form.collectEmail,
      allowEditResponse: form.allowEditResponse,
      allowResponderDraft: form.allowResponderDraft,
      shuffleQuestionOrder: form.shuffleQuestionOrder,
      confirmationMessage: form.confirmationMessage,
    },
    sections: form.sections.map((s: any) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      nextAction: s.nextAction,
      nextSectionId: s.nextSectionId,
      items: s.items.map((it: any) => ({
        id: it.id,
        type: it.type,
        title: it.title,
        description: it.description,
        isRequired: it.isRequired,
        shuffleOptions: it.shuffleOptions,
        validation: it.validation,
        config: it.config,
        options: it.options.map((o: any) => ({
          id: o.id,
          kind: o.kind,
          label: o.label,
          branchAction: o.branchAction,
          branchSectionId: o.branchSectionId,
        })),
      })),
    })),
  };
}

async function getPublishedFormBySlug(slug: string) {
  const form = await prisma.form.findUnique({
    where: { slug },
    include: structureInclude,
  });
  // Draft / Unpublish / Archived = nggak bisa diakses responder
  if (!form || form.status !== "PUBLISHED") {
    throw new FormError(
      404,
      "Form tidak ditemukan atau belum dipublikasikan",
      "FORM_NOT_FOUND",
    );
  }
  return form as any;
}

function assertAccess(form: any, user: PublicUser) {
  if (form.responderAccess === "LOGIN_REQUIRED" && !user) {
    throw new FormError(
      401,
      "Silakan login untuk mengisi form ini",
      "LOGIN_REQUIRED",
      { title: form.title },
    );
  }
}

// ─── Halaman publik: form & daftar form di halaman Event ───────────────────

export async function getPublicForm(slug: string, user: PublicUser) {
  const form = await getPublishedFormBySlug(slug);
  assertAccess(form, user);

  const availability = computeAvailability(form, new Date());

  let userState: Record<string, unknown> | null = null;
  if (user) {
    const [submitted, draft] = await Promise.all([
      prisma.formResponse.findFirst({
        where: { formId: form.id, userId: user.userId, status: "SUBMITTED" },
        orderBy: { submittedAt: "desc" },
        select: { id: true },
      }),
      form.allowResponderDraft
        ? prisma.formResponse.findFirst({
            where: { formId: form.id, userId: user.userId, status: "DRAFT" },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    userState = {
      hasSubmitted: !!submitted,
      submittedResponseId: submitted?.id ?? null,
      canEditResponse: !!submitted && form.allowEditResponse,
      isBlocked:
        !!submitted &&
        form.limitOneResponsePerAccount &&
        !form.allowEditResponse,
      draftResponseId: draft?.id ?? null,
    };
  }

  return { form: serializeForRenderer(form), availability, userState };
}

export async function listEventForms(eventId: string) {
  const forms = await prisma.form.findMany({
    where: {
      type: "EVENT",
      eventId,
      status: "PUBLISHED",
      showOnEventPage: true,
    },
    orderBy: { publishedAt: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      headerImage: true,
      themeColor: true,
      responderAccess: true,
      acceptingResponses: true,
      responseLimitEnabled: true,
      responseLimit: true,
      periodEnabled: true,
      openAt: true,
      closeAt: true,
      submittedResponseCount: true,
      closedMessage: true,
    },
  });

  const now = new Date();
  return forms.map((f: any) => ({
    id: f.id,
    slug: f.slug,
    title: f.title,
    description: f.description,
    headerImage: f.headerImage,
    themeColor: f.themeColor,
    requiresLogin: f.responderAccess === "LOGIN_REQUIRED",
    availability: computeAvailability(f, now),
  }));
}

// ─── Validasi aturan jawaban (FormItem.validation) ──────────────────────────

function applyRule(
  rule: any,
  ctx: { text?: string; count?: number },
): string | null {
  if (!rule) return null;
  const msg = (fallback: string) => rule.message || fallback;

  switch (rule.kind) {
    case "number": {
      const raw = (ctx.text ?? "").trim().replace(",", ".");
      const n = Number(raw);
      if (raw === "" || !Number.isFinite(n)) return msg("Harus berupa angka");
      switch (rule.op) {
        case "between":
          return n >= rule.min && n <= rule.max
            ? null
            : msg(`Angka harus antara ${rule.min} dan ${rule.max}`);
        case "notBetween":
          return n < rule.min || n > rule.max
            ? null
            : msg(`Angka tidak boleh antara ${rule.min} dan ${rule.max}`);
        case "gt":
          return n > rule.value
            ? null
            : msg(`Angka harus lebih besar dari ${rule.value}`);
        case "gte":
          return n >= rule.value
            ? null
            : msg(`Angka harus minimal ${rule.value}`);
        case "lt":
          return n < rule.value
            ? null
            : msg(`Angka harus lebih kecil dari ${rule.value}`);
        case "lte":
          return n <= rule.value
            ? null
            : msg(`Angka harus maksimal ${rule.value}`);
        case "eq":
          return n === rule.value
            ? null
            : msg(`Angka harus sama dengan ${rule.value}`);
        case "neq":
          return n !== rule.value
            ? null
            : msg(`Angka tidak boleh ${rule.value}`);
        case "integer":
          return Number.isInteger(n)
            ? null
            : msg("Harus berupa bilangan bulat");
      }
      return null;
    }
    case "text": {
      const text = ctx.text ?? "";
      const lower = text.toLowerCase();
      switch (rule.op) {
        case "contains":
          return lower.includes(String(rule.value).toLowerCase())
            ? null
            : msg(`Harus mengandung "${rule.value}"`);
        case "notContains":
          return !lower.includes(String(rule.value).toLowerCase())
            ? null
            : msg(`Tidak boleh mengandung "${rule.value}"`);
        case "email":
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)
            ? null
            : msg("Format email tidak valid");
        case "url":
          try {
            const u = new URL(text);
            return u.protocol === "http:" || u.protocol === "https:"
              ? null
              : msg("URL harus diawali http:// atau https://");
          } catch {
            return msg("Format URL tidak valid");
          }
      }
      return null;
    }
    case "length": {
      const len = (ctx.text ?? "").length;
      if (rule.op === "min" && len < rule.value)
        return msg(`Minimal ${rule.value} karakter`);
      if (rule.op === "max" && len > rule.value)
        return msg(`Maksimal ${rule.value} karakter`);
      return null;
    }
    case "regex": {
      let re: RegExp;
      try {
        re = new RegExp(rule.value);
      } catch {
        return null; // regex rusak: jangan blokir responder
      }
      const ok = re.test(ctx.text ?? "");
      if (rule.op === "notMatches")
        return ok ? msg("Format jawaban tidak sesuai") : null;
      return ok ? null : msg("Format jawaban tidak sesuai");
    }
    case "selectCount": {
      const count = ctx.count ?? 0;
      if (rule.op === "atLeast" && count < rule.value)
        return msg(`Pilih minimal ${rule.value}`);
      if (rule.op === "atMost" && count > rule.value)
        return msg(`Pilih maksimal ${rule.value}`);
      if (rule.op === "exactly" && count !== rule.value)
        return msg(`Pilih tepat ${rule.value}`);
      return null;
    }
  }
  return null;
}

// ─── Normalisasi satu jawaban sesuai tipe pertanyaan ────────────────────────
// Return null = "tidak dijawab" (kosong) ATAU gagal (error dicatat ke `errors`).

function parseAnswerForItem(
  item: any,
  input: PublicAnswerInput | undefined,
  files: Express.Multer.File[],
  strict: boolean,
  errors: FieldError[],
): NormalizedAnswer | null {
  const base = (): NormalizedAnswer => ({
    itemId: item.id,
    item,
    valueText: null,
    valueNumber: null,
    valueDate: null,
    selections: [],
    newFiles: [],
    keepFileIds: [],
  });
  const fail = (message: string) => {
    errors.push({ itemId: item.id, message });
    return null;
  };
  const cfg = (item.config ?? {}) as any;
  const optionsOf = (kind: string) =>
    item.options.filter((o: any) => o.kind === kind);

  switch (item.type) {
    case "SHORT_ANSWER":
    case "PARAGRAPH": {
      const text = (input?.text ?? "").trim();
      if (!text) return null;
      const max = item.type === "SHORT_ANSWER" ? 1000 : 10000;
      if (text.length > max) return fail(`Maksimal ${max} karakter`);
      if (strict) {
        const err = applyRule(item.validation, { text });
        if (err) return fail(err);
      }
      const a = base();
      a.valueText = text;
      return a;
    }

    case "TIME_DURATION": {
      const text = (input?.text ?? "").trim();
      if (!text) return null;
      const m = /^(\d{1,3}):([0-5]\d)(?::([0-5]\d))?$/.exec(text);
      if (!m) return fail("Format harus HH:mm atau HH:mm:ss");
      const hours = Number(m[1]);
      if ((cfg.mode ?? "time") === "time" && hours > 23) {
        return fail("Jam harus antara 00 dan 23");
      }
      const a = base();
      a.valueText = `${String(hours).padStart(2, "0")}:${m[2]}:${m[3] ?? "00"}`;
      return a;
    }

    case "DATE": {
      const date = input?.date;
      if (!date) return null;
      const d = new Date(`${date}T00:00:00.000Z`);
      if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== date) {
        return fail("Tanggal tidak valid");
      }
      const a = base();
      a.valueDate = d;
      return a;
    }

    case "LINEAR_SCALE":
    case "RATING": {
      if (input?.number === undefined) return null;
      const min = item.type === "RATING" ? 1 : (cfg.min ?? 1);
      const max = cfg.max ?? 5;
      if (input.number < min || input.number > max) {
        return fail(`Nilai harus antara ${min} dan ${max}`);
      }
      const a = base();
      a.valueNumber = input.number;
      return a;
    }

    case "MULTIPLE_CHOICE":
    case "DROPDOWN":
    case "CHECKBOXES": {
      const ids = [...new Set(input?.optionIds ?? [])];
      if (ids.length === 0) return null;
      if (item.type !== "CHECKBOXES" && ids.length > 1) {
        return fail("Hanya boleh memilih satu");
      }
      const byId = new Map<string, any>(
        optionsOf("CHOICE").map((o: any) => [o.id, o]),
      );
      const selections: NormalizedAnswer["selections"] = [];
      for (const id of ids) {
        const o = byId.get(id);
        if (!o) return fail("Ada pilihan yang tidak valid");
        selections.push({
          optionId: o.id,
          optionLabel: o.label,
          rowOptionId: null,
          rowLabel: null,
        });
      }
      if (strict && item.type === "CHECKBOXES") {
        const err = applyRule(item.validation, { count: ids.length });
        if (err) return fail(err);
      }
      const a = base();
      a.selections = selections;
      return a;
    }

    case "MULTIPLE_CHOICE_GRID":
    case "CHECKBOX_GRID": {
      const grid = input?.grid ?? [];
      const rows = new Map<string, any>(
        optionsOf("GRID_ROW").map((o: any) => [o.id, o]),
      );
      const cols = new Map<string, any>(
        optionsOf("GRID_COLUMN").map((o: any) => [o.id, o]),
      );
      const seenRows = new Set<string>();
      const usedCols = new Set<string>();
      const selections: NormalizedAnswer["selections"] = [];

      for (const g of grid) {
        if (seenRows.has(g.rowId)) return fail("Ada baris yang dikirim ganda");
        seenRows.add(g.rowId);
        const row = rows.get(g.rowId);
        if (!row) return fail("Ada baris yang tidak valid");

        const colIds = [...new Set(g.optionIds)];
        if (colIds.length === 0) continue;
        if (item.type === "MULTIPLE_CHOICE_GRID" && colIds.length > 1) {
          return fail(`Baris "${row.label}" hanya boleh satu pilihan`);
        }
        for (const cid of colIds) {
          const col = cols.get(cid);
          if (!col) return fail("Ada kolom yang tidak valid");
          if (
            strict &&
            item.type === "MULTIPLE_CHOICE_GRID" &&
            cfg.oneResponsePerColumn &&
            usedCols.has(cid)
          ) {
            return fail("Setiap kolom hanya boleh dipilih satu kali");
          }
          usedCols.add(cid);
          selections.push({
            optionId: col.id,
            optionLabel: col.label,
            rowOptionId: row.id,
            rowLabel: row.label,
          });
        }
      }
      if (selections.length === 0) return null;
      const a = base();
      a.selections = selections;
      return a;
    }

    case "FILE_UPLOAD": {
      const keep = [...new Set(input?.keepFileIds ?? [])];
      if (files.length === 0 && keep.length === 0) return null;

      const maxFiles = cfg.maxFiles ?? 1;
      const maxMb = cfg.maxSizeMb ?? 10;
      const groups: string[] = cfg.allowedTypes?.length
        ? cfg.allowedTypes
        : Object.keys(formAnswerFileTypeGroups);
      const allowedExt = new Set(
        groups.flatMap((g) => formAnswerFileTypeGroups[g] ?? []),
      );

      if (files.length + keep.length > maxFiles) {
        return fail(`Maksimal ${maxFiles} file`);
      }
      for (const f of files) {
        const ext = path.extname(f.originalname).toLowerCase();
        if (!allowedExt.has(ext)) {
          return fail(
            `Format file ${ext} tidak diizinkan untuk pertanyaan ini`,
          );
        }
        if (f.size > maxMb * 1024 * 1024) {
          return fail(`Ukuran file maksimal ${maxMb} MB`);
        }
      }
      const a = base();
      a.newFiles = files;
      a.keepFileIds = keep;
      return a;
    }
  }
  return null;
}

// ─── Alur section: section mana saja yang dilewati responder ────────────────
// Urutan prioritas pada satu section: option branching (pertanyaan pertama
// yang pilihannya punya aksi selain NEXT) menang atas navigasi akhir section.

function computeVisitedSections(
  form: any,
  answered: Map<string, NormalizedAnswer>,
): Set<string> {
  const sections: any[] = form.sections;
  const byId = new Map<string, any>(sections.map((s) => [s.id, s]));
  const visited = new Set<string>();
  let current: any = sections[0];

  while (current) {
    if (visited.has(current.id)) {
      throw new FormError(
        400,
        "Alur section form tidak valid (terdeteksi loop)",
        "SECTION_LOOP",
      );
    }
    visited.add(current.id);

    let action: string = current.nextAction;
    let target: string | null = current.nextSectionId;

    for (const it of current.items) {
      if (!BRANCHING_TYPES.includes(it.type)) continue;
      const a = answered.get(it.id);
      if (!a || a.selections.length === 0) continue;
      const chosen = it.options.find(
        (o: any) => o.id === a.selections[0].optionId,
      );
      if (chosen && chosen.branchAction !== "NEXT") {
        action = chosen.branchAction;
        target = chosen.branchSectionId;
        break;
      }
    }

    if (action === "SUBMIT") break;
    if (action === "GO_TO_SECTION") {
      current = target ? byId.get(target) : undefined;
      continue;
    }
    const idx = sections.findIndex((s) => s.id === current.id);
    current = sections[idx + 1];
  }

  return visited;
}

// ─── Siapkan semua jawaban ──────────────────────────────────────────────────
// mode "strict": submit/edit — required, aturan validasi, dan alur section
//                dicek; jawaban di section yang tidak dilewati dibuang.
// mode "draft" : autosave — cuma cek bentuk (ID valid, tipe cocok).

function prepareAnswers(
  form: any,
  input: PublicAnswerInput[],
  files: Express.Multer.File[],
  mode: "strict" | "draft",
): { answers: NormalizedAnswer[]; droppedFiles: Express.Multer.File[] } {
  const strict = mode === "strict";

  const itemsById = new Map<string, any>();
  const sectionOfItem = new Map<string, string>();
  for (const s of form.sections) {
    for (const it of s.items) {
      if (ANSWERABLE_TYPES.includes(it.type)) {
        itemsById.set(it.id, it);
        sectionOfItem.set(it.id, s.id);
      }
    }
  }

  const inputById = new Map<string, PublicAnswerInput>();
  for (const a of input) {
    if (!itemsById.has(a.itemId)) {
      throw new FormError(400, `Pertanyaan ${a.itemId} tidak ada di form ini`);
    }
    if (inputById.has(a.itemId)) {
      throw new FormError(
        400,
        `Jawaban untuk pertanyaan ${a.itemId} dikirim lebih dari sekali`,
      );
    }
    inputById.set(a.itemId, a);
  }

  const filesByItem = new Map<string, Express.Multer.File[]>();
  for (const f of files) {
    const itemId = f.fieldname.startsWith("file:") ? f.fieldname.slice(5) : "";
    const item = itemsById.get(itemId);
    if (!item || item.type !== "FILE_UPLOAD") {
      throw new FormError(
        400,
        `File dikirim untuk pertanyaan yang bukan File Upload (${itemId || f.fieldname})`,
      );
    }
    filesByItem.set(itemId, [...(filesByItem.get(itemId) ?? []), f]);
  }

  const parseErrors: FieldError[] = [];
  const parsed: NormalizedAnswer[] = [];
  for (const [itemId, item] of itemsById) {
    const inp = inputById.get(itemId);
    const fl = filesByItem.get(itemId) ?? [];
    if (!inp && fl.length === 0) continue;
    const result = parseAnswerForItem(item, inp, fl, strict, parseErrors);
    if (result) parsed.push(result);
  }

  if (!strict) {
    if (parseErrors.length > 0) {
      throw new FormError(
        400,
        "Jawaban belum valid",
        "VALIDATION_FAILED",
        parseErrors,
      );
    }
    return { answers: parsed, droppedFiles: [] };
  }

  const answeredMap = new Map(parsed.map((a) => [a.itemId, a]));
  const visited = computeVisitedSections(form, answeredMap);

  // error di section yang tidak dilewati diabaikan (jawabannya dibuang)
  const errors: FieldError[] = parseErrors.filter((e) =>
    visited.has(sectionOfItem.get(e.itemId!)!),
  );

  const kept: NormalizedAnswer[] = [];
  const droppedFiles: Express.Multer.File[] = [];
  for (const a of parsed) {
    if (visited.has(sectionOfItem.get(a.itemId)!)) kept.push(a);
    else droppedFiles.push(...a.newFiles);
  }
  // file untuk jawaban yang gagal parse juga dibuang dari disk
  const parsedIds = new Set(parsed.map((a) => a.itemId));
  for (const [itemId, fl] of filesByItem) {
    if (!parsedIds.has(itemId)) droppedFiles.push(...fl);
  }

  for (const s of form.sections) {
    if (!visited.has(s.id)) continue;
    for (const it of s.items) {
      if (!ANSWERABLE_TYPES.includes(it.type)) continue;
      const a = answeredMap.get(it.id);
      const alreadyFailed = errors.some((e) => e.itemId === it.id);

      if (it.isRequired && !a && !alreadyFailed) {
        errors.push({ itemId: it.id, message: "Wajib diisi" });
      }
      if (
        a &&
        GRID_TYPES.includes(it.type) &&
        (it.config as any)?.requireEachRow
      ) {
        const rowCount = it.options.filter(
          (o: any) => o.kind === "GRID_ROW",
        ).length;
        const answeredRows = new Set(a.selections.map((s2) => s2.rowOptionId))
          .size;
        if (answeredRows < rowCount) {
          errors.push({ itemId: it.id, message: "Setiap baris wajib diisi" });
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new FormError(
      400,
      "Jawaban belum valid",
      "VALIDATION_FAILED",
      errors,
    );
  }
  return { answers: kept, droppedFiles };
}

// ─── Simpan jawaban (ganti seluruh jawaban sebuah response) ─────────────────
// File lama yang dipertahankan (keepFileIds) dibuat ulang barisnya dengan
// storagePath yang sama; file lama yang tidak dipertahankan dikembalikan
// path-nya supaya dihapus dari disk SETELAH transaksi commit.

async function replaceAnswers(
  tx: any,
  responseId: string,
  answers: NormalizedAnswer[],
): Promise<string[]> {
  const old = await tx.formAnswer.findMany({
    where: { responseId },
    include: { files: true },
  });
  const oldFiles = new Map<string, { itemId: string; file: any }>();
  for (const a of old) {
    for (const f of a.files) oldFiles.set(f.id, { itemId: a.itemId, file: f });
  }

  await tx.formAnswer.deleteMany({ where: { responseId } });

  const kept = new Set<string>();
  for (const a of answers) {
    const files: {
      originalName: string;
      storagePath: string;
      mimeType: string | null;
      sizeBytes: number;
    }[] = [];

    for (const f of a.newFiles) {
      files.push({
        originalName: f.originalname,
        storagePath: `formAnswerFiles/${f.filename}`,
        mimeType: f.mimetype ?? null,
        sizeBytes: f.size,
      });
    }
    for (const id of a.keepFileIds) {
      const o = oldFiles.get(id);
      if (!o || o.itemId !== a.itemId) {
        throw new FormError(400, "File yang dipertahankan tidak ditemukan");
      }
      kept.add(id);
      files.push({
        originalName: o.file.originalName,
        storagePath: o.file.storagePath,
        mimeType: o.file.mimeType,
        sizeBytes: o.file.sizeBytes,
      });
    }

    await tx.formAnswer.create({
      data: {
        id: newFormId("answer"),
        responseId,
        itemId: a.itemId,
        itemTypeSnapshot: a.item.type,
        itemTitleSnapshot: a.item.title,
        valueText: a.valueText,
        valueNumber: a.valueNumber,
        valueDate: a.valueDate,
        selections: {
          create: a.selections.map((s) => ({
            id: newFormId("selection"),
            optionId: s.optionId,
            rowOptionId: s.rowOptionId,
            optionLabelSnapshot: s.optionLabel,
            rowLabelSnapshot: s.rowLabel,
          })),
        },
        files: { create: files.map((f) => ({ id: newFormId("file"), ...f })) },
      },
    });
  }

  return [...oldFiles.entries()]
    .filter(([id]) => !kept.has(id))
    .map(([, v]) => v.file.storagePath as string);
}

// ─── Bentuk response untuk responder (prefill edit / lanjut draft) ──────────

function serializeResponseForRespondent(response: any) {
  return {
    id: response.id,
    status: response.status,
    respondentEmail: response.respondentEmail,
    submittedAt: response.submittedAt,
    updatedAt: response.updatedAt,
    answers: response.answers.map((a: any) => {
      const plain = a.selections.filter((s: any) => !s.rowOptionId);
      const gridMap = new Map<string, string[]>();
      for (const s of a.selections) {
        if (!s.rowOptionId) continue;
        gridMap.set(s.rowOptionId, [
          ...(gridMap.get(s.rowOptionId) ?? []),
          s.optionId,
        ]);
      }
      return {
        itemId: a.itemId,
        text: a.valueText,
        number: a.valueNumber,
        date: a.valueDate
          ? new Date(a.valueDate).toISOString().slice(0, 10)
          : null,
        optionIds: plain.map((s: any) => s.optionId),
        grid: [...gridMap.entries()].map(([rowId, optionIds]) => ({
          rowId,
          optionIds,
        })),
        files: a.files.map((f: any) => ({
          id: f.id,
          originalName: f.originalName,
          mimeType: f.mimeType,
          sizeBytes: f.sizeBytes,
        })),
      };
    }),
  };
}

async function loadOwnedResponse(
  formId: string,
  responseId: string,
  user: PublicUser,
  editToken?: string,
) {
  const response = await prisma.formResponse.findFirst({
    where: { id: responseId, formId },
    include: { answers: { include: { selections: true, files: true } } },
  });
  if (!response) throw new FormError(404, "Response tidak ditemukan");

  const r = response as any;
  const byUser = !!user && r.userId === user.userId;
  const byToken =
    !!editToken && !!r.editToken && safeEqual(editToken, r.editToken);
  if (!byUser && !byToken) {
    throw new FormError(403, "Kamu tidak punya akses ke response ini");
  }
  return r;
}

function resolveEmail(
  form: any,
  user: PublicUser,
  inputEmail: string | undefined,
  fallback?: string | null,
): string | null {
  const email = inputEmail ?? fallback ?? user?.email ?? null;
  if (form.collectEmail && !email) {
    throw new FormError(400, "Email wajib diisi", "VALIDATION_FAILED", [
      { field: "email", message: "Email wajib diisi" },
    ]);
  }
  return email;
}

// Hook setelah submit berhasil (receipt ke responder, notifikasi ke pembuat
// form). Dipanggil best-effort: kegagalan di sini TIDAK boleh menggagalkan
// submit yang sudah tersimpan.
async function afterResponseSubmitted(_ctx: {
  form: any;
  responseId: string;
  email: string | null;
  editToken: string | null;
}) {
  // TODO: sambungkan ke mailer yang sudah ada.
  //  - form.sendResponseReceipt && email   -> kirim receipt (sertakan link edit
  //    bila form.allowEditResponse; untuk anonim pakai editToken)
  //  - form.notifyOnNewResponse            -> kirim email ke pembuat form
  //    (form.createdById) — penerima belum ditentukan di PRD
}

function submitResult(form: any, response: any, replay: boolean) {
  return {
    responseId: response.id,
    status: "SUBMITTED",
    submittedAt: response.submittedAt,
    editToken: response.editToken ?? null,
    confirmationMessage: form.confirmationMessage ?? null,
    replay,
  };
}

// ─── Submit response final ──────────────────────────────────────────────────

export async function submitFormResponse(
  slug: string,
  user: PublicUser,
  input: SubmitResponseInput,
  files: Express.Multer.File[],
) {
  let committed = false;

  try {
    const form = await getPublishedFormBySlug(slug);
    assertAccess(form, user);

    // Retry dengan idempotencyKey yang sama -> kembalikan hasil sebelumnya.
    // Dicek SEBELUM availability supaya retry tetap sukses walau form baru
    // saja ditutup.
    if (input.idempotencyKey) {
      const existing = await prisma.formResponse.findUnique({
        where: {
          formId_idempotencyKey: {
            formId: form.id,
            idempotencyKey: input.idempotencyKey,
          },
        },
        select: { id: true, status: true, submittedAt: true, editToken: true },
      });
      if (existing && existing.status === "SUBMITTED") {
        deleteUploadedFiles(files);
        return submitResult(form, existing, true);
      }
    }

    const availability = computeAvailability(form, new Date());
    if (!availability.isOpen) {
      throw new FormError(403, availability.message!, availability.reason);
    }

    const email = resolveEmail(form, user, input.email);
    const { answers, droppedFiles } = prepareAnswers(
      form,
      input.answers,
      files,
      "strict",
    );
    const editToken =
      form.allowEditResponse && !user
        ? crypto.randomBytes(24).toString("base64url")
        : null;

    let orphanPaths: string[] = [];
    let created: { id: string; submittedAt: Date };

    try {
      created = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const t = tx as any;

          // Naikkan counter hanya kalau limit belum tercapai. UPDATE ini juga
          // mengunci baris form, jadi submit paralel ke form yang sama
          // diproses bergantian (aman untuk limit & "satu response per akun").
          const bumped: number = await t.$executeRaw`
            UPDATE "forms"
            SET "submitted_response_count" = "submitted_response_count" + 1
            WHERE "id" = ${form.id}
              AND ("response_limit_enabled" = false
                   OR "response_limit" IS NULL
                   OR "submitted_response_count" < "response_limit")`;
          if (bumped === 0) {
            throw new FormError(
              409,
              form.closedMessage || "Batas jumlah responden sudah tercapai.",
              "LIMIT_REACHED",
            );
          }

          if (user && form.limitOneResponsePerAccount) {
            const prev = await t.formResponse.findFirst({
              where: {
                formId: form.id,
                userId: user.userId,
                status: "SUBMITTED",
              },
              select: { id: true },
            });
            if (prev) {
              throw new FormError(
                409,
                "Kamu sudah mengisi form ini",
                "ALREADY_SUBMITTED",
                { responseId: prev.id, canEdit: form.allowEditResponse },
              );
            }
          }

          // Kalau responder punya draft, draft itu yang di-submit (bukan bikin baru)
          const draft = user
            ? await t.formResponse.findFirst({
                where: {
                  formId: form.id,
                  userId: user.userId,
                  status: "DRAFT",
                },
                select: { id: true },
              })
            : null;

          const now = new Date();
          let responseId: string;

          if (draft) {
            await t.formResponse.update({
              where: { id: draft.id },
              data: {
                status: "SUBMITTED",
                submittedAt: now,
                respondentEmail: email,
                idempotencyKey: input.idempotencyKey ?? null,
                editToken,
              },
            });
            responseId = draft.id;
          } else {
            const row = await t.formResponse.create({
              data: {
                id: newFormId("response"),
                formId: form.id,
                userId: user?.userId ?? null,
                respondentEmail: email,
                status: "SUBMITTED",
                submittedAt: now,
                idempotencyKey: input.idempotencyKey ?? null,
                editToken,
              },
              select: { id: true },
            });
            responseId = row.id;
          }

          orphanPaths = await replaceAnswers(t, responseId, answers);
          return { id: responseId, submittedAt: now };
        },
        { maxWait: 10000, timeout: 30000 },
      );
    } catch (err: any) {
      // Dua request dengan idempotencyKey sama masuk bersamaan
      if (err?.code === "P2002" && input.idempotencyKey) {
        const existing = await prisma.formResponse.findUnique({
          where: {
            formId_idempotencyKey: {
              formId: form.id,
              idempotencyKey: input.idempotencyKey,
            },
          },
          select: {
            id: true,
            status: true,
            submittedAt: true,
            editToken: true,
          },
        });
        if (existing) {
          deleteUploadedFiles(files);
          return submitResult(form, existing, true);
        }
      }
      throw err;
    }

    committed = true;

    // ── setelah commit: bersih-bersih & hook (nggak boleh melempar error)
    try {
      deleteUploadedFiles(droppedFiles);
      deleteStoredAnswerFiles(orphanPaths);
      await afterResponseSubmitted({
        form,
        responseId: created.id,
        email,
        editToken,
      });
    } catch (err) {
      console.error("[form] post-submit error:", err);
    }

    return submitResult(
      form,
      { id: created.id, submittedAt: created.submittedAt, editToken },
      false,
    );
  } catch (err) {
    if (!committed) deleteUploadedFiles(files);
    throw err;
  }
}

// ─── Ambil response sendiri (buat prefill form edit) ────────────────────────

export async function getOwnFormResponse(
  slug: string,
  responseId: string,
  user: PublicUser,
  editToken?: string,
) {
  const form = await getPublishedFormBySlug(slug);
  assertAccess(form, user);
  const response = await loadOwnedResponse(
    form.id,
    responseId,
    user,
    editToken,
  );
  return serializeResponseForRespondent(response);
}

// ─── Edit response setelah submit ───────────────────────────────────────────

export async function editFormResponse(
  slug: string,
  responseId: string,
  user: PublicUser,
  editToken: string | undefined,
  input: SubmitResponseInput,
  files: Express.Multer.File[],
) {
  let committed = false;

  try {
    const form = await getPublishedFormBySlug(slug);
    assertAccess(form, user);

    if (!form.allowEditResponse) {
      throw new FormError(
        403,
        "Form ini tidak mengizinkan edit jawaban",
        "EDIT_DISABLED",
      );
    }
    // Limit responden nggak relevan buat edit (response ini sudah terhitung)
    const availability = computeAvailability(form, new Date(), {
      ignoreLimit: true,
    });
    if (!availability.isOpen) {
      throw new FormError(403, availability.message!, availability.reason);
    }

    const response = await loadOwnedResponse(
      form.id,
      responseId,
      user,
      editToken,
    );
    if (response.status !== "SUBMITTED") {
      throw new FormError(
        409,
        "Hanya response yang sudah dikirim yang bisa diedit",
      );
    }

    const email = resolveEmail(
      form,
      user,
      input.email,
      response.respondentEmail,
    );
    const { answers, droppedFiles } = prepareAnswers(
      form,
      input.answers,
      files,
      "strict",
    );

    let orphanPaths: string[] = [];
    await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const t = tx as any;
        orphanPaths = await replaceAnswers(t, response.id, answers);
        await t.formResponse.update({
          where: { id: response.id },
          data: { respondentEmail: email },
        });
      },
      { maxWait: 10000, timeout: 30000 },
    );
    committed = true;

    try {
      deleteUploadedFiles(droppedFiles);
      deleteStoredAnswerFiles(orphanPaths);
    } catch (err) {
      console.error("[form] post-edit error:", err);
    }

    return {
      responseId: response.id,
      status: "SUBMITTED",
      confirmationMessage: form.confirmationMessage ?? null,
    };
  } catch (err) {
    if (!committed) deleteUploadedFiles(files);
    throw err;
  }
}

// ─── Draft autosave (hanya responder yang login) ────────────────────────────

function assertDraftAllowed(form: any, user: PublicUser) {
  if (!user) {
    throw new FormError(
      401,
      "Draft hanya tersedia untuk responder yang login",
      "LOGIN_REQUIRED",
    );
  }
  if (!form.allowResponderDraft) {
    throw new FormError(
      403,
      "Form ini tidak mengaktifkan simpan draft",
      "DRAFT_DISABLED",
    );
  }
}

export async function saveFormDraft(
  slug: string,
  user: PublicUser,
  input: SubmitResponseInput,
  files: Express.Multer.File[],
) {
  let committed = false;

  try {
    const form = await getPublishedFormBySlug(slug);
    assertAccess(form, user);
    assertDraftAllowed(form, user);

    const availability = computeAvailability(form, new Date());
    if (!availability.isOpen) {
      throw new FormError(403, availability.message!, availability.reason);
    }

    if (form.limitOneResponsePerAccount) {
      const submitted = await prisma.formResponse.findFirst({
        where: { formId: form.id, userId: user!.userId, status: "SUBMITTED" },
        select: { id: true },
      });
      if (submitted) {
        throw new FormError(
          409,
          "Kamu sudah mengisi form ini",
          "ALREADY_SUBMITTED",
          {
            responseId: submitted.id,
            canEdit: form.allowEditResponse,
          },
        );
      }
    }

    const { answers } = prepareAnswers(form, input.answers, files, "draft");

    let orphanPaths: string[] = [];
    const saved = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const t = tx as any;
        let draft = await t.formResponse.findFirst({
          where: { formId: form.id, userId: user!.userId, status: "DRAFT" },
          select: { id: true },
        });
        if (!draft) {
          draft = await t.formResponse.create({
            data: {
              id: newFormId("response"),
              formId: form.id,
              userId: user!.userId,
              respondentEmail: input.email ?? user!.email ?? null,
              status: "DRAFT",
            },
            select: { id: true },
          });
        } else if (input.email) {
          await t.formResponse.update({
            where: { id: draft.id },
            data: { respondentEmail: input.email },
          });
        }
        orphanPaths = await replaceAnswers(t, draft.id, answers);
        // sentuh updatedAt
        return t.formResponse.update({
          where: { id: draft.id },
          data: { updatedAt: new Date() },
          select: { id: true, updatedAt: true },
        });
      },
      { maxWait: 10000, timeout: 30000 },
    );
    committed = true;

    try {
      deleteStoredAnswerFiles(orphanPaths);
    } catch (err) {
      console.error("[form] post-draft error:", err);
    }

    return { responseId: saved.id, updatedAt: saved.updatedAt };
  } catch (err) {
    if (!committed) deleteUploadedFiles(files);
    throw err;
  }
}

export async function getFormDraft(slug: string, user: PublicUser) {
  const form = await getPublishedFormBySlug(slug);
  assertAccess(form, user);
  assertDraftAllowed(form, user);

  const draft = await prisma.formResponse.findFirst({
    where: { formId: form.id, userId: user!.userId, status: "DRAFT" },
    include: { answers: { include: { selections: true, files: true } } },
  });

  return draft ? serializeResponseForRespondent(draft) : null;
}
