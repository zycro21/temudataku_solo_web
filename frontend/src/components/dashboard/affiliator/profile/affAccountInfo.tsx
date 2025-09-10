"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AffAccountInfo() {
  return (
    <Card className="p-8 shadow-sm border border-gray-200 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        Informasi Pribadi
      </h2>

      <form className="space-y-5">
        {/* Nama Lengkap */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm text-gray-700">
            Nama Lengkap
          </Label>
          <Input
            id="fullName"
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
            placeholder="Masukkan Domisili Kamu"
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
