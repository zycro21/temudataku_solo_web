import { PrismaClient, Prisma } from "@prisma/client";
import { buildDateRange, toWibIso } from "../utils/dateRange.js";

const prisma = new PrismaClient();

const DAY_MS = 24 * 60 * 60 * 1000;
const TZ = "Asia/Jakarta"; // pengelompokan per hari memakai hari WIB

/**
 * Riwayat login semua user (admin). Satu baris = satu kali login berhasil.
 */
export const getLoginHistory = async (query: {
  page: number;
  limit: number;
  userId?: string;
  search?: string;
  role?: string;
  method?: "PASSWORD" | "GOOGLE";
  portal?: "WEB" | "AFFILIATOR";
  from?: string;
  to?: string;
  order: "asc" | "desc";
}) => {
  const { page, limit, userId, search, role, method, portal, from, to, order } =
    query;

  const range = buildDateRange(from, to);

  const where: Prisma.LoginHistoryWhereInput = {
    ...(range ? { loggedInAt: range } : {}),
    ...(userId ? { userId } : {}),
    ...(method ? { method } : {}),
    ...(portal ? { portal } : {}),
    ...(role ? { roles: { has: role } } : {}),
    ...(search
      ? {
          user: {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phoneNumber: { contains: search } },
            ],
          },
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.loginHistory.count({ where }),
    prisma.loginHistory.findMany({
      where,
      select: {
        id: true,
        method: true,
        portal: true,
        roles: true,
        ipAddress: true,
        userAgent: true,
        loggedInAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            profilePicture: true,
            city: true,
            province: true,
            isActive: true,
            isEmailVerified: true,
            registrationDate: true,
            lastLogin: true,
            googleId: true, // hanya untuk hasGoogleAccount, tidak dikirim
            userRoles: { select: { role: { select: { roleName: true } } } },
            _count: { select: { loginHistories: true } },
          },
        },
      },
      orderBy: [{ loggedInAt: order }, { id: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  // Waktu ditampilkan dalam WIB (+07:00)
  const data = rows.map(({ user, loggedInAt, ...r }) => {
    const { googleId, userRoles, _count, registrationDate, lastLogin, ...u } =
      user;

    return {
      ...r, // id, method, portal, roles (snapshot saat login), ipAddress, userAgent
      loggedInAt: toWibIso(loggedInAt),
      user: {
        ...u,
        registrationDate: registrationDate ? toWibIso(registrationDate) : null,
        lastLogin: lastLogin ? toWibIso(lastLogin) : null,
        currentRoles: userRoles.map((ur) => ur.role.roleName), // role sekarang
        hasGoogleAccount: !!googleId,
        totalLogins: _count.loginHistories,
      },
    };
  });

  return { total, page, totalPages: Math.ceil(total / limit), data };
};

/**
 * Ringkasan login dalam rentang waktu (default 30 hari terakhir).
 */
export const getLoginHistorySummary = async (query: {
  from?: string;
  to?: string;
}) => {
  const range = buildDateRange(query.from, query.to) ?? {};
  const now = new Date();
  const lte = range.lte ?? now;
  const gte = range.gte ?? new Date(lte.getTime() - 30 * DAY_MS);

  const where: Prisma.LoginHistoryWhereInput = {
    loggedInAt: { gte, lte },
  };

  const [totalLogins, uniqueRows, byMethod, byPortal, byRole, byDay] =
    await Promise.all([
      prisma.loginHistory.count({ where }),
      prisma.$queryRaw<{ count: number }[]>(Prisma.sql`
        SELECT COUNT(DISTINCT "user_id")::int AS count
        FROM "login_history"
        WHERE "logged_in_at" >= ${gte} AND "logged_in_at" <= ${lte}
      `),
      prisma.loginHistory.groupBy({
        by: ["method"],
        where,
        _count: { _all: true },
      }),
      prisma.loginHistory.groupBy({
        by: ["portal"],
        where,
        _count: { _all: true },
      }),
      prisma.$queryRaw<{ role: string; logins: number; uniqueUsers: number }[]>(
        Prisma.sql`
          SELECT r AS role,
                 COUNT(*)::int AS logins,
                 COUNT(DISTINCT lh."user_id")::int AS "uniqueUsers"
          FROM "login_history" lh, unnest(lh."roles") AS r
          WHERE lh."logged_in_at" >= ${gte} AND lh."logged_in_at" <= ${lte}
          GROUP BY r
          ORDER BY logins DESC
        `,
      ),
      prisma.$queryRaw<{ date: string; logins: number; uniqueUsers: number }[]>(
        Prisma.sql`
          SELECT to_char("logged_in_at" AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS date,
                 COUNT(*)::int AS logins,
                 COUNT(DISTINCT "user_id")::int AS "uniqueUsers"
          FROM "login_history"
          WHERE "logged_in_at" >= ${gte} AND "logged_in_at" <= ${lte}
          GROUP BY 1
          ORDER BY 1 ASC
        `,
      ),
    ]);

  return {
    range: { from: toWibIso(gte), to: toWibIso(lte), timezone: TZ },
    totalLogins,
    uniqueUsers: uniqueRows[0]?.count ?? 0,
    byMethod: Object.fromEntries(
      byMethod.map((r) => [r.method, r._count._all]),
    ),
    byPortal: Object.fromEntries(
      byPortal.map((r) => [r.portal, r._count._all]),
    ),
    byRole,
    byDay, // hari tanpa login tidak muncul
  };
};

/**
 * Riwayat login milik user sendiri (untuk fitur "aktivitas login saya").
 */
export const getMyLoginHistory = async (params: {
  userId: string;
  page: number;
  limit: number;
}) => {
  const { userId, page, limit } = params;

  const [total, rows] = await Promise.all([
    prisma.loginHistory.count({ where: { userId } }),
    prisma.loginHistory.findMany({
      where: { userId },
      select: {
        id: true,
        method: true,
        portal: true,
        ipAddress: true,
        userAgent: true,
        loggedInAt: true,
      },
      orderBy: [{ loggedInAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  // Waktu ditampilkan dalam WIB (+07:00)
  const data = rows.map((r) => ({ ...r, loggedInAt: toWibIso(r.loggedInAt) }));

  return { total, page, totalPages: Math.ceil(total / limit), data };
};

// ===========================================================================
// PEMBELIAN PRODUK (mentoring, e-learning, AYCL)
// ===========================================================================

const userSelect = {
  id: true,
  fullName: true,
  email: true,
  phoneNumber: true,
  profilePicture: true,
  city: true,
  province: true,
  isActive: true,
} satisfies Prisma.UserSelect;

const bookingSelect = {
  id: true,
  status: true,
  bookingDate: true,
  mentee: { select: userSelect }, // pemesan/pembeli
  mentoringService: {
    select: {
      id: true,
      serviceName: true,
      serviceType: true,
      category: true,
      level: true,
      price: true,
    },
  },
} satisfies Prisma.BookingSelect;

const purchasePaymentSelect = {
  id: true,
  amount: true,
  status: true,
  paymentDate: true,
  paymentMethod: true,
  transactionId: true,
  merchantOrderId: true,
  installmentNumber: true,
  // Mentoring (jalur invoice / cicilan)
  bookingInvoice: {
    select: {
      id: true,
      paymentType: true,
      installmentCount: true,
      status: true,
      totalAmount: true,
      paidAmount: true,
      remainingAmount: true,
      booking: { select: bookingSelect },
    },
  },
  // Mentoring (jalur lama: payment ditautkan lewat peserta)
  bookingParticipants: {
    select: { booking: { select: bookingSelect } },
    take: 1, // cukup satu untuk mengetahui booking & produknya
  },
  // E-Learning
  eLearningSubscription: {
    select: {
      id: true,
      status: true,
      startAt: true,
      endAt: true,
      user: { select: userSelect },
      plan: {
        select: { id: true, name: true, durationDay: true, price: true },
      },
    },
  },
  // AYCL
  ayclBooking: {
    select: {
      id: true,
      status: true,
      user: { select: userSelect },
      batch: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  },
} satisfies Prisma.PaymentSelect;

type PurchasePayment = Prisma.PaymentGetPayload<{
  select: typeof purchasePaymentSelect;
}>;

// Nilai mentoring_services.service_type yang dianggap Bootcamp (tanpa peduli huruf besar/kecil)
const BOOTCAMP_SERVICE_TYPE = "bootcamp";

const wib = (d?: Date | null) => (d ? toWibIso(d) : null);
const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));

const toPurchaseRow = (p: PurchasePayment) => {
  const payment = {
    status: p.status,
    amount: Number(p.amount),
    method: p.paymentMethod,
    transactionId: p.transactionId,
    merchantOrderId: p.merchantOrderId,
    installmentNumber: p.installmentNumber,
    paymentDate: wib(p.paymentDate), // tanggal pembelian (WIB)
  };

  // ---- E-Learning ----
  if (p.eLearningSubscription) {
    const s = p.eLearningSubscription;
    return {
      paymentId: p.id,
      productType: "ELEARNING" as const,
      productName: `E-Learning ${s.plan.name}`,
      product: {
        id: s.plan.id,
        planName: s.plan.name,
        durationDay: s.plan.durationDay,
        price: num(s.plan.price),
      },
      user: s.user,
      payment,
      purchase: {
        subscriptionId: s.id,
        status: s.status,
        startAt: wib(s.startAt),
        endAt: wib(s.endAt),
      },
    };
  }

  // ---- AYCL ----
  if (p.ayclBooking) {
    const a = p.ayclBooking;
    return {
      paymentId: p.id,
      productType: "AYCL" as const,
      productName: a.batch.title,
      product: {
        id: a.batch.id,
        title: a.batch.title,
        slug: a.batch.slug,
        price: num(a.batch.price),
        startDate: wib(a.batch.startDate),
        endDate: wib(a.batch.endDate),
      },
      user: a.user,
      payment,
      purchase: { bookingId: a.id, status: a.status },
    };
  }

  // ---- Mentoring (one-on-one, group) dan Bootcamp ----
  const invoice = p.bookingInvoice;
  const booking = invoice?.booking ?? p.bookingParticipants[0]?.booking;
  if (!booking) return null;

  // serviceType "bootcamp" → BOOTCAMP; one-on-one, group, dll → MENTORING
  const isBootcamp =
    booking.mentoringService.serviceType?.trim().toLowerCase() ===
    BOOTCAMP_SERVICE_TYPE;

  return {
    paymentId: p.id,
    productType: isBootcamp ? ("BOOTCAMP" as const) : ("MENTORING" as const),
    productName: booking.mentoringService.serviceName,
    product: {
      id: booking.mentoringService.id,
      serviceName: booking.mentoringService.serviceName,
      serviceType: booking.mentoringService.serviceType,
      category: booking.mentoringService.category,
      level: booking.mentoringService.level,
      price: num(booking.mentoringService.price),
    },
    user: booking.mentee,
    payment,
    purchase: {
      bookingId: booking.id,
      bookingStatus: booking.status,
      bookingDate: wib(booking.bookingDate),
      invoice: invoice
        ? {
            id: invoice.id,
            paymentType: invoice.paymentType, // FULL / INSTALLMENT
            installmentCount: invoice.installmentCount,
            status: invoice.status, // PAID_DONE / PARTIALLY_PAID / HAVENT_PAID
            totalAmount: Number(invoice.totalAmount),
            paidAmount: Number(invoice.paidAmount),
            remainingAmount: Number(invoice.remainingAmount),
          }
        : null,
    },
  };
};

/**
 * Semua pembelian produk (mentoring, bootcamp, e-learning, AYCL) berdasarkan payment.
 * Satu baris = satu payment, jadi pembelian berulang dan tiap cicilan
 * muncul sebagai baris sendiri. Default: hanya payment "confirmed".
 */
export const getPurchases = async (query: {
  page: number;
  limit: number;
  userId?: string;
  search?: string;
  productType?: "MENTORING" | "BOOTCAMP" | "ELEARNING" | "AYCL";
  serviceType?: string;
  status: string;
  from?: string;
  to?: string;
  order: "asc" | "desc";
}) => {
  const {
    page,
    limit,
    userId,
    search,
    productType,
    serviceType,
    status,
    from,
    to,
    order,
  } = query;

  const range = buildDateRange(from, to);

  // Payment praktik (practicePurchase) sengaja tidak termasuk.
  // Semua payment yang berasal dari mentoring service (apa pun tipenya)
  const isAnyMentoringService: Prisma.PaymentWhereInput = {
    OR: [
      { bookingInvoiceId: { not: null } },
      { bookingParticipants: { some: {} } },
    ],
  };

  // Payment yang service-nya bertipe bootcamp
  const bootcampService: Prisma.MentoringServiceWhereInput = {
    serviceType: { equals: BOOTCAMP_SERVICE_TYPE, mode: "insensitive" },
  };
  const isBootcampPayment: Prisma.PaymentWhereInput = {
    OR: [
      { bookingInvoice: { booking: { mentoringService: bootcampService } } },
      {
        bookingParticipants: {
          some: { booking: { mentoringService: bootcampService } },
        },
      },
    ],
  };

  // MENTORING = mentoring service selain bootcamp (one-on-one, group)
  const isMentoring: Prisma.PaymentWhereInput = {
    AND: [isAnyMentoringService, { NOT: isBootcampPayment }],
  };
  const isBootcamp: Prisma.PaymentWhereInput = {
    AND: [isAnyMentoringService, isBootcampPayment],
  };
  const isElearning: Prisma.PaymentWhereInput = {
    eLearningSubscriptionId: { not: null },
  };
  const isAycl: Prisma.PaymentWhereInput = { ayclBookingId: { not: null } };

  const productFilter: Prisma.PaymentWhereInput =
    productType === "MENTORING"
      ? isMentoring
      : productType === "BOOTCAMP"
        ? isBootcamp
        : productType === "ELEARNING"
          ? isElearning
          : productType === "AYCL"
            ? isAycl
            : { OR: [isAnyMentoringService, isElearning, isAycl] };

  const AND: Prisma.PaymentWhereInput[] = [productFilter];

  if (status.toLowerCase() !== "all") {
    AND.push({ status: { equals: status, mode: "insensitive" } });
  }

  if (range) AND.push({ paymentDate: range });

  if (userId) {
    AND.push({
      OR: [
        { bookingInvoice: { booking: { menteeId: userId } } },
        { bookingParticipants: { some: { booking: { menteeId: userId } } } },
        { eLearningSubscription: { userId } },
        { ayclBooking: { userId } },
      ],
    });
  }

  if (serviceType) {
    const svc: Prisma.MentoringServiceWhereInput = {
      serviceType: { equals: serviceType, mode: "insensitive" },
    };
    AND.push({
      OR: [
        { bookingInvoice: { booking: { mentoringService: svc } } },
        {
          bookingParticipants: { some: { booking: { mentoringService: svc } } },
        },
      ],
    });
  }

  if (search) {
    const userSearch: Prisma.UserWhereInput = {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search } },
      ],
    };
    const serviceSearch: Prisma.MentoringServiceWhereInput = {
      serviceName: { contains: search, mode: "insensitive" },
    };
    AND.push({
      OR: [
        { bookingInvoice: { booking: { mentee: userSearch } } },
        { bookingParticipants: { some: { booking: { mentee: userSearch } } } },
        { eLearningSubscription: { user: userSearch } },
        { ayclBooking: { user: userSearch } },
        { bookingInvoice: { booking: { mentoringService: serviceSearch } } },
        {
          bookingParticipants: {
            some: { booking: { mentoringService: serviceSearch } },
          },
        },
        {
          eLearningSubscription: {
            plan: { name: { contains: search, mode: "insensitive" } },
          },
        },
        {
          ayclBooking: {
            batch: { title: { contains: search, mode: "insensitive" } },
          },
        },
      ],
    });
  }

  const where: Prisma.PaymentWhereInput = { AND };

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      select: purchasePaymentSelect,
      orderBy: [
        { paymentDate: { sort: order, nulls: "last" } },
        { createdAt: order },
        { id: "asc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const data = payments
    .map(toPurchaseRow)
    .filter((r): r is NonNullable<typeof r> => r !== null);

  return { total, page, totalPages: Math.ceil(total / limit), data };
};

// ===========================================================================
// PENGISIAN FORM (event & non-event)
// ===========================================================================

const formResponseSelect = {
  id: true,
  status: true,
  respondentEmail: true,
  submittedAt: true,
  user: { select: userSelect }, // null kalau responder anonim
  form: {
    select: {
      id: true,
      title: true,
      slug: true,
      type: true, // EVENT / NON_EVENT
      status: true,
      category: { select: { id: true, name: true } },
      // info event (terisi untuk form bertipe EVENT)
      eventId: true,
      eventNameSnapshot: true,
      eventTitle: true,
      eventStartAt: true,
      eventEndAt: true,
      eventMode: true,
      eventLocation: true,
      eventOrganizer: true,
      eventCategoryLabel: true,
    },
  },
  answers: {
    select: {
      id: true,
      itemId: true,
      itemTypeSnapshot: true,
      itemTitleSnapshot: true,
      valueText: true,
      valueNumber: true,
      valueDate: true,
      selections: {
        select: { optionLabelSnapshot: true, rowLabelSnapshot: true },
      },
      // storagePath sengaja tidak diambil (file hanya boleh lewat endpoint ber-permission)
      files: {
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          sizeBytes: true,
        },
      },
    },
    orderBy: [
      { item: { section: { orderNumber: "asc" } } },
      { item: { orderNumber: "asc" } },
    ],
  },
} satisfies Prisma.FormResponseSelect;

type FormResponseRow = Prisma.FormResponseGetPayload<{
  select: typeof formResponseSelect;
}>;
type FormAnswerRow = FormResponseRow["answers"][number];

const dateOnly = (d?: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

// Ubah jawaban ke bentuk yang gampang dibaca sesuai tipe pertanyaan
const toAnswerValue = (a: FormAnswerRow) => {
  switch (a.itemTypeSnapshot) {
    case "MULTIPLE_CHOICE":
    case "DROPDOWN":
      return a.selections[0]?.optionLabelSnapshot ?? null;
    case "CHECKBOXES":
      return a.selections.map((s) => s.optionLabelSnapshot);
    case "MULTIPLE_CHOICE_GRID":
    case "CHECKBOX_GRID":
      return a.selections.map((s) => ({
        row: s.rowLabelSnapshot,
        column: s.optionLabelSnapshot,
      }));
    case "FILE_UPLOAD":
      return a.files.map((f) => ({
        id: f.id,
        name: f.originalName,
        mimeType: f.mimeType,
        sizeBytes: f.sizeBytes,
      }));
    case "LINEAR_SCALE":
    case "RATING":
      return a.valueNumber;
    case "DATE":
      return dateOnly(a.valueDate);
    default: // SHORT_ANSWER, PARAGRAPH, TIME_DURATION
      return a.valueText;
  }
};

const toFormResponseRow = (r: FormResponseRow) => {
  const f = r.form;

  return {
    responseId: r.id,
    type: f.type, // EVENT / NON_EVENT
    // email yang diisi di form; kalau kosong pakai email akun
    email: r.respondentEmail ?? r.user?.email ?? null,
    submittedAt: wib(r.submittedAt),
    status: r.status,
    user: r.user, // null kalau responder anonim
    form: {
      id: f.id,
      title: f.title,
      slug: f.slug,
      type: f.type,
      status: f.status,
      category: f.category,
      event:
        f.type === "EVENT"
          ? {
              eventId: f.eventId,
              name: f.eventTitle ?? f.eventNameSnapshot,
              startAt: wib(f.eventStartAt),
              endAt: wib(f.eventEndAt),
              mode: f.eventMode,
              location: f.eventLocation,
              organizer: f.eventOrganizer,
              categoryLabel: f.eventCategoryLabel,
            }
          : null,
    },
    answers: r.answers.map((a) => ({
      itemId: a.itemId,
      question: a.itemTitleSnapshot,
      type: a.itemTypeSnapshot,
      value: toAnswerValue(a),
    })),
  };
};

/**
 * Semua pengisian form (event & non-event) beserta jawabannya.
 * Satu baris = satu response. Default hanya yang SUBMITTED.
 */
export const getFormResponses = async (query: {
  page: number;
  limit: number;
  type?: "EVENT" | "NON_EVENT";
  formId?: string;
  userId?: string;
  email?: string;
  search?: string;
  status: "SUBMITTED" | "DRAFT" | "ALL";
  from?: string;
  to?: string;
  order: "asc" | "desc";
}) => {
  const {
    page,
    limit,
    type,
    formId,
    userId,
    email,
    search,
    status,
    from,
    to,
    order,
  } = query;

  const range = buildDateRange(from, to);

  const AND: Prisma.FormResponseWhereInput[] = [];

  if (status !== "ALL") AND.push({ status });
  if (type) AND.push({ form: { type } });
  if (formId) AND.push({ formId });
  if (userId) AND.push({ userId });
  if (range) AND.push({ submittedAt: range });

  if (email) {
    AND.push({
      OR: [
        { respondentEmail: { contains: email, mode: "insensitive" } },
        { user: { email: { contains: email, mode: "insensitive" } } },
      ],
    });
  }

  if (search) {
    AND.push({
      OR: [
        { respondentEmail: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { fullName: { contains: search, mode: "insensitive" } } },
        { user: { phoneNumber: { contains: search } } },
        { form: { title: { contains: search, mode: "insensitive" } } },
      ],
    });
  }

  const where: Prisma.FormResponseWhereInput = { AND };

  const [total, rows] = await Promise.all([
    prisma.formResponse.count({ where }),
    prisma.formResponse.findMany({
      where,
      select: formResponseSelect,
      orderBy: [
        { submittedAt: { sort: order, nulls: "last" } },
        { createdAt: order },
        { id: "asc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: rows.map(toFormResponseRow),
  };
};
