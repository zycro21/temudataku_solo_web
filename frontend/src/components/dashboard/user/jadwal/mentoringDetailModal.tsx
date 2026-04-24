"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
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

      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="
      w-full max-w-md
      p-4 sm:p-5
      max-h-[85vh]
      overflow-y-auto
      overflow-x-hidden
    "
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base font-semibold text-gray-800">
            {tanggalFormatted}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Lihat jadwal sesi Anda hari ini.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 space-y-4 text-xs text-gray-700">
          {/* Jadwal */}
          <div>
            <p className="font-medium flex items-center gap-2 text-gray-800">
              <Calendar className="w-3.5 h-3.5 text-gray-900" /> Jadwal
            </p>
            <p className="ml-6 text-gray-600">
              {tanggalFormatted} pukul {event.time}
            </p>
          </div>

          {/* Jenis Mentoring */}
          <div>
            <p className="font-medium flex items-center gap-2 text-gray-800">
              <BookOpen className="w-3.5 h-3.5 text-gray-900" /> Jenis Mentoring
            </p>
            <p className="ml-6 text-gray-600">Mentoring 1 on 1</p>
          </div>

          {/* Mentor */}
          <div>
            <p className="font-medium flex items-center gap-2 text-gray-800">
              <User className="w-3.5 h-3.5 text-gray-900" /> Mentor
            </p>

            <div className="ml-6 mt-1.5 flex items-center gap-2">
              {event.mentor.photo ? (
                <img
                  src={event.mentor.photo}
                  alt={event.mentor.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <User className="w-4 h-4" />
                </div>
              )}

              <div className="leading-tight">
                <p className="text-gray-700 font-medium text-xs">
                  {event.mentor.name}
                </p>
                <p className="text-gray-500 text-[11px]">
                  {event.mentor.email}
                </p>
              </div>
            </div>
          </div>

          {/* Materi */}
          <div>
            <p className="font-medium flex items-center gap-2 text-gray-800">
              <BookOpen className="w-3.5 h-3.5 text-gray-900" /> Materi
              Pembahasan
            </p>
            <p className="ml-6 text-gray-600 break-words">{event.materi}</p>
          </div>

          {/* Catatan */}
          {event.catatan && (
            <div>
              <p className="font-medium flex items-center gap-2 text-gray-800">
                <StickyNote className="w-3.5 h-3.5 text-gray-900" /> Catatan
              </p>
              <p className="ml-6 text-gray-600 break-words">{event.catatan}</p>
            </div>
          )}

          {/* Link Zoom */}
          <div>
            <p className="font-medium flex items-center gap-2 text-gray-800">
              <Link2 className="w-3.5 h-3.5 text-gray-900" /> Link Zoom
            </p>
            <a
              href={event.zoomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-6 text-emerald-600 hover:underline break-all text-xs"
            >
              {event.zoomLink}
            </a>
          </div>

          {/* Meeting ID */}
          <div>
            <p className="font-medium flex items-center gap-2 text-gray-800">
              <Hash className="w-3.5 h-3.5 text-gray-900" /> Meeting ID
            </p>
            <p className="ml-6 text-gray-600 break-all">{event.meetingId}</p>
          </div>

          {/* Passcode */}
          <div>
            <p className="font-medium flex items-center gap-2 text-gray-800">
              <Lock className="w-3.5 h-3.5 text-gray-900" /> Passcode
            </p>
            <p className="ml-6 text-gray-600 break-all">{event.passcode}</p>
          </div>
        </div>

        {/* FOOTER (STICKY) */}
        <div className="px-4 py-3 border-t bg-white sticky bottom-0 z-10">
          <DialogClose asChild>
            <button
              className="
        w-full
        text-xs
        font-medium
        px-3 py-2
        rounded-md
        bg-gray-900 text-white
        hover:bg-gray-800
        transition
      "
            >
              Tutup
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
