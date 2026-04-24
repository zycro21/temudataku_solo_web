"use client";

import Image from "next/image";
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
  Link2,
  FileText,
  Key,
  MessageCircle,
} from "lucide-react";

export default function GenericEventDetailDialog({
  trigger,
  event,
}: {
  trigger: React.ReactNode;
  event: {
    title?: string;
    date: string; // format bisa "26-04-2025" atau "2025-04-26"
    time?: string;
    sessionType?: string;
    mentor?: { name: string; email: string; photo?: string };
    materi?: string;
    catatan?: string;
    zoomLink?: string;
    meetingId?: string;
    passcode?: string;
  };
}) {
  const {
    date,
    time = "-",
    sessionType = event.title || "-",
    mentor,
    materi = "-",
    catatan,
    zoomLink,
    meetingId,
    passcode,
  } = event;

  // 🔹 Helper untuk ubah format tanggal ke Bahasa Indonesia
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

    const formatted = new Date(`${year}-${month}-${day}`);
    return formatted.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const tanggalFormatted = formatTanggalIndonesia(date);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="
      w-full max-w-md
      p-0
      max-h-[85vh]
      overflow-hidden
      flex flex-col
    "
      >
        {/* HEADER (STICKY) */}
        <div className="px-4 py-3 border-b bg-white sticky top-0 z-10">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-sm font-semibold text-gray-800">
              {tanggalFormatted}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Lihat jadwal sesi Anda pada tanggal ini.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* CONTENT (SCROLLABLE) */}
        <div
          className="
        px-4 py-3
        overflow-y-auto
        overflow-x-hidden
        space-y-4
        text-xs text-gray-700
      "
        >
          {/* Jadwal sesi */}
          <div>
            <p className="font-medium flex items-center gap-2 text-gray-800">
              <Calendar className="w-3.5 h-3.5" /> Jadwal Sesi
            </p>
            <p className="ml-5 text-gray-600 mt-1">
              {tanggalFormatted} {time !== "-" ? `pukul ${time}` : ""}
            </p>
          </div>

          {/* Jenis sesi */}
          <div>
            <p className="font-medium flex items-center gap-2 text-gray-800">
              <FileText className="w-3.5 h-3.5" /> Jenis Sesi
            </p>
            <p className="ml-5 text-gray-600 mt-1">{sessionType}</p>
          </div>

          {/* Mentor */}
          <div>
            <p className="font-medium flex items-center gap-2 text-gray-800">
              <User className="w-3.5 h-3.5" /> Mentor
            </p>

            <div className="ml-5 flex items-center gap-2 mt-1.5">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={
                    mentor?.photo
                      ? mentor.photo
                      : "/assets/dashboard/user/avatar.png"
                  }
                  alt={mentor?.name || "Mentor"}
                  width={32}
                  height={32}
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="leading-tight">
                <p className="text-gray-800 font-medium text-xs">
                  {mentor?.name ?? "—"}
                </p>
                <p className="text-gray-500 text-[11px]">
                  {mentor?.email ?? "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Materi */}
          <div>
            <p className="font-medium flex items-center gap-2 text-gray-800">
              <BookOpen className="w-3.5 h-3.5" /> Materi Pembahasan
            </p>
            <p className="ml-5 text-gray-600 mt-1 break-words">{materi}</p>
          </div>

          {/* Catatan */}
          {catatan && (
            <div>
              <p className="font-medium flex items-center gap-2 text-gray-800">
                <MessageCircle className="w-3.5 h-3.5" /> Catatan
              </p>
              <p className="ml-5 text-gray-600 mt-1 break-words">{catatan}</p>
            </div>
          )}

          {/* Link Zoom */}
          {zoomLink && (
            <div>
              <p className="font-medium flex items-center gap-2 text-gray-800">
                <Link2 className="w-3.5 h-3.5" /> Link Zoom
              </p>
              <a
                href={zoomLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-5 text-emerald-600 hover:underline break-all mt-1 block text-xs"
              >
                {zoomLink}
              </a>
            </div>
          )}

          {/* Meeting ID & Passcode */}
          {(meetingId || passcode) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {meetingId && (
                <div>
                  <p className="font-medium flex items-center gap-2 text-gray-800">
                    <Key className="w-3.5 h-3.5" /> Meeting ID
                  </p>
                  <p className="ml-5 text-gray-600 mt-1 break-all">
                    {meetingId}
                  </p>
                </div>
              )}

              {passcode && (
                <div>
                  <p className="font-medium flex items-center gap-2 text-gray-800">
                    <Key className="w-3.5 h-3.5" /> Passcode
                  </p>
                  <p className="ml-5 text-gray-600 mt-1 break-all">
                    {passcode}
                  </p>
                </div>
              )}
            </div>
          )}
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
