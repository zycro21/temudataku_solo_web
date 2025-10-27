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
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ShortlinkLoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });

  const [showPassword, setShowPassword] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const onSubmit = async (data: any) => {
    setSubmitAttempted(true);
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
        data,
        { withCredentials: true }
      );

      const user = res.data.user;
      if (!user) throw new Error("User data tidak ditemukan");

      toast.success("Login berhasil");
      router.push("/shorten-link/main"); // lempar ke halaman utama shortlink
    } catch (err: any) {
      let msg =
        err.response?.data?.message ||
        "Terjadi kesalahan saat login. Coba lagi.";

      if (
        msg.toLowerCase().includes("invalid credentials") ||
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("validation error")
      ) {
        msg = "Email atau password salah";
      }

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
              alt="Shortlink Illustration"
              width={500}
              height={500}
              className="rounded-lg"
            />
          </div>

          {/* Right form */}
          <div className="flex flex-col justify-start max-w-sm w-full mx-auto mt-[63px]">
            <h1 className="text-[25px] font-bold text-center mb-1 tracking-wide">
              Login Shortlink Manager
            </h1>
            <p className="text-gray-600 text-sm text-center mb-7">
              Kelola dan pantau shorten link-mu
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
                {submitAttempted && errors.password?.message && (
                  <p className="text-xs text-red-500">
                    {String(errors.password.message)}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("rememberMe")}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  Ingat Saya
                </label>
                <Link href="/send-email" className="text-emerald-600">
                  Lupa kata sandi?
                </Link>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={!isValid || loading}
              >
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
