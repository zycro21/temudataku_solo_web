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
import { toast } from "sonner";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileModal({
  open,
  onOpenChange,
}: EditProfileModalProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // state untuk data user
  const [userData, setUserData] = useState<any>(null);

  // inputan yang bisa diubah
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  // foto profil
  const [preview, setPreview] = useState(
    "/assets/dashboard/user/viewprofile.png",
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

          setPhoneNumber(data?.phoneNumber || "");
          setEmail(data?.email || "");

          // fallback avatar (support google + backend + default)
          const avatarUrl = (() => {
            if (!data?.profilePicture) {
              return "/assets/dashboard/user/avatar.png";
            }

            if (data.profilePicture.startsWith("http")) {
              return data.profilePicture;
            }

            return `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${data.profilePicture}`;
          })();

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

      if (phoneNumber && phoneNumber !== userData?.phoneNumber) {
        formData.append("phoneNumber", phoneNumber);
      }

      if (email && email !== userData?.email) {
        formData.append("email", email);
      }

      if (selectedFile) {
        formData.append("profilePicture", selectedFile);
      }

      if (Array.from(formData.keys()).length === 0) {
        toast.info("Tidak ada perubahan yang disimpan.");
        return;
      }

      setLoading(true);

      const toastId = toast.loading("Menyimpan perubahan...");

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/update`,
        formData,
        {
          withCredentials: true,
        },
      );

      toast.success("Profil berhasil diperbarui.", { id: toastId });

      onOpenChange(false);
      setSuccessOpen(true);
      router.refresh();
    } catch (err: any) {
      console.error("Update profile error:", err);

      toast.error(
        err.response?.data?.message ||
          "Gagal memperbarui profil. Coba lagi nanti.",
      );
    } finally {
      setLoading(false);
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
      toast.error("Hanya file JPG, JPEG, atau PNG yang diperbolehkan.");
    }
  };

  const isExternalImage =
    preview?.startsWith("http://") || preview?.startsWith("https://");

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          // PERBAIKAN: Hapus overflow-y-auto dari sini agar kontainer utama tidak scroll.
          // Ditambahkan 'flex flex-col' untuk mengatur layout header, konten, dan footer.
          className="sm:max-w-xl w-full max-h-[90vh] p-0 overflow-hidden flex flex-col"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header - Sticky secara alami karena tidak masuk dalam area scroll */}
          <div className="px-5 py-4 border-b border-gray-200">
            <DialogHeader className="flex justify-between items-start">
              <DialogTitle className="text-base font-semibold">
                Edit Mentee
              </DialogTitle>
              <DialogClose />
            </DialogHeader>
          </div>

          {/* Area Konten - Bagian ini yang bisa discroll */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* Foto Mentee */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Foto Mentee
              </p>

              <div className="flex items-center gap-3">
                <div className="w-[70px] h-[70px] rounded-full overflow-hidden bg-gray-100">
                  <Image
                    src={preview}
                    alt="Foto Mentee"
                    width={70}
                    height={70}
                    unoptimized
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUploadClick}
                    >
                      Unggah
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setPreview("/assets/dashboard/user/avatar.png")
                      }
                    >
                      Hapus
                    </Button>
                  </div>

                  <p className="text-[10px] text-gray-500 ml-1">
                    PNG/JPG max 4MB
                  </p>
                </div>
              </div>

              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Form */}
            <div className="grid grid-cols-2 gap-3 mt-5 text-sm min-w-0">
              <div className="col-span-2">
                <label className="text-xs font-medium">Nama Lengkap</label>
                <input
                  type="text"
                  value={userData?.fullName || "-"}
                  disabled
                  className="w-full mt-1 px-2.5 py-1.5 border rounded-md text-xs bg-gray-100"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-medium">Nomor Telepon</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 border rounded-md text-xs"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 border rounded-md text-xs break-all"
                />
              </div>

              <div className="min-w-0">
                <label className="text-xs font-medium">Peran</label>
                <input
                  type="text"
                  value={userData?.userRoles?.[0]?.role?.roleName || "-"}
                  disabled
                  className="w-full mt-1 px-2.5 py-1.5 border rounded-md text-xs bg-gray-100"
                />
              </div>

              <div className="min-w-0">
                <label className="text-xs font-medium">Status Akun</label>
                <input
                  type="text"
                  value={userData?.isActive ? "Aktif" : "Nonaktif"}
                  disabled
                  className="w-full mt-1 px-2.5 py-1.5 border rounded-md text-xs bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Footer - Sticky di bawah */}
          <div className="px-5 py-4 border-t border-gray-200">
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 max-w-[160px] border-emerald-500 text-emerald-500 hover:bg-emerald-50"
                onClick={handleCancel}
              >
                Batal
              </Button>

              <Button
                size="sm"
                disabled={loading}
                className="flex-1 max-w-[160px] bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={handleSave}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Success */}
      <SuccessModal open={successOpen} onOpenChange={setSuccessOpen} />
    </>
  );
}
