"use client";
import { useState } from "react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password reset logic here
    console.log("Password reset submitted");
  };

  return (
    <section className="flex-1 flex items-center justify-center py-40 px-4">
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Perbarui Kata Sandimu</h1>
            <p className="text-gray-600 leading-relaxed">
              Pastikan kata sandimu aman dan mudah diingat. Demi
              <br />
              pengalaman belajar yang lancar.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10 w-full py-3 border border-gray-300 rounded-md focus:ring-[#0CA678] focus:border-[#0CA678]"
                  placeholder="Masukkan kata sandi baru"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showNewPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">Gunakan kombinasi angka, huruf besar, dan huruf kecil</p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 w-full py-3 border border-gray-300 rounded-md focus:ring-[#0CA678] focus:border-[#0CA678]"
                  placeholder="Konfirmasi kata sandi"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">Gunakan kombinasi angka, huruf besar, dan huruf kecil</p>
            </div>

            <Button type="submit" className="w-full bg-[#0CA678] hover:bg-[#08916C] text-white py-3 rounded-md font-medium">
              Perbarui Kata Sandi
            </Button>

            {/* reCAPTCHA Notice */}
            <div>
              <p className="text-xs text-gray-500 leading-relaxed">
                This site is protected by reCAPTCHA and the Google{" "}
                <Link href="/privacy-policy" className="text-[#0CA678] hover:underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms-of-service" className="text-[#0CA678] hover:underline">
                  Terms of Service
                </Link>{" "}
                apply.
              </p>
            </div>
          </form>
        </div>
      </main>
    </section>
  );
}
