import { z } from "zod";

export const startAndSubmitInteractiveAttemptSchema = z.object({
  params: z.object({
    interactiveId: z.string().min(1),
  }),
  body: z.object({
    answers: z.any(),
  }),
});

export const getInteractiveAttemptsSchema = z.object({
  params: z.object({
    interactiveId: z.string().min(1),
  }),
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    sortBy: z.enum(["startedAt", "submittedAt", "attemptNumber"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    isPassed: z.coerce.boolean().optional(),
    userId: z.string().optional(),
  }),
});

export const getInteractiveAttemptDetailSchema = z.object({
  params: z.object({
    attemptId: z.string().min(1),
  }),
});

export const getLatestInteractiveAttemptSchema = z.object({
  params: z.object({
    interactiveId: z.string().min(1),
  }),
});

export const saveInteractiveAnswersSchema = z.object({
  params: z.object({
    attemptId: z.string().min(1),
  }),
  body: z.object({
    answers: z.any(), // validasi detail di service
  }),
});

export const submitAttemptSchema = z.object({
  params: z.object({
    attemptId: z.string().min(1),
  }),
  body: z.object({
    answers: z.any(), // validasi detail di service
  }),
});

export const getInteractiveAttemptAnswersSchema = z.object({
  params: z.object({
    attemptId: z.string().min(1),
  }),
});

export const canAttemptInteractiveSchema = z.object({
  params: z.object({
    interactiveId: z.string().min(1),
  }),
});

export const exportInteractiveAttemptQuerySchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel"]).optional().default("csv"),
  }),
});
