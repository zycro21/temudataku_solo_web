import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  timeout: 10000,
  withCredentials: true, // cookie otomatis dikirim
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired atau tidak valid
      console.warn("Session expired, redirecting to home...");

      if (typeof window !== "undefined") {
        // hapus data user dari localStorage / state
        localStorage.removeItem("user");

        // Redirect ke halaman utama
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
