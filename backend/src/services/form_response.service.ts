import { PrismaClient } from "@prisma/client";
import { parseAsync } from "json2csv";
import fs from "fs";
import path from "path";
import { formAnswerFilesPath } from "../middlewares/uploadImage.js";
import type {
  ExportResponsesQuery,
  ListResponsesQuery,
  QuestionAnswersQuery,
} from "../validations/form_response.validation.js";

const prisma = new PrismaClient();

// ─── Error & helper umum ────────────────────────────────────────────────────

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

export type FormActor = { userId: string; roles: string[] };

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
const CHOICE_TYPES = ["MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN"];
const GRID_TYPES = ["MULTIPLE_CHOICE_GRID", "CHECKBOX_GRID"];
const TEXT_TYPES = ["SHORT_ANSWER", "PARAGRAPH", "DATE", "TIME_DURATION"];

// Bentuk baris hasil query agregasi di getResponseSummary
type ChoiceRow = {
  itemId: string;
  optionId: string;
  rowOptionId: string | null;
  count: number;
};
type NumberRow = { itemId: string; value: number; count: number };
type CountRow = { itemId: string; count: number };

const MAX_EXPORT_ROWS = 20000;
const RESPONSE_FILE_URL_BASE = "/api/formresponse/forms";

// Admin boleh semua, selain admin hanya form buatannya sendiri.
// (sama dengan aturan di form.service.ts — ubah di dua tempat kalau berubah)
function canManageForm(actor: FormActor, form: { createdById: string | null }) {
  return actor.roles.includes("admin") || form.createdById === actor.userId;
}

async function assertFormAccess(actor: FormActor, formId: string) {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      eventId: true,
      eventNameSnapshot: true,
      createdById: true,
    },
  });
  if (!form) throw new FormError(404, "Form tidak ditemukan");
  if (!canManageForm(actor, form)) {
    throw new FormError(403, "Kamu tidak punya akses ke form ini");
  }
  return form as any;
}

// Tanggal filter dibaca sebagai hari WIB (UTC+7)
const wibStart = (d: string) => new Date(`${d}T00:00:00+07:00`);
const wibEnd = (d: string) => new Date(`${d}T23:59:59.999+07:00`);

function formatWIB(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date.getTime() + 7 * 60 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);
}

function buildResponseWhere(
  formId: string,
  q: ListResponsesQuery | ExportResponsesQuery,
) {
  const where: any = { formId };
  if (q.status !== "ALL") where.status = q.status;

  // Draft belum punya submittedAt, jadi filter tanggalnya pakai createdAt
  const dateField = q.status === "DRAFT" ? "createdAt" : "submittedAt";
  if (q.startDate || q.endDate) {
    where[dateField] = {};
    if (q.startDate) where[dateField].gte = wibStart(q.startDate);
    if (q.endDate) where[dateField].lte = wibEnd(q.endDate);
  }

  if (q.search) {
    where.OR = [
      { respondentEmail: { contains: q.search, mode: "insensitive" } },
      {
        user: { is: { fullName: { contains: q.search, mode: "insensitive" } } },
      },
      { user: { is: { email: { contains: q.search, mode: "insensitive" } } } },
    ];
  }
  return where;
}

function responseOrderBy(q: {
  status: string;
  sortOrder: "asc" | "desc";
}): any {
  return q.status === "DRAFT"
    ? { createdAt: q.sortOrder }
    : [
        { submittedAt: { sort: q.sortOrder, nulls: "last" } },
        { createdAt: q.sortOrder },
      ];
}

// Nilai satu jawaban dalam bentuk teks (dipakai detail, per-pertanyaan, CSV)
function answerDisplayValue(a: any): string {
  if (a.valueText != null) return a.valueText;
  if (a.valueNumber != null) return String(a.valueNumber);
  if (a.valueDate) return new Date(a.valueDate).toISOString().slice(0, 10);

  if (a.selections?.length) {
    const isGrid = a.selections.some((s: any) => s.rowOptionId);
    if (!isGrid)
      return a.selections.map((s: any) => s.optionLabelSnapshot).join("; ");

    const rows = new Map<string, string[]>();
    for (const s of a.selections) {
      const key = s.rowLabelSnapshot ?? "";
      rows.set(key, [...(rows.get(key) ?? []), s.optionLabelSnapshot]);
    }
    return [...rows.entries()]
      .map(([row, cols]) => `${row}: ${cols.join(", ")}`)
      .join("; ");
  }

  if (a.files?.length)
    return a.files.map((f: any) => f.originalName).join("; ");
  return "";
}

// ─── List response ──────────────────────────────────────────────────────────

export async function listResponses(
  actor: FormActor,
  formId: string,
  q: ListResponsesQuery,
) {
  await assertFormAccess(actor, formId);
  const where = buildResponseWhere(formId, q);

  const [total, rows] = await Promise.all([
    prisma.formResponse.count({ where }),
    prisma.formResponse.findMany({
      where,
      orderBy: responseOrderBy(q),
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      select: {
        id: true,
        status: true,
        submittedAt: true,
        createdAt: true,
        updatedAt: true,
        respondentEmail: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
    }),
  ]);

  return {
    items: rows.map((r: any) => ({
      id: r.id,
      status: r.status,
      submittedAt: r.submittedAt,
      updatedAt: r.updatedAt,
      email: r.respondentEmail ?? r.user?.email ?? null,
      respondent: r.user
        ? { id: r.user.id, fullName: r.user.fullName, email: r.user.email }
        : null,
    })),
    pagination: {
      page: q.page,
      limit: q.limit,
      total,
      totalPages: Math.ceil(total / q.limit),
    },
  };
}

// ─── Detail response (+ prev/next buat Individual view) ─────────────────────

export async function getResponseDetail(
  actor: FormActor,
  formId: string,
  responseId: string,
) {
  const form = await assertFormAccess(actor, formId);

  const response: any = await prisma.formResponse.findFirst({
    where: { id: responseId, formId },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, phoneNumber: true },
      },
      answers: {
        include: {
          selections: true,
          files: true,
          item: {
            select: {
              orderNumber: true,
              deletedAt: true,
              section: { select: { orderNumber: true } },
            },
          },
        },
      },
    },
  });
  if (!response) throw new FormError(404, "Response tidak ditemukan");

  const answers = [...response.answers]
    .sort(
      (a: any, b: any) =>
        a.item.section.orderNumber - b.item.section.orderNumber ||
        a.item.orderNumber - b.item.orderNumber,
    )
    .map((a: any) => ({
      itemId: a.itemId,
      itemType: a.itemTypeSnapshot, // tipe & judul SAAT response dikirim
      title: a.itemTitleSnapshot,
      itemDeleted: !!a.item.deletedAt,
      valueText: a.valueText,
      valueNumber: a.valueNumber,
      valueDate: a.valueDate,
      selections: a.selections.map((s: any) => ({
        optionId: s.optionId,
        label: s.optionLabelSnapshot,
        rowOptionId: s.rowOptionId,
        rowLabel: s.rowLabelSnapshot,
      })),
      files: a.files.map((f: any) => ({
        id: f.id,
        originalName: f.originalName,
        mimeType: f.mimeType,
        sizeBytes: f.sizeBytes,
        downloadUrl: `${RESPONSE_FILE_URL_BASE}/${formId}/responses/${response.id}/files/${f.id}`,
      })),
      displayValue: answerDisplayValue(a),
    }));

  let prevResponseId: string | null = null;
  let nextResponseId: string | null = null;
  if (response.status === "SUBMITTED" && response.submittedAt) {
    const [prev, next] = await Promise.all([
      prisma.formResponse.findFirst({
        where: {
          formId,
          status: "SUBMITTED",
          submittedAt: { lt: response.submittedAt },
        },
        orderBy: { submittedAt: "desc" },
        select: { id: true },
      }),
      prisma.formResponse.findFirst({
        where: {
          formId,
          status: "SUBMITTED",
          submittedAt: { gt: response.submittedAt },
        },
        orderBy: { submittedAt: "asc" },
        select: { id: true },
      }),
    ]);
    prevResponseId = prev?.id ?? null;
    nextResponseId = next?.id ?? null;
  }

  return {
    id: response.id,
    status: response.status,
    submittedAt: response.submittedAt,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt, // metadata submit / update terakhir
    respondentEmail: response.respondentEmail,
    respondent: response.user,
    form: { id: form.id, title: form.title, type: form.type },
    event:
      form.type === "EVENT" && form.eventId
        ? { id: form.eventId, name: form.eventNameSnapshot }
        : null,
    answers,
    navigation: { prevResponseId, nextResponseId },
  };
}

// ─── Summary view ───────────────────────────────────────────────────────────

export async function getResponseSummary(actor: FormActor, formId: string) {
  await assertFormAccess(actor, formId);

  const [totalSubmitted, itemsRaw, choiceRowsRaw, numberRowsRaw, countRowsRaw] =
    await Promise.all([
      prisma.formResponse.count({ where: { formId, status: "SUBMITTED" } }),
      prisma.formItem.findMany({
        where: { formId, type: { in: ANSWERABLE_TYPES as any } },
        include: {
          options: true,
          section: { select: { orderNumber: true } },
        },
      }),
      prisma.$queryRaw<
        {
          itemId: string;
          optionId: string;
          rowOptionId: string | null;
          count: number;
        }[]
      >`
        SELECT fa.item_id AS "itemId", s.option_id AS "optionId",
               s.row_option_id AS "rowOptionId", COUNT(*)::int AS "count"
        FROM form_answer_selections s
        JOIN form_answers fa ON fa.id = s.answer_id
        JOIN form_responses r ON r.id = fa.response_id
        WHERE r.form_id = ${formId} AND r.status = 'SUBMITTED'
        GROUP BY fa.item_id, s.option_id, s.row_option_id`,
      prisma.$queryRaw<{ itemId: string; value: number; count: number }[]>`
        SELECT fa.item_id AS "itemId", fa.value_number AS "value", COUNT(*)::int AS "count"
        FROM form_answers fa
        JOIN form_responses r ON r.id = fa.response_id
        WHERE r.form_id = ${formId} AND r.status = 'SUBMITTED'
          AND fa.value_number IS NOT NULL
        GROUP BY fa.item_id, fa.value_number`,
      prisma.$queryRaw<{ itemId: string; count: number }[]>`
        SELECT fa.item_id AS "itemId", COUNT(*)::int AS "count"
        FROM form_answers fa
        JOIN form_responses r ON r.id = fa.response_id
        WHERE r.form_id = ${formId} AND r.status = 'SUBMITTED'
        GROUP BY fa.item_id`,
    ]);

  const choiceRows = choiceRowsRaw as ChoiceRow[];
  const numberRows = numberRowsRaw as NumberRow[];
  const countRows = countRowsRaw as CountRow[];

  const answeredCount = new Map<string, number>(
    countRows.map((r) => [r.itemId, r.count]),
  );

  // pertanyaan aktif + pertanyaan yang sudah dihapus tapi masih punya jawaban
  const items = (itemsRaw as any[])
    .filter((it) => !it.deletedAt || (answeredCount.get(it.id) ?? 0) > 0)
    .sort(
      (a, b) =>
        Number(!!a.deletedAt) - Number(!!b.deletedAt) ||
        a.section.orderNumber - b.section.orderNumber ||
        a.orderNumber - b.orderNumber,
    );

  // contoh jawaban teks terbaru (5 per pertanyaan; daftar lengkap lewat endpoint per-pertanyaan)
  const textItemIds = items
    .filter((it) => TEXT_TYPES.includes(it.type))
    .map((it) => it.id);
  const textAnswers = textItemIds.length
    ? await prisma.formAnswer.findMany({
        where: {
          itemId: { in: textItemIds },
          response: { formId, status: "SUBMITTED" },
        },
        orderBy: { response: { submittedAt: "desc" } },
        take: 1000,
        select: { itemId: true, valueText: true, valueDate: true },
      })
    : [];
  const samples = new Map<string, string[]>();
  for (const a of textAnswers as any[]) {
    const list = samples.get(a.itemId) ?? [];
    if (list.length < 5) {
      list.push(
        a.valueText ?? new Date(a.valueDate).toISOString().slice(0, 10),
      );
      samples.set(a.itemId, list);
    }
  }

  const choiceByItem = new Map<string, ChoiceRow[]>();
  for (const r of choiceRows) {
    choiceByItem.set(r.itemId, [...(choiceByItem.get(r.itemId) ?? []), r]);
  }
  const numberByItem = new Map<string, NumberRow[]>();
  for (const r of numberRows) {
    numberByItem.set(r.itemId, [...(numberByItem.get(r.itemId) ?? []), r]);
  }

  const pct = (count: number, total: number) =>
    total > 0 ? Math.round((count / total) * 1000) / 10 : 0;

  const summaries = items.map((it) => {
    const answered = answeredCount.get(it.id) ?? 0;
    const base = {
      itemId: it.id,
      type: it.type,
      title: it.title,
      deleted: !!it.deletedAt,
      answeredCount: answered,
    };
    const cfg = (it.config ?? {}) as any;
    const rows = choiceByItem.get(it.id) ?? [];

    if (CHOICE_TYPES.includes(it.type)) {
      const counts = new Map(rows.map((r) => [r.optionId, r.count]));
      const options = it.options
        .filter((o: any) => o.kind === "CHOICE")
        .filter((o: any) => !o.deletedAt || (counts.get(o.id) ?? 0) > 0)
        .sort((a: any, b: any) => a.orderNumber - b.orderNumber)
        .map((o: any) => ({
          optionId: o.id,
          label: o.label,
          deleted: !!o.deletedAt,
          count: counts.get(o.id) ?? 0,
          percent: pct(counts.get(o.id) ?? 0, answered),
        }));
      return { ...base, options };
    }

    if (GRID_TYPES.includes(it.type)) {
      const cells = new Map(
        rows.map((r) => [`${r.rowOptionId}|${r.optionId}`, r.count]),
      );
      const gridRows = it.options.filter((o: any) => o.kind === "GRID_ROW");
      const gridCols = it.options.filter((o: any) => o.kind === "GRID_COLUMN");
      return {
        ...base,
        grid: gridRows
          .sort((a: any, b: any) => a.orderNumber - b.orderNumber)
          .map((row: any) => ({
            rowId: row.id,
            label: row.label,
            columns: gridCols
              .sort((a: any, b: any) => a.orderNumber - b.orderNumber)
              .map((col: any) => ({
                optionId: col.id,
                label: col.label,
                count: cells.get(`${row.id}|${col.id}`) ?? 0,
              })),
          })),
      };
    }

    if (it.type === "LINEAR_SCALE" || it.type === "RATING") {
      const dist = numberByItem.get(it.id) ?? [];
      const min = it.type === "RATING" ? 1 : (cfg.min ?? 1);
      const max = cfg.max ?? 5;
      const byValue = new Map(dist.map((d) => [d.value, d.count]));
      const total = dist.reduce((sum, d) => sum + d.count, 0);
      const sum = dist.reduce((s, d) => s + d.value * d.count, 0);
      return {
        ...base,
        average: total > 0 ? Math.round((sum / total) * 100) / 100 : null,
        distribution: Array.from({ length: max - min + 1 }, (_, i) => {
          const value = min + i;
          const count = byValue.get(value) ?? 0;
          return { value, count, percent: pct(count, total) };
        }),
      };
    }

    if (TEXT_TYPES.includes(it.type)) {
      return { ...base, samples: samples.get(it.id) ?? [] };
    }

    return base; // FILE_UPLOAD: cukup jumlah yang menjawab
  });

  return { totalSubmitted, items: summaries };
}

// ─── Question view: semua jawaban untuk satu pertanyaan ─────────────────────

export async function getQuestionAnswers(
  actor: FormActor,
  formId: string,
  itemId: string,
  q: QuestionAnswersQuery,
) {
  await assertFormAccess(actor, formId);

  const item = await prisma.formItem.findFirst({
    where: { id: itemId, formId },
    select: { id: true, type: true, title: true, deletedAt: true },
  });
  if (!item) throw new FormError(404, "Pertanyaan tidak ditemukan di form ini");

  const where = { itemId, response: { formId, status: "SUBMITTED" } } as any;

  const [total, rows] = await Promise.all([
    prisma.formAnswer.count({ where }),
    prisma.formAnswer.findMany({
      where,
      orderBy: { response: { submittedAt: "desc" } },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      include: {
        selections: true,
        files: true,
        response: {
          select: {
            id: true,
            submittedAt: true,
            respondentEmail: true,
            user: { select: { fullName: true, email: true } },
          },
        },
      },
    }),
  ]);

  return {
    item: {
      id: item.id,
      type: item.type,
      title: item.title,
      deleted: !!(item as any).deletedAt,
    },
    items: (rows as any[]).map((a) => ({
      responseId: a.response.id,
      submittedAt: a.response.submittedAt,
      respondent:
        a.response.user?.fullName ??
        a.response.respondentEmail ??
        a.response.user?.email ??
        null,
      title: a.itemTitleSnapshot,
      displayValue: answerDisplayValue(a),
    })),
    pagination: {
      page: q.page,
      limit: q.limit,
      total,
      totalPages: Math.ceil(total / q.limit),
    },
  };
}

// ─── Export CSV ─────────────────────────────────────────────────────────────

// Cegah CSV injection: sel yang diawali = + - @ (atau tab/CR) dibuka sebagai
// formula oleh Excel/Sheets, jadi diberi tanda petik di depan.
function safeCell(value: string) {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

export async function exportResponsesCsv(
  actor: FormActor,
  formId: string,
  q: ExportResponsesQuery,
) {
  const form = await assertFormAccess(actor, formId);
  const where = buildResponseWhere(formId, q);

  const total = await prisma.formResponse.count({ where });
  if (total > MAX_EXPORT_ROWS) {
    throw new FormError(
      400,
      `Data terlalu banyak untuk diekspor sekaligus (${total} baris, maksimal ${MAX_EXPORT_ROWS}). Persempit dengan filter tanggal.`,
      "EXPORT_TOO_LARGE",
    );
  }

  const [itemsRaw, responses] = await Promise.all([
    prisma.formItem.findMany({
      where: { formId, type: { in: ANSWERABLE_TYPES as any } },
      include: { options: true, section: { select: { orderNumber: true } } },
    }),
    prisma.formResponse.findMany({
      where,
      orderBy: responseOrderBy(q),
      include: {
        user: { select: { fullName: true, email: true } },
        answers: { include: { selections: true, files: true } },
      },
    }),
  ]);

  // pertanyaan yang sudah dihapus tapi punya jawaban tetap ikut diekspor
  const answeredItemIds = new Set<string>();
  const extraRows = new Map<string, Map<string, string>>(); // itemId -> (rowId -> label)
  for (const r of responses as any[]) {
    for (const a of r.answers) {
      answeredItemIds.add(a.itemId);
      for (const s of a.selections) {
        if (!s.rowOptionId) continue;
        const m = extraRows.get(a.itemId) ?? new Map<string, string>();
        m.set(s.rowOptionId, s.rowLabelSnapshot ?? "");
        extraRows.set(a.itemId, m);
      }
    }
  }

  const items = (itemsRaw as any[])
    .filter((it) => !it.deletedAt || answeredItemIds.has(it.id))
    .sort(
      (a, b) =>
        Number(!!a.deletedAt) - Number(!!b.deletedAt) ||
        a.section.orderNumber - b.section.orderNumber ||
        a.orderNumber - b.orderNumber,
    );

  type Col = { label: string; value: (r: any) => string };
  const fields: Col[] = [
    { label: "Response ID", value: (r) => r.id },
    { label: "Tanggal Submit (WIB)", value: (r) => formatWIB(r.submittedAt) },
    { label: "Status", value: (r) => r.status },
    { label: "Nama", value: (r) => safeCell(r.user?.fullName ?? "") },
    {
      label: "Email",
      value: (r) => safeCell(r.respondentEmail ?? r.user?.email ?? ""),
    },
  ];

  const findAnswer = (r: any, itemId: string) =>
    r.answers.find((a: any) => a.itemId === itemId);

  for (const it of items) {
    const title = `${it.title || "(tanpa judul)"}${it.deletedAt ? " (dihapus)" : ""}`;

    if (GRID_TYPES.includes(it.type)) {
      const rowMap = new Map<string, string>();
      for (const o of it.options
        .filter((o: any) => o.kind === "GRID_ROW" && !o.deletedAt)
        .sort((a: any, b: any) => a.orderNumber - b.orderNumber)) {
        rowMap.set(o.id, o.label);
      }
      for (const [id, label] of extraRows.get(it.id) ?? []) {
        if (!rowMap.has(id)) rowMap.set(id, label);
      }
      for (const [rowId, rowLabel] of rowMap) {
        fields.push({
          label: `${title} [${rowLabel}]`,
          value: (r) => {
            const a = findAnswer(r, it.id);
            if (!a) return "";
            return safeCell(
              a.selections
                .filter((s: any) => s.rowOptionId === rowId)
                .map((s: any) => s.optionLabelSnapshot)
                .join("; "),
            );
          },
        });
      }
      continue;
    }

    fields.push({
      label: title,
      value: (r) => {
        const a = findAnswer(r, it.id);
        return a ? safeCell(answerDisplayValue(a)) : "";
      },
    });
  }

  const csv = await parseAsync(responses as any[], {
    fields: fields.map((f) => ({ label: f.label, value: f.value })),
    withBOM: true, // supaya Excel membaca UTF-8 dengan benar
  });

  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return {
    fileBuffer: Buffer.from(csv, "utf-8"),
    fileName: `form-${form.slug}-responses-${stamp}.csv`,
    mimeType: "text/csv; charset=utf-8",
    rowCount: total,
  };
}

// ─── Download file upload responder (ber-permission) ────────────────────────

export async function getResponseFileForDownload(
  actor: FormActor,
  formId: string,
  responseId: string,
  fileId: string,
) {
  await assertFormAccess(actor, formId);

  const file = await prisma.formAnswerFile.findFirst({
    where: { id: fileId, answer: { responseId, response: { formId } } },
    select: { originalName: true, mimeType: true, storagePath: true },
  });
  if (!file) throw new FormError(404, "File tidak ditemukan");

  // storagePath disimpan relatif ("formAnswerFiles/<nama>"); resolve ulang di
  // folder privat dan pastikan nggak keluar dari folder itu.
  const baseDir = path.resolve(formAnswerFilesPath);
  const absolutePath = path.resolve(baseDir, path.basename(file.storagePath));
  if (!absolutePath.startsWith(baseDir + path.sep)) {
    throw new FormError(400, "Path file tidak valid");
  }
  if (!fs.existsSync(absolutePath)) {
    throw new FormError(404, "File tidak ditemukan di server");
  }

  return {
    absolutePath,
    originalName: file.originalName,
    mimeType: file.mimeType,
  };
}
