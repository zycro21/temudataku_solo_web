"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MdSchool, MdSupervisorAccount, MdAssignment } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Navbar() {
  const dropdownRef = useRef<HTMLLIElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="h-[88px] w-full flex items-center justify-between px-8 md:px-[100px] bg-white shadow-sm relative font-['Inter']">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Image src="/images/Navbar_logo.png" alt="TemuDataku Logo" width={134} height={82} className="w-[134px] h-[82px]" />
      </div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex items-center space-x-4 text-[16px] text-[#5F6368] font-medium">
        <li className="relative rounded-md hover:bg-gray-100 px-4 py-3 transition-colors duration-200" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen((prev) => !prev)} className={`flex items-center space-x-1 ${dropdownOpen ? "text-[#0CA678]" : ""}`}>
            <span>Jalur Belajar</span>
            <svg className={`h-4 w-4 transform transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-[#0CA678]" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
          <Link href="/mentor">Mentor</Link>
        </li>
        <li className="hover:bg-gray-100 rounded-md px-4 py-3 transition-colors duration-200 cursor-pointer">
          <Link href="/faq">FAQ</Link>
        </li>
        <li className="hover:bg-gray-100 rounded-md px-4 py-3 transition-colors duration-200 cursor-pointer">
          <Link href="/tentang-kami">Tentang Kami</Link>
        </li>
      </ul>

      {/* Desktop Buttons */}
      <div className="hidden md:flex items-center space-x-4">
        <button className="px-7 py-2 border border-[#0CA678] text-[#0CA678] rounded-md hover:bg-[#0CA678] hover:text-white text-sm transition">Masuk</button>
        <button className="px-5 py-2 bg-[#0CA678] rounded-md hover:bg-[#08916C] text-white text-sm transition">Daftar Akun</button>
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden flex items-center">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <svg className="h-6 w-6 text-[#0CA678]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                mobileMenuOpen
                  ? "M6 18L18 6M6 6l12 12" // close icon
                  : "M4 6h16M4 12h16M4 18h16" // hamburger icon
              }
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu (Animated) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-[88px] left-0 w-full bg-white z-30 shadow-md md:hidden text-[#5F6368] font-medium overflow-hidden"
          >
            <ul className="flex flex-col space-y-1 px-6 py-4 text-sm">
              {[
                { href: "/programs", label: "Program & Bootcamp" },
                { href: "/mentoring", label: "Mentoring" },
                { href: "/practice", label: "Praktik" },
                { href: "/mentor", label: "Mentor" },
                { href: "/faq", label: "FAQ" },
                { href: "/tentang-kami", label: "Tentang Kami" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button className="w-full mt-3 px-4 py-2 border border-[#0CA678] text-[#0CA678] rounded-md text-sm">Masuk</button>
              </li>
              <li>
                <button className="w-full mt-2 px-4 py-2 bg-[#0CA678] text-white rounded-md text-sm">Daftar Akun</button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
