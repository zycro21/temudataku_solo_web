import { z } from "zod";

export const createExecutableCodeSchema = z.object({
  params: z.object({
    textId: z.string().min(1, "Text ID wajib diisi"),
  }),
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    language: z.enum(["PYTHON", "JAVASCRIPT", "CPP", "SQL", "R"]),
    initialCode: z
      .string()
      .min(1, "Kode awal wajib diisi")
      .describe("Multi-line string diperbolehkan"),
    anchor: z.object({
      blockId: z.string().min(1, "Block ID wajib diisi"),
      position: z.enum(["BEFORE", "INLINE", "AFTER"]),
      orderNumber: z.number().int().optional(),
    }),
  }),
});

export const getExecutableCodeByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Executable Code ID wajib diisi"),
  }),
});

export const getExecutableCodesByTextSchema = z.object({
  params: z.object({
    textId: z.string().min(1, "Text ID wajib diisi"),
  }),
  query: z.object({
    language: z.enum(["PYTHON", "JAVASCRIPT", "CPP", "SQL", "R"]).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
    sortBy: z
      .enum(["createdAt", "updatedAt", "title"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  }),
});

export const updateExecutableCodeSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ExecutableCode ID wajib"),
  }),
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    language: z.enum(["PYTHON", "JAVASCRIPT", "CPP", "SQL", "R"]).optional(),
    initialCode: z.string().optional(), // MULTI-LINE AMAN
    isEditable: z.boolean().optional(),
    anchor: z
      .object({
        blockId: z.string().min(1).optional(),
        position: z.enum(["BEFORE", "INLINE", "AFTER"]).optional(),
        orderNumber: z.number().int().min(1).optional(),
      })
      .optional(),
  }),
});

export const deleteExecutableCodeSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Executable Code ID wajib diisi"),
  }),
});

export const toggleExecutableCodeEditableSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Executable Code ID wajib diisi"),
  }),
  body: z.object({
    isEditable: z.boolean(),
  }),
});

export const getExecutableCodesByBlockSchema = z.object({
  params: z.object({
    blockId: z.string().min(1, "Block ID wajib diisi"),
  }),
});

export const duplicateExecutableCodeSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Executable Code ID wajib diisi"),
  }),
  body: z.object({
    targetTextId: z.string().min(1, "Target Text ID wajib diisi"),
    override: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        isEditable: z.boolean().optional(),
      })
      .optional(),
    anchor: z.object({
      blockId: z.string().min(1, "Block ID wajib diisi"),
      position: z.enum(["BEFORE", "INLINE", "AFTER"]),
      orderNumber: z.number().int().optional(),
    }),
  }),
});

export const runExecutableCodeSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Executable Code ID wajib diisi"),
  }),
  body: z.object({
    code: z.string().optional(),
    input: z.string().optional(),
  }),
});

export const getExecutableCodeRunsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Executable Code ID wajib diisi"),
  }),
  query: z.object({
    limit: z.coerce.number().int().min(1).max(50).default(10),
    page: z.coerce.number().int().min(1).default(1),
    success: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === "true")),
    sort: z.enum(["latest", "oldest", "fastest", "slowest"]).default("latest"),
  }),
});

export const getExecutableCodeRunDetailSchema = z.object({
  params: z.object({
    runId: z.string().min(1, "Run ID wajib diisi"),
  }),
});

export const getMyCodeRunsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : 1))
      .refine((v) => v >= 1, "Page minimal 1"),
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : 10))
      .refine((v) => v >= 1 && v <= 100, "Limit 1 - 100"),
  }),
});
