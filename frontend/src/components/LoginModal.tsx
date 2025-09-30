"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function LoginModal({
  isOpen,
  setIsOpen,
  openRegister,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openRegister: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { setCurrentUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Login → server kasih cookie
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      // 2. Fetch user detail dari /me
      const me = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
        { withCredentials: true }
      );
      const user = me.data?.data;

      if (!user) throw new Error("Gagal mengambil data user");

      // 3. Simpan ke context
      setCurrentUser(user);

      // 4. Redirect sesuai role
      const roles: string[] = (user?.userRoles || []).map((r: any) =>
        r?.role?.roleName?.toLowerCase()
      );

      setCurrentUser(user);
      setIsOpen(false);
      toast.success("Login berhasil, selamat datang kembali!");

      setTimeout(() => {
        if (roles.includes("admin")) {
          router.push("/admin");
        } else if (roles.includes("mentor")) {
          router.push("/dashboard/mentor");
        } else {
          router.push("/");
        }
      }, 100);
    } catch (err: any) {
      console.error("Login error:", err);

      let msg =
        err.response?.data?.message ||
        err.message ||
        "Login gagal, periksa kembali email & password";

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:min-w-[400px] md:min-w-[500px] lg:min-w-5xl w-full p-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="grid md:grid-cols-2 min-h-[500px]">
          {/* Left side - Illustration */}
          <div className="hidden md:flex items-center justify-center bg-white pl-8 pr-0">
            <Image
              src="/assets/auth/ilustration.svg"
              alt="3D Robot Illustration"
              width={400}
              height={400}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Right side - Form */}
          <div className="p-10 pt-0 relative bg-white flex flex-col justify-center">
            <DialogHeader>
              <DialogTitle>
                <p className="text-3xl font-bold text-gray-900 mb-2 text-center">
                  Masuk
                </p>
                <p className="text-sm text-gray-500 mb-6 text-center">
                  Selamat datang kembali!!
                </p>
              </DialogTitle>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleLogin}>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10 border border-gray-300 focus:border-[#0CA678] focus:ring-2 focus:ring-[#0CA678] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Ingat saya + Lupa password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#0CA678]"
                  />
                  <span>Ingat Saya</span>
                </label>
                <Link
                  href="/send-email"
                  className="text-xs text-emerald-600 hover:underline"
                >
                  Lupa kata sandi?
                </Link>
              </div>

              {/* Button submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0CA678] hover:bg-[#08916C] text-white py-3"
              >
                {loading ? "Memproses..." : "Masuk"}
              </Button>

              <div className="text-center text-gray-500">atau</div>

              {/* Google login */}
              <Button
                type="button"
                variant="outline"
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
              </Button>

              <p className="text-sm text-gray-500 text-center mt-4">
                Belum punya akun?{" "}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    openRegister();
                  }}
                  className="text-[#0CA678] hover:underline font-medium"
                >
                  Daftar
                </button>
              </p>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
