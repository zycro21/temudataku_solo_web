"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Image from "next/image";

export default function AffProfileInfo() {
  return (
    <Card className="p-8 shadow-sm border border-gray-200 bg-gray-50 text-center">
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Wrapper dengan border lingkaran */}
          <div className="h-20 w-20 rounded-full border-1 border-green-600 overflow-hidden">
            <Image
              src="/assets/dashboard/affiliator/profile.svg"
              alt="Avatar"
              width={80}
              height={80}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          <button className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs text-emerald-600 flex items-center space-x-1 hover:underline">
            <Pencil className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>

        {/* Nama & Affiliate ID */}
        <h2 className="mt-12 text-2xl font-bold text-gray-900">Gilang Dirga</h2>
        <p className="text-sm text-gray-500">Affiliate ID: GILANG1717</p>

        {/* Tombol Verifikasi */}
        <Button className="p-3 mt-4 w-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-sm text-md font-medium">
          Verifikasi Akun
        </Button>
      </div>

      {/* Info Tambahan */}
      <div className="mt-1 space-y-3 text-sm text-left">
        <div className="flex justify-between">
          <span className="text-gray-500">Total Pendapatan</span>
          <span className="font-medium text-gray-800">Rp1.500.000,00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Pengguna Kode</span>
          <span className="font-medium text-gray-800">150 orang</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Member Sejak</span>
          <span className="font-medium text-gray-800">Jan 2019</span>
        </div>
      </div>
    </Card>
  );
}
