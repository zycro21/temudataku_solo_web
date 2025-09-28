"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AffAccountInfo() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (fullName.trim()) formData.append("fullName", fullName);
      if (phoneNumber.trim()) formData.append("phoneNumber", phoneNumber);
      if (city.trim()) formData.append("city", city);

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
        toast.success("Informasi berhasil diperbarui, Refresh Website Anda");
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Gagal memperbarui informasi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 shadow-sm border border-gray-200 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        Informasi Pribadi
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nama Lengkap */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm text-gray-700">
            Nama Lengkap
          </Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Masukkan Nama Lengkap Kamu"
            className="bg-gray-50"
          />
        </div>

        {/* Nomor Telepon */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm text-gray-700">
            Nomor Telepon
          </Label>
          <Input
            id="phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Masukkan No HP Kamu (Ex: 08xxxxxxxxx)"
            className="bg-gray-50"
          />
        </div>

        {/* Domisili */}
        <div className="space-y-2">
          <Label htmlFor="domicile" className="text-sm text-gray-700">
            Domisili
          </Label>
          <Input
            id="domicile"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Masukkan Domisili Kamu"
            className="bg-gray-50"
          />
        </div>

        {/* Tombol */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg py-4 font-medium"
        >
          {loading ? "Menyimpan..." : "Perbarui Informasi"}
        </Button>
      </form>
    </Card>
  );
}
