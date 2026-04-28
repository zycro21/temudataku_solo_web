"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { SelectInput } from "@/components/ui/selectInput";
import { SelectItem } from "@/components/ui/select";
import { regions } from "../mentoring/region";

export default function CheckoutAyclForm({
  onFormChange,
  schedules = [],
  loadingSchedules = false,
  userData,
}: any) {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    city: "",
    province: "",
    phone: "",

    // 🔥 NEW FIELDS
    currentStatus: "",
    otherStatus: "",
    institution: "",
    studyProgram: "",
    semester: "",
    age: "",
    reason: "",
    familiarity: "",
    selectedSchedules: [] as string[],
  });

  useEffect(() => {
    if (!userData) return;

    const updated = {
      ...formData,
      email: userData.email || "",
      fullName: userData.fullName || "",
      city: userData.city || "",
      province: userData.province || "",
      phone: userData.phoneNumber || "",
    };

    setFormData(updated);
    onFormChange?.(updated);
  }, [userData]);

  const [isOtherSelected, setIsOtherSelected] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);
    if (onFormChange) onFormChange(updated);
  };

  const cityOptions = formData.province ? regions[formData.province] : [];

  // 🔥 OPTIONS
  const statusOptions = [
    "Mahasiswa",
    "Fresh Graduate",
    "Profesional",
    "Career Switcher",
    "Other",
  ];

  const familiarityOptions = [
    "Belum pernah",
    "Pernah dengar tapi belum praktik",
    "Pernah ikut pelatihan",
    "Sudah sering praktik",
  ];

  return (
    <form className="p-4 md:p-5 md:pl-6 space-y-5 max-w-3xl mx-auto md:mx-0">
      <h2 className="text-lg font-semibold text-center md:text-left">
        Informasi Pemesanan
      </h2>

      {/* ========================= */}
      {/* BASIC INFO (TIDAK DIUBAH) */}
      {/* ========================= */}

      {/* Email */}
      <div className="grid gap-1.5 max-w-3xl">
        <label className="text-xs font-medium text-gray-600">Email</label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          disabled
          className="bg-gray-100 cursor-not-allowed"
          required
        />
      </div>

      {/* Nama */}
      <div className="grid gap-1.5 max-w-3xl">
        <label className="text-xs font-medium text-gray-600">
          Nama Lengkap
        </label>
        <Input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>

      {/* Provinsi + Kota */}
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
              onFormChange?.(updated);
            }}
          >
            <div className="max-h-36 overflow-y-auto">
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
              onFormChange?.(updated);
            }}
            disabled={!formData.province}
          >
            <div className="max-h-36 overflow-y-auto">
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
        <label className="text-xs font-medium text-gray-600">
          No. Whatsapp Aktif
        </label>
        <Input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      {/* ========================= */}
      {/* 🔥 NEW SECTION */}
      {/* ========================= */}

      <div className="border-t pt-5 space-y-6">
        <h3 className="text-sm font-semibold text-emerald-700 text-center md:text-left">
          Informasi Tambahan
        </h3>

        {/* Status */}
        <div className="grid gap-1.5 max-w-3xl">
          <label className="text-xs font-medium text-gray-600">
            Status Saat Ini <span className="text-red-500">*</span>
          </label>
          <SelectInput
            value={isOtherSelected ? "Other" : formData.currentStatus}
            onValueChange={(value) => {
              if (value === "Other") {
                setIsOtherSelected(true);

                const updated = {
                  ...formData,
                  currentStatus: "",
                  otherStatus: "",
                };

                setFormData(updated);
                onFormChange?.(updated);
              } else {
                setIsOtherSelected(false);

                const updated = {
                  ...formData,
                  currentStatus: value,
                  otherStatus: "",
                };

                setFormData(updated);
                onFormChange?.(updated);
              }
            }}
          >
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectInput>

          {/* 🔥 TAMBAHKAN DI SINI */}
          {isOtherSelected && (
            <div className="mt-2">
              <Input
                placeholder="Tulis status kamu (contoh: Freelancer, Ibu Rumah Tangga, dll)"
                value={formData.otherStatus}
                onChange={(e) => {
                  const updated = {
                    ...formData,
                    otherStatus: e.target.value,
                    currentStatus: e.target.value, // 🔥 value final ke backend
                  };
                  setFormData(updated);
                  onFormChange?.(updated);
                }}
              />
            </div>
          )}
        </div>

        {/* Instansi */}
        <div className="grid gap-1.5 max-w-3xl">
          <label className="text-xs font-medium text-gray-600">
            Instansi/Universitas saat ini<span className="text-red-500">*</span>
          </label>
          <Input
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            placeholder="Isi 'umum' jika tidak ada"
          />
        </div>

        {/* Prodi */}
        <div className="grid gap-1.5 max-w-3xl">
          <label className="text-xs font-medium text-gray-600">
            Program Studi<span className="text-red-500">*</span>
          </label>
          <Input
            name="studyProgram"
            value={formData.studyProgram}
            onChange={handleChange}
            placeholder="Jika bukan mahasiswa bisa mengisi dengan '-'"
          />
        </div>

        {/* Semester */}
        <div className="grid gap-1.5 max-w-3xl">
          <label className="text-xs font-medium text-gray-600">
            Semester Saat Ini<span className="text-red-500">*</span>
          </label>
          <Input
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            placeholder="Jika bukan mahasiswa bisa mengisi dengan '-'"
          />
        </div>

        {/* Age */}
        <div className="grid gap-1.5 max-w-3xl">
          <label className="text-xs font-medium text-gray-600">
            Usia<span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
          />
        </div>

        {/* 🔥 SELECT KELAS */}
        <div className="max-w-3xl">
          <label className="text-xs font-medium text-gray-600">
            Kelas apa yang ingin kamu ikuti pada program All You Can Learn ini?
            <span className="text-red-500">*</span>
          </label>

          <div className="mt-2 space-y-3 md:space-y-2 bg-emerald-50 p-3 md:p-4 rounded-lg border border-emerald-100">
            {loadingSchedules ? (
              <p className="text-sm text-gray-500">Memuat kelas...</p>
            ) : schedules.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada kelas tersedia</p>
            ) : (
              schedules.map((s: any) => (
                <label
                  key={s.id}
                  className="flex items-center md:items-center gap-2 md:gap-2 text-sm justify-center md:justify-start text-center md:text-left"
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedSchedules.includes(s.id)}
                    onChange={(e) => {
                      let updatedSchedules = [...formData.selectedSchedules];

                      if (e.target.checked) {
                        updatedSchedules.push(s.id);
                      } else {
                        updatedSchedules = updatedSchedules.filter(
                          (id) => id !== s.id,
                        );
                      }

                      const updated = {
                        ...formData,
                        selectedSchedules: updatedSchedules,
                      };

                      setFormData(updated);
                      onFormChange?.(updated);
                    }}
                  />
                  <span className="leading-relaxed">
                    {s.title} ({new Date(s.date).toLocaleDateString()})
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Reason */}
        <div className="grid gap-1.5 max-w-3xl">
          <label className="text-xs font-medium text-gray-600">
            Mengapa kamu tertarik mengikuti All You Can Learn ini?
            <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => {
              const updated = { ...formData, reason: e.target.value };
              setFormData(updated);
              onFormChange?.(updated);
            }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm leading-relaxed focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Familiarity */}
        <div className="grid gap-1.5 max-w-3xl">
          <label className="text-xs font-medium text-gray-600">
            Sejauh mana kamu familiar dengan topik All You Can Learn ini?
            <span className="text-red-500">*</span>
          </label>
          <SelectInput
            value={formData.familiarity}
            onValueChange={(value) => {
              const updated = { ...formData, familiarity: value };
              setFormData(updated);
              onFormChange?.(updated);
            }}
          >
            {familiarityOptions.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectInput>
        </div>
      </div>
    </form>
  );
}
