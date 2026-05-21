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
import { GoogleLogin } from "@react-oauth/google";

export default function AffiliatorLoginPage() {
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
        { withCredentials: true },
      );

      const user = res.data.user;
      const allowedRoles = ["affiliator", "admin"];
      const userRoles = user.roles.map((r: any) => r.role_name);

      // cek role
      if (!userRoles.some((role: string) => allowedRoles.includes(role))) {
        toast.error("Role Anda tidak diizinkan untuk login di halaman ini");
        setLoading(false);
        return;
      }

      toast.success("Login berhasil");
      router.push("/dashboard/affiliator");
    } catch (err: any) {
      let msg =
        err.response?.data?.message ||
        "Terjadi kesalahan saat login. Coba lagi.";

      // mapping khusus untuk invalid credentials
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
                {/* Logo shown only on mobile */}
                <div className="flex justify-center mb-5 md:hidden">
                  <Image
                    src="/images/Image.svg"
                    alt="Robot AI"
                    width={140}
                    height={140}
                    className="object-contain"
                  />
                </div>
                <h1 className="text-2xl font-bold tracking-wide text-gray-900">
                  Masuk Affiliator
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Masuk untuk kelola link &amp; pantau referral
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
                  {submitAttempted && errors.password?.message && (
                    <p className="text-xs text-red-500">
                      {String(errors.password.message)}
                    </p>
                  )}
                </div>

                {/* Remember Me + Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600">
                    <input
                      type="checkbox"
                      {...register("rememberMe")}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                    Ingat Saya
                  </label>
                  <Link
                    href="/send-email/affiliator"
                    className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Lupa kata sandi?
                  </Link>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-semibold text-sm transition-colors"
                  disabled={!isValid || loading}
                >
                  {loading ? "Memproses..." : "Masuk"}
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
                        if (!user) throw new Error("Gagal mengambil data user");

                        const roles: string[] = (user?.userRoles || []).map(
                          (r: any) => r?.role?.roleName?.toLowerCase(),
                        );

                        const allowedRoles = ["affiliator", "admin"];

                        // cek role
                        if (
                          !roles.some((role) => allowedRoles.includes(role))
                        ) {
                          toast.error(
                            "Role Anda tidak diizinkan untuk login di halaman ini",
                          );
                          return;
                        }

                        toast.success("Login Google berhasil");
                        router.push("/dashboard/affiliator");
                      } catch (err) {
                        console.error(err);
                        toast.error("Login Google gagal");
                      }
                    }}
                    onError={() => toast.error("Login Google gagal")}
                    width="100%"
                  />
                </div>
              </div>

              <p className="text-sm text-center mt-5 text-gray-500">
                Belum Punya Akun?{" "}
                <Link
                  href="/affiliator/register"
                  className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                >
                  Daftar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
