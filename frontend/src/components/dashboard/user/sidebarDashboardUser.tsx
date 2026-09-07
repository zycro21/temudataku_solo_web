"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react"; // 🔥 TAMBAHAN
import { useLogout } from "@/hooks/useLogout";

const menuItems = [
  {
    name: "Overview",
    href: "/dashboard/user",
    icon: "/assets/dashboard/user/overview.svg",
    activeIcon: "/assets/dashboard/user/whiteoverview.svg",
  },
  {
    name: "Jadwal",
    href: "/dashboard/user/jadwal",
    icon: "/assets/dashboard/user/jadwal.svg",
    activeIcon: "/assets/dashboard/user/whitejadwal.svg",
  },
  {
    name: "Feedback",
    href: "/dashboard/user/feedback",
    icon: "/assets/dashboard/user/umpanbalik.svg",
    activeIcon: "/assets/dashboard/user/whiteumpanbalik.svg",
  },
  {
    name: "Sertifikat",
    href: "/dashboard/user/sertifikat",
    icon: "/assets/dashboard/user/sertifikat.svg",
    activeIcon: "/assets/dashboard/user/whitesertifikat.svg",
  },
  {
    name: "Histori Transaksi",
    href: "/dashboard/user/transaction",
    icon: "/assets/dashboard/user/historitransaksi.svg",
    activeIcon: "/assets/dashboard/user/whitehistoritransaksi.svg",
  },
  {
    name: "Acara",
    href: "/dashboard/user/event",
    icon: "/assets/dashboard/user/acara.svg",
    activeIcon: "/assets/dashboard/user/whiteacara.svg",
  },
];

// 🔥 TAMBAHAN: dua prop baru, keduanya OPSIONAL dengan default aman —
// supaya halaman dashboard/user LAIN yang masih render `<Sidebar />` polos
// (belum di-wire kayak page Overview) tetap jalan seperti biasa, cuma
// drawer mobile-nya belum "nyambung" ke tombol hamburger sampai halaman
// itu ikut di-update seperti page.tsx Overview.
interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  isMobileOpen = false,
  onCloseMobile = () => {},
}: SidebarProps) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <>
      {/* 🔥 BARU: overlay gelap di belakang drawer, cuma di mobile
          (md:hidden), muncul begitu sidebar dibuka. Klik di sini = tutup. */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* 🔥 DIUBAH: class dasar (fixed top-0 left-0 h-screen w-64 bg-white
          border-r flex flex-col justify-between) TIDAK diubah sama sekali
          — itu yang bikin tampilan desktop identik seperti sebelumnya.
          Yang ditambah cuma z-50 (biar di atas overlay), transform +
          transisi geser, dan "md:translate-x-0 md:z-auto" yang MEMAKSA
          sidebar selalu kebuka & normal lagi begitu masuk breakpoint
          desktop (md ke atas), apa pun state mobile-nya. */}
      <aside
        className={`fixed top-0 left-0 w-64 h-screen bg-white border-r flex flex-col justify-between z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:z-auto ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top */}
        <div className="mt-2 flex flex-col h-full overflow-hidden">
          {/* Logo */}
          {/* 🔥 DIUBAH: dulu cuma `pl-6 pb-5 pt-3` (block, logo doang) —
              sekarang flex + justify-between buat nampung tombol close di
              mobile. `pr-4 md:pr-0` -> di desktop tetap pr-0 (sama kayak
              semula, nggak ada padding kanan), cuma di mobile dikasih
              pr-4 buat jarak ke tombol close. */}
          <div className="flex items-center justify-between pl-6 pr-4 md:pr-0 pb-5 pt-3">
            <Link href="/dashboard/user" onClick={onCloseMobile}>
              <Image
                src="/assets/dashboard/user/Navbar_logo.png"
                alt="Temu Dataku"
                width={110}
                height={110}
                priority
                unoptimized
              />
            </Link>

            {/* 🔥 BARU: tombol tutup drawer, cuma tampil di mobile */}
            <button
              onClick={onCloseMobile}
              className="md:hidden text-gray-400 hover:text-gray-600"
              aria-label="Tutup menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu */}
          <div className="flex-1 overflow-y-auto px-3 pb-6">
            <nav className="space-y-0.5">
              {menuItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname === item.href + "/";

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onCloseMobile} // 🔥 TAMBAHAN: auto-tutup drawer pas navigasi
                    className={`flex items-center gap-x-3 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-500 text-white"
                        : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                    }`}
                  >
                    <Image
                      src={isActive ? item.activeIcon : item.icon}
                      alt={item.name}
                      width={14}
                      height={14}
                      unoptimized
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 mb-10">
          <button
            onClick={() => {
              onCloseMobile(); // 🔥 TAMBAHAN
              logout("/");
            }}
            className="flex items-center gap-2 px-3 py-1.5 w-full rounded-lg text-[12px] font-medium text-gray-600 hover:bg-red-50 hover:text-red-600"
          >
            <Image
              src="/assets/dashboard/user/logout.svg"
              alt="Logout"
              width={14}
              height={14}
              unoptimized
            />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
