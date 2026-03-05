"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import { SelectInput } from "@/components/ui/selectInput";
import { regions } from "../mentoring/region";

export default function CheckoutClassForm({
  currentUser,
  booking,
  onFormChange,
}: any) {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    city: "",
    province: "",
    phone: "",
  });

  const isEmailLocked = !!currentUser?.email;
  const isFullNameLocked = !!currentUser?.fullName;
  const isPhoneLocked = !!currentUser?.phoneNumber;

  /* ===============================
     PREFILL USER
  =============================== */
  useEffect(() => {
    if (!currentUser) return;

    const updated = {
      email: currentUser.email || "",
      fullName: currentUser.fullName || "",
      province: currentUser.province || "",
      city: currentUser.city || "",
      phone: currentUser.phoneNumber || "",
    };

    setFormData(updated);
    if (onFormChange) onFormChange(updated);
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);
    if (onFormChange) onFormChange(updated);
  };

  const cityOptions = formData.province ? regions[formData.province] : [];

  return (
    <form className="p-6 pl-6 md:pl-10 space-y-6">
      <h2 className="text-2xl font-bold">Informasi Pemesanan</h2>

      {/* Email */}
      <div className="grid gap-2 max-w-4xl">
        <label className="text-sm font-medium">Email</label>
        <Input
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          readOnly={isEmailLocked}
          className={isEmailLocked ? "bg-gray-100 cursor-not-allowed" : ""}
        />
      </div>

      {/* Nama */}
      <div className="grid gap-2 max-w-4xl">
        <label className="text-sm font-medium">Nama Lengkap</label>
        <Input
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          readOnly={isFullNameLocked}
          className={isFullNameLocked ? "bg-gray-100 cursor-not-allowed" : ""}
        />
      </div>

      {/* Province & City */}
      <div className="flex gap-4">
        <div className="flex flex-col w-1/3">
          <label className="text-sm font-medium mb-2">Provinsi</label>
          <SelectInput
            value={formData.province}
            onValueChange={(value) => {
              const updated = { ...formData, province: value, city: "" };
              setFormData(updated);
              if (onFormChange) onFormChange(updated);
            }}
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

        <div className="flex flex-col w-1/3">
          <label className="text-sm font-medium mb-2">Kota/Kabupaten</label>
          <SelectInput
            value={formData.city}
            onValueChange={(value) => {
              const updated = { ...formData, city: value };
              setFormData(updated);
              if (onFormChange) onFormChange(updated);
            }}
            disabled={!formData.province}
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

      {/* Phone */}
      <div className="grid gap-2 max-w-4xl">
        <label className="text-sm font-medium">No. Telepon</label>
        <Input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          readOnly={isPhoneLocked}
          className={isPhoneLocked ? "bg-gray-100 cursor-not-allowed" : ""}
        />
      </div>
    </form>
  );
}
