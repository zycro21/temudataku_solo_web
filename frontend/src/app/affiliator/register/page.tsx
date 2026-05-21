"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";

export default function AffiliatorRegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);

  const router = useRouter();

  const onSubmit = async (data: any) => {
    setSubmitAttempted(true);
    if (data.password !== data.confirmPassword) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      // default sementara
      formData.append("fullName", "Affiliator Baru");
      formData.append("phoneNumber", "-");
      formData.append("address", "-");
      formData.append("role", "affiliator");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const { status, message } = res.data;

      // 🎯 Handle setiap status
      if (status === "new_user") {
        toast.success("Registrasi berhasil! Silakan verifikasi email Anda.");
      } else if (status === "role_added") {
        toast.success("Akun ditemukan! Role affiliator berhasil ditambahkan.");
      } else if (status === "role_exists") {
        toast.info("Akun sudah memiliki role affiliator.");
      }

      router.push("/affiliator/login");
    } catch (err: any) {
      console.error("Register error:", err);

      // Error bawaan dari backend
      if (err.response?.status === 401) {
        toast.error("Password salah untuk akun yang sudah ada.");
      } else if (err.response?.status === 400) {
        toast.error(err.response.data.message || "Input tidak valid.");
      } else {
        toast.error("Registrasi gagal, coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  // watch untuk cek isi input
  const email = watch("email");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const isPasswordMatch = password === confirmPassword;

  const getInputClass = (fieldName: string, hasError: boolean) => {
    if (submitAttempted && hasError) {
      return "border-2 border-red-500 animate-pulse";
    }
    if (focusField === fieldName) {
      return "border-2 border-emerald-500";
    }
    return "border border-gray-300";
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="w-full border-b border-emerald-500 px-6 py-3 flex justify-center">
        <Image
          src="/images/Navbar_logo.png"
          alt="Logo"
          width={72}
          height={72}
          className="object-contain"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left image — hidden on mobile */}
            <div className="hidden md:flex items-center justify-center">
              <Image
                src="/images/Image.svg"
                alt="Robot AI"
                width={460}
                height={460}
                className="w-full max-w-[460px] h-auto object-contain"
                priority
              />
            </div>

            {/* Right form */}
            <div className="w-full max-w-sm mx-auto flex flex-col">
              {/* Heading */}
              <div className="mb-6 text-center">
                {/* Ilustrasi kecil hanya di mobile */}
                <div className="flex justify-center mb-5 md:hidden">
                  <Image
                    src="/images/Image.svg"
                    alt="Robot AI"
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                </div>
                <h1 className="text-2xl font-bold tracking-wide text-gray-900">
                  Daftar Akun Affiliator
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Gabung gratis dan dapatkan link afiliasi!
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Masukkan email"
                      className={`pl-9 h-11 bg-gray-50 rounded-lg text-sm ${getInputClass(
                        "email",
                        !!errors.email,
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
                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Kata Sandi
                  </Label>
                  <div className="relative">
                    <Lock
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan kata sandi"
                      className={`pl-9 pr-10 h-11 bg-gray-50 rounded-lg text-sm ${getInputClass(
                        "password",
                        !!errors.password,
                      )}`}
                      {...register("password", {
                        required: "Password wajib diisi",
                        minLength: { value: 8, message: "Minimal 8 karakter" },
                        pattern: {
                          value:
                            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                          message:
                            "Harus ada huruf besar, huruf kecil, angka, dan simbol",
                        },
                      })}
                      onFocus={() => setFocusField("password")}
                      onBlur={() => setFocusField(null)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Pesan password */}
                  <p
                    className={`text-xs ${
                      errors.password
                        ? "text-red-500 animate-pulse"
                        : "text-gray-400"
                    }`}
                  >
                    {errors.password
                      ? String(errors.password.message)
                      : "Harus ada huruf besar, huruf kecil, angka, dan simbol"}
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Konfirmasi Kata Sandi
                  </Label>
                  <div className="relative">
                    <Lock
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Konfirmasi kata sandi"
                      className={`pl-9 pr-10 h-11 bg-gray-50 rounded-lg text-sm ${getInputClass(
                        "confirmPassword",
                        !isPasswordMatch,
                      )}`}
                      {...register("confirmPassword", {
                        required: "Konfirmasi wajib diisi",
                      })}
                      onFocus={() => setFocusField("confirmPassword")}
                      onBlur={() => setFocusField(null)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                  className="w-full h-11 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-semibold text-sm transition-colors"
                  disabled={loading || !email || !password || !confirmPassword}
                >
                  {loading ? "Mendaftarkan..." : "Daftar"}
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-200" />
                <span className="px-3 text-xs text-gray-400 font-medium uppercase tracking-wider">
                  atau
                </span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              {/* Google Login */}
              <div className="flex justify-center">
                <div className="w-full">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      try {
                        await axios.post(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google`,
                          { token: credentialResponse.credential },
                          { withCredentials: true },
                        );

                        // Ambil data user
                        const me = await axios.get(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
                          { withCredentials: true },
                        );

                        const user = me.data?.data;
                        if (!user) throw new Error("Gagal mengambil user");

                        const roles: string[] = (user?.userRoles || []).map(
                          (r: any) => r?.role?.roleName?.toLowerCase(),
                        );

                        const allowedRoles = ["affiliator", "admin"];

                        if (
                          !roles.some((role) => allowedRoles.includes(role))
                        ) {
                          // Tambahkan role affiliator via endpoint register
                          const formData = new FormData();
                          formData.append("email", user.email);
                          formData.append("password", "google-oauth");
                          formData.append(
                            "fullName",
                            user.fullName || "Affiliator",
                          );
                          formData.append("role", "affiliator");

                          await axios.post(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`,
                            formData,
                            {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            },
                          );
                        }

                        toast.success("Daftar dengan Google berhasil!");
                        router.push("/affiliator/login");
                      } catch (err) {
                        console.error(err);
                        toast.error("Daftar dengan Google gagal");
                      }
                    }}
                    onError={() => toast.error("Daftar dengan Google gagal")}
                    width="100%"
                  />
                </div>
              </div>

              <p className="text-sm text-center mt-5 text-gray-500">
                Sudah Punya Akun?{" "}
                <Link
                  href="/affiliator/login"
                  className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                >
                  Masuk
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
