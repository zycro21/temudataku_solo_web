"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, User } from "lucide-react";
import { useRouter } from "next/navigation";
import AffiliatorModal from "./affiliatorModal";
import axios from "axios";
import { toast } from "sonner";

interface UserData {
  id: string;
  fullName?: string | null;
  profilePicture?: string | null;
  userRoles?: { role: { roleName: string } }[];
}

export default function DashboardHeaderAffiliator() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
          { withCredentials: true },
        );
        setUser(res.data.data);
      } catch (err: any) {
        console.error("Gagal ambil data user:", err);
        if (err.response?.status === 401) {
          toast.error("Harap login dengan akun Affiliator terlebih dahulu", {
            duration: 10000,
          });
          router.replace("/affiliator/login");
        } else {
          setUser(null);
        }
      }
    };
    fetchUser();
  }, [router]);

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

  const displayName = user?.fullName || "Guest Affiliator";
  const displayRole =
    user?.userRoles?.map((ur) => ur.role.roleName).join(", ") || "Affiliator";

  const isExternalUrl = (url: string) =>
    url.startsWith("http://") || url.startsWith("https://");

  const displayAvatar =
    user?.profilePicture && user.profilePicture !== "default.jpg"
      ? isExternalUrl(user.profilePicture)
        ? user.profilePicture
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${user.profilePicture}`
      : "/assets/dashboard/user/default-avatar.svg";

  return (
    <>
      <header className="flex items-center justify-between h-14 px-5 bg-white border-b border-gray-100">
        {/* Search Bar */}
        <div className="relative w-80">
          <input
            type="text"
            placeholder="Masukkan kata kunci pencarian..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 py-1.5 text-xs focus:border-emerald-500 focus:ring-emerald-500"
          />
          <Image
            src="/assets/dashboard/user/search-icon.svg"
            alt="Search"
            width={11}
            height={11}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 pr-4">
          {/* Notification */}
          <button className="relative flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white">
            <Image
              src="/assets/dashboard/user/bell-icon.svg"
              alt="Notification"
              width={13}
              height={13}
            />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* User Info + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <Image
                src={displayAvatar}
                alt="User Avatar"
                width={28}
                height={28}
                className="rounded-full object-cover"
                unoptimized
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-gray-800 leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-gray-500">{displayRole}</span>
              </div>
              <ChevronDown
                size={12}
                className={`text-gray-500 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 py-1.5 z-50">
                <button
                  onClick={handleOpenProfile}
                  className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                >
                  <User size={13} />
                  Lihat Profil
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AffiliatorModal open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
