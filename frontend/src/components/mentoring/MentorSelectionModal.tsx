"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import MentorScheduleSelectionModal from "./MentorScheduleSelectionModal";

interface Mentor {
  id: number;
  name: string;
  title: string;
  experience: string;
  skills: string[];
  image: string;
}

interface MentorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MentorSelectionModal({
  isOpen,
  onClose,
}: MentorSelectionModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mentors: Mentor[] = [
    {
      id: 1,
      name: "Jefri Nichol",
      title: "Data Sciencetist di PT. Pertamina",
      experience: "3 Tahun sebagai Data Sciencetist",
      skills: ["Python", "Excel", "Power BI", "SQL"],
      image: "/assets/homePage/mentors/jefri.svg",
    },
    {
      id: 2,
      name: "Maudy Ayunda",
      title: "Data Sciencetist di PT. Pertamina",
      experience: "3 Tahun sebagai Data Sciencetist",
      skills: ["Python", "Excel", "Power BI", "SQL"],
      image: "/assets/homePage/mentors/laura.svg",
    },
    {
      id: 3,
      name: "David Pratama",
      title: "Data Sciencetist di PT. Pertamina",
      experience: "3 Tahun sebagai Data Sciencetist",
      skills: ["Python", "Excel", "Power BI", "SQL"],
      image: "/assets/homePage/mentors/johnDoe.svg",
    },
    {
      id: 4,
      name: "David Pratama",
      title: "Data Sciencetist di PT. Pertamina",
      experience: "3 Tahun sebagai Data Sciencetist",
      skills: ["Python", "Excel", "Power BI", "SQL"],
      image: "/assets/homePage/mentors/jefri.svg",
    },
    {
      id: 5,
      name: "Jefri Nichol",
      title: "Data Sciencetist di PT. Pertamina",
      experience: "3 Tahun sebagai Data Sciencetist",
      skills: ["Python", "Excel", "Power BI", "SQL"],
      image: "/assets/homePage/mentors/johnDoe.svg",
    },
    {
      id: 6,
      name: "Maudy Ayunda",
      title: "Data Sciencetist di PT. Pertamina",
      experience: "3 Tahun sebagai Data Sciencetist",
      skills: ["Python", "Excel", "Power BI", "SQL"],
      image: "/assets/homePage/mentors/laura.svg",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0">
        {/* Modal Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Pilih Mentor Favorit-mu!
              </DialogTitle>
              <p className="text-gray-600 text-sm mt-1">
                Temukan mentor yang paling cocok buat kamu. Lihat profil mereka,
                cek pengalaman dan pilih yang paling pas untuk bantu kamu
                berkembang!
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari mentor-mu di sini"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="px-6 py-4 overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentors.map((mentor) => (
              <Card
                key={mentor.id}
                className="overflow-hidden hover:shadow-md transition-shadow p-0"
              >
                <div className="relative">
                  <Image
                    src={mentor.image}
                    alt={mentor.name}
                    width={150}
                    height={150}
                    className="w-full h-32 object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {mentor.name}
                  </h3>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-400 rounded-sm flex-shrink-0"></div>
                      <span className="text-xs text-gray-600">
                        {mentor.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-400 rounded-sm flex-shrink-0"></div>
                      <span className="text-xs text-gray-600">
                        {mentor.experience}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-400 rounded-sm flex-shrink-0"></div>
                      <span className="text-xs text-gray-600">
                        {mentor.skills.join(", ")}
                      </span>
                    </div>
                  </div>

                  {/* CTA to Modal Booking Mentor - 2 */}
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-2"
                  >
                    Daftar Mentoring
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center py-4">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* Mentor Selection Modal */}
        <MentorScheduleSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
