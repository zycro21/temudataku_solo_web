"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";

export default function AffSecuritySettings() {
  const [form, setForm] = useState({
    instagram: "",
    tiktok: "",
    youtube: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      if (form.instagram) formData.append("instagram", form.instagram);
      if (form.tiktok) formData.append("tiktok", form.tiktok);
      if (form.youtube) formData.append("youtube", form.youtube);

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/update`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Profil berhasil diperbarui, Refresh website anda");
    } catch (err: any) {
      if (err.response) {
        toast.error(err.response.data.message || "Gagal memperbarui profil");
      } else {
        toast.error("Terjadi kesalahan");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 shadow-sm border border-gray-200 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        Akun Sosial Media
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Instagram */}
        <div className="space-y-2">
          <Label htmlFor="instagram" className="text-sm text-gray-700">
            Instagram
          </Label>
          <Input
            id="instagram"
            placeholder="Masukkan ID Instagram Kamu"
            className="bg-gray-50"
            value={form.instagram}
            onChange={handleChange}
          />
        </div>

        {/* TikTok */}
        <div className="space-y-2">
          <Label htmlFor="tiktok" className="text-sm text-gray-700">
            TikTok
          </Label>
          <Input
            id="tiktok"
            placeholder="Masukkan ID Tiktok Kamu"
            className="bg-gray-50"
            value={form.tiktok}
            onChange={handleChange}
          />
        </div>

        {/* Youtube */}
        <div className="space-y-2">
          <Label htmlFor="youtube" className="text-sm text-gray-700">
            Youtube
          </Label>
          <Input
            id="youtube"
            placeholder="Masukkan Nama Channel Youtube Kamu"
            className="bg-gray-50"
            value={form.youtube}
            onChange={handleChange}
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
