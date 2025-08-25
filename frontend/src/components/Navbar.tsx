"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MdSchool, MdSupervisorAccount, MdAssignment } from "react-icons/md";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const dropdownRef = useRef<HTMLLIElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoginModalMobileOpen, setIsLoginModalMobileOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isRegisterModalMobileOpen, setIsRegisterModalMobileOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Klik di luar dropdown => tutup dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="h-[88px] w-full flex items-center justify-between px-6 md:px-16 bg-white shadow-sm sticky top-0 z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <Image src="/images/Navbar_logo.png" alt="TemuDataku Logo" width={134} height={82} className="w-[120px] h-auto" />
      </Link>

      {/* Menu */}
      <ul className="hidden md:flex items-center space-x-6 text-[15px] text-[#5F6368] font-medium">
        <li ref={dropdownRef} className="relative px-3 py-2 rounded-md hover:bg-gray-50 transition">
          <button onClick={() => setDropdownOpen((prev) => !prev)} className={`flex items-center gap-1 ${dropdownOpen ? "text-[#0CA678]" : ""}`}>
            <span>Jalur Belajar</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-[#0CA678]" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <ul className="absolute left-0 mt-2 w-56 bg-white shadow-lg rounded-lg py-2 z-20">
              <li>
                <Link href="/programs" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100">
                  <MdSchool className="text-gray-500 text-lg" />
                  Program & Bootcamp
                </Link>
              </li>
              <li>
                <Link href="/mentoring" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100">
                  <MdSupervisorAccount className="text-gray-500 text-lg" />
                  Mentoring
                </Link>
              </li>
              <li>
                <Link href="/practice" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100">
                  <MdAssignment className="text-gray-500 text-lg" />
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

      {/* Buttons */}
      <div className="hidden md:flex items-center gap-4">
        {/* Modal Masuk */}
        <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
          <DialogTrigger asChild>
            <button className="px-5 py-2 border border-[#0CA678] text-[#0CA678] rounded-md hover:bg-[#0CA678] hover:text-white text-sm transition">Masuk</button>
          </DialogTrigger>
          <DialogContent className="sm:min-w-[400px] md:min-w-[500px] lg:min-w-5xl w-full p-0 overflow-hidden">
            <div className="grid md:grid-cols-2 min-h-[650px]">
              {/* Left side - Illustration (hanya muncul di md ke atas) */}
              <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <Image src="/assets/auth/ilustration.svg" alt="3D Robot Illustration" width={500} height={500} className="w-full h-full object-cover" />
              </div>
              {/* Right side - Form */}
              <div className="p-10 pt-0 relative bg-white flex flex-col justify-center">
                {/* Header */}
                <DialogHeader>
                  <DialogTitle>
                    <p className="text-2xl font-bold text-gray-900 mb-2 text-center">Masuk</p>
                    <p className="text-gray-600 mb-6 text-center">Selamat datang kembali 👋</p>
                  </DialogTitle>
                </DialogHeader>

                {/* Form Login */}
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input type="email" placeholder="Masukkan email" className="w-full" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="Masukkan kata sandi" className="w-full pr-10 border border-gray-300 focus:border-[#0CA678] focus:ring-2 focus:ring-[#0CA678] focus:outline-none" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Ingat saya + Lupa password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm text-gray-600">
                      <input type="checkbox" className="rounded border-gray-300 text-[#0CA678]" />
                      <span>Ingat Saya</span>
                    </label>
                    <button type="button" className="text-sm text-[#0CA678] hover:underline">
                      Lupa Kata Sandi?
                    </button>
                  </div>

                  <Button className="w-full bg-[#0CA678] hover:bg-[#08916C] text-white py-3">Masuk</Button>

                  <div className="text-center text-gray-500">atau</div>

                  <Button variant="outline" className="w-full border-[#0CA678] text-[#0CA678] hover:bg-[#f2f1f1] hover:text-[#0CA678]">
                    <Image src="/assets/auth/googleIcon.svg" alt="Google Logo" width={20} height={20} className="mr-2" />
                    Gunakan Akun Google
                  </Button>

                  <p className="text-center text-sm text-gray-600">
                    Belum punya akun? <button className="text-[#0CA678] hover:underline">Daftar</button>
                  </p>
                </form>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Daftar */}
        <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
          <DialogTrigger asChild>
            <button className="px-5 py-2 bg-[#0CA678] rounded-md hover:bg-[#08916C] text-white text-sm transition">Daftar Akun</button>
          </DialogTrigger>
          <DialogContent className=" sm:min-w-[400px] md:min-w-[600px] lg:min-w-5xl w-full p-0 overflow-hidden">
            <div className="grid md:grid-cols-2 min-h-[650px]">
              {/* Left side - Illustration (hanya muncul di md ke atas) */}
              <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <Image src="/assets/auth/ilustration.svg" alt="3D Robot Illustration" width={500} height={500} className="w-full h-full object-cover" />
              </div>

              {/* Right side - Form */}
              <div className="p-10 pt-0 relative bg-white flex flex-col justify-center">
                <DialogHeader>
                  <DialogTitle>
                    {" "}
                    {/* Form login / register */}
                    <p className="text-2xl font-bold text-gray-900 mb-2 text-center">Buat Akun</p>
                    <p className="text-gray-600 mb-6 text-center">Lorem ipsum is simply like this</p>
                  </DialogTitle>
                </DialogHeader>

                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input type="email" placeholder="Masukkan email" className="w-full" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
                    <div className="relative">
                      <Input type={showRegisterPassword ? "text" : "password"} placeholder="Masukkan kata sandi" className="w-full pr-10" />
                      <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                        {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 pt-1">Gunakan kombinasi angka, huruf besar, dan huruf kecil</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Kata Sandi</label>
                    <div className="relative">
                      <Input type={showConfirmPassword ? "text" : "password"} placeholder="Konfirmasi kata sandi" className="w-full pr-10" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button className="w-full bg-[#0CA678] hover:bg-[#08916C] text-white py-3">Daftar</Button>

                  <div className="text-center text-gray-500">atau</div>

                  <Button variant="outline" className="w-full border-[#0CA678] text-[#0CA678] hover:bg-[#f2f1f1] hover:text-[#0CA678]">
                    <Image src="/assets/auth/googleIcon.svg" alt="Google Logo" width={20} height={20} className="mr-2" /> Gunakan Akun Google
                  </Button>

                  <p className="text-center text-sm text-gray-600">
                    Sudah Punya Akun? <button className="text-[#0CA678] hover:underline">Masuk</button>
                  </p>
                </form>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                { href: "/#faq", label: "FAQ" },
                { href: "/tentang-kami", label: "Tentang Kami" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Dialog open={isLoginModalMobileOpen} onOpenChange={setIsLoginModalMobileOpen}>
                  <DialogTrigger asChild>
                    <button className="w-full mt-3 px-4 py-2 border border-[#0CA678] text-[#0CA678] rounded-md text-sm">Masuk</button>
                  </DialogTrigger>
                  <DialogContent className="sm:min-w-[400px] md:min-w-[500px] lg:min-w-5xl w-full p-0 overflow-hidden">
                    <div className="grid md:grid-cols-2 min-h-[550px]">
                      {/* Left side - Illustration (hanya muncul di md ke atas) */}
                      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        <Image src="/assets/auth/ilustration.svg" alt="3D Robot Illustration" width={500} height={500} className="w-full h-full object-cover" />
                      </div>
                      {/* Right side - Form */}
                      <div className="p-5 relative bg-white flex flex-col justify-center">
                        {/* Header */}
                        <DialogHeader>
                          <DialogTitle>
                            <p className="text-2xl font-bold text-gray-900 mb-2 text-center">Masuk</p>
                            <p className="text-gray-600 mb-6 text-center">Selamat datang kembali 👋</p>
                          </DialogTitle>
                        </DialogHeader>

                        {/* Form Login */}
                        <form className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <Input type="email" placeholder="Masukkan email" className="w-full" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
                            <div className="relative">
                              <Input type={showPassword ? "text" : "password"} placeholder="Masukkan kata sandi" className="w-full pr-10" />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Ingat saya + Lupa password */}
                          <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 text-sm text-gray-600">
                              <input type="checkbox" className="rounded border-gray-300 text-[#0CA678]" />
                              <span>Ingat Saya</span>
                            </label>
                            <button type="button" className="text-sm text-[#0CA678] hover:underline">
                              Lupa Kata Sandi?
                            </button>
                          </div>

                          <Button className="w-full bg-[#0CA678] hover:bg-[#08916C] text-white py-3">Masuk</Button>

                          <div className="text-center text-gray-500">atau</div>

                          <Button variant="outline" className="w-full border-[#0CA678] text-[#0CA678] hover:bg-[#f2f1f1] hover:text-[#0CA678]">
                            <Image src="/assets/auth/googleIcon.svg" alt="Google Logo" width={20} height={20} className="mr-2" />
                            Gunakan Akun Google
                          </Button>

                          <p className="text-center text-sm text-gray-600">
                            Belum punya akun? <button className="text-[#0CA678] hover:underline">Daftar</button>
                          </p>
                        </form>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </li>
              <li>
                {/* Modal Daftar */}
                <Dialog open={isRegisterModalMobileOpen} onOpenChange={setIsRegisterModalMobileOpen}>
                  <DialogTrigger asChild>
                    <button className="w-full mt-2 px-4 py-2 bg-[#0CA678] text-white rounded-md text-sm">Daftar Akun</button>
                  </DialogTrigger>
                  <DialogContent className=" sm:min-w-[400px] md:min-w-[600px] lg:min-w-5xl w-full p-0 overflow-hidden">
                    <div className="grid md:grid-cols-2 min-h-[550px]">
                      {/* Left side - Illustration (hanya muncul di md ke atas) */}
                      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        <Image src="/assets/auth/ilustration.svg" alt="3D Robot Illustration" width={500} height={500} className="w-full h-full object-cover" />
                      </div>

                      {/* Right side - Form */}
                      <div className="p-5 relative bg-white flex flex-col justify-center">
                        <DialogHeader>
                          <DialogTitle>
                            {" "}
                            {/* Form login / register */}
                            <p className="text-2xl font-bold text-gray-900 mb-2 text-center">Buat Akun</p>
                            <p className="text-gray-600 mb-6 text-center">Lorem ipsum is simply like this</p>
                          </DialogTitle>
                        </DialogHeader>

                        <form className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <Input type="email" placeholder="Masukkan email" className="w-full" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
                            <div className="relative">
                              <Input type={showRegisterPassword ? "text" : "password"} placeholder="Masukkan kata sandi" className="w-full pr-10" />
                              <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 pt-1">Gunakan kombinasi angka, huruf besar, dan huruf kecil</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Kata Sandi</label>
                            <div className="relative">
                              <Input type={showConfirmPassword ? "text" : "password"} placeholder="Konfirmasi kata sandi" className="w-full pr-10" />
                              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <Button className="w-full bg-[#0CA678] hover:bg-[#08916C] text-white py-3">Daftar</Button>

                          <div className="text-center text-gray-500">atau</div>

                          <Button variant="outline" className="w-full border-[#0CA678] text-[#0CA678] hover:bg-[#f2f1f1] hover:text-[#0CA678]">
                            <Image src="/assets/auth/googleIcon.svg" alt="Google Logo" width={20} height={20} className="mr-2" /> Gunakan Akun Google
                          </Button>

                          <p className="text-center text-sm text-gray-600">
                            Sudah Punya Akun? <button className="text-[#0CA678] hover:underline">Masuk</button>
                          </p>
                        </form>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
