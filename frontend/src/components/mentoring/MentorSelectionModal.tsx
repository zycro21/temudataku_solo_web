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
          className="sm:max-w-3xl h-[85vh] flex flex-col p-0"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {/* Header */}
          <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Pilih Mentor Favorit-mu!
              </DialogTitle>
              <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                Temukan mentor yang paling cocok buat kamu. Lihat profil mereka
                dan pilih yang paling pas.
              </p>
            </div>
          </DialogHeader>

          {/* Search */}
          <div className="px-4 pb-3 border-b flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Cari mentor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {mentors.length === 0 && loading ? (
              <div className="text-center py-6 text-sm">Memuat mentor...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {mentors.map((mentor) => (
                  <Card
                    key={mentor.id}
                    className="overflow-hidden hover:shadow-sm transition p-0 rounded-md"
                  >
                    {/* Image */}
                    <div className="relative h-32">
                      <Image
                        src={
                          mentor.user.profilePicture
                            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${mentor.user.profilePicture}`
                            : "/assets/default-avatar.png"
                        }
                        alt={mentor.user.fullName}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    <CardContent className="pt-2 pb-3 px-3">
                      <h3 className="font-semibold text-sm text-gray-900 mb-1.5 line-clamp-1">
                        {mentor.user.fullName}
                      </h3>

                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-start gap-1.5">
                          <Image
                            src="/assets/mentoringPage/expertise.svg"
                            alt="Bio"
                            width={10}
                            height={10}
                            className="mt-0.5 flex-shrink-0"
                          />
                          <span className="text-[8px] text-gray-600 leading-snug line-clamp-2">
                            {getFirstSentence(mentor.bio)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Image
                            src="/assets/mentoringPage/experience.svg"
                            alt="Experience"
                            width={10}
                            height={10}
                          />
                          <span className="text-[8px] text-gray-600 line-clamp-1">
                            {mentor.experience || "-"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Image
                            src="/assets/mentoringPage/language.svg"
                            alt="Expertise"
                            width={10}
                            height={10}
                          />
                          <span className="text-[8px] text-gray-600 line-clamp-1">
                            {mentor.expertise || "-"}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleSelectMentor(mentor)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-[34px]"
                      >
                        Daftar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Dots (NOW ALWAYS VISIBLE) */}
          <div className="flex justify-center py-3 border-t flex-shrink-0">
            <div className="flex space-x-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
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
