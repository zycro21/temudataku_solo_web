import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { newFormId } from "./form_id.js";
import { assertCategoryMatchesType } from "./form_category.service.js";
import { formHeaderPath } from "../middlewares/uploadImage.js";
import type {
  CreateFormInput,
  DuplicateFormInput,
  ListEligibleEventsQuery,
  ListFormsQuery,
  PrefillLinkInput,
  SaveFormStructureInput,
  UpdateFormInput,
} from "../validations/form.validation.js";

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

const CONTENT_ONLY_TYPES = ["TITLE_DESCRIPTION", "IMAGE", "VIDEO"];
const CHOICE_TYPES = ["MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN"];
const GRID_TYPES = ["MULTIPLE_CHOICE_GRID", "CHECKBOX_GRID"];
const BRANCHING_TYPES = ["MULTIPLE_CHOICE", "DROPDOWN"];
const PREFILL_TYPES = [
  "SHORT_ANSWER",
  "PARAGRAPH",
  "MULTIPLE_CHOICE",
  "CHECKBOXES",
  "DROPDOWN",
  "LINEAR_SCALE",
  "RATING",
  "DATE",
  "TIME_DURATION",
];

// Kepemilikan: admin boleh semua, selain admin hanya form buatannya sendiri
// (PRD: "form yang menjadi tanggung jawabnya"). Kalau Class Manager boleh
// kelola semua form, cukup ubah fungsi ini.
function canManageForm(actor: FormActor, form: { createdById: string | null }) {
  return actor.roles.includes("admin") || form.createdById === actor.userId;
}

function assertManage(actor: FormActor, form: { createdById: string | null }) {
  if (!canManageForm(actor, form)) {
    throw new FormError(403, "Kamu tidak punya akses ke form ini");
  }
}

function jsonOrNull(v: unknown) {
  return v === null || v === undefined
    ? Prisma.DbNull
    : (v as Prisma.InputJsonValue);
}

function safeUnlink(absPath: string) {
  try {
    if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
  } catch {
    /* best-effort */
  }
}

function generateSlug() {
  return crypto.randomBytes(6).toString("base64url"); // 8 karakter, acak
}

function frontendBaseUrl() {
  return (
    process.env.FRONTEND_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

// Struktur lengkap form (tanpa data yang sudah soft-delete)
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

async function getFormOrThrow(formId: string) {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: structureInclude,
  });
  if (!form) throw new FormError(404, "Form tidak ditemukan");
  return form as any;
}

// ─── Status penerimaan response (BEDA dari status Publish) ──────────────────

export function computeAvailability(
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

// ─── Modul Event (BELUM ADA) ────────────────────────────────────────────────
// Model Event belum ada di schema. Dua fungsi di bawah adalah SATU-SATUNYA
// tempat yang perlu diganti begitu model Event dibuat. Sampai saat itu,
// membuat Form Event akan ditolak (501) supaya eventId sembarangan nggak
// bisa masuk (PRD: filtering Event eligible WAJIB divalidasi di backend).
//
// Contoh setelah model Event ada:
//   const ev = await prisma.event.findFirst({ where: { id: eventId, isActive: true, /* + scope Class Manager */ } });
//   if (!ev) throw new FormError(404, "Event tidak ditemukan atau tidak bisa dikelola");
//   return { id: ev.id, name: ev.name };
//
// Untuk testing lokal sementara, ganti isi fungsi jadi: return { id: eventId, name: "Event Dummy" };

async function getEligibleEvent(
  _eventId: string,
  _actor: FormActor,
): Promise<{ id: string; name: string }> {
  throw new FormError(
    501,
    "Modul Event belum tersedia, Form Event belum bisa dibuat",
    "EVENT_MODULE_NOT_READY",
  );
}

export async function listEligibleEvents(
  _actor: FormActor,
  _query: ListEligibleEventsQuery,
) {
  // Harus mengembalikan: { items: [{ id, name, date, mode: "online"|"offline" }], pagination }
  // Hanya Event non-kelas yang boleh dikelola actor (Bootcamp/AYCL/E-Learning/Mentoring jangan muncul).
  throw new FormError(
    501,
    "Modul Event belum tersedia, daftar Event belum bisa ditampilkan",
    "EVENT_MODULE_NOT_READY",
  );
}

// ─── Kelola Form: list ──────────────────────────────────────────────────────

export async function listForms(actor: FormActor, query: ListFormsQuery) {
  const where: any = {};

  if (query.type) where.type = query.type;
  if (query.categoryId) where.categoryId = query.categoryId;
  // Form yang diarsipkan disembunyikan kecuali difilter eksplisit
  where.status = query.status ?? { not: "ARCHIVED" };
  if (!actor.roles.includes("admin")) where.createdById = actor.userId;

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { eventNameSnapshot: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.form.count({ where }),
    prisma.form.findMany({
      where,
      orderBy: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      select: {
        id: true,
        type: true,
        title: true,
        status: true,
        slug: true,
        eventId: true,
        eventNameSnapshot: true,
        showOnEventPage: true,
        categoryId: true,
        category: { select: { id: true, name: true } },
        submittedResponseCount: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    items: rows.map((r: any) => {
      const { submittedResponseCount, ...rest } = r;
      return { ...rest, responseCount: submittedResponseCount };
    }),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

// ─── Buat form ──────────────────────────────────────────────────────────────

export async function createForm(actor: FormActor, input: CreateFormInput) {
  // Jenis form (opsional): harus ada dan bertipe sama dengan form
  const categoryId = await assertCategoryMatchesType(
    input.categoryId,
    input.type,
  );
  let eventId: string | null = null;
  let eventNameSnapshot: string | null = null;

  if (input.type === "EVENT") {
    const ev = await getEligibleEvent(input.eventId!, actor);
    eventId = ev.id;
    eventNameSnapshot = ev.name;
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const created = await prisma.form.create({
        data: {
          id: newFormId("form"),
          type: input.type,
          title: input.title,
          description: input.description ?? null,
          slug: generateSlug(),
          categoryId,
          eventId,
          eventNameSnapshot,
          showOnEventPage: input.type === "EVENT",
          createdById: actor.userId,
          // Setiap form selalu punya minimal 1 section
          sections: { create: { id: newFormId("section"), orderNumber: 1 } },
        },
        select: { id: true },
      });
      return getFormDetail(actor, created.id);
    } catch (err: any) {
      if (err?.code === "P2002" && attempt < 4) continue; // slug bentrok, coba lagi
      throw err;
    }
  }
}

// ─── Detail form (dipakai builder) ──────────────────────────────────────────

export async function getFormDetail(actor: FormActor, formId: string) {
  const form = await getFormOrThrow(formId);
  assertManage(actor, form);
  return {
    ...form,
    availability: computeAvailability(form, new Date()),
    isShareable: form.status === "PUBLISHED",
  };
}

// ─── Update judul, deskripsi, pengaturan, tema ──────────────────────────────

export async function updateForm(
  actor: FormActor,
  formId: string,
  input: UpdateFormInput,
) {
  const form = await getFormOrThrow(formId);
  assertManage(actor, form);

  if (form.status === "ARCHIVED") {
    throw new FormError(409, "Form sudah diarsipkan dan tidak bisa diubah");
  }

  if (input.showOnEventPage === true && form.type === "NON_EVENT") {
    throw new FormError(
      400,
      "Pengaturan tampil di halaman Event hanya untuk Form Event",
    );
  }

  // Cek konsistensi pengaturan setelah digabung dengan nilai yang sudah ada
  const merged = {
    responseLimitEnabled:
      input.responseLimitEnabled ?? form.responseLimitEnabled,
    responseLimit:
      input.responseLimit !== undefined
        ? input.responseLimit
        : form.responseLimit,
    periodEnabled: input.periodEnabled ?? form.periodEnabled,
    openAt: input.openAt !== undefined ? input.openAt : form.openAt,
    closeAt: input.closeAt !== undefined ? input.closeAt : form.closeAt,
  };

  if (merged.responseLimitEnabled && !merged.responseLimit) {
    throw new FormError(
      400,
      "Jumlah maksimum responden wajib diisi saat batas responden aktif",
    );
  }
  if (merged.periodEnabled) {
    if (!merged.openAt || !merged.closeAt) {
      throw new FormError(
        400,
        "Tanggal mulai dan selesai wajib diisi saat periode penerimaan aktif",
      );
    }
    if (merged.closeAt <= merged.openAt) {
      throw new FormError(400, "Tanggal selesai harus setelah tanggal mulai");
    }
  }

  const data = Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined),
  );

  await prisma.form.update({ where: { id: formId }, data });
  return getFormDetail(actor, formId);
}

// ─── Validasi kelayakan publish ─────────────────────────────────────────────

function findSectionCycle(sections: any[]): string[] | null {
  const ids = new Set(sections.map((s) => s.id));
  const edges = new Map<string, string[]>();

  sections.forEach((s, i) => {
    const out = new Set<string>();
    const defaultTarget =
      s.nextAction === "NEXT"
        ? sections[i + 1]?.id
        : s.nextAction === "GO_TO_SECTION"
          ? s.nextSectionId
          : null;
    if (defaultTarget && ids.has(defaultTarget)) out.add(defaultTarget);

    for (const it of s.items) {
      if (!BRANCHING_TYPES.includes(it.type)) continue;
      for (const o of it.options) {
        if (
          o.branchAction === "GO_TO_SECTION" &&
          o.branchSectionId &&
          ids.has(o.branchSectionId)
        ) {
          out.add(o.branchSectionId);
        }
      }
    }
    edges.set(s.id, [...out]);
  });

  const color = new Map<string, number>(); // 1 = sedang dikunjungi, 2 = selesai
  const stack: string[] = [];
  let cycle: string[] | null = null as string[] | null;

  const dfs = (id: string) => {
    color.set(id, 1);
    stack.push(id);
    for (const next of edges.get(id) ?? []) {
      if (cycle) return;
      const c = color.get(next);
      if (c === 1) {
        cycle = [...stack.slice(stack.indexOf(next)), next];
        return;
      }
      if (!c) dfs(next);
    }
    stack.pop();
    color.set(id, 2);
  };

  if (sections.length > 0) dfs(sections[0].id);
  return cycle;
}

export function collectPublishIssues(form: any): string[] {
  const issues: string[] = [];
  const sections: any[] = form.sections ?? [];

  if (!form.title || !form.title.trim()) issues.push("Judul form wajib diisi");

  if (form.type === "EVENT" && !form.eventId) {
    issues.push("Form Event harus dikaitkan ke sebuah Event");
  }
  if (form.type === "NON_EVENT" && form.eventId) {
    issues.push("Form Non Event tidak boleh dikaitkan ke Event");
  }

  if (form.responseLimitEnabled && !form.responseLimit) {
    issues.push("Batas responden aktif tapi jumlah maksimum belum diisi");
  }
  if (form.periodEnabled) {
    if (!form.openAt || !form.closeAt) {
      issues.push(
        "Periode penerimaan aktif tapi tanggal mulai/selesai belum lengkap",
      );
    } else if (form.closeAt <= form.openAt) {
      issues.push("Tanggal selesai periode harus setelah tanggal mulai");
    }
  }

  if (sections.length === 0) {
    issues.push("Form minimal punya 1 section");
    return issues;
  }

  const sectionIds = new Set(sections.map((s) => s.id));
  let answerableCount = 0;

  sections.forEach((s, si) => {
    const sLabel = `Section ${si + 1}${s.title ? ` "${s.title}"` : ""}`;

    if (s.nextAction === "GO_TO_SECTION") {
      if (!s.nextSectionId) {
        issues.push(`${sLabel}: tujuan "Lanjut ke section" belum dipilih`);
      } else if (!sectionIds.has(s.nextSectionId)) {
        issues.push(`${sLabel}: section tujuan sudah dihapus / tidak valid`);
      }
    }

    s.items.forEach((it: any, ii: number) => {
      const label = `${sLabel}, item ${ii + 1}${it.title ? ` "${it.title}"` : ""}`;
      const isContentOnly = CONTENT_ONLY_TYPES.includes(it.type);
      if (!isContentOnly) answerableCount++;

      if (it.type === "TITLE_DESCRIPTION") {
        if (!it.title?.trim() && !it.description?.trim()) {
          issues.push(`${label}: judul atau deskripsi wajib diisi`);
        }
      } else if (it.type === "IMAGE" || it.type === "VIDEO") {
        if (!(it.config as any)?.url) {
          issues.push(
            `${label}: ${it.type === "IMAGE" ? "gambar" : "video"} belum diunggah / url kosong`,
          );
        }
      } else if (!it.title?.trim()) {
        issues.push(`${label}: judul pertanyaan wajib diisi`);
      }

      if (CHOICE_TYPES.includes(it.type)) {
        if (it.options.filter((o: any) => o.kind === "CHOICE").length < 1) {
          issues.push(`${label}: minimal 1 pilihan`);
        }
      }
      if (GRID_TYPES.includes(it.type)) {
        if (it.options.filter((o: any) => o.kind === "GRID_ROW").length < 1) {
          issues.push(`${label}: minimal 1 baris`);
        }
        if (
          it.options.filter((o: any) => o.kind === "GRID_COLUMN").length < 1
        ) {
          issues.push(`${label}: minimal 1 kolom`);
        }
      }

      if (BRANCHING_TYPES.includes(it.type)) {
        it.options.forEach((o: any) => {
          if (o.branchAction === "GO_TO_SECTION") {
            if (!o.branchSectionId) {
              issues.push(
                `${label}: pilihan "${o.label}" belum punya section tujuan`,
              );
            } else if (!sectionIds.has(o.branchSectionId)) {
              issues.push(
                `${label}: section tujuan pilihan "${o.label}" sudah dihapus / tidak valid`,
              );
            }
          }
        });
      }
    });
  });

  if (answerableCount === 0) {
    issues.push("Form minimal punya 1 pertanyaan");
  }

  const cycle = findSectionCycle(sections);
  if (cycle) {
    const name = (id: string) => {
      const i = sections.findIndex((s) => s.id === id);
      return `Section ${i + 1}`;
    };
    issues.push(`Alur section membentuk loop: ${cycle.map(name).join(" → ")}`);
  }

  return issues;
}

// ─── Simpan struktur (Simpan Draft) ─────────────────────────────────────────

export async function saveFormStructure(
  actor: FormActor,
  formId: string,
  input: SaveFormStructureInput,
) {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: { id: true, status: true, createdById: true },
  });
  if (!form) throw new FormError(404, "Form tidak ditemukan");
  assertManage(actor, form);
  if (form.status === "ARCHIVED") {
    throw new FormError(409, "Form sudah diarsipkan dan tidak bisa diubah");
  }

  const keyMap = {
    sections: {} as Record<string, string>,
    items: {} as Record<string, string>,
    options: {} as Record<string, string>,
  };

  await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const t = tx as any;

      const exSections = await t.formSection.findMany({
        where: { formId },
        select: { id: true, deletedAt: true },
      });
      const exItems = await t.formItem.findMany({
        where: { formId },
        select: { id: true, deletedAt: true, type: true },
      });
      const exOptions = await t.formOption.findMany({
        where: { item: { formId } },
        select: { id: true, deletedAt: true, itemId: true },
      });

      const liveSections = new Set<string>(
        exSections.filter((s: any) => !s.deletedAt).map((s: any) => s.id),
      );
      const liveItems = new Map<string, any>(
        exItems.filter((i: any) => !i.deletedAt).map((i: any) => [i.id, i]),
      );
      const liveOptions = new Map<string, any>(
        exOptions.filter((o: any) => !o.deletedAt).map((o: any) => [o.id, o]),
      );

      // ── ID di payload harus milik form ini & belum dihapus
      const changedTypeItemIds: string[] = [];
      for (const s of input.sections) {
        if (s.id && !liveSections.has(s.id)) {
          throw new FormError(
            400,
            `Section ${s.id} tidak ditemukan di form ini`,
          );
        }
        for (const it of s.items) {
          if (it.id) {
            const ex = liveItems.get(it.id);
            if (!ex) {
              throw new FormError(
                400,
                `Item ${it.id} tidak ditemukan di form ini`,
              );
            }
            if (ex.type !== it.type) changedTypeItemIds.push(it.id);
          }
          for (const o of it.options) {
            if (!o.id) continue;
            const ex = liveOptions.get(o.id);
            if (!ex || ex.itemId !== it.id) {
              throw new FormError(
                400,
                `Option ${o.id} tidak ditemukan di item yang dimaksud`,
              );
            }
          }
        }
      }

      // Tipe pertanyaan yang sudah punya jawaban nggak boleh diubah
      if (changedTypeItemIds.length > 0) {
        const used = await t.formAnswer.findMany({
          where: { itemId: { in: changedTypeItemIds } },
          select: { itemId: true },
          distinct: ["itemId"],
        });
        if (used.length > 0) {
          throw new FormError(
            409,
            "Tipe pertanyaan tidak bisa diubah karena sudah ada jawaban. Buat pertanyaan baru sebagai gantinya.",
            "ITEM_TYPE_LOCKED",
            used.map((u: any) => u.itemId),
          );
        }
      }

      // ── Fase 1: section (buat / update)
      const sectionIdByIndex: string[] = [];
      for (const [i, s] of input.sections.entries()) {
        const data = {
          title: s.title ?? null,
          description: s.description ?? null,
          orderNumber: i + 1,
          nextAction: s.nextAction,
        };
        let id: string;
        if (s.id) {
          await t.formSection.update({ where: { id: s.id }, data });
          id = s.id;
        } else {
          const created = await t.formSection.create({
            data: { ...data, id: newFormId("section"), formId },
            select: { id: true },
          });
          id = created.id;
        }
        sectionIdByIndex.push(id);
        if (s.key) keyMap.sections[s.key] = id;
      }
      const payloadSectionIds = new Set(sectionIdByIndex);

      const resolveSection = (
        id?: string | null,
        key?: string,
      ): string | null => {
        if (id) {
          if (!payloadSectionIds.has(id)) {
            throw new FormError(400, `Section tujuan ${id} tidak valid`);
          }
          return id;
        }
        if (key) {
          const resolved = keyMap.sections[key];
          if (!resolved) {
            throw new FormError(
              400,
              `Section tujuan dengan key "${key}" tidak ditemukan`,
            );
          }
          return resolved;
        }
        return null;
      };

      // ── Fase 1b: tujuan navigasi section (butuh semua section sudah punya ID)
      for (const [i, s] of input.sections.entries()) {
        await t.formSection.update({
          where: { id: sectionIdByIndex[i] },
          data: {
            nextSectionId:
              s.nextAction === "GO_TO_SECTION"
                ? resolveSection(s.nextSectionId, s.nextSectionKey)
                : null,
          },
        });
      }

      // ── Fase 2 & 3: item dan option
      const keptItemIds = new Set<string>();
      const keptOptionIds = new Set<string>();

      for (const [si, s] of input.sections.entries()) {
        for (const [ii, it] of s.items.entries()) {
          const hasOptions =
            CHOICE_TYPES.includes(it.type) || GRID_TYPES.includes(it.type);
          const isContentOnly = CONTENT_ONLY_TYPES.includes(it.type);

          const data = {
            sectionId: sectionIdByIndex[si],
            orderNumber: ii + 1,
            type: it.type,
            title: it.title ?? null,
            description: it.description ?? null,
            isRequired: isContentOnly ? false : it.isRequired,
            shuffleOptions: hasOptions ? it.shuffleOptions : false,
            validation: jsonOrNull(it.validation),
            config: jsonOrNull(it.config),
          };

          let itemId: string;
          if (it.id) {
            await t.formItem.update({ where: { id: it.id }, data });
            itemId = it.id;
          } else {
            const created = await t.formItem.create({
              data: { ...data, id: newFormId("item"), formId },
              select: { id: true },
            });
            itemId = created.id;
          }
          keptItemIds.add(itemId);
          if (it.key) keyMap.items[it.key] = itemId;

          for (const [oi, o] of it.options.entries()) {
            const action = BRANCHING_TYPES.includes(it.type)
              ? o.branchAction
              : "NEXT";
            const optionData = {
              kind: o.kind,
              label: o.label,
              orderNumber: oi + 1,
              branchAction: action,
              branchSectionId:
                action === "GO_TO_SECTION"
                  ? resolveSection(o.branchSectionId, o.branchSectionKey)
                  : null,
            };

            let optionId: string;
            if (o.id) {
              await t.formOption.update({
                where: { id: o.id },
                data: optionData,
              });
              optionId = o.id;
            } else {
              const created = await t.formOption.create({
                data: { ...optionData, id: newFormId("option"), itemId },
                select: { id: true },
              });
              optionId = created.id;
            }
            keptOptionIds.add(optionId);
            if (o.key) keyMap.options[o.key] = optionId;
          }
        }
      }

      // ── Fase 4: yang nggak ada di payload di-SOFT delete
      const now = new Date();
      const delOptions = [...liveOptions.keys()].filter(
        (id) => !keptOptionIds.has(id),
      );
      const delItems = [...liveItems.keys()].filter(
        (id) => !keptItemIds.has(id),
      );
      const delSections = [...liveSections].filter(
        (id) => !payloadSectionIds.has(id),
      );

      if (delOptions.length)
        await t.formOption.updateMany({
          where: { id: { in: delOptions } },
          data: { deletedAt: now },
        });
      if (delItems.length)
        await t.formItem.updateMany({
          where: { id: { in: delItems } },
          data: { deletedAt: now },
        });
      if (delSections.length)
        await t.formSection.updateMany({
          where: { id: { in: delSections } },
          data: { deletedAt: now },
        });

      // updatedAt di form ikut diperbarui (kolom "Terakhir Diperbarui")
      await t.form.update({ where: { id: formId }, data: { updatedAt: now } });

      // Form yang sudah Published harus tetap valid setelah diedit
      if (form.status === "PUBLISHED") {
        const fresh = await t.form.findUnique({
          where: { id: formId },
          include: structureInclude,
        });
        const issues = collectPublishIssues(fresh);
        if (issues.length > 0) {
          throw new FormError(
            400,
            "Perubahan ditolak: form yang sudah dipublikasikan harus tetap valid. Unpublish dulu kalau mau mengubah besar-besaran.",
            "INVALID_PUBLISHED_STRUCTURE",
            issues,
          );
        }
      }
    },
    { maxWait: 10000, timeout: 60000 },
  );

  const detail = await getFormDetail(actor, formId);
  return { ...detail, keyMap };
}

// ─── Publish / Unpublish / Archive ──────────────────────────────────────────

export async function publishForm(actor: FormActor, formId: string) {
  const form = await getFormOrThrow(formId);
  assertManage(actor, form);

  if (form.status === "ARCHIVED") {
    throw new FormError(409, "Form yang diarsipkan tidak bisa dipublikasikan");
  }
  if (form.status === "PUBLISHED") return getFormDetail(actor, formId);

  const issues = collectPublishIssues(form);
  if (issues.length > 0) {
    throw new FormError(
      400,
      "Form belum bisa dipublikasikan",
      "PUBLISH_VALIDATION_FAILED",
      issues,
    );
  }

  await prisma.form.update({
    where: { id: formId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  return getFormDetail(actor, formId);
}

export async function unpublishForm(actor: FormActor, formId: string) {
  const form = await getFormOrThrow(formId);
  assertManage(actor, form);

  if (form.status !== "PUBLISHED") {
    throw new FormError(409, "Form tidak sedang dipublikasikan");
  }

  // Konfigurasi dan response tetap aman; cuma akses responder dihentikan
  await prisma.form.update({
    where: { id: formId },
    data: { status: "DRAFT" },
  });
  return getFormDetail(actor, formId);
}

export async function archiveForm(actor: FormActor, formId: string) {
  const form = await getFormOrThrow(formId);
  assertManage(actor, form);

  if (form.status === "ARCHIVED") {
    throw new FormError(409, "Form sudah diarsipkan");
  }

  await prisma.form.update({
    where: { id: formId },
    data: { status: "ARCHIVED", archivedAt: new Date() },
  });
  return getFormDetail(actor, formId);
}

// ─── Duplicate (juga dipakai buat "ganti tipe form") ────────────────────────

export async function duplicateForm(
  actor: FormActor,
  formId: string,
  input: DuplicateFormInput,
) {
  const src = await getFormOrThrow(formId);
  assertManage(actor, src);

  const type: "EVENT" | "NON_EVENT" = input.type ?? src.type;
  let eventId: string | null = null;
  let eventNameSnapshot: string | null = null;

  if (type === "EVENT") {
    const wanted = input.eventId ?? (src.type === "EVENT" ? src.eventId : null);
    if (!wanted) {
      throw new FormError(400, "eventId wajib diisi untuk Form Event");
    }
    const ev = await getEligibleEvent(wanted, actor);
    eventId = ev.id;
    eventNameSnapshot = ev.name;
  }

  const title = (input.title ?? `${src.title} (Salinan)`).slice(0, 200);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const duplicatedFormId: string = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const t = tx as any;

          const created = await t.form.create({
            data: {
              id: newFormId("form"),
              type,
              status: "DRAFT",
              title,
              description: src.description,
              slug: generateSlug(),
              // Jenis hanya berlaku di tipe yang sama; ganti tipe = tanpa jenis
              categoryId: type === src.type ? src.categoryId : null,
              eventId,
              eventNameSnapshot,
              showOnEventPage: type === "EVENT" ? src.showOnEventPage : false,
              acceptingResponses: src.acceptingResponses,
              responseLimitEnabled: src.responseLimitEnabled,
              responseLimit: src.responseLimit,
              periodEnabled: src.periodEnabled,
              openAt: src.openAt,
              closeAt: src.closeAt,
              responderAccess: src.responderAccess,
              collectEmail: src.collectEmail,
              limitOneResponsePerAccount: src.limitOneResponsePerAccount,
              allowEditResponse: src.allowEditResponse,
              sendResponseReceipt: src.sendResponseReceipt,
              allowResponderDraft: src.allowResponderDraft,
              shuffleQuestionOrder: src.shuffleQuestionOrder,
              notifyOnNewResponse: src.notifyOnNewResponse,
              confirmationMessage: src.confirmationMessage,
              closedMessage: src.closedMessage,
              headerImage: src.headerImage,
              themeColor: src.themeColor,
              backgroundColor: src.backgroundColor,
              fontPreset: src.fontPreset,
              createdById: actor.userId,
            },
            select: { id: true },
          });

          // section dulu, tujuan navigasi menyusul (butuh peta ID lama -> baru)
          const sectionMap = new Map<string, string>();
          for (const s of src.sections) {
            const ns = await t.formSection.create({
              data: {
                id: newFormId("section"),
                formId: created.id,
                title: s.title,
                description: s.description,
                orderNumber: s.orderNumber,
                nextAction: s.nextAction,
              },
              select: { id: true },
            });
            sectionMap.set(s.id, ns.id);
          }
          for (const s of src.sections) {
            if (s.nextSectionId && sectionMap.has(s.nextSectionId)) {
              await t.formSection.update({
                where: { id: sectionMap.get(s.id) },
                data: { nextSectionId: sectionMap.get(s.nextSectionId) },
              });
            }
          }

          for (const s of src.sections) {
            for (const it of s.items) {
              const ni = await t.formItem.create({
                data: {
                  id: newFormId("item"),
                  formId: created.id,
                  sectionId: sectionMap.get(s.id),
                  orderNumber: it.orderNumber,
                  type: it.type,
                  title: it.title,
                  description: it.description,
                  isRequired: it.isRequired,
                  shuffleOptions: it.shuffleOptions,
                  validation: jsonOrNull(it.validation),
                  config: jsonOrNull(it.config),
                },
                select: { id: true },
              });
              for (const o of it.options) {
                await t.formOption.create({
                  data: {
                    id: newFormId("option"),
                    itemId: ni.id,
                    kind: o.kind,
                    label: o.label,
                    orderNumber: o.orderNumber,
                    branchAction: o.branchAction,
                    branchSectionId: o.branchSectionId
                      ? (sectionMap.get(o.branchSectionId) ?? null)
                      : null,
                  },
                });
              }
            }
          }

          return created.id as string;
        },
        { maxWait: 10000, timeout: 60000 },
      );

      return getFormDetail(actor, duplicatedFormId);
    } catch (err: any) {
      if (err?.code === "P2002" && attempt < 2) continue; // slug bentrok
      throw err;
    }
  }
}

// ─── Bagikan link, prefilled link, preview ──────────────────────────────────

export async function getShareInfo(actor: FormActor, formId: string) {
  const form = await getFormOrThrow(formId);
  assertManage(actor, form);

  if (form.status !== "PUBLISHED") {
    throw new FormError(
      409,
      "Link form baru tersedia setelah form dipublikasikan",
      "FORM_NOT_PUBLISHED",
    );
  }

  const url = `${frontendBaseUrl()}/form/${form.slug}`;
  return {
    url, // QR Code dibuat di frontend dari URL ini
    slug: form.slug,
    isShownOnEventPage:
      form.type === "EVENT" && form.showOnEventPage && !!form.eventId,
  };
}

export async function buildPrefillLink(
  actor: FormActor,
  formId: string,
  input: PrefillLinkInput,
) {
  const form = await getFormOrThrow(formId);
  assertManage(actor, form);

  if (form.status !== "PUBLISHED") {
    throw new FormError(
      409,
      "Prefilled link baru bisa dibuat setelah form dipublikasikan",
      "FORM_NOT_PUBLISHED",
    );
  }

  const itemsById = new Map<string, any>();
  for (const s of form.sections)
    for (const it of s.items) itemsById.set(it.id, it);

  const params = new URLSearchParams();

  for (const [itemId, value] of Object.entries(input.answers)) {
    const item = itemsById.get(itemId);
    if (!item || !PREFILL_TYPES.includes(item.type)) {
      throw new FormError(400, `Pertanyaan ${itemId} tidak mendukung prefill`);
    }

    const bad = (msg: string) =>
      new FormError(400, `Pertanyaan ${itemId}: ${msg}`);

    switch (item.type) {
      case "SHORT_ANSWER":
      case "PARAGRAPH":
        if (typeof value !== "string") throw bad("nilai harus berupa teks");
        break;
      case "TIME_DURATION":
        if (
          typeof value !== "string" ||
          !/^\d{1,3}:[0-5]\d(:[0-5]\d)?$/.test(value)
        )
          throw bad("format waktu harus HH:mm atau HH:mm:ss");
        break;
      case "DATE":
        if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
          throw bad("format tanggal harus yyyy-mm-dd");
        break;
      case "LINEAR_SCALE":
      case "RATING":
        if (typeof value !== "number" || !Number.isInteger(value))
          throw bad("nilai harus berupa angka bulat");
        break;
      case "MULTIPLE_CHOICE":
      case "DROPDOWN":
      case "CHECKBOXES": {
        const ids = Array.isArray(value) ? value : [String(value)];
        if (item.type !== "CHECKBOXES" && ids.length !== 1)
          throw bad("hanya boleh satu pilihan");
        const valid = new Set(
          item.options
            .filter((o: any) => o.kind === "CHOICE")
            .map((o: any) => o.id),
        );
        if (ids.some((id) => !valid.has(id)))
          throw bad("ada pilihan yang tidak valid");
        break;
      }
    }

    params.set(
      `pf_${itemId}`,
      Array.isArray(value) ? value.join(",") : String(value),
    );
  }

  return {
    url: `${frontendBaseUrl()}/form/${form.slug}?${params.toString()}`,
  };
}

// Struktur form dalam bentuk yang dikonsumsi renderer responden (tanpa data
// internal). Dipakai Preview — fungsi yang sama di form_public.service.ts.
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

// Preview memakai data yang sama dengan renderer responden, tapi TIDAK
// menyimpan apa pun ke tabel response (cuma baca).
export async function getFormPreview(actor: FormActor, formId: string) {
  const form = await getFormOrThrow(formId);
  assertManage(actor, form);

  return {
    preview: true,
    form: serializeForRenderer(form),
    availability: { isOpen: true },
  };
}

// ─── Upload: header image & media konten ────────────────────────────────────

export async function setFormHeaderImage(
  actor: FormActor,
  formId: string,
  file?: Express.Multer.File,
) {
  if (!file) throw new FormError(400, "File header image wajib diunggah");

  try {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { id: true, createdById: true, status: true, headerImage: true },
    });
    if (!form) throw new FormError(404, "Form tidak ditemukan");
    assertManage(actor, form);
    if (form.status === "ARCHIVED") {
      throw new FormError(409, "Form sudah diarsipkan dan tidak bisa diubah");
    }

    const newPath = `formHeaders/${file.filename}`;
    await prisma.form.update({
      where: { id: formId },
      data: { headerImage: newPath },
    });

    await deleteHeaderFileIfUnused(form.headerImage, formId);
    return { headerImage: newPath };
  } catch (err) {
    safeUnlink(file.path); // jangan sisakan file yatim kalau gagal
    throw err;
  }
}

export async function removeFormHeaderImage(actor: FormActor, formId: string) {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: { id: true, createdById: true, status: true, headerImage: true },
  });
  if (!form) throw new FormError(404, "Form tidak ditemukan");
  assertManage(actor, form);
  if (form.status === "ARCHIVED") {
    throw new FormError(409, "Form sudah diarsipkan dan tidak bisa diubah");
  }

  await prisma.form.update({
    where: { id: formId },
    data: { headerImage: null },
  });
  await deleteHeaderFileIfUnused(form.headerImage, formId);
  return { headerImage: null };
}

// File header bisa dipakai bareng form hasil duplicate, jadi cuma dihapus
// dari disk kalau sudah nggak dipakai form lain.
async function deleteHeaderFileIfUnused(
  oldPath: string | null,
  exceptFormId: string,
) {
  if (!oldPath || !oldPath.startsWith("formHeaders/")) return;
  const stillUsed = await prisma.form.count({
    where: { headerImage: oldPath, id: { not: exceptFormId } },
  });
  if (stillUsed === 0) {
    safeUnlink(path.join(formHeaderPath, path.basename(oldPath)));
  }
}

// Upload gambar/video buat elemen Image/Video. Nggak menulis ke DB: url hasil
// upload dimasukkan frontend ke item.config.url lalu ikut tersimpan lewat
// PUT /forms/:id/structure.
export async function uploadFormMedia(
  actor: FormActor,
  formId: string,
  file?: Express.Multer.File,
) {
  if (!file) throw new FormError(400, "File media wajib diunggah");

  try {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { id: true, createdById: true, status: true },
    });
    if (!form) throw new FormError(404, "Form tidak ditemukan");
    assertManage(actor, form);
    if (form.status === "ARCHIVED") {
      throw new FormError(409, "Form sudah diarsipkan dan tidak bisa diubah");
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const isVideo = [".mp4", ".mov", ".avi", ".mkv", ".webm"].includes(ext);

    return {
      url: `/uploads/formMediaContents/${file.filename}`,
      mediaType: isVideo ? "VIDEO" : "IMAGE",
      originalName: file.originalname,
      sizeBytes: file.size,
    };
  } catch (err) {
    safeUnlink(file.path);
    throw err;
  }
}
