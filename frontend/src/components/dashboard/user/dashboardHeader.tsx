"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";

export default function DashboardHeader() {
  return (
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
            width={12} // tetap kecil
            height={12}
          />
          {/* Badge */}
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500"></span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2">
          <Image
            src="/assets/dashboard/user/avatar.png"
            alt="User Avatar"
            width={36}
            height={36}
            className="rounded-full"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800">Lana D</span>
            <span className="text-xs text-gray-500">Mentee</span>
          </div>
          <ChevronDown size={14} className="text-gray-500" />
        </div>
      </div>
    </header>
  );
}
