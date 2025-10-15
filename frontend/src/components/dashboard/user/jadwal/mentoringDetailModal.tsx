"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  User,
  BookOpen,
  StickyNote,
  Link2,
  Hash,
  Lock,
} from "lucide-react";

interface MentoringDetailDialogProps {
  trigger: React.ReactNode;
  event: {
    title: string;
    date: string;
    time: string;
    mentor: { name: string; email: string; photo?: string };
    materi: string;
    catatan?: string;
    zoomLink: string;
    meetingId: string;
    passcode: string;
  };
}

export default function MentoringDetailDialog({
  trigger,
  event,
}: MentoringDetailDialogProps) {
  // 🔹 Helper untuk format tanggal ke gaya Indonesia
  function formatTanggalIndonesia(dateString: string) {
    if (!dateString) return "-";

    const parts = dateString.split("-");
    let day, month, year;

    if (parts[0].length === 4) {
      // format YYYY-MM-DD
      [year, month, day] = parts;
    } else {
      // format DD-MM-YYYY
      [day, month, year] = parts;
    }

    const formattedDate = new Date(`${year}-${month}-${day}`);
    return formattedDate.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const tanggalFormatted = formatTanggalIndonesia(event.date);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            {tanggalFormatted}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Lihat jadwal sesi Anda hari ini.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6 text-sm text-gray-700">
          {/* Jadwal */}
          <div>
            <p className="font-medium flex items-center gap-3 text-gray-800">
              <Calendar className="w-4 h-4 text-gray-900" /> Jadwal
            </p>
            <p className="ml-7 text-gray-600">
              {tanggalFormatted} pukul {event.time}
            </p>
          </div>

          {/* Jenis Mentoring */}
          <div>
            <p className="font-medium flex items-center gap-3 text-gray-800">
              <BookOpen className="w-4 h-4 text-gray-900" /> Jenis Mentoring
            </p>
            <p className="ml-7 text-gray-600">Mentoring 1 on 1</p>
          </div>

          {/* Mentor */}
          <div>
            <p className="font-medium flex items-center gap-3 text-gray-800">
              <User className="w-4 h-4 text-gray-900" /> Mentor
            </p>
            <div className="ml-7 mt-2 flex items-center gap-3">
              {event.mentor.photo ? (
                <img
                  src={event.mentor.photo}
                  alt={event.mentor.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="text-gray-700 font-medium">{event.mentor.name}</p>
                <p className="text-gray-500 text-sm">{event.mentor.email}</p>
              </div>
            </div>
          </div>

          {/* Materi */}
          <div>
            <p className="font-medium flex items-center gap-3 text-gray-800">
              <BookOpen className="w-4 h-4 text-gray-900" /> Materi Pembahasan
            </p>
            <p className="ml-7 text-gray-600">{event.materi}</p>
          </div>

          {/* Catatan */}
          {event.catatan && (
            <div>
              <p className="font-medium flex items-center gap-3 text-gray-800">
                <StickyNote className="w-4 h-4 text-gray-900" /> Catatan /
                Permintaan Khusus
              </p>
              <p className="ml-7 text-gray-600">{event.catatan}</p>
            </div>
          )}

          {/* Link Zoom */}
          <div>
            <p className="font-medium flex items-center gap-3 text-gray-800">
              <Link2 className="w-4 h-4 text-gray-900" /> Link Zoom Meeting
            </p>
            <a
              href={event.zoomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-7 text-emerald-600 hover:underline break-all"
            >
              {event.zoomLink}
            </a>
          </div>

          {/* Meeting ID */}
          <div>
            <p className="font-medium flex items-center gap-3 text-gray-800">
              <Hash className="w-4 h-4 text-gray-900" /> Meeting ID
            </p>
            <p className="ml-7 text-gray-600">{event.meetingId}</p>
          </div>

          {/* Passcode */}
          <div>
            <p className="font-medium flex items-center gap-3 text-gray-800">
              <Lock className="w-4 h-4 text-gray-900" /> Meeting Passcode
            </p>
            <p className="ml-7 text-gray-600">{event.passcode}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
