"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ShortLinkHistory() {
  const router = useRouter();
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // jumlah baris per halaman

  useEffect(() => {
    // interceptor untuk tangkap 401
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn("Token expired, redirecting...");
          router.push("/shorten-link");
        }
        return Promise.reject(error);
      }
    );

    const fetchLinks = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/shortlink/shortlinks/my`,
          { withCredentials: true }
        );
        setLinks(res.data.data || []);
      } catch (err: any) {
        console.error("Gagal memuat riwayat link:", err);
        setError(
          err.response?.data?.message || "Gagal memuat data short links"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();

    // cleanup interceptor saat komponen unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [router]);

  const totalPages = Math.ceil(links.length / itemsPerPage);
  const paginatedLinks = links.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading)
    return <p className="text-gray-500 text-sm">Memuat data short links...</p>;

  if (error) return <p className="text-red-500 text-sm mt-2">❌ {error}</p>;

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
                    Kedaluwarsa
                  </th>
                  <th className="py-3 px-4 border-b text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLinks.map((link) => {
                  const isExpired =
                    link.expiresAt && new Date(link.expiresAt) < new Date();

                  return (
                    <tr
                      key={link.id}
                      className="hover:bg-emerald-50 transition-all duration-200 ease-in-out border-b"
                    >
                      {/* Short Code */}
                      <td className="py-3 px-4 text-emerald-600 font-medium">
                        <a
                          href={`${process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL}/s/${link.shortCode}`}
                          target="_blank"
                          className="underline hover:text-emerald-800"
                        >
                          {`${process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL}/s/${link.shortCode}`}
                        </a>
                      </td>

                      {/* Original URL */}
                      <td className="py-3 px-4 truncate max-w-xs">
                        <a
                          href={link.originalUrl}
                          target="_blank"
                          className="text-gray-700 hover:underline"
                        >
                          {link.originalUrl}
                        </a>
                      </td>

                      {/* Klik Count */}
                      <td className="py-3 px-4 text-center">
                        {link.clickCount ?? 0}
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 text-center text-gray-600">
                        {link.createdAt
                          ? new Date(link.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>

                      {/* Expired At */}
                      <td className="py-3 px-4 text-center text-gray-600">
                        {link.expiresAt
                          ? new Date(link.expiresAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isExpired ? (
                          <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                            Kedaluwarsa
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
    </div>
  );
}
