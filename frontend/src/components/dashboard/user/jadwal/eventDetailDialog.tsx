"use client";

import { useCalendar } from "./calendarContext";
import MentoringDetailDialog from "./mentoringDetailModal";
import GenericEventDetailDialog from "./genericDetailModal";
import { CalendarEvent } from "./calendarContext";

interface EventDetailDialogProps {
  trigger: React.ReactNode;
  event: CalendarEvent;
  date: string;
}

export default function EventDetailDialog({
  trigger,
  event,
  date,
}: EventDetailDialogProps) {
  const { eventDetails } = useCalendar();

  // Ambil semua sesi pada tanggal ini
  const sessionsForDate = eventDetails[date] || [];

  // Cari sesi yang cocok berdasarkan ID unik dari CalendarEvent
  const sessionData =
    sessionsForDate.find((s: any) => s.id === event.id) || null;

  if (!sessionData) {
    console.warn("Tidak menemukan detail sesi untuk:", event.title, date);
    return null;
  }

  // Normalisasi event.type ke dalam dua kategori utama
  const eventCategory =
    event.type === "one-on-one" ||
    event.type === "group" ||
    event.type === "other"
      ? "mentoring"
      : "class";

  switch (eventCategory) {
    // ======================
    // CASE: MENTORING
    // ======================
    case "mentoring":
      return (
        <MentoringDetailDialog
          trigger={trigger}
          event={{
            title: sessionData.title,
            date: sessionData.date,
            time: sessionData.time || "-",
            mentor: sessionData.mentor || { name: "-", email: "-", photo: "" },
            materi: sessionData.materi || "-",
            catatan: sessionData.catatan || "-",
            zoomLink: sessionData.zoomLink || "-",
            meetingId: sessionData.meetingId || "-",
            passcode: sessionData.passcode || "-",
          }}
        />
      );

    // ======================
    // CASE: CLASS (Bootcamp, Shortclass, Live Class)
    // ======================
    case "class":
    default:
      return (
        <GenericEventDetailDialog
          trigger={trigger}
          event={{
            title: sessionData.title,
            date: sessionData.date,
            time: sessionData.time || "-",
            sessionType: sessionData.serviceType || "Class",
            mentor: sessionData.mentor || { name: "-", email: "-", photo: "" },
            materi: sessionData.materi || "-",
            catatan: sessionData.catatan || "-",
            zoomLink: sessionData.zoomLink || "-",
            meetingId: sessionData.meetingId || "-",
            passcode: sessionData.passcode || "-",
          }}
        />
      );
  }
}
