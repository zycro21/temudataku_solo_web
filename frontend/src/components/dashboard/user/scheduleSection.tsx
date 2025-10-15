"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import axios from "axios";
import { toast } from "sonner"; // pastikan sudah ada

// SVG Zoom Icon
const ZoomIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 mr-2 fill-current"
    viewBox="0 0 24 24"
  >
    <path d="M23 7.5v9a1 1 0 0 1-1.6.8l-4.4-3.3v2.5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.5l4.4-3.3A1 1 0 0 1 23 7.5z" />
  </svg>
);

interface ScheduleItem {
  title: string;
  time: string;
  linkText: string;
  meetingLink?: string;
}

export default function ScheduleSection() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [allSchedules, setAllSchedules] = useState<
    Record<string, ScheduleItem[]>
  >({});

  const getStartOfWeek = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
    return start;
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const goToPrevWeek = () => {
    const prev = new Date(startOfWeek);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
    setSelectedDate(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(startOfWeek);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
    setSelectedDate(next);
  };

  const monthOptions = Array.from({ length: 13 }, (_, i) => {
    const date = new Date(today);
    date.setMonth(today.getMonth() - 6 + i);
    return {
      label: date.toLocaleString("id-ID", { month: "long", year: "numeric" }),
      value: `${date.getFullYear()}-${date.getMonth()}`,
      date,
    };
  });

  const currentValue = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/mentee/bookings`,
          {
            params: { page: 1, limit: 100 },
            withCredentials: true,
          }
        );

        const bookings = res.data.data.data;
        const schedules: Record<string, ScheduleItem[]> = {};

        bookings.forEach((booking: any) => {
          const sessions = booking.mentoringService?.mentoringSessions || [];
          sessions.forEach((session: any) => {
            if (!session.date) return;
            const key = session.date;
            if (!schedules[key]) schedules[key] = [];

            const start = new Date(session.startTime).toLocaleTimeString(
              "id-ID",
              { hour: "2-digit", minute: "2-digit" }
            );
            const end = new Date(session.endTime).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const [day, month, year] = session.date.split("-").map(Number);
            const sessionDate = new Date(year, month - 1, day);
            const isToday =
              sessionDate.toDateString() === new Date().toDateString();

            const timeStr = `${isToday ? "Hari Ini, " : ""}${start} - ${end}`;

            schedules[key].push({
              title: booking.mentoringService.serviceName || "Sesi Mentoring",
              time: timeStr,
              linkText: "Zoom Meeting",
              meetingLink: session.meetingLink,
            });
          });
        });

        setAllSchedules(schedules);
      } catch (err) {
        console.error("Gagal fetch bookings:", err);
      }
    };

    fetchBookings();
  }, []);

  const formatDateKey = (date: Date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  const scheduleItems = allSchedules[formatDateKey(selectedDate)] || [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Jadwal</h2>
        <div className="relative">
          <select
            value={currentValue}
            onChange={(e) => {
              const [year, month] = e.target.value.split("-").map(Number);
              const newDate = new Date(year, month, 1);
              setCurrentDate(newDate);
              setSelectedDate(newDate);
            }}
            className="appearance-none bg-transparent pr-6 text-sm font-medium text-gray-600 cursor-pointer capitalize"
          >
            {monthOptions.map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <ChevronLeft
          className="w-5 h-5 text-gray-400 cursor-pointer"
          onClick={goToPrevWeek}
        />
        <div className="flex items-center space-x-2.5">
          {weekDates.map((date, index) => {
            const isSelected =
              date.toDateString() === selectedDate.toDateString();
            return (
              <div
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center justify-center w-12 h-16 rounded-lg cursor-pointer transition-colors
          ${
            isSelected
              ? "bg-emerald-600 text-white font-semibold shadow-lg"
              : "text-gray-600 hover:bg-gray-100"
          }`}
              >
                <span className="text-base font-semibold">
                  {date.getDate()}
                </span>
                <span className="text-sm mt-1">{days[index]}</span>
              </div>
            );
          })}
        </div>
        <ChevronRight
          className="w-5 h-5 text-gray-400 cursor-pointer"
          onClick={goToNextWeek}
        />
      </div>

      <div
        className={`space-y-4 ${
          scheduleItems.length > 1
            ? "max-h-[110px] overflow-y-auto pr-2 scroll-thin"
            : ""
        }`}
      >
        {scheduleItems.length > 0 ? (
          scheduleItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div className="flex flex-col">
                <span className="text-base font-medium text-gray-800">
                  {item.title}
                </span>
                <span className="text-sm text-gray-500 mt-1">{item.time}</span>
              </div>

              <button
                onClick={() => {
                  if (item.meetingLink) {
                    let link = item.meetingLink.trim();

                    // Deteksi link Google Calendar
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
                      "Link meeting belum tersedia, Silahkan hubungi admin."
                    );
                  }
                }}
                className={`flex items-center text-sm font-medium rounded-full px-3 py-1 shadow-sm transition-colors
                  ${
                    item.meetingLink
                      ? "text-blue-600 bg-white border border-white hover:bg-gray-50"
                      : "text-red-500 bg-gray-100 cursor-not-allowed"
                  }`}
              >
                <ZoomIcon />
                {item.meetingLink ? "Zoom Meeting" : "Belum ada Link"}
              </button>
            </div>
          ))
        ) : (
          <div className="p-14 text-center text-gray-500 text-sm bg-gray-50 rounded-xl">
            Tidak ada jadwal untuk anda hari ini
          </div>
        )}
      </div>
    </div>
  );
}
