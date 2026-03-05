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
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import MentorScheduleSelectionModal from "./MentorScheduleSelectionModal";

interface Service {
  id: string;
  serviceName: string;
  price: number;
  serviceType: string;
  mentors?: any[];
}

interface Mentor {
  id: string; // mentorProfileId
  expertise: string | null;
  bio: string | null;
  experience: string | null;
  hourlyRate: number | null;
  availabilitySchedule: any;
  user: {
    id: string;
    fullName: string;
    profilePicture: string | null;
    city: string | null;
    province: string | null;
  };
}

interface MentorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
}

export default function MentorSelectionModal({
  isOpen,
  onClose,
  service,
}: MentorSelectionModalProps) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400); // delay 400ms

    return () => clearTimeout(handler);
  }, [search]);

  // FETCH MENTORS FROM API
  useEffect(() => {
    if (!isOpen) return;

    const fetchMentors = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentor/mentors`,
          {
            params: {
              page: 1,
              limit: 50,
              search: debouncedSearch || undefined,
            },
          },
        );

        setMentors(response.data.data.mentors);
      } catch (error) {
        console.error("Failed to fetch mentors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [isOpen, debouncedSearch]);

  const handleSelectMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsModalOpen(true);
  };

  const getFirstSentence = (text?: string | null) => {
    if (!text) return "-";
    const sentence = text.split(".")[0].trim();
    return sentence ? sentence + "." : "-";
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0"
          onInteractOutside={(e) => {
            e.preventDefault(); // prevent close on outside click
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault(); // prevent close on ESC
          }}
        >
          {/* Modal Header */}
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Pilih Mentor Favorit-mu!
                </DialogTitle>
                <p className="text-gray-600 text-sm mt-1">
                  Temukan mentor yang paling cocok buat kamu. Lihat profil
                  mereka, cek pengalaman dan pilih yang paling pas untuk bantu
                  kamu berkembang!
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Search Bar (Tetap dipertahankan) */}
          <div className="px-6 pb-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari mentor-mu di sini"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Mentors Grid */}
          <div className="px-6 py-4 overflow-y-auto max-h-96">
            {mentors.length === 0 && loading ? (
              <div className="text-center py-10">Memuat mentor...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentors.map((mentor) => (
                  <Card
                    key={mentor.id}
                    className="overflow-hidden hover:shadow-md transition-shadow p-0"
                  >
                    <div className="relative">
                      <Image
                        src={
                          mentor.user.profilePicture
                            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${mentor.user.profilePicture}`
                            : "/assets/default-avatar.png"
                        }
                        alt={mentor.user.fullName}
                        width={150}
                        height={150}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <CardContent className="pt-0 pb-4 px-4">
                      {/* Full Name - lebih dekat ke gambar */}
                      <h3 className="font-bold text-gray-900 mb-2">
                        {mentor.user.fullName}
                      </h3>

                      <div className="space-y-2 mb-3">
                        {/* BIO (gantikan expertise lama) */}
                        <div className="flex items-start gap-2">
                          <Image
                            src="/assets/mentoringPage/expertise.svg"
                            alt="Bio"
                            width={12}
                            height={12}
                            className="mt-1 flex-shrink-0"
                          />
                          <span className="text-xs text-gray-600 leading-relaxed">
                            {getFirstSentence(mentor.bio)}
                          </span>
                        </div>

                        {/* Experience tetap */}
                        <div className="flex items-center gap-2">
                          <Image
                            src="/assets/mentoringPage/experience.svg"
                            alt="Experience"
                            width={12}
                            height={12}
                            className="flex-shrink-0"
                          />
                          <span className="text-xs text-gray-600">
                            {mentor.experience || "-"}
                          </span>
                        </div>

                        {/* Expertise (gantikan hourly rate) */}
                        <div className="flex items-center gap-2">
                          <Image
                            src="/assets/mentoringPage/language.svg"
                            alt="Expertise"
                            width={12}
                            height={12}
                            className="flex-shrink-0"
                          />
                          <span className="text-xs text-gray-600">
                            {mentor.expertise || "-"}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleSelectMentor(mentor)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-2"
                      >
                        Daftar Mentoring
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Dots Indicator (Tetap dipertahankan) */}
          <div className="flex justify-center py-4">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mentor Schedule Modal */}
      <MentorScheduleSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mentor={selectedMentor}
        service={service}
      />
    </>
  );
}
