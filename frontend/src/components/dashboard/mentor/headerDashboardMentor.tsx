"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, User } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import ProfileMentorModal from "./profileMentorModal";

export default function DashboardHeaderMentor() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch user + auto redirect jika token expired
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
          { withCredentials: true },
        );
        setUser(res.data.data);
      } catch (err: any) {
        console.error("Gagal fetch user:", err);

        // kalau token expired (401), redirect ke login
        if (err.response?.status === 401) {
          toast.error("Sesi kamu sudah berakhir, silakan login ulang", {
            duration: 5000,
          });
          router.replace("/"); // balik ke halaman login
        } else {
          setUser(null);
        }
      }
    };

    fetchUser();
  }, [router]);

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
    setOpen(false);
  };

  // avatar fallback jika tidak ada / default.jpg / default.png
  const avatarUrl =
    user?.profilePicture &&
    !["default.jpg", "default.png"].includes(user.profilePicture)
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${user.profilePicture}`
      : "/assets/dashboard/user/avatar.png";

  const fullName = user?.fullName || "Guest";

  const role = user?.userRoles?.[0]?.role?.roleName
    ? user.userRoles[0].role.roleName.replace(/^\w/, (c: string) =>
        c.toUpperCase(),
      )
    : "Mentor";

  return (
    <>
      <header className="flex items-center justify-between h-16 px-6 bg-white">
        {/* Search Bar */}
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Masukkan kata kunci pencarian..."
            className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
          <Image
            src="/assets/dashboard/user/search-icon.svg"
            alt="Search"
            width={14}
            height={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 pr-2">
          {/* Notification */}
          {/* <button className="relative flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white">
            <Image
              src="/assets/dashboard/user/bell-icon.svg"
              alt="Notification"
              width={14}
              height={14}
            />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
          </button> */}

          {/* User Info + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <Image
                src={avatarUrl}
                alt="User Avatar"
                width={32}
                height={32}
                unoptimized
                className="rounded-full object-cover"
              />
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-gray-800">
                  {fullName}
                </span>
                <span className="text-xs text-gray-500">{role}</span>
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-500 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg border border-gray-200 py-1.5 z-50">
                <button
                  onClick={handleOpenProfile}
                  className="flex items-center gap-2 w-full text-left px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                >
                  <User size={14} />
                  Lihat Profil
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ProfileMentorModal open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
