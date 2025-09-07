"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    name: "Overview",
    href: "/dashboard/user",
    icon: "/assets/dashboard/user/overview.svg",
    activeIcon: "/assets/dashboard/user/whiteoverview.svg",
  },
  {
    name: "Jadwal",
    href: "/dashboard/user/jadwal",
    icon: "/assets/dashboard/user/jadwal.svg",
    activeIcon: "/assets/dashboard/user/whitejadwal.svg",
  },
  {
    name: "Pengumpulan",
    href: "/dashboard/user/pengumpulan",
    icon: "/assets/dashboard/user/pengumpulan.svg",
    activeIcon: "/assets/dashboard/user/whitepengumpulan.svg",
  },
  {
    name: "Feedback",
    href: "/dashboard/user/feedback",
    icon: "/assets/dashboard/user/umpanbalik.svg",
    activeIcon: "/assets/dashboard/user/whiteumpanbalik.svg",
  },
  {
    name: "Materi",
    href: "/dashboard/user/materi",
    icon: "/assets/dashboard/user/materi.svg",
    activeIcon: "/assets/dashboard/user/whitemateri.svg",
  },
  {
    name: "Sertifikat",
    href: "/dashboard/user/sertifikat",
    icon: "/assets/dashboard/user/sertifikat.svg",
    activeIcon: "/assets/dashboard/user/whitesertifikat.svg",
  },
  {
    name: "Practice",
    href: "/dashboard/user/practice",
    icon: "/assets/dashboard/user/practice.svg",
    activeIcon: "/assets/dashboard/user/whitepractice.svg",
  },
  {
    name: "Histori Transaksi",
    href: "/dashboard/user/transaction",
    icon: "/assets/dashboard/user/historitransaksi.svg",
    activeIcon: "/assets/dashboard/user/whitehistoritransaksi.svg",
  },
  {
    name: "Acara",
    href: "/dashboard/user/event",
    icon: "/assets/dashboard/user/acara.svg",
    activeIcon: "/assets/dashboard/user/whiteacara.svg",
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
            const isActive = pathname === item.href;
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
