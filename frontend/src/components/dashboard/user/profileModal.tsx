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

  const isExternalImage =
    avatarUrl.startsWith("http") || avatarUrl.startsWith("https");

  // safe phone display: cek string & trim sebelum split
  const phoneDisplay =
    typeof currentUser?.phoneNumber === "string" &&
    currentUser.phoneNumber.trim() !== ""
      ? currentUser.phoneNumber.trim().split(/\s+/)[0]
      : "-";

  // 🔥 BARU: dipakai KHUSUS buat list detail versi mobile di bawah —
  // sumber datanya sama persis dengan yang dipakai grid detail desktop,
  // cuma diringkas jadi array biar gampang di-map jadi baris list.
  const detailRows = [
    { label: "Nama Lengkap", value: currentUser?.fullName || "-" },
    { label: "Email", value: currentUser?.email || "-" },
    { label: "No Telepon", value: phoneDisplay },
    {
      label: "Peran",
      value: currentUser?.userRoles?.[0]?.role?.roleName || "-",
    },
    { label: "ID Mentee", value: currentUser?.id || "-" },
    {
      label: "Status Akun",
      value: currentUser?.isActive ? "Aktif" : "Tidak Aktif",
    },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-xl w-full max-h-[90vh] overflow-y-auto p-4"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header */}
          <DialogHeader className="flex justify-between items-start mt-2">
            <DialogTitle>Detail Mentee</DialogTitle>
            <DialogClose />
          </DialogHeader>

          <div className="border-b border-gray-200 mb-1" />

          {/* 🔥 BARU: header profil ringkas KHUSUS mobile (sm:hidden) —
              avatar bulat + nama + peran, menggantikan foto kotak besar
              di bawah (yang disembunyikan di mobile). */}
          <div className="sm:hidden flex flex-col items-center text-center gap-2 py-3">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
              <Image
                src={avatarUrl}
                alt="Foto Mentee"
                width={80}
                height={80}
                unoptimized
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {currentUser?.fullName || "-"}
              </p>
              <p className="text-[11px] text-gray-500">
                {currentUser?.userRoles?.[0]?.role?.roleName || "-"}
              </p>
            </div>
          </div>

          {/* Foto Mentee — BLOK ASLI, TIDAK diubah sama sekali, cuma
              dibungkus "hidden sm:block" biar disembunyikan di mobile
              (digantikan header profil di atas) dan tampil PERSIS seperti
              semula mulai breakpoint sm ke atas. */}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-600 mb-2">
              Foto Mentee
            </p>
            <div className="w-full h-[160px] rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image
                src={avatarUrl}
                alt="Foto Mentee"
                width={400}
                height={250}
                unoptimized
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Detail — DESKTOP: grid 2 kolom ASLI, TIDAK diubah sama
              sekali, cuma dibungkus "hidden sm:grid" (dulu "grid" polos)
              supaya hasil visualnya di sm: ke atas 100% sama seperti
              semula. */}
          <div className="hidden sm:grid sm:grid-cols-2 gap-4 text-xs mt-4 min-w-0">
            {/* Kiri */}
            <div className="space-y-6">
              <div>
                <p className="font-medium text-gray-600">ID Mentee</p>
                <p className="font-semibold break-words">
                  {currentUser?.id || "-"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-600">No Telepon</p>
                <p className="font-semibold break-words">{phoneDisplay}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Peran</p>
                <p className="font-semibold break-words">
                  {currentUser?.userRoles?.[0]?.role?.roleName || "-"}
                </p>
              </div>
            </div>

            {/* Kanan */}
            <div className="space-y-6">
              <div>
                <p className="font-medium text-gray-600">Nama Lengkap</p>
                <p className="font-semibold break-words">
                  {currentUser?.fullName || "-"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Email</p>
                <p className="font-semibold break-words">
                  {currentUser?.email || "-"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Status Akun</p>
                <p className="font-semibold break-words">
                  {currentUser?.isActive ? "Aktif" : "Tidak Aktif"}
                </p>
              </div>
            </div>
          </div>

          {/* 🔥 BARU: versi mobile detail — list 1 kolom dengan garis
              pemisah antar baris (divide-y), lebih lega dibaca di layar
              sempit dibanding grid 2 kolom yang kepotong. */}
          <div className="sm:hidden mt-2 divide-y divide-gray-100 text-xs">
            {detailRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <p className="font-medium text-gray-500 shrink-0">
                  {row.label}
                </p>
                <p className="font-semibold text-gray-900 text-right break-words">
                  {row.value}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6">
            <Button
              onClick={handleEditClick}
              className="w-full text-sm py-2 bg-emerald-500 hover:bg-emerald-600 text-white"
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
