"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  GraduationCap,
  Sparkles,
  Receipt,
} from "lucide-react"; // 🔥 TAMBAHAN: ikon jenis transaksi

interface ApiPayment {
  id: string;
  merchantOrderId?: string;
  type: "booking" | "aycl" | "elearning"; // ✅ hapus practice
  title: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paymentDate: string;
  transactionId: string;
  createdAt: string;
}

export default function TransactionSection() {
  const [transactions, setTransactions] = useState<ApiPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ApiPayment | "price";
    direction: "asc" | "desc" | "default";
  } | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const statusOptions = ["all", "confirmed", "pending", "failed"];
  const statusFilter = statusOptions[statusIndex];

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/my/payments`,
          {
            withCredentials: true,
            params: { page: 1, limit: 100 },
          },
        );

        const data: ApiPayment[] = res.data.data.map((p: any) => {
          const title = p.title || "-";

          let status = p.status || "-";
          if (status === "pending") {
            const created = new Date(p.createdAt);
            const now = new Date();
            const diffDays =
              (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

            if (diffDays > 2) {
              status = "failed";
            }
          }

          return {
            id: p.id,
            merchantOrderId: p.merchantOrderId,
            type: p.type,
            title,
            amount: Number(p.amount),
            status,
            paymentMethod: p.paymentMethod || "-",
            paymentDate: p.paymentDate
              ? new Date(p.paymentDate).toLocaleDateString("id-ID")
              : new Date(p.createdAt).toLocaleDateString("id-ID"),
            transactionId: p.merchantOrderId || "Tidak Ada No Transaksi",
            createdAt: p.createdAt
              ? new Date(p.createdAt).toLocaleDateString("id-ID")
              : "-",
          };
        });

        setTransactions(data);
      } catch (err) {
        console.error("Gagal mengambil data pembayaran:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // SORT
  const sortedData = [...transactions].sort((a, b) => {
    if (!sortConfig || sortConfig.direction === "default") return 0;
    const { key, direction } = sortConfig;

    const getValue = (item: ApiPayment): string | number => {
      if (key === "price") return item.amount;
      return item[key] ?? "";
    };

    if (getValue(a) < getValue(b)) return direction === "asc" ? -1 : 1;
    if (getValue(a) > getValue(b)) return direction === "asc" ? 1 : -1;
    return 0;
  });

  // FILTER
  const filteredData = sortedData.filter(
    (t) =>
      (t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.status.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "all" ? true : t.status === statusFilter),
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const toggleSort = (key: keyof ApiPayment | "price") => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  };

  const toggleStatusFilter = () => {
    setStatusIndex((prev) => (prev + 1) % statusOptions.length);
    setCurrentPage(1);
  };

  const getSortIcon = (key: keyof ApiPayment | "price") => {
    if (sortConfig?.key !== key)
      return <ArrowUpDown className="inline w-4 h-4 ml-1 text-gray-400" />;
    if (sortConfig.direction === "asc")
      return <ArrowUp className="inline w-4 h-4 ml-1 text-green-600" />;
    return <ArrowDown className="inline w-4 h-4 ml-1 text-green-600" />;
  };

  // 🔥 BARU: helper style badge status — diekstrak biar tidak duplikasi
  // antara versi tabel desktop & versi kartu mobile (persis kondisi &
  // warna yang sama seperti sebelumnya).
  const statusBadgeClass = (status: string) =>
    status === "confirmed"
      ? "bg-green-100 text-green-600"
      : status === "pending"
        ? "bg-yellow-100 text-yellow-600"
        : "bg-red-100 text-red-600";

  // 🔥 BARU: dot warna kecil di dalam badge status (murni dekoratif,
  // dipetakan dari status yang sama, bukan data baru).
  const statusDotClass = (status: string) =>
    status === "confirmed"
      ? "bg-green-500"
      : status === "pending"
        ? "bg-yellow-500"
        : "bg-red-500";

  // 🔥 BARU: warna aksen garis kiri kartu mobile, dari status yang sama.
  const statusAccentClass = (status: string) =>
    status === "confirmed"
      ? "border-l-green-400"
      : status === "pending"
        ? "border-l-yellow-400"
        : "border-l-red-400";

  // 🔥 BARU: ikon + warna avatar bulat berdasarkan jenis transaksi
  // (`type`, field yang sudah ada di data — bukan field baru).
  const typeVisual = (type: ApiPayment["type"]) => {
    switch (type) {
      case "aycl":
        return {
          icon: Sparkles,
          bg: "bg-purple-50",
          color: "text-purple-500",
        };
      case "elearning":
        return {
          icon: GraduationCap,
          bg: "bg-blue-50",
          color: "text-blue-500",
        };
      case "booking":
      default:
        return {
          icon: CalendarDays,
          bg: "bg-emerald-50",
          color: "text-emerald-600",
        };
    }
  };

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 min-w-0 mb-4">
      {/* Search */}
      <div className="mb-4 flex gap-4">
        <Input
          placeholder="Cari berdasarkan ID, program dan status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-6">Memuat data...</p>
      ) : transactions.length === 0 ? (
        // 🔥 DIUBAH: dikasih ikon di atas teks, murni dekoratif — bukan
        // perubahan kondisi (masih persis "transactions.length === 0").
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <Receipt className="w-9 h-9 text-gray-300" />
          <p className="text-center text-gray-500">
            Belum ada transaksi pembayaran.
          </p>
        </div>
      ) : (
        <>
          {/* Versi DESKTOP/tablet — tabel ASLI, TIDAK diubah sama sekali */}
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-300 min-w-0">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => toggleSort("id")}
                    className="cursor-pointer font-semibold py-3 px-3"
                  >
                    No Transaksi {getSortIcon("id")}
                  </TableHead>

                  <TableHead
                    onClick={() => toggleSort("createdAt")}
                    className="cursor-pointer font-semibold py-3"
                  >
                    Tanggal Daftar {getSortIcon("createdAt")}
                  </TableHead>

                  <TableHead
                    onClick={() => toggleSort("title")}
                    className="cursor-pointer font-semibold py-3"
                  >
                    Program {getSortIcon("title")}
                  </TableHead>

                  <TableHead
                    onClick={() => toggleSort("price")}
                    className="cursor-pointer font-semibold py-3"
                  >
                    Harga {getSortIcon("price")}
                  </TableHead>

                  <TableHead
                    onClick={toggleStatusFilter}
                    className="cursor-pointer text-gray-500 font-semibold py-3"
                  >
                    Status Pembayaran
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedData.map((t, idx) => (
                  <TableRow key={idx} className="border-b border-gray-200">
                    <TableCell className="py-3 px-3 break-all whitespace-normal w-[25%]">
                      {t.transactionId}
                    </TableCell>

                    <TableCell className="py-3 whitespace-nowrap w-[15%]">
                      {t.paymentDate}
                    </TableCell>

                    <TableCell className="py-3 break-all whitespace-normal w-[30%]">
                      {t.title}
                    </TableCell>

                    <TableCell className="py-3 whitespace-nowrap w-[15%]">
                      Rp {t.amount.toLocaleString("id-ID")}
                    </TableCell>

                    <TableCell className="py-3 w-[15%]">
                      <span
                        className={`px-2 py-1 rounded-md text-sm font-medium inline-block ${statusBadgeClass(
                          t.status,
                        )}`}
                      >
                        {t.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Versi MOBILE (sm:hidden) — list kartu, dipercantik:
              - Aksen garis kiri warna sesuai status (border-l-4)
              - Avatar bulat + ikon sesuai jenis transaksi (t.type)
              - Badge status pakai dot bulat kecil + border tipis
              - Shadow lembut biar nggak flat
              Semua elemen visual ini murni dekoratif dari data yang
              SUDAH ADA (t.type, t.status) — tidak ada field/logic baru. */}
          <div className="sm:hidden space-y-2.5">
            {paginatedData.map((t, idx) => {
              const { icon: TypeIcon, bg, color } = typeVisual(t.type);
              return (
                <div
                  key={idx}
                  className={`border border-gray-200 border-l-4 ${statusAccentClass(
                    t.status,
                  )} rounded-lg p-3 shadow-sm bg-white`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Avatar ikon jenis transaksi */}
                    <div
                      className={`shrink-0 w-9 h-9 rounded-full ${bg} flex items-center justify-center`}
                    >
                      <TypeIcon className={`w-4 h-4 ${color}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-800 leading-snug break-words min-w-0 flex-1">
                          {t.title}
                        </h3>

                        <span
                          className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadgeClass(
                            t.status,
                          )}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusDotClass(
                              t.status,
                            )}`}
                          />
                          {t.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-400 mt-1 break-all">
                        {t.transactionId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100">
                    <span className="text-[11px] text-gray-500">
                      {t.paymentDate}
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      Rp {t.amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mt-4 text-sm text-gray-600">
            <p className="text-center sm:text-left text-xs sm:text-sm">
              Menampilkan {(currentPage - 1) * rowsPerPage + 1}–
              {Math.min(currentPage * rowsPerPage, filteredData.length)} dari{" "}
              {filteredData.length} data
            </p>

            <div className="flex items-center justify-center gap-4 sm:mx-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                {"<"}
              </Button>
              <span>{currentPage}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                {">"}
              </Button>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-gray-500 text-xs sm:text-sm">
                Tampilkan per halaman
              </span>
              <Select
                value={rowsPerPage.toString()}
                onValueChange={(val) => {
                  setRowsPerPage(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
