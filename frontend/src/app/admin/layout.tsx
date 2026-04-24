"use client";

import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams } from "next/navigation";
import { useLogout } from "@/hooks/useLogout";
import { Search, Bell, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, Fragment, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import {
  streams,
  coursesByStream,
  modulesByCourse,
} from "@/data/elearningData";

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

// ─── Routes yang tidak perlu sidebar + navbar admin ───────────────────────────
const FULLSCREEN_ROUTES = [/\/materials\/create$/];

function isFullscreenRoute(pathname: string): boolean {
  return FULLSCREEN_ROUTES.some((pattern) => pattern.test(pathname));
}

function BreadcrumbNav({ pathname }: { pathname: string }) {
  const modulesMatch = pathname.match(
    /\/streams\/([^/]+)\/courses\/([^/]+)\/modules$/,
  );
  const coursesMatch = pathname.match(/\/streams\/([^/]+)\/courses$/);
  const materialsMatch = pathname.match(
    /\/streams\/([^/]+)\/courses\/([^/]+)\/modules\/([^/]+)\/materials$/,
  );

  const params = useParams();
  const streamId = params?.streamId as string;
  const courseId = params?.courseId as string;

  const [streamName, setStreamName] = useState("Loading...");
  const [courseName, setCourseName] = useState("Loading...");
  const [fetchedStreamName, setFetchedStreamName] = useState<string>("");
  const [matStreamName, setMatStreamName] = useState<string>("");
  const [matCourseName, setMatCourseName] = useState<string>("");
  const [matModuleName, setMatModuleName] = useState<string>("");

  useEffect(() => {
    if (!streamId || !coursesMatch) return;
    const fetchStream = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses/${streamId}`,
          { withCredentials: true },
        );
        if (res.data.success) {
          setFetchedStreamName(res.data.data.title);
        }
      } catch (err) {
        console.error("Gagal fetch stream di layout:", err);
      }
    };
    fetchStream();
  }, [streamId, !!coursesMatch]);

  useEffect(() => {
    if (!modulesMatch) return;

    const fetchStreamAndCourse = async () => {
      try {
        const resStream = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses/${streamId}`,
          { withCredentials: true },
        );
        if (resStream.data.success) {
          setStreamName(resStream.data.data.title);
        }

        const resCourse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubChapter/courses/${streamId}/subchapters`,
          { withCredentials: true },
        );
        const subChapters = resCourse.data.data?.subChapters ?? [];
        const found = subChapters.find((sc: any) => sc.id === courseId);
        if (found) {
          setCourseName(found.title);
        } else {
          setCourseName("Unknown Course");
        }
      } catch (err) {
        console.error("Navbar fetch error:", err);
      }
    };

    if (streamId && courseId) {
      fetchStreamAndCourse();
    }
  }, [streamId, courseId, !!modulesMatch]);

  useEffect(() => {
    if (!materialsMatch) return;

    const streamId = materialsMatch[1];
    const courseId = materialsMatch[2];
    const moduleId = materialsMatch[3];

    const fetchMatStream = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses`,
          { withCredentials: true, params: { limit: 10000 } },
        );
        const list = res.data.data ?? [];
        const found = list.find((c: any) => c.id === streamId);
        setMatStreamName(found?.title ?? "Stream");
      } catch {
        setMatStreamName("Stream");
      }
    };

    const fetchMatCourse = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubChapter/courses/${streamId}/subchapters`,
          { withCredentials: true },
        );
        const subChapters = res.data.data?.subChapters ?? [];
        const found = subChapters.find((sc: any) => sc.id === courseId);
        setMatCourseName(found?.title ?? "Course");
      } catch {
        setMatCourseName("Course");
      }
    };

    const fetchMatModule = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubBab/subchapters/${courseId}/subbabs`,
          { withCredentials: true, params: { limit: 10000 } },
        );
        const subBabs = res.data.data?.subBabs ?? [];
        const found = subBabs.find((sb: any) => sb.id === moduleId);
        setMatModuleName(found?.title ?? "Module");
      } catch {
        setMatModuleName("Module");
      }
    };

    fetchMatStream();
    fetchMatCourse();
    fetchMatModule();
  }, [materialsMatch?.[1], materialsMatch?.[2], materialsMatch?.[3]]);

  // ── Sep SVG helper ────────────────────────────────────────────────────────
  const Sep = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 14 14"
      fill="none"
      className="text-gray-400 shrink-0"
    >
      <path
        d="M5 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // ── Hamburger icon ────────────────────────────────────────────────────────
  const HamburgerBtn = () => (
    <button className="p-0.5 rounded hover:bg-gray-100 text-gray-400 mr-1 shrink-0">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect y="2" width="16" height="1.5" rx="0.75" fill="currentColor" />
        <rect y="7.25" width="16" height="1.5" rx="0.75" fill="currentColor" />
        <rect y="12.5" width="16" height="1.5" rx="0.75" fill="currentColor" />
      </svg>
    </button>
  );

  if (modulesMatch) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <HamburgerBtn />
        <span className="font-medium text-gray-500 text-sm">{streamName}</span>
        <Sep />
        <span className="font-medium text-gray-500 text-sm">{courseName}</span>
        <Sep />
        <span className="font-bold text-gray-700">Modules</span>
      </div>
    );
  }

  if (coursesMatch) {
    const name = fetchedStreamName || "Stream";
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <HamburgerBtn />
        <span className="font-medium text-gray-500 text-sm">{name}</span>
        <Sep />
        <span className="font-bold text-gray-700">Courses</span>
      </div>
    );
  }

  if (materialsMatch) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <HamburgerBtn />
        <span
          className="font-medium text-gray-400 text-sm truncate max-w-[120px]"
          title={matStreamName}
        >
          {matStreamName || "..."}
        </span>
        <Sep />
        <span
          className="font-medium text-gray-500 text-sm truncate max-w-[140px]"
          title={matCourseName}
        >
          {matCourseName || "..."}
        </span>
        <Sep />
        <span
          className="font-medium text-gray-500 text-sm truncate max-w-[140px]"
          title={matModuleName}
        >
          {matModuleName || "..."}
        </span>
        <Sep />
        <span className="font-bold text-gray-700 shrink-0">Materials</span>
      </div>
    );
  }

  return null;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const logout = useLogout();
  const { currentUser } = useAuth();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditAdminOpen, setIsEditAdminOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<{
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    avatarUrl?: string;
    isActive: boolean;
  } | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preview, setPreview] = useState("/default-avatar.png");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin/kelola-mentoring")) {
      setOpenDropdown("Kelola Mentoring");
    }
  }, [pathname]);

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
        .catch(() => setCurrentAdmin(null));
    }
  }, [isProfileOpen]);

  useEffect(() => {
    if (isEditAdminOpen && currentAdmin) {
      setEmail(currentAdmin.email);
      setPhone(currentAdmin.phone);
      setPreview(currentAdmin.avatarUrl || "/default-avatar.png");
    }
  }, [isEditAdminOpen, currentAdmin]);

  const roles: string[] =
    currentUser?.userRoles?.map((r: any) => r.role.roleName.toLowerCase()) ||
    [];

  const isBreadcrumbPage =
    /\/admin\/elearning\/streams\/[^/]+\/courses$/.test(pathname) ||
    /\/admin\/elearning\/streams\/[^/]+\/courses\/[^/]+\/modules$/.test(
      pathname,
    ) ||
    /\/admin\/elearning\/streams\/[^/]+\/courses\/[^/]+\/modules\/[^/]+\/materials$/.test(
      pathname,
    );

  const permissions: Record<string, string[]> = {
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
    permissions[r]?.forEach((menu) => allowedMenus.add(menu));
  });

  const avatarUrl =
    currentUser?.profilePicture && currentUser.profilePicture !== "default.jpg"
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${currentUser.profilePicture}`
      : "/assets/dashboard/user/avatar.png";

  const fullName = currentUser?.fullName || "Guest Admin";
  const role =
    currentUser?.userRoles?.[0]?.role?.roleName?.charAt(0).toUpperCase() +
      currentUser?.userRoles?.[0]?.role?.roleName?.slice(1) || "Admin";

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
    //   name: "E-Learning",
    //   href: "/admin/elearning",
    //   icon: "/assets/dashboard/user/practice.svg",
    //   activeIcon: "/assets/dashboard/user/whitepractice.svg",
    // },
    {
      name: "AYCL",
      icon: "/assets/admin/pro.svg",
      activeIcon: "/assets/admin/whitepro.svg",
      hasSubmenu: true,
      children: [
        {
          name: "All You Can Learn",
          href: "/admin/aycl",
          icon: "/assets/admin/pro.svg",
          activeIcon: "/assets/admin/whitepro.svg",
        },
        {
          name: "Data Mentee AYCL",
          href: "/admin/aycl/mentee",
          icon: "/assets/admin/mentee.svg",
          activeIcon: "/assets/admin/white_mentee.svg",
        },
      ],
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
      ],
    },
  ];

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
      if (email && email !== currentAdmin.email)
        formData.append("email", email);
      if (phone && phone !== currentAdmin.phone)
        formData.append("phoneNumber", phone);
      if (selectedFile) formData.append("profilePicture", selectedFile);
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
          headers: { "Content-Type": "multipart/form-data" },
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
      toast.error(
        err.response?.data?.message ||
          "Terjadi kesalahan saat memperbarui profil",
      );
    } finally {
      setSaving(false);
    }
  };

  if (isFullscreenRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="fixed top-0 left-0 w-64 h-screen bg-white border-r flex flex-col justify-between z-50">
          <div className="mt-2 flex flex-col h-full overflow-hidden">
            {/* Logo */}
            <div className="pl-6 pb-6 pt-3">
              <Link href="/admin">
                <Image
                  src="/assets/dashboard/user/Navbar_logo.png"
                  alt="Temu Dataku"
                  width={120}
                  height={120}
                  priority
                  unoptimized
                />
              </Link>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto px-3 pb-6">
              <nav className="space-y-0.5">
                {adminMenu
                  .filter((item) => {
                    if (roles.includes("admin")) return true;
                    if (["Overview"].includes(item.name)) return true;
                    return allowedMenus.has(item.name);
                  })
                  .map((item) => {
                    const isActive =
                      !item.hasSubmenu &&
                      (pathname === item.href || pathname === item.href + "/");
                    return (
                      <Fragment key={item.name}>
                        {!item.hasSubmenu ? (
                          <Link
                            href={item.href}
                            className={`flex items-center gap-x-3 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors w-full ${
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
                        ) : (
                          <button
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === item.name ? null : item.name,
                              )
                            }
                            className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                              openDropdown === item.name
                                ? "bg-emerald-50 text-emerald-700"
                                : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                            }`}
                          >
                            <div className="flex items-center gap-x-3">
                              <Image
                                src={item.icon}
                                alt={item.name}
                                width={14}
                                height={14}
                                unoptimized
                              />
                              <span>{item.name}</span>
                            </div>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform ${
                                openDropdown === item.name ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}

                        {item.hasSubmenu && openDropdown === item.name && (
                          <div className="ml-8 mt-0.5 space-y-0.5">
                            {item.children.map((child) => {
                              const isChildActive = pathname === child.href;
                              return (
                                <Link
                                  key={child.name}
                                  href={child.href}
                                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[9px] font-medium transition-colors ${
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
                                    width={11}
                                    height={11}
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
          </div>

          {/* Bottom: Logout */}
          <div className="px-4 mb-10 space-y-1">
            <button
              onClick={() => logout("/")}
              className="flex items-center gap-2 px-3 py-1.5 w-full rounded-lg text-[11px] font-medium text-gray-600 hover:bg-red-50 hover:text-red-600"
            >
              <Image
                src="/assets/dashboard/user/logout.svg"
                alt="Logout"
                width={16}
                height={16}
              />
              Logout
            </button>
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col ml-64">
          {/* Top Header */}
          <header className="flex items-center justify-between h-14 px-3 bg-white border-b">
            {/* Kiri: search atau breadcrumb */}
            {isBreadcrumbPage ? (
              <BreadcrumbNav pathname={pathname} />
            ) : (
              <div className="relative w-76">
                <input
                  type="text"
                  placeholder="Masukkan kata kunci pencarian..."
                  className="w-full rounded-md border border-gray-300 bg-gray-50 pl-7 pr-2.5 py-1 text-[11px] focus:border-emerald-500 focus:ring-emerald-500"
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              </div>
            )}

            {/* Kanan: Bell + Avatar */}
            <div className="flex items-center gap-4 pr-1">
              <button className="relative flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white">
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
              </button>

              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "user-menu" ? null : "user-menu",
                    )
                  }
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="!text-[9px] font-medium text-gray-800">
                      {fullName}
                    </span>
                    <span className="!text-[8px] text-gray-500">{role}</span>
                  </div>
                  <ChevronDown
                    size={11}
                    className={`text-gray-500 transition-transform ${
                      openDropdown === "user-menu" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === "user-menu" && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setOpenDropdown(null);
                        setIsProfileOpen(true);
                      }}
                      className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      Lihat Profil
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 p-4">{children}</main>
        </div>
      </div>

      {/* ── Profile Dialog ───────────────────────────────────────────────── */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent
          className="sm:max-w-lg"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex justify-between items-start">
            <DialogTitle>Detail Admin</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="border-b border-gray-200 my-1" />
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Foto Admin</p>
            <div className="w-full h-[180px] rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image
                src={currentAdmin?.avatarUrl || "/default-avatar.png"}
                alt="Foto Admin"
                width={400}
                height={180}
                unoptimized
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          <div className="mt-4 max-h-[200px] overflow-y-auto pr-1 scroll-thin">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-gray-500">
                    ID Admin
                  </p>
                  <p className="text-[11px] font-semibold text-gray-800 break-words">
                    {currentAdmin?.id || "-"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-gray-500">
                    No Telepon
                  </p>
                  <p className="text-[11px] font-semibold text-gray-800 break-words">
                    {currentAdmin?.phone || "-"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-gray-500">Peran</p>
                  <p className="text-[11px] font-semibold text-gray-800 break-words">
                    {currentAdmin?.role || "Admin"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-gray-500">
                    Nama Lengkap
                  </p>
                  <p className="text-[11px] font-semibold text-gray-800 break-words">
                    {currentAdmin?.fullName || "-"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-gray-500">Email</p>
                  <p className="text-[11px] font-semibold text-gray-800 break-words">
                    {currentAdmin?.email || "-"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-gray-500">
                    Status Akun
                  </p>
                  <p className="text-[11px] font-semibold text-gray-800 break-words">
                    {currentAdmin?.isActive ? "Aktif" : "Tidak Aktif"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => {
                setIsProfileOpen(false);
                setIsEditAdminOpen(true);
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Edit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit Admin Dialog ────────────────────────────────────────────── */}
      <Dialog open={isEditAdminOpen} onOpenChange={setIsEditAdminOpen}>
        <DialogContent
          className="sm:max-w-lg max-h-[85vh] flex flex-col"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex justify-between items-start">
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="border-b border-gray-200 my-1" />
          <div className="flex-1 overflow-y-auto pr-1 overflow-x-hidden">
            <div>
              <p className="text-[12px] font-semibold text-gray-700 mb-1 ml-0.5">
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
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="col-span-2">
                <label className="text-[11px] font-medium text-gray-600">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  disabled
                  value={currentAdmin?.fullName}
                  className="w-full mt-1 px-3 py-2 border rounded-md text-[11px] bg-gray-100"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-0.5 px-2 py-1.5 text-[11px] border rounded-md"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-medium text-gray-600">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-0.5 px-2 py-1.5 text-[11px] border rounded-md"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-600">
                  Peran
                </label>
                <input
                  type="text"
                  disabled
                  value={currentAdmin?.role}
                  className="w-full mt-1 px-3 py-2 border rounded-md text-[11px] bg-gray-100"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-600">
                  Status Akun
                </label>
                <input
                  type="text"
                  disabled
                  value={currentAdmin?.isActive ? "Aktif" : "Tidak Aktif"}
                  className="w-full mt-1 px-3 py-2 border rounded-md text-[11px] bg-gray-100"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3 justify-center pt-2 border-t">
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
