import { z } from "zod";

// ─── Konstanta tipe ─────────────────────────────────────────────────────────

export const FORM_ITEM_TYPES = [
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
  "TITLE_DESCRIPTION",
  "IMAGE",
  "VIDEO",
] as const;

const CONTENT_ONLY_TYPES = ["TITLE_DESCRIPTION", "IMAGE", "VIDEO"];
const CHOICE_TYPES = ["MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN"];
const GRID_TYPES = ["MULTIPLE_CHOICE_GRID", "CHECKBOX_GRID"];
const BRANCHING_TYPES = ["MULTIPLE_CHOICE", "DROPDOWN"];

// Jenis validasi yang boleh dipakai per tipe pertanyaan
const ALLOWED_VALIDATION_KINDS: Record<string, string[]> = {
  SHORT_ANSWER: ["number", "text", "length", "regex"],
  PARAGRAPH: ["length", "regex"],
  CHECKBOXES: ["selectCount"],
};

const idString = z.string().trim().min(1).max(100);
const keyString = z.string().trim().min(1).max(100);

// ─── Aturan validasi jawaban (FormItem.validation) ─────────────────────────
// Contoh:
//  {"kind":"number","op":"between","min":1,"max":10,"message":"..."}
//  {"kind":"text","op":"email"}
//  {"kind":"length","op":"max","value":100}
//  {"kind":"regex","op":"matches","value":"^[0-9]+$"}
//  {"kind":"selectCount","op":"atLeast","value":2}   // Checkboxes

const ruleMessage = z.string().trim().max(300).optional();

const numberRuleSchema = z.object({
  kind: z.literal("number"),
  op: z.enum([
    "between",
    "notBetween",
    "gt",
    "gte",
    "lt",
    "lte",
    "eq",
    "neq",
    "integer",
  ]),
  min: z.number().optional(),
  max: z.number().optional(),
  value: z.number().optional(),
  message: ruleMessage,
});

const textRuleSchema = z.object({
  kind: z.literal("text"),
  op: z.enum(["contains", "notContains", "email", "url"]),
  value: z.string().trim().min(1).max(200).optional(),
  message: ruleMessage,
});

const lengthRuleSchema = z.object({
  kind: z.literal("length"),
  op: z.enum(["min", "max"]),
  value: z.number().int().min(0).max(10000),
  message: ruleMessage,
});

const regexRuleSchema = z.object({
  kind: z.literal("regex"),
  op: z.enum(["matches", "notMatches"]).default("matches"),
  value: z.string().min(1).max(200),
  message: ruleMessage,
});

const selectCountRuleSchema = z.object({
  kind: z.literal("selectCount"),
  op: z.enum(["atLeast", "atMost", "exactly"]),
  value: z.number().int().min(1).max(200),
  message: ruleMessage,
});

const validationRuleSchema = z
  .discriminatedUnion("kind", [
    numberRuleSchema,
    textRuleSchema,
    lengthRuleSchema,
    regexRuleSchema,
    selectCountRuleSchema,
  ])
  .superRefine((rule, ctx) => {
    if (rule.kind === "number") {
      if (
        (rule.op === "between" || rule.op === "notBetween") &&
        (rule.min === undefined ||
          rule.max === undefined ||
          rule.min > rule.max)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Operator between/notBetween butuh min dan max (min <= max)",
        });
      }
      if (
        ["gt", "gte", "lt", "lte", "eq", "neq"].includes(rule.op) &&
        rule.value === undefined
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Operator ${rule.op} butuh value`,
        });
      }
    }
    if (
      rule.kind === "text" &&
      (rule.op === "contains" || rule.op === "notContains") &&
      !rule.value
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Operator ${rule.op} butuh value`,
      });
    }
    if (rule.kind === "regex") {
      try {
        new RegExp(rule.value);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Regular expression tidak valid",
        });
      }
    }
  });

// ─── Config khusus tipe (FormItem.config) ──────────────────────────────────
// Dibuat .strict() supaya key sembarangan nggak ikut masuk DB.
// Kelengkapan (mis. url Image/Video wajib ada) dicek saat PUBLISH, bukan saat
// simpan draft — jadi semua field di sini opsional.

const mediaUrl = z
  .string()
  .trim()
  .max(1000)
  .refine(
    (v) =>
      v.startsWith("/uploads/formMediaContents/") || /^https?:\/\//i.test(v),
    "url harus hasil upload (/uploads/formMediaContents/...) atau link http(s)",
  );

const CONFIG_SCHEMAS: Record<string, z.ZodTypeAny> = {
  LINEAR_SCALE: z
    .object({
      min: z.union([z.literal(0), z.literal(1)]).optional(),
      max: z.number().int().min(2).max(10).optional(),
      minLabel: z.string().trim().max(100).optional(),
      maxLabel: z.string().trim().max(100).optional(),
    })
    .strict()
    .refine((c) => c.max === undefined || c.max > (c.min ?? 1), {
      message: "max harus lebih besar dari min",
    }),
  RATING: z
    .object({ max: z.number().int().min(3).max(10).optional() })
    .strict(),
  FILE_UPLOAD: z
    .object({
      maxFiles: z.number().int().min(1).max(10).optional(),
      maxSizeMb: z.number().int().min(1).max(50).optional(),
      allowedTypes: z
        .array(
          z.enum([
            "image",
            "pdf",
            "document",
            "spreadsheet",
            "presentation",
            "video",
            "audio",
            "archive",
          ]),
        )
        .max(8)
        .optional(),
    })
    .strict(),
  DATE: z.object({ includeYear: z.boolean().optional() }).strict(),
  TIME_DURATION: z
    .object({ mode: z.enum(["time", "duration"]).optional() })
    .strict(),
  MULTIPLE_CHOICE_GRID: z
    .object({
      requireEachRow: z.boolean().optional(),
      oneResponsePerColumn: z.boolean().optional(),
    })
    .strict(),
  CHECKBOX_GRID: z.object({ requireEachRow: z.boolean().optional() }).strict(),
  IMAGE: z
    .object({
      url: mediaUrl.optional(),
      caption: z.string().trim().max(300).optional(),
      widthPercent: z.number().int().min(10).max(100).optional(),
    })
    .strict(),
  VIDEO: z
    .object({
      url: mediaUrl.optional(),
      caption: z.string().trim().max(300).optional(),
    })
    .strict(),
};

// ─── Option / Item / Section ────────────────────────────────────────────────
// Urutan array = urutan tampil (orderNumber dihitung server dari index).
// `id`  -> item yang sudah ada (ID stabil, JANGAN dikirim ulang sebagai baru)
// `key` -> penanda sementara buat item BARU supaya bisa dirujuk branching di
//          payload yang sama (mirip pola key/targetKey di artikel).

const optionSchema = z.object({
  id: idString.optional(),
  key: keyString.optional(),
  kind: z.enum(["CHOICE", "GRID_ROW", "GRID_COLUMN"]).default("CHOICE"),
  label: z.string().trim().min(1, "Label pilihan wajib diisi").max(300),
  branchAction: z.enum(["NEXT", "GO_TO_SECTION", "SUBMIT"]).default("NEXT"),
  branchSectionId: idString.nullable().optional(),
  branchSectionKey: keyString.optional(),
});

const itemSchema = z
  .object({
    id: idString.optional(),
    key: keyString.optional(),
    type: z.enum(FORM_ITEM_TYPES),
    title: z.string().trim().max(2000).nullable().optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    isRequired: z.boolean().default(false),
    shuffleOptions: z.boolean().default(false),
    validation: z.unknown().nullable().optional(),
    config: z.unknown().nullable().optional(),
    options: z.array(optionSchema).max(200).default([]),
  })
  .superRefine((item, ctx) => {
    const isContentOnly = CONTENT_ONLY_TYPES.includes(item.type);
    const isChoice = CHOICE_TYPES.includes(item.type);
    const isGrid = GRID_TYPES.includes(item.type);

    // ── options sesuai tipe
    if (!isChoice && !isGrid && item.options.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: `Tipe ${item.type} tidak punya pilihan`,
      });
    }
    item.options.forEach((opt, i) => {
      const expected = isChoice ? ["CHOICE"] : ["GRID_ROW", "GRID_COLUMN"];
      if ((isChoice || isGrid) && !expected.includes(opt.kind)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options", i, "kind"],
          message: `Kind option ${opt.kind} tidak cocok untuk tipe ${item.type}`,
        });
      }
      if (!BRANCHING_TYPES.includes(item.type) && opt.branchAction !== "NEXT") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options", i, "branchAction"],
          message: "Branching hanya untuk Multiple Choice dan Dropdown",
        });
      }
      if (opt.branchSectionId && opt.branchSectionKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options", i, "branchSectionId"],
          message: "Isi salah satu: branchSectionId atau branchSectionKey",
        });
      }
    });

    // ── elemen konten nggak boleh required / shuffle
    if (isContentOnly && item.isRequired) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isRequired"],
        message: "Elemen konten tidak bisa dijadikan wajib diisi",
      });
    }

    // ── validation sesuai tipe
    if (item.validation !== null && item.validation !== undefined) {
      const allowedKinds = ALLOWED_VALIDATION_KINDS[item.type];
      if (!allowedKinds) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["validation"],
          message: `Tipe ${item.type} tidak mendukung validation`,
        });
      } else {
        const parsed = validationRuleSchema.safeParse(item.validation);
        if (!parsed.success) {
          parsed.error.issues.forEach((issue) =>
            ctx.addIssue({
              ...issue,
              path: ["validation", ...issue.path],
            }),
          );
        } else if (!allowedKinds.includes(parsed.data.kind)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["validation", "kind"],
            message: `Validation ${parsed.data.kind} tidak didukung untuk tipe ${item.type}`,
          });
        }
      }
    }

    // ── config sesuai tipe
    const configSchema = CONFIG_SCHEMAS[item.type];
    if (item.config !== null && item.config !== undefined) {
      if (!configSchema) {
        const isEmptyObject =
          typeof item.config === "object" &&
          item.config !== null &&
          Object.keys(item.config as object).length === 0;
        if (!isEmptyObject) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["config"],
            message: `Tipe ${item.type} tidak punya config`,
          });
        }
      } else {
        const parsed = configSchema.safeParse(item.config);
        if (!parsed.success) {
          parsed.error.issues.forEach((issue) =>
            ctx.addIssue({ ...issue, path: ["config", ...issue.path] }),
          );
        }
      }
    }
  });

const sectionSchema = z.object({
  id: idString.optional(),
  key: keyString.optional(),
  title: z.string().trim().max(300).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  nextAction: z.enum(["NEXT", "GO_TO_SECTION", "SUBMIT"]).default("NEXT"),
  nextSectionId: idString.nullable().optional(),
  nextSectionKey: keyString.optional(),
  items: z.array(itemSchema).max(100).default([]),
});

// ─── Endpoint: PUT /forms/:id/structure (Simpan Draft) ─────────────────────
// FULL SYNC: apa pun yang tidak ada di payload di-soft-delete (bukan hard
// delete) supaya response lama tetap valid. ID item/option yang sudah ada
// tidak pernah dibuat ulang.

export const saveFormStructureSchema = z.object({
  params: z.object({ id: idString }),
  body: z
    .object({
      sections: z.array(sectionSchema).min(1, "Minimal 1 section").max(50),
    })
    .superRefine((body, ctx) => {
      const sectionIds: string[] = [];
      const itemIds: string[] = [];
      const optionIds: string[] = [];
      const sectionKeys: string[] = [];
      const itemKeys: string[] = [];
      const optionKeys: string[] = [];
      let totalItems = 0;

      body.sections.forEach((s) => {
        if (s.id) sectionIds.push(s.id);
        if (s.key) sectionKeys.push(s.key);
        s.items.forEach((it) => {
          totalItems++;
          if (it.id) itemIds.push(it.id);
          if (it.key) itemKeys.push(it.key);
          it.options.forEach((o) => {
            if (o.id) optionIds.push(o.id);
            if (o.key) optionKeys.push(o.key);
          });
        });
      });

      const dup = (arr: string[]) => arr.find((v, i) => arr.indexOf(v) !== i);
      const checks: [string, string[]][] = [
        ["id section", sectionIds],
        ["id item", itemIds],
        ["id option", optionIds],
        ["key section", sectionKeys],
        ["key item", itemKeys],
        ["key option", optionKeys],
      ];
      for (const [label, arr] of checks) {
        const d = dup(arr);
        if (d) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Ada ${label} ganda: ${d}`,
          });
        }
      }

      if (totalItems > 300) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Maksimal 300 item (pertanyaan + elemen) per form",
        });
      }

      // referensi key section harus ada di payload yang sama
      const keySet = new Set(sectionKeys);
      body.sections.forEach((s, si) => {
        if (s.nextSectionId && s.nextSectionKey) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["sections", si, "nextSectionId"],
            message: "Isi salah satu: nextSectionId atau nextSectionKey",
          });
        }
        if (s.nextSectionKey && !keySet.has(s.nextSectionKey)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["sections", si, "nextSectionKey"],
            message: `nextSectionKey "${s.nextSectionKey}" tidak ditemukan di payload`,
          });
        }
        s.items.forEach((it, ii) =>
          it.options.forEach((o, oi) => {
            if (o.branchSectionKey && !keySet.has(o.branchSectionKey)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [
                  "sections",
                  si,
                  "items",
                  ii,
                  "options",
                  oi,
                  "branchSectionKey",
                ],
                message: `branchSectionKey "${o.branchSectionKey}" tidak ditemukan di payload`,
              });
            }
          }),
        );
      });
    }),
});

// ─── Endpoint: GET /forms (Kelola Form) ─────────────────────────────────────

export const listFormsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    type: z.enum(["EVENT", "NON_EVENT"]).optional(), // tab aktif
    categoryId: idString.optional(), // filter per jenis form
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    search: z.string().trim().max(100).optional(),
    sortBy: z.enum(["createdAt", "updatedAt"]).default("updatedAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"), // desc = terbaru
  }),
});

// ─── Endpoint: POST /forms ──────────────────────────────────────────────────

export const createFormSchema = z.object({
  body: z
    .object({
      type: z.enum(["EVENT", "NON_EVENT"]),
      title: z.string().trim().min(1).max(200).default("Form Tanpa Judul"),
      description: z.string().trim().max(5000).nullable().optional(),
      categoryId: idString.optional(), // jenis form (FormCategory)
      eventId: idString.optional(),
    })
    .superRefine((b, ctx) => {
      if (b.type === "EVENT" && !b.eventId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["eventId"],
          message: "eventId wajib diisi untuk Form Event",
        });
      }
      if (b.type === "NON_EVENT" && b.eventId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["eventId"],
          message: "Form Non Event tidak boleh dikaitkan ke Event",
        });
      }
    }),
});

// ─── Endpoint param-only (detail, publish, unpublish, archive, preview, share, header-image, media) ──

export const formIdParamSchema = z.object({
  params: z.object({ id: idString }),
});

// ─── Endpoint: PATCH /forms/:id (judul, deskripsi, pengaturan, tema) ───────

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Warna harus format hex, contoh #10B981");

export const updateFormSchema = z.object({
  params: z.object({ id: idString }),
  body: z
    .object({
      title: z.string().trim().min(1).max(200).optional(),
      description: z.string().trim().max(5000).nullable().optional(),

      // penerimaan response
      showOnEventPage: z.boolean().optional(),
      acceptingResponses: z.boolean().optional(),
      responseLimitEnabled: z.boolean().optional(),
      responseLimit: z.number().int().min(1).max(1000000).nullable().optional(),
      periodEnabled: z.boolean().optional(),
      openAt: z.coerce.date().nullable().optional(),
      closeAt: z.coerce.date().nullable().optional(),

      // pengaturan responder
      responderAccess: z
        .enum(["ANYONE_WITH_LINK", "LOGIN_REQUIRED"])
        .optional(),
      collectEmail: z.boolean().optional(),
      limitOneResponsePerAccount: z.boolean().optional(),
      allowEditResponse: z.boolean().optional(),
      sendResponseReceipt: z.boolean().optional(),
      allowResponderDraft: z.boolean().optional(),
      shuffleQuestionOrder: z.boolean().optional(),
      notifyOnNewResponse: z.boolean().optional(),
      confirmationMessage: z.string().trim().max(2000).nullable().optional(),
      closedMessage: z.string().trim().max(2000).nullable().optional(),

      // tampilan / tema
      themeColor: hexColor.nullable().optional(),
      backgroundColor: hexColor.nullable().optional(),
      fontPreset: z.string().trim().min(1).max(50).nullable().optional(),
    })
    .refine((d) => Object.keys(d).length > 0, {
      message: "Minimal satu field harus diupdate",
    }),
});

// ─── Endpoint: POST /forms/:id/duplicate ────────────────────────────────────
// type opsional: duplicate dipakai juga buat "ganti tipe" (PRD: tipe dikunci,
// perubahan tipe = bikin form baru lewat duplicate).

export const duplicateFormSchema = z.object({
  params: z.object({ id: idString }),
  body: z
    .object({
      title: z.string().trim().min(1).max(200).optional(),
      type: z.enum(["EVENT", "NON_EVENT"]).optional(),
      eventId: idString.optional(),
    })
    .default({}),
});

// ─── Endpoint: POST /forms/:id/prefill-link ─────────────────────────────────
// answers: { [itemId]: string | number | string[] }
// string[] dipakai untuk Checkboxes / pilihan (berisi optionId).

export const prefillLinkSchema = z.object({
  params: z.object({ id: idString }),
  body: z.object({
    answers: z
      .record(
        idString,
        z.union([z.string().max(1000), z.number(), z.array(idString).max(200)]),
      )
      .refine((r) => Object.keys(r).length > 0, "Minimal 1 jawaban prefill")
      .refine(
        (r) => Object.keys(r).length <= 100,
        "Maksimal 100 jawaban prefill",
      ),
  }),
});

// ─── Endpoint: GET /events/eligible (Pilih Event Non-Kelas) ─────────────────

export const listEligibleEventsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(100).optional(),
  }),
});

// ─── Tipe input (dipakai service) ───────────────────────────────────────────

export type ListFormsQuery = z.infer<typeof listFormsSchema>["query"];
export type CreateFormInput = z.infer<typeof createFormSchema>["body"];
export type UpdateFormInput = z.infer<typeof updateFormSchema>["body"];
export type SaveFormStructureInput = z.infer<
  typeof saveFormStructureSchema
>["body"];
export type DuplicateFormInput = z.infer<typeof duplicateFormSchema>["body"];
export type PrefillLinkInput = z.infer<typeof prefillLinkSchema>["body"];
export type ListEligibleEventsQuery = z.infer<
  typeof listEligibleEventsSchema
>["query"];
