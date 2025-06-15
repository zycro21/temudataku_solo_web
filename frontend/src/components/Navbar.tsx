"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MdSchool, MdSupervisorAccount, MdAssignment } from "react-icons/md";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const dropdownRef = useRef<HTMLLIElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Klik di luar dropdown => tutup dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav
      className="h-[88px] w-full flex items-center justify-between px-8 md:px-[100px]
        bg-white shadow-sm relative font-['Inter']"
    >
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img
          src="/images/Navbar_logo.png"
          alt="TemuDataku Logo"
          className="w-[134px] h-[82px]"
        />
      </div>

      {/* Menu */}
      <ul className="hidden md:flex items-center space-x-4 text-[16px] text-[#5F6368] font-medium">
        <li
          className={`relative rounded-md hover:bg-gray-100 px-4 py-3 transition-colors duration-200`}
          ref={dropdownRef}
        >
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className={`w-full h-full flex items-center space-x-1 ${
              dropdownOpen ? "text-[#0CA678]" : ""
            }`}
          >
            <span>Jalur Belajar</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transform transition-transform duration-200 ${
                dropdownOpen ? "rotate-180 text-[#0CA678]" : ""
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

          {dropdownOpen && (
            <ul className="absolute z-20 top-full mt-2 left-0 min-w-max bg-white shadow-lg rounded-md py-2">
              <li className="px-4 py-2 hover:bg-gray-100">
                <Link href="/programs" className="flex items-center gap-3">
                  <MdSchool className="text-gray-500 text-lg" />
                  <span>Program & Bootcamp</span>
                </Link>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100">
                <Link href="/mentoring" className="flex items-center gap-3">
                  <MdSupervisorAccount className="text-gray-500 text-lg" />
                  <span>Mentoring</span>
                </Link>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100">
                <Link href="/practice" className="flex items-center gap-3">
                  <MdAssignment className="text-gray-500 text-lg" />
                  <span>Praktik</span>
                </Link>
              </li>
            </ul>
          )}
        </li>

        <li className="hover:bg-gray-100 rounded-md px-4 py-3 transition-colors duration-200 cursor-pointer">
          <Link href="/mentor" className="block w-full h-full">
            Mentor
          </Link>
        </li>
        <li className="hover:bg-gray-100 rounded-md px-4 py-3 transition-colors duration-200 cursor-pointer">
          <Link href="/faq" className="block w-full h-full">
            FAQ
          </Link>
        </li>
        <li className="hover:bg-gray-100 rounded-md px-4 py-3 transition-colors duration-200 cursor-pointer">
          <Link href="/tentang-kami" className="block w-full h-full">
            Tentang Kami
          </Link>
        </li>
      </ul>

      {/* Buttons */}
      <div className="hidden md:flex items-center space-x-4">
        <button
          //   onClick={openLoginDialog}
          className="px-7 py-2 border border-[#0CA678] text-[#0CA678] rounded-md hover:bg-[#0CA678] hover:text-white text-sm transition"
        >
          Masuk
        </button>
        <button
          //   onClick={openRegisterDialog}
          className="px-5 py-2 bg-[#0CA678] rounded-md hover:bg-[#08916C] !text-white text-sm transition"
        >
          Daftar Akun
        </button>
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden flex items-center">
        <button>
          <svg
            className="h-6 w-6 text-[#0CA678]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}
