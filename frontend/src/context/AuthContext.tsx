"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ignore401, setIgnore401] = useState(false); // <-- tambahkan state ini
  const router = useRouter();
  const pathname = usePathname();

  // ref supaya interceptor selalu baca value terbaru tanpa perlu didaftarkan ulang tiap render
  const currentUserRef = useRef(currentUser);
  const ignore401Ref = useRef(ignore401);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    ignore401Ref.current = ignore401;
  }, [ignore401]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // buat instance axios khusus auth
  const authAxios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
  });

  // 🔥 Interceptor didaftarkan SEKALI di instance axios GLOBAL (bukan cuma
  // di authAxios), supaya semua request `axios.get/post/...` di seluruh
  // aplikasi — termasuk halaman /admin/... yang manggil `axios` langsung —
  // ikut ke-handle kalau sesi/token sudah habis (401).
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (ignore401Ref.current) {
          // skip reject jika sedang logout
          return Promise.resolve(err.response);
        }
        if (err.response?.status === 401 && currentUserRef.current) {
          setCurrentUser(null);
          toast.error("Sesi kamu sudah berakhir, silakan login ulang", {
            duration: 5000,
          });
          if (pathnameRef.current !== "/") {
            router.replace("/");
          }
        }
        return Promise.reject(err);
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, [router]);

  // ambil data user saat load awal
  useEffect(() => {
    authAxios
      .get("/api/auth/me")
      .then((res) => setCurrentUser(res.data.data))
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loading,
        authAxios,
        ignore401,
        setIgnore401,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
