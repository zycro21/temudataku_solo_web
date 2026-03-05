import { z } from "zod";

export const createMultipleChoiceQuestionSchema = z.object({
  params: z.object({
    interactiveId: z.string().min(1),
  }),
  body: z.object({
    question: z.string().min(1),
    allowMultiple: z.boolean().optional(),
    maxScore: z.number().positive().max(1000).optional(),
    options: z
      .array(
        z.object({
          content: z.string().min(1),
          isCorrect: z.boolean(),
          orderNumber: z.number().int().optional(),
        })
      )
      .optional(),
  }),
});

export const getMultipleChoiceQuestionSchema = z.object({
  params: z.object({
    interactiveId: z.string().min(1),
  }),
});

export const updateMultipleChoiceQuestionSchema = z.object({
  params: z.object({
    interactiveId: z.string().min(1),
  }),
  body: z
    .object({
      question: z.string().min(1).optional(),
      allowMultiple: z.boolean().optional(),
      maxScore: z.number().positive().max(1000).optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      "Minimal satu field harus diupdate"
    ),
});

export const deleteMultipleChoiceQuestionSchema = z.object({
  params: z.object({
    interactiveId: z.string().min(1),
  }),
});

export const headMultipleChoiceQuestionSchema = z.object({
  params: z.object({
    interactiveId: z.string().min(1),
  }),
});

export const createMultipleChoiceOptionSchema = z.object({
  params: z.object({
    questionId: z.string().min(1),
  }),
  body: z.object({
    content: z.string().min(1),
    isCorrect: z.boolean(),
    orderNumber: z.number().int().positive().optional(),
  }),
});

export const updateMultipleChoiceOptionSchema = z.object({
  params: z.object({
    optionId: z.string().min(1),
  }),
  body: z.object({
    content: z.string().min(1).optional(),
    isCorrect: z.boolean().optional(),
    orderNumber: z.number().int().positive().optional(),
  }),
});

export const deleteMultipleChoiceOptionSchema = z.object({
  params: z.object({
    optionId: z.string().min(1, "Option ID wajib diisi"),
  }),
});

export const reorderMultipleChoiceOptionsSchema = z.object({
  params: z.object({
    questionId: z.string().min(1),
  }),
  body: z.object({
    orders: z
      .array(
        z.object({
          optionId: z.string().min(1),
          orderNumber: z.number().int().positive(),
        })
      )
      .min(1),
  }),
});

export const updateMultipleChoiceAnswerKeySchema = z.object({
  params: z.object({
    questionId: z.string().min(1),
  }),
  body: z.object({
    correctOptionIds: z.array(z.string().min(1)).min(1),
  }),
});

export const getMultipleChoiceOptionsSchema = z.object({
  params: z.object({
    questionId: z.string().min(1),
  }),
});

export const getMultipleChoiceOptionDetailSchema = z.object({
  params: z.object({
    optionId: z.string().min(1),
  }),
});
