"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

type EventType = "mentoring" | "shortclass" | "bootcamp";

interface Mentee {
  name: string;
  email: string;
  avatar?: string;
}

interface Event {
  type: EventType;
  time: string;
  title: string;
  description: string;
  mentees?: Mentee[];
  material?: string;
  notes?: string;
  zoomLink?: string;
  meetingId?: string;
  passcode?: string;
}

interface FlattenedEvent extends Event {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface MentoringDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: FlattenedEvent | null;
}

export default function MentoringDetailModal({
  open,
  onOpenChange,
  event,
}: MentoringDetailModalProps) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl p-0"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <div>
            <DialogTitle className="text-lg font-semibold text-gray-800">
              {new Date(event.date).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </DialogTitle>
            <p className="text-sm text-gray-500">
              Detail jadwal {event.type} Anda.
            </p>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-4 pt-1 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Jadwal */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Image
                src="/assets/dashboard/mentor/calendar.svg"
                alt="Jadwal"
                width={11}
                height={11}
                className="relative top-[-0.5px]"
              />
              <h4 className="font-semibold text-gray-800 text-base">
                Jadwal Mentoring
              </h4>
            </div>
            <div className="pl-6">
              <p className="text-sm text-gray-600">
                {new Date(event.date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                pukul {event.startTime} - {event.endTime} WIB
              </p>
            </div>
          </div>

          {/* Jenis */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Image
                src="/assets/dashboard/mentor/modalschedule/1.svg"
                alt="Jenis"
                width={11}
                height={11}
                className="relative top-[-0.5px]"
              />
              <h4 className="font-semibold text-gray-800 text-base">
                Jenis Mentoring
              </h4>
            </div>
            <div className="pl-6">
              <p className="text-sm text-gray-600">
                {event.type === "mentoring"
                  ? "Mentoring 1 on 1"
                  : event.type === "shortclass"
                  ? "Shortclass"
                  : "Bootcamp"}
              </p>
            </div>
          </div>

          {/* Jumlah Mentee */}
          {event.mentees && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Image
                  src="/assets/dashboard/mentor/modalschedule/2.svg"
                  alt="Jumlah Mentee"
                  width={11}
                  height={11}
                  className="relative top-[-0.5px]"
                />
                <h4 className="font-semibold text-gray-800 text-base">
                  Jumlah Mentee
                </h4>
              </div>
              <div className="pl-6">
                <p className="text-sm text-gray-600">
                  {event.mentees.length} peserta
                </p>
              </div>
            </div>
          )}

          {/* Daftar Mentee */}
          {event.mentees && event.mentees.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src="/assets/dashboard/mentor/modalschedule/3.svg"
                  alt="Daftar Mentee"
                  width={11}
                  height={11}
                  className="relative top-[-0.5px]"
                />
                <h4 className="font-semibold text-gray-800 text-base">
                  Daftar Mentee
                </h4>
              </div>
              {/* Value */}
              <div className="pl-5 space-y-3">
                {event.mentees.map((mentee, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Image
                      src={mentee.avatar || "/assets/dashboard/user/avatar.png"}
                      alt={mentee.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {mentee.name}
                      </p>
                      <p className="text-xs text-gray-500">{mentee.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materi */}
          {event.material && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Image
                  src="/assets/dashboard/mentor/modalschedule/4.svg"
                  alt="Materi"
                  width={11}
                  height={11}
                  className="relative top-[-0.5px]"
                />
                <h4 className="font-semibold text-gray-800 text-base">
                  Materi yang Diinginkan
                </h4>
              </div>
              <div className="pl-6">
                <p className="text-sm text-gray-600">{event.material}</p>
              </div>
            </div>
          )}

          {/* Catatan */}
          {event.notes && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Image
                  src="/assets/dashboard/mentor/modalschedule/5.svg"
                  alt="Catatan"
                  width={11}
                  height={11}
                  className="relative top-[-0.5px]"
                />
                <h4 className="font-semibold text-gray-800 text-base">
                  Catatan atau Permintaan Khusus untuk Mentor
                </h4>
              </div>
              <div className="pl-6">
                <p className="text-sm text-gray-600">{event.notes}</p>
              </div>
            </div>
          )}

          {/* Zoom Link */}
          {event.zoomLink && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Image
                  src="/assets/dashboard/mentor/modalschedule/6.svg"
                  alt="Zoom Link"
                  width={11}
                  height={11}
                  className="relative top-[-0.5px]"
                />
                <h4 className="font-semibold text-gray-800 text-base">
                  Link Zoom Meeting
                </h4>
              </div>
              <div className="pl-6">
                <a
                  href={event.zoomLink}
                  target="_blank"
                  className="text-sm text-emerald-600 hover:underline"
                >
                  {event.zoomLink}
                </a>
              </div>
            </div>
          )}

          {/* Meeting ID */}
          {event.meetingId && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Image
                  src="/assets/dashboard/mentor/modalschedule/7.svg"
                  alt="Meeting ID"
                  width={11}
                  height={11}
                  className="relative top-[-0.5px]"
                />
                <h4 className="font-semibold text-gray-800 text-base">
                  Meeting ID
                </h4>
              </div>
              <div className="pl-6">
                <p className="text-sm text-gray-600">{event.meetingId}</p>
              </div>
            </div>
          )}

          {/* Passcode */}
          {event.passcode && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Image
                  src="/assets/dashboard/mentor/modalschedule/8.svg"
                  alt="Passcode"
                  width={11}
                  height={11}
                  className="relative top-[-0.5px]"
                />
                <h4 className="font-semibold text-gray-800 text-base">
                  Meeting Passcode
                </h4>
              </div>
              <div className="pl-6">
                <p className="text-sm text-gray-600">{event.passcode}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
