"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ignore401, setIgnore401] = useState(false); // <-- tambahkan state ini
  const router = useRouter();

  // buat instance axios khusus auth
  const authAxios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
  });

  // interceptor untuk handle 401
  authAxios.interceptors.response.use(
    (res) => res,
    (err) => {
      if (ignore401) {
        // skip reject jika sedang logout
        return Promise.resolve(err.response);
      }
      if (err.response?.status === 401 && currentUser) {
        setCurrentUser(null);
        toast.error("Sesi kamu sudah berakhir, silakan login ulang", {
          duration: 5000,
        });
        router.replace("/");
      }
      return Promise.reject(err);
    }
  );

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
