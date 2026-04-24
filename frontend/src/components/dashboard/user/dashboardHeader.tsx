"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, User, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import ProfileModal from "./profileModal";
import { useAuth } from "@/context/AuthContext";

export default function DashboardHeader() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { currentUser } = useAuth();

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
    setOpen(false);
  };

  const avatarUrl = (() => {
    if (!currentUser?.profilePicture) {
      return "/assets/dashboard/user/avatar.png";
    }

    if (currentUser.profilePicture.startsWith("http")) {
      return currentUser.profilePicture;
    }

    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${currentUser.profilePicture}`;
  })();

  const isExternalImage =
    avatarUrl.startsWith("http") || avatarUrl.startsWith("https");

  const fullName = currentUser?.fullName || "Guest";
  const roles =
    currentUser?.userRoles
      ?.map(
        (r: any) =>
          r.role.roleName.charAt(0).toUpperCase() + r.role.roleName.slice(1),
      )
      .join(", ") || "User";

  return (
    <>
      <header className="flex items-center justify-between h-14 px-5 bg-white border-b">
        {/* Search Bar */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Masukkan kata kunci pencarian..."
            className="w-full rounded-md border border-gray-300 bg-gray-50 pl-8 pr-3 py-1 text-[11px] focus:border-emerald-500 focus:ring-emerald-500"
          />
          <Image
            src="/assets/dashboard/user/search-icon.svg"
            alt="Search"
            width={9}
            height={9}
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
          />
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 pr-4">
          {/* Notification */}
          <button className="relative flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white">
            <Image
              src="/assets/dashboard/user/bell-icon.svg"
              alt="Notification"
              width={10}
              height={10}
            />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* User */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2"
            >
              <Image
                src={avatarUrl}
                alt="User Avatar"
                width={30}
                height={30}
                unoptimized
                className="rounded-full object-cover"
              />

              <div className="flex flex-col text-left leading-tight">
                <span className="text-[12px] font-medium text-gray-800">
                  {fullName}
                </span>
                <span className="text-[10px] text-gray-500">{roles}</span>
              </div>

              <ChevronDown
                size={12}
                className={`text-gray-500 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-md shadow-md border border-gray-200 py-1.5 z-50">
                <button
                  onClick={handleOpenProfile}
                  className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-emerald-500 hover:text-white transition"
                >
                  <User size={14} />
                  Lihat Profil
                </button>

                <button
                  onClick={() => router.push("/")}
                  className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-emerald-500 hover:text-white transition"
                >
                  <LayoutDashboard size={14} />
                  Kembali ke Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
