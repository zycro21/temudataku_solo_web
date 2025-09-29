"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
        withCredentials: true,
      })
      .then((res) => {
        setCurrentUser(res.data.data);
      })
      .catch(() => {
        setCurrentUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
