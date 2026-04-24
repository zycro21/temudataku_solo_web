"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLogout } from "@/hooks/useLogout";

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
  // {
  //   name: "Pengumpulan",
  //   href: "/dashboard/user/pengumpulan",
  //   icon: "/assets/dashboard/user/pengumpulan.svg",
  //   activeIcon: "/assets/dashboard/user/whitepengumpulan.svg",
  // },
  {
    name: "Feedback",
    href: "/dashboard/user/feedback",
    icon: "/assets/dashboard/user/umpanbalik.svg",
    activeIcon: "/assets/dashboard/user/whiteumpanbalik.svg",
  },
  // {
  //   name: "Materi",
  //   href: "/dashboard/user/materi",
  //   icon: "/assets/dashboard/user/materi.svg",
  //   activeIcon: "/assets/dashboard/user/whitemateri.svg",
  // },
  {
    name: "Sertifikat",
    href: "/dashboard/user/sertifikat",
    icon: "/assets/dashboard/user/sertifikat.svg",
    activeIcon: "/assets/dashboard/user/whitesertifikat.svg",
  },
  // {
  //   name: "E-Learning",
  //   href: "/dashboard/user/practice",
  //   icon: "/assets/dashboard/user/practice.svg",
  //   activeIcon: "/assets/dashboard/user/whitepractice.svg",
  // },
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
  const logout = useLogout();

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-white border-r flex flex-col justify-between">
      {/* Top */}
      <div className="mt-2 flex flex-col h-full overflow-hidden">
        {/* Logo */}
        <div className="pl-6 pb-5 pt-3">
          <Link href="/dashboard/user">
            <Image
              src="/assets/dashboard/user/Navbar_logo.png"
              alt="Temu Dataku"
              width={110} // 🔽 lebih kecil
              height={110}
              priority
              unoptimized
            />
          </Link>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-3 pb-6">
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href || pathname === item.href + "/";

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-x-3 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-500 text-white"
                      : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                  }`}
                >
                  <Image
                    src={isActive ? item.activeIcon : item.icon}
                    alt={item.name}
                    width={14} // 🔽 dari 18 → 14
                    height={14}
                    unoptimized
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 mb-10">
        <button
          onClick={() => logout("/")}
          className="flex items-center gap-2 px-3 py-1.5 w-full rounded-lg text-[12px] font-medium text-gray-600 hover:bg-red-50 hover:text-red-600"
        >
          <Image
            src="/assets/dashboard/user/logout.svg"
            alt="Logout"
            width={14}
            height={14}
            unoptimized
          />
          Logout
        </button>
      </div>
    </aside>
  );
}
