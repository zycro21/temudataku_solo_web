"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type EventType = "class" | "mentoring" | "bootcamp" | "other";

export interface CalendarEvent {
  title: string;
  type: EventType;
  time?: string; // optional
}

interface CalendarContextProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  events: Record<string, CalendarEvent[]>;
}

const CalendarContext = createContext<CalendarContextProps | undefined>(
  undefined
);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Simulasi data events
  const events: Record<string, CalendarEvent[]> = {
    "2025-09-02": [
      { title: "Bootcamp React", type: "bootcamp", time: "10.00 - 13.00 WIB" },
    ],
    "2025-09-03": [
      { title: "AI Class", type: "class", time: "09.00 - 11.00 WIB" },
      { title: "Bootcamp React-2", type: "bootcamp", time: "13.00 - 14.00 WIB" },
      { title: "Mentoring-2", type: "mentoring", time: "15.00 - 16.00 WIB" },
      { title: "AI Advanced", type: "class", time: "19.00 - 20.00 WIB" },
    ],
    "2025-09-05": [
      { title: "AI Class", type: "class", time: "09.00 - 11.00 WIB" },
      { title: "Mentoring", type: "mentoring", time: "13.00 - 14.00 WIB" },
      { title: "Mentoring-2", type: "mentoring", time: "15.00 - 16.00 WIB" },
      { title: "AI Advanced", type: "class", time: "19.00 - 20.00 WIB" },
    ],
  };

  return (
    <CalendarContext.Provider value={{ selectedDate, setSelectedDate, events }}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within CalendarProvider");
  }
  return context;
}
