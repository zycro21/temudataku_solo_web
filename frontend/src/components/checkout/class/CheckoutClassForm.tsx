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
    <form className="p-4 md:p-6 md:pl-10 space-y-5 max-w-3xl mx-auto md:mx-0">
      <h2 className="text-lg md:text-2xl font-bold text-center md:text-left">
        Informasi Pemesanan
      </h2>

      {/* Email */}
      <div className="grid gap-1.5 max-w-3xl">
        <label className="text-xs font-medium text-gray-600">Email</label>
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
      <div className="grid gap-1.5 max-w-3xl">
        <label className="text-xs font-medium text-gray-600">
          Nama Lengkap
        </label>
        <Input
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>

      {/* Province & City */}
      <div className="flex flex-col md:flex-row gap-3 max-w-3xl">
        <div className="flex flex-col flex-1">
          <label className="text-xs font-medium text-gray-600 mb-1">
            Provinsi
          </label>
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

        <div className="flex flex-col flex-1">
          <label className="text-xs font-medium text-gray-600 mb-1">
            Kota/Kabupaten
          </label>
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
      <div className="grid gap-1.5 max-w-3xl">
        <label className="text-xs font-medium text-gray-600">No. Telepon</label>
        <Input name="phone" value={formData.phone} onChange={handleChange} />
      </div>
    </form>
  );
}
