"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectInput } from "@/components/ui/selectInput";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { regions } from "./region";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutForm() {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    city: "",
    province: "",
    phone: "",
    description: "",
    expectedOutput: "",
    supportingDocs: [] as File[],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        supportingDocs: [
          ...formData.supportingDocs,
          ...Array.from(e.target.files),
        ],
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setFormData({
      ...formData,
      supportingDocs: formData.supportingDocs.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Checkout form data:", formData);
    // TODO: kirim ke API
  };

  // Ambil list kota berdasarkan provinsi
  const cityOptions = formData.province ? regions[formData.province] : [];

  return (
    <form onSubmit={handleSubmit} className="p-6 pl-6 md:pl-10 space-y-6">
      <h2 className="text-2xl font-bold">Informasi Pemesanan</h2>
      {/* Email */}
      <div className="grid gap-2 max-w-4xl">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder="contoh@email.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      {/* Nama Lengkap */}
      <div className="grid gap-2 max-w-4xl">
        <label htmlFor="fullName" className="text-sm font-medium">
          Nama Lengkap
        </label>
        <Input
          type="text"
          id="fullName"
          name="fullName"
          placeholder="Masukkan nama lengkap"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>

      {/* Kota & Provinsi */}
      <div className="flex gap-4">
        {/* Provinsi */}
        <div className="flex flex-col w-1/3">
          <label htmlFor="province" className="text-sm font-medium mb-2">
            Provinsi
          </label>
          <SelectInput
            value={formData.province}
            onValueChange={
              (value) => setFormData({ ...formData, province: value, city: "" }) // reset kota kalau provinsi ganti
            }
            placeholder="Pilih provinsi"
          >
            <div className="max-h-40 overflow-y-auto">
              {Object.keys(regions).map((prov) => (
                <SelectItem key={prov} value={prov}>
                  {prov}
                </SelectItem>
              ))}
            </div>
          </SelectInput>
        </div>

        {/* Kota */}
        <div className="flex flex-col w-1/3">
          <label htmlFor="city" className="text-sm font-medium mb-2">
            Kota/Kabupaten
          </label>
          <SelectInput
            value={formData.city}
            onValueChange={(value) => setFormData({ ...formData, city: value })}
            placeholder={
              formData.province ? "Pilih kota" : "Pilih provinsi dulu"
            }
            disabled={!formData.province} // 👈 terkunci sebelum pilih provinsi
          >
            <div className="max-h-40 overflow-y-auto">
              {cityOptions.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </div>
          </SelectInput>
        </div>
      </div>

      {/* No. Telepon */}
      <div className="grid gap-2 max-w-4xl">
        <label htmlFor="phone" className="text-sm font-medium">
          No. Telepon
        </label>
        <Input
          type="tel"
          id="phone"
          name="phone"
          placeholder="08xxxxxxxxxx"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      {/* Deskripsi Kebutuhan */}
      <div className="grid gap-2 max-w-4xl">
        <label htmlFor="description" className="text-sm font-medium">
          Kebutuhan yang Dibutuhkan
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Semakin detail informasi yang diberikan semakin baik..."
          value={formData.description}
          onChange={handleChange}
          className="flex h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-green-500 focus-visible:ring-green-500/50 focus-visible:ring-[1px] outline-none"
        />
      </div>

      {/* Output yang Diharapkan */}
      <div className="grid gap-2 max-w-4xl">
        <label htmlFor="expectedOutput" className="text-sm font-medium">
          Output yang Diharapkan
        </label>
        <textarea
          id="expectedOutput"
          name="expectedOutput"
          placeholder="Tuliskan output yang ingin dicapai..."
          value={formData.expectedOutput}
          onChange={handleChange}
          className="flex h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-green-500 focus-visible:ring-green-500/50 focus-visible:ring-[1px] outline-none"
        />
      </div>

      {/* Dokumen Pendukung */}
      <div className="grid gap-2 max-w-5xl">
        <label htmlFor="supportingDoc" className="text-sm font-medium">
          Dokumen Pendukung (Opsional)
        </label>
        <Input
          type="file"
          id="supportingDoc"
          name="supportingDoc"
          multiple
          onChange={handleFileChange}
        />

        {/* Preview semua file */}
        <div className="mt-3 space-y-2">
          {formData.supportingDocs.map((file, idx) => (
            <div
              key={idx}
              className="border rounded-md p-3 flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-500">📄</span>
                <div className="flex flex-col">
                  <span className="font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <a
                    href={URL.createObjectURL(file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 text-xs mt-1 underline"
                  >
                    Click to view
                  </a>
                </div>
              </div>
              {/* Tombol hapus */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="ml-3 text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Hapus dokumen</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
