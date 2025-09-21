"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    name: "Overview",
    href: "/dashboard/mentor",
    icon: "/assets/dashboard/affiliator/overview.svg",
    activeIcon: "/assets/dashboard/affiliator/overviewwhite.svg",
  },
  {
    name: "Schedule",
    href: "/dashboard/mentor/schedule",
    icon: "/assets/dashboard/mentor/schedule.svg",
    activeIcon: "/assets/dashboard/mentor/schedulewhite.svg",
  },
  {
    name: "Session Services",
    href: "/dashboard/mentor/services",
    icon: "/assets/dashboard/mentor/service.svg",
    activeIcon: "/assets/dashboard/mentor/servicewhite.svg",
  },
  {
    name: "Mentor Report",
    href: "/dashboard/mentor/report",
    icon: "/assets/dashboard/mentor/report.svg",
    activeIcon: "/assets/dashboard/mentor/reportwhite.svg",
  },
  {
    name: "Mentee Feedback",
    href: "/dashboard/mentor/feedback",
    icon: "/assets/dashboard/mentor/feedback.svg",
    activeIcon: "/assets/dashboard/mentor/feedbackwhite.svg",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 w-72 h-screen bg-white border-r flex flex-col justify-between">
      {/* Top - Logo & Menu */}
      <div className="mt-2">
        {/* Logo */}
        <div className="pl-8 pb-8">
          <Link href="/dashboard">
            <Image
              src="/assets/dashboard/user/Navbar_logo.png"
              alt="Temu Dataku"
              width={100}
              height={100}
              priority
            />
          </Link>
        </div>

        {/* Menu List */}
        <nav className="space-y-1 px-6">
          {menuItems.map((item) => {
            const isActive =
              item.href === "/dashboard/mentor"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-x-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-500 text-white"
                    : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                }`}
              >
                <Image
                  src={isActive ? item.activeIcon : item.icon}
                  alt={item.name}
                  width={18}
                  height={18}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="px-6 mb-16 space-y-2">
        <Link
          href="/bantuan"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
        >
          <Image
            src="/assets/dashboard/user/butuhbantuan.svg"
            alt="Bantuan"
            width={18}
            height={18}
          />
          Butuh bantuan?
        </Link>
        <button className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600">
          <Image
            src="/assets/dashboard/user/logout.svg"
            alt="Logout"
            width={18}
            height={18}
          />
          Logout
        </button>
      </div>
    </aside>
  );
}
