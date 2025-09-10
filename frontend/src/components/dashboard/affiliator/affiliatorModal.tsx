"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// import EditProfileModal from "./editProfileModal";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileModal({
  open,
  onOpenChange,
}: ProfileModalProps) {
  return (
    <>
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

          {/* Foto Mentee */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Foto Affiliator
            </p>
            <div className="w-full h-[220px] rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image
                src="/assets/dashboard/user/viewprofile.png"
                alt="Foto Mentee"
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
                <p className="font-medium text-gray-600">ID Affiliator</p>
                <p className="font-semibold">ABCD12</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Username</p>
                <p className="font-semibold">Lana D</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Peran</p>
                <p className="font-semibold">Affiliator</p>
              </div>
            </div>

            {/* Kanan */}
            <div className="space-y-6">
              <div>
                <p className="font-medium text-gray-600">Nama Lengkap</p>
                <p className="font-semibold">Lana Del</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Email</p>
                <p className="font-semibold">Lanadel@gmail.com</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Status Akun</p>
                <p className="font-semibold">Aktif</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
