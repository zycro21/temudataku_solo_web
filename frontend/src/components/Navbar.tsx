"use client";

import { Suspense } from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MdSchool,
  MdSupervisorAccount,
  MdAssignment,
  MdMenuBook,
} from "react-icons/md";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext"; // pakai AuthContext
import { useLogout } from "@/hooks/useLogout"; // import hook logout
import axios from "axios";
import { usePathname } from "next/navigation";

// Import modal yang sudah kamu buat
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);

  const menuRef = useRef<HTMLUListElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [learningOpen, setLearningOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [ayclOpen, setAyclOpen] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const [ayclList, setAyclList] = useState<
    { id: string; title: string; slug: string }[]
  >([]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname();

  // Ambil user global dari AuthContext
  const { currentUser } = useAuth();
  const logout = useLogout(); // pakai hook logout

  // Klik di luar dropdown => tutup semua dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        (menuRef.current && menuRef.current.contains(event.target as Node)) ||
        (userMenuRef.current &&
          userMenuRef.current.contains(event.target as Node))
      ) {
        return; // klik di dalam menu → jangan tutup
      }

      setLearningOpen(false);
      setUserOpen(false);
      setAyclOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAyclList = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/aycl/public/aycl/list`,
        );

        setAyclList(res.data.data || []);
      } catch (err) {
        console.error("Gagal ambil list AYCL:", err);
      }
    };

    fetchAyclList();
  }, []);

  useEffect(() => {
    setLearningOpen(false);
    setUserOpen(false);
    setAyclOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const profileImage = (() => {
    if (!currentUser?.profilePicture) {
      return "/assets/dashboard/user/avatar.png";
    }

    if (currentUser.profilePicture.startsWith("http")) {
      return currentUser.profilePicture;
    }

    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${currentUser.profilePicture}`;
  })();

  const isExternalImage = profileImage.startsWith("http");

  return (
    <nav className="h-[70px] md:h-[80px] w-full flex items-center justify-between px-4 md:px-10 bg-white sticky top-0 z-50">
      {/* LEFT: Logo + Hamburger */}
      <div className="flex items-center gap-3">
        {/* Hamburger (mobile only) */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-gray-700 transition-transform duration-300 ${
              mobileMenuOpen ? "rotate-90" : "rotate-0"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/Navbar_logo.png"
            alt="TemuDataku Logo"
            width={116}
            height={68}
            className="w-[100px] md:w-[120px] h-auto"
          />
        </Link>
      </div>

      {/* Menu */}
      <ul
        className="hidden md:flex items-center space-x-4 text-sm text-gray-600 font-medium"
        ref={menuRef}
      >
        <li className="relative px-2 py-1.5 rounded-md hover:bg-gray-50 transition">
          <button
            onClick={() => {
              setLearningOpen((prev) => !prev);
              setUserOpen(false);
            }}
            className={`flex items-center gap-1 ${
              learningOpen ? "text-[#0CA678]" : ""
            }`}
          >
            <span>Jalur Belajar</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3 w-3 transform transition-transform duration-200 ${
                learningOpen ? "rotate-180 text-[#0CA678]" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {learningOpen && (
            <ul className="absolute left-0 mt-2 w-70 bg-white shadow-md rounded-lg py-1.5 z-20">
              <li>
                <Link
                  href="/programs"
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-sm"
                >
                  <MdSchool className="text-gray-500 text-sm" />
                  Bootcamp
                </Link>
              </li>
              <li>
                <Link
                  href="/mentoring"
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-sm"
                >
                  <MdSupervisorAccount className="text-gray-500 text-sm" />
                  Mentoring
                </Link>
              </li>
              {/* <li>
                <Link
                  href="/practice"
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-sm"
                >
                  <MdAssignment className="text-gray-500 text-md" />
                  Praktik
                </Link>
              </li> */}

              {/* <li>
                <Link
                  href="/elearning"
                 className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-sm"
                >
                  <MdMenuBook className="text-gray-500 text-sm" />
                  E-Learning
                </Link>
              </li> */}
              <li className="relative">
                {ayclList.length === 0 ? (
                  // 🔥 fallback (tidak ada active)
                  <Link
                    href="/aycl"
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-sm"
                  >
                    <MdMenuBook className="text-gray-500 text-sm" />
                    All You Can Learn (AYCL)
                  </Link>
                ) : (
                  <>
                    {/* 🔥 Parent */}
                    <button
                      onClick={() => {
                        setAyclOpen((prev) => !prev);
                        setLearningOpen(true);
                        setUserOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-sm w-full text-left"
                    >
                      <MdMenuBook className="text-gray-500 text-sm" />

                      <span className="flex-1 text-left">
                        All You Can Learn (AYCL)
                      </span>

                      <svg
                        className={`h-3 w-3 transition-transform duration-200 ${
                          ayclOpen ? "rotate-0" : "-rotate-90"
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7 5l5 5-5 5"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* 🔥 Dropdown */}
                    {ayclOpen && (
                      <ul className="absolute top-0 left-full ml-2 w-78 bg-white shadow-md rounded-lg py-1.5 z-30">
                        {ayclList.map((item) => (
                          <li key={item.id}>
                            <Link
                              href={`/aycl?slug=${item.slug}`}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm"
                            >
                              <MdAssignment className="text-gray-400 text-sm" />
                              {item.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            </ul>
          )}
        </li>

        <li className="px-3 py-2 rounded-md hover:bg-gray-50 transition">
          <Link href="/mentor">Mentor</Link>
        </li>
        <li className="px-3 py-2 rounded-md hover:bg-gray-50 transition">
          <Link href="/#faq">FAQ</Link>
        </li>
        <li className="px-3 py-2 rounded-md hover:bg-gray-50 transition">
          <Link href="/tentang-kami">Tentang Kami</Link>
        </li>
      </ul>

      {/* Bagian kanan */}
      <div className="flex items-center gap-2 md:gap-4">
        {!mounted ? null : !currentUser ? (
          <>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3 md:px-4 py-1.5 border border-[#0CA678] text-[#0CA678] rounded-md hover:bg-[#0CA678] hover:text-white text-xs transition"
            >
              Masuk
            </button>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-3 md:px-4 py-1.5 bg-[#0CA678] rounded-md hover:bg-[#08916C] text-white text-xs transition"
            >
              Daftar
            </button>
          </>
        ) : (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setUserOpen((prev) => !prev);
                setLearningOpen(false);
              }}
              className="flex items-center gap-2 md:gap-3"
            >
              <Image
                src={profileImage}
                alt="Avatar"
                width={34}
                height={34}
                unoptimized
                className="rounded-full object-cover"
              />
              <span className="text-[11px] md:text-sm font-semibold text-gray-700 max-w-[90px] md:max-w-none truncate md:truncate-none">
                {currentUser.fullName}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-3 w-3 transform transition-transform ${
                  userOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {userOpen && (
              <ul className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-md py-1.5 z-20">
                <li>
                  <Link
                    href="/dashboard/user/"
                    className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 text-sm"
                  >
                    <Image
                      src="/assets/navbar/profile.svg"
                      alt="Profil"
                      width={10}
                      height={10}
                      className="relative top-[-0.5px]"
                    />
                    Profil Saya
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/user/"
                    className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 text-sm"
                  >
                    <Image
                      src="/assets/navbar/dashboard.svg"
                      alt="Dashboard"
                      width={10}
                      height={10}
                      className="relative top-[-0.5px]"
                    />
                    Dashboard Saya
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/user/jadwal"
                    className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 text-sm"
                  >
                    <Image
                      src="/assets/navbar/class.svg"
                      alt="Dashboard"
                      width={10}
                      height={10}
                      className="relative top-[-0.5px]"
                    />
                    Kelas Saya
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/user/transaction"
                    className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 text-sm"
                  >
                    <Image
                      src="/assets/navbar/transaction.svg"
                      alt="Dashboard"
                      width={10}
                      height={10}
                      className="relative top-[-0.5px]"
                    />
                    Transaksi Saya
                  </Link>
                </li>

                {/* <li>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 text-sm"
                  >
                    <Image
                      src="/assets/navbar/setting.svg"
                      alt="Dashboard"
                      width={12}
                      height={12}
                      className="relative top-[-0.5px]"
                    />
                    Pengaturan
                  </Link>
                </li> */}

                <li>
                  <button
                    onClick={() => logout("/")} // gunakan hook logout
                    className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <Image
                      src="/assets/navbar/exit.svg"
                      alt="Keluar"
                      width={10}
                      height={10}
                      className="relative top-[-0.5px]"
                    />
                    Keluar
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}

        {/* MOBILE MENU */}
        <div
          className={`
    absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-md md:hidden
    transition-all duration-300 ease-in-out overflow-hidden
    ${
      mobileMenuOpen
        ? "max-h-[500px] opacity-100 translate-y-0"
        : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
    }
  `}
        >
          <ul className="flex flex-col text-sm text-gray-700 font-medium py-3">
            <li className="px-4 py-2 text-center hover:bg-gray-50">
              <Link href="/programs">Bootcamp</Link>
            </li>
            <li className="px-4 py-2 text-center hover:bg-gray-50">
              <Link href="/mentoring">Mentoring</Link>
            </li>
            {/* AYCL (dynamic seperti desktop) */}
            {ayclList.length === 0 ? (
              <li className="px-4 py-2 text-center hover:bg-gray-50 truncate">
                <Link href="/aycl">AYCL</Link>
              </li>
            ) : (
              ayclList.map((item) => (
                <li
                  key={item.id}
                  className="px-4 py-2 text-center hover:bg-gray-50"
                >
                  <Link href={`/aycl?slug=${item.slug}`}>{item.title}</Link>
                </li>
              ))
            )}
            <li className="px-4 py-2 text-center hover:bg-gray-50">
              <Link href="/mentor">Mentor</Link>
            </li>
            <li className="px-4 py-2 text-center hover:bg-gray-50">
              <Link href="/#faq">FAQ</Link>
            </li>
            <li className="px-4 py-2 text-center hover:bg-gray-50">
              <Link href="/tentang-kami">Tentang Kami</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Modal Components */}
      <Suspense fallback={null}>
        <LoginModal
          isOpen={isLoginModalOpen}
          setIsOpen={setIsLoginModalOpen}
          openRegister={() => {
            setIsLoginModalOpen(false);
            setIsRegisterModalOpen(true);
          }}
        />
      </Suspense>

      <Suspense fallback={null}>
        <RegisterModal
          isOpen={isRegisterModalOpen}
          setIsOpen={setIsRegisterModalOpen}
          openLogin={() => {
            setIsRegisterModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      </Suspense>
    </nav>
  );
}
