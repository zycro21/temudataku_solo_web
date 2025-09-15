"use client";

import MentorSidebar from "@/components/dashboard/mentor/sidebarDashboardMentor";
import DashboardAffHeader from "@/components/dashboard/mentor/headerDashboardMentor";
import MentorStatCards from "@/components/dashboard/mentor/schedule/mentorStatCardSchedule";
import CalendarSectionMentor from "@/components/dashboard/mentor/schedule/calendarSectionMentor";
import DayEventsSectionMentor from "@/components/dashboard/mentor/schedule/dayEventsSectionMentor";

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

export default function ScheduleDashboardMentorPage() {
  // Definisi event ada di parent
  const events: Record<string, Event[]> = {
    "2025-09-28": [
      {
        type: "mentoring",
        time: "09.15-11.00",
        title: "Mentoring React",
        description: "Bahas state management",
        mentees: [
          {
            name: "Andi Setiawan",
            email: "andi@example.com",
            avatar: "/assets/dashboard/user/avatar.png",
          },
          {
            name: "Budi Santoso",
            email: "budi@example.com",
            avatar: "/assets/dashboard/user/avatar.png",
          },
        ],
        material: "https://example.com/materials/react-state.pdf",
        notes: "Fokus ke useReducer dan Context API.",
        zoomLink: "https://zoom.us/j/123456789",
        meetingId: "123 456 789",
        passcode: "REACT123",
      },
      {
        type: "mentoring",
        time: "13.00-14.30",
        title: "Mentoring Golang",
        description: "Implementasi JWT",
        mentees: [
          { name: "Citra Dewi", email: "citra@example.com" },
          { name: "Dian Pratama", email: "dian@example.com" },
        ],
        material: "https://example.com/materials/golang-jwt.pdf",
        notes: "Implementasi middleware untuk JWT.",
        zoomLink: "https://zoom.us/j/987654321",
        meetingId: "987 654 321",
        passcode: "GOJWT",
      },
    ],
    "2025-09-21": [
      {
        type: "shortclass",
        time: "10.00-12.00",
        title: "Shortclass Next.js",
        description: "Optimasi performa",
        material: "https://example.com/materials/nextjs-performance.pdf",
        notes: "Bahas Image Optimization, ISR, dan caching.",
        zoomLink: "https://zoom.us/j/111222333",
        meetingId: "111 222 333",
        passcode: "NEXT2025",
      },
    ],
    "2025-09-12": [
      {
        type: "bootcamp",
        time: "08.30-16.00",
        title: "Bootcamp Fullstack",
        description: "Frontend + Backend",
        mentees: [
          { name: "Eka Putra", email: "eka@example.com" },
          { name: "Fitriani", email: "fitri@example.com" },
          { name: "Gilang Saputra", email: "gilang@example.com" },
        ],
        material: "https://example.com/materials/fullstack-bootcamp.pdf",
        notes: "Fullstack project: Todo App dengan REST API.",
        zoomLink: "https://zoom.us/j/444555666",
        meetingId: "444 555 666",
        passcode: "FULLSTACK",
      },
    ],
    "2025-09-14": [
      {
        type: "mentoring",
        time: "09.15-11.00",
        title: "Mentoring Design Pattern",
        description: "Bahas clean code",
        mentees: [{ name: "Hendra Wijaya", email: "hendra@example.com" }],
        material: "https://example.com/materials/design-patterns.pdf",
        notes: "Fokus ke Singleton dan Repository Pattern.",
        zoomLink: "https://zoom.us/j/777888999",
        meetingId: "777 888 999",
        passcode: "PATTERN",
      },
      {
        type: "bootcamp",
        time: "13.00-15.00",
        title: "Bootcamp Mobile Dev",
        description: "React Native dasar",
        mentees: [
          { name: "Intan Lestari", email: "intan@example.com" },
          { name: "Joko Anwar", email: "joko@example.com" },
        ],
        material: "https://example.com/materials/mobile-dev.pdf",
        notes: "Build app sederhana dengan React Native CLI.",
        zoomLink: "https://zoom.us/j/222333444",
        meetingId: "222 333 444",
        passcode: "MOBILE",
      },
    ],
    "2025-09-15": [
      {
        type: "shortclass",
        time: "09.00-10.30",
        title: "Shortclass UI/UX",
        description: "Wireframe to Prototype",
        mentees: [
          {
            name: "Citra Dewi",
            email: "citra@example.com",
            avatar: "/assets/dashboard/user/avatar.png",
          },
          {
            name: "Dimas Putra",
            email: "dimas@example.com",
            avatar: "/assets/dashboard/user/avatar.png",
          },
          {
            name: "Rani Kusuma",
            email: "rani@example.com",
            avatar: "/assets/dashboard/user/avatar.png",
          },
        ],
        material: "https://example.com/materials/uiux-wireframe.pdf",
        notes: "Hands-on: buat prototype di Figma.",
        zoomLink: "https://zoom.us/j/555666777",
        meetingId: "555 666 777",
        passcode: "UIUX",
      },
      {
        type: "shortclass",
        time: "14.00-15.30",
        title: "Shortclass Database",
        description: "Optimasi query SQL",
        mentees: [
          {
            name: "Eka Saputra",
            email: "eka@example.com",
            avatar: "/assets/dashboard/user/avatar.png",
          },
          {
            name: "Farah Hidayah",
            email: "farah@example.com",
            avatar: "/assets/dashboard/user/avatar.png",
          },
        ],
        material: "https://example.com/materials/sql-optimization.pdf",
        notes: "Bahas indexing & query plan.",
        zoomLink: "https://zoom.us/j/888999000",
        meetingId: "888 999 000",
        passcode: "SQL2025",
      },
    ],
    "2025-10-10": [
      {
        type: "bootcamp",
        time: "09.30-11.00",
        title: "Bootcamp Fullstack - 2",
        description: "Frontend + Backend",
        mentees: [
          { name: "Eka Putra", email: "eka@example.com" },
          { name: "Fitriani", email: "fitri@example.com" },
          { name: "Gilang Saputra", email: "gilang@example.com" },
        ],
        material: "https://example.com/materials/fullstack-bootcamp.pdf",
        notes: "Fullstack project: Todo App dengan REST API.",
        zoomLink: "https://zoom.us/j/444555666",
        meetingId: "444 555 666",
        passcode: "FULLSTACK",
      },
    ],
    "2025-10-14": [
      {
        type: "bootcamp",
        time: "08.30-10.00",
        title: "Bootcamp Fullstack - 3",
        description: "Frontend + Backend",
        mentees: [
          { name: "Eka Putra", email: "eka@example.com" },
          { name: "Fitriani", email: "fitri@example.com" },
          { name: "Gilang Saputra", email: "gilang@example.com" },
        ],
        material: "https://example.com/materials/fullstack-bootcamp.pdf",
        notes: "Fullstack project: Todo App dengan REST API.",
        zoomLink: "https://zoom.us/j/444555666",
        meetingId: "444 555 666",
        passcode: "FULLSTACK",
      },
    ],
  };

  return (
    <div className="flex mb-8">
      <MentorSidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-72">
        <DashboardAffHeader />

        {/* Main content */}
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          {/* Title & description */}
          <h1 className="text-2xl font-semibold text-gray-800">Schedule</h1>
          <p className="mt-0 mb-8 text-gray-500">
            Halaman ini menampilkan jadwal sesi mentoring, bootcamp, dan
            shortclass Anda, baik yang akan datang maupun yang telah
            berlangsung.
          </p>

          {/* Section: Stat Cards */}
          <div className="max-w-[100%]">
            <MentorStatCards events={events} />
          </div>

          {/* Section: Calendar & Day Events */}
          <div className="p-6 pl-0 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
              {/* Kiri: Kalender */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Kalender Sesi
                </h2>
                {/* Kirim events ke Calendar */}
                <CalendarSectionMentor events={events} />
              </div>

              {/* Kanan: Jadwal Hari Ini */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Jadwal Sesi
                </h2>
                {/* Kirim events ke DayEvents */}
                <DayEventsSectionMentor events={events} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
