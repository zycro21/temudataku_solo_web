"use client";

import { Menu } from "lucide-react";
import SubchapterProfileMenu from "./SubchapterProfileMenu";

interface Props {
  practiceId: string;
  // Dipanggil saat tombol hamburger di-klik — dipakai SubchapterDetail.tsx
  // buat membuka drawer SubchapterSidebar di mobile/tablet.
  onMenuClick?: () => void;
  // true → navbar putih tetap tampil di desktop juga. Dipakai saat hero hijau
  // tidak dirender (mis. mode sertifikat), supaya profil tetap bisa diakses.
  showOnDesktop?: boolean;
}

export default function SubchapterNavbar({
  practiceId,
  onMenuClick,
  showOnDesktop = false,
}: Props) {
  return (
    // 🔥 Di desktop navbar putih ini dihilangkan (lg:hidden), profil pindah ke
    // hero hijau (lihat SubchapterHeroNavigation.tsx) — kecuali showOnDesktop.
    // Di mobile/tablet tampilan tetap seperti semula.
    <header
      className={`h-14 bg-white border-b flex items-center justify-between px-4 ${
        showOnDesktop ? "" : "lg:hidden"
      }`}
    >
      {/* ========== LEFT ========== */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Buka menu materi"
          className="p-1.5 rounded-md hover:bg-gray-100 lg:hidden"
        >
          <Menu size={18} className="text-gray-600" />
        </button>
      </div>

      {/* ========== RIGHT ========== */}
      <div className="flex items-center gap-4">
        <SubchapterProfileMenu />
      </div>
    </header>
  );
}
