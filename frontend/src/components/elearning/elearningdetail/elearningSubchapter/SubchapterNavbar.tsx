"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@/hooks/useLogout";

interface Props {
  practiceId: string;
}

export default function SubchapterNavbar({ practiceId }: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🔥 Sama seperti Navbar.tsx (menu utama) — pakai AuthContext & hook
  // logout yang sama, supaya data user & perilaku "Keluar" konsisten di
  // semua navbar, bukan data statis hardcode kayak sebelumnya.
  const { currentUser } = useAuth();
  const logout = useLogout();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 🔥 Sama persis dengan resolveProfileImage di Navbar.tsx — foto profil
  // bisa berupa URL absolute (Google/OAuth) atau nama file relatif yang
  // di-serve dari backend.
  const profileImage = (() => {
    if (!currentUser?.profilePicture) {
      return "/assets/dashboard/user/avatar.png";
    }
    if (currentUser.profilePicture.startsWith("http")) {
      return currentUser.profilePicture;
    }
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${currentUser.profilePicture}`;
  })();

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-4">
      {/* ========== LEFT ========== */}
      <div className="flex items-center gap-3">
        <button className="p-1.5 rounded-md hover:bg-gray-100">
          <Menu size={18} className="text-gray-600" />
        </button>
      </div>

      {/* ========== RIGHT ========== */}
      <div className="flex items-center gap-4">
        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            {/* Avatar (diperkecil) */}
            <Image
              src={profileImage}
              alt="avatar"
              width={26}
              height={26}
              unoptimized
              className="rounded-full object-cover"
            />

            {/* Name & Role */}
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-gray-800 max-w-[110px] truncate">
                {currentUser?.fullName ?? "Pengguna"}
              </span>
              <span className="text-[11px] text-gray-500">Mentee</span>
            </div>

            <ChevronDown
              size={12}
              className={`text-gray-500 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* 🔥 Dropdown — isinya disamakan dengan dropdown profil di
              Navbar.tsx (menu utama/home): link & urutan menu sama persis,
              cuma ukuran teks & ikon dikecilkan supaya proporsional dengan
              navbar subchapter yang lebih ramping (h-14). */}
          {open && (
            <ul className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-md py-1.5 z-50 text-xs">
              <li>
                <Link
                  href="/dashboard/user/"
                  className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100"
                >
                  <Image
                    src="/assets/navbar/profile.svg"
                    alt="Profil"
                    width={10}
                    height={10}
                    className="relative top-[-0.5px]"
                  />
                  Profil Saya
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/user/"
                  className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100"
                >
                  <Image
                    src="/assets/navbar/dashboard.svg"
                    alt="Dashboard"
                    width={10}
                    height={10}
                    className="relative top-[-0.5px]"
                  />
                  Dashboard Saya
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/user/jadwal"
                  className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100"
                >
                  <Image
                    src="/assets/navbar/class.svg"
                    alt="Kelas Saya"
                    width={10}
                    height={10}
                    className="relative top-[-0.5px]"
                  />
                  Kelas Saya
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/user/transaction"
                  className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100"
                >
                  <Image
                    src="/assets/navbar/transaction.svg"
                    alt="Transaksi Saya"
                    width={10}
                    height={10}
                    className="relative top-[-0.5px]"
                  />
                  Transaksi Saya
                </Link>
              </li>
              <li>
                <button
                  onClick={() => logout("/")}
                  className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-red-600 hover:bg-gray-100"
                >
                  <Image
                    src="/assets/navbar/exit.svg"
                    alt="Keluar"
                    width={10}
                    height={10}
                    className="relative top-[-0.5px]"
                  />
                  Keluar
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}
