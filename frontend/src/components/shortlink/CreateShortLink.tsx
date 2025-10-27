"use client";

import { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function CreateShortLink() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl) return;

    try {
      setLoading(true);
      setError("");
      setCopied(false);

      const payload: any = { originalUrl };
      if (customCode.trim()) payload.shortCode = customCode.trim();
      if (expiresAt) payload.expiresAt = expiresAt;

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/shortlink/shortlinks`,
        payload,
        { withCredentials: true }
      );

      const newShortUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/s/${res.data.data.shortCode}`;
      setShortUrl(newShortUrl);

      // Auto copy to clipboard
      await navigator.clipboard.writeText(newShortUrl);
      setCopied(true);

      // Tampilkan modal
      setShowModal(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal membuat short link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-xl shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Buat Short Link Baru
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Original URL */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Original URL
          </label>
          <input
            type="url"
            placeholder="Masukkan URL asli (contoh: https://temudataku.com/presensi/kelas-ml)"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
            className="border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Custom short code */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Nama custom shortlink (opsional)
          </label>
          <input
            type="text"
            placeholder="Contoh: kelas-ml"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            className="border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Expiration date */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Tanggal kedaluwarsa (opsional)
          </label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-all duration-200 disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Pendekkan URL"}
        </Button>
      </form>

      {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}

      {/* Modal notifikasi berhasil */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>✅ Short Link Berhasil Dibuat</DialogTitle>
            <DialogDescription asChild>
              <div className="mt-2 text-sm text-gray-700">
                <p>
                  Short link kamu:{" "}
                  <a
                    href={shortUrl || "#"}
                    target="_blank"
                    className="text-emerald-600 underline"
                  >
                    {shortUrl}
                  </a>
                </p>
                <p className="mt-1">
                  {copied
                    ? "📋 Link sudah otomatis disalin ke clipboard!"
                    : "Klik link di atas untuk membuka."}
                </p>
                <p className="mt-2 text-gray-500 text-xs italic">
                  Kamu juga bisa melihatnya di tab Riwayat Shortlink.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end">
            <Button
              variant="default"
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => setShowModal(false)}
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
