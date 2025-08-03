import Link from "next/link";
import { MessageCircle, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import logo from "../../public/images/footerLogo.svg";
export default function Footer() {
  return (
    <footer className="bg-[#243A77] text-white py-12 px-8 md:px-[100px]">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-2">
              <Image src={logo} alt="TemuDataku Logo" className="w-[134px] h-1/4" />
            </div>

            <p className="text-blue-100 text-sm leading-relaxed max-w-sm">TemuDataku adalah platform mentoring data science terpersonalisasi yang menghubungkan Anda dengan mentor berpengalaman untuk mempercepat perjalanan belajar Anda.</p>

            {/* Social Media Icons */}
            <div className="flex space-x-3">
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">TemuDataku</h3>
            <ul className="space-y-3">
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
                <Link href="/practice" className="text-blue-100 hover:text-white transition-colors text-sm">
                  Praktik
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Hubungi Kami</h3>
            <div className="space-y-3 text-sm">
              <p className="text-blue-100 leading-relaxed">
                Kelurahan Karangbesuki,
                <br />
                Kecamatan Sukun, Kota Malang
              </p>
              <p className="text-blue-100">081234567890</p>
              <p className="text-blue-100">temudataku@gmail.com</p>
            </div>
          </div>

          {/* Help Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Bantuan</h3>
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
          <p className="text-blue-100 text-sm text-center md:text-left">© 2025 TemuDataku. All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}
