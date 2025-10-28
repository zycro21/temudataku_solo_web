"use client";
import { useState } from "react";
import { ChevronDown, Bell, Search, Users, UserCheck, MessageSquare, Calendar, FileText, Award, User, BookOpen, CreditCard, Package, Shield, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenuExpansion = (menuName: string) => {
    setExpandedMenus((prev) => (prev.includes(menuName) ? prev.filter((name) => name !== menuName) : [...prev, menuName]));
  };

  const menuItems = [
    { name: "Overview", icon: BarChart3, href: "/admin" },
    { name: "Mentee", icon: Users, href: "/admin/mentee" },
    { name: "Mentor", icon: UserCheck, href: "/admin/mentor" },
    {
      name: "Kelola Mentoring",
      icon: MessageSquare,
      hasSubmenu: true,
      children: [
        { name: "Jadwal Sesi", icon: Calendar, href: "/admin/kelola-mentoring/" },
        { name: "Project", icon: FileText, href: "/admin/kelola-mentoring/project" },
        { name: "Sertifikat", icon: Award, href: "/admin/kelola-mentoring/sertifikat" },
        { name: "Feedback Mentor", icon: User, href: "/admin/kelola-mentoring/feedback-mentor" },
        { name: "Feedback Mentee", icon: User, href: "/admin/kelola-mentoring/feedback-mentee" },
      ],
    },
    { name: "Kelola Practice", icon: BookOpen, href: "/admin/kelola-practice" },
    { name: "Transaksi", icon: CreditCard, href: "/admin/transaksi" },
    { name: "Produk & Event", icon: Package, href: "/admin/produk-event" },
    {
      name: "History & Security",
      icon: Shield,
      hasSubmenu: true,
      children: [
        { name: "History", icon: FileText, href: "/admin/history" },
        { name: "Security", icon: Shield, href: "/admin/security" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0CA678] rounded-lg flex items-center justify-center">
              <div className="text-white font-bold text-sm">TD</div>
            </div>
            <span className="text-xl font-semibold text-gray-900">TemuDataku</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href || "#"}
                  onClick={() => {
                    setActiveMenu(item.name);
                    if (item.hasSubmenu) toggleMenuExpansion(item.name);
                  }}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeMenu === item.name ? "bg-[#0CA678] text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.hasSubmenu && <ChevronDown className={`w-4 h-4 transition-transform ${expandedMenus.includes(item.name) ? "rotate-180" : ""}`} />}
                </Link>

                {/* Submenu */}
                {item.children && expandedMenus.includes(item.name) && (
                  <ul className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.name}>
                        <Link
                          href={child.href || "#"}
                          onClick={() => setActiveMenu(child.name)}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeMenu === child.name ? "bg-[#0CA678] text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
                        >
                          <child.icon className="w-4 h-4" />
                          <span className="flex-1 text-left">{child.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input type="text" placeholder="Masukkan kata kunci pencarian..." className="pl-10 bg-gray-50 border-gray-200" />
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">BT</span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Babang Tamvan</div>
                  <div className="text-gray-500">Admin</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Children content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
