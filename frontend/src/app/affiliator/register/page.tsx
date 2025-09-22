"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function AffiliatorRegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" }); // penting: pakai onChange supaya isValid realtime

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);

  const onSubmit = (data: any) => {
    setSubmitAttempted(true);

    if (data.password !== data.confirmPassword) {
      return;
    }

    console.log("Register data:", data);
    // TODO: API register affiliator
  };

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const isPasswordMatch = password === confirmPassword;

  const getInputClass = (fieldName: string, hasError: boolean) => {
    if (focusField === fieldName) return "border-2 border-emerald-500";
    if (submitAttempted && hasError)
      return "border-2 border-red-500 animate-pulse";
    return "border border-gray-300";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="w-full border-b border-emerald-500 p-4 flex justify-center">
        <Image
          src="/images/Navbar_logo.png"
          alt="Logo"
          width={85}
          height={85}
          className="object-contain"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="grid md:grid-cols-2 gap-2 max-w-5xl w-full items-start">
          {/* Left image */}
          <div className="hidden md:block">
            <Image
              src="/images/image.svg"
              alt="Robot AI"
              width={500}
              height={500}
              className="rounded-lg"
            />
          </div>

          {/* Right form */}
          <div className="flex flex-col justify-start max-w-sm w-full mx-auto mt-[0px]">
            <h1 className="text-[25px] font-bold text-center mb-1 tracking-wide">
              Daftar Akun Affiliator
            </h1>
            <p className="text-gray-600 text-sm text-center mb-7">
              Gabung gratis dan dapatkan link afiliasi!
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div className="space-y-2 relative">
                <Label htmlFor="email" className="text-md font-semibold">
                  Email
                </Label>
                <div className="relative">
                  <Mail
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Masukkan email"
                    className={`pl-10 h-12 bg-gray-100 ${getInputClass(
                      "email",
                      !!errors.email
                    )}`}
                    {...register("email", { required: "Email wajib diisi" })}
                    onFocus={() => setFocusField("email")}
                    onBlur={() => setFocusField(null)}
                  />
                </div>
                {submitAttempted && errors.email?.message && (
                  <p className="text-xs text-red-500">
                    {String(errors.email.message)}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2 relative">
                <Label htmlFor="password" className="text-md font-semibold">
                  Kata Sandi
                </Label>
                <div className="relative">
                  <Lock
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi"
                    className={`pl-10 h-12 bg-gray-100 ${getInputClass(
                      "password",
                      !!errors.password
                    )}`}
                    {...register("password", {
                      required: "Password wajib diisi",
                      minLength: {
                        value: 6,
                        message: "Minimal 6 karakter",
                      },
                    })}
                    onFocus={() => setFocusField("password")}
                    onBlur={() => setFocusField(null)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Gunakan kombinasi angka, huruf besar, dan huruf kecil
                </p>
                {submitAttempted && errors.password?.message && (
                  <p className="text-xs text-red-500">
                    {String(errors.password.message)}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2 relative">
                <Label
                  htmlFor="confirmPassword"
                  className="text-md font-semibold"
                >
                  Konfirmasi Kata Sandi
                </Label>
                <div className="relative">
                  <Lock
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                  />
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Konfirmasi kata sandi"
                    className={`pl-10 h-12 bg-gray-100 ${getInputClass(
                      "confirmPassword",
                      !isPasswordMatch
                    )}`}
                    {...register("confirmPassword", {
                      required: "Konfirmasi wajib diisi",
                    })}
                    onFocus={() => setFocusField("confirmPassword")}
                    onBlur={() => setFocusField(null)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {submitAttempted && !isPasswordMatch && (
                  <p className="text-xs text-red-500">
                    Konfirmasi password tidak sama
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={!isValid || !isPasswordMatch}
              >
                Daftar
              </Button>
            </form>

            <div className="flex items-center my-8">
              <div className="flex-1 border-t"></div>
              <span className="px-2 text-sm text-gray-500">atau</span>
              <div className="flex-1 border-t"></div>
            </div>

            <Button
              variant="outline"
              className="w-full flex items-center gap-2 justify-center border-emerald-500 text-gray-700 py-6"
            >
              <Image
                src="/assets/auth/googleIcon.svg"
                alt="Google"
                width={16}
                height={16}
              />
              Gunakan Akun Google
            </Button>

            <p className="text-sm text-center mt-2 text-gray-500">
              Sudah Punya Akun?{" "}
              <Link
                href="/affiliator/login"
                className="text-emerald-600 font-medium"
              >
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
