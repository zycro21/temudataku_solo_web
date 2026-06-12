import { z } from "zod";

export const getTextsBySubBabSchema = z.object({
  params: z.object({
    subBabId: z.string().min(1, "SubBab ID wajib diisi"),
  }),
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v) : 1))
      .refine((v) => !isNaN(v) && v > 0, "Page harus berupa angka positif"),
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v) : 10))
      .refine((v) => !isNaN(v) && v > 0, "Limit harus berupa angka positif"),
    search: z.string().optional(),
    sortBy: z.enum(["title", "createdAt", "orderNumber"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const getTextByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID teks wajib diisi"),
  }),
});

// export const createTextSchema = z.object({
//   params: z.object({
//     subBabId: z.string().min(1, "SubBab ID wajib diisi"),
//   }),
//   body: z.object({
//     title: z.string().optional(),
//     status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
//     blocks: z
//       .array(
//         z.object({
//           content: z.string().min(1, "Konten block wajib diisi"),
//           order: z.number().int().min(1),
//         }),
//       )
//       .optional() // 🔥 ini kunci
//       .default([])
//       .refine((blocks) => {
//         if (!blocks || blocks.length === 0) return true; // 🔥 tambahin ini

//         const orders = blocks.map((b) => b.order);
//         const uniqueOrders = new Set(orders);
//         if (uniqueOrders.size !== orders.length) return false;

//         const sorted = [...orders].sort((a, b) => a - b);
//         for (let i = 0; i < sorted.length; i++) {
//           if (sorted[i] !== i + 1) return false;
//         }
//         return true;
//       }, "Order block harus unik dan berurutan mulai dari 1"),
//   }),
// });

// ─── Shared sub-schemas ────────────────────────────────────────────────────────

const headingContentSchema = z.object({
  type: z.literal("heading"),
  level: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  text: z.string().min(1),
  orderNumber: z.number().int().min(1).optional(),
});

const paragraphContentSchema = z.object({
  type: z.literal("paragraph"),
  text: z.string().min(1),
  orderNumber: z.number().int().min(1).optional(),
});

const highlightContentSchema = z.object({
  type: z.literal("highlight"),
  text: z.string().max(120),
  orderNumber: z.number().int().min(1).optional(),
});

const accordionContentSchema = z.object({
  type: z.literal("accordion"),
  title: z.string().min(1),
  description: z.string().optional(),
  orderNumber: z.number().int().min(1).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        orderNumber: z.number().int().min(1),
      }),
    )
    .min(1),
});

const carouselContentSchema = z.object({
  type: z.literal("carousel"),
  title: z.string().min(1),
  description: z.string().optional(),
  cardsPerSlide: z.number().int().min(1).optional(),
  orderNumber: z.number().int().min(1).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        image: z.string().url().optional(),
        content: z.string().optional(),
        orderNumber: z.number().int().min(1),
      }),
    )
    .min(1),
});

const contentCardSchema = z.object({
  type: z.literal("content_card"),
  title: z.string().min(1),
  description: z.string().optional(),
  disableExpandableContent: z.boolean(),
  orderNumber: z.number().int().min(1).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        expandableContent: z.string().optional(),
        orderNumber: z.number().int().min(1),
      }),
    )
    .min(1),
});

const tabNavigationSchema = z.object({
  type: z.literal("tab_navigation"),
  title: z.string().min(1),
  description: z.string().optional(),
  orderNumber: z.number().int().min(1).optional(),
  tabs: z
    .array(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        orderNumber: z.number().int().min(1),
      }),
    )
    .min(1),
});

const summaryContentSchema = z.object({
  type: z.literal("summary"),
  orderNumber: z.number().int().min(1).optional(),
  comments: z.array(z.string().min(1)).min(1),
});

const blockContentSchema = z.discriminatedUnion("type", [
  headingContentSchema,
  paragraphContentSchema,
  highlightContentSchema,
  accordionContentSchema,
  carouselContentSchema,
  contentCardSchema,
  tabNavigationSchema,
  summaryContentSchema,
]);

// ─── Additional content sub-schemas ───────────────────────────────────────────

const imageVideoSchema = z.object({
  type: z.literal("image_video"),
  position: z.enum(["BEFORE", "AFTER", "INLINE"]),
  orderNumber: z.number().int().min(1).optional(),
  isNewUpload: z.boolean(), // ← tambah ini
  content: z.object({
    url: z.string().url().optional(), // ← jadi opsional
    title: z.string().optional(),
    caption: z.string().optional(),
    description: z.string().optional(),
    mediaType: z.enum(["IMAGE", "VIDEO"]),
    thumbnailUrl: z.string().url().optional(),
    durationSeconds: z.number().int().min(0).optional(),
  }),
});

const multipleChoiceSchema = z.object({
  type: z.literal("multiple_choice"),
  position: z.enum(["BEFORE", "AFTER", "INLINE"]),
  orderNumber: z.number().int().min(1).optional(),
  content: z.object({
    question: z.string().min(1),
    description: z.string().optional(),
    allowMultiple: z.boolean().optional(),
    explanation: z.string().optional(),
    options: z
      .array(
        z.object({
          content: z.string().min(1),
          isCorrect: z.boolean(),
          orderNumber: z.number().int().min(1),
        }),
      )
      .min(2),
  }),
});

const matchingSchema = z.object({
  type: z.literal("matching"),
  position: z.enum(["BEFORE", "AFTER", "INLINE"]),
  orderNumber: z.number().int().min(1).optional(),
  content: z.object({
    title: z.string().optional(),
    instruction: z.string().optional(),
    maxScore: z.number().min(0).optional(),
    explanation: z.string().optional(),
    items: z
      .array(
        z.object({
          content: z.string().min(1),
          side: z.enum(["LEFT", "RIGHT"]),
          orderNumber: z.number().int().min(1),
          matchWithId: z.string().optional(), // client-side temp ID, resolved backend
        }),
      )
      .min(2),
  }),
});

const interactiveCodeSchema = z.object({
  type: z.literal("interactive_code"),
  position: z.enum(["BEFORE", "AFTER", "INLINE"]),
  orderNumber: z.number().int().min(1).optional(),
  content: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    language: z.enum(["PYTHON", "JAVASCRIPT", "CPP", "SQL", "R"]),
    initialCode: z.string().min(1),
    isEditable: z.boolean().optional(),
    expectedResult: z.string().optional(),
  }),
});

const additionalContentSchema = z.discriminatedUnion("type", [
  imageVideoSchema,
  multipleChoiceSchema,
  matchingSchema,
  interactiveCodeSchema,
]);

// ─── Block schema ──────────────────────────────────────────────────────────────

const blockSchema = z.object({
  orderNumber: z.number().int().min(1),
  contents: z.array(blockContentSchema).optional().default([]),
  additionalContents: z.array(additionalContentSchema).optional().default([]),
});

const quizSchema = z.object({
  title: z.string().min(1),

  description: z.string().optional(),

  timeLimitMinutes: z.number().int().positive().optional(),

  questions: z
    .array(
      z.object({
        questionText: z.string().min(1),

        options: z.array(z.string()).min(2),

        correctAnswers: z.array(z.string()).min(1),

        explanation: z.string().optional(),

        orderNumber: z.number().int().min(1).optional(),
      }),
    )
    .min(1),
});

const assignmentSchema = z.object({
  title: z.string().min(1),

  description: z.string().optional(),

  dueDays: z.number().int().positive().optional(),

  instructions: z
    .array(
      z.object({
        instruction: z.string().min(1),
        orderNumber: z.number().int().min(1),
      }),
    )
    .default([]),

  supportingFiles: z
    .array(
      z.object({
        name: z.string().min(1),
        type: z.enum(["DATASET", "TEMPLATE", "REFERENCE"]),
        isNewUpload: z.boolean(), // ← tambah ini
        url: z.string().url().optional(), // ← tambah ini (opsional, wajib jika isNewUpload = false)
        pageCount: z.number().optional(),
        format: z.string().optional(),
        sizeKB: z.number().optional(),
      }),
    )
    .optional()
    .default([]),
});

// ─── Final update schema ───────────────────────────────────────────────────────

export const createTextSchema = z.object({
  params: z.object({
    subBabId: z.string().min(1, "SubBab ID wajib diisi"),
  }),
  body: z.object({
    title: z.string().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    blocks: z
      .array(blockSchema) // ← ganti dari object lama ke blockSchema yang sudah ada
      .optional()
      .default([]),
  }),
});

export const updateTextSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID teks wajib diisi"),
  }),
  body: z
    .object({
      title: z.string().optional(),
      status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
      orderNumber: z.number().int().min(1).optional(),
      blocks: z.array(blockSchema).optional(),
      quiz: quizSchema.optional(),
      assignment: assignmentSchema.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Minimal satu field harus diupdate",
    }),
});

export const deleteTextSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID teks wajib diisi"),
  }),
});

export const reorderTextSchema = z.object({
  params: z.object({
    subBabId: z.string().min(1),
  }),
  body: z.object({
    orders: z
      .array(
        z.object({
          id: z.string().min(1),
          orderNumber: z.number().int().min(1),
        }),
      )
      .min(1),
  }),
});

export const searchTextSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    subBabId: z.string().optional(),
    page: z
      .string()
      .transform((v) => parseInt(v))
      .refine((v) => v > 0, "Page harus lebih besar dari 0")
      .optional()
      .default("1"),
    limit: z
      .string()
      .transform((v) => parseInt(v))
      .refine((v) => v > 0, "Limit harus lebih besar dari 0")
      .optional()
      .default("10"),
    sortBy: z
      .enum(["createdAt", "updatedAt", "title", "orderNumber"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export const exportTextSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("csv"),
  }),
});

export const getBlocksByTextSchema = z.object({
  params: z.object({
    textId: z.string().min(1, "Text ID wajib diisi"),
  }),
});

export const createTextBlockSchema = z.object({
  params: z.object({
    textId: z.string().min(1, "Text ID wajib diisi"),
  }),
  body: z.object({
    content: z.string().min(1, "Content block tidak boleh kosong"),
  }),
});

export const updateTextBlockSchema = z.object({
  params: z.object({
    blockId: z.string().min(1, "Block ID wajib diisi"),
  }),
  body: z.object({
    content: z.string().min(1, "Content tidak boleh kosong"),
  }),
});

export const deleteBlockSchema = z.object({
  params: z.object({
    blockId: z.string().min(1, "Block ID wajib diisi"),
  }),
});

export const reorderTextBlocksSchema = z.object({
  params: z.object({
    textId: z.string().min(1, "Text ID wajib diisi"),
  }),
  body: z.object({
    orders: z
      .array(
        z.object({
          blockId: z.string().min(1, "Block ID wajib diisi"),
          order: z.number().int().min(1, "Order minimal bernilai 1"),
        }),
      )
      .min(1, "Minimal satu block harus diubah urutannya"),
  }),
});

export const getSingleBlockSchema = z.object({
  params: z.object({
    blockId: z.string().min(1, "Block ID wajib diisi"),
  }),
});

export const exportTextBlockSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).default("csv"),
  }),
});

export const getTextContentSchema = z.object({
  params: z.object({
    textId: z.string().min(1, "Text ID wajib diisi"),
  }),
});
