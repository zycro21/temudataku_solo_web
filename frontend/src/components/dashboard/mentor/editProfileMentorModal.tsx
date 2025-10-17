"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SuccessModal from "./profileMentorSuccessModal";

interface EditProfileMentorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileMentorModal({
  open,
  onOpenChange,
}: EditProfileMentorModalProps) {
  const router = useRouter();

  const [mentorData, setMentorData] = useState<any>(null);
  const [expertise, setExpertise] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [availabilitySchedule, setAvailabilitySchedule] = useState<{
    [key: string]: string[];
  }>({});
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (open) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentor/ownProfile`, {
          withCredentials: true,
        })
        .then((res) => {
          const data = res.data.data;
          setMentorData(data);
          setExpertise(data.expertise || "");
          setBio(data.bio || "");
          setExperience(data.experience || "");
          setAvailabilitySchedule(data.availabilitySchedule || {});
          setHourlyRate(data.hourlyRate || 0);
        })
        .catch(() => setMentorData(null));
    }
  }, [open]);

  const handleSave = async () => {
    const payload: any = {
      expertise,
      bio,
      experience,
      availabilitySchedule,
      hourlyRate,
    };

    try {
      // Cek dulu apakah mentor profile sudah ada
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentor/ownProfile`,
        { withCredentials: true }
      );
      const profileExists = !!res.data.data;

      if (profileExists) {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentor/profile`,
          payload,
          { withCredentials: true }
        );
        toast.success("Profil mentor berhasil diperbarui!");
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentor/mentor/profile`,
          payload,
          { withCredentials: true }
        );
        toast.success("Profil mentor berhasil dibuat!");
      }

      onOpenChange(false);
      setSuccessOpen(true);
      router.refresh();
    } catch (err: any) {
      console.error("Save mentor profile error:", err);
      toast.error(
        err.response?.data?.message || "Gagal menyimpan profil mentor."
      );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-2xl max-h-[90vh] p-0 flex flex-col"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header sticky dengan padding lebih nyaman */}
          <DialogHeader className="flex justify-between items-start p-6 pt-5 pb-1">
            <DialogTitle>Edit Profil Mentor</DialogTitle>
            <DialogClose />
          </DialogHeader>

          <div className="border-b border-gray-200 my-0" />

          {/* Konten scrollable */}
          <div className="flex-1 overflow-y-auto p-4 pt-2 pb-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">
                  Keahlian / Expertise
                </label>
                <input
                  type="text"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  placeholder="UI/UX Design"
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Creative designer focused on user-centered design principles."
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:border-emerald-500 resize-none"
                  rows={3}
                ></textarea>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium">Pengalaman</label>
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="5 years"
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:border-emerald-500 resize-none"
                  rows={2}
                ></textarea>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium">Rate per Jam</label>
                <input
                  type="text"
                  value={hourlyRate === 0 ? "" : hourlyRate}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ""); // hanya angka
                    setHourlyRate(val ? Number(val) : 0);
                  }}
                  placeholder="85, Mean: 85000"
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:border-emerald-500 
      [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium">
                  Jadwal Ketersediaan
                </label>
                <div className="space-y-3 mt-2 border rounded-md p-3">
                  {[
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday",
                  ].map((day) => (
                    <div key={day} className="flex items-start gap-3">
                      {/* Nama hari */}
                      <span className="w-28 capitalize font-medium">{day}</span>

                      {/* Slot jadwal */}
                      <div className="flex-1 flex flex-wrap gap-2">
                        {(availabilitySchedule[day] || []).map((slot, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1 border rounded px-2 py-1 bg-gray-50"
                          >
                            <input
                              type="text"
                              value={slot}
                              onChange={(e) => {
                                const newSchedule = { ...availabilitySchedule };
                                newSchedule[day][i] = e.target.value;
                                setAvailabilitySchedule(newSchedule);
                              }}
                              placeholder="08.00 - 10.00"
                              className="border-none p-0 w-28 text-sm focus:ring-0 bg-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newSchedule = { ...availabilitySchedule };
                                newSchedule[day].splice(i, 1);
                                setAvailabilitySchedule(newSchedule);
                              }}
                              className="text-red-500 font-bold"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newSchedule = { ...availabilitySchedule };
                            if (!newSchedule[day]) newSchedule[day] = [];
                            newSchedule[day].push("");
                            setAvailabilitySchedule(newSchedule);
                          }}
                          className="text-emerald-600 text-sm font-medium hover:underline"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer sticky di bawah modal */}
          <div className="flex gap-4 mt-2 p-4 py-6 justify-center border-t border-gray-200">
            <Button
              variant="outline"
              className="flex-1 max-w-[200px] border-emerald-500 text-emerald-500 hover:bg-emerald-50"
              onClick={() => onOpenChange(false)}
            >
              Batalkan Perubahan
            </Button>
            <Button
              className="flex-1 max-w-[200px] bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={handleSave}
            >
              Simpan Perubahan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SuccessModal open={successOpen} onOpenChange={setSuccessOpen} />
    </>
  );
}
