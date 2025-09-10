"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AffSecuritySettings() {
  return (
    <Card className="p-8 shadow-sm border border-gray-200 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        Akun Sosial Media
      </h2>

      <form className="space-y-5">
        {/* Instagram */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm text-gray-700">
            Instagram
          </Label>
          <Input
            id="instagram"
            placeholder="Masukkan ID Instagram Kamu"
            className="bg-gray-50"
          />
        </div>

        {/* Tiktok*/}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm text-gray-700">
            TikTok
          </Label>
          <Input
            id="tiktok"
            placeholder="Masukkan ID Tiktok Kamu"
            className="bg-gray-50"
          />
        </div>

        {/* Youtube */}
        <div className="space-y-2">
          <Label htmlFor="domicile" className="text-sm text-gray-700">
            Youtube
          </Label>
          <Input
            id="youtube"
            placeholder="Masukkan Nama Channel Youtube Kamu"
            className="bg-gray-50"
          />
        </div>

        {/* Tombol */}
        <Button className="w-full bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg py-4 font-medium">
          Perbarui Informasi
        </Button>
      </form>
    </Card>
  );
}
