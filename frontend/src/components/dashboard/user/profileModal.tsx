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
import EditProfileModal from "./editProfileModal";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserData {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null; // <-- tambahkan ini
  profilePicture: string | null;
  isActive: boolean;
  userRoles: { role: { roleName: string } }[];
}

export default function ProfileModal({
  open,
  onOpenChange,
}: ProfileModalProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  // Ambil data user saat modal dibuka
  useEffect(() => {
    if (open) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
        })
        .then((res) => {
          setCurrentUser(res.data.data);
        })
        .catch(() => {
          setCurrentUser(null);
        });
    }
  }, [open]);

  const handleEditClick = () => {
    onOpenChange(false);
    setTimeout(() => setEditOpen(true), 200);
  };

  // avatar fallback
  // avatar fallback (support google + backend + default)
  const avatarUrl = (() => {
    if (!currentUser?.profilePicture) {
      return "/assets/dashboard/user/avatar.png";
    }

    if (currentUser.profilePicture.startsWith("http")) {
      return currentUser.profilePicture;
    }

    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${currentUser.profilePicture}`;
  })();

  // safe phone display: cek string & trim sebelum split
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
            <DialogTitle>Detail Mentee</DialogTitle>
            <DialogClose />
          </DialogHeader>

          <div className="border-b border-gray-200 my-1" />

          {/* Foto Mentee */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Foto Mentee
            </p>
            <div className="w-full h-[220px] rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image
                src={avatarUrl}
                alt="Foto Mentee"
                width={400}
                height={250}
                // unoptimized
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Detail */}
          <div className="grid grid-cols-2 gap-6 text-sm mt-6">
            {/* Kiri */}
            <div className="space-y-6">
              <div>
                <p className="font-medium text-gray-600">ID Mentee</p>
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
          <div className="mt-6">
            <Button
              onClick={handleEditClick}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Edit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Edit */}
      <EditProfileModal open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
