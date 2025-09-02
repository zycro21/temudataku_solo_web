"use client";

import Image from "next/image";
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
    date: string; // e.g. "Sabtu, 26 April 2025"
    time?: string; // e.g. "20.00 - 21.30 WIB"
    sessionType?: string; // e.g. "Bootcamp Data Science"
    mentor?: { name: string; email: string; avatar?: string };
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

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            {date}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Lihat jadwal sesi Anda pada tanggal ini.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6 text-sm text-gray-700">
          {/* Jadwal sesi */}
          <div>
            <p className="font-medium flex items-center gap-2 text-gray-800">
              <Calendar className="w-4 h-4" /> Jadwal Sesi
            </p>
            <p className="ml-6 text-gray-600 mt-2">
              {date} {time !== "-" ? `pukul ${time}` : ""}
            </p>
          </div>

          {/* Jenis sesi */}
          <div>
            <p className="font-medium flex items-center gap-2 text-gray-800">
              <FileText className="w-4 h-4" /> Jenis Sesi
            </p>
            <p className="ml-6 text-gray-600 mt-2">{sessionType}</p>
          </div>

          {/* Mentor / Trainer */}
          <div>
            <p className="font-medium flex items-center gap-2 text-gray-800">
              <User className="w-4 h-4" /> Mentor
            </p>
            <div className="ml-6 flex items-center gap-3 mt-2">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={
                    mentor?.avatar
                      ? mentor.avatar
                      : "/assets/dashboard/user/avatar.png"
                  }
                  alt={mentor?.name || "Mentor"}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-gray-800 font-medium">
                  {mentor?.name ?? "—"}
                </p>
                <p className="text-gray-500 text-sm">{mentor?.email ?? "-"}</p>
              </div>
            </div>
          </div>

          {/* Materi */}
          <div>
            <p className="font-medium flex items-center gap-2 text-gray-800">
              <BookOpen className="w-4 h-4" /> Materi Pembahasan
            </p>
            <p className="ml-6 text-gray-600 mt-2">{materi}</p>
          </div>

          {/* Catatan / Permintaan Khusus (jika ada) */}
          {catatan && (
            <div>
              <p className="font-medium flex items-center gap-2 text-gray-800">
                <MessageCircle className="w-4 h-4" /> Catatan atau Permintaan
                Khusus
              </p>
              <p className="ml-6 text-gray-600 mt-2">{catatan}</p>
            </div>
          )}

          {/* Link Zoom */}
          {zoomLink && (
            <div>
              <p className="font-medium flex items-center gap-2 text-gray-800">
                <Link2 className="w-4 h-4" /> Link Zoom Meeting
              </p>
              <a
                href={zoomLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-6 text-emerald-600 hover:underline break-all mt-2 block"
              >
                {zoomLink}
              </a>
            </div>
          )}

          {/* Meeting ID & Passcode */}
          {(meetingId || passcode) && (
            <div className="grid grid-cols-2 gap-4">
              {meetingId && (
                <div>
                  <p className="font-medium flex items-center gap-2 text-gray-800">
                    <Key className="w-4 h-4" /> Meeting ID
                  </p>
                  <p className="ml-6 text-gray-600 mt-2">{meetingId}</p>
                </div>
              )}
              {passcode && (
                <div>
                  <p className="font-medium flex items-center gap-2 text-gray-800">
                    <Key className="w-4 h-4" /> Meeting Passcode
                  </p>
                  <p className="ml-6 text-gray-600 mt-2">{passcode}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
