import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
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
    isVerified: boolean;
    serviceName: string;
    description?: string;
    price: number;
    serviceType:
      | "one-on-one"
      | "group"
      | "bootcamp"
      | "shortclass"
      | "live class";
    maxParticipants?: number;
    durationDays: number;
    mentorProfileIds: string[];
    isActive: boolean;
  };
}

export interface AuthenticatedRequestForMentoringSession extends Request {
  user?: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
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
    // Ubah user jadi opsional agar sesuai dengan AuthenticatedRequest
    userId: string;
    roles: string[];
    mentorProfileId?: string; // Tambahkan mentorProfileId
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
  };
  validatedBody?: {
    mentoringServiceId: string;
    participantIds?: string[];
    referralUsageId?: string;
    specialRequests?: string;
  };
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
    };

    req.user = {
      userId: decoded.userId,
      roles: decoded.roles,
      mentorProfileId: decoded.mentorProfileId,
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};
