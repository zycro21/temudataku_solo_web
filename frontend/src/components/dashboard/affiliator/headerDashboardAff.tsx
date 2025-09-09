"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, User, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
// import ProfileModal from "./profileModal";

export default function DashboardHeaderAffiliator() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenProfile = () => {
    setProfileOpen(true);
    setOpen(false); // auto close dropdown
  };

  return (
    <>
      <header className="flex items-center justify-between h-20 px-6 bg-white">
        {/* Search Bar */}
        <div className="relative w-132">
          <input
            type="text"
            placeholder="Masukkan kata kunci pencarian..."
            className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-11 pr-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
          <Image
            src="/assets/dashboard/user/search-icon.svg"
            alt="Search"
            width={12}
            height={12}
            className="absolute left-4 top-1/2 -translate-y-1/2"
          />
        </div>

        {/* Right - Notification & User Info */}
        <div className="flex items-center gap-6 pr-6">
          {/* Notification */}
          <button className="relative flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 bg-white">
            <Image
              src="/assets/dashboard/user/bell-icon.svg"
              alt="Notification"
              width={12}
              height={12}
            />
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500"></span>
          </button>

          {/* User Info + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <Image
                src="/assets/dashboard/user/avatar.png"
                alt="User Avatar"
                width={36}
                height={36}
                className="rounded-full"
              />
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-gray-800">
                  Lana D
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

            {/* Dropdown Menu */}
            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleOpenProfile}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                >
                  <User size={16} />
                  Lihat Profil
                </button>

                <button
                  onClick={() => router.push("/")}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                >
                  <LayoutDashboard size={16} />
                  Kembali ke Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {/* <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} /> */}
    </>
  );
}
