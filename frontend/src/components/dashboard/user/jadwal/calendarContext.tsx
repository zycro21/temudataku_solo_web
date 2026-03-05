"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

type EventType =
  | "one-on-one"
  | "group"
  | "bootcamp"
  | "shortclass"
  | "live class"
  | "other";

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  time?: string;
  meetingLink?: string;
}

interface CalendarContextProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  events: Record<string, CalendarEvent[]>; // untuk kalender
  eventDetails: Record<string, any[]>; // untuk detail modal
  isLoading: boolean;
}

const CalendarContext = createContext<CalendarContextProps | undefined>(
  undefined,
);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({});
  const [eventDetails, setEventDetails] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/mentee/bookings?page=1&limit=500`,
          { withCredentials: true },
        );

        const bookings = res.data?.data?.data || [];
        const newEvents: Record<string, CalendarEvent[]> = {};
        const newEventDetails: Record<string, any[]> = {};

        bookings.forEach((booking: any) => {
          if (!["confirmed", "completed"].includes(booking.status)) {
            return;
          }

          const sessions = booking?.mentoringService?.mentoringSessions || [];

          sessions.forEach((session: any) => {
            if (!session?.date) return;

            const [day, month, year] = session.date.split("-");
            const dateKey = `${year}-${month}-${day}`;

            const start = session.startTime
              ? formatTime(session.startTime)
              : "TBD";
            const end = session.endTime ? formatTime(session.endTime) : "TBD";
            const formattedTime = `${start} - ${end}`;

            const serviceTypeRaw =
              booking.mentoringService?.serviceType?.toLowerCase() || "other";

            // Mapping ke label tampilan
            const serviceTypeDisplay = (() => {
              switch (serviceTypeRaw) {
                case "bootcamp":
                  return "Bootcamp";
                case "one-on-one":
                  return "Mentoring 1 on 1";
                case "group":
                  return "Mentoring Group";
                case "shortclass":
                  return "Short Class";
                case "liveclass":
                  return "Live Class";
                default:
                  return "Other";
              }
            })();

            const validTypes = [
              "one-on-one",
              "group",
              "bootcamp",
              "shortclass",
              "live class",
            ];

            const eventType = validTypes.includes(serviceTypeRaw)
              ? (serviceTypeRaw as EventType)
              : "other";

            const uniqueId = `${booking.id}_${session.id}`;

            const shortEvent: CalendarEvent = {
              title:
                booking.mentoringService?.serviceName || "Mentoring Session",
              type: eventType,
              time: formattedTime,
              meetingLink: session.meetingLink || "",
              id: uniqueId,
            };

            const mentorProfile =
              session?.mentors?.[0]?.mentorProfile || undefined;
            const mentorUser = mentorProfile?.user;

            const fullEvent = {
              id: uniqueId,
              title:
                booking.mentoringService?.serviceName || "Mentoring Session",
              date: `${day}-${month}-${year}`,
              time: formattedTime,
              mentor: mentorProfile
                ? {
                    id: mentorProfile.id || "-",
                    name: mentorUser?.fullName || "-",
                    email: mentorUser?.email || "-",
                    photo: mentorUser?.profilePicture
                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${mentorUser.profilePicture}`
                      : "/assets/dashboard/user/avatar.png",
                    expertise: mentorProfile.expertise || "-",
                    experience: mentorProfile.experience || "-",
                  }
                : {
                    name: "-",
                    email: "-",
                    photo: "/assets/dashboard/user/avatar.png",
                  },
              materi: session.notes || "-",
              catatan: booking.specialRequests || "-",
              expectedOutput: booking.expectedOutput || "-",
              zoomLink: session.meetingLink || "-",
              meetingId: session.meetingId || "-",
              passcode: session.passcode || "-",
              sessionNotes: session.notes || "-",
              serviceType: serviceTypeDisplay,
            };

            if (!newEvents[dateKey]) newEvents[dateKey] = [];
            if (!newEventDetails[dateKey]) newEventDetails[dateKey] = [];

            newEvents[dateKey].push(shortEvent);
            newEventDetails[dateKey].push(fullEvent);
          });
        });

        setEvents(newEvents);
        setEventDetails(newEventDetails);
        console.log("✅ Events generated:", newEvents);
        console.log("📄 Event details:", newEventDetails);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <CalendarContext.Provider
      value={{ selectedDate, setSelectedDate, events, eventDetails, isLoading }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context)
    throw new Error("useCalendar must be used within CalendarProvider");
  return context;
}

function formatTime(timeString: string) {
  const date = new Date(timeString);
  return date.toTimeString().slice(0, 5);
}
