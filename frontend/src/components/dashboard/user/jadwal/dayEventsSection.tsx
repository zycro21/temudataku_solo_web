"use client";

import { Calendar, Clock } from "lucide-react";
import { useCalendar } from "@/components/dashboard/user/jadwal/calendarContext";
import EventDetailDialog from "./eventDetailDialog";
import { toast } from "sonner";

export default function DayEventsSection() {
  const { selectedDate, events } = useCalendar();

  const today = new Date();
  const isToday =
    selectedDate.getDate() === today.getDate() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getFullYear() === today.getFullYear();

  const formattedDate = `${selectedDate.getFullYear()}-${(
    selectedDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${selectedDate.getDate().toString().padStart(2, "0")}`;

  const dayEvents = events[formattedDate] || [];

  return (
    <div className="flex flex-col pt-10 pr-4 pb-4 h-full min-w-0">
      {/* Header section */}
      <h2 className="text-base font-semibold text-gray-800 mb-3">
        {isToday
          ? "Hari Ini"
          : selectedDate.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
      </h2>

      {dayEvents.length === 0 ? (
        <div className="text-gray-500 text-sm">
          {isToday
            ? "Anda tidak memiliki jadwal apapun hari ini"
            : "Tidak ada jadwal pada tanggal ini"}
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1 min-w-0 scroll-thin">
          {dayEvents.map((event, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-gray-200 rounded-lg p-3 shadow-sm bg-white items-center min-w-0"
            >
              {/* Kolom kiri: info event */}
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  {isToday ? "Hari ini" : "Jadwal"}
                </p>
                <h3 className="text-sm font-semibold text-gray-800 mb-2 break-words">
                  {event.title}
                </h3>

                {/* Detail Tanggal & Waktu */}
                <div className="space-y-2">
                  <div className="flex items-center text-xs text-gray-600">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-500 shrink-0" />
                    {selectedDate.toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  {event.time && (
                    <div className="flex items-center text-xs text-gray-600">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-500 shrink-0" />
                      {event.time}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <button
                  onClick={() => {
                    if (event.meetingLink) {
                      let link = event.meetingLink.trim();

                      // kalau link berasal dari Google Calendar
                      if (link.includes("google.com/url?q=")) {
                        try {
                          const urlObj = new URL(link);
                          const realLink = urlObj.searchParams.get("q");
                          if (realLink) link = realLink;
                        } catch (err) {
                          console.error("Invalid URL format:", err);
                        }
                      }

                      window.open(link, "_blank", "noopener,noreferrer");
                    } else {
                      toast.warning(
                        "Link meeting belum tersedia, Silahkan Hubungi Admin",
                      );
                    }
                  }}
                  className="bg-emerald-500 text-white py-1 px-2 rounded-md text-xs font-medium hover:bg-emerald-600 transition"
                >
                  Join
                </button>

                <EventDetailDialog
                  trigger={
                    <button className="border border-emerald-500 text-emerald-500 py-1 px-2 rounded-md text-xs font-medium hover:bg-emerald-50 transition">
                      Lihat Detail
                    </button>
                  }
                  event={event}
                  date={formattedDate} // gunakan format YYYY-MM-DD
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
