"use client";

import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLogout } from "@/hooks/useLogout";
import { Search, Bell, ChevronDown, User, LayoutDashboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, Fragment, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

type MenuItem =
  | {
      name: string;
      href: string;
      icon: string;
      activeIcon: string;
      hasSubmenu?: false;
    }
  | {
      name: string;
      icon: string;
      activeIcon: string;
      hasSubmenu: true;
      children: {
        name: string;
        href: string;
        icon: string;
        activeIcon: string;
      }[];
    };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const logout = useLogout();
  const { currentUser } = useAuth();

  const roles: string[] =
    currentUser?.userRoles?.map((r: any) => r.role.roleName.toLowerCase()) ||
    [];

  const permissions = {
    admin: [
      "Overview",
      "Mentee",
      "Mentor",
      "Kelola Mentoring",
      "E-Learning",
      "Transaksi",
      "Produk & Event",
      "History",
    ],
    cm: ["Kelola Mentoring", "Produk & Event"],
    curdev: ["Produk & Event", "E-Learning"],
  };

  const allowedMenus = new Set<string>();

  roles.forEach((r) => {
    permissions[r as keyof typeof permissions]?.forEach((menu) => {
      allowedMenus.add(menu);
    });
  });

  const avatarUrl =
    currentUser?.profilePicture && currentUser.profilePicture !== "default.jpg"
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${currentUser.profilePicture}`
      : "/assets/dashboard/user/avatar.png";

  const fullName = currentUser?.fullName || "Guest Admin";

  const role =
    currentUser?.userRoles?.[0]?.role?.roleName?.charAt(0).toUpperCase() +
      currentUser?.userRoles?.[0]?.role?.roleName?.slice(1) || "Admin";

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditAdminOpen, setIsEditAdminOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin/kelola-mentoring")) {
      setOpenDropdown("Kelola Mentoring");
    }
  }, [pathname]);

  const adminMenu: MenuItem[] = [
    {
      name: "Overview",
      href: "/admin",
      icon: "/assets/dashboard/user/overview.svg",
      activeIcon: "/assets/dashboard/user/whiteoverview.svg",
    },
    {
      name: "Mentee",
      href: "/admin/mentee",
      icon: "/assets/admin/mentee.svg",
      activeIcon: "/assets/admin/white_mentee.svg",
    },
    {
      name: "Mentor",
      href: "/admin/mentor",
      icon: "/assets/dashboard/mentor/report.svg",
      activeIcon: "/assets/dashboard/mentor/reportwhite.svg",
    },

    {
      name: "Kelola Mentoring",
      icon: "/assets/dashboard/user/materi.svg",
      activeIcon: "/assets/dashboard/user/whitemateri.svg",
      hasSubmenu: true,
      children: [
        {
          name: "Jadwal Sesi",
          href: "/admin/kelola-mentoring",
          icon: "/assets/dashboard/user/jadwal.svg",
          activeIcon: "/assets/dashboard/user/whitejadwal.svg",
        },
        {
          name: "Project",
          href: "/admin/kelola-mentoring/project",
          icon: "/assets/admin/tugas.svg",
          activeIcon: "/assets/admin/whitetugas.svg",
        },
        {
          name: "Sertifikat",
          href: "/admin/kelola-mentoring/sertifikat",
          icon: "/assets/admin/se.svg",
          activeIcon: "/assets/admin/whitese.svg",
        },
        {
          name: "Feedback Mentor",
          href: "/admin/kelola-mentoring/feedback-mentor",
          icon: "/assets/dashboard/mentor/report.svg",
          activeIcon: "/assets/dashboard/mentor/reportwhite.svg",
        },
        {
          name: "Feedback Mentee",
          href: "/admin/kelola-mentoring/feedback-mentee",
          icon: "/assets/admin/mentee.svg",
          activeIcon: "/assets/admin/white_mentee.svg",
        },
      ],
    },

    // {
    //   name: "Kelola Practice",
    //   href: "/admin/kelola-practice",
    //   icon: "/assets/dashboard/user/materi.svg",
    //   activeIcon: "/assets/dashboard/user/whitemateri.svg",
    // },
    {
      name: "E-Learning",
      href: "/dashboard/user/practice",
      icon: "/assets/dashboard/user/practice.svg",
      activeIcon: "/assets/dashboard/user/whitepractice.svg",
    },
    {
      name: "Transaksi",
      href: "/admin/transaksi",
      icon: "/assets/admin/trans.svg",
      activeIcon: "/assets/admin/whitetrans.svg",
    },
    {
      name: "Produk & Event",
      href: "/admin/produk-event",
      icon: "/assets/admin/pro.svg",
      activeIcon: "/assets/admin/whitepro.svg",
    },

    {
      name: "History",
      icon: "/assets/admin/hissec.svg",
      activeIcon: "/assets/admin/hissec.svg",
      hasSubmenu: true,
      children: [
        {
          name: "History",
          href: "/admin/history",
          icon: "/assets/admin/his.svg",
          activeIcon: "/assets/admin/whitehis.svg",
        },
        // {
        //   name: "Security",
        //   href: "/admin/security",
        //   icon: "/assets/admin/sec.svg",
        //   activeIcon: "/assets/admin/whitesec.svg",
        // },
      ],
    },
  ];

  const [currentAdmin, setCurrentAdmin] = useState<{
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    avatarUrl?: string;
    isActive: boolean;
  } | null>(null);

  useEffect(() => {
    if (isProfileOpen) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
        })
        .then((res) => {
          const user = res.data.data;

          setCurrentAdmin({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phoneNumber || "-",
            role:
              user.userRoles?.[0]?.role?.roleName?.charAt(0).toUpperCase() +
                user.userRoles?.[0]?.role?.roleName?.slice(1) || "Admin",
            avatarUrl:
              user.profilePicture && user.profilePicture !== "default.jpg"
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${user.profilePicture}`
                : "/assets/dashboard/user/avatar.png",
            isActive: user.isActive,
          });
        })
        .catch(() => {
          setCurrentAdmin(null);
        });
    }
  }, [isProfileOpen]);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [preview, setPreview] = useState("/default-avatar.png");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load data awal saat modal edit dibuka
  useEffect(() => {
    if (isEditAdminOpen && currentAdmin) {
      setEmail(currentAdmin.email);
      setPhone(currentAdmin.phone);
      setPreview(currentAdmin.avatarUrl || "/default-avatar.png");
    }
  }, [isEditAdminOpen, currentAdmin]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = async () => {
    if (!currentAdmin) return;

    try {
      setSaving(true);

      const toastId = toast.loading("Menyimpan perubahan...");

      const formData = new FormData();

      if (email && email !== currentAdmin.email) {
        formData.append("email", email);
      }

      if (phone && phone !== currentAdmin.phone) {
        formData.append("phoneNumber", phone);
      }

      if (selectedFile) {
        formData.append("profilePicture", selectedFile);
      }

      // kalau tidak ada perubahan sama sekali
      if (Array.from(formData.keys()).length === 0) {
        toast.dismiss(toastId);
        toast.info("Tidak ada perubahan yang disimpan");
        setSaving(false);
        return;
      }

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/update`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.data.success) {
        toast.success("Profil berhasil diperbarui!", { id: toastId });

        setCurrentAdmin((prev) =>
          prev
            ? {
                ...prev,
                email: email || prev.email,
                phone: phone || prev.phone,
                avatarUrl: selectedFile ? preview : prev.avatarUrl,
              }
            : prev,
        );

        setIsEditAdminOpen(false);
      } else {
        toast.error(res.data.message || "Gagal memperbarui profil", {
          id: toastId,
        });
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Terjadi kesalahan saat memperbarui profil",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="fixed top-0 left-0 w-72 h-screen bg-white border-r flex flex-col justify-between z-50">
          <div className="mt-2">
            <div className="pl-8 pb-8 pt-4">
              <Link href="/admin">
                <Image
                  src="/assets/dashboard/user/Navbar_logo.png"
                  alt="Temu Dataku"
                  width={100}
                  height={100}
                  priority
                  unoptimized
                />
              </Link>
            </div>

            {/* MENU */}
            <nav className="space-y-1 px-6">
              {adminMenu
                .filter((item) => {
                  const alwaysAllowed = ["Overview"];

                  // ADMIN boleh lihat semua menu
                  if (roles.includes("admin")) return true;

                  if (alwaysAllowed.includes(item.name)) return true;

                  return allowedMenus.has(item.name);
                })
                .map((item) => {
                  const isActive =
                    !item.hasSubmenu &&
                    (pathname === item.href || pathname === item.href + "/");

                  return (
                    <Fragment key={item.name}>
                      {/* ----- MENU TANPA SUBMENU ----- */}
                      {!item.hasSubmenu ? (
                        <Link
                          href={item.href}
                          className={`flex items-center gap-x-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
                            isActive
                              ? "bg-emerald-500 text-white"
                              : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                          }`}
                        >
                          <Image
                            src={isActive ? item.activeIcon : item.icon}
                            alt={item.name}
                            width={18}
                            height={18}
                            unoptimized
                          />
                          <span>{item.name}</span>
                        </Link>
                      ) : (
                        /* ----- MENU PARENT (PUNYA SUBMENU) ----- */
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === item.name ? null : item.name,
                            )
                          }
                          className={`flex items-center justify-between w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            openDropdown === item.name
                              ? "bg-emerald-50 text-emerald-700"
                              : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                          }`}
                        >
                          <div className="flex items-center gap-x-4">
                            <Image
                              src={item.icon}
                              alt={item.name}
                              width={18}
                              height={18}
                              unoptimized
                            />
                            <span>{item.name}</span>
                          </div>

                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              openDropdown === item.name ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}

                      {/* ----- SUBMENU ----- */}
                      {item.hasSubmenu && openDropdown === item.name && (
                        <div className="ml-10 mt-1 space-y-1">
                          {item.children.map((child) => {
                            const isChildActive = pathname === child.href;

                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isChildActive
                                    ? "bg-emerald-500 text-white"
                                    : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                                }`}
                              >
                                <Image
                                  src={
                                    isChildActive
                                      ? child.activeIcon
                                      : child.icon
                                  }
                                  alt={child.name}
                                  width={14}
                                  height={14}
                                  unoptimized
                                />
                                <span>{child.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </Fragment>
                  );
                })}
            </nav>
          </div>

          {/* FOOTER */}
          <div className="px-6 mb-16 space-y-2">
            <Link
              href="/admin/bantuan"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
            >
              <Image
                src="/assets/dashboard/user/butuhbantuan.svg"
                alt="Bantuan"
                width={18}
                height={18}
              />
              Butuh bantuan?
            </Link>

            <button
              onClick={() => logout("/")}
              className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600"
            >
              <Image
                src="/assets/dashboard/user/logout.svg"
                alt="Logout"
                width={18}
                height={18}
              />
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col ml-72">
          {/* HEADER BARU – mengikuti struktur contoh */}
          <header className="flex items-center justify-between h-20 px-6 bg-white relative">
            {/* Search Bar */}
            <div className="relative w-96">
              <input
                type="text"
                placeholder="Masukkan kata kunci pencarian..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            {/* Right Section: Notification + User */}
            <div className="flex items-center gap-6 pr-2">
              {/* Notification */}
              <button className="relative flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 bg-white">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500" />
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "user-menu" ? null : "user-menu",
                    )
                  }
                  className="flex items-center gap-2 focus:outline-none"
                >
                  {/* Avatar dalam lingkaran hitam */}
                  <div className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  {/* Nama + Role */}
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium text-gray-800">
                      {fullName}
                    </span>
                    <span className="text-xs text-gray-500">{role}</span>
                  </div>

                  <ChevronDown
                    size={14}
                    className={`text-gray-500 transition-transform ${
                      openDropdown === "user-menu" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {openDropdown === "user-menu" && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setOpenDropdown(null);
                        setIsProfileOpen(true);
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      Lihat Profil
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent
          className="sm:max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header */}
          <DialogHeader className="flex justify-between items-start">
            <DialogTitle>Detail Admin</DialogTitle>
            <DialogClose />
          </DialogHeader>

          <div className="border-b border-gray-200 my-1" />

          {/* Foto Admin */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Foto Admin</p>

            <div className="w-full h-[220px] rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image
                src={currentAdmin?.avatarUrl || "/default-avatar.png"}
                alt="Foto Admin"
                width={400}
                height={250}
                unoptimized
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Detail Admin */}
          <div className="grid grid-cols-2 gap-6 text-sm mt-6">
            {/* Kiri */}
            <div className="space-y-6">
              <div>
                <p className="font-medium text-gray-600">ID Admin</p>
                <p className="font-semibold">{currentAdmin?.id || "-"}</p>
              </div>

              <div>
                <p className="font-medium text-gray-600">No Telepon</p>
                <p className="font-semibold">{currentAdmin?.phone || "-"}</p>
              </div>

              <div>
                <p className="font-medium text-gray-600">Peran</p>
                <p className="font-semibold">{currentAdmin?.role || "Admin"}</p>
              </div>
            </div>

            {/* Kanan */}
            <div className="space-y-6">
              <div>
                <p className="font-medium text-gray-600">Nama Lengkap</p>
                <p className="font-semibold">{currentAdmin?.fullName || "-"}</p>
              </div>

              <div>
                <p className="font-medium text-gray-600">Email</p>
                <p className="font-semibold">{currentAdmin?.email || "-"}</p>
              </div>

              <div>
                <p className="font-medium text-gray-600">Status Akun</p>
                <p className="font-semibold">
                  {currentAdmin?.isActive ? "Aktif" : "Tidak Aktif"}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6">
            <Button
              onClick={() => {
                setIsProfileOpen(false); // tutup modal profile
                setIsEditAdminOpen(true); // buka modal edit
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Edit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditAdminOpen} onOpenChange={setIsEditAdminOpen}>
        <DialogContent
          className="sm:max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex justify-between items-start">
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogClose />
          </DialogHeader>

          <div className="border-b border-gray-200 my-1" />

          {/* FOTO ADMIN */}
          <div>
            <p className="text-base font-bold text-gray-800 mb-2 ml-1">
              Foto Admin
            </p>
            <div className="flex items-center gap-4">
              <div className="w-[80px] h-[80px] rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={preview}
                  alt="Foto Admin"
                  width={80}
                  height={80}
                  unoptimized
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={saving}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Unggah Foto
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setPreview("/default-avatar.png")}
                  >
                    Hapus
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  File png atau jpg maks 4MB
                </p>
              </div>
            </div>

            <input
              type="file"
              accept="image/png,image/jpeg"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* FORM */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="col-span-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <input
                type="text"
                disabled
                value={currentAdmin?.fullName}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium">Nomor Telepon</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Peran</label>
              <input
                type="text"
                disabled
                value={currentAdmin?.role}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Status Akun</label>
              <input
                type="text"
                disabled
                value={currentAdmin?.isActive ? "Aktif" : "Tidak Aktif"}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex gap-4 mt-6 justify-center">
            <Button
              variant="outline"
              className="flex-1 max-w-[200px] border-emerald-500 text-emerald-500 hover:bg-emerald-50"
              onClick={() => setIsEditAdminOpen(false)}
            >
              Batalkan Perubahan
            </Button>

            <Button
              disabled={saving}
              className="flex-1 max-w-[200px] bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSaveEdit}
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
