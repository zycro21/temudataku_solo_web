"use client";

import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface NavItem {
  id: string;
  title: string;
  moduleTitle: string;
}

interface Props {
  prev: NavItem | null;
  next: NavItem | null;
  onNavigate: (sm: any) => void;

  // 🔥 BARU: true kalau `next` sebenarnya ADA tapi masih terkunci
  // (belum boleh diakses — lihat `unlockedTextIds` di
  // SubchapterDetail.tsx). Beda dari `next === null` (memang sudah
  // materi/task TERAKHIR, nggak ada apa-apa lagi setelahnya) — di sini
  // itemnya ADA, cuma belum "gilirannya". Tombol tetap kelihatan tapi
  // di-disable, ikonnya ganti gembok, dan dikasih tooltip penjelasan.
  nextLocked?: boolean;
}

export default function SubchapterFooter({
  prev,
  next,
  onNavigate,
  nextLocked = false,
}: Props) {
  return (
    <footer className="h-14 sm:h-16 shrink-0 bg-[#F8FAFC] border-t border-gray-200 z-50">
      <div className="h-full flex items-center justify-between px-2 sm:px-6 gap-1 sm:gap-2">
        {/* PREV */}
        <Button
          variant="ghost"
          disabled={!prev}
          onClick={() => prev && onNavigate(prev)}
          className="flex items-center gap-1.5 sm:gap-3 text-left disabled:opacity-40 min-w-0 h-auto px-1.5 py-1 sm:h-9 sm:px-4 sm:py-2"
        >
          {/* ICON */}
          <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-emerald-500 shrink-0">
            <svg
              width="11"
              height="11"
              className="sm:w-[14px] sm:h-[14px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </div>

          {/* TEXT */}
          <div className="leading-tight min-w-0">
            <p className="hidden sm:block text-[11px] text-gray-500 truncate">
              {prev?.moduleTitle}
            </p>
            <p className="text-[10px] sm:text-xs font-semibold text-gray-800 truncate max-w-[70px] sm:max-w-[180px]">
              {prev?.title}
            </p>
          </div>
        </Button>

        {/* NEXT */}
        <Button
          variant="ghost"
          disabled={!next || nextLocked}
          onClick={() => next && !nextLocked && onNavigate(next)}
          title={
            next && nextLocked
              ? "Selesaikan materi sebelumnya secara berurutan untuk membuka ini"
              : undefined
          }
          className="flex items-center gap-1.5 sm:gap-3 text-right disabled:opacity-40 min-w-0 h-auto px-1.5 py-1 sm:h-9 sm:px-4 sm:py-2"
        >
          {/* TEXT */}
          <div className="leading-tight min-w-0">
            <p className="hidden sm:block text-[11px] text-gray-500 truncate">
              {next?.moduleTitle}
            </p>
            <p className="text-[10px] sm:text-xs font-semibold text-gray-800 truncate max-w-[70px] sm:max-w-[180px]">
              {next?.title}
            </p>
          </div>

          {/* ICON */}
          <div
            className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border shrink-0 ${
              next && nextLocked ? "border-gray-300" : "border-emerald-500"
            }`}
          >
            {next && nextLocked ? (
              <Lock
                size={11}
                strokeWidth={2.25}
                className="text-gray-400 sm:w-[13px] sm:h-[13px]"
              />
            ) : (
              <svg
                width="11"
                height="11"
                className="sm:w-[14px] sm:h-[14px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </div>
        </Button>
      </div>
    </footer>
  );
}
