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
