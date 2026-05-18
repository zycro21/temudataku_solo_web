"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterModal({
  isOpen,
  setIsOpen,
  openLogin,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openLogin: () => void;
}) {
  const { setCurrentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const returnUrl = `${pathname}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State Register
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerPassword !== registerConfirmPassword) {
      toast.error("Password dan konfirmasi password tidak cocok");
      return;
    }

    try {
      setLoading(true);

      if (returnUrl) {
        localStorage.setItem("returnUrl", returnUrl);
      }

      const formData = new FormData();
      formData.append("email", registerEmail);
      formData.append("password", registerPassword);
      formData.append("fullName", fullName);
      formData.append("role", "mentee");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const { status, message } = res.data;

      // RESPONS SUCCESS DIBUAT SPESIFIK
      if (status === "new_user") {
        toast.success(
          "Akun berhasil dibuat. Silakan Cek Email Anda dan Lakukan Verifikasi.",
        );
      } else if (status === "role_added") {
        toast.success("Role mentee berhasil ditambahkan ke akun Anda.");
      } else if (status === "role_exists") {
        toast.info("Anda sudah memiliki role mentee pada akun ini.");
      } else {
        toast.success(message || "Berhasil.");
      }

      setIsOpen(false);
    } catch (err: any) {
      console.error(err);

      const msg =
        err.response?.data?.message ??
        err.message ??
        "Terjadi kesalahan pada server";

      // HANDLING ERROR LEBIH JELAS
      if (msg === "Incorrect password for existing account") {
        toast.error("Password salah. Tidak bisa menambahkan role.");
      } else if (msg === "Role not found") {
        toast.error("Role tidak valid.");
      } else if (msg.includes("validation")) {
        toast.error("Input tidak valid.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:min-w-[360px] md:min-w-[520px] lg:min-w-4xl w-full p-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="grid md:grid-cols-2 min-h-[440px]">
          {/* Left side - Illustration */}
          <div className="hidden md:flex items-center justify-center bg-white pl-5 pr-0">
            <Image
              src="/assets/auth/ilustration.svg"
              alt="3D Robot Illustration"
              width={320}
              height={320}
              className="w-[85%] h-[85%] object-contain"
            />
          </div>

          {/* Right side - Form */}
          <div className="p-5 relative bg-white flex flex-col justify-center">
            <DialogHeader>
              <DialogTitle>
                <p className="text-xl font-bold text-gray-900 mb-1.5 text-center">
                  Buat Akun
                </p>
                <p className="text-xs text-gray-500 mb-4 text-center">
                  Daftarkan diri Anda untuk mulai belajar
                </p>
              </DialogTitle>
            </DialogHeader>

            <form className="space-y-3" onSubmit={handleRegister}>
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <Input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-8 text-xs px-2.5 placeholder:text-gray-400 placeholder:text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Masukkan email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  className="h-8 text-xs px-2.5 placeholder:text-gray-400 placeholder:text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Input
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    className="h-8 text-xs px-2.5 placeholder:text-gray-400 placeholder:text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowRegisterPassword(!showRegisterPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showRegisterPassword ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Konfirmasi kata sandi"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    required
                    className="h-8 text-xs px-2.5 placeholder:text-gray-400 placeholder:text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0CA678] hover:bg-[#08916C] text-white py-1.5 text-xs"
              >
                {loading ? "Mendaftar..." : "Daftar"}
              </Button>

              <div className="text-center text-gray-500 text-xs">atau</div>

              {/* <Button
                type="button"
                variant="outline"
                onClick={() => loginGoogle()}
                className="w-full border-[#0CA678] text-[#0CA678] hover:bg-[#f2f1f1] hover:text-[#0CA678]"
              >
                <Image
                  src="/assets/auth/googleIcon.svg"
                  alt="Google Logo"
                  width={14}
                  height={14}
                  className="mr-2"
                />
                Gunakan Akun Google
              </Button> */}

              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      try {
                        if (returnUrl) {
                          localStorage.setItem("returnUrl", returnUrl);
                        }

                        await axios.post(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google`,
                          {
                            token: credentialResponse.credential,
                          },
                          { withCredentials: true },
                        );

                        // ambil user
                        const me = await axios.get(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
                          { withCredentials: true },
                        );

                        const user = me.data?.data;

                        if (!user) throw new Error("Gagal mengambil user");

                        setCurrentUser(user);

                        const roles: string[] = (user?.userRoles || []).map(
                          (r: any) => r?.role?.roleName?.toLowerCase(),
                        );

                        const adminRoles = ["admin", "curdev", "cm"];

                        setIsOpen(false);
                        toast.success("Login Google berhasil");

                        const savedReturnUrl =
                          localStorage.getItem("returnUrl");

                        if (roles.some((r) => adminRoles.includes(r))) {
                          router.push("/admin");
                        } else if (roles.includes("mentor")) {
                          router.push("/dashboard/mentor");
                        } else {
                          if (savedReturnUrl) {
                            router.push(savedReturnUrl);
                            localStorage.removeItem("returnUrl");
                          } else {
                            router.push("/");
                          }
                        }
                      } catch (err) {
                        console.error(err);
                        toast.error("Login Google gagal");
                      }
                    }}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center mt-1">
                Sudah punya akun?{" "}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    openLogin();
                  }}
                  className="text-[#0CA678] hover:underline font-medium"
                >
                  Masuk
                </button>
              </p>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
