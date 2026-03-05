"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SuccessModal from "./profileSuccessModal";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileModal({
  open,
  onOpenChange,
}: EditProfileModalProps) {
  const router = useRouter();

  // state untuk data user
  const [userData, setUserData] = useState<any>(null);

  // inputan yang bisa diubah
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  // foto profil
  const [preview, setPreview] = useState(
    "/assets/dashboard/user/viewprofile.png"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [successOpen, setSuccessOpen] = useState(false);

  // 🔹 Ambil data user saat modal dibuka
  useEffect(() => {
    if (open) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
        })
        .then((res) => {
          const data = res.data?.data;
          setUserData(data);

          setPhoneNumber(data?.phoneNumber || "-");
          setEmail(data?.email || "-");

          const avatarUrl =
            data?.profilePicture && data?.profilePicture !== "default.jpg"
              ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${data.profilePicture}`
              : "/assets/dashboard/user/avatar.png";

          setPreview(avatarUrl);
        })
        .catch(() => {
          setUserData(null);
        });
    }
  }, [open]);

  // 🔹 Simpan perubahan
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber);
      formData.append("email", email);
      if (selectedFile) {
        formData.append("profilePicture", selectedFile);
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/update`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      onOpenChange(false);
      setSuccessOpen(true);
      router.refresh(); // refresh halaman biar data terbaru kebawa
    } catch (err: any) {
      console.error("Update profile error:", err);
      alert(
        err.response?.data?.message ||
          "Gagal memperbarui profil. Coba lagi nanti."
      );
    }
  };

  // batal edit
  const handleCancel = () => {
    onOpenChange(false);
  };

  // upload foto
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Hanya file JPG, JPEG, atau PNG yang diperbolehkan.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header */}
          <DialogHeader className="flex justify-between items-start">
            <DialogTitle>Edit Mentee</DialogTitle>
            <DialogClose />
          </DialogHeader>

          <div className="border-b border-gray-200 my-1" />

          {/* Foto Mentee */}
          <div>
            <p className="text-base font-bold text-gray-800 mb-2 ml-1">
              Foto Mentee
            </p>
            <div className="flex items-center gap-4">
              <div className="w-[80px] h-[80px] rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={preview}
                  alt="Foto Mentee"
                  width={80}
                  height={80}
                  unoptimized
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleUploadClick}>
                    Unggah Foto
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      setPreview("/assets/dashboard/user/avatar.png")
                    }
                  >
                    Hapus
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  File png atau jpg maks 4MB
                </p>
              </div>
            </div>
            {/* Hidden Input File */}
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Form */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="col-span-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <input
                type="text"
                value={userData?.fullName || "-"}
                disabled
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Nomor Telepon</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Peran</label>
              <input
                type="text"
                value={userData?.userRoles?.[0]?.role?.roleName || "-"}
                disabled
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status Akun</label>
              <input
                type="text"
                value={userData?.isActive ? "Aktif" : "Nonaktif"}
                disabled
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-4 mt-6 justify-center">
            <Button
              variant="outline"
              className="flex-1 max-w-[200px] border-emerald-500 text-emerald-500 hover:bg-emerald-50"
              onClick={handleCancel}
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

      {/* Modal Success */}
      <SuccessModal open={successOpen} onOpenChange={setSuccessOpen} />
    </>
  );
}
