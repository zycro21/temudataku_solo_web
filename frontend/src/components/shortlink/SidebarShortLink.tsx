"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, Link as LinkIcon, Clock } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export default function SidebarShortLink({
  activeMenu,
  setActiveMenu,
}: SidebarProps) {
  const logout = useLogout();

  const menuItems = [
    { name: "Buat Short Link", key: "create", icon: <LinkIcon size={18} /> },
    { name: "Riwayat", key: "history", icon: <Clock size={18} /> },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r flex flex-col justify-between shadow-sm">
      <div>
        {/* Bagian Logo */}
        <div className="pt-6 pb-3 pl-8 flex flex-col items-start">
          <Link href="/dashboard/user">
            <Image
              src="/assets/dashboard/user/Navbar_logo.png"
              alt="Temu Dataku"
              width={100}
              height={100}
              priority
              loading="eager"
              unoptimized
              className="object-contain"
            />
          </Link>
        </div>

        {/* Judul ShortLink */}
        <div className="px-10 pb-4 border-b">
          <h1 className="text-2xl font-bold text-emerald-600 tracking-tight">
            ShortLink
          </h1>
        </div>

        {/* Menu Navigasi */}
        <nav className="mt-5 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveMenu(item.key)}
              className={`flex items-center w-full gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  activeMenu === item.key
                    ? "bg-emerald-500 text-white scale-[1.02]"
                    : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tombol Logout */}
      <div className="p-4 border-t">
        <button
          onClick={() => logout("/shorten-link")}
          className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
