import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedQuery?: {
    page: string;
    limit: string;
    search?: string;
    email?: string;
    fullName?: string;
    city?: string;
    province?: string;
    isActive?: string;
    expertise?: string;
    availabilityDay?: string;
    sort_by?: string;
    order?: string;
    format?: "csv" | "excel";
  };
  validatedParams?: {
    id: string;
    userId: string;
  };
  validatedBody?: {
    serviceName?: string;
    description?: string | null;
    price?: number;
    serviceType?:
      | "one-on-one"
      | "group"
      | "bootcamp"
      | "shortclass"
      | "live class";
    maxParticipants?: number;
    durationDays?: number;
    mentorProfileIds?: string[];
    isActive?: boolean;
    benefits?: string | null;
    mechanism?: string | null;
    syllabusPath?: string | null;
    toolsUsed?: string | null;
    targetAudience?: string | null;
    schedule?: string | null;
    alumniPortfolio?: string | null;

    isVerified?: boolean;
  };
}

export interface AuthenticatedRequestForMentoringSession extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedQuery?: {
    serviceId?: string;
    mentorProfileId?: string;
    status?: "scheduled" | "ongoing" | "completed" | "cancelled";
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    sortBy?: "date" | "startTime" | "endTime" | "durationMinutes" | "createdAt";
    sortOrder?: "asc" | "desc";
    page: number;
    limit: number;
  };
  validatedParams?: {
    id: string;
    serviceId?: string;
  };
  validatedBody?: {
    serviceId: string;
    date: string;
    startTime: { hour: number; minute: number };
    endTime: { hour: number; minute: number };
    durationMinutes: number;
    meetingLink: string;
    meetingId: string;
    passcode: string;
    pptLink: string;
    recordingLink: string;
    status: string;
    notes?: string;
    mentorProfileIds: string[];
  };
}

export interface AuthenticatedRequestFeedback extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedBody?: any;
  validatedParams?: any;
  validatedQuery?: any;
}

export interface AuthenticatedRequestNotification extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedBody?: any;
  validatedParams?: any;
  validatedQuery?: any;
}

export interface AuthenticatedRequestBooking extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedBody?: {
    mentoringServiceId: string;
    participantIds?: string[];
    referralUsageId?: string;
    specialRequests?: string;
    bookingDate?: string;
    material?: string; // <-- tambahkan
    expectedOutput?: string; // <-- tambahkan
  };
  validatedParams?: { id: string };
  validatedQuery?: {
    page: number;
    limit: number;
    status?: "pending" | "confirmed" | "completed" | "cancelled";
    sortBy?: "createdAt" | "bookingDate";
    sortOrder?: "asc" | "desc";
    menteeName?: string;
    serviceName?: string;
    usedReferral?: boolean;
    startDate?: string;
    endDate?: string;
    format?: "csv" | "excel";
    mentorId?: string;
  };
}

export interface PatchBookingStatusBody {
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

export interface AuthenticatedRequestProject extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedBody?: any;
  validatedParams?: any;
  validatedQuery?: any;
}

export interface AuthenticatedRequestCertificate extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedBody?: any;
  validatedParams?: any;
  validatedQuery?: any;
}

export interface AuthenticatedRequestPractice extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedBody?: {
    // Field untuk Create Practice
    mentorId?: string;
    title?: string;
    description?: string;
    thumbnailImages?: string[];
    price?: number;
    practiceType?: string;
    category?: string;
    tags?: string[];
    isActive?: boolean;

    // Kolom tambahan baru
    benefits?: string;
    toolsUsed?: string;
    challenges?: string;
    expectedOutcomes?: string;
    estimatedDuration?: string;
    targetAudience?: string;

    // Field untuk Create Material
    status?: string;
    startDate?: string;
    endDate?: string;

    // Field untuk Upload Practice File
    materialId?: string;
    fileName?: string;

    // Field untuk Create Practice Purchase
    practiceId?: string;
    referralUsageId?: string;

    // Field untuk Create/Update Practice Progress
    userId?: string; // optional, bisa kosong
    isCompleted?: boolean;
    timeSpentSeconds?: number;
    lastAccessed?: Date; // Mendukung input yyyy-mm-dd

    // Practice Submission
    notes?: string;
    files?: string[];
    statusSubmission?: string;

    // Optional penilaian/feedback (diisi nanti oleh mentor)
    kesesuaian?: string;
    kualitas?: string;
    kreativitas?: string;
    kelengkapan?: string;
    komentar?: string;
    saran?: string;
    perluRevisi?: boolean;
  };
  validatedParams?: any;
  validatedQuery?: any;
  file?: Express.Multer.File;
}

export interface AuthenticatedRequestBehavior extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedBody?: any;
  validatedParams?: any;
  validatedQuery?: any;
}

export interface AuthenticatedRequestReferralCode extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedBody?:
    | {
        ownerId: string;
        code: string;
        discountPercentage: number;
        commissionPercentage: number;
        expiryDate?: Date;
        isActive?: boolean;
      }
    | {
        expiryDate?: Date;
        isActive?: boolean;
        discountPercentage?: number;
        commissionPercentage?: number;
      }
    | {
        code: string;
        context: "booking" | "practice_purchase";
      }
    | {
        referralCodeId: string;
        amount: number;
      };
  validatedParams?: {
    id?: string;
  };
  validatedQuery?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    ownerId?: string;
    referralCodeId?: string;
    startDate?: string;
    endDate?: string;
    context?: "booking" | "practice_purchase";
  };
}

export interface AuthenticatedRequestPayment extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedBody?: any;
  validatedParams?: any;
  validatedQuery?: any;
}

export interface AuthenticatedRequestWithdrawal extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedBody?: {
    userId?: string; // hanya boleh dipakai admin
    type: string; // "bank" | "eWallet"
    providerName: string; // "BCA" | "Dana" | "OVO" dll
    accountNumber: string; // nomor rekening / HP
    accountName?: string; // opsional
  };
  validatedParams?: {
    id?: string;
  };
}

export interface AuthenticatedRequestMentorReport extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedQuery?: {
    page?: string;
    limit?: string;
    sessionId?: string;
    search?: string;
    sortField?: string;
    sortOrder?: "asc" | "desc";
    format?: "csv" | "excel";
  };
  validatedParams?: {
    id?: string; // mentorReport id
    sessionId?: string;
    mentorProfileId?: string;
  };
  validatedBody?: {
    sessionId?: string;
    understanding?: string;
    participation?: string;
    challenges?: string;
    commonQuestions?: string;
    nextFocus?: string;
    additionalNotes?: string;
  };
}

export interface AuthenticatedRequestLog extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedBody?: any;
  validatedParams?: any;
  validatedQuery?: any;
}

export interface AuthenticatedRequestShortLink extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedBody?: {
    // POST /api/shortlinks
    shortCode?: string; // custom short code opsional
    originalUrl?: string;
    expiresAt?: string; // opsional, format: yyyy-mm-dd
    isActive?: boolean;

    // PUT /api/shortlinks/:id
    updatedOriginalUrl?: string;
    updatedExpiresAt?: string;
    updatedIsActive?: boolean;
  };

  validatedParams?: {
    id?: string; // untuk /api/shortlinks/:id
    shortCode?: string; // untuk /s/:shortCode
  };

  validatedQuery?: {
    page?: string;
    limit?: string;
    search?: string;
    sort_by?: "createdAt" | "clickCount" | "expiresAt";
    order?: "asc" | "desc";
  };
}

export interface AuthenticatedRequestElearning extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedBody?: {
    mentorId?: string;
    title?: string;
    description?: string;
    thumbnailImages?: string[];
    price?: number;
    category?: string;
    tags?: string[];
    targetAudience?: string;
    level?: string;
    estimatedDuration?: string;
    benefits?: string;
    toolsUsed?: string;
    isActive?: boolean;
  };
  validatedParams?: any;
  validatedQuery?: any;
  file?: Express.Multer.File;
}

export interface AuthenticatedRequestSubChapter extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedBody?: {
    title: string;
    description?: string;
    orderNumber: number;
    estimatedTime?: string;
  };
  validatedParams?: {
    id?: string;
    courseId?: string;
  };
  validatedQuery?: any;
}

interface ReorderBody {
  newOrder: string[];
}

export interface AuthenticatedRequestReorderSubChapter extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedBody?: ReorderBody;
  validatedParams?: { courseId?: string };
}

export interface AuthenticatedRequestDuplicateSubChapter extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedBody?: {
    targetCourseId: string;
  };
  validatedParams?: {
    id?: string;
  };
}

export interface AuthenticatedRequestSubBab extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
    email?: string;
    phoneNumber?: string;
  };
  validatedBody?: {
    title?: string;
    estimatedTime?: string;
    orderNumber?: number;
    // Untuk duplikasi
    targetSubChapterId?: string;
    newTitle?: string;
    // Tambahan untuk reorder
    updates?: {
      subBabId: string;
      newOrderNumber: number;
    }[];
  };
  validatedParams?: {
    id?: string;
    subChapterId?: string;
  };
  validatedQuery?: any;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
      email?: string;
      phoneNumber?: string;
    };

    req.user = {
      userId: decoded.userId,
      roles: decoded.roles,
      mentorProfileId: decoded.mentorProfileId,
      email: decoded.email,
      phoneNumber: decoded.phoneNumber,
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};
