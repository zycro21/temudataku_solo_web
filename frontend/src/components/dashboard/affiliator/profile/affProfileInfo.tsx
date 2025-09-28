"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface UserData {
  id: string;
  email: string;
  fullName?: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export default function AffProfileInfo() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalPendapatan, setTotalPendapatan] = useState<number>(0);
  const [totalPenggunaKode, setTotalPenggunaKode] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        // 1. Ambil user
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setUser(res.data.data);
        }

        // 2. Ambil semua referral code affiliator
        const refRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/referral-codes`,
          { withCredentials: true }
        );

        if (
          refRes.data.success &&
          refRes.data.data?.referralCodes?.length > 0
        ) {
          const referralCodes = refRes.data.data.referralCodes;

          // Hitung total pendapatan
          const firstId = referralCodes[0].id;
          const comRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/referral-codes-commissions/${firstId}`,
            { withCredentials: true }
          );

          if (comRes.data.success) {
            const commissions = comRes.data.data.commissions || [];
            const total = commissions.reduce(
              (sum: number, c: any) => sum + (c.amount || 0),
              0
            );
            setTotalPendapatan(total);
          }

          // Hitung total pengguna kode
          let totalUsage = 0;
          for (const rc of referralCodes) {
            const usageRes = await axios.get(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/referral-codes-usages/${rc.id}`,
              { withCredentials: true }
            );
            if (usageRes.data.success) {
              totalUsage += usageRes.data.data.pagination?.total || 0;
            }
          }
          setTotalPenggunaKode(totalUsage);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        toast.error("Gagal mengambil data affiliator");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndData();
  }, []);

  const handleVerify = async () => {
    if (!user?.email) return;
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/resend-verification`,
        { email: user.email },
        { withCredentials: true }
      );
      toast.success("Email verifikasi telah dikirim ulang!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal mengirim verifikasi");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/update`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        toast.success("Foto profil berhasil diperbarui!");
        // Update UI dengan foto baru
        setUser((prev) =>
          prev
            ? {
                ...prev,
                profilePicture: res.data.updatedFields.includes(
                  "profilePicture"
                )
                  ? file.name
                  : prev.profilePicture,
              }
            : prev
        );
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Gagal memperbarui foto profil"
      );
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const avatarSrc =
    user?.profilePicture && user.profilePicture !== "default.jpg"
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${user.profilePicture}`
      : "/assets/dashboard/user/avatar.png";

  const displayName = user?.fullName || "Affiliator User";

  // Format tanggal member sejak (contoh: Sep 2025)
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleString("id-ID", {
        month: "short",
        year: "numeric",
      })
    : "-";

  return (
    <Card className="p-8 shadow-sm border border-gray-200 bg-gray-50 text-center">
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-1 border-green-600 overflow-hidden">
            <Image
              src={avatarSrc}
              alt="Avatar"
              width={80}
              height={80}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          {/* Input file hidden */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {/* Tombol Edit */}
          <button
            className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs text-emerald-600 flex items-center space-x-1 hover:underline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Pencil className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>

        {/* Nama & Affiliate ID */}
        <h2 className="mt-12 text-2xl font-bold text-gray-900">
          {displayName}
        </h2>
        <p className="text-sm text-gray-500">Affiliate ID: {user?.id}</p>

        {/* Tombol Verifikasi */}
        <Button
          className="p-3 mt-4 w-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-sm text-md font-medium"
          disabled={user?.isEmailVerified}
          onClick={handleVerify}
          style={{ cursor: user?.isEmailVerified ? "not-allowed" : "pointer" }}
        >
          {user?.isEmailVerified
            ? "Akun telah terverifikasi"
            : "Verifikasi Akun"}
        </Button>
      </div>

      {/* Info Tambahan */}
      <div className="mt-1 space-y-3 text-sm text-left">
        <div className="flex justify-between">
          <span className="text-gray-500">Total Pendapatan</span>
          <span className="font-medium text-gray-800">
            Rp{totalPendapatan.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Pengguna Kode</span>
          <span className="font-medium text-gray-800">
            {totalPenggunaKode} orang
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Member Sejak</span>
          <span className="font-medium text-gray-800">{memberSince}</span>
        </div>
      </div>
    </Card>
  );
}
