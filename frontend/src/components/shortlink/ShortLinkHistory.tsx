"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function ShortLinkHistory() {
  const router = useRouter();
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [updating, setUpdating] = useState(false);

  const fetchLinks = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/shortlink/shortlinks/my`,
        {
          params: {
            page: currentPage,
            limit: itemsPerPage,
          },
          withCredentials: true,
        },
      );

      setLinks(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err: any) {
      console.error("Gagal memuat riwayat link:", err);
      setError(err.response?.data?.message || "Gagal memuat data short links");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn("Token expired, redirecting...");
          router.push("/shorten-link");
        }
        return Promise.reject(error);
      },
    );

    fetchLinks();

    return () => axios.interceptors.response.eject(interceptor);
  }, [router, currentPage]); // 🔥 currentPage ditambahkan agar API dipanggil ulang saat pindah halaman

  if (loading)
    return <p className="text-gray-500 text-sm">Memuat data short links...</p>;

  if (error) return <p className="text-red-500 text-sm mt-2">❌ {error}</p>;

  const openEditExpiry = (link: any) => {
    setSelectedLink(link);

    if (link.expiresAt) {
      setSelectedDate(new Date(link.expiresAt));
    } else {
      setSelectedDate(undefined);
    }

    setIsModalOpen(true);
  };

  const handleUpdateExpiry = async () => {
    if (!selectedLink || !selectedDate) return;

    try {
      setUpdating(true);

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/shortlink/shortlinks/${selectedLink.id}`,
        {
          expiresAt: selectedDate.toISOString(),
        },
        {
          withCredentials: true,
        },
      );

      await fetchLinks();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal update tanggal kadaluarsa");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-xl shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Riwayat Short Link
      </h2>

      {links.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Belum ada short link yang kamu buat.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-emerald-100 text-emerald-800">
                <tr>
                  <th className="py-3 px-4 border-b">Short Link</th>
                  <th className="py-3 px-4 border-b">Original URL</th>
                  <th className="py-3 px-4 border-b text-center">Klik</th>
                  <th className="py-3 px-4 border-b text-center">Dibuat</th>
                  <th className="py-3 px-4 border-b text-center">
                    Kadaluwarsa
                  </th>
                  <th className="py-3 px-4 border-b text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => {
                  const isExpired =
                    link.expiresAt && new Date(link.expiresAt) < new Date();

                  return (
                    <tr
                      key={link.id}
                      className="hover:bg-emerald-50 transition-all duration-200 ease-in-out border-b"
                    >
                      <td className="py-3 px-4 text-emerald-600 font-medium">
                        <a
                          href={`${process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL}/s/${link.shortCode}`}
                          target="_blank"
                          className="underline hover:text-emerald-800"
                        >
                          {`${process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL}/s/${link.shortCode}`}
                        </a>
                      </td>

                      <td className="py-3 px-4 truncate max-w-xs">
                        <a
                          href={link.originalUrl}
                          target="_blank"
                          className="text-gray-700 hover:underline"
                        >
                          {link.originalUrl}
                        </a>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {link.clickCount ?? 0}
                      </td>

                      <td className="py-3 px-4 text-center text-gray-600">
                        {link.createdAt
                          ? new Date(link.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </td>

                      <td
                        className="py-3 px-4 text-center text-gray-600 cursor-pointer hover:text-emerald-600"
                        onClick={() => openEditExpiry(link)}
                      >
                        {link.expiresAt
                          ? new Date(link.expiresAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isExpired ? (
                          <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                            Kadaluwarsa
                          </span>
                        ) : link.isActive ? (
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">
                            Aktif
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
                            Nonaktif
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

                    {/* Pagination */}
          <div className="flex justify-between items-center mt-6 text-sm">
            <p className="text-gray-500">
              Halaman {currentPage} dari {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg text-gray-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Sebelumnya
              </button>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg text-gray-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL EDIT EXPIRY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[380px] shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Update Tanggal Kadaluarsa
            </h3>

            <div className="flex justify-center">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
              >
                Batal
              </button>

              <button
                onClick={handleUpdateExpiry}
                disabled={!selectedDate || updating}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40"
              >
                {updating ? "Menyimpan..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}