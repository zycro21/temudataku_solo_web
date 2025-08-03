"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import Image from "next/image";
import mentoring1on1 from "@/assets/mentoringPage/mentoring1on1.svg";
import mentoringGroup from "@/assets/mentoringPage/mentoringgroup.svg";
const mentoringOptions = [
  {
    id: 1,
    title: "Mentoring 1 on 1",
    originalPrice: "Rp 45.000",
    price: "Rp 40.000",
    badge: "BEST SESSION",
    features: ["Mentoring 45 menit", "Tanya apapun permasalahan dalam bidang data science", "Rekaman sesi mentoring", "Garansi kepuasan*", "Dapatkan akses ke praktik data science**"],
    image: mentoring1on1,
  },
  {
    id: 2,
    title: "Mentoring Group",
    price: "Rp 70.000",
    features: ["Mentoring 90 menit", "Tanya apapun permasalahan dalam bidang data science", "Rekaman sesi mentoring", "Garansi kepuasan*", "Dapatkan akses ke praktik data science**"],
    image: mentoringGroup,
  },
];

const tabs = [
  { id: "mentoring", label: "Mentoring" },
  { id: "praktik", label: "Praktik" },
  { id: "program", label: "Program & Bootcamp" },
];

export default function LearningPathsSection() {
  const [activeTab, setActiveTab] = useState("mentoring");

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-8 md:px-[100px]">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-gray-600 mb-2">Jalur Belajar</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Jalur Belajar di TemuDataku
            <br />
            yang Bisa Kamu Pilih
          </h2>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="flex gap-3 md:gap-6 overflow-x-auto lg:overflow-visible whitespace-nowrap px-1 lg:px-0 w-full lg:w-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-w-max lg:w-[300px] px-6 py-3 text-center rounded-md font-medium transition-all duration-200 ${activeTab === tab.id ? "bg-[#0CA678] text-white shadow-sm" : "text-gray-600 bg-gray-100 hover:text-gray-900"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "mentoring" && (
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {mentoringOptions.map((option) => (
              <Card key={option.id} className="relative overflow-hidden shadow-lg border-0">
                <div className="relative ">
                  <Image src={option.image || "/placeholder.svg"} alt={option.title} className="w-full h-auto object-cover" />
                  {option.badge && <div className="absolute bottom-0 left-0 right-0 bg-[#243A77] text-white text-center py-3 text-sm font-semibold z-10">{option.badge}</div>}
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{option.title}</h3>

                  <div className="mb-6">
                    {option.originalPrice && <span className="text-sm text-gray-500 line-through mr-2">{option.originalPrice}</span>}
                    <span className="text-2xl font-bold text-gray-900">{option.price}</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#0CA678] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full bg-[#0CA678] hover:bg-[#08916C] text-white py-3 rounded-md">Ikuti Sesi</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "praktik" && (
          <div className="text-center py-12">
            <p className="text-gray-600">Konten Praktik akan segera hadir...</p>
          </div>
        )}

        {activeTab === "program" && (
          <div className="text-center py-12">
            <p className="text-gray-600">Konten Program & Bootcamp akan segera hadir...</p>
          </div>
        )}
      </div>
    </section>
  );
}
