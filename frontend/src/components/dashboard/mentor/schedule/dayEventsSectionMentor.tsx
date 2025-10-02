"use client";

import MentoringDetailModal from "./mentoringDetailModal";
import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";

type EventType = "mentoring" | "shortclass" | "bootcamp";

interface Mentee {
  name: string;
  email: string;
  avatar?: string;
}

interface Event {
  type: EventType;
  time: string; // contoh: "09.00-10.30"
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

export default function DayEventsSectionMentor() {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FlattenedEvent | null>(
    null
  );
  const [filter, setFilter] = useState<"today" | "week" | "month">("today");
  const [activeSessions, setActiveSessions] = useState<string[]>([]);
  const [events, setEvents] = useState<Record<string, Event[]>>({});
  const [loading, setLoading] = useState(true);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Ambil data dari API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/mentor/own-mentoring-sessions`,
          { withCredentials: true }
        );

        const sessions = res.data;

        const mapped: Record<string, Event[]> = {};

        sessions.forEach((s: any) => {
          // parse date dd-mm-yyyy -> yyyy-mm-dd
          const [day, month, year] = s.date.split("-");
          const dateKey = `${year}-${month}-${day}`;

          const start = new Date(s.startTime);
          const end = new Date(s.endTime);

          const ev: Event = {
            type: "mentoring",
            time: `${start.getHours().toString().padStart(2, "0")}.${start
              .getMinutes()
              .toString()
              .padStart(2, "0")}-${end
              .getHours()
              .toString()
              .padStart(2, "0")}.${end
              .getMinutes()
              .toString()
              .padStart(2, "0")}`,
            title: s.serviceName || "(Mentoring)",
            description: s.serviceType || "",
            zoomLink: s.meetingLink,
          };

          if (!mapped[dateKey]) mapped[dateKey] = [];
          mapped[dateKey].push(ev);
        });

        setEvents(mapped);
      } catch (err) {
        console.error("Gagal fetch events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Flatten events
  const allEvents: FlattenedEvent[] = Object.entries(events).flatMap(
    ([date, dayEvents]) =>
      dayEvents.map((e, idx) => {
        const [startTime, endTime] = e.time.split("-");
        const typeLabel =
          e.type === "mentoring"
            ? "Mentoring"
            : e.type === "shortclass"
            ? "Shortclass"
            : "Bootcamp";

        return {
          ...e,
          id: `${date}-${e.type}-${startTime}-${endTime}-${idx}`,
          title: e.title?.trim() ? e.title : `(${typeLabel})`,
          date,
          startTime,
          endTime,
        };
      })
  );

  // Filter
  const filteredEvents = allEvents.filter((event) => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
      (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (filter === "today") return diffDays === 0;
    if (filter === "week") return diffDays >= -7 && diffDays <= 7;
    if (filter === "month") return eventDate.getMonth() === today.getMonth();
    return false;
  });

  // Sorting
  const sortedEvents = (() => {
    if (filter === "today") {
      return filteredEvents.sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
    }

    const todayEvents = filteredEvents.filter(
      (e) => new Date(e.date).toDateString() === today.toDateString()
    );
    const upcomingEvents = filteredEvents.filter(
      (e) => new Date(e.date) > today
    );
    const pastEvents = filteredEvents.filter((e) => new Date(e.date) < today);

    const sortByDateTime = (arr: typeof filteredEvents) =>
      arr.sort((a, b) => {
        const da = new Date(`${a.date}T${a.startTime.replace(".", ":")}`);
        const db = new Date(`${b.date}T${b.startTime.replace(".", ":")}`);
        return da.getTime() - db.getTime();
      });

    return [
      ...sortByDateTime(todayEvents),
      ...sortByDateTime(upcomingEvents),
      ...sortByDateTime(pastEvents),
    ];
  })();

  const uniqueEvents = Array.from(
    new Map(sortedEvents.map((e) => [e.id, e])).values()
  );

  // Helper waktu relatif
  const getRelativeLabel = (date: string) => {
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
      (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0)
      return {
        label: "Hari ini",
        icon: (
          <Image
            src="/assets/dashboard/mentor/redwarning.svg"
            alt="Hari ini"
            width={10}
            height={10}
          />
        ),
      };
    if (diffDays > 0)
      return {
        label: `${diffDays} hari lagi`,
        icon: (
          <Image
            src="/assets/dashboard/mentor/greencalendar.svg"
            alt="Upcoming"
            width={8}
            height={8}
          />
        ),
      };
    return {
      label: "Sudah lewat",
      icon: (
        <Image
          src="/assets/dashboard/mentor/greencalendar.svg"
          alt="Sudah lewat"
          width={8}
          height={8}
        />
      ),
    };
  };

  // Status tombol
  const getButtonState = (event: any) => {
    const [startHour, startMin] = event.startTime.split(".").map(Number);
    const [endHour, endMin] = event.endTime.split(".").map(Number);

    const start = new Date(event.date);
    start.setHours(startHour, startMin, 0, 0);

    const end = new Date(event.date);
    end.setHours(endHour, endMin, 0, 0);

    const now = new Date();

    const beforeStartWindow = new Date(start.getTime() - 30 * 60 * 1000);
    const afterEndWindow = new Date(end.getTime() + 30 * 60 * 1000);

    if (activeSessions.includes(event.id)) {
      if (now > end) {
        return { label: "Sesi Berakhir", enabled: true, style: "end" };
      }
      return { label: "Berlangsung", enabled: false, style: "disabled" };
    }

    if (now < beforeStartWindow) {
      return { label: "Mulai Sesi", enabled: false, style: "disabled" };
    }

    if (now >= beforeStartWindow && now <= afterEndWindow) {
      return { label: "Mulai Sesi", enabled: true, style: "start" };
    }

    if (now > afterEndWindow) {
      return { label: "Sesi Berakhir", enabled: true, style: "end" };
    }

    return { label: "Mulai Sesi", enabled: false, style: "disabled" };
  };

  const handleStart = (id: string) => {
    setActiveSessions((prev) => [...prev, id]);
  };

  // tampilkan loading screen
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4">
        {/* Tabs */}
        <div className="grid grid-cols-3 mb-4 gap-2 w-full">
          {["today", "week", "month"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`w-full py-3 rounded-md text-sm font-medium transition-colors
        ${
          filter === tab
            ? "bg-emerald-500 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
            >
              {tab === "today"
                ? "Hari ini"
                : tab === "week"
                ? "Minggu ini"
                : "Bulan ini"}
            </button>
          ))}
        </div>

        {/* Event List */}
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 scroll-thin">
          {uniqueEvents.length > 0 ? (
            uniqueEvents.map((event) => {
              const rel = getRelativeLabel(event.date);
              const button = getButtonState(event);

              return (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 flex gap-4"
                >
                  {/* Left */}
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {rel.icon}
                      <span>{rel.label}</span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800">
                      {event.title}
                    </h3>

                    <div className="flex items-center gap-2 text-gray-600 text-xs">
                      <Image
                        src="/assets/dashboard/mentor/calendar.svg"
                        alt="Tanggal"
                        width={10}
                        height={10}
                      />
                      <span>
                        {new Date(event.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-xs">
                      <Image
                        src="/assets/dashboard/mentor/time.svg"
                        alt="Waktu"
                        width={10}
                        height={10}
                      />
                      {event.startTime} - {event.endTime} WIB
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex flex-col gap-3 justify-center items-stretch">
                    <button
                      disabled={
                        button.label === "Mulai Sesi" ? !button.enabled : true
                      }
                      onClick={() =>
                        button.label === "Mulai Sesi" && handleStart(event.id)
                      }
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        button.style === "start"
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : button.style === "end"
                          ? "bg-red-500 text-white cursor-not-allowed"
                          : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      {button.label}
                    </button>

                    <button
                      className="border border-emerald-500 text-emerald-500 px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-50"
                      onClick={() => {
                        setSelectedEvent(event);
                        setDetailOpen(true);
                      }}
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-sm">
              Tidak ada event untuk periode ini.
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      <MentoringDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        event={selectedEvent}
      />
    </>
  );
}
