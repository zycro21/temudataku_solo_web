"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "cookie-consent"; // value: "accepted" | "rejected"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Hanya tampil kalau user belum pernah menentukan pilihan
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      // delay dikit biar nggak "kedip" pas first paint
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleChoice = (choice: "accepted" | "rejected") => {
    localStorage.setItem(STORAGE_KEY, choice);
    setVisible(false);
    // TODO: kalau mau, trigger/skip loading analytics & meta pixel di sini
    // berdasarkan choice (misal lewat context atau reload halaman)
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Persetujuan penggunaan cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4"
    >
      <div className="max-w-8xl mx-auto bg-white border-2 border-emerald-200 rounded-xl shadow-2xl shadow-emerald-900/10 ring-1 ring-black/5 p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-2.5 md:gap-3">
        <div className="flex-1">
          <p className="text-xs md:text-sm font-semibold text-gray-900 mb-1">
            Kami Menggunakan Cookies 🍪
          </p>
          <p className="text-[11px] md:text-xs text-gray-600 leading-relaxed">
            Kami menggunakan cookies dan teknologi serupa untuk membuat
            pengalaman belajar kamu di TemuDataku lebih nyaman, mengingat
            preferensi kamu, menganalisis bagaimana situs ini digunakan, dan
            menampilkan konten serta penawaran yang lebih relevan buat kamu.
            Sebagian cookies juga kami gunakan bersama mitra pihak ketiga untuk
            keperluan analitik dan periklanan. Dengan klik &quot;Terima
            Semua&quot;, kamu menyetujui penggunaan cookies sesuai{" "}
            <Link
              href="/kebijakan-privasi"
              className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
            >
              Kebijakan Privasi
            </Link>{" "}
            kami. Kamu bisa mengubah pilihan ini kapan saja lewat pengaturan
            browser.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handleChoice("rejected")}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Tolak
          </button>
          <button
            onClick={() => handleChoice("accepted")}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            Terima Semua
          </button>
        </div>
      </div>
    </div>
  );
}
