import Link from "next/link";
import { MessageCircle, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#243A77] text-white py-10 sm:py-12 px-5 sm:px-8 md:px-[100px]">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1 space-y-5 sm:space-y-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start">
              <Image src="/images/footerLogo.svg" alt="TemuDataku Logo" width={134} height={50} className="w-[120px] sm:w-[134px] h-auto" />
            </div>

            <p className="text-blue-100 text-sm leading-relaxed max-w-sm mx-auto md:mx-0">TemuDataku adalah platform mentoring data science terpersonalisasi yang menghubungkan Anda dengan mentor berpengalaman untuk mempercepat perjalanan belajar Anda.</p>

            {/* Social Media Icons */}
            <div className="flex justify-center md:justify-start space-x-3">
              <Link href="#" className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                <MessageCircle className="w-5 h-5 text-blue-800" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Instagram className="w-5 h-5 text-blue-800" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Linkedin className="w-5 h-5 text-blue-800" />
              </Link>
            </div>
          </div>

          {/* TemuDataku Links */}
          <div className="space-y-3 sm:space-y-4 text-center md:text-left">
            <h3 className="text-base sm:text-lg font-semibold text-white">TemuDataku</h3>
            <ul className="space-y-2.5 sm:space-y-3">
              <li>
                <Link href="/programs" className="text-blue-100 hover:text-white transition-colors text-sm">
                  Program & Bootcamp
                </Link>
              </li>
              <li>
                <Link href="/mentoring" className="text-blue-100 hover:text-white transition-colors text-sm">
                  Mentoring
                </Link>
              </li>
              <li>
                <Link href="/elearning" className="text-blue-100 hover:text-white transition-colors text-sm">
                  E-Learning
                </Link>
              </li>
              <li>
                <Link href="/tentang-kami" className="text-blue-100 hover:text-white transition-colors text-sm">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-blue-100 hover:text-white transition-colors text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-3 sm:space-y-4 text-center md:text-left">
            <h3 className="text-base sm:text-lg font-semibold text-white">Hubungi Kami</h3>
            <div className="space-y-2.5 sm:space-y-3 text-sm text-center md:text-left">
              <p className="text-blue-100 leading-relaxed">
                Kelurahan Karangbesuki,
                <br />
                Kecamatan Sukun, Kota Malang
              </p>
              <p className="text-blue-100">0822-3452-9895</p>
              <p className="text-blue-100">temudataku@gmail.com</p>
            </div>
          </div>

          {/* Help Links */}
          <div className="space-y-3 sm:space-y-4 text-center md:text-left">
            <h3 className="text-base sm:text-lg font-semibold text-white">Bantuan</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-blue-100 hover:text-white transition-colors text-sm">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-blue-100 hover:text-white transition-colors text-sm">
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6">
          <p className="text-blue-100 text-xs sm:text-sm text-center md:text-left">© 2025 TemuDataku. All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}
