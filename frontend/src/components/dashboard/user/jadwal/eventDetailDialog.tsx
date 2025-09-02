// src/components/dashboard/user/jadwal/EventDetailDialog.tsx
"use client";

import { CalendarEvent } from "./calendarContext";
import MentoringDetailDialog from "./mentoringDetailModal";
import GenericEventDetailDialog from "./genericDetailModal";

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
  switch (event.type) {
    case "mentoring":
      return (
        <MentoringDetailDialog
          trigger={trigger}
          event={{
            title: event.title,
            date,
            time: event.time || "-",
            mentor: { name: "Siti Nurhaliza", email: "siti@example.com" },
            materi: "Power BI untuk analisis data",
            catatan:
              "Saya ingin penjelasan lebih dalam tentang data cleaning menggunakan Power BI",
            zoomLink: "https://zoom.us/mentoring/TemuDataku",
            meetingId: "981 9357 9211",
            passcode: "987652",
          }}
        />
      );

    case "bootcamp":
      return (
        <GenericEventDetailDialog
          trigger={trigger}
          event={{
            title: event.title,
            date,
            time: event.time || "-",
            sessionType: event.title,
            mentor: {
              name: "Dinda Ayu Lestari",
              email: "dinda.ayu@example.com",
              avatar: "/assets/avatar/dinda.jpg",
            },
            materi: "Power BI untuk analisis data",
            catatan: "Siapkan dataset yang ingin dianalisis",
            zoomLink: "https://zoom.us/bootcamp/TemuDataku",
            meetingId: "981 9357 9211",
            passcode: "987652",
          }}
        />
      );

    case "class":
      return (
        <GenericEventDetailDialog
          trigger={trigger}
          event={{
            title: event.title,
            date,
            time: event.time || "-",
            sessionType: event.title,
            mentor: {
              name: "Rina Amelia",
              email: "rina@example.com",
              avatar: "/assets/avatar/rina.jpg",
            },
            materi: "Machine Learning Basics",
            catatan: "",
            zoomLink: "https://meet.google.com/class/ML",
            meetingId: "123 4567 890",
            passcode: "111222",
          }}
        />
      );

    case "other":
    default:
      return (
        <GenericEventDetailDialog
          trigger={trigger}
          event={{
            title: event.title,
            date,
            time: event.time || "-",
            sessionType: event.title,
            mentor: { name: "Admin", email: "admin@example.com" },
            materi: "Kegiatan tambahan",
            catatan: "",
            zoomLink: "",
            meetingId: "",
            passcode: "",
          }}
        />
      );
  }
}
