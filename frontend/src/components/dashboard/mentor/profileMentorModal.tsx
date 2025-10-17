"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EditProfileModal from "./editProfileModalMentor";
import EditProfileMentorModal from "./editProfileMentorModal";

interface ProfileMentorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserData {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  profilePicture: string | null;
  isActive: boolean;
  userRoles: { role: { roleName: string } }[];
}

export default function ProfileMentorModal({
  open,
  onOpenChange,
}: ProfileMentorModalProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [editProfileMentorOpen, setEditProfileMentorOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  // Ambil data user saat modal dibuka
  useEffect(() => {
    if (open) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
        })
        .then((res) => setCurrentUser(res.data.data))
        .catch(() => setCurrentUser(null));
    }
  }, [open]);

  const handleEditClick = () => {
    onOpenChange(false);
    setTimeout(() => setEditOpen(true), 200);
  };

  const handleEditProfileMentorClick = () => {
    onOpenChange(false);
    setTimeout(() => setEditProfileMentorOpen(true), 200);
  };

  // Fallback avatar
  const avatarUrl =
    currentUser?.profilePicture && currentUser.profilePicture !== "default.jpg"
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${currentUser.profilePicture}`
      : "/assets/dashboard/user/avatar.png";

  // safe phone display
  const phoneDisplay =
    typeof currentUser?.phoneNumber === "string" &&
    currentUser.phoneNumber.trim() !== ""
      ? currentUser.phoneNumber.trim().split(/\s+/)[0]
      : "-";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header */}
          <DialogHeader className="flex justify-between items-start">
            <DialogTitle>Detail Mentor</DialogTitle>
            <DialogClose />
          </DialogHeader>

          <div className="border-b border-gray-200 my-1" />

          {/* Foto Mentor */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Foto Mentor
            </p>
            <div className="w-full h-[220px] rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image
                src={avatarUrl}
                alt="Foto Mentor"
                width={400}
                height={250}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Detail */}
          <div className="grid grid-cols-2 gap-6 text-sm mt-6">
            {/* Kiri */}
            <div className="space-y-6">
              <div>
                <p className="font-medium text-gray-600">ID Mentor</p>
                <p className="font-semibold">{currentUser?.id || "-"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">No Telepon</p>
                <p className="font-semibold">{phoneDisplay}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Peran</p>
                <p className="font-semibold">
                  {currentUser?.userRoles?.[0]?.role?.roleName || "-"}
                </p>
              </div>
            </div>

            {/* Kanan */}
            <div className="space-y-6">
              <div>
                <p className="font-medium text-gray-600">Nama Lengkap</p>
                <p className="font-semibold">{currentUser?.fullName || "-"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Email</p>
                <p className="font-semibold">{currentUser?.email || "-"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Status Akun</p>
                <p className="font-semibold">
                  {currentUser?.isActive ? "Aktif" : "Tidak Aktif"}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-4 mt-6">
            {/* Tombol Edit Biasa */}
            <Button
              onClick={handleEditClick}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Edit
            </Button>

            {/* Tombol Edit Profil Mentor */}
            <Button
              onClick={handleEditProfileMentorClick}
              variant="outline"
              className="flex-1 border-emerald-500 text-emerald-500 hover:bg-emerald-50"
            >
              Edit Profil Mentor
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Edit */}
      <EditProfileModal open={editOpen} onOpenChange={setEditOpen} />

      {/* Modal Edit Profil Mentor */}
      <EditProfileMentorModal open={editProfileMentorOpen} onOpenChange={setEditProfileMentorOpen} />
    </>
  );
}
