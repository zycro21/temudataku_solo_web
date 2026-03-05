"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Bell, ChevronDown } from "lucide-react";
import Image from "next/image";

interface Props {
  practiceId: string;
}

export default function SubchapterNavbar({ practiceId }: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      {/* ========== LEFT ========== */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-md hover:bg-gray-100">
          <Menu size={20} className="text-gray-600" />
        </button>
      </div>

      {/* ========== RIGHT ========== */}
      <div className="flex items-center gap-6">
        {/* Notification */}
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell size={18} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            {/* Avatar (diperkecil) */}
            <Image
              src="/assets/dashboard/user/avatar.png"
              alt="avatar"
              width={32}
              height={32}
              className="rounded-full object-cover"
            />

            {/* Name & Role */}
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-sm font-semibold text-gray-800">
                Dimas Putra
              </span>
              <span className="text-xs text-gray-500">Mentee</span>
            </div>

            <ChevronDown
              size={14}
              className={`text-gray-500 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md text-sm z-50">
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100">
                Profil
              </button>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100">
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
