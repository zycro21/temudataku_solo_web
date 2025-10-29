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
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";

interface ApiPayment {
  id: string;
  type: "booking" | "practice";
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

  // Fetch data transaksi user
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/my/payments`,
          {
            withCredentials: true, // 🔹 penting untuk cookie-based auth
            params: { page: 1, limit: 100 },
          }
        );

        const data: ApiPayment[] = res.data.data.map((p: any) => ({
          id: p.id,
          type: p.type,
          title: p.title || "-",
          amount: Number(p.amount),
          status: p.status || "-",
          paymentMethod: p.paymentMethod || "-",

          // 🔹 Gunakan paymentDate jika ada, fallback ke createdAt
          paymentDate: p.paymentDate
            ? new Date(p.paymentDate).toLocaleDateString("id-ID")
            : new Date(p.createdAt).toLocaleDateString("id-ID"),

          // 🔹 Gunakan transactionId jika ada, fallback ke id
          transactionId: p.transactionId || p.id,

          createdAt: p.createdAt
            ? new Date(p.createdAt).toLocaleDateString("id-ID")
            : "-",
        }));

        setTransactions(data);
      } catch (err) {
        console.error("Gagal mengambil data pembayaran:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // 🔹 Sorting
  const sortedData = [...transactions].sort((a, b) => {
    if (!sortConfig || sortConfig.direction === "default") return 0;
    const { key, direction } = sortConfig;

    const getValue = (item: ApiPayment) =>
      key === "price" ? item.amount : item[key];

    if (getValue(a) < getValue(b)) return direction === "asc" ? -1 : 1;
    if (getValue(a) > getValue(b)) return direction === "asc" ? 1 : -1;
    return 0;
  });

  // 🔹 Filtering
  const filteredData = sortedData.filter(
    (t) =>
      (t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.status.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "all" ? true : t.status === statusFilter)
  );

  // 🔹 Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // 🔹 Sort toggle
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

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
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
        <p className="text-center text-gray-500 py-6">
          Belum ada transaksi pembayaran.
        </p>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-300">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => toggleSort("id")}
                    className={`cursor-pointer font-semibold py-4 px-3 ${
                      sortConfig?.key === "id"
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    No Transaksi {getSortIcon("id")}
                  </TableHead>

                  <TableHead
                    onClick={() => toggleSort("createdAt")}
                    className={`cursor-pointer font-semibold py-4 ${
                      sortConfig?.key === "createdAt"
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    Tanggal Daftar {getSortIcon("createdAt")}
                  </TableHead>

                  <TableHead
                    onClick={() => toggleSort("title")}
                    className={`cursor-pointer font-semibold py-4 ${
                      sortConfig?.key === "title"
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    Program {getSortIcon("title")}
                  </TableHead>

                  <TableHead
                    onClick={() => toggleSort("price")}
                    className={`cursor-pointer font-semibold py-4 ${
                      sortConfig?.key === "price"
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    Harga {getSortIcon("price")}
                  </TableHead>

                  <TableHead
                    onClick={toggleStatusFilter}
                    className="cursor-pointer text-gray-500 font-semibold py-4"
                  >
                    Status Pembayaran
                    {statusFilter !== "all" && (
                      <span className="ml-2 text-xs text-green-600 font-semibold">
                        - {statusFilter}
                      </span>
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedData.map((t, idx) => (
                  <TableRow key={idx} className="border-b border-gray-200">
                    <TableCell className="py-3 px-3">
                      {t.transactionId}
                    </TableCell>
                    <TableCell className="py-3">{t.paymentDate}</TableCell>
                    <TableCell className="py-3">{t.title}</TableCell>
                    <TableCell className="py-3">
                      Rp {t.amount.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="py-3">
                      <span
                        className={`px-2 py-1 rounded-md text-sm font-medium ${
                          t.status === "confirmed"
                            ? "bg-green-100 text-green-600"
                            : t.status === "pending"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {t.status || "-"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <p>
              Menampilkan {(currentPage - 1) * rowsPerPage + 1}–
              {Math.min(currentPage * rowsPerPage, filteredData.length)} dari{" "}
              {filteredData.length} data
            </p>

            <div className="flex items-center gap-4 mx-auto">
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

            <div className="flex items-center gap-2">
              <span className="text-gray-500">Tampilkan per halaman</span>
              <Select
                value={rowsPerPage.toString()}
                onValueChange={(val) => {
                  setRowsPerPage(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="10" />
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
