"use client";

import { useState } from "react";
import { useCalendar } from "@/components/dashboard/user/jadwal/calendarContext";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

type EventType =
  | "one-on-one"
  | "group"
  | "bootcamp"
  | "shortclass"
  | "live class"
  | "other";

export interface CalendarEvent {
  title: string;
  type: EventType;
  time?: string;
}

export default function CalendarSection() {
  const { selectedDate, setSelectedDate, events } = useCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  const daysInWeek = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  const getCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const calendarDays = getCalendarDays(
    currentDate.getFullYear(),
    currentDate.getMonth(),
  );

  const goToPrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  // 🎨 Update warna berdasarkan tipe service
  const getEventStyle = (type: EventType) => {
    switch (type) {
      case "one-on-one":
        return "bg-yellow-400 text-white";
      case "group":
        return "bg-blue-500 text-white";
      case "bootcamp":
        return "bg-purple-500 text-white";
      case "shortclass":
        return "bg-pink-400 text-white";
      case "live class":
        return "bg-red-400 text-white";
      default:
        return "bg-emerald-500 text-white";
    }
  };

  const isSameDate = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  return (
    <div className="bg-white pt-1 px-6 pb-6 h-fit">
      {/* Header Kalender */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center border border-gray-400 rounded px-2 py-0.5 cursor-pointer">
            <span
              className="font-semibold text-gray-800"
              style={{ fontSize: "11px" }}
            >
              {monthNames[currentDate.getMonth()]}
            </span>
            <ChevronDown className="w-2.5 h-2.5 ml-1 text-gray-600" />
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={goToPrevMonth}
            className="p-0.5 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-3 h-3 text-gray-500" />
          </button>
          <span
            className="font-semibold text-gray-800 whitespace-nowrap"
            style={{ fontSize: "11px" }}
          >
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-0.5 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="w-3 h-3 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Grid Kalender */}
      <div
        className="grid grid-cols-7 border border-gray-300 w-full"
        style={{ fontSize: "9px" }}
      >
        {daysInWeek.map((day, index) => (
          <div
            key={index}
            className="py-0.5 px-1 font-medium text-gray-500 border-b border-r border-gray-300 text-left"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((date, index) => {
          const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

          const dayEvents = events[formattedDate] || [];
          const isToday = isSameDate(date, today);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isSelected = isSameDate(date, selectedDate);

          return (
            <div
              key={index}
              onClick={() => setSelectedDate(date)}
              className={`group relative border-b border-r border-gray-300 flex flex-col cursor-pointer ${
                !isCurrentMonth ? "bg-gray-100 text-gray-400" : ""
              } ${isSelected ? "ring-2 ring-emerald-500" : ""}`}
              style={{ padding: "4px", minHeight: "80px" }}
            >
              {isToday && (
                <span
                  className="absolute top-1 left-1/2 -translate-x-1/2 bg-black text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                  style={{ fontSize: "8px" }}
                >
                  Today
                </span>
              )}

              <div
                className={`font-semibold flex items-center justify-center rounded-full ${
                  isToday ? "bg-emerald-500 text-white" : ""
                }`}
                style={{ fontSize: "10px", width: "18px", height: "18px" }}
              >
                {date.getDate()}
              </div>

              <div className="space-y-0.5 mt-0.5 flex-1 overflow-hidden">
                {dayEvents.slice(0, 2).map((event, eventIndex) => (
                  <span
                    key={eventIndex}
                    className={`block w-full rounded-sm text-left truncate ${getEventStyle(
                      event.type,
                    )}`}
                    style={{ fontSize: "9px", padding: "1px 3px" }}
                  >
                    {event.title}
                  </span>
                ))}

                {dayEvents.length > 2 && (
                  <span
                    className="block text-gray-400 text-left"
                    style={{ fontSize: "8px" }}
                  >
                    +{dayEvents.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div
        className="flex items-center gap-2 mt-2 flex-wrap"
        style={{ fontSize: "9px" }}
      >
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 bg-yellow-400 rounded-sm inline-block"></span>
          <span>One-on-One</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 bg-blue-500 rounded-sm inline-block"></span>
          <span>Group</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 bg-purple-500 rounded-sm inline-block"></span>
          <span>Bootcamp</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 bg-emerald-500 rounded-sm inline-block"></span>
          <span>Other</span>
        </div>
      </div>
    </div>
  );
}
