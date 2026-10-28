"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@/hooks/useLogout";

interface Props {
  // "light"   → tampilan di navbar putih (mobile)
  // "onGreen" → tampilan di atas hero hijau (desktop): teks putih
  variant?: "light" | "onGreen";
}

export default function SubchapterProfileMenu({ variant = "light" }: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const profileImage = (() => {
    if (!currentUser?.profilePicture) {
      return "/assets/dashboard/user/avatar.png";
    }
    if (currentUser.profilePicture.startsWith("http")) {
      return currentUser.profilePicture;
    }
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${currentUser.profilePicture}`;
  })();

  const onGreen = variant === "onGreen";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center ${
          onGreen
            ? "gap-2.5 rounded-full bg-[#30BB85] py-1.5 pl-1.5 pr-3.5 ring-1 ring-white/30 transition-colors hover:bg-[#49C393]"
            : "gap-2 rounded-lg px-2 py-1 hover:bg-gray-100"
        }`}
      >
        <Image
          src={profileImage}
          alt="avatar"
          width={onGreen ? 34 : 26}
          height={onGreen ? 34 : 26}
          unoptimized
          className={`rounded-full object-cover ${
            onGreen ? "ring-2 ring-white/70" : ""
          }`}
        />

        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span
            className={`font-semibold truncate ${
              onGreen
                ? "max-w-[140px] text-[13px] text-white"
                : "max-w-[110px] text-xs text-gray-800"
            }`}
          >
            {currentUser?.fullName ?? "Pengguna"}
          </span>
          <span
            className={
              onGreen ? "text-xs text-white/75" : "text-[11px] text-gray-500"
            }
          >
            Mentee
          </span>
        </div>

        <ChevronDown
          size={onGreen ? 14 : 12}
          className={`transition-transform ${
            onGreen ? "text-white/80" : "text-gray-500"
          } ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-md py-1.5 z-50 text-xs text-gray-800">
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
  );
}
