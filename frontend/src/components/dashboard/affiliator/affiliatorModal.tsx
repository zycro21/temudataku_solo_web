"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  profilePicture: string | null;
  city: string | null;
  province: string | null;
  isEmailVerified: boolean;
  registrationDate: string;
  lastLogin: string;
  isActive: boolean;
  userRoles: { role: { id: string; roleName: string; description: string } }[];
}

export default function ProfileModal({
  open,
  onOpenChange,
}: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setProfile(res.data.data);
        } else {
          toast.error("Gagal memuat profil affiliator");
        }
      } catch (err) {
        console.error("Gagal fetch profil:", err);
        toast.error("Terjadi kesalahan saat memuat profil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="flex justify-between items-start">
          <DialogTitle>Detail Affiliator</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="border-b border-gray-200 my-1" />

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            {/* Foto Affiliator */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Foto Affiliator
              </p>
              <div className="w-full h-[220px] rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                <Image
                  src={
                    profile?.profilePicture
                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${profile.profilePicture}`
                      : "/assets/dashboard/user/viewprofile.png"
                  }
                  alt="Foto Affiliator"
                  width={400}
                  height={250}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
            </div>

            {/* Detail */}
            <div className="grid grid-cols-2 gap-6 text-sm mt-6">
              {/* Kiri */}
              <div className="space-y-6">
                <div>
                  <p className="font-medium text-gray-600">ID Affiliator</p>
                  <p className="font-semibold">{profile?.id || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Username</p>
                  <p className="font-semibold">
                    {profile?.fullName?.split(" ")[0] || "-"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Peran</p>
                  <p className="font-semibold">
                    {profile?.userRoles?.[0]?.role.roleName || "Affiliator"}
                  </p>
                </div>
              </div>

              {/* Kanan */}
              <div className="space-y-6">
                <div>
                  <p className="font-medium text-gray-600">Nama Lengkap</p>
                  <p className="font-semibold">{profile?.fullName || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Email</p>
                  <p className="font-semibold">{profile?.email || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Status Akun</p>
                  <p
                    className={`font-semibold ${
                      profile?.isActive ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {profile?.isActive ? "Aktif" : "Nonaktif"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
