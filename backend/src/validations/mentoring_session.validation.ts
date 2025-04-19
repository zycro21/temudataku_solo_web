import { z } from "zod";

export const createMentoringSessionSchema = z
  .object({
    serviceId: z.string().min(1, "serviceId wajib diisi"),
    date: z
      .string()
      .min(1, "Tanggal wajib diisi")
      .refine(
        (val) => {
          const [day, month, year] = val.split("-");
          return (
            day.length === 2 &&
            month.length === 2 &&
            year.length === 4 &&
            !isNaN(new Date(`${year}-${month}-${day}`).getTime())
          );
        },
        {
          message:
            "Format tanggal tidak valid, harap gunakan format dd-mm-yyyy",
        }
      ),
    startTime: z
      .string()
      .min(1, "Waktu mulai wajib diisi")
      .regex(
        /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/,
        "Format waktu mulai tidak valid, harap gunakan format HH:mm"
      )
      .transform((val) => {
        const [hour, minute] = val.split(":");
        return { hour: parseInt(hour), minute: parseInt(minute) };
      }),
    endTime: z
      .string()
      .min(1, "Waktu selesai wajib diisi")
      .regex(
        /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/,
        "Format waktu selesai tidak valid, harap gunakan format HH:mm"
      )
      .transform((val) => {
        const [hour, minute] = val.split(":");
        return { hour: parseInt(hour), minute: parseInt(minute) };
      }),
    meetingLink: z.string().url().optional(),
    status: z
      .enum(["scheduled", "ongoing", "completed", "cancelled"])
      .optional(),
    notes: z.string().optional(),
    mentorProfileIds: z
      .array(z.string().min(1))
      .nonempty("Minimal 1 mentor harus ditugaskan"),
  })
  .superRefine((data, ctx) => {
    const { date, startTime, endTime } = data;

    // Parsing tanggal
    const [day, month, year] = date.split("-");
    // Pastikan hour dan minute memiliki dua digit
    const startHour = startTime.hour.toString().padStart(2, "0");
    const startMinute = startTime.minute.toString().padStart(2, "0");
    const endHour = endTime.hour.toString().padStart(2, "0");
    const endMinute = endTime.minute.toString().padStart(2, "0");

    const startDateTime = new Date(
      `${year}-${month}-${day}T${startHour}:${startMinute}:00+07:00`
    );
    const endDateTime = new Date(
      `${year}-${month}-${day}T${endHour}:${endMinute}:00+07:00`
    );

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Format waktu tidak valid",
        path: ["startTime"],
      });
      return;
    }

    if (startDateTime >= endDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startTime harus lebih kecil dari endTime",
        path: ["startTime"],
      });
    }
  });

export const getMentoringSessionsSchema = z
  .object({
    query: z
      .object({
        // Filter
        serviceId: z.string().min(1, "serviceId harus diisi").optional(),
        mentorProfileId: z
          .string()
          .min(1, "mentorProfileId harus diisi")
          .optional(),
        status: z
          .enum(["scheduled", "ongoing", "completed", "cancelled"])
          .optional(),
        dateFrom: z
          .string()
          .regex(/^\d{2}-\d{2}-\d{4}$/, "Format dateFrom harus dd-mm-yyyy")
          .refine(
            (val) => {
              const [day, month, year] = val.split("-");
              return !isNaN(new Date(`${year}-${month}-${day}`).getTime());
            },
            { message: "dateFrom harus tanggal valid" }
          )
          .optional(),
        dateTo: z
          .string()
          .regex(/^\d{2}-\d{2}-\d{4}$/, "Format dateTo harus dd-mm-yyyy")
          .refine(
            (val) => {
              const [day, month, year] = val.split("-");
              return !isNaN(new Date(`${year}-${month}-${day}`).getTime());
            },
            { message: "dateTo harus tanggal valid" }
          )
          .optional(),
        // Search
        search: z.string().min(1, "Search term harus diisi").optional(),
        // Sort
        sortBy: z
          .enum([
            "date",
            "startTime",
            "endTime",
            "durationMinutes",
            "createdAt",
          ])
          .optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        // Pagination
        page: z
          .string()
          .transform(Number)
          .refine((val) => val > 0, "Page harus lebih besar dari 0")
          .optional()
          .default("1"),
        limit: z
          .string()
          .transform(Number)
          .refine(
            (val) => val > 0 && val <= 100,
            "Limit harus antara 1 dan 100"
          )
          .optional()
          .default("10"),
      })
      .optional(), // Tambahkan .optional() di sini
  })
  .superRefine((data, ctx) => {
    const { dateFrom, dateTo } = data.query || {}; // Tambahkan fallback untuk query kosong
    if (dateFrom && dateTo) {
      const [dayFrom, monthFrom, yearFrom] = dateFrom.split("-");
      const [dayTo, monthTo, yearTo] = dateTo.split("-");
      const fromDate = new Date(`${yearFrom}-${monthFrom}-${dayFrom}`);
      const toDate = new Date(`${yearTo}-${monthTo}-${dayTo}`);
      if (fromDate > toDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "dateFrom harus lebih kecil atau sama dengan dateTo",
          path: ["query.dateFrom"],
        });
      }
    }
  });

export const getMentoringSessionByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID sesi harus diisi").startsWith("Session-", {
      message: "ID sesi harus diawali dengan 'Session-'",
    }),
  }),
});

export const updateMentoringSessionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID sesi wajib diisi"),
  }),
  body: z
    .object({
      date: z
        .string()
        .refine(
          (val) => {
            const [day, month, year] = val.split("-");
            return (
              day?.length === 2 &&
              month?.length === 2 &&
              year?.length === 4 &&
              !isNaN(new Date(`${year}-${month}-${day}`).getTime())
            );
          },
          {
            message:
              "Format tanggal tidak valid, harap gunakan format dd-mm-yyyy",
          }
        )
        .optional(),

      startTime: z
        .string()
        .regex(
          /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/,
          "Format waktu mulai tidak valid, gunakan format HH:mm"
        )
        .transform((val) => {
          const [hour, minute] = val.split(":");
          return { hour: parseInt(hour), minute: parseInt(minute) };
        })
        .optional(),

      endTime: z
        .string()
        .regex(
          /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/,
          "Format waktu selesai tidak valid, gunakan format HH:mm"
        )
        .transform((val) => {
          const [hour, minute] = val.split(":");
          return { hour: parseInt(hour), minute: parseInt(minute) };
        })
        .optional(),
      meetingLink: z.string().url().optional(),
      notes: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const { date, startTime, endTime } = data;

      if (date && startTime && endTime) {
        const [day, month, year] = date.split("-");
        const startHour = String(startTime.hour).padStart(2, "0");
        const startMinute = String(startTime.minute).padStart(2, "0");
        const endHour = String(endTime.hour).padStart(2, "0");
        const endMinute = String(endTime.minute).padStart(2, "0");

        const startDateTime = new Date(
          `${year}-${month}-${day}T${startHour}:${startMinute}:00+07:00`
        );
        const endDateTime = new Date(
          `${year}-${month}-${day}T${endHour}:${endMinute}:00+07:00`
        );

        if (startDateTime >= endDateTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "startTime harus lebih kecil dari endTime",
            path: ["startTime"],
          });
        }
      }
    }),
});

export const updateMentoringSessionStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID sesi harus diisi").startsWith("Session-", {
      message: "ID sesi harus diawali dengan 'Session-'",
    }),
  }),
  body: z.object({
    status: z.enum(["scheduled", "ongoing", "completed", "cancelled"], {
      required_error: "Status harus diisi",
      invalid_type_error: "Status tidak valid",
    }),
  }),
});

export const updateSessionMentorsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID sesi harus diisi").startsWith("Session-", {
      message: "ID sesi harus diawali dengan 'Session-'",
    }),
  }),
  body: z.object({
    mentorProfileIds: z
      .array(z.string().regex(/^Mentor-\d{6}$/, "Invalid mentor profile ID"))
      .nonempty("Daftar mentor tidak boleh kosong"),
  }),
});

export const deleteMentoringSessionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID sesi harus diisi").startsWith("Session-", {
      message: "ID sesi harus diawali dengan 'Session-'",
    }),
  }),
});

export const paramsIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID sesi harus diisi").startsWith("Session-", {
      message: "ID sesi harus diawali dengan 'Session-'",
    }),
  }),
});

export const updateMentorSessionBodySchema = z.object({
  body: z
    .object({
      status: z
        .enum(["scheduled", "ongoing", "completed", "cancelled"])
        .optional(),
      meetingLink: z.string().url("Meeting link tidak valid").optional(),
    })
    .refine((data) => data.status || data.meetingLink, {
      message: "Minimal harus ada satu field yang diupdate",
    }),
});

export const publicGetSessionsSchema = z.object({
  params: z.object({
    serviceId: z.string().regex(/^[a-z_-]+-\d+$/, {
      message: "Invalid mentoring service ID format",
    }),
  }),
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    sortBy: z.enum(["date", "rating"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    search: z.string().optional(),
  }),
});

export const publicGetSessionByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .min(1, "ID sesi harus diisi")
      .regex(
        /^Session-[A-Za-z0-9]{10}-[a-z_]+-\d{6}$/,
        "ID sesi tidak valid. Format harus: Session-<10_karakter>-<kategori>-<6_digit>"
      ),
  }),
});
