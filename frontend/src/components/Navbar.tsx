"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MdSchool, MdSupervisorAccount, MdAssignment } from "react-icons/md";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext"; // pakai AuthContext
import { useLogout } from "@/hooks/useLogout"; // import hook logout

// Import modal yang sudah kamu buat
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

export default function Navbar() {
  const menuRef = useRef<HTMLUListElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [learningOpen, setLearningOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="h-[88px] w-full flex items-center justify-between px-6 md:px-16 bg-white sticky top-0 z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <Image
          src="/images/Navbar_logo.png"
          alt="TemuDataku Logo"
          width={134}
          height={82}
          className="w-[120px] h-auto"
        />
      </Link>

      {/* Menu */}
      <ul
        className="hidden md:flex items-center space-x-6 text-[15px] text-[#5F6368] font-medium"
        ref={menuRef}
      >
        <li className="relative px-3 py-2 rounded-md hover:bg-gray-50 transition">
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
              className={`h-4 w-4 transform transition-transform duration-200 ${
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
            <ul className="absolute left-0 mt-2 w-72 bg-white shadow-lg rounded-lg py-2 z-20">
              <li>
                <Link
                  href="/programs"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                >
                  <MdSchool className="text-gray-500 text-md" />
                  Program & Bootcamp
                </Link>
              </li>
              <li>
                <Link
                  href="/mentoring"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                >
                  <MdSupervisorAccount className="text-gray-500 text-md" />
                  Mentoring
                </Link>
              </li>
              <li>
                <Link
                  href="/practice"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                >
                  <MdAssignment className="text-gray-500 text-md" />
                  Praktik
                </Link>
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
      <div className="hidden md:flex items-center gap-4">
        {!currentUser ? (
          <>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-5 py-2 border border-[#0CA678] text-[#0CA678] rounded-md hover:bg-[#0CA678] hover:text-white text-sm transition"
            >
              Masuk
            </button>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-5 py-2 bg-[#0CA678] rounded-md hover:bg-[#08916C] text-white text-sm transition"
            >
              Daftar Akun
            </button>
          </>
        ) : (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setUserOpen((prev) => !prev);
                setLearningOpen(false);
              }}
              className="flex items-center gap-3"
            >
              <Image
                src={
                  currentUser.profilePicture &&
                  currentUser.profilePicture !== "default.jpg"
                    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${currentUser.profilePicture}`
                    : "/assets/dashboard/user/avatar.png"
                }
                alt="Avatar"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <span className="text-base font-semibold text-gray-700">
                {currentUser.fullName}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transform transition-transform ${
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
              <ul className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-20">
                <li>
                  <Link
                    href="/dashboard/user/"
                    className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100"
                  >
                    <Image
                      src="/assets/navbar/profile.svg"
                      alt="Profil"
                      width={12}
                      height={12}
                      className="relative top-[-0.5px]"
                    />
                    Profil Saya
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/user/"
                    className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100"
                  >
                    <Image
                      src="/assets/navbar/dashboard.svg"
                      alt="Dashboard"
                      width={12}
                      height={12}
                      className="relative top-[-0.5px]"
                    />
                    Dashboard Saya
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/jadwal"
                    className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100"
                  >
                    <Image
                      src="/assets/navbar/class.svg"
                      alt="Dashboard"
                      width={12}
                      height={12}
                      className="relative top-[-0.5px]"
                    />
                    Kelas Saya
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/transaction"
                    className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100"
                  >
                    <Image
                      src="/assets/navbar/transaction.svg"
                      alt="Dashboard"
                      width={12}
                      height={12}
                      className="relative top-[-0.5px]"
                    />
                    Transaksi Saya
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100"
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
                </li>
                <li>
                  <button
                    onClick={() => logout("/")} // gunakan hook logout
                    className="flex items-center gap-4 w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    <Image
                      src="/assets/navbar/exit.svg"
                      alt="Keluar"
                      width={12}
                      height={12}
                      className="relative top-[-0.5px]"
                    />
                    Keluar
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Modal Components */}
      <LoginModal
        isOpen={isLoginModalOpen}
        setIsOpen={setIsLoginModalOpen}
        openRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        setIsOpen={setIsRegisterModalOpen}
        openLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </nav>
  );
}
